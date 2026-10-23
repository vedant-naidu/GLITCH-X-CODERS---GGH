create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  preferred_currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null unique,
  name text not null,
  tagline text,
  exchange_markup numeric(8,6) not null default 0,
  hidden_forex_spread numeric(8,6) not null default 0,
  fixed_fee numeric(12,2) not null default 0,
  percentage_fee numeric(8,6) not null default 0,
  gst_rate numeric(8,6) not null default 0,
  processing_fee numeric(12,2) not null default 0,
  delivery_min_days integer not null default 0,
  delivery_max_days integer not null default 1,
  fee_clarity integer not null default 0,
  speed_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  persona text not null,
  purpose text not null,
  source_currency text not null,
  destination_currency text not null,
  source_country text not null,
  destination_country text not null,
  amount numeric(14,2) not null,
  live_rate numeric(14,6) not null,
  best_provider_key text not null,
  savings numeric(14,2) not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  comparison_id uuid references public.comparisons (id) on delete cascade,
  label text not null,
  filters jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  provider_id uuid references public.providers (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, provider_id)
);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  comparison_id uuid references public.comparisons (id) on delete cascade,
  report_type text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.providers enable row level security;
alter table public.comparisons enable row level security;
alter table public.saved_searches enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_reports enable row level security;

create policy "Users can read their own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Providers are publicly readable"
on public.providers for select
using (true);

create policy "Users can read their own comparisons"
on public.comparisons for select
using (auth.uid() = user_id);

create policy "Users can insert their own comparisons"
on public.comparisons for insert
with check (auth.uid() = user_id);

create policy "Users can read their own saved searches"
on public.saved_searches for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved searches"
on public.saved_searches for insert
with check (auth.uid() = user_id);

create policy "Users can read their own favorites"
on public.favorites for select
using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
on public.favorites for insert
with check (auth.uid() = user_id);

create policy "Users can read their own saved reports"
on public.saved_reports for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved reports"
on public.saved_reports for insert
with check (auth.uid() = user_id);

insert into public.providers (provider_key, name, tagline, exchange_markup, hidden_forex_spread, fixed_fee, percentage_fee, gst_rate, processing_fee, delivery_min_days, delivery_max_days, fee_clarity, speed_score)
values
  ('wise', 'Wise', 'Clean pricing with strong rate transparency.', 0.0065, 0.004, 250, 0.005, 0.18, 0, 0, 1, 92, 84),
  ('paypal', 'PayPal', 'Convenient, but the spread is usually expensive.', 0.035, 0.018, 350, 0.02, 0.18, 50, 0, 2, 58, 72),
  ('flywire', 'Flywire', 'Optimized for tuition and institutional payments.', 0.012, 0.01, 0, 0.008, 0.18, 75, 1, 2, 87, 80)
on conflict (provider_key) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at before update on public.users for each row execute function public.touch_updated_at();

drop trigger if exists providers_touch_updated_at on public.providers;
create trigger providers_touch_updated_at before update on public.providers for each row execute function public.touch_updated_at();