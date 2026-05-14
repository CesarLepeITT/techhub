# RAG flexible para prompts vagos (buscador conversacional)

Este documento describe cómo permitir consultas naturales como:

- `Estoy desarrollando un proyecto de IoT con microcontroladores, ¿qué me sugieres comprar?`

sin obligar al usuario a escribir keywords sueltas como:

- `telefofo, teclado`

## Objetivo

Mejorar **recall** en consultas vagas, manteniendo control para no devolver resultados forzados.

## Estrategia implementada

En `app/api/chat/route.ts`:

1. **Extracción flexible de términos**
   - Normaliza acentos y puntuación.
   - Elimina stopwords frecuentes (ES/EN).
   - Conserva términos significativos (>= 3 caracteres).

2. **Boost por intención**
   - Si detecta intención IoT/componentes/presupuesto, agrega términos semilla relevantes
     (`sensor`, `arduino`, `esp32`, etc.) para mejorar recall.

3. **Top-K dinámico con máximo 5**
   - Se consulta con `limit=5`.
   - La API devuelve de **0 a 5** resultados reales.
   - Si no hay match semántico útil, puede devolver **0** (no fuerza 5 productos).

4. **Fallback con frase + tokens**
   - Combina filtros ILIKE por frase y por token.
   - Aumenta tolerancia a consultas largas y lenguaje natural.

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
