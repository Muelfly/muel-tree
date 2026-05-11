create table if not exists public.gemini_operations (
  id uuid primary key default gen_random_uuid(),
  operation_name text not null unique,
  operation_type text not null check (operation_type in ('video', 'batch', 'interaction')),
  status text not null default 'submitted' check (status in ('submitted', 'running', 'notified', 'completed', 'failed', 'cancelled')),
  model text not null,
  prompt text,
  request jsonb not null default '{}'::jsonb,
  response jsonb,
  error jsonb,
  created_by_discord_user_id text,
  created_by_discord_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.gemini_operations enable row level security;

create index if not exists gemini_operations_status_created_idx
  on public.gemini_operations(status, created_at desc);

create index if not exists gemini_operations_discord_user_idx
  on public.gemini_operations(created_by_discord_user_id, created_at desc);

drop trigger if exists touch_gemini_operations_updated_at on public.gemini_operations;
create trigger touch_gemini_operations_updated_at
  before update on public.gemini_operations
  for each row
  execute function public.set_updated_at();

create table if not exists public.gemini_webhook_events (
  webhook_id text primary key,
  event_type text not null,
  operation_name text,
  payload jsonb not null default '{}'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

alter table public.gemini_webhook_events enable row level security;

create index if not exists gemini_webhook_events_operation_idx
  on public.gemini_webhook_events(operation_name, received_at desc);

create index if not exists gemini_webhook_events_type_idx
  on public.gemini_webhook_events(event_type, received_at desc);

create table if not exists public.gemini_webhook_configs (
  id uuid primary key default gen_random_uuid(),
  webhook_name text not null unique,
  webhook_id text,
  uri text not null,
  subscribed_events text[] not null default '{}'::text[],
  signing_secret text,
  response jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gemini_webhook_configs enable row level security;

create index if not exists gemini_webhook_configs_active_idx
  on public.gemini_webhook_configs(active, created_at desc);

drop trigger if exists touch_gemini_webhook_configs_updated_at on public.gemini_webhook_configs;
create trigger touch_gemini_webhook_configs_updated_at
  before update on public.gemini_webhook_configs
  for each row
  execute function public.set_updated_at();
