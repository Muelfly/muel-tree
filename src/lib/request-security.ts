import { NextRequest, NextResponse } from "next/server";

const localOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3015",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3015",
]);

export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  if (localOrigins.has(origin)) return true;
  if (process.env.NEXT_PUBLIC_SITE_URL && origin === process.env.NEXT_PUBLIC_SITE_URL) {
    return true;
  }
  if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
    return true;
  }
  return origin === "https://muel-tree.vercel.app";
}

export function forbiddenOrigin() {
  return NextResponse.json({ error: "forbidden origin" }, { status: 403 });
}

export async function requireDiscordUser(req: NextRequest): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const auth = req.headers.get("authorization");
  const match = auth?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      ok: false,
      response: NextResponse.json({ error: "discord auth required" }, { status: 401 }),
    };
  }

  const discordResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${match[1]}` },
    cache: "no-store",
  });

  if (!discordResponse.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid discord auth" }, { status: 401 }),
    };
  }

  const user = (await discordResponse.json()) as { id?: unknown };
  if (typeof user.id !== "string") {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid discord user" }, { status: 401 }),
    };
  }

  return { ok: true, userId: user.id };
}
