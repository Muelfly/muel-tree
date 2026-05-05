-- First-class Muel profile layer.
-- Discord and Toss identities can point to one durable Muel profile.

create table if not exists public.muel_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.muel_profiles enable row level security;

create table if not exists public.muel_profile_identities (
  profile_id uuid not null references public.muel_profiles(id) on delete cascade,
  provider text not null,
  provider_user_id text not null,
  username text,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider, provider_user_id),
  constraint muel_profile_identities_provider_check check (provider in ('discord', 'toss'))
);

alter table public.muel_profile_identities enable row level security;

create index if not exists muel_profile_identities_profile_id_idx
  on public.muel_profile_identities(profile_id);

alter table public.dreams
  add column if not exists muel_profile_id uuid references public.muel_profiles(id) on delete set null;

alter table public.service_events
  add column if not exists muel_profile_id uuid references public.muel_profiles(id) on delete set null;

create index if not exists dreams_muel_profile_id_idx
  on public.dreams(muel_profile_id);

create index if not exists service_events_muel_profile_id_idx
  on public.service_events(muel_profile_id);

create or replace function public.touch_muel_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_muel_profiles_updated_at on public.muel_profiles;
create trigger touch_muel_profiles_updated_at
  before update on public.muel_profiles
  for each row
  execute function public.touch_muel_profile_updated_at();

drop trigger if exists touch_muel_profile_identities_updated_at on public.muel_profile_identities;
create trigger touch_muel_profile_identities_updated_at
  before update on public.muel_profile_identities
  for each row
  execute function public.touch_muel_profile_updated_at();
