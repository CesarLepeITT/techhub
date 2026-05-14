import { NextResponse } from "next/server"

type Product = {
  id: string
  name: string
  short_description: string | null
  retail_price: number
  stock: number
  main_image_url: string | null
}

type QueryRefinement = {
  intent: string
  main_topic: string
  keywords: string[]
  synonyms: string[]
  related_technologies: string[]
  error_terms: string[]
  search_queries: string[]
}

const SYSTEM_PROMPT =
  "You are the TechHub. Answer only with products present in PRODUCT_CONTEXT. Never invent products, IDs or prices. If context is weak, ask 1 concise clarification question. Always include price. If stock is below 5 units, mention urgency."

const QUERY_REFINER_SYSTEM_PROMPT = `
You are a search query optimizer for a technical knowledge base.

Your task:
Transform vague user questions into optimized technical search terms.

Rules:
- Return ONLY valid JSON
- Do not explain anything
- Extract:
  - main topic
  - technical keywords
  - related technologies
  - synonyms
  - error terms if present
  - intent

Search optimization goals:
- maximize database retrieval quality
- include technical aliases
- include framework/library names when implied
- expand abbreviations
- preserve original meaning

JSON format:

{
  "intent": "string",
  "main_topic": "string",
  "keywords": [""],
  "synonyms": [""],
  "related_technologies": [""],
  "error_terms": [""],
  "search_queries": [""]
}
`;

const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
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

const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "para", "por", "con", "sin", "del",
  "al", "que", "me", "mi", "mis", "tu", "tus", "su", "sus", "en", "a", "es", "son", "como", "qué", "quiero",
  "necesito", "estoy", "desarrollando", "proyecto", "the", "and", "or", "for", "with", "without", "to", "of",
  "in", "on", "is", "are", "i", "you", "my", "your", "a", "an",
])

function extractSearchTerms(query: string) {
  const normalized = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")

  const tokens = normalized
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))

  const keywordBoosts: Record<string, string[]> = {
    iot: ["iot", "sensor", "arduino", "raspberry", "microcontrolador", "microcontroller", "esp32"],
    component_search: ["modulo", "sensor", "placa", "arduino", "raspberry", "esp32"],
    budget: ["economico", "barato", "budget", "precio"],
  }

  const intent = detectIntent(normalized)
  const boosted = keywordBoosts[intent] ?? []
  const mergedTokens = Array.from(new Set([...tokens, ...boosted])).slice(0, 10)
  const phrase = mergedTokens.slice(0, 5).join(" ")

  return { normalized, tokens: mergedTokens, phrase }
}

function safeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean)
}

async function refineQueryWithGroq(query: string): Promise<QueryRefinement> {
  const fallback: QueryRefinement = {
    intent: detectIntent(query),
    main_topic: query,
    keywords: [],
    synonyms: [],
    related_technologies: [],
    error_terms: [],
    search_queries: [query],
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.groqApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: QUERY_REFINER_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
    }),
  })

  if (!res.ok) return fallback
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = json.choices?.[0]?.message?.content ?? ""
  if (!content) return fallback

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>
    return {
      intent: typeof parsed.intent === "string" ? parsed.intent : fallback.intent,
      main_topic: typeof parsed.main_topic === "string" ? parsed.main_topic : fallback.main_topic,
      keywords: safeArray(parsed.keywords).slice(0, 8),
      synonyms: safeArray(parsed.synonyms).slice(0, 8),
      related_technologies: safeArray(parsed.related_technologies).slice(0, 8),
      error_terms: safeArray(parsed.error_terms).slice(0, 6),
      search_queries: safeArray(parsed.search_queries).slice(0, 6),
    }
  } catch {
    return fallback
  }
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

function sanitizeSearchQuery(input: string): { normalized: string; tsQuery: string; isLong: boolean } {
  const MAX_LEN = 280
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LEN)

  const tokens = normalized
    .toLowerCase()
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    .slice(0, 20)

  return {
    normalized,
    tsQuery: tokens.join(" "),
    isLong: normalized.length > 80 || tokens.length >= 8,
  }
}

