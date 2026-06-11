-- ============================================================
-- BITSS Prestige Realty — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- PROPERTIES
create table properties (
  id bigint generated always as identity primary key,
  name text not null,
  location text,
  location_short text,
  developer text,
  type text default 'offplan',
  emoji text default '🏢',
  phase text default 'Phase 1',
  handover text,
  price_aed numeric default 0,
  price_usd numeric default 0,
  gross_yield numeric default 0,
  capital_gain_5yr numeric default 0,
  capital_appreciation numeric default 0,
  annual_rental_usd numeric default 0,
  down_payment numeric default 10,
  distress boolean default false,
  hot boolean default false,
  our_offer text,
  sort_order integer default 0,
  image text,
  brochure text,
  reason text,
  usps text default '[]',
  hot_usps text default '[]',
  why text default '[]',
  payment_plan text default '[]',
  proj_values text default '[0,0,0,0,0,0]',
  unit_options text,
  deep_dive_data text default '{}',
  created_at timestamptz default now()
);

-- AGENTS
create table agents (
  id bigint generated always as identity primary key,
  name text not null,
  whatsapp text,
  phone text,
  email text,
  photo text,
  created_at timestamptz default now()
);

-- CLIENTS
create table clients (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  password text,
  budget numeric default 0,
  budget_label text default 'Phase 1 Budget',
  agent_id bigint references agents(id) on delete set null,
  assigned_properties jsonb default '[]',
  portfolio_heading text,
  portfolio_subheading text,
  brief_text text default 'Confidential Investment Brief · 2025',
  phase_heading text,
  video_url text,
  metric_1_label text,
  metric_1_value text,
  metric_2_label text,
  metric_2_value text,
  metric_3_label text,
  metric_3_value text,
  created_at timestamptz default now()
);

-- PROPOSALS
create table proposals (
  id bigint generated always as identity primary key,
  client_id bigint references clients(id) on delete cascade,
  client_name text,
  property_name text,
  property_ids jsonb default '[]',
  message text,
  status text default 'sent',
  created_at timestamptz default now()
);

-- CHAT HISTORY
create table chat_history (
  id bigint generated always as identity primary key,
  client_id bigint references clients(id) on delete cascade,
  role text not null,
  text text,
  created_at timestamptz default now()
);

-- ACTIVITY LOGS
create table activity_logs (
  id bigint generated always as identity primary key,
  client_id bigint references clients(id) on delete cascade,
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- SETTINGS (single row)
create table settings (
  id integer primary key default 1,
  google_api_key text default '',
  admin_password text default 'admin123'
);
insert into settings (id, google_api_key) values (1, '') on conflict do nothing;

-- ANALYTICS (single row)
create table analytics (
  id integer primary key default 1,
  total_views integer default 0,
  pdf_downloads integer default 0,
  proposals_requested integer default 0,
  client_views jsonb default '{}'
);
insert into analytics (id) values (1) on conflict do nothing;

-- Disable RLS (we use service_role key server-side, so this is safe)
alter table properties disable row level security;
alter table agents disable row level security;
alter table clients disable row level security;
alter table proposals disable row level security;
alter table chat_history disable row level security;
alter table activity_logs disable row level security;
alter table settings disable row level security;
alter table analytics disable row level security;
