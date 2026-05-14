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
  "You are the TechHub assistant. Use the provided product context to recommend tech products. Always include the product price. If stock is below 5 units, mention urgency. Keep responses concise."

const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
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
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")
  if (!env.groqApiKey) missing.push("GROQ_API_KEY")
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
  const select = "id,name,short_description,retail_price,stock,main_image_url"

  const tokens = cleanQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .slice(0, 2)

  if (tokens.length === 0) {
    logStage("retrieve_no_tokens", { query: cleanQuery })
    return []
  }

  const filters = tokens.map((token) => {
    const encoded = encodeURIComponent(`%${token}%`)
    return `name.ilike.${encoded}`
  })

  const orFilters = filters.join(",")
  const path = `products?select=${select}&or=(${orFilters})&limit=5&is_active=eq.true`

  try {
    const res = await supabaseRequest(path)
    if (!res.ok) {
      const errorBody = await res.text()
      logStage("retrieve_failed", { status: res.status, error: errorBody.slice(0, 200) })
      return []
    }
    const rows = (await res.json()) as Product[]
    logStage("retrieve_ok", { count: rows.length, query: cleanQuery })
    return rows.slice(0, 5)
  } catch (error) {
    logStage("retrieve_exception", { message: error instanceof Error ? error.message : "unknown" })
    return []
  }
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
    } catch (error) {
      logStage("retrieve_exception", { message: error instanceof Error ? error.message : "unknown" })
      return NextResponse.json({ error: "No fue posible consultar productos" }, { status: 502 })
    }

    const context = buildContext(products)
    let explanation = ""

    if (products.length === 0) {
      explanation =
        "No encontré productos exactos. ¿Cuál es tu presupuesto, tipo de proyecto o categoría preferida?"
    } else {
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.groqModel,
          temperature: 0.3,
          max_tokens: 250,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `User query: ${rawQuery}\n\nProduct context:\n${context}\n\nRecommend products using only the product IDs and info provided. Be concise.`,
            },
          ],
        }),
      })

      if (!aiRes.ok) {
        const responseText = await aiRes.text()
        logStage("groq_failed", { status: aiRes.status, error: responseText.slice(0, 200) })
        explanation = `Encontré ${products.length} producto(s) relevante(s). ¿Quieres más detalles?`
      } else {
        const aiJson = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
        explanation = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
        if (!explanation) explanation = `Recomiendo estos ${products.length} producto(s) para tu proyecto.`
      }
    }

    const recommendedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      retail_price: p.retail_price,
      stock: p.stock,
      main_image_url: p.main_image_url,
    }))

    try {
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
    } catch (logError) {
      logStage("logging_failed", { message: logError instanceof Error ? logError.message : "unknown" })
    }

    return NextResponse.json({ intent: detectedIntent, response: explanation, products: recommendedProducts })
  } catch (error) {
    logStage("unhandled_exception", { message: error instanceof Error ? error.message : "unknown" })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
