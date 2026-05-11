import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { forbiddenOrigin, isAllowedOrigin, requireDiscordUser } from "@/lib/request-security";
import { getServerSupabase } from "@/lib/server-supabase";

export type GeminiOperationKind = "video" | "batch" | "interaction";

export type GeminiOperationInput = {
  kind: GeminiOperationKind;
  operationName: string;
  model: string;
  prompt?: string | null;
  request: Record<string, unknown>;
  discordUser?: {
    id: string;
    username: string | null;
    avatar: string | null;
  } | null;
};

export async function requireGeminiCaller(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return { ok: false as const, response: forbiddenOrigin() };
  }

  const configuredToken = process.env.GEMINI_INTERNAL_API_TOKEN?.trim();
  const auth = req.headers.get("authorization");
  const token = auth?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const tokenBuffer = Buffer.from(token ?? "");
  const configuredBuffer = Buffer.from(configuredToken ?? "");
  if (
    configuredToken &&
    token &&
    tokenBuffer.length === configuredBuffer.length &&
    crypto.timingSafeEqual(tokenBuffer, configuredBuffer)
  ) {
    return { ok: true as const, discordUser: null };
  }

  const discordAuth = await requireDiscordUser(req);
  if (discordAuth.ok) {
    return { ok: true as const, discordUser: discordAuth.user };
  }

  return {
    ok: false as const,
    response: NextResponse.json({ error: "gemini caller auth required" }, { status: 401 }),
  };
}

export async function insertGeminiOperation(input: GeminiOperationInput) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("gemini_operations")
    .upsert(
      {
        operation_name: input.operationName,
        operation_type: input.kind,
        status: "submitted",
        model: input.model,
        prompt: input.prompt ?? null,
        request: input.request,
        created_by_discord_user_id: input.discordUser?.id ?? null,
        created_by_discord_username: input.discordUser?.username ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "operation_name" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGeminiOperationFromWebhook(input: {
  operationName: string | null;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  if (!input.operationName) return;

  const status = input.eventType.includes("failed")
    ? "failed"
    : input.eventType.includes("succeeded") || input.eventType.includes("generated") || input.eventType.includes("completed")
      ? "completed"
      : "notified";

  const supabase = getServerSupabase();
  await supabase
    .from("gemini_operations")
    .update({
      status,
      response: input.payload,
      completed_at: status === "completed" || status === "failed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("operation_name", input.operationName);
}

export function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

export function extractGeminiOperationName(payload: Record<string, unknown>): string | null {
  const direct = payload.operationName ?? payload.operation_name ?? payload.name ?? payload.id;
  if (typeof direct === "string" && direct) return direct;

  const data = payload.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    const nestedName = nested.operationName ?? nested.operation_name ?? nested.name ?? nested.id;
    if (typeof nestedName === "string" && nestedName) return nestedName;
  }

  return null;
}

export function verifyStandardWebhook(input: {
  body: string;
  headers: Record<string, string>;
  secret: string;
}) {
  try {
    new Webhook(input.secret).verify(input.body, input.headers);
    return true;
  } catch {
    return false;
  }
}

export async function loadGeminiWebhookSecrets() {
  const configured = process.env.GEMINI_WEBHOOK_SECRET?.trim();
  const secrets = configured ? [configured] : [];

  try {
    const { data } = await getServerSupabase()
      .from("gemini_webhook_configs")
      .select("signing_secret")
      .eq("active", true)
      .not("signing_secret", "is", null);
    for (const row of data ?? []) {
      const secret = typeof row.signing_secret === "string" ? row.signing_secret.trim() : "";
      if (secret) secrets.push(secret);
    }
  } catch {
    // If the config table is unavailable, fall back to environment-only verification.
  }

  return Array.from(new Set(secrets));
}
