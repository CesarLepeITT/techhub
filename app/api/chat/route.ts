import { NextResponse } from "next/server"

type Product = {
  id: string
  name: string
  short_description: string | null
  retail_price: number
  stock: number
  main_image_url: string | null
}

const SYSTEM_PROMPT =
  "You are the TechHub. Use the provided product context to recommend tech products. Always include the product price. If stock is below 5 units, mention urgency."

const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  xaiApiKey: process.env.XAI_API_KEY ?? "",
  xaiModel: process.env.XAI_MODEL ?? "grok-3-mini",
}

function detectIntent(query: string): string {
  const lower = query.toLowerCase()
  if (/(kit|project|proyecto|armar|build)/.test(lower)) return "project_build"
  if (/(precio|barato|budget|presupuesto)/.test(lower)) return "budget"
  if (/(sensor|arduino|raspberry|iot|robot|automat)/.test(lower)) return "component_search"
  return "general_shopping"
}

function buildContext(products: Product[]): string {
  return products
    .map(
      (p) =>
        `ID:${p.id} | ${p.name} | ${p.short_description ?? "Sin descripción"} | Precio:$${p.retail_price} | Stock:${p.stock}`,
    )
    .join("\n")
}

function logStage(stage: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "api/chat", stage, ...details }))
}

function validateRequiredEnv() {
  const missing: string[] = []
  if (!env.supabaseUrl) missing.push("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)")
  if (!env.supabaseServiceRoleKey)
    missing.push("SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY fallback)")
  if (!env.xaiApiKey) missing.push("XAI_API_KEY")
  return missing
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const url = `${env.supabaseUrl}/rest/v1/${path}`
  const headers = {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
    ...init.headers,
  }
  return fetch(url, { ...init, headers })
}

async function retrieveProducts(query: string): Promise<Product[]> {
  const cleanQuery = query.trim()
  // Importante: PostgREST necesita que los términos con espacios o comas 
  // dentro de un .or() estén envueltos en " "
  const quotedQuery = `"${cleanQuery}"` 
  const encoded = encodeURIComponent(quotedQuery)
  const select = "id,name,short_description,retail_price,stock,main_image_url"

  // 1) Try full-text search
  // Usamos .wfts. para búsqueda de frases
  const ftsPath = `products?select=${select}&or=(name.wfts.${encoded},short_description.wfts.${encoded},tags.wfts.${encoded})&limit=5`
  const ftsRes = await supabaseRequest(ftsPath)

  if (ftsRes.ok) {
    const rows = (await ftsRes.json()) as Product[]
    return rows.slice(0, 5)
  }

  const ftsErrorBody = await ftsRes.text()
  logStage("retrieve_fts_failed", { status: ftsRes.status, body: ftsErrorBody.slice(0, 250) })

  // 2) Fallback: ILIKE
  // Para ILIKE, no usamos comillas, pero escapamos la query de forma más conservadora
  const simpleEncoded = encodeURIComponent(`%${cleanQuery.replace(/,/g, '')}%`)
  const ilikePath = `products?select=${select}&or=(name.ilike.${simpleEncoded},short_description.ilike.${simpleEncoded},tags.ilike.${simpleEncoded})&limit=5`
  const ilikeRes = await supabaseRequest(ilikePath)

  if (!ilikeRes.ok) {
    const ilikeErrorBody = await ilikeRes.text()
    logStage("retrieve_ilike_failed", { status: ilikeRes.status, body: ilikeErrorBody.slice(0, 250) })
    throw new Error(`Supabase retrieve failed (fts=${ftsRes.status}, ilike=${ilikeRes.status})`)
  }

  const rows = (await ilikeRes.json()) as Product[]
  return rows.slice(0, 5)
}


async function logEvent(userId: string, eventType: string, payload: Record<string, unknown>) {
  await supabaseRequest("user_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([{ user_id: userId, event_type: eventType, payload }]),
  })
}

export async function POST(req: Request) {
  try {
    const missingEnv = validateRequiredEnv()
    if (missingEnv.length > 0) {
      logStage("missing_env", { missingEnv })
      return NextResponse.json({ error: `Configuración incompleta: ${missingEnv.join(", ")}` }, { status: 500 })
    }

    const body = (await req.json()) as { message?: string; userId?: string }
    const rawQuery = body.message?.trim() ?? ""

    if (!rawQuery) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })

    const userId = body.userId ?? "anonymous"
    const detectedIntent = detectIntent(rawQuery)

    let products: Product[] = []
    try {
      products = await retrieveProducts(rawQuery)
      logStage("retrieve_ok", { count: products.length, intent: detectedIntent })
    } catch (error) {
      logStage("retrieve_exception", { message: error instanceof Error ? error.message : "unknown" })
      return NextResponse.json({ error: "No fue posible consultar productos" }, { status: 502 })
    }

    const context = buildContext(products)
    let explanation = ""

    if (products.length === 0) {
      explanation =
        "No encontré productos exactos todavía. ¿Cuál es tu presupuesto, uso principal, categoría preferida y tipo de proyecto?"
    } else {
      const aiRes = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.xaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.xaiModel,
          temperature: 0.2,
          max_tokens: 220,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `User query: ${rawQuery}\n\nProduct context:\n${context}\n\nRules: never invent products; only use product IDs from context. Keep it concise and sales-oriented.`,
            },
          ],
        }),
      })

      if (!aiRes.ok) {
        const responseText = await aiRes.text()
        logStage("xai_failed", { status: aiRes.status, body: responseText.slice(0, 250) })
        return NextResponse.json({ error: "No fue posible generar respuesta de IA" }, { status: 502 })
      }

      const aiJson = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
      explanation = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
      if (!explanation) explanation = "Encontré productos relevantes. ¿Quieres que te recomiende por presupuesto o por tipo de proyecto?"
    }

    const recommendedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      retail_price: p.retail_price,
      stock: p.stock,
      main_image_url: p.main_image_url,
    }))

    await supabaseRequest("assistant_queries", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          user_id: userId,
          query: rawQuery,
          detected_intent: detectedIntent,
          explanation,
          recommended_products_json: {
            product_ids: recommendedProducts.map((p) => p.id),
            products: recommendedProducts,
          },
        },
      ]),
    })

    await logEvent(userId, "assistant_query", {
      query: rawQuery,
      intent: detectedIntent,
      recommended_count: recommendedProducts.length,
    })

    return NextResponse.json({ intent: detectedIntent, response: explanation, products: recommendedProducts })
  } catch (error) {
    logStage("unhandled_exception", { message: error instanceof Error ? error.message : "unknown" })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
