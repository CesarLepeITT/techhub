-- Restore Spanish full text search for products and the web search RPC.

alter table public.products
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'spanish',
      coalesce(name, '') || ' ' || coalesce(short_description, '')
    )
  ) stored;

create index if not exists products_search_vector_gin_idx
  on public.products
  using gin (search_vector);

-- Drop first because PostgreSQL cannot CREATE OR REPLACE a function when the
-- return type changes from a table projection to SETOF public.products.
drop function if exists public.search_products_web(text, int);

create or replace function public.search_products_web(
  raw_query text,
  max_results int
)
returns setof public.products
language sql
stable
as $$
  select p.*
  from public.products p
  where p.is_active = true
    and p.search_vector @@ websearch_to_tsquery('spanish', raw_query)
  order by ts_rank(p.search_vector, websearch_to_tsquery('spanish', raw_query)) desc
  limit max_results;
$$;

notify pgrst, 'reload schema';
