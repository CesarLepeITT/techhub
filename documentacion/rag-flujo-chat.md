# Flujo RAG de `api/chat` (paso a paso)

1. **Entrada y validación**
   - Recibe `message`, `userId` y opcionalmente `imageDataUrl`.
   - Valida variables de entorno críticas (`Supabase`, `Groq`).
   - Si no hay texto ni imagen, corta con `400`.
   - Si hay imagen, valida que sea un `data:image/*;base64` PNG, JPG o WebP menor a 4 MB.

2. **Sanitización de consulta**
   - `sanitizeSearchQuery()` normaliza (`NFKC`), limpia caracteres de control/delimitadores y limita longitud.
   - Objetivo: nunca usar texto libre crudo en filtros SQL/PostgREST.

3. **Búsqueda por imagen (opcional)**
   - Si el usuario sube o toma una fotografía, `describeImageToText()` la envía al modelo vision de Groq para describir componentes, módulos, cables, conectores, etiquetas y usos probables.
   - `buildSearchContextFromImage()` envía esa descripción visual y el texto opcional del usuario al modelo de texto de Groq para producir una consulta contextual de búsqueda.
   - Si alguno de estos pasos falla, el flujo usa como fallback la consulta normalizada y/o la descripción visual disponible.

4. **Corrección de consulta con LLM**
   - `rewriteSearchQuery()` envía la consulta normalizada o el contexto generado desde imagen a Groq para corregir redacción y ortografía sin cambiar la intención.
   - Si Groq falla o devuelve vacío, se usa la consulta previa como fallback.
   - La consulta resultante es la que se usa para detectar intención y consultar la BD.

5. **Retrieval (R de RAG)**
   - **Primario (FTS):** llama RPC `search_products_web` (Postgres) con la consulta corregida y `websearch_to_tsquery('spanish', ...)` sobre `search_vector` (`to_tsvector`).
   - **Fallback:** si FTS falla o devuelve vacío, usa `ilike` tokenizado seguro (`tokenizeForIlikeFallback`) sobre la consulta corregida.

6. **Construcción de contexto**
   - Arma un bloque de contexto con productos recuperados (`ID`, nombre, descripción, precio, stock).

7. **Generación (G de RAG)**
   - Envía a Groq: query original, descripción de imagen si existe, consulta corregida y contexto de productos.
   - Prompt pide recomendar en español e incluir IDs explícitos.

8. **Selección de productos por IA**
   - `extractRecommendedIdsFromText()` extrae UUIDs del texto de Groq.
   - Si hay IDs válidos, responde solo esos productos; si no, devuelve el set recuperado.

9. **Respuesta sin persistencia de logs**
   - Devuelve `intent`, `response`, `products`, `imageDescription` opcional y `searchQuery`.
   - No guarda trazabilidad en `assistant_queries`; la trazabilidad del flujo se emite únicamente en la terminal.

10. **Observabilidad**
   - `logStage(...)` registra cada etapa clave en terminal (request, normalización, descripción de imagen, contexto de imagen, corrección Groq, retrieval FTS/fallback, generación Groq y selección).
   - Los payloads enviados a Supabase y a Groq se registran sin exponer secretos como API keys.
   - En logs de visión, la imagen base64 se resume con mime type, longitud y preview para evitar imprimir megabytes completos en la terminal.
