# Lightweight RAG Evaluation Strategy

This evaluation validates `/api/chat` with low overhead and is suitable for Raspberry Pi deployments.

## Coverage
- 20 representative ecommerce queries
- Retrieval relevance checks
- Hallucination safety checks
- Price presence checks
- Low-stock urgency checks
- Latency threshold checks

## Expected Retrieval Output
`/api/chat` should return:
- `intent`
- `response`
- `products[]` with `id`, `name`, `retail_price`, `stock`, `main_image_url`

## How to run
```bash
pnpm rag:eval
```

Optional env vars:
- `RAG_EVAL_BASE_URL` (default `http://localhost:3000`)
- `RAG_EVAL_USER_ID` (default `rag-eval`)
- `RAG_EVAL_MAX_LATENCY_MS` (default `1200`)

## Notes
- Query set and expected relevance terms are in `scripts/rag-eval.ts`.
- This is a lightweight heuristic gate for regressions, not a full benchmark harness.
- Current retrieval behavior in `/api/chat` targets a **maximum of 5 products** and can return fewer (including 0) if there is no meaningful match.
- See `documentacion/rag-flexible-prompts.md` for flexible prompt/query behavior.
