# Game client modules

Phase 1 skeletons for the Mafia (`/game`) Activity. Authoritative game logic
lives in **muel-bot/supabase/functions/** (Edge Functions), not here.

## Files

- `api.ts` — Typed fetch wrappers for the Edge Function endpoints
  (auth-exchange, match-resolve, match-join, …). Only the auth-exchange and
  resolve/join signatures exist now; more will be added per Phase 1 §6c.
- `client.ts` — `getGameSupabase(gameJwt)` returns a Supabase client that
  authenticates Realtime + REST with the game JWT, so `mafia.*` RLS evaluates
  the current player correctly.

## Required env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAFIA_GAME_API_BASE_URL` — Edge Functions base URL.
  Production: `https://<project-ref>.functions.supabase.co`
  Local: `http://localhost:54321/functions/v1`

## Boot sequence (planned for /game/page.tsx)

```
ActivityLayout                         (already in place)
  └── initDiscord() returns session    (already in place)
        ↓
  authExchange({ discordAccessToken }) (placeholder, next session)
        ↓
  getGameSupabase(gameJwt)             (this module, ready)
        ↓
  resolveMatch({ discordChannelId })   (placeholder, next session)
        ↓
  joinMatch(matchId)                   (placeholder, next session)
        ↓
  subscribe to mafia.matches / events / phases / chats
        ↓
  render Lobby → RoleReveal → … based on match.status
```
