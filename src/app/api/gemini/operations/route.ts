import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey, requireGeminiCaller } from "@/lib/gemini-ops";
import { getServerSupabase } from "@/lib/server-supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const caller = await requireGeminiCaller(req);
  if (!caller.ok) return caller.response;

  const operationName = req.nextUrl.searchParams.get("name");
  if (!operationName) {
    const { data, error } = await getServerSupabase()
      .from("gemini_operations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, operations: data ?? [] });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}`, {
    headers: {
      "x-goog-api-key": getGeminiApiKey(),
    },
    cache: "no-store",
  });
  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  const done = data.done === true;
  const status = done ? (data.error ? "failed" : "completed") : "running";
  await getServerSupabase()
    .from("gemini_operations")
    .update({
      status,
      response: data,
      completed_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("operation_name", operationName);

  return NextResponse.json({ ok: true, operationName, status, gemini: data });
}
