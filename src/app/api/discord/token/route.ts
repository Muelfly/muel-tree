import { NextRequest, NextResponse } from "next/server";
import { forbiddenOrigin, isAllowedOrigin } from "@/lib/request-security";

/**
 * Per-Activity Discord OAuth credential lookup.
 *
 * Each Muel Activity is hosted by its own Discord application. The client
 * sends `activitySlug` in the request body so we can pick the matching
 * client_id / client_secret pair. Literal switch (not dynamic key access) so
 * NEXT_PUBLIC_* gets inlined at build time and server-only secrets never leak
 * to the bundle.
 */
function getDiscordCredentials(
  activitySlug: string,
): { clientId: string; clientSecret: string } | null {
  switch (activitySlug) {
    case "weave":
      return {
        clientId: process.env.NEXT_PUBLIC_WEAVE_DISCORD_CLIENT_ID ?? "",
        clientSecret: process.env.WEAVE_DISCORD_CLIENT_SECRET ?? "",
      };
    case "gomdori-mafia":
      return {
        clientId: process.env.NEXT_PUBLIC_GOMDORI_DISCORD_CLIENT_ID ?? "",
        clientSecret: process.env.GOMDORI_DISCORD_CLIENT_SECRET ?? "",
      };
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return forbiddenOrigin();
  }

  const body = (await req.json()) as { code?: string; activitySlug?: string };
  const { code, activitySlug } = body;
  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  if (!activitySlug) {
    return NextResponse.json(
      { error: "missing activitySlug" },
      { status: 400 },
    );
  }

  const creds = getDiscordCredentials(activitySlug);
  if (!creds) {
    return NextResponse.json(
      { error: `unknown activity "${activitySlug}"` },
      { status: 400 },
    );
  }
  if (!creds.clientId || !creds.clientSecret) {
    return NextResponse.json(
      { error: `Discord credentials not configured for "${activitySlug}"` },
      { status: 500 },
    );
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  return NextResponse.json({ access_token: data.access_token });
}
