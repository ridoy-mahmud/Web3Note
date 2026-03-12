create table if not exists public.user_states (
  owner_id text primary key,
  state jsonb not null default '{"version":2,"notes":[]}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_states enable row level security;

drop policy if exists "Public can read user states" on public.user_states;
create policy "Public can read user states"
on public.user_states
for select
using (true);

drop policy if exists "Public can insert user states" on public.user_states;
create policy "Public can insert user states"
on public.user_states
for insert
with check (true);

drop policy if exists "Public can update user states" on public.user_states;
create policy "Public can update user states"
on public.user_states
for update
using (true)
with check (true);
