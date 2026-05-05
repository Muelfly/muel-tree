import { createClient } from "@supabase/supabase-js";

export type ActivityContext = {
  guildId?: string | null;
  channelId?: string | null;
  instanceId?: string | null;
};

export type ServiceEventInput = {
  serviceSlug: string;
  eventType: string;
  route?: string | null;
  discordUser?: {
    id: string;
    username?: string | null;
  } | null;
  context?: ActivityContext | null;
  subjectId?: string | null;
  status?: "ok" | "error";
  metadata?: Record<string, unknown>;
};

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeActivityContext(value: unknown): ActivityContext {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  return {
    guildId: nullableText(input.guildId),
    channelId: nullableText(input.channelId),
    instanceId: nullableText(input.instanceId),
  };
}

export async function logServiceEvent(input: ServiceEventInput): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const context = input.context ?? {};
  const { error } = await supabase.from("service_events").insert({
    service_slug: input.serviceSlug,
    event_type: input.eventType,
    route: input.route ?? null,
    discord_user_id: input.discordUser?.id ?? null,
    discord_username: input.discordUser?.username ?? null,
    discord_guild_id: context.guildId ?? null,
    discord_channel_id: context.channelId ?? null,
    discord_instance_id: context.instanceId ?? null,
    subject_id: input.subjectId ?? null,
    status: input.status ?? "ok",
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.warn("[service-events] insert failed", error.message);
  }
}
