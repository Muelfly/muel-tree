import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyForceLayout3D } from "@/lib/force3d";
import type { WeaveNode as DreamNode, WeaveEdge as DreamEdge } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

// main_tag 문자열을 결정론적으로 팔레트 색상으로 매핑
const TAG_PALETTE = [
  "#f472b6", "#a78bfa", "#60a5fa", "#34d399",
  "#fbbf24", "#fb923c", "#f87171", "#38bdf8",
  "#818cf8", "#6ee7b7", "#c4b5fd", "#e879f9",
];

function tagColor(tag?: string): string {
  if (!tag) return "#818cf8";
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}

// emotions.length(1–4)를 반지름 0.7–1.4로 선형 매핑
function emotionRadius(emotions?: string[]): number {
  const count = Math.min(Math.max(emotions?.length ?? 1, 1), 4);
  return 0.7 + (count - 1) * 0.233; // 1→0.7, 2→0.933, 3→1.17, 4→1.4
}

function randomInSphere(r: number) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const rad = r * Math.cbrt(Math.random());
  return {
    x: rad * Math.sin(phi) * Math.cos(theta),
    y: rad * Math.sin(phi) * Math.sin(theta),
    z: rad * Math.cos(phi),
  };
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data: dreams, error: dreamsErr }, { data: connections }] =
    await Promise.all([
      supabase
        .from("dreams")
        .select("id, emotions, keywords, main_tag, created_at")
        .neq("visibility", "private")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("dream_connections")
        .select("dream_a, dream_b, similarity"),
    ]);

  if (dreamsErr) {
    return NextResponse.json({ error: dreamsErr.message }, { status: 500, headers: noStoreHeaders });
  }

  if (!dreams || dreams.length === 0) {
    return NextResponse.json({ nodes: [], edges: [] }, { headers: noStoreHeaders });
  }

  const nodes: DreamNode[] = dreams.map((d) => {
    const keywords = Array.isArray(d.keywords) ? d.keywords : [];
    const tag = d.main_tag ?? "";
    const label = tag
      ? [tag, ...keywords.slice(0, 2)].join(" · ")
      : keywords.slice(0, 3).join(" · ") || "꿈";
    return {
      id: d.id,
      label,
      ...randomInSphere(15),
      vx: 0,
      vy: 0,
      vz: 0,
      color: tagColor(d.main_tag),
      radius: emotionRadius(d.emotions),
      emotion: Array.isArray(d.emotions) ? d.emotions[0] : undefined,
      keywords,
    };
  });

  const edges: DreamEdge[] = (connections ?? []).map((c) => ({
    source: c.dream_a,
    target: c.dream_b,
    weight: c.similarity ?? 1,
    similarity: c.similarity ?? 0,
  }));

  const laid = applyForceLayout3D(nodes, edges, 150);

  return NextResponse.json({ nodes: laid, edges }, { headers: noStoreHeaders });
}
