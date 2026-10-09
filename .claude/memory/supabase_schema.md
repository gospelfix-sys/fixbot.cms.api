---
name: Supabase 테이블 스키마 (DDL)
description: statkit.cms.api 프로젝트의 실제 Supabase DDL — profiles·news·orders·portfolios·statkit_posts·statkit_products·statkit_content_api_configs·quote_submissions 테이블, 트리거·RLS·함수 포함. 002 마이그레이션으로 statkit_ prefix 테이블 추가됨.
type: reference
---
# Supabase Schema DDL (실제 DB 기준 — 2026-07-20 추출 / 2026-07-22 갱신)

> ⚠️ 2026-07-22 마이그레이션 변경사항 (`002_statkit_prefix_tables.sql`):
> - `content_api_configs`, `posts`, `products` 테이블 DROP (CASCADE)
> - `statkit_posts` (구 news 구조), `statkit_products`, `statkit_content_api_configs` 신규 생성
> - 코드 참조: `queries/posts.admin.ts` → `statkit_posts`, `queries/products.*.ts` → `statkit_products`, `queries/content-api-configs.ts` → `statkit_content_api_configs`
>
> **현재 활성 테이블**: profiles, news(블로그 레거시), orders, portfolios, quote_submissions, statkit_posts, statkit_products, statkit_content_api_configs

## 공통 트리거 함수

```sql
-- portfolios, products 트리거에서 사용
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- news 트리거에서 사용 (set_updated_at과 동일 동작, 별도 함수로 존재)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## 신규 가입 시 프로필 자동 생성

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## profiles 테이블

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        text not null default 'admin' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);
```

## news 테이블

```sql
-- 블로그/공지 대신 사용하는 실제 테이블 (코드에서는 'blog' resource slug로 매핑 예정)
create table public.news (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  summary       text,
  content       text,
  category      text check (category in ('업데이트', '신규 템플릿', '이벤트')),
  thumbnail_url text,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index news_sort_order_idx on public.news(sort_order);

create trigger news_updated_at
  before update on public.news
  for each row execute procedure public.handle_updated_at();

alter table public.news enable row level security;

create policy "published news readable by all"
  on public.news for select
  using (is_published = true);

create policy "admin can manage news"
  on public.news for all
  to authenticated
  using (true);
```

## orders 테이블

```sql
create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id),
  product_id  uuid references public.products(id),
  order_id    text not null unique,
  amount      integer not null,
  status      text not null default 'pending'
                check (status in ('pending', 'pending_confirm', 'paid', 'cancelled')),
  payment_key text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "users can read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own orders"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id);

-- 결제 상태 전환용 별도 정책 (pending → pending_confirm)
create policy "users_notify_payment"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending_confirm');
```

## portfolios 테이블

```sql
-- 실제 테이블명은 'portfolios' (단수형 'portfolio' 아님)
create table public.portfolios (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text,
  description   text,
  tags          text[] default '{}',
  thumbnail_url text,
  site_url      text,
  images        text[] default '{}',
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger portfolios_updated_at
  before update on public.portfolios
  for each row execute procedure public.set_updated_at();

alter table public.portfolios enable row level security;

create policy "공개 포트폴리오 조회 허용"
  on public.portfolios for select
  using (is_published = true);
```

## products 테이블

```sql
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  category      text,
  price         integer,
  thumbnail_url text,
  demo_url      text,
  includes      text[],
  file_path     text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  price_type    text not null default 'free' check (price_type in ('free', 'paid')),
  base_price    numeric(10, 2),
  options       jsonb,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_sort_order_idx on public.products(sort_order);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

alter table public.products enable row level security;

create policy "products_public_read"
  on public.products for select
  using (is_active = true);

create policy "authenticated full access"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

create policy "products_service_role_all"
  on public.products for all
  using (true);
```

## quote_submissions 테이블

