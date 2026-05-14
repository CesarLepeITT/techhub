# Flujo RAG de `api/chat` (paso a paso)

1. **Entrada y validación**
   - Recibe `message` y `userId`.
   - Valida variables de entorno críticas (`Supabase`, `Groq`).
   - Si `message` está vacío, corta con `400`.

2. **Sanitización de consulta**
   - `sanitizeSearchQuery()` normaliza (`NFKC`), limpia caracteres de control/delimitadores y limita longitud.
   - Objetivo: nunca usar texto libre crudo en filtros SQL/PostgREST.

3. **Retrieval (R de RAG)**
   - **Primario (FTS):** llama RPC `search_products_web` (Postgres) con `websearch_to_tsquery('spanish', ...)` sobre `search_vector` (`to_tsvector`).
   - **Fallback:** si FTS falla o devuelve vacío, usa `ilike` tokenizado seguro (`tokenizeForIlikeFallback`).

4. **Construcción de contexto**
   - Arma un bloque de contexto con productos recuperados (`ID`, nombre, descripción, precio, stock).

5. **Generación (G de RAG)**
   - Envía a Groq: query del usuario + contexto de productos.
   - Prompt pide recomendar en español e incluir IDs explícitos.

6. **Selección de productos por IA**
   - `extractRecommendedIdsFromText()` extrae UUIDs del texto de Groq.
   - Si hay IDs válidos, responde solo esos productos; si no, devuelve el set recuperado.

7. **Respuesta y persistencia**
   - Devuelve `intent`, `response` y `products`.
   - Guarda trazabilidad en `assistant_queries` (`query`, `detected_intent`, explicación y productos recomendados).

8. **Observabilidad**
   - `logStage(...)` registra cada etapa clave (request, retrieval FTS/fallback, Groq, selección, guardado).
