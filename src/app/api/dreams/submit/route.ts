import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { forbiddenOrigin, isAllowedOrigin, requireDiscordUser } from "@/lib/request-security";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACT_PROMPT = `Analyze the following dream text. Return only one valid JSON object with no explanation, prose, or code block.

{
  "emotions": ["emotion1", "emotion2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "main_tag": "tag"
}

- emotions: 2 to 4 felt emotions, preferably concise Korean words when the dream text is Korean.
- keywords: 3 to 6 core concepts, symbols, people, places, or actions.
- main_tag: one concise representative tag.

Dream text:
{CONTENT}`;

interface ExtractResult {
  emotions: string[];
  keywords: string[];
  main_tag: string;
}

interface SimilarDream {
  id: string;
  similarity: number;
}

async function extractWithGemini(content: string): Promise<ExtractResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: EXTRACT_PROMPT.replace("{CONTENT}", content) }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 512,
      // @ts-expect-error: thinkingConfig is not in the installed TS defs yet.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const raw = result.response.text();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Could not find a JSON object in Gemini output: ${raw.slice(0, 200)}`);
  }

  const parsed = JSON.parse(match[0]) as ExtractResult;

  return {
    emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 4) : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 6) : [],
    main_tag: typeof parsed.main_tag === "string" ? parsed.main_tag : "",
  };
}

async function embedDream(content: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });
  const embeddingResult = await embeddingModel.embedContent(content);
  // Explicitly coerce each value with Number() to handle Float32Array at runtime
  return Array.from(embeddingResult.embedding.values, Number);
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return forbiddenOrigin();
  }

  const discordAuth = await requireDiscordUser(req);
  if (!discordAuth.ok) {
    return discordAuth.response;
  }

  let body: { content?: string; visibility?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 5) {
    return NextResponse.json(
      { error: "content must be at least 5 characters" },
      { status: 400 }
    );
  }
  if (content.length > 1200) {
    return NextResponse.json(
      { error: "content must be 1200 characters or fewer" },
      { status: 400 }
    );
  }

  let extracted: ExtractResult;
  try {
    extracted = await extractWithGemini(content);
  } catch {
    return NextResponse.json(
      { error: "AI extraction failed" },
      { status: 500 }
    );
  }

  let embedding: number[];
  try {
    embedding = await embedDream(content);
  } catch {
    return NextResponse.json(
      { error: "embedding generation failed" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      content,
      emotions: extracted.emotions,
      keywords: extracted.keywords,
      main_tag: extracted.main_tag,
      embedding: `[${embedding.join(',')}]`,
      visibility: body.visibility ?? "anonymous",
    })
    .select("id, content, emotions, keywords, main_tag, visibility, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: similar } = await supabase.rpc("match_dreams", {
    query_embedding: embedding,
    match_threshold: 0.65,
    match_count: 10,
    exclude_id: data.id,
  });

  const connections = ((similar ?? []) as SimilarDream[]).map((s) => ({
    dream_a: data.id,
    dream_b: s.id,
    similarity: s.similarity,
  }));

  if (connections.length > 0) {
    await supabase.from("dream_connections").insert(connections);
  }

  return NextResponse.json(
    { dream: data, extracted, connections_created: connections.length },
    { status: 201 }
  );
}
