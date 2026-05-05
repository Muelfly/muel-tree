# Supabase Data Flow

Supabase is the shared state layer behind Muel services. The public product names stay simple, while Supabase stores service state and operational records.

## Current Tables In Use

### `dreams`

Used by Weave.

Observed fields from the app:

- `id`
- `content`
- `emotions`
- `keywords`
- `main_tag`
- `embedding`
- `visibility`
- `created_at`
- `service_slug`
- `discord_user_id`
- `discord_username`
- `discord_avatar`
- `discord_guild_id`
- `discord_channel_id`
- `discord_instance_id`

Current writes happen in `/api/dreams/submit` with the Supabase service role key.

Current reads happen in `/api/dreams` with the Supabase anon key.

### `dream_connections`

Used by Weave to connect similar dreams.

Observed fields from the app:

- `dream_a`
- `dream_b`
- `similarity`

### `sources`

Used by Muel Bot's `/구독` utility for YouTube video/community post subscriptions.

This remains a server-side utility table. It should not define the public Muel product structure.

### `service_events`

Used as the shared Muel service event log.

Observed fields from the app:

- `id`
- `service_slug`
- `event_type`
- `route`
- `discord_user_id`
- `discord_username`
- `discord_guild_id`
- `discord_channel_id`
- `discord_instance_id`
- `subject_id`
- `status`
- `metadata`
- `created_at`

Current writes happen from server routes with the Supabase service role key.

## Current Flow

```text
Discord Activity
  -> /weave
  -> /api/discord/token
  -> Discord OAuth token
  -> /api/dreams/submit
  -> Gemini extraction and embedding
  -> Supabase dreams
  -> Supabase match_dreams RPC
  -> Supabase dream_connections
  -> Supabase service_events
  -> Weave graph update
```

## Planned Flow

```text
Discord / Toss / Bot
  -> Muel service route
  -> Supabase service state
  -> Notion Agent publishing
  -> Team updates and public notices
```

## Ownership Rule

- Landing names live in `src/config/services.ts`.
- Runtime state lives in Supabase.
- Public publishing should later flow through the Notion Agent.
- Legacy bot data should not define new product structure.
