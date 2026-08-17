-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Te Atatū Boating Club — work-bay booking database (Supabase/Postgres) ║
-- ║  Run this once in the Supabase SQL editor for a new project.           ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ─── Members (the office maintains this list) ────────────────────────────
create table if not exists members (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  membership_number text not null,
  email             text,                 -- used for the member confirmation email
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Validation matches on lower(full_name) + membership_number where active.
create index if not exists idx_members_lookup
  on members (lower(full_name), membership_number)
  where active = true;

-- ─── Work bays (seed once; effectively config) ───────────────────────────
create table if not exists berths (
  id          int primary key,            -- 1..4 — the booking logic keys off THIS, never the name
  name        text not null,
  description text
);

-- ─── Bookings ────────────────────────────────────────────────────────────
create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  berth_id          int not null references berths(id),
  slot_date         date not null,
  slot_period       text not null default 'day',   -- 'day' (current) | future: 'am' | 'pm'
  member_id         uuid references members(id),
  member_name       text not null,        -- snapshot at booking time
  membership_number text not null,        -- snapshot at booking time
  status            text not null default 'confirmed',  -- 'confirmed' | 'cancelled'
  created_at        timestamptz not null default now()
);

-- CRITICAL: atomic double-booking prevention. A second confirmed booking for the
-- same bay + date + period is rejected by the DB (error 23505), even under a race.
create unique index if not exists uniq_active_slot
  on bookings (berth_id, slot_date, slot_period)
  where status = 'confirmed';

create index if not exists idx_bookings_window
  on bookings (slot_date)
  where status = 'confirmed';

-- ─── Seed the four work bays ─────────────────────────────────────────────
-- Interim names (via Barry 2026-08): no official names yet; bays 1 & 2 are on
-- the bridge side, 3 & 4 on the ramp side. Kept numbered so the order + the
-- large-vessel peg (bays 1 & 2) stay clear. The IDs 1..4 must stay stable.
-- NOTE: this seed only applies on a FRESH DB; the live DB already has rows, so
-- update it with the UPDATE statements below (run once), then re-confirm the
-- real names with Dan when the committee settles them.
insert into berths (id, name, description) values
  (1, 'Bay 1 (Bridgeside)', 'Bridge side of the yard.'),
  (2, 'Bay 2 (Bridgeside)', 'Bridge side of the yard.'),
  (3, 'Bay 3 (Rampside)', 'Ramp side of the yard.'),
  (4, 'Bay 4 (Rampside)', 'Ramp side of the yard.')
on conflict (id) do nothing;

-- Run ONCE against the live booking DB (the seed above is no-op there):
--   update berths set name = 'Bay 1 (Bridgeside)', description = 'Bridge side of the yard.' where id = 1;
--   update berths set name = 'Bay 2 (Bridgeside)', description = 'Bridge side of the yard.' where id = 2;
--   update berths set name = 'Bay 3 (Rampside)',   description = 'Ramp side of the yard.'   where id = 3;
--   update berths set name = 'Bay 4 (Rampside)',   description = 'Ramp side of the yard.'   where id = 4;

-- ─── Loading the membership list ─────────────────────────────────────────
-- Option A: Supabase Dashboard → Table editor → members → Import data from CSV.
--   Columns expected: full_name, membership_number, email (active defaults true).
-- Option B: SQL insert, e.g.
--   insert into members (full_name, membership_number, email) values
--     ('Jane Smith', '1234', 'jane@example.com');
--
-- TODO: get the membership CSV export from Dan/Skedda (with emails for member
-- confirmation messages) and load it here.

-- ─── Row Level Security ──────────────────────────────────────────────────
-- All access goes through Netlify Functions using the SERVICE ROLE / secret key.
-- We keep RLS enabled with NO public policies so the anon/public key cannot read
-- or write these tables directly.
alter table members  enable row level security;
alter table berths   enable row level security;
alter table bookings enable row level security;

-- ─── Grants for the booking functions' role ───────────────────────────────
-- The functions connect with the service/secret key (service_role). If the
-- project was created with "Automatically expose new tables" DISABLED
-- (recommended — keeps the public anon API out of these tables), service_role
-- needs explicit grants too. anon/authenticated are intentionally NOT granted.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
