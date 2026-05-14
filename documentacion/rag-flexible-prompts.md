# RAG flexible para prompts vagos (buscador conversacional)

Este documento describe cómo permitir consultas naturales como:

- `Estoy desarrollando un proyecto de IoT con microcontroladores, ¿qué me sugieres comprar?`

sin obligar al usuario a escribir keywords sueltas como:

- `telefofo, teclado`

## Objetivo

Mejorar **recall** en consultas vagas, manteniendo control para no devolver resultados forzados.

## Estrategia implementada

En `app/api/chat/route.ts`:

1. **Query pre-processing con Groq (JSON estructurado)**
   - El backend usa un `QUERY_REFINER_SYSTEM_PROMPT` dedicado.
   - Groq devuelve: `intent`, `main_topic`, `keywords`, `synonyms`, `related_technologies`, `error_terms`, `search_queries`.
   - Se generan variantes de búsqueda para mejorar recall en prompts vagos.

2. **Extracción flexible de términos**
   - Normaliza acentos y puntuación.
   - Elimina stopwords frecuentes (ES/EN).
   - Conserva términos significativos (>= 3 caracteres).

3. **Boost por intención**
   - Si detecta intención IoT/componentes/presupuesto, agrega términos semilla relevantes
     (`sensor`, `arduino`, `esp32`, etc.) para mejorar recall.

4. **Manual re-ranking**
   - Se mezclan candidatos de múltiples `search_queries`.
   - Se deduplica por `id`.
   - Se puntúa por match en `name/short_description` + penalización si no hay stock.
   - Se retorna máximo 5 y solo resultados con score útil.

5. **Top-K dinámico con máximo 5**
   - Se consulta con `limit=5`.
   - La API devuelve de **0 a 5** resultados reales.
   - Si no hay match semántico útil, puede devolver **0** (no fuerza 5 productos).

6. **Fallback con frase + tokens**
   - Combina filtros ILIKE por frase y por token.
   - Aumenta tolerancia a consultas largas y lenguaje natural.

7. **Context stuffing robusto + anti-hallucination**
   - El prompt final incluye bloques delimitados (`PRODUCT_CONTEXT_START/END`).
   - Se inyecta `REFINED_QUERY_JSON` para guiar respuesta.
   - Se obliga a usar solo el contexto; si no hay calidad, pregunta aclaratoria breve.

## Comportamiento esperado

- Consultas vagas de proyecto → deben devolver sugerencias relacionadas (normalmente 2–5).
- Consultas sin señal útil → deben devolver 0 y pedir más contexto al usuario.
- Consultas concretas → deben mantener precisión alta.

## Recomendaciones de prompt UX

Para mejores resultados, sugiere al usuario incluir:

- presupuesto aproximado,
- tipo de proyecto,
- nivel (básico/intermedio/pro),
- restricciones (marca, disponibilidad, etc.).

Aun así, el sistema ya debe funcionar con prompts naturales sin formato rígido.
