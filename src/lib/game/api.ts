// Typed wrappers around the game server (Supabase Edge Functions) endpoints.
//
// Phase 1 status: skeleton. Endpoint URLs are read from
// NEXT_PUBLIC_MAFIA_GAME_API_BASE_URL (e.g. the deployed Supabase Edge Functions
// base, https://<project>.functions.supabase.co). Locally,
// `supabase functions serve` exposes them at http://localhost:54321/functions/v1.
//
// All endpoints below are placeholders; they reference functions that will be
// implemented in subsequent sessions.

const BASE = process.env.NEXT_PUBLIC_MAFIA_GAME_API_BASE_URL ?? "";

function endpoint(name: string): string {
  if (!BASE) {
    throw new Error("NEXT_PUBLIC_MAFIA_GAME_API_BASE_URL is not configured.");
  }
  return `${BASE.replace(/\/$/, "")}/${name}`;
}

async function postJson<TReq, TRes>(
  name: string,
  body: TReq,
  options: { gameJwt?: string; discordToken?: string } = {},
): Promise<TRes> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (options.gameJwt) {
    headers["authorization"] = `Bearer ${options.gameJwt}`;
  }
  if (options.discordToken) {
    headers["x-discord-token"] = options.discordToken;
  }

  const res = await fetch(endpoint(name), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`game api ${name} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as TRes;
}

// ────────────────────────────────────────────────────────────────────────────
// Auth exchange — Discord OAuth access token → mafia.users.id + game JWT.
// ────────────────────────────────────────────────────────────────────────────

export type AuthExchangeResult = {
  userId: string;          // mafia.users.id
  displayName: string;
  gameJwt: string;
  expiresAt: string;       // ISO
};

export async function authExchange(input: {
  discordAccessToken: string;
}): Promise<AuthExchangeResult> {
  return postJson<typeof input, AuthExchangeResult>("auth-exchange", input);
}

// ────────────────────────────────────────────────────────────────────────────
// Match lifecycle — placeholder signatures for the next session.
// ────────────────────────────────────────────────────────────────────────────

export type MatchSummary = {
  id: string;
  status: string;          // 'lobby' | 'role_assign' | ...
  hostUserId: string;
};

export async function resolveMatch(
  input: { discordChannelId: string },
  gameJwt: string,
): Promise<MatchSummary | null> {
  return postJson<typeof input, MatchSummary | null>("match-resolve", input, { gameJwt });
}

export async function joinMatch(
  matchId: string,
  gameJwt: string,
): Promise<MatchSummary> {
  return postJson<{ matchId: string }, MatchSummary>("match-join", { matchId }, { gameJwt });
}
