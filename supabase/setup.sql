-- Dental Diet Log — Supabase setup
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

-- Table -----------------------------------------------------------------

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  time text not null,
  meal_type text not null,
  description text not null default '',
  water text not null default '',
  note text not null default '',
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_date_idx on entries (date);

-- No auth in this app by design (anyone with the link can read/write),
-- so RLS policies allow the anon role full access — same trust model as
-- the old Apps Script deployment's "Anyone" access setting.
alter table entries enable row level security;

drop policy if exists "public read" on entries;
create policy "public read" on entries for select using (true);

drop policy if exists "public write" on entries;
create policy "public write" on entries for all using (true) with check (true);

-- Storage -----------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "public read photos" on storage.objects;
create policy "public read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "public write photos" on storage.objects;
create policy "public write photos"
  on storage.objects for all
  using (bucket_id = 'photos')
  with check (bucket_id = 'photos');
