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
