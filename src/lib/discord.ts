import { DiscordSDK } from "@discord/embedded-app-sdk";
import { appFetch } from "@/lib/app-fetch";

export type DiscordUser = {
  id: string;
  username: string;
  avatar: string | null;
};

export type DiscordSession = {
  sdk: DiscordSDK;
  user: DiscordUser | null;
};

let _session: DiscordSession | null = null;

export function isInsideDiscord(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.search;
  return p.includes("frame_id") || p.includes("instance_id");
}

export async function initDiscord(): Promise<DiscordSession | null> {
  if (!isInsideDiscord()) return null;
  if (_session) return _session;

  const sdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);
  await sdk.ready();

  let user: DiscordUser | null = null;
  try {
    const { code } = await sdk.commands.authorize({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify"],
    });

    const res = await appFetch("/api/discord/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const { access_token } = await res.json();

    const auth = await sdk.commands.authenticate({ access_token });
    user = {
      id: auth.user.id,
      username: auth.user.username,
      avatar: auth.user.avatar ?? null,
    };
  } catch {
    // auth failed — run in anonymous mode
  }

  _session = { sdk, user };
  return _session;
}
