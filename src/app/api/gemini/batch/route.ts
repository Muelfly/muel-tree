import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey, insertGeminiOperation, requireGeminiCaller } from "@/lib/gemini-ops";

export const runtime = "nodejs";

type BatchRequest = {
  prompts?: string[];
  displayName?: string;
  model?: string;
};

export async function POST(req: NextRequest) {
  const caller = await requireGeminiCaller(req);
  if (!caller.ok) return caller.response;

  let body: BatchRequest;
  try {
    body = (await req.json()) as BatchRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const prompts = (body.prompts ?? []).map((prompt) => prompt.trim()).filter(Boolean);
  if (prompts.length === 0 || prompts.length > 20) {
    return NextResponse.json({ error: "send 1-20 prompts" }, { status: 400 });
  }

  const model = body.model?.trim() || process.env.GEMINI_BATCH_MODEL || "gemini-2.5-flash";
  const requestBody = {
    batch: {
      display_name: body.displayName?.trim() || "muel-batch",
      input_config: {
        requests: {
          requests: prompts.map((prompt, index) => ({
            request: {
              contents: [{ parts: [{ text: prompt }] }],
            },
            metadata: {
              key: `muel-${index + 1}`,
            },
          })),
        },
      },
    },
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchGenerateContent`, {
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
    return NextResponse.json({ error: "Gemini did not return a batch operation name", response: data }, { status: 502 });
  }

  const row = await insertGeminiOperation({
    kind: "batch",
    operationName,
    model,
    prompt: prompts.join("\n---\n").slice(0, 8000),
    request: requestBody,
    discordUser: caller.discordUser,
  });

  return NextResponse.json({
    ok: true,
    operationName,
    operation: row,
  });
}
