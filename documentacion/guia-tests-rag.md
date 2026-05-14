# Guía práctica: tests del Asistente IA (RAG)

Esta guía explica **cómo ejecutar**, **cómo interpretar resultados** y **cómo ajustar tu RAG** para mejorar calidad/latencia en CircuitMarket TJ.

## 1) ¿Qué valida actualmente el test?

El comando `pnpm rag:eval` ejecuta `scripts/rag-eval.mjs` contra `POST /api/chat` y revisa, por consulta:

1. **Relevancia de recuperación**
   - Compara keywords esperadas contra los nombres de productos retornados.
2. **Precio en estructura**
   - Verifica que cada producto tenga `retail_price` numérico.
3. **Precio en respuesta del asistente**
   - Busca patrón de precio en texto (`$`, `precio`, `MXN`).
4. **Urgencia por bajo stock**
   - Si algún producto trae `stock < 5`, espera lenguaje de urgencia.
5. **Intención detectada**
   - Compara `intent` devuelto vs intención esperada del caso.
6. **Latencia**
   - Mide tiempo por query y valida umbral máximo.

> Con esto se detectan regresiones típicas: resultados irrelevantes, respuestas sin precio, reglas de stock ignoradas y degradación de tiempo de respuesta.

---

## 2) Prerrequisitos

- App corriendo localmente (por defecto en `http://localhost:3000`).
- Variables de entorno listas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, etc.).
- Datos en `products` (si no hay catálogo, no habrá señal útil en relevancia).

---

## 3) Cómo correr los tests

```bash
pnpm rag:eval
```

Variables opcionales para ejecución:

- `RAG_EVAL_BASE_URL` (default: `http://localhost:3000`)
- `RAG_EVAL_USER_ID` (default: `rag-eval`)
- `RAG_EVAL_MAX_LATENCY_MS` (default: `1200`)

Ejemplo con umbral más estricto:

```bash
RAG_EVAL_MAX_LATENCY_MS=900 pnpm rag:eval
```

Ejemplo contra entorno remoto:

```bash
RAG_EVAL_BASE_URL=https://tu-dominio.com pnpm rag:eval
```

---

## 4) ¿Qué output esperar?

Salida típica por caso:

- `✅ Q07 (532ms) Necesito motores y driver para robot`
- `❌ Q04 (1310ms) Dame opciones baratas de soldador`

Resumen final:

- `Summary: 18/20 passed`

Interpretación rápida:

- **20/20**: comportamiento alineado con reglas actuales.
- **<20/20**: revisar casos fallidos primero por categoría (latencia, relevancia, precios, urgencia, intent).

---

## 5) Métricas que estás evaluando

## 5.1 Relevancia de retrieval
- Señal: keyword match entre query esperada y `products[].name`.
- Lectura:
  - Alto match -> recuperación razonable.
  - Bajo match -> revisar FTS, sinónimos o datos del catálogo.

## 5.2 Fidelidad de precios
- Señal estructural: `retail_price` existe y es numérico.
- Señal semántica: el texto del asistente menciona precio.

## 5.3 Control de alucinación
- Heurística actual: si hay productos pero el texto no refleja reglas de precio, se considera riesgo.
- Recomendación: complementar con validación de IDs/nombres citados en texto vs productos retornados.

## 5.4 Regla de urgencia por stock
- Si `stock < 5`, la respuesta debe inducir urgencia comercial.

## 5.5 Latencia
- Tiempo total request/response por consulta.
- Umbral configurable para presupuesto de rendimiento (especialmente útil en Raspberry Pi).

---

## 6) Cómo variar/configurar tu RAG para impactar métricas

La ruta `app/api/chat/route.ts` es el punto principal. Cambios típicos y su efecto:

1. **Top-K retrieval (`limit`)**
   - Más alto: mayor recall, más tokens, más latencia.
   - Más bajo: menor costo/latencia, riesgo de perder opciones.

2. **Query FTS (campos y operadores)**
   - Ajustar `name`, `short_description`, `tags` mejora precisión temática.
   - Añadir normalización/sinónimos puede subir relevancia en términos coloquiales.

3. **Prompt y reglas**
   - Reforzar “siempre incluir precio” impacta precio en texto.
   - Reforzar “stock bajo => urgencia” impacta check de urgencia.

4. **`max_tokens` / temperatura**
   - Menos tokens: menor latencia/costo, respuesta más compacta.
   - Temperatura baja: comportamiento más determinista (mejor para test repetible).

5. **Compactación de contexto**
   - Contexto corto reduce latencia/tokens.
   - Si compactas demasiado, puede bajar calidad de recomendación.

---

## 7) Cómo usarlo en ciclo de desarrollo

Flujo recomendado:

1. Cambia retrieval/prompt en `app/api/chat/route.ts`.
2. Ejecuta `pnpm rag:eval`.
3. Compara `passed/total` y latencia promedio.
4. Si baja calidad:
   - revisa casos fallidos,
   - ajusta query/prompt,
   - re-ejecuta.

Meta práctica para Raspberry Pi:
- mantener latencia estable,
- minimizar tokens,
- sostener precisión comercial (precio + relevancia + urgencia).

---

## 8) Extensiones recomendadas (opcionales)

Si quieres más control sin complicar arquitectura:

- Exportar resultados JSON (`--out`) para historial.
- Separar suites: humo (5 queries) vs completa (20+).
- Medir `% de respuestas con precio` y `% de urgencia correcta` por corrida.
- Agregar casos “no match” para validar preguntas de clarificación (presupuesto, uso, categoría, tipo de proyecto).

---

## 9) Troubleshooting rápido

- `ECONNREFUSED`:
  - no está corriendo Next local en el puerto esperado.
- Muchos fallos de relevancia:
  - revisar catálogo y FTS en Supabase.
- Fallos de urgencia:
  - reforzar prompt o posprocesar regla cuando `stock < 5`.
- Latencia alta:
  - bajar `max_tokens`, reducir contexto, bajar top-K.

---

## 10) Referencias en el repo

- Script: `scripts/rag-eval.mjs`
- Resumen técnico: `documentacion/rag-evaluation.md`
- API evaluada: `app/api/chat/route.ts`
