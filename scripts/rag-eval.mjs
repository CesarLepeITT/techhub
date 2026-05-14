const BASE_URL = process.env.RAG_EVAL_BASE_URL ?? "http://localhost:3000"
const USER_ID = process.env.RAG_EVAL_USER_ID ?? "rag-eval"
const MAX_LATENCY_MS = Number(process.env.RAG_EVAL_MAX_LATENCY_MS ?? 1200)

const QUERY_CASES = [
  { id: "Q01", query: "Busco un kit de Arduino para principiantes", expectedIntent: "component_search", relevanceKeywords: ["arduino", "kit", "starter"] },
  { id: "Q02", query: "Necesito sensores para automatizar riego", expectedIntent: "component_search", relevanceKeywords: ["sensor", "humedad", "riego"] },
  { id: "Q03", query: "Quiero una cámara para visión en Raspberry Pi", expectedIntent: "component_search", relevanceKeywords: ["raspberry", "cámara", "camera"] },
  { id: "Q04", query: "Dame opciones baratas de soldador", expectedIntent: "budget", relevanceKeywords: ["soldador", "solder", "estación"] },
  { id: "Q05", query: "Qué módulo WiFi recomiendas para IoT", expectedIntent: "component_search", relevanceKeywords: ["wifi", "iot", "esp"] },
  { id: "Q06", query: "Busco una fuente de poder de 12V", expectedIntent: "general_shopping", relevanceKeywords: ["fuente", "12v", "power"] },
  { id: "Q07", query: "Necesito motores y driver para robot", expectedIntent: "component_search", relevanceKeywords: ["motor", "driver", "robot"] },
  { id: "Q08", query: "Recomiéndame una impresora 3D de entrada", expectedIntent: "general_shopping", relevanceKeywords: ["impresora", "3d", "filamento"] },
  { id: "Q09", query: "Kit para estación meteorológica escolar", expectedIntent: "project_build", relevanceKeywords: ["meteorológica", "sensor", "kit"] },
  { id: "Q10", query: "Componentes para seguimiento de línea", expectedIntent: "component_search", relevanceKeywords: ["línea", "sensor", "robot"] },
  { id: "Q11", query: "Tengo presupuesto de 500 pesos para electrónica básica", expectedIntent: "budget", relevanceKeywords: ["electrónica", "básica", "kit"] },
  { id: "Q12", query: "Necesito relés para automatización del hogar", expectedIntent: "component_search", relevanceKeywords: ["relé", "automatización", "hogar"] },
  { id: "Q13", query: "Quiero componentes para domótica con Zigbee", expectedIntent: "component_search", relevanceKeywords: ["zigbee", "domótica", "iot"] },
  { id: "Q14", query: "Dame sensores de temperatura y humedad", expectedIntent: "component_search", relevanceKeywords: ["temperatura", "humedad", "sensor"] },
  { id: "Q15", query: "Busco multímetro digital confiable", expectedIntent: "general_shopping", relevanceKeywords: ["multímetro", "digital", "medición"] },
  { id: "Q16", query: "Qué recomiendas para proyecto de robot móvil", expectedIntent: "project_build", relevanceKeywords: ["robot", "móvil", "motor"] },
  { id: "Q17", query: "Necesito protoboard y jumpers", expectedIntent: "general_shopping", relevanceKeywords: ["protoboard", "jumper", "cable"] },
  { id: "Q18", query: "Opciones económicas de ESP32", expectedIntent: "budget", relevanceKeywords: ["esp32", "wifi", "bluetooth"] },
  { id: "Q19", query: "Busco cautín para reparación de placas", expectedIntent: "general_shopping", relevanceKeywords: ["cautín", "sold", "placa"] },
  { id: "Q20", query: "Kit completo para aprender IoT desde cero", expectedIntent: "project_build", relevanceKeywords: ["iot", "kit", "aprender"] },
]

const hasPriceInText = (t) => /\$\s?\d|mxn|precio/i.test(t)
const hasUrgency = (t) => /últim|pocas|agota|stock bajo|quedan/i.test(t)

async function runCase(testCase) {
  const started = performance.now()
  const res = await fetch(`${BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: testCase.query, userId: USER_ID }) })
  const latencyMs = Math.round(performance.now() - started)
  const payload = await res.json()
  if (!res.ok) return { testCase, latencyMs, ok: false }
  const productNames = payload.products.map((p) => String(p.name).toLowerCase())
  const relevanceOk = payload.products.length === 0 ? true : testCase.relevanceKeywords.some((kw) => productNames.some((n) => n.includes(kw.toLowerCase())))
  const priceFieldOk = payload.products.every((p) => typeof p.retail_price === "number")
  const priceInTextOk = payload.products.length === 0 ? true : hasPriceInText(payload.response)
  const lowStockExists = payload.products.some((p) => p.stock < 5)
  const urgencyOk = !lowStockExists || hasUrgency(payload.response)
  const latencyOk = latencyMs <= MAX_LATENCY_MS
  const intentOk = testCase.expectedIntent ? payload.intent === testCase.expectedIntent : true
  const hallucinationRisk = payload.products.length > 0 && !priceInTextOk
  return { testCase, latencyMs, ok: relevanceOk && priceFieldOk && priceInTextOk && urgencyOk && latencyOk && intentOk && !hallucinationRisk }
}

const results = []
for (const c of QUERY_CASES) results.push(await runCase(c))
for (const r of results) console.log(`${r.ok ? "✅" : "❌"} ${r.testCase.id} (${r.latencyMs}ms) ${r.testCase.query}`)
const passed = results.filter((r) => r.ok).length
console.log(`Summary: ${passed}/${results.length} passed`)
if (passed !== results.length) process.exit(1)
