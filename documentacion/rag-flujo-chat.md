# Flujo RAG de `api/chat` (paso a paso)

1. **Entrada y validación**
   - Recibe `message` y `userId`.
   - Valida variables de entorno críticas (`Supabase`, `Groq`).
   - Si `message` está vacío, corta con `400`.

2. **Sanitización y corrección de consulta**
   - `sanitizeSearchQuery()` normaliza (`NFKC`), limpia caracteres de control/delimitadores y limita longitud.
   - Después de la normalización, `rewriteSearchQuery()` envía la consulta sanitizada a Groq para corregir redacción y ortografía sin cambiar la intención.
   - Si Groq falla o devuelve vacío, se usa la consulta normalizada como fallback.
   - Objetivo: nunca usar texto libre crudo en filtros SQL/PostgREST y mejorar la calidad del retrieval antes de consultar la BD.

3. **Retrieval (R de RAG)**
   - **Primario (FTS):** llama RPC `search_products_web` (Postgres) con la consulta corregida y `websearch_to_tsquery('spanish', ...)` sobre `search_vector` (`to_tsvector`).
   - **Fallback:** si FTS falla o devuelve vacío, usa `ilike` tokenizado seguro (`tokenizeForIlikeFallback`) sobre la consulta corregida.

4. **Construcción de contexto**
   - Arma un bloque de contexto con productos recuperados (`ID`, nombre, descripción, precio, stock).

5. **Generación (G de RAG)**
   - Envía a Groq: query del usuario + contexto de productos.
   - Prompt pide recomendar en español e incluir IDs explícitos.

6. **Selección de productos por IA**
   - `extractRecommendedIdsFromText()` extrae UUIDs del texto de Groq.
   - Si hay IDs válidos, responde solo esos productos; si no, devuelve el set recuperado.

7. **Respuesta sin persistencia de logs**
   - Devuelve `intent`, `response` y `products`.
   - No guarda trazabilidad en `assistant_queries`; la trazabilidad del flujo se emite únicamente en la terminal.

8. **Observabilidad**
   - `logStage(...)` registra cada etapa clave en terminal (request, normalización, corrección Groq, retrieval FTS/fallback, generación Groq y selección).
   - Los payloads enviados a Supabase y a Groq se registran sin exponer secretos como API keys.
