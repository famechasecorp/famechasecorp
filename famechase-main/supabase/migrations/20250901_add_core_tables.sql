-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- Updated at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  city text,
  niche text,
  primary_platform text,
  follower_count text,
  goals text[],
  quiz_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maintain updated_at
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
for each row execute function set_updated_at();

-- Helpful index
create index if not exists idx_users_email on public.users (email);

-- Products table (IDs are text to support human-readable product IDs)
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(12,2) not null default 0,
  original_price numeric(12,2) not null default 0,
  description text,
  features text[],
  is_enabled boolean not null default true,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function set_updated_at();

-- Purchases table
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  product_id text references public.products(id) on delete set null,
  amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  promo_code text,
  payment_id text,
  payment_status text not null check (payment_status in ('pending','success','failed','refunded')),
  payment_method text,
  customer_info jsonb,
  payu_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_purchases_updated_at on public.purchases;
create trigger trg_purchases_updated_at before update on public.purchases
for each row execute function set_updated_at();

-- Downloads table
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  download_id text not null,
  downloaded_at timestamptz not null default now(),
  user_id uuid references public.users(id) on delete set null
);

-- Helpful indexes
create index if not exists idx_purchases_user_id on public.purchases (user_id);
create index if not exists idx_purchases_product_id on public.purchases (product_id);
create index if not exists idx_downloads_user_id on public.downloads (user_id);
create index if not exists idx_downloads_purchase_id on public.downloads (purchase_id);
