# Búsqueda robusta en `/api/chat` (Supabase/Postgres)

## ¿Por qué falla `.ilike()` con lenguaje natural?

Cuando se usa input libre directamente en filtros PostgREST (`or=(name.ilike.%...%)`) caracteres como `%`, `(`, `)`, `:` o combinaciones largas pueden romper el parser del filtro y disparar `PGRST100`.

Además, `.ilike()` con párrafos largos tiene peor relevancia y peor performance que FTS.

## Estrategia implementada

1. **Sanitizar siempre** con `sanitizeSearchQuery()`.
2. **FTS primero** vía RPC `search_products_fts` usando:
   - `to_tsvector('spanish', ...)`
   - `websearch_to_tsquery('spanish', ...)`
3. **Fallback a ILIKE defensivo** solo para texto corto.
4. **Nunca** pasar texto libre sin limpiar a filtros SQL/PostgREST.

## Arquitectura

- Input corto: FTS; si falla o no trae resultados, fallback ILIKE defensivo.
- Input largo: FTS únicamente (sin fallback agresivo).
- Salida: 0..5 resultados reales (sin rellenar por fuerza).

## Ejemplos de queries complejas soportadas

- `Estoy desarrollando un proyecto de IoT con microcontroladores y sensores, ¿qué me recomiendas comprar?`
- `Quiero armar automatización para casa con ESP32, relés y fuente estable (presupuesto bajo).`
- `Tengo error de voltaje en protoboard: ¿qué componentes de protección necesito?`
- `Necesito kit para robot móvil con driver, motores y control inalámbrico.`

## SQL de migración

Ver archivo: `documentacion/migracion-fts-supabase.sql`.
