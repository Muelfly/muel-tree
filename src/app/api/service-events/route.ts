import { NextRequest, NextResponse } from "next/server";
import { forbiddenOrigin, isAllowedOrigin, requireDiscordUser } from "@/lib/request-security";
import { logServiceEvent, normalizeActivityContext } from "@/lib/service-events";

const allowedServices = new Set(["muel", "gomdori", "weave", "server"]);
const allowedEvents = new Set(["opened", "submitted", "failed"]);

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return forbiddenOrigin();
  }

  const discordAuth = await requireDiscordUser(req);
  if (!discordAuth.ok) {
    return discordAuth.response;
  }

  let body: {
    serviceSlug?: string;
    eventType?: string;
    route?: string;
    context?: unknown;
    metadata?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const serviceSlug = typeof body.serviceSlug === "string" ? body.serviceSlug : "";
  const eventType = typeof body.eventType === "string" ? body.eventType : "";
  if (!allowedServices.has(serviceSlug) || !allowedEvents.has(eventType)) {
    return NextResponse.json({ error: "invalid service event" }, { status: 400 });
  }

  await logServiceEvent({
    serviceSlug,
    eventType,
    route: typeof body.route === "string" ? body.route : null,
    discordUser: discordAuth.user,
    context: normalizeActivityContext(body.context),
    metadata: body.metadata ?? {},
  });

  return NextResponse.json({ ok: true });
}