async function retrieveProducts(query: string): Promise<Product[]> {
  const MAX_RESULTS = 5
  const cleanQuery = query.trim()

  try {
    const sanitized = sanitizeSearchQuery(cleanQuery)
    const select = "id,name,short_description,retail_price,stock,main_image_url"
    if (!sanitized.tsQuery) return []

    const ftsRes = await supabaseRequest("rpc/search_products_fts", {
      method: "POST",
      body: JSON.stringify({ q: sanitized.tsQuery, max_results: MAX_RESULTS }),
    })

    if (ftsRes.ok) {
      const rows = (await ftsRes.json()) as Product[]
      if (rows.length > 0) return rows.slice(0, MAX_RESULTS)
      logStage("retrieve_fts_empty", { query: cleanQuery, tsQuery: sanitized.tsQuery })
    } else {
      const ftsError = await ftsRes.text()
      logStage("retrieve_fts_failed", { status: ftsRes.status, body: ftsError.slice(0, 250) })
    }

    if (sanitized.isLong) return []
    const { normalized, tokens, phrase } = extractSearchTerms(sanitized.normalized)
    if (tokens.length === 0) return []

    const phraseCandidates = Array.from(new Set([cleanQuery.toLowerCase(), normalized, phrase].filter((p) => p.length >= 3)))
    const phraseFilters = phraseCandidates.flatMap((value) => {
      const like = encodeURIComponent(`%${value}%`)
      return [`name.ilike.${like}`, `short_description.ilike.${like}`, `tags.ilike.${like}`]
    })
    const tokenFilters = tokens.flatMap((token) => {
      const like = encodeURIComponent(`%${token}%`)
      return [`name.ilike.${like}`, `short_description.ilike.${like}`, `tags.ilike.${like}`]
    })

    const ilikePath = `products?select=${select}&or=(${[...phraseFilters, ...tokenFilters].join(",")})&limit=${MAX_RESULTS}`
    const ilikeRes = await supabaseRequest(ilikePath)
    if (!ilikeRes.ok) return []

    const rows = (await ilikeRes.json()) as Product[]
    return rows.slice(0, MAX_RESULTS)
  } catch (error) {
    logStage("retrieve_products_exception", { query, message: error instanceof Error ? error.message : "unknown" })
    return []
  }
}

function rerankProducts(products: Product[], terms: string[]) {
  const normalizedTerms = terms.map((t) => t.toLowerCase())
  return products
    .map((p) => {
      const name = p.name.toLowerCase()
      const desc = (p.short_description ?? "").toLowerCase()
      const hitCount = normalizedTerms.reduce((acc, term) => {
        if (name.includes(term)) return acc + 3
        if (desc.includes(term)) return acc + 1
        return acc
      }, 0)
      const stockScore = p.stock > 0 ? 0.2 : -2
      return { product: p, score: hitCount + stockScore }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product)
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
    const refined = await refineQueryWithGroq(rawQuery)
    const detectedIntent = refined.intent || detectIntent(rawQuery)
    const retrievalQueries = Array.from(new Set([rawQuery, ...refined.search_queries, refined.main_topic].filter(Boolean)))

    let products: Product[] = []
    try {
      const candidateResults = await Promise.allSettled(retrievalQueries.map((q) => retrieveProducts(q)))
      const candidates = candidateResults.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
      const merged = Array.from(new Map(candidates.flat().map((p) => [p.id, p])).values())
      const rankTerms = [
        ...refined.keywords,
        ...refined.synonyms,
        ...refined.related_technologies,
        ...extractSearchTerms(rawQuery).tokens,
      ]
      products = rerankProducts(merged, rankTerms).slice(0, 5)
      logStage("retrieve_ok", { count: products.length, intent: detectedIntent, queryVariants: retrievalQueries.length })
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
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.groqModel,
          temperature: 0.2,
          max_tokens: 220,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `USER_QUERY:\n${rawQuery}\n\nREFINED_QUERY_JSON:\n${JSON.stringify(refined)}\n\nPRODUCT_CONTEXT_START\n${context}\nPRODUCT_CONTEXT_END\n\nRules:\n- Use only PRODUCT_CONTEXT\n- If no good options in context, ask one clarification\n- Mention price in every recommendation\n- Keep concise and practical`,
            },
          ],
        }),
      })

      if (!aiRes.ok) {
        const responseText = await aiRes.text()
        logStage("groq_failed", { status: aiRes.status, body: responseText.slice(0, 250) })
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
