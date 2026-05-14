-- CircuitMarket TJ - Supabase / PostgreSQL schema
-- Paste this file into Supabase SQL Editor.
-- It converts the original MySQL/MariaDB schema into Supabase-compatible PostgreSQL.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'CM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

do $$ begin create type public.user_role as enum ('buyer', 'seller', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.cart_price_type as enum ('retail', 'wholesale'); exception when duplicate_object then null; end $$;
do $$ begin create type public.shipping_method as enum ('standard', 'express', 'pickup'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_method as enum ('cash_on_delivery', 'transfer', 'pickup_payment', 'card'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reel_interaction_type as enum ('view', 'like', 'save', 'share', 'add_to_cart', 'view_product'); exception when duplicate_object then null; end $$;
do $$ begin create type public.inventory_change_reason as enum ('purchase', 'restock', 'adjustment', 'return', 'damage'); exception when duplicate_object then null; end $$;
do $$ begin create type public.discount_type as enum ('fixed', 'percentage'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contact_message_status as enum ('new', 'read', 'responded', 'closed'); exception when duplicate_object then null; end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  username varchar(120) not null unique,
  email varchar(160) not null unique,
  password_hash varchar(255),
  full_name varchar(160),
  phone varchar(20),
  avatar_url text,
  role public.user_role not null default 'buyer',
  is_active boolean not null default true,
  is_email_verified boolean not null default false,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  store_name varchar(160) not null,
  location varchar(160),
  description text,
  store_logo_url text,
  store_banner_url text,
  rating numeric(3,2) not null default 0.00 check (rating >= 0 and rating <= 5),
  total_products integer not null default 0 check (total_products >= 0),
  total_sales integer not null default 0 check (total_sales >= 0),
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  slug varchar(140) not null unique,
  description text,
  icon_name varchar(50),
  parent_category_id uuid references public.categories(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  name varchar(160) not null,
  slug varchar(180) not null unique,
  short_description varchar(255),
  full_description text,
  retail_price numeric(10,2) not null check (retail_price > 0),
  wholesale_price numeric(10,2) check (wholesale_price is null or wholesale_price > 0),
  wholesale_min_quantity integer not null default 10 check (wholesale_min_quantity > 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  main_image_url text,
  images_json jsonb not null default '[]'::jsonb,
  video_url text,
  tags text,
  specifications_json jsonb not null default '{}'::jsonb,
  sku varchar(80) unique,
  avg_rating numeric(3,2) not null default 0.00 check (avg_rating >= 0 and avg_rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_wholesale_available boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(full_description, '')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(tags, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_products_wholesale_price check (wholesale_price is null or wholesale_price <= retail_price)
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  order_item_id uuid,
  rating integer not null check (rating between 1 and 5),
  title varchar(160),
  comment text,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  is_verified_purchase boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id varchar(128) not null unique,
  is_shared boolean not null default false,
  shared_token varchar(160) unique,
  subtotal numeric(10,2) not null default 0.00 check (subtotal >= 0),
  last_accessed timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_retail_price numeric(10,2),
  unit_wholesale_price numeric(10,2),
  applied_price_type public.cart_price_type not null default 'retail',
  subtotal numeric(10,2) not null default 0.00 check (subtotal >= 0),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete set null,
  order_number varchar(50) not null unique default public.generate_order_number(),
  user_id uuid references public.users(id) on delete set null,
  customer_name varchar(120) not null,
  customer_email varchar(160) not null,
  customer_phone varchar(20),
  shipping_address text,
  shipping_city varchar(120),
  shipping_state varchar(120),
  shipping_postal_code varchar(20),
  notes text,
  shipping_method public.shipping_method not null default 'standard',
  shipping_cost numeric(10,2) not null default 0.00 check (shipping_cost >= 0),
  payment_method public.payment_method not null default 'cash_on_delivery',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  wholesale_savings numeric(10,2) not null default 0.00 check (wholesale_savings >= 0),
  tax numeric(10,2) not null default 0.00 check (tax >= 0),
  total numeric(10,2) not null check (total >= 0),
  status public.order_status not null default 'pending',
  cancellation_reason varchar(255),
  tracking_number varchar(100),
  estimated_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  shipped_at timestamptz,
  delivered_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  seller_id uuid not null references public.sellers(id) on delete restrict,
  product_name varchar(160) not null,
  product_sku varchar(80),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  price_type public.cart_price_type not null default 'retail',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

alter table public.product_reviews
  drop constraint if exists product_reviews_order_item_id_fkey;
alter table public.product_reviews
  add constraint product_reviews_order_item_id_fkey foreign key (order_item_id) references public.order_items(id) on delete set null;

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  event_type varchar(50) not null,
  event_source varchar(50),
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  search_query varchar(255),
  search_results_count integer check (search_results_count is null or search_results_count >= 0),
  value numeric(10,2),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  query varchar(255) not null,
  results_count integer not null default 0 check (results_count >= 0),
  category_filter uuid references public.categories(id) on delete set null,
  price_min numeric(10,2),
  price_max numeric(10,2),
  selected_product_id uuid references public.products(id) on delete set null,
  result_position integer,
  query_vector tsvector generated always as (to_tsvector('spanish', coalesce(query, ''))) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.product_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.purchase_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  product_id uuid not null references public.products(id) on delete cascade,
  probability numeric(5,4) check (probability is null or (probability >= 0 and probability <= 1)),
  explanation text,
  model_version varchar(50),
  model_name varchar(80) default 'xgboost_mock',
  features_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  query text not null,
  detected_intent varchar(100),
  detected_categories jsonb not null default '[]'::jsonb,
  detected_tags jsonb not null default '[]'::jsonb,
  explanation text,
  recommended_products_json jsonb not null default '[]'::jsonb,
  suggested_bundle_json jsonb not null default '{}'::jsonb,
  products_added_to_cart integer not null default 0 check (products_added_to_cart >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.visual_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  image_url text,
  image_storage_path text,
  extracted_tags jsonb not null default '[]'::jsonb,
  confidence_scores jsonb not null default '{}'::jsonb,
  matched_products_json jsonb not null default '[]'::jsonb,
  matched_categories jsonb not null default '[]'::jsonb,
  selected_product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tech_reels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  video_url text not null,
  poster_image_url text,
  title varchar(160),
  description text,
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  share_count integer not null default 0 check (share_count >= 0),
  add_to_cart_count integer not null default 0 check (add_to_cart_count >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reel_interactions (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.tech_reels(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128),
  interaction_type public.reel_interaction_type not null default 'view',
  created_at timestamptz not null default now()
);

create table if not exists public.shared_carts (
  id uuid primary key default gen_random_uuid(),
  original_cart_id uuid references public.carts(id) on delete set null,
  original_user_id uuid references public.users(id) on delete set null,
  share_token varchar(160) not null unique,
  share_link text,
  qr_code_url text,
  cart_data_snapshot jsonb not null default '{}'::jsonb,
  subtotal numeric(10,2) not null default 0.00 check (subtotal >= 0),
  access_count integer not null default 0 check (access_count >= 0),
  last_accessed timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id varchar(128),
  product_id uuid not null references public.products(id) on delete cascade,
  recommendation_reason varchar(100),
  confidence_score numeric(5,4) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  influencing_features jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  displayed_at timestamptz,
  clicked_at timestamptz,
  added_to_cart_at timestamptz,
  purchased_at timestamptz
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id varchar(128) not null unique,
  ip_address inet,
  user_agent text,
  device_type varchar(50),
  events_count integer not null default 0 check (events_count >= 0),
  products_viewed integer not null default 0 check (products_viewed >= 0),
  search_count integer not null default 0 check (search_count >= 0),
  orders_placed integer not null default 0 check (orders_placed >= 0),
  total_spent numeric(10,2) not null default 0.00 check (total_spent >= 0),
  started_at timestamptz not null default now(),
  last_activity timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  old_quantity integer,
  new_quantity integer,
  change_quantity integer,
  change_reason public.inventory_change_reason not null default 'adjustment',
  order_id uuid references public.orders(id) on delete set null,
  notes varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status varchar(50),
  new_status varchar(50) not null,
  notes text,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.promotional_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  discount_type public.discount_type not null default 'percentage',
  discount_value numeric(10,2) not null check (discount_value > 0),
  maximum_discount numeric(10,2),
  min_purchase_amount numeric(10,2),
  max_uses integer,
  current_uses integer not null default 0 check (current_uses >= 0),
  max_uses_per_user integer not null default 1 check (max_uses_per_user > 0),
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotional_code_usage (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.promotional_codes(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  discount_applied numeric(10,2),
  used_at timestamptz not null default now()
);

create table if not exists public.seller_ratings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  product_quality integer check (product_quality between 1 and 5),
  shipping_speed integer check (shipping_speed between 1 and 5),
  communication integer check (communication between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, user_id, order_id)
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete cascade,
  admin_id uuid references public.users(id) on delete cascade,
  key_name varchar(120) not null,
  api_key varchar(255) not null unique,
  api_secret varchar(255),
  permissions jsonb not null default '{}'::jsonb,
  last_used timestamptz,
  request_count integer not null default 0 check (request_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_api_key_owner check (seller_id is not null or admin_id is not null)
);

create table if not exists public.analytics_daily_snapshot (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null unique,
  total_users integer not null default 0 check (total_users >= 0),
  new_users integer not null default 0 check (new_users >= 0),
  active_users integer not null default 0 check (active_users >= 0),
  total_products integer not null default 0 check (total_products >= 0),
  active_products integer not null default 0 check (active_products >= 0),
  low_stock_products integer not null default 0 check (low_stock_products >= 0),
  total_orders integer not null default 0 check (total_orders >= 0),
  total_revenue numeric(12,2) not null default 0.00 check (total_revenue >= 0),
  avg_order_value numeric(10,2) not null default 0.00 check (avg_order_value >= 0),
  total_searches integer not null default 0 check (total_searches >= 0),
  total_product_views integer not null default 0 check (total_product_views >= 0),
  total_add_to_cart integer not null default 0 check (total_add_to_cart >= 0),
  conversion_rate numeric(5,4) not null default 0.00 check (conversion_rate >= 0 and conversion_rate <= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  sender_email varchar(160),
  subject varchar(160) not null,
  message text not null,
  message_type varchar(50),
  status public.contact_message_status not null default 'new',
  response_text text,
  responded_by uuid references public.users(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(is_active);
create index if not exists idx_sellers_user_id on public.sellers(user_id);
create index if not exists idx_sellers_active on public.sellers(is_active);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_active on public.categories(is_active);
create index if not exists idx_products_seller_id on public.products(seller_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured, created_at desc);
create index if not exists idx_products_active_stock on public.products(is_active, stock);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);
create index if not exists idx_product_reviews_product_id on public.product_reviews(product_id);
create index if not exists idx_carts_user_id on public.carts(user_id);
create index if not exists idx_carts_session_id on public.carts(session_id);
create index if not exists idx_carts_shared_token on public.carts(shared_token);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_seller_id on public.order_items(seller_id);
create index if not exists idx_user_events_user_id on public.user_events(user_id);
create index if not exists idx_user_events_session_id on public.user_events(session_id);
create index if not exists idx_user_events_event_type_created on public.user_events(event_type, created_at desc);
create index if not exists idx_user_events_product_id on public.user_events(product_id);
create index if not exists idx_user_events_metadata on public.user_events using gin(metadata);
create index if not exists idx_search_logs_user_id on public.search_logs(user_id);
create index if not exists idx_search_logs_session_id on public.search_logs(session_id);
create index if not exists idx_search_logs_query_vector on public.search_logs using gin(query_vector);
create index if not exists idx_product_favorites_user_id on public.product_favorites(user_id);
create index if not exists idx_purchase_predictions_user_id on public.purchase_predictions(user_id);
create index if not exists idx_purchase_predictions_session_id on public.purchase_predictions(session_id);
create index if not exists idx_purchase_predictions_product_id on public.purchase_predictions(product_id);
create index if not exists idx_purchase_predictions_probability on public.purchase_predictions(probability desc);
create index if not exists idx_assistant_queries_user_id on public.assistant_queries(user_id);
create index if not exists idx_assistant_queries_session_id on public.assistant_queries(session_id);
create index if not exists idx_visual_searches_user_id on public.visual_searches(user_id);
create index if not exists idx_tech_reels_product_id on public.tech_reels(product_id);
create index if not exists idx_tech_reels_active on public.tech_reels(is_active);
create index if not exists idx_reel_interactions_reel_id on public.reel_interactions(reel_id);
create index if not exists idx_shared_carts_token on public.shared_carts(share_token);
create index if not exists idx_shared_carts_expires_at on public.shared_carts(expires_at);
create index if not exists idx_recommendations_user_id on public.recommendations(user_id);
create index if not exists idx_recommendations_session_id on public.recommendations(session_id);
create index if not exists idx_recommendations_confidence_score on public.recommendations(confidence_score desc);
create index if not exists idx_user_sessions_session_id on public.user_sessions(session_id);
create index if not exists idx_inventory_logs_product_id on public.inventory_logs(product_id);
create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);
create index if not exists idx_promotional_codes_code on public.promotional_codes(code);
create index if not exists idx_seller_ratings_seller_id on public.seller_ratings(seller_id);
create index if not exists idx_api_keys_api_key on public.api_keys(api_key);
create index if not exists idx_analytics_daily_snapshot_date on public.analytics_daily_snapshot(snapshot_date);
create index if not exists idx_contact_messages_status on public.contact_messages(status);

-- updated_at triggers
drop trigger if exists trg_users_updated_at on public.users; create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists trg_sellers_updated_at on public.sellers; create trigger trg_sellers_updated_at before update on public.sellers for each row execute function public.set_updated_at();
drop trigger if exists trg_categories_updated_at on public.categories; create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated_at on public.products; create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists trg_product_reviews_updated_at on public.product_reviews; create trigger trg_product_reviews_updated_at before update on public.product_reviews for each row execute function public.set_updated_at();
drop trigger if exists trg_carts_updated_at on public.carts; create trigger trg_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
drop trigger if exists trg_cart_items_updated_at on public.cart_items; create trigger trg_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
drop trigger if exists trg_orders_updated_at on public.orders; create trigger trg_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists trg_tech_reels_updated_at on public.tech_reels; create trigger trg_tech_reels_updated_at before update on public.tech_reels for each row execute function public.set_updated_at();
drop trigger if exists trg_shared_carts_updated_at on public.shared_carts; create trigger trg_shared_carts_updated_at before update on public.shared_carts for each row execute function public.set_updated_at();
drop trigger if exists trg_promotional_codes_updated_at on public.promotional_codes; create trigger trg_promotional_codes_updated_at before update on public.promotional_codes for each row execute function public.set_updated_at();
drop trigger if exists trg_seller_ratings_updated_at on public.seller_ratings; create trigger trg_seller_ratings_updated_at before update on public.seller_ratings for each row execute function public.set_updated_at();
drop trigger if exists trg_api_keys_updated_at on public.api_keys; create trigger trg_api_keys_updated_at before update on public.api_keys for each row execute function public.set_updated_at();
drop trigger if exists trg_contact_messages_updated_at on public.contact_messages; create trigger trg_contact_messages_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();

-- cart subtotal logic
create or replace function public.calculate_cart_item_subtotal()
returns trigger
language plpgsql
as $$
declare
  product_record record;
begin
  select retail_price, wholesale_price, wholesale_min_quantity, is_wholesale_available
  into product_record
  from public.products
  where id = new.product_id;

  if product_record.is_wholesale_available
     and product_record.wholesale_price is not null
     and new.quantity >= product_record.wholesale_min_quantity then
    new.applied_price_type = 'wholesale';
    new.unit_wholesale_price = product_record.wholesale_price;
    new.unit_retail_price = product_record.retail_price;
    new.subtotal = product_record.wholesale_price * new.quantity;
  else
    new.applied_price_type = 'retail';
    new.unit_retail_price = product_record.retail_price;
    new.unit_wholesale_price = product_record.wholesale_price;
    new.subtotal = product_record.retail_price * new.quantity;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cart_item_subtotal on public.cart_items;
create trigger trg_cart_item_subtotal before insert or update of quantity, product_id on public.cart_items for each row execute function public.calculate_cart_item_subtotal();

create or replace function public.recalculate_cart_subtotal()
returns trigger
language plpgsql
as $$
declare
  target_cart_id uuid;
begin
  target_cart_id = coalesce(new.cart_id, old.cart_id);

  update public.carts
  set subtotal = coalesce((select sum(subtotal) from public.cart_items where cart_id = target_cart_id), 0),
      last_accessed = now()
  where id = target_cart_id;

  return null;
end;
$$;

drop trigger if exists trg_recalculate_cart_subtotal_insert on public.cart_items;
create trigger trg_recalculate_cart_subtotal_insert after insert on public.cart_items for each row execute function public.recalculate_cart_subtotal();

drop trigger if exists trg_recalculate_cart_subtotal_update on public.cart_items;
create trigger trg_recalculate_cart_subtotal_update after update on public.cart_items for each row execute function public.recalculate_cart_subtotal();

drop trigger if exists trg_recalculate_cart_subtotal_delete on public.cart_items;
create trigger trg_recalculate_cart_subtotal_delete after delete on public.cart_items for each row execute function public.recalculate_cart_subtotal();

create or replace function public.update_stock_from_order(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update public.products p
  set stock = greatest(0, p.stock - oi.quantity)
  from public.order_items oi
  where p.id = oi.product_id and oi.order_id = p_order_id;

  insert into public.inventory_logs (product_id, seller_id, old_quantity, new_quantity, change_quantity, change_reason, order_id, notes)
  select oi.product_id, oi.seller_id, p.stock + oi.quantity, p.stock, -oi.quantity, 'purchase', p_order_id, 'Stock descontado por orden'
  from public.order_items oi
  join public.products p on p.id = oi.product_id
  where oi.order_id = p_order_id;
end;
$$;

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history(order_id, old_status, new_status, notes)
    values (new.id, old.status::text, new.status::text, 'Cambio automático de estado');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_status_history on public.orders;
create trigger trg_order_status_history after update of status on public.orders for each row execute function public.log_order_status_change();

create or replace function public.increment_product_view_count()
returns trigger
language plpgsql
as $$
begin
  if new.event_type = 'product_view' and new.product_id is not null then
    update public.products set view_count = view_count + 1 where id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_increment_product_view_count on public.user_events;
create trigger trg_increment_product_view_count after insert on public.user_events for each row execute function public.increment_product_view_count();

create or replace function public.calculate_basic_recommendations(
  p_user_id uuid default null,
  p_session_id varchar default null,
  p_limit integer default 10
)
returns table (
  product_id uuid,
  recommendation_reason varchar,
  confidence_score numeric
)
language sql
as $$
  with recent_interests as (
    select coalesce(ue.category_id, p.category_id) as category_id, count(*) as interest_count
    from public.user_events ue
    left join public.products p on p.id = ue.product_id
    where (p_user_id is not null and ue.user_id = p_user_id)
       or (p_session_id is not null and ue.session_id = p_session_id)
    group by coalesce(ue.category_id, p.category_id)
  ),
  scored_products as (
    select
      p.id as product_id,
      case
        when ri.category_id is not null then 'Relacionado con tu actividad'
        when p.is_featured then 'Producto destacado'
        else 'Popular en CircuitMarket'
      end::varchar as recommendation_reason,
      least(0.95, 0.35 + coalesce(ri.interest_count, 0) * 0.08 + case when p.is_featured then 0.10 else 0 end + least(p.view_count, 100) * 0.001)::numeric(5,4) as confidence_score
    from public.products p
    left join recent_interests ri on ri.category_id = p.category_id
    where p.is_active = true and p.stock > 0
  )
  select product_id, recommendation_reason, confidence_score
  from scored_products
  order by confidence_score desc
  limit p_limit;
$$;

-- Views
create or replace view public.v_products_with_seller as
select
  p.id, p.name, p.slug, p.retail_price, p.wholesale_price, p.wholesale_min_quantity,
  p.stock, p.avg_rating, p.review_count, p.view_count, p.main_image_url, p.is_featured,
  s.id as seller_id, s.store_name, s.location, s.rating as seller_rating,
  c.id as category_id, c.name as category_name, c.slug as category_slug,
  p.created_at, p.is_active
from public.products p
join public.sellers s on p.seller_id = s.id
join public.categories c on p.category_id = c.id;

create or replace view public.v_orders_summary as
select
  o.id, o.order_number, o.user_id, o.customer_name, o.customer_email,
  o.subtotal, o.wholesale_savings, o.total, o.status, o.shipping_method,
  count(oi.id) as item_count,
  o.created_at, o.shipped_at, o.delivered_at
from public.orders o
left join public.order_items oi on o.id = oi.order_id
group by o.id, o.order_number, o.user_id, o.customer_name, o.customer_email,
         o.subtotal, o.wholesale_savings, o.total, o.status, o.shipping_method,
         o.created_at, o.shipped_at, o.delivered_at;

create or replace view public.v_seller_statistics as
select
  s.id, s.user_id, s.store_name, s.location,
  count(distinct p.id) as product_count,
  count(distinct case when p.stock > 0 then p.id end) as products_in_stock,
  coalesce(sum(p.stock), 0) as total_stock,
  count(distinct oi.order_id) as total_orders,
  coalesce(sum(oi.quantity), 0) as items_sold,
  coalesce(sum(oi.subtotal), 0) as total_revenue,
  avg(sr.rating) as avg_seller_rating,
  s.is_verified, s.created_at
from public.sellers s
left join public.products p on s.id = p.seller_id
left join public.order_items oi on p.id = oi.product_id
left join public.seller_ratings sr on s.id = sr.seller_id
group by s.id, s.user_id, s.store_name, s.location, s.is_verified, s.created_at;

create or replace view public.v_low_stock_products as
select
  p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
  s.store_name, s.user_id, c.name as category_name, p.retail_price, p.updated_at
from public.products p
join public.sellers s on p.seller_id = s.id
join public.categories c on p.category_id = c.id
where p.stock <= p.low_stock_threshold and p.is_active = true;

create or replace view public.v_popular_search_terms as
select
  query,
  count(*) as frequency,
  count(distinct session_id) as unique_sessions,
  sum(case when selected_product_id is not null then 1 else 0 end) as click_through_count,
  max(created_at) as last_searched_at
from public.search_logs
where created_at >= now() - interval '7 days'
group by query
order by frequency desc;

-- Minimal seed data
insert into public.categories (name, slug, description, icon_name, display_order)
values
  ('Componentes PC', 'componentes-pc', 'Procesadores, RAM, SSD, fuentes, gabinetes y componentes para armar o mejorar una PC.', 'cpu', 1),
  ('Laptops y computadoras', 'laptops-computadoras', 'Laptops, computadoras reacondicionadas y accesorios de productividad.', 'laptop', 2),
  ('Teléfonos', 'telefonos', 'Teléfonos, cargadores, cables y accesorios móviles.', 'smartphone', 3),
  ('Arduino / Raspberry Pi', 'arduino-raspberry-pi', 'Placas, kits, sensores y accesorios para makers y robótica.', 'circuit-board', 4),
  ('Electrónica', 'electronica', 'Componentes electrónicos, protoboards, resistencias, sensores y módulos.', 'zap', 5),
  ('Cables y adaptadores', 'cables-adaptadores', 'HDMI, USB-C, adaptadores, hubs y conectividad.', 'cable', 6),
  ('Herramientas', 'herramientas', 'Multímetros, cautines, kits de soldadura y herramientas de reparación.', 'wrench', 7),
  ('Kits para estudiantes', 'kits-estudiantes', 'Bundles para cursos, robótica, laboratorio y proyectos académicos.', 'graduation-cap', 8),
  ('Ofertas mayoreo', 'ofertas-mayoreo', 'Productos con precio especial por volumen.', 'package', 9),
  ('Accesorios', 'accesorios', 'Periféricos, audífonos, mouse, teclados y accesorios tech.', 'headphones', 10)
on conflict (slug) do nothing;

insert into public.users (username, email, password_hash, full_name, role, is_active, is_email_verified)
values
  ('admin', 'admin@circuitmarket.test', 'demo_hash_replace_in_backend', 'Admin CircuitMarket', 'admin', true, true),
  ('seller_demo', 'seller@circuitmarket.test', 'demo_hash_replace_in_backend', 'Seller Demo', 'seller', true, true),
  ('buyer_demo', 'buyer@circuitmarket.test', 'demo_hash_replace_in_backend', 'Buyer Demo', 'buyer', true, true)
on conflict (email) do nothing;

insert into public.sellers (user_id, store_name, location, description, is_verified, is_active, rating)
select id, 'CircuitMarket Store', 'Tijuana, Baja California', 'Tienda demo de componentes, electrónica y hardware.', true, true, 4.8
from public.users
where email = 'seller@circuitmarket.test'
on conflict (user_id) do nothing;

with seller as (
  select s.id as seller_id from public.sellers s limit 1
),
cat as (
  select slug, id from public.categories
)
insert into public.products (
  seller_id, category_id, name, slug, short_description, full_description,
  retail_price, wholesale_price, wholesale_min_quantity, stock, low_stock_threshold,
  main_image_url, images_json, video_url, tags, specifications_json, sku,
  avg_rating, review_count, is_active, is_featured, is_wholesale_available
)
select seller.seller_id, cat.id, p.name, p.slug, p.short_description, p.full_description,
       p.retail_price, p.wholesale_price, p.wholesale_min_quantity, p.stock, p.low_stock_threshold,
       p.main_image_url, '[]'::jsonb, p.video_url, p.tags, p.specifications_json::jsonb, p.sku,
       p.avg_rating, p.review_count, true, p.is_featured, p.is_wholesale_available
from seller
join (
  values
    ('arduino-raspberry-pi', 'Arduino Uno R3 compatible', 'arduino-uno-r3-compatible', 'Placa compatible para proyectos de electrónica y robótica.', 'Ideal para iniciar proyectos de robótica, sensores y automatización.', 299.00, 249.00, 5, 35, 5, '/products/arduino-uno.jpg', null, 'arduino,robotica,maker,placa,estudiantes', '{"microcontroller":"ATmega328P","voltage":"5V","usb":"Tipo B"}', 'ARD-UNO-R3', 4.7, 24, true, true),
    ('arduino-raspberry-pi', 'Kit Raspberry Pi starter', 'kit-raspberry-pi-starter', 'Case, disipadores, fuente y accesorios para Raspberry Pi.', 'Kit de inicio para levantar servidores, domótica o prototipos con Raspberry Pi.', 899.00, 799.00, 3, 12, 3, '/products/raspberry-kit.jpg', null, 'raspberry,linux,servidor,domotica,kit', '{"includes":["case","power supply","heatsinks"],"compatibility":"Raspberry Pi 4"}', 'RPI-KIT-STARTER', 4.8, 17, true, true),
    ('electronica', 'Protoboard 830 puntos', 'protoboard-830-puntos', 'Protoboard para prototipado rápido sin soldadura.', 'Base de pruebas para circuitos electrónicos, ideal para cursos y laboratorio.', 129.00, 89.00, 10, 80, 10, '/products/protoboard.jpg', null, 'protoboard,electronica,circuitos,mayoreo', '{"points":830,"type":"solderless"}', 'PROTO-830', 4.6, 32, false, true),
    ('electronica', 'Kit de jumpers macho-macho 120 piezas', 'kit-jumpers-macho-macho-120', 'Cables Dupont para protoboard, Arduino y sensores.', 'Paquete de cables jumper para prácticas de electrónica y robótica.', 99.00, 69.00, 10, 120, 15, '/products/jumpers.jpg', null, 'jumpers,cables,arduino,mayoreo,robotica', '{"quantity":120,"type":"male-male"}', 'JMP-MM-120', 4.5, 45, false, true),
    ('electronica', 'Sensor ultrasónico HC-SR04', 'sensor-ultrasonico-hc-sr04', 'Sensor de distancia para robots y automatización.', 'Módulo de medición ultrasónica compatible con Arduino y Raspberry Pi.', 89.00, 59.00, 10, 70, 8, '/products/hcsr04.jpg', null, 'sensor,ultrasonico,arduino,robotica,distancia', '{"range":"2cm-400cm","voltage":"5V"}', 'SNS-HCSR04', 4.4, 21, false, true),
    ('herramientas', 'Multímetro digital básico', 'multimetro-digital-basico', 'Multímetro para voltaje, corriente, resistencia y continuidad.', 'Herramienta esencial para diagnóstico de circuitos y reparación electrónica.', 249.00, 219.00, 5, 20, 4, '/products/multimetro.jpg', null, 'multimetro,herramienta,electronica,reparacion', '{"measurements":["voltage","current","resistance","continuity"]}', 'TOOL-MULTI-01', 4.6, 18, true, true),
    ('herramientas', 'Cautín tipo lápiz 60W', 'cautin-tipo-lapiz-60w', 'Cautín para soldadura electrónica y reparación.', 'Cautín práctico para soldar componentes, cables y placas.', 179.00, 149.00, 5, 30, 5, '/products/cautin.jpg', null, 'cautin,soldadura,herramienta,reparacion', '{"power":"60W","type":"pencil"}', 'TOOL-CAUTIN-60', 4.3, 13, false, true),
    ('componentes-pc', 'SSD Kingston NVMe 500GB', 'ssd-kingston-nvme-500gb', 'SSD M.2 NVMe de 500GB para laptop o PC.', 'Mejora la velocidad de arranque y carga de aplicaciones.', 899.00, 829.00, 3, 18, 4, '/products/ssd-nvme.jpg', null, 'ssd,nvme,almacenamiento,laptop,pc', '{"capacity":"500GB","interface":"M.2 NVMe","read":"3000MB/s"}', 'SSD-KING-500NVME', 4.8, 36, true, true),
    ('componentes-pc', 'SSD SATA 1TB ADATA SU800', 'ssd-sata-1tb-adata-su800', 'SSD SATA de 1TB para laptop o PC.', 'Unidad de estado sólido para actualizar equipos lentos.', 1499.00, 1399.00, 3, 10, 3, '/products/ssd-sata-1tb.jpg', null, 'ssd,sata,1tb,almacenamiento,laptop', '{"capacity":"1TB","interface":"SATA","read":"560MB/s"}', 'SSD-ADATA-1TB-SATA', 4.7, 29, true, true),
    ('componentes-pc', 'Memoria RAM DDR4 16GB 3200MHz', 'ram-ddr4-16gb-3200mhz', 'Módulo RAM DDR4 para PC de escritorio.', 'Aumenta rendimiento en multitarea, gaming y desarrollo.', 799.00, 729.00, 4, 22, 5, '/products/ram-ddr4.jpg', null, 'ram,ddr4,pc,gaming,upgrade', '{"capacity":"16GB","speed":"3200MHz","type":"DDR4"}', 'RAM-DDR4-16-3200', 4.7, 19, true, true),
    ('componentes-pc', 'Fuente 600W 80 Plus', 'fuente-600w-80-plus', 'Fuente de poder para PC gamer o workstation básica.', 'Fuente estable para builds de entrada y media gama.', 999.00, 929.00, 3, 9, 2, '/products/fuente-600w.jpg', null, 'fuente,pc,gaming,hardware', '{"power":"600W","certification":"80 Plus"}', 'PSU-600-80P', 4.5, 12, false, true),
    ('componentes-pc', 'Gabinete gamer ATX con ventilador', 'gabinete-gamer-atx-ventilador', 'Gabinete ATX para build gamer o workstation.', 'Gabinete con espacio para componentes estándar y ventilación incluida.', 1199.00, 1099.00, 2, 8, 2, '/products/gabinete.jpg', null, 'gabinete,pc,gaming,atx', '{"form_factor":"ATX","fans":"1 included"}', 'CASE-ATX-GMR', 4.4, 10, false, true),
    ('cables-adaptadores', 'Cable HDMI 2m alta velocidad', 'cable-hdmi-2m-alta-velocidad', 'Cable HDMI para monitores, laptops, consolas y proyectores.', 'Cable de alta velocidad para video y audio digital.', 149.00, 99.00, 10, 90, 10, '/products/hdmi.jpg', null, 'hdmi,cable,monitor,laptop,mayoreo', '{"length":"2m","type":"HDMI"}', 'CAB-HDMI-2M', 4.6, 41, false, true),
    ('cables-adaptadores', 'Cargador USB-C 65W', 'cargador-usb-c-65w', 'Cargador rápido para laptops, tablets y teléfonos compatibles.', 'Carga rápida con salida USB-C Power Delivery.', 499.00, 449.00, 5, 25, 5, '/products/cargador-usbc.jpg', null, 'usb-c,cargador,laptop,telefono,pd', '{"power":"65W","port":"USB-C PD"}', 'CHG-USBC-65W', 4.7, 23, true, true),
    ('accesorios', 'Mouse inalámbrico compacto', 'mouse-inalambrico-compacto', 'Mouse inalámbrico para laptop, oficina y estudiantes.', 'Mouse ligero y portátil para uso diario.', 199.00, 169.00, 5, 40, 8, '/products/mouse.jpg', null, 'mouse,inalambrico,laptop,oficina', '{"connection":"2.4GHz","battery":"AA"}', 'ACC-MOUSE-WL', 4.4, 30, false, true),
    ('accesorios', 'Teclado mecánico compacto', 'teclado-mecanico-compacto', 'Teclado compacto para programación, gaming y productividad.', 'Diseño moderno con switches mecánicos y formato reducido.', 899.00, 829.00, 3, 13, 3, '/products/teclado.jpg', null, 'teclado,mecanico,gaming,programacion', '{"layout":"compact","switches":"mechanical"}', 'ACC-KB-MECH', 4.6, 16, true, true),
    ('laptops-computadoras', 'Laptop ThinkPad reacondicionada i5', 'laptop-thinkpad-reacondicionada-i5', 'Laptop resistente para estudiantes, programación y oficina.', 'Equipo reacondicionado ideal para desarrollo, clases y productividad.', 6499.00, null, 1, 5, 1, '/products/thinkpad.jpg', null, 'laptop,thinkpad,programacion,estudiantes', '{"cpu":"Intel i5","ram":"16GB","storage":"512GB SSD"}', 'LAP-THINK-I5-REF', 4.6, 9, true, false),
    ('laptops-computadoras', 'Monitor 24 pulgadas Full HD', 'monitor-24-full-hd', 'Monitor Full HD para estudio, oficina y setup de PC.', 'Pantalla de 24 pulgadas para productividad y gaming casual.', 2499.00, 2299.00, 2, 7, 2, '/products/monitor.jpg', null, 'monitor,pc,oficina,gaming', '{"size":"24 inch","resolution":"Full HD"}', 'MON-24-FHD', 4.5, 11, false, true),
    ('telefonos', 'Teléfono Android reacondicionado 128GB', 'telefono-android-reacondicionado-128gb', 'Smartphone reacondicionado con buena relación precio-rendimiento.', 'Equipo probado para uso diario, redes, clases y comunicación.', 3299.00, null, 1, 6, 2, '/products/telefono.jpg', null, 'telefono,android,reacondicionado,128gb', '{"storage":"128GB","condition":"refurbished"}', 'PHONE-AND-128-REF', 4.3, 8, false, false),
    ('kits-estudiantes', 'Kit robótica seguidor de línea', 'kit-robotica-seguidor-linea', 'Kit para construir un robot seguidor de línea.', 'Incluye componentes base para proyecto de robótica escolar.', 1199.00, 999.00, 3, 14, 3, '/products/kit-robotica.jpg', null, 'kit,robotica,arduino,sensores,estudiantes', '{"includes":["Arduino compatible","sensors","chassis","jumpers"],"level":"beginner"}', 'KIT-ROBO-LINE', 4.8, 15, true, true),
    ('kits-estudiantes', 'Kit soldadura electrónica inicial', 'kit-soldadura-electronica-inicial', 'Kit básico para aprender soldadura y reparación electrónica.', 'Incluye cautín, estaño, base y herramientas básicas.', 599.00, 529.00, 4, 16, 4, '/products/kit-soldadura.jpg', null, 'kit,soldadura,cautin,electronica,estudiantes', '{"includes":["soldering iron","solder","stand","basic tools"]}', 'KIT-SOLDER-01', 4.5, 14, false, true),
    ('cables-adaptadores', 'Hub USB-C 6 en 1', 'hub-usb-c-6-en-1', 'Hub USB-C con HDMI, USB y lector de tarjetas.', 'Adaptador multipuerto para laptops modernas.', 699.00, 649.00, 3, 18, 4, '/products/hub-usbc.jpg', null, 'usb-c,hub,adaptador,laptop,hdmi', '{"ports":["HDMI","USB-A","USB-C","SD"],"type":"6-in-1"}', 'HUB-USBC-6IN1', 4.6, 12, true, true),
    ('electronica', 'Pack resistencias 600 piezas', 'pack-resistencias-600-piezas', 'Kit de resistencias variadas para prototipado.', 'Paquete ideal para laboratorios, cursos y proyectos electrónicos.', 159.00, 109.00, 10, 60, 10, '/products/resistencias.jpg', null, 'resistencias,electronica,mayoreo,kit', '{"quantity":600,"values":"assorted"}', 'RES-PACK-600', 4.7, 25, false, true),
    ('accesorios', 'Audífonos Bluetooth compactos', 'audifonos-bluetooth-compactos', 'Audífonos inalámbricos para estudio, llamadas y uso diario.', 'Diseño compacto con estuche de carga.', 399.00, 349.00, 5, 22, 5, '/products/audifonos.jpg', null, 'audifonos,bluetooth,accesorios,telefono', '{"connection":"Bluetooth","case":"charging"}', 'AUD-BT-COMP', 4.2, 20, false, true),
    ('arduino-raspberry-pi', 'Módulo relé 5V 2 canales', 'modulo-rele-5v-2-canales', 'Módulo relé para controlar cargas desde Arduino.', 'Ideal para automatización, domótica y control de dispositivos.', 119.00, 89.00, 10, 45, 8, '/products/rele.jpg', null, 'rele,arduino,domotica,automatizacion', '{"channels":2,"voltage":"5V"}', 'MOD-RELAY-2CH', 4.4, 18, false, true),
    ('arduino-raspberry-pi', 'Sensor temperatura y humedad DHT11', 'sensor-temperatura-humedad-dht11', 'Sensor DHT11 para proyectos de clima y domótica.', 'Mide temperatura y humedad para proyectos con Arduino o Raspberry Pi.', 79.00, 55.00, 10, 55, 8, '/products/dht11.jpg', null, 'sensor,dht11,temperatura,humedad,arduino', '{"type":"DHT11","measurements":["temperature","humidity"]}', 'SNS-DHT11', 4.3, 16, false, true),
    ('ofertas-mayoreo', 'Paquete 10 cables USB-C', 'paquete-10-cables-usb-c', 'Paquete de cables USB-C para tienda, laboratorio o equipo.', 'Compra por volumen con precio mayoreo activo.', 599.00, 399.00, 2, 25, 5, '/products/pack-usbc.jpg', null, 'usb-c,cables,mayoreo,paquete', '{"quantity":10,"type":"USB-C"}', 'PACK-USBC-10', 4.5, 9, true, true)
) as p(category_slug, name, slug, short_description, full_description, retail_price, wholesale_price, wholesale_min_quantity, stock, low_stock_threshold, main_image_url, video_url, tags, specifications_json, sku, avg_rating, review_count, is_featured, is_wholesale_available)
on cat.slug = p.category_slug
on conflict (slug) do nothing;

insert into public.tech_reels (product_id, seller_id, video_url, poster_image_url, title, description, is_active, display_order)
select p.id, p.seller_id, coalesce(p.video_url, '/videos/demo-reel.mp4'), p.main_image_url,
       'Demo TechReel: ' || p.name, 'Video corto de producto para compra rápida desde TechReels.',
       true, row_number() over (order by p.created_at)
from public.products p
where p.is_featured = true
on conflict do nothing;

-- RLS. These policies are permissive for hackathon speed.
-- Replace before production.
alter table public.users enable row level security;
alter table public.sellers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_events enable row level security;
alter table public.search_logs enable row level security;
alter table public.product_favorites enable row level security;
alter table public.purchase_predictions enable row level security;
alter table public.assistant_queries enable row level security;
alter table public.visual_searches enable row level security;
alter table public.tech_reels enable row level security;
alter table public.reel_interactions enable row level security;
alter table public.shared_carts enable row level security;
alter table public.recommendations enable row level security;
alter table public.user_sessions enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.order_status_history enable row level security;
alter table public.promotional_codes enable row level security;
alter table public.promotional_code_usage enable row level security;
alter table public.seller_ratings enable row level security;
alter table public.api_keys enable row level security;
alter table public.analytics_daily_snapshot enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "public_read_categories" on public.categories;
create policy "public_read_categories" on public.categories for select using (true);

drop policy if exists "public_read_products" on public.products;
create policy "public_read_products" on public.products for select using (is_active = true);

drop policy if exists "public_read_sellers" on public.sellers;
create policy "public_read_sellers" on public.sellers for select using (is_active = true);

drop policy if exists "public_read_reviews" on public.product_reviews;
create policy "public_read_reviews" on public.product_reviews for select using (true);

drop policy if exists "public_read_reels" on public.tech_reels;
create policy "public_read_reels" on public.tech_reels for select using (is_active = true);

drop policy if exists "public_read_shared_carts" on public.shared_carts;
create policy "public_read_shared_carts" on public.shared_carts for select using (expires_at is null or expires_at > now());

do $$
declare
  t text;
begin
  foreach t in array array[
    'users','sellers','categories','products','product_reviews','carts','cart_items',
    'orders','order_items','user_events','search_logs','product_favorites',
    'purchase_predictions','assistant_queries','visual_searches','tech_reels',
    'reel_interactions','shared_carts','recommendations','user_sessions',
    'inventory_logs','order_status_history','promotional_codes',
    'promotional_code_usage','seller_ratings','api_keys',
    'analytics_daily_snapshot','contact_messages'
  ]
  loop
    execute format('drop policy if exists "hackathon_all_%I" on public.%I', t, t);
    execute format('create policy "hackathon_all_%I" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;

commit;