```sql
-- 실제 테이블명은 'quote_submissions' (코드 resource slug는 'quotes')
create table public.quote_submissions (
  id                  uuid primary key default gen_random_uuid(),
  selected_categories text[],
  selected_items      jsonb,
  schedule            text,
  style_preferences   text[],
  target_age          text,
  contact_name        text not null,
  contact_value       text not null,
  contact_email       text not null,
  business_number     text,
  project_summary     text,
  reference_urls      text[],
  estimated_total     integer,
  ip_address          text,
  user_agent          text,
  referer             text,
  is_authenticated    boolean default false,
  utm_params          jsonb,
  shop_industry       text,
  shop_status         text,
  production_scope    text,
  required_features   text[],
  needs_system_dev    boolean default false,
  created_at          timestamptz default now()
);

alter table public.quote_submissions enable row level security;

create policy "Anyone can insert quote_submissions"
  on public.quote_submissions for insert
  with check (true);

create policy "Admin can read quote_submissions"
  on public.quote_submissions for select
  using ((auth.jwt() ->> 'role') = 'admin');
```

## content_api_configs 테이블 (미생성 — 동적 API 시스템 위해 생성 필요)

```sql
-- ⚠️ 이 테이블은 현재 DB에 존재하지 않음. 동적 REST API 토글 시스템 활성화 시 생성 필요.
-- resource_slug → 실제 테이블명 매핑 주의:
--   'blog'      → news 테이블 (is_published 필터)
--   'portfolio' → portfolios 테이블 (is_published 필터)
--   'quotes'    → quote_submissions 테이블
create table public.content_api_configs (
  id                uuid        primary key default gen_random_uuid(),
  resource_slug     text        not null unique,
  label             text        not null,
  table_name        text        not null,
  is_enabled        boolean     not null default false,
  filter_column     text,
  filter_value      text,
  filter_is_bool    boolean     not null default false,
  identifier_column text        not null default 'id',
  identifier_type   text        not null default 'uuid' check (identifier_type in ('uuid', 'text')),
  order_column      text        not null default 'created_at',
  order_direction   text        not null default 'desc' check (order_direction in ('asc', 'desc')),
  select_columns    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger content_api_configs_updated_at
  before update on public.content_api_configs
  for each row execute procedure public.set_updated_at();

alter table public.content_api_configs enable row level security;

create policy "admin full access" on public.content_api_configs
  for all to authenticated using (true) with check (true);

-- 시드 데이터 (실제 테이블명 매핑 적용)
insert into public.content_api_configs
  (resource_slug, label, table_name, is_enabled,
   filter_column, filter_value, filter_is_bool,
   identifier_column, identifier_type,
   order_column, order_direction, select_columns)
values
  ('blog',      '블로그',     'news',             true,
   'is_published', 'true', true,
   'slug', 'text', 'sort_order', 'asc',
   'id,title,slug,summary,content,category,thumbnail_url,is_published,sort_order,created_at'),
  ('products',  '상품',       'products',          true,
   'is_active', 'true', true,
   'id', 'uuid', 'sort_order', 'asc',
   'id,slug,name,description,category,thumbnail_url,demo_url,includes,price_type,base_price,options,created_at,updated_at'),
  ('portfolio', '포트폴리오', 'portfolios',         false,
   'is_published', 'true', true,
   'id', 'uuid', 'sort_order', 'asc',
   'id,title,category,description,tags,thumbnail_url,site_url,images,sort_order,created_at'),
  ('orders',    '주문',       'orders',             false, null, null, false, 'id', 'uuid', 'created_at', 'desc', null),
  ('quotes',    '견적 신청',  'quote_submissions',  false, null, null, false, 'id', 'uuid', 'created_at', 'desc', null),
  ('users',     '유저',       'profiles',           false, null, null, false, 'id', 'uuid', 'created_at', 'desc', null);
```

## 실행 순서 (신규 환경 세팅 시)

1. `set_updated_at()` 함수 생성
2. `handle_updated_at()` 함수 생성
3. `handle_new_user()` 함수 + `on_auth_user_created` 트리거 생성
4. `profiles` 테이블 + RLS
5. `products` 테이블 + 트리거 + RLS
6. `orders` 테이블 + RLS (products FK 참조하므로 products 이후)
7. `news` 테이블 + 트리거 + RLS
8. `portfolios` 테이블 + 트리거 + RLS
9. `quote_submissions` 테이블 + RLS
10. `content_api_configs` 테이블 + 트리거 + RLS + 시드 데이터

## 테이블명 vs resource_slug 매핑

| resource_slug | 실제 DB 테이블     | 관리 페이지 경로 |
|---------------|-------------------|-----------------|
| blog          | news              | /blog           |
| products      | products          | /products       |
| portfolio     | portfolios        | /portfolio      |
| orders        | orders            | /orders         |
| quotes        | quote_submissions | /quotes         |
| users         | profiles          | /users          |
