import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey, insertGeminiOperation, requireGeminiCaller } from "@/lib/gemini-ops";

export const runtime = "nodejs";

type VideoRequest = {
  prompt?: string;
  aspectRatio?: "16:9" | "9:16";
  resolution?: "720p" | "1080p";
  durationSeconds?: 4 | 6 | 8;
  negativePrompt?: string;
};

export async function POST(req: NextRequest) {
  const caller = await requireGeminiCaller(req);
  if (!caller.ok) return caller.response;

  let body: VideoRequest;
  try {
    body = (await req.json()) as VideoRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt || prompt.length < 8) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const model = process.env.GEMINI_VIDEO_MODEL ?? "veo-3.1-generate-preview";
  const config = {
    aspectRatio: body.aspectRatio ?? "16:9",
    resolution: body.resolution ?? "720p",
    durationSeconds: body.durationSeconds ?? 8,
    negativePrompt: body.negativePrompt?.trim() || undefined,
  };
  const requestBody = {
    instances: [{ prompt }],
    parameters: config,
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": getGeminiApiKey(),
    },
    body: JSON.stringify(requestBody),
  });
  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  const operationName = typeof data.name === "string" ? data.name : null;
  if (!operationName) {
    return NextResponse.json({ error: "Gemini did not return an operation name", response: data }, { status: 502 });
  }

  const row = await insertGeminiOperation({
    kind: "video",
    operationName,
    model,
    prompt,
    request: requestBody,
    discordUser: caller.discordUser,
  });

  return NextResponse.json({
    ok: true,
    operationName,
    operation: row,
    note: "Video generation is a long-running Gemini operation. Use the operation status endpoint or Gemini webhooks for completion.",
  });
}
