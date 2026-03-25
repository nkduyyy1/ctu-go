create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists email_verified boolean not null default false,
  add column if not exists bio text,
  add column if not exists campus text,
  add column if not exists faculty text,
  add column if not exists year text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists discovery_opt_in boolean not null default false;

create table if not exists public.email_otp_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  purpose text not null default 'verify_email',
  expires_at timestamptz not null,
  max_attempts integer not null default 5,
  attempt_count integer not null default 0,
  is_active boolean not null default true,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_otp_tokens_email_purpose
  on public.email_otp_tokens (email, purpose);

create index if not exists idx_email_otp_tokens_active
  on public.email_otp_tokens (is_active, expires_at desc);

create table if not exists public.user_swipes (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_user_id, target_user_id)
);

create index if not exists idx_user_swipes_target_user_id
  on public.user_swipes (target_user_id);

create table if not exists public.user_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  matched_at timestamptz not null default now(),
  check (user_a <> user_b),
  unique (user_a, user_b)
);

create index if not exists idx_user_matches_user_a on public.user_matches (user_a);
create index if not exists idx_user_matches_user_b on public.user_matches (user_b);

create or replace function public.ctu_my_campus()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select campus from public.profiles where id = auth.uid() limit 1;
$$;

revoke all on function public.ctu_my_campus() from public;
grant execute on function public.ctu_my_campus() to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "ctu_profiles_select" on public.profiles;
drop policy if exists "ctu_profiles_insert" on public.profiles;
drop policy if exists "ctu_profiles_update" on public.profiles;

create policy "ctu_profiles_select"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (
    discovery_opt_in is true
    and campus is not null
    and campus = public.ctu_my_campus()
    and public.ctu_my_campus() is not null
  )
);

create policy "ctu_profiles_insert"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "ctu_profiles_update"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
