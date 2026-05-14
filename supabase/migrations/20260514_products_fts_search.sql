-- Full text search for products in Spanish with safe natural language parsing.

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

create or replace function public.search_products_web(
  raw_query text,
  max_results int default 5
)
returns table (
  id uuid,
  name text,
  short_description text,
  retail_price numeric,
  stock integer,
  main_image_url text
)
language sql
stable
as $$
  with parsed as (
    select websearch_to_tsquery('spanish', left(coalesce(raw_query, ''), 400)) as q
  )
  select p.id, p.name, p.short_description, p.retail_price, p.stock, p.main_image_url
  from public.products p
  cross join parsed
  where p.is_active = true
    and parsed.q <> ''::tsquery
    and p.search_vector @@ parsed.q
  order by ts_rank_cd(p.search_vector, parsed.q) desc, p.updated_at desc nulls last
  limit greatest(1, least(coalesce(max_results, 5), 20));
$$;
