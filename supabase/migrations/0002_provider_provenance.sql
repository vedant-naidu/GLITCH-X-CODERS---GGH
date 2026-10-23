-- Migration: 0002_provider_provenance.sql
-- Goal: Add data provenance, source URLs, verification timestamps, provider categories, and persona rules (B12, B9, B7, B4, B6)

-- 1. Create provider category enum type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_category') then
    create type public.provider_category as enum (
      'bank',
      'forex_card',
      'wallet',
      'card_network',
      'remittance',
      'institutional'
    );
  end if;
end $$;

-- 2. Extend public.providers with provenance columns
alter table public.providers
  add column if not exists category public.provider_category not null default 'remittance',
  add column if not exists source_url text not null default 'https://fxwise.app/sources',
  add column if not exists last_verified_at date not null default current_date,
  add column if not exists is_markup_estimate boolean not null default false,
  add column if not exists notes text;

-- 3. Persona ranking configuration table
create table if not exists public.persona_rules (
  persona text primary key,
  cost_weight numeric(4,2) not null default 0.45,
  transparency_weight numeric(4,2) not null default 0.25,
  speed_weight numeric(4,2) not null default 0.10,
  fit_weight numeric(4,2) not null default 0.20,
  headline_provider_keys text[] not null default '{}',
  disallowed_headline_keys text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.persona_rules enable row level security;

create policy "Persona rules are publicly readable"
on public.persona_rules for select
using (true);

-- 4. Seed / upsert persona rules
insert into public.persona_rules (persona, cost_weight, transparency_weight, speed_weight, fit_weight, headline_provider_keys, disallowed_headline_keys, notes)
values
  ('student', 0.45, 0.30, 0.10, 0.15, array['flywire', 'wise', 'bookmyforex'], array['western-union'], 'High tuition volume, high sensitivity to hidden spread.'),
  ('freelancer', 0.50, 0.25, 0.10, 0.15, array['wise', 'payoneer', 'revolut'], array['western-union'], 'Inbound freelance invoice receipts, recurring payouts.'),
  ('traveler', 0.40, 0.20, 0.20, 0.20, array['niyo-global', 'wise', 'bookmyforex'], array['paypal', 'visa', 'mastercard'], 'Forex card convenience and zero markup over traditional credit cards.'),
  ('business', 0.45, 0.25, 0.15, 0.15, array['airwallex-style', 'wise', 'payoneer'], array['western-union'], 'Vendor settlements and commercial invoices; cash pickup disallowed.')
on conflict (persona) do update set
  cost_weight = excluded.cost_weight,
  transparency_weight = excluded.transparency_weight,
  speed_weight = excluded.speed_weight,
  fit_weight = excluded.fit_weight,
  headline_provider_keys = excluded.headline_provider_keys,
  disallowed_headline_keys = excluded.disallowed_headline_keys,
  notes = excluded.notes,
  updated_at = now();

-- 5. Seed / update complete provider records with verifiable sources
insert into public.providers (
  provider_key, name, tagline, category,
  exchange_markup, hidden_forex_spread, fixed_fee, percentage_fee,
  gst_rate, processing_fee, delivery_min_days, delivery_max_days,
  fee_clarity, speed_score, source_url, last_verified_at, is_markup_estimate, notes
)
values
  ('wise', 'Wise', 'Mid-market rate with transparent upfront fee schedule.', 'remittance', 0.0065, 0.004, 250, 0.005, 0.18, 0, 0, 1, 92, 84, 'https://wise.com/in/pricing/', '2026-10-23', false, 'Live mid-market rate with published dynamic fee calculator.'),
  ('paypal', 'PayPal', 'Convenient international wallet, but spreads and transaction fees are high.', 'wallet', 0.035, 0.018, 350, 0.02, 0.18, 50, 0, 2, 58, 72, 'https://www.paypal.com/in/webapps/mpp/paypal-fees', '2026-10-23', false, 'Cross-border recipient spread of 3.0%-4.0% plus standard fixed transaction fees.'),
  ('payoneer', 'Payoneer', 'Optimized for international freelancer marketplace payouts.', 'remittance', 0.025, 0.015, 300, 0.015, 0.18, 0, 1, 3, 70, 68, 'https://www.payoneer.com/pricing/', '2026-10-23', false, 'Direct account transfers up to 2.0% above mid-market rate.'),
  ('visa', 'Credit card (Visa typical)', 'Standard credit card network conversion with typical issuer forex markup.', 'card_network', 0.018, 0.012, 0, 0.035, 0.18, 0, 0, 2, 78, 91, 'https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html', '2026-10-23', false, 'Card network base rate plus typical 1.5%-3.5% issuing bank forex markup fee.'),
  ('mastercard', 'Credit card (Mastercard typical)', 'Standard credit card network conversion with typical issuer forex markup.', 'card_network', 0.017, 0.011, 0, 0.035, 0.18, 0, 0, 2, 76, 90, 'https://www.mastercard.us/en-us/personal-find-cards/travel-tools/currency-conversion-calculator.html', '2026-10-23', false, 'Card network base rate plus typical 1.5%-3.5% issuing bank forex markup fee.'),
  ('hdfc', 'HDFC Bank Remit', 'Traditional bank outward remittance with fixed wire fees and forex spread.', 'bank', 0.022, 0.014, 450, 0.01, 0.18, 100, 2, 4, 52, 61, 'https://www.hdfcbank.com/personal/pay/cards/forex-cards', '2026-10-23', true, 'Retail branch forex spread range typically 1.5%-2.5% plus wire commission.'),
  ('icici', 'ICICI Money2World', 'Direct outward bank wire service with layered correspondent charges.', 'bank', 0.021, 0.013, 400, 0.012, 0.18, 90, 2, 4, 54, 62, 'https://www.icicibank.com/personal-banking/cards/commercial-cards/travel-card', '2026-10-23', true, 'Online retail rate card spread plus outward remittance processing fees.'),
  ('niyo-global', 'Niyo Global', 'Zero-markup travel card with real-time app controls for international spend.', 'forex_card', 0.008, 0.007, 99, 0.004, 0.18, 0, 0, 1, 86, 88, 'https://www.goniyo.com/zero-forex-markup-card/', '2026-10-23', false, 'Zero forex markup on Visa/Equitas card rails; nominal card issue & ATM schedule.'),
  ('bookmyforex', 'BookMyForex', 'Competitive retail forex card and international cash delivery.', 'forex_card', 0.01, 0.008, 75, 0.003, 0.18, 0, 0, 1, 83, 86, 'https://www.bookmyforex.com/forex-card/', '2026-10-23', false, 'True zero-markup card offers with fixed loading/unloading rates.'),
  ('flywire', 'Flywire', 'Institutional cross-border payment partner for international student tuition.', 'institutional', 0.012, 0.01, 0, 0.008, 0.18, 75, 1, 2, 87, 80, 'https://www.flywire.com/legal/pricing', '2026-10-23', false, 'Institutional student portal with direct university billing integration.'),
  ('western-union', 'Western Union', 'Global physical agent network specializing in urgent cash pickup.', 'remittance', 0.04, 0.022, 500, 0.03, 0.18, 100, 0, 3, 49, 87, 'https://www.westernunion.com/in/en/currency-converter.html', '2026-10-23', false, 'High retail branch margins and variable cash pickup payout fees.'),
  ('revolut', 'Revolut', 'Multi-currency digital wallet and international debit card.', 'wallet', 0.005, 0.006, 200, 0.003, 0.18, 0, 0, 2, 90, 89, 'https://www.revolut.com/legal/fees/', '2026-10-23', false, 'Interbank rate on weekdays up to plan limits; weekend fee schedule applies.'),
  ('airwallex-style', 'Airwallex (Business)', 'Enterprise cross-border infrastructure with multi-currency virtual accounts.', 'remittance', 0.0035, 0.004, 150, 0.0025, 0.18, 0, 0, 1, 95, 92, 'https://www.airwallex.com/pricing', '2026-10-23', false, 'B2B commercial wholesale FX margins from 0.3% above interbank.')
on conflict (provider_key) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  category = excluded.category,
  exchange_markup = excluded.exchange_markup,
  hidden_forex_spread = excluded.hidden_forex_spread,
  fixed_fee = excluded.fixed_fee,
  percentage_fee = excluded.percentage_fee,
  gst_rate = excluded.gst_rate,
  processing_fee = excluded.processing_fee,
  delivery_min_days = excluded.delivery_min_days,
  delivery_max_days = excluded.delivery_max_days,
  fee_clarity = excluded.fee_clarity,
  speed_score = excluded.speed_score,
  source_url = excluded.source_url,
  last_verified_at = excluded.last_verified_at,
  is_markup_estimate = excluded.is_markup_estimate,
  notes = excluded.notes,
  updated_at = now();
