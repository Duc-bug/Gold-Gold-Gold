-- GoldSA Supabase schema
-- Paste this into the Supabase SQL Editor to recreate the tables used by the app.

create table if not exists public.gold_prices (
    id bigserial primary key,
    brand text not null,
    buy_price numeric(12,2) not null default 0,
    sell_price numeric(12,2) not null default 0,
    metal_type text not null default 'gold',
    region text not null default 'vietnam',
    currency text not null default 'VND',
    updated_at timestamptz not null default now()
);

alter table public.gold_prices
    add column if not exists metal_type text,
    add column if not exists region text,
    add column if not exists currency text,
    add column if not exists updated_at timestamptz;

update public.gold_prices
set
    metal_type = coalesce(metal_type, 'gold'),
    region = coalesce(region, 'vietnam'),
    currency = coalesce(currency, 'VND'),
    updated_at = coalesce(updated_at, now())
where metal_type is null
   or region is null
   or currency is null
   or updated_at is null;

alter table public.gold_prices
    alter column metal_type set default 'gold',
    alter column region set default 'vietnam',
    alter column currency set default 'VND',
    alter column updated_at set default now();

create table if not exists public.user_alerts (
    id bigserial primary key,
    user_id uuid references auth.users(id) on delete cascade,
    email text not null,
    target_price numeric(12,2) not null,
    region text not null default 'all',
    notify_email boolean not null default true,
    notify_browser boolean not null default false,
    is_triggered boolean not null default false,
    created_at timestamptz not null default now(),
    triggered_at timestamptz
);

alter table public.user_alerts
    add column if not exists user_id uuid,
    add column if not exists region text,
    add column if not exists notify_email boolean,
    add column if not exists notify_browser boolean,
    add column if not exists is_triggered boolean,
    add column if not exists created_at timestamptz,
    add column if not exists triggered_at timestamptz;

update public.user_alerts
set
    region = coalesce(region, 'all'),
    notify_email = coalesce(notify_email, true),
    notify_browser = coalesce(notify_browser, false),
    is_triggered = coalesce(is_triggered, false),
    created_at = coalesce(created_at, now())
where region is null
   or notify_email is null
   or notify_browser is null
   or is_triggered is null
   or created_at is null;

alter table public.user_alerts
    alter column region set default 'all',
    alter column notify_email set default true,
    alter column notify_browser set default false,
    alter column is_triggered set default false,
    alter column created_at set default now();

create index if not exists idx_gold_prices_updated_at on public.gold_prices(updated_at desc);
create index if not exists idx_gold_prices_region on public.gold_prices(region);
create index if not exists idx_gold_prices_metal_type on public.gold_prices(metal_type);

create index if not exists idx_user_alerts_user_id on public.user_alerts(user_id);
create index if not exists idx_user_alerts_email on public.user_alerts(email);
create index if not exists idx_user_alerts_region on public.user_alerts(region);
create index if not exists idx_user_alerts_is_triggered on public.user_alerts(is_triggered);
create index if not exists idx_user_alerts_created_at on public.user_alerts(created_at desc);

do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        if not exists (
            select 1
            from pg_publication_tables
            where pubname = 'supabase_realtime'
              and schemaname = 'public'
              and tablename = 'gold_prices'
        ) then
            alter publication supabase_realtime add table public.gold_prices;
        end if;
    end if;
end $$;