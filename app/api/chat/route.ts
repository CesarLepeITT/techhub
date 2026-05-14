import { NextResponse } from "next/server"

type Product = {
  id: string
  name: string
  short_description: string | null
  retail_price: number
  stock: number
  image_url: string | null
  main_image_url: string | null
}

const SYSTEM_PROMPT =
  "You are the TechHub assistant. Use the provided product context to recommend tech products. Always include the product price. If stock is below 5 units, mention urgency. Keep responses concise."


const MAX_SEARCH_QUERY_LENGTH = 400

function sanitizeSearchQuery(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[;\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH)
}

function tokenizeForIlikeFallback(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .slice(0, 3)
}

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

function extractRecommendedIdsFromText(text: string, products: Product[]): string[] {
  const availableIds = new Set(products.map((p) => p.id))
  const found = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi) ?? []
  return [...new Set(found.map((id) => id.toLowerCase()).filter((id) => availableIds.has(id)))]
}

function logStage(stage: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "api/chat", stage, ...details }))
}

function previewText(input: string, max = 120): string {
  return input.length > max ? `${input.slice(0, max)}…` : input
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
  logStage("supabase_request_start", { path, method: init.method ?? "GET" })
  return fetch(url, { ...init, headers })
}

async function retrieveProducts(query: string): Promise<Product[]> {
  const cleanQuery = sanitizeSearchQuery(query)
  const select = "id,name,short_description,retail_price,stock,image_url,main_image_url"
  logStage("retrieve_start", {
    rawQueryLength: query.length,
    cleanQueryLength: cleanQuery.length,
    cleanQueryPreview: previewText(cleanQuery),
  })

  if (!cleanQuery) {
    logStage("retrieve_no_tokens", { query: cleanQuery })
    return []
  }

  try {
    const ftsRes = await supabaseRequest("rpc/search_products_web", {
      method: "POST",
      body: JSON.stringify({ raw_query: cleanQuery, max_results: 5 }),
    })

    if (ftsRes.ok) {
      const rows = (await ftsRes.json()) as Product[]
      logStage("retrieve_ok_fts", { count: rows.length, queryLength: cleanQuery.length })
      if (rows.length > 0) return rows
    } else {
      const errorBody = await ftsRes.text()
      logStage("retrieve_fts_failed", { status: ftsRes.status, error: errorBody.slice(0, 200) })
    }
  } catch (error) {
    logStage("retrieve_fts_exception", { message: error instanceof Error ? error.message : "unknown" })
  }

  const tokens = tokenizeForIlikeFallback(cleanQuery)
  if (tokens.length === 0) return []

  const orFilters = tokens.map((token) => `name.ilike.%${token}%`).join(",")
  const path = `products?select=${select}&or=(${encodeURIComponent(orFilters)})&limit=5&is_active=eq.true`

  try {
    const res = await supabaseRequest(path)
    logStage("retrieve_fallback_response", { status: res.status, ok: res.ok })
    if (!res.ok) {
      const errorBody = await res.text()
      logStage("retrieve_fallback_failed", { status: res.status, error: errorBody.slice(0, 200) })
      return []
    }

    const rows = (await res.json()) as Product[]
    logStage("retrieve_ok_fallback", { count: rows.length, tokens: tokens.length })
    return rows.slice(0, 5)
  } catch (error) {
    logStage("retrieve_fallback_exception", { message: error instanceof Error ? error.message : "unknown" })
    return []
  }
}

export async function POST(req: Request) {
  try {
    logStage("request_start", {})
    const missingEnv = validateRequiredEnv()
    if (missingEnv.length > 0) {
      logStage("missing_env", { missingEnv })
      return NextResponse.json({ error: `Configuración incompleta: ${missingEnv.join(", ")}` }, { status: 500 })
    }
    logStage("env_ok", { supabaseUrlConfigured: Boolean(env.supabaseUrl), groqModel: env.groqModel })

    const body = (await req.json()) as { message?: string; userId?: string }
    const rawQuery = body.message?.trim() ?? ""
    logStage("request_body_parsed", {
      hasMessage: Boolean(body.message),
      rawQueryLength: rawQuery.length,
      rawQueryPreview: previewText(rawQuery),
      hasUserId: Boolean(body.userId),
    })

    if (!rawQuery) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })

    const userId = body.userId ?? "anonymous"
    const detectedIntent = detectIntent(rawQuery)
    logStage("intent_detected", { userId, detectedIntent })

    let products: Product[] = []
    try {
      products = await retrieveProducts(rawQuery)
      logStage("retrieve_done", { productCount: products.length })
    } catch (error) {
      logStage("retrieve_exception", { message: error instanceof Error ? error.message : "unknown" })
      return NextResponse.json({ error: "No fue posible consultar productos" }, { status: 502 })
    }

    const context = buildContext(products)
    logStage("context_built", { contextLength: context.length, productCount: products.length })
    let explanation = ""
    let selectedProductIds: string[] = []

    if (products.length === 0) {
      explanation =
        "No encontré productos exactos. ¿Cuál es tu presupuesto, tipo de proyecto o categoría preferida?"
      logStage("response_without_products", { explanationPreview: previewText(explanation) })
    } else {
      logStage("groq_request_start", { productCount: products.length, contextLength: context.length })
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
              content: `User query: ${rawQuery}

Product context:
${context}

Devuelve una recomendación breve en español y usa explícitamente IDs de productos del contexto para los recomendados.
Si recomiendas varios, incluye cada ID exacto en el texto.`,
            },
          ],
        }),
      })
      logStage("groq_response", { status: aiRes.status, ok: aiRes.ok })

      if (!aiRes.ok) {
        const responseText = await aiRes.text()
        logStage("groq_failed", { status: aiRes.status, error: responseText.slice(0, 200) })
        explanation = `Encontré ${products.length} producto(s) relevante(s). ¿Quieres más detalles?`
      } else {
        const aiJson = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
        explanation = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
        if (!explanation) explanation = `Recomiendo estos ${products.length} producto(s) para tu proyecto.`
        selectedProductIds = extractRecommendedIdsFromText(explanation, products)

        // Remove UUID patterns from the explanation
        explanation = explanation.replace(/\s*\([a-f0-9\-]{36}\)\s*/gi, "")
        logStage("groq_success", { explanationLength: explanation.length, explanationPreview: previewText(explanation) })
      }
    }

    const productsToReturn = selectedProductIds.length > 0
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products
    logStage("selected_products", {
      selectedByAi: selectedProductIds.length > 0,
      selectedProductIds,
      returnedCount: productsToReturn.length,
    })

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"
    const recommendedProducts = productsToReturn.map((p) => ({
      id: p.id,
      name: p.name,
      retail_price: p.retail_price,
      stock: p.stock,
      image_url: p.image_url || p.main_image_url || FALLBACK_IMAGE,
    }))
    logStage("response_products_built", { recommendedCount: recommendedProducts.length })

    try {
      const logRes = await supabaseRequest("assistant_queries", {
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
      logStage("assistant_query_logged", { status: logRes.status, ok: logRes.ok })
    } catch (logError) {
      logStage("logging_failed", { message: logError instanceof Error ? logError.message : "unknown" })
    }

    logStage("request_success", { intent: detectedIntent, productCount: recommendedProducts.length })
    return NextResponse.json({ intent: detectedIntent, response: explanation, products: recommendedProducts })
  } catch (error) {
    logStage("unhandled_exception", { message: error instanceof Error ? error.message : "unknown" })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
