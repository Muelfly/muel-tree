# Weave Operations

Weave is the first production candidate for the Muel `Discord <-> Toss` service model.

## Public Surface

- **Landing section**: `Weave` in `/`
- **Activity route**: `/weave`
- **Operating model**: `Discord <-> Toss`
- **Current status**: beta
- **State layer**: Supabase

## Operating Checklist

### Entry

- Discord Activity opens `/weave`.
- The page initializes the Discord Embedded App SDK.
- The page requests `identify` scope and exchanges the Discord auth code through `/api/discord/token`.
- The UI can still render existing graph data if Discord auth is unavailable.
- Writing is disabled unless Discord auth succeeds.

### Save

- The user writes a dream in the bottom input.
- `/api/dreams/submit` checks the request origin.
- `/api/dreams/submit` verifies the Discord access token against `https://discord.com/api/users/@me`.
- The server trims and validates dream content.
- Gemini extracts emotions, keywords, and a main tag.
- Gemini creates an embedding.
- Supabase stores the dream.
- Supabase stores Discord user and Activity context on the dream row when available.
- Supabase RPC `match_dreams` finds similar dreams.
- Supabase stores any dream connections.
- Supabase stores a `service_events` row for open, submit, or failed submit events.
- The client adds the new dream node to the visible graph.

### Error UX

- Existing graph read failures appear as a small top message.
- Unauthenticated users see `Discord only` instead of a working save shortcut.
- Submit errors stay inside the input panel.
- Server errors should remain generic enough to avoid leaking provider or database details.

### Release Gate

- `/weave` loads inside Discord desktop.
- `/weave` loads inside Discord mobile.
- Anonymous web visitors can view but cannot write.
- Authenticated Discord users can save one dream.
- Failed Gemini or Supabase calls show a readable failure message.
- The graph remains usable after a failed save.
- Build passes with no blocking type or lint errors.

## Next Data Decisions

- Decide whether `discord_user_id` should eventually map into a first-class Muel profile table.
- Decide whether `discord_guild_id` should become the primary community/session partition for Weave.
- Decide whether Toss user identity should map to the same future Muel profile table.
- Decide whether public graph reads should hide or redact raw `content` after beta.
