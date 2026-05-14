-- 1) Índice GIN para FTS en español
create index if not exists idx_products_search_fts
on public.products
using gin (
  to_tsvector(
    'spanish',
    coalesce(name,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(tags,'')
  )
);

-- 2) Función RPC para PostgREST/Supabase
create or replace function public.search_products_fts(
  q text,
  max_results int default 5
)
returns table (
  id uuid,
  name text,
  short_description text,
  retail_price numeric,
  stock int,
  main_image_url text
)
language sql
stable
as $$
  with params as (
    select
      left(regexp_replace(coalesce(q,''), '[^[:alnum:]\sáéíóúñÁÉÍÓÚÑüÜ]', ' ', 'g'), 280) as clean_q,
      greatest(1, least(coalesce(max_results, 5), 5)) as k
  )
  select
    p.id,
    p.name,
    p.short_description,
    p.retail_price,
    p.stock,
    p.main_image_url
  from public.products p
  cross join params pr
  where to_tsvector(
          'spanish',
          coalesce(p.name,'') || ' ' || coalesce(p.short_description,'') || ' ' || coalesce(p.tags,'')
        ) @@ websearch_to_tsquery('spanish', pr.clean_q)
  order by ts_rank_cd(
            to_tsvector('spanish', coalesce(p.name,'') || ' ' || coalesce(p.short_description,'') || ' ' || coalesce(p.tags,'')),
            websearch_to_tsquery('spanish', pr.clean_q)
          ) desc,
          p.stock desc
  limit (select k from params);
$$;

-- 3) Permisos (ajusta según tu esquema de roles)
grant execute on function public.search_products_fts(text, int) to anon, authenticated, service_role;
