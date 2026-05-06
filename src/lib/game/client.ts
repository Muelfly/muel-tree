// Game-aware Supabase client.
//
// The default `src/lib/supabase.ts` uses only the anon key, which is fine for
// public reads. The game uses RLS that depends on a JWT issued by the game
// server; this module wraps Supabase with that JWT injected so RLS sees the
// authenticated game user (mafia.users.id via auth.jwt()->>'sub').
//
// Note on schema: callers should use `.schema('mafia').from('matches')` to
// reach the mafia tables. We do not pin the client to schema 'mafia' globally
// because supabase-js types the schema as a generic parameter and pinning it
// here makes the SupabaseClient type incompatible with the default ones used
// elsewhere in the app.
//
// Phase 1 status: skeleton. The actual gameJwt fetch lives in the upcoming
// /api/game/auth/exchange (or directly in /game page via lib/game/api.ts).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let cached: { token: string; client: SupabaseClient } | null = null;

/**
 * Build a Supabase client that authenticates Realtime + REST with the given
 * game JWT. Returns the same instance if called again with the same token.
 *
 * Usage:
 *   const sb = getGameSupabase(jwt);
 *   const { data } = await sb.schema("mafia").from("matches").select("*");
 */
export function getGameSupabase(gameJwt: string): SupabaseClient {
  if (cached && cached.token === gameJwt) return cached.client;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${gameJwt}` },
    },
  });

  // Realtime auth: tell the channel server which JWT to verify against.
  client.realtime.setAuth(gameJwt);

  cached = { token: gameJwt, client };
  return client;
}

export function clearGameSupabase(): void {
  cached = null;
}
