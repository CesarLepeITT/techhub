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
  "You are the TechHub assistant. Use the provided product context to recommend tech products. Always include the product price. Keep responses concise."

const QUERY_REWRITE_SYSTEM_PROMPT =
  "Eres un corrector de consultas de búsqueda para una tienda de tecnología. Corrige ortografía y redacción sin cambiar la intención, conserva términos técnicos, marcas, cantidades y unidades. Responde solo con la consulta corregida, sin explicaciones ni comillas. La corrección de ortografía es la prioridad; asegúrate de corregir palabras mal escritas. Asegurate de poner tildes."

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
  logStage("supabase_request_start", {
    path,
    method: init.method ?? "GET",
    body: typeof init.body === "string" ? init.body : undefined,
  })
  return fetch(url, { ...init, headers })
}

type GroqChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

async function requestGroqChat(params: {
  stagePrefix: string
  messages: GroqChatMessage[]
  temperature: number
}) {
  logStage(`${params.stagePrefix}_request_start`, {
    model: env.groqModel,
    temperature: params.temperature,
    messages: params.messages,
  })

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: params.temperature,
      messages: params.messages,
    }),
  })

  logStage(`${params.stagePrefix}_response`, { status: res.status, ok: res.ok })
  return res
}

function cleanRewrittenQuery(input: string): string {
  return sanitizeSearchQuery(input.replace(/^(["'`]+)|(["'`]+)$/g, ""))
}

async function rewriteSearchQuery(normalizedQuery: string): Promise<string> {
  logStage("query_rewrite_start", {
    normalizedQueryLength: normalizedQuery.length,
    normalizedQuery,
  })

  try {
    const res = await requestGroqChat({
      stagePrefix: "query_rewrite_groq",
      temperature: 0.2,
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: QUERY_REWRITE_SYSTEM_PROMPT },
        { role: "user", content: normalizedQuery },
      ],
    })

    if (!res.ok) {
      const responseText = await res.text()
      logStage("query_rewrite_failed", { status: res.status, error: responseText.slice(0, 200) })
      return normalizedQuery
    }

    const aiJson = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const rawOutput = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
    const rewrittenQuery = cleanRewrittenQuery(rawOutput)
    logStage("query_rewrite_raw_output", { aiOutput: rawOutput })

    if (!rewrittenQuery) {
      logStage("query_rewrite_empty_output", { fallbackQuery: normalizedQuery })
      return normalizedQuery
    }

    logStage("query_rewrite_success", {
      normalizedQuery,
      rewrittenQuery,
      changed: rewrittenQuery !== normalizedQuery,
    })
    return rewrittenQuery
  } catch (error) {
    logStage("query_rewrite_exception", { message: error instanceof Error ? error.message : "unknown" })
    return normalizedQuery
  }
}

async function retrieveProducts(query: string): Promise<Product[]> {
  const cleanQuery = query
  const select = "id,name,short_description,retail_price,stock,main_image_url"
  logStage("retrieve_start", {
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

function sanitizeUserFacingAiText(input: string): string {
  return input
    .replace(/\(\s*id\s*:\s*[a-f0-9\-]{36}\s*\)/gi, "")
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
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
    const normalizedQuery = sanitizeSearchQuery(rawQuery)
    logStage("query_normalized", {
      rawQueryLength: rawQuery.length,
      normalizedQueryLength: normalizedQuery.length,
      normalizedQuery,
    })

    if (!normalizedQuery) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })

    const searchQuery = await rewriteSearchQuery(normalizedQuery)
    const detectedIntent = detectIntent(searchQuery)
    logStage("intent_detected", { userId, detectedIntent, queryUsedForIntent: searchQuery })

    let products: Product[] = []
    try {
      products = await retrieveProducts(searchQuery)
      logStage("retrieve_done", { productCount: products.length, searchQuery })
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
      const aiRes = await requestGroqChat({
        stagePrefix: "recommendation_groq",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `User query original: ${rawQuery}
User query corregida para búsqueda: ${searchQuery}

Product context:
${context}

Devuelve una recomendación breve en español y usa explícitamente IDs de productos del contexto para los recomendados.
Si recomiendas varios, incluye cada ID exacto en el texto.`,
          },
        ],
      })

      if (!aiRes.ok) {
        const responseText = await aiRes.text()
        logStage("recommendation_groq_failed", { status: aiRes.status, error: responseText.slice(0, 200) })
        explanation = `Encontré ${products.length} producto(s) relevante(s). ¿Quieres más detalles?`
      } else {
        const aiJson = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
        explanation = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
        logStage("recommendation_groq_raw_output", { aiOutput: explanation })
        if (!explanation) explanation = `Recomiendo estos ${products.length} producto(s) para tu proyecto.`
        selectedProductIds = extractRecommendedIdsFromText(explanation, products)

        explanation = sanitizeUserFacingAiText(explanation)
        logStage("recommendation_groq_success", { explanationLength: explanation.length, explanationPreview: previewText(explanation) })
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

    const recommendedProducts = productsToReturn.map((p) => ({
      id: p.id,
      name: p.name,
      retail_price: p.retail_price,
      stock: p.stock,
      main_image_url: p.main_image_url,
    }))
    logStage("response_products_built", { recommendedCount: recommendedProducts.length })

    logStage("assistant_query_terminal_log", {
      userId,
      rawQuery,
      normalizedQuery,
      searchQuery,
      detectedIntent,
      explanation,
      recommendedProducts,
    })

    logStage("request_success", { intent: detectedIntent, productCount: recommendedProducts.length })
    return NextResponse.json({ intent: detectedIntent, response: explanation, products: recommendedProducts })
  } catch (error) {
    logStage("unhandled_exception", { message: error instanceof Error ? error.message : "unknown" })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
