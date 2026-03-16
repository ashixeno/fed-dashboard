-- ═══════════════════════════════════════════════════
-- Fed Rate Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Live rate data cache (auto-fetched every 5 min)
create table if not exists rate_data (
  id          bigserial primary key,
  series_id   text not null,        -- e.g. 'EFFR', 'SOFR', 'CPI', 'UNEMP'
  value       numeric(10,4) not null,
  date        date not null,
  source      text not null,        -- 'nyfed' | 'treasury' | 'bls'
  fetched_at  timestamptz default now(),
  unique(series_id, date)
);

-- 2. User annotations on charts
create table if not exists annotations (
  id          bigserial primary key,
  date        text not null,        -- YYYY-MM format
  label       text not null,
  color       text default '#8b6914',
  created_at  timestamptz default now()
);

-- 3. Alert history log
create table if not exists alert_history (
  id          bigserial primary key,
  type        text not null,        -- 'rateChange' | 'cpiSpike' | 'yieldInvert' | 'sofrStress'
  message     text not null,
  severity    text default 'warning', -- 'info' | 'warning' | 'danger' | 'success'
  triggered_at timestamptz default now()
);

-- 4. FOMC decisions (historical + future)
create table if not exists fomc_decisions (
  id          bigserial primary key,
  meeting_date date not null unique,
  decision    text not null,        -- 'HIKE' | 'CUT' | 'HOLD'
  bps         integer default 0,
  new_rate    text not null,
  vote        text,
  notes       text
);

-- 5. Dashboard settings (global config)
create table if not exists dashboard_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz default now()
);

-- ── Indexes ─────────────────────────────────────────
create index if not exists idx_rate_data_series on rate_data(series_id, date desc);
create index if not exists idx_annotations_date on annotations(date);
create index if not exists idx_alerts_triggered on alert_history(triggered_at desc);

-- ── Row Level Security (public read, authenticated write) ──
alter table rate_data       enable row level security;
alter table annotations     enable row level security;
alter table alert_history   enable row level security;
alter table fomc_decisions  enable row level security;

-- Public can read everything
create policy "public read rate_data"      on rate_data      for select using (true);
create policy "public read annotations"    on annotations    for select using (true);
create policy "public read alerts"         on alert_history  for select using (true);
create policy "public read fomc"           on fomc_decisions for select using (true);

-- Anyone can insert/update (dashboard is shared, no auth needed)
create policy "public insert annotations"  on annotations    for insert with check (true);
create policy "public delete annotations"  on annotations    for delete using (true);
create policy "public insert alerts"       on alert_history  for insert with check (true);
create policy "public insert rate_data"    on rate_data      for insert with check (true);
create policy "public upsert rate_data"    on rate_data      for update using (true);

-- ── Seed FOMC decisions ──────────────────────────────
insert into fomc_decisions (meeting_date, decision, bps, new_rate, vote) values
  ('2023-02-01', 'HIKE', 25,  '4.50–4.75%', '12–0'),
  ('2023-03-22', 'HIKE', 25,  '4.75–5.00%', '11–0'),
  ('2023-05-03', 'HIKE', 25,  '5.00–5.25%', '11–0'),
  ('2023-06-14', 'HOLD', 0,   '5.00–5.25%', '12–0'),
  ('2023-07-26', 'HIKE', 25,  '5.25–5.50%', '12–0'),
  ('2023-09-20', 'HOLD', 0,   '5.25–5.50%', '11–1'),
  ('2023-11-01', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2023-12-13', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-01-31', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-03-20', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-05-01', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-06-12', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-07-31', 'HOLD', 0,   '5.25–5.50%', '12–0'),
  ('2024-09-18', 'CUT',  -50, '4.75–5.00%', '11–1'),
  ('2024-11-07', 'CUT',  -25, '4.50–4.75%', '12–0'),
  ('2024-12-18', 'CUT',  -25, '4.25–4.50%', '12–0'),
  ('2025-01-29', 'HOLD', 0,   '4.25–4.50%', '12–0'),
  ('2025-03-19', 'HOLD', 0,   '4.25–4.50%', '12–0'),
  ('2025-05-07', 'HOLD', 0,   '4.25–4.50%', '12–0'),
  ('2025-06-18', 'HOLD', 0,   '4.25–4.50%', '12–0'),
  ('2025-07-30', 'HOLD', 0,   '4.25–4.50%', '12–0'),
  ('2025-09-17', 'CUT',  -25, '4.00–4.25%', '12–0'),
  ('2025-10-29', 'CUT',  -25, '3.75–4.00%', '12–0'),
  ('2025-12-10', 'CUT',  -25, '3.50–3.75%', '12–0'),
  ('2026-01-28', 'HOLD', 0,   '3.50–3.75%', '12–0'),
  ('2026-03-18', 'HOLD', 0,   '3.50–3.75%', '12–0')
on conflict (meeting_date) do nothing;
