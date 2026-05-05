-- Muel Supabase RLS policies
-- This file documents the intended public read model for Weave.
-- It is safe to run repeatedly from the Supabase SQL Editor.

alter table public.dreams enable row level security;
alter table public.dream_connections enable row level security;
alter table public.service_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dreams'
      and policyname = 'Public dreams are readable'
  ) then
    create policy "Public dreams are readable"
      on public.dreams
      for select
      using (visibility in ('anonymous', 'public'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dream_connections'
      and policyname = 'Public dream connections are readable'
  ) then
    create policy "Public dream connections are readable"
      on public.dream_connections
      for select
      using (
        exists (
          select 1
          from public.dreams a
          join public.dreams b on b.id = dream_connections.dream_b
          where a.id = dream_connections.dream_a
            and a.visibility in ('anonymous', 'public')
            and b.visibility in ('anonymous', 'public')
        )
      );
  end if;
end $$;

-- service_events is server-only.
-- Keep RLS enabled and intentionally create no anon/authenticated policy.
