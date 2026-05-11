import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey, requireGeminiCaller } from "@/lib/gemini-ops";
import { getServerSupabase } from "@/lib/server-supabase";

export const runtime = "nodejs";

const defaultEvents = [
  "batch.succeeded",
  "batch.failed",
  "batch.cancelled",
  "video.generated",
  "interaction.completed",
];

export async function GET(req: NextRequest) {
  const caller = await requireGeminiCaller(req);
  if (!caller.ok) return caller.response;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/webhooks", {
    headers: { "x-goog-api-key": getGeminiApiKey() },
    cache: "no-store",
  });
  const gemini = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    return NextResponse.json({ error: gemini }, { status: response.status });
  }

  const { data } = await getServerSupabase()
    .from("gemini_webhook_configs")
    .select("webhook_name, webhook_id, uri, subscribed_events, active, created_at, updated_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, gemini, stored: data ?? [] });
}

export async function POST(req: NextRequest) {
  const caller = await requireGeminiCaller(req);
  if (!caller.ok) return caller.response;

  let body: {
    name?: string;
    uri?: string;
    subscribedEvents?: string[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim() || "MuelGeminiWebhook";
  const uri = body.uri?.trim() || `${process.env.NEXT_PUBLIC_SITE_URL || "https://muel-tree.vercel.app"}/api/gemini/webhook`;
  const subscribedEvents = body.subscribedEvents?.length ? body.subscribedEvents : defaultEvents;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/webhooks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": getGeminiApiKey(),
    },
    body: JSON.stringify({
      name,
      uri,
      subscribed_events: subscribedEvents,
    }),
  });
  const gemini = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    return NextResponse.json({ error: gemini }, { status: response.status });
  }

  const signingSecret = typeof gemini.new_signing_secret === "string"
    ? gemini.new_signing_secret
    : typeof gemini.signingSecret === "string"
      ? gemini.signingSecret
      : null;
  const webhookId = typeof gemini.id === "string"
    ? gemini.id
    : typeof gemini.name === "string"
      ? gemini.name
      : null;

  const { error } = await getServerSupabase().from("gemini_webhook_configs").upsert(
    {
      webhook_name: name,
      webhook_id: webhookId,
      uri,
      subscribed_events: subscribedEvents,
      signing_secret: signingSecret,
      response: gemini,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "webhook_name" },
  );
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    webhook: {
      id: webhookId,
      name,
      uri,
      subscribedEvents,
      signingSecretStored: Boolean(signingSecret),
    },
  });
}
