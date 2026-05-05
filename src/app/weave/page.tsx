"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WeaveEdge, WeaveNode } from "@/types";
import { appFetch, toErrorMessage } from "@/lib/app-fetch";
import { initDiscord, type DiscordUser } from "@/lib/discord";
import { DonateButton } from "@/components/DonateButton";

function submitErrorMessage(status: number, fallback?: string): string {
  if (status === 401) return "Discord 안에서 다시 열어주세요.";
  if (status === 403) return "허용된 경로에서만 저장할 수 있어요.";
  if (status === 400) return fallback ?? "내용을 조금 더 적어주세요.";
  return "지금은 저장하지 못했어요. 잠시 후 다시 시도해주세요.";
}

const TAG_PALETTE = [
  "#f472b6",
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#f87171",
  "#38bdf8",
  "#818cf8",
  "#6ee7b7",
  "#c4b5fd",
  "#e879f9",
];

function tagColor(tag?: string): string {
  if (!tag) return "#818cf8";
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}

function emotionRadius(emotions?: string[]): number {
  const count = Math.min(Math.max(emotions?.length ?? 1, 1), 4);
  return 0.7 + (count - 1) * 0.233;
}

const WeaveCanvas = dynamic(() => import("@/components/WeaveCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#070712]">
      <p className="text-gray-600 text-sm">Loading weave...</p>
    </div>
  ),
});

function randomSpawn(radius = 8) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius * 0.4 + Math.random() * radius * 0.6;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

export default function WeavePage() {
  const [nodes, setNodes] = useState<WeaveNode[]>([]);
  const [edges, setEdges] = useState<WeaveEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<WeaveNode | null>(null);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [hasDiscordAuth, setHasDiscordAuth] = useState(false);
  const discordAccessToken = useRef<string | null>(null);
  const activityContext = useRef<Record<string, string | null>>({});
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newNodeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    appFetch("/api/dreams")
      .then((r) => r.json())
      .then(({ nodes, edges, error }) => {
        if (error) {
          setError(error);
        } else {
          setNodes(nodes ?? []);
          setEdges(edges ?? []);
        }
      })
      .catch((e) => setError(toErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    initDiscord().then((session) => {
      if (session?.accessToken) {
        discordAccessToken.current = session.accessToken;
        setHasDiscordAuth(true);
        activityContext.current = session.context;
        appFetch("/api/service-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            serviceSlug: "weave",
            eventType: "opened",
            route: "/weave",
            context: session.context,
          }),
        }).catch(() => {});
      }
      if (session?.user) setDiscordUser(session.user);
    });
  }, []);

  const submit = useCallback(async () => {
    const content = text.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await appFetch("/api/dreams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(discordAccessToken.current
            ? { Authorization: `Bearer ${discordAccessToken.current}` }
            : {}),
        },
        body: JSON.stringify({
          content,
          visibility: "anonymous",
          context: activityContext.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(submitErrorMessage(res.status, data.error));
        return;
      }

      const { dream, extracted } = data;
      const newNode: WeaveNode = {
        id: dream.id,
        label: content.slice(0, 40),
        ...randomSpawn(),
        vx: 0,
        vy: 0,
        vz: 0,
        color: tagColor(extracted?.main_tag),
        radius: emotionRadius(extracted?.emotions),
        emotion: extracted?.emotions?.[0],
        keywords: extracted?.keywords,
      };

      setNodes((prev) => [...prev, newNode]);
      setNewNodeIds((prev) => new Set(prev).add(dream.id));
      setText("");

      clearTimeout(newNodeTimer.current);
      newNodeTimer.current = setTimeout(() => {
        setNewNodeIds((prev) => {
          const next = new Set(prev);
          next.delete(dream.id);
          return next;
        });
      }, 2500);
    } catch (e) {
      setSubmitError(
        toErrorMessage(e) || "지금은 저장하지 못했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  }, [text, submitting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <WeaveCanvas
        nodes={nodes}
        edges={edges}
        newNodeIds={newNodeIds}
        onNodeClick={setSelectedNode}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <p className="text-gray-600 text-sm">Loading dreams...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-900/60 text-red-300 text-xs px-4 py-2 rounded-lg pointer-events-none">
          {error}
        </div>
      )}

      {selectedNode && (
        <div
          className="absolute top-6 left-6 z-20 max-w-xs bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer"
          onClick={() => setSelectedNode(null)}
        >
          <p className="text-white/80 text-sm leading-relaxed">
            {selectedNode.label}
          </p>
          {selectedNode.emotion && (
            <p className="text-white/40 text-xs mt-1">
              {selectedNode.emotion}
            </p>
          )}
          {selectedNode.keywords && selectedNode.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedNode.keywords.map((k) => (
                <span
                  key={k}
                  className="text-white/30 text-[10px] border border-white/10 px-2 py-0.5 rounded-full"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <p className="text-white/20 text-[10px] mt-3">Click to close</p>
        </div>
      )}

      {discordUser && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
          {discordUser.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=32`}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-white/60 text-xs">{discordUser.username}</span>
        </div>
      )}

      <p className="absolute bottom-36 left-1/2 -translate-x-1/2 text-white/20 text-xs pointer-events-none select-none">
        {nodes.length > 0 ? `${nodes.length} dreams connected` : ""}
      </p>

      <DonateButton />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20">
        <div className="bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 shadow-xl">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a dream..."
            rows={2}
            disabled={submitting}
            className="w-full bg-transparent text-white/90 text-sm placeholder:text-white/20 resize-none outline-none leading-relaxed min-h-[2.5rem] max-h-40 overflow-y-auto"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-red-400/80 text-xs min-h-[1rem]">
              {submitError ?? ""}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-white/15 text-xs">
                {submitting ? "" : hasDiscordAuth ? "Enter" : "Discord only"}
              </span>
              <button
                onClick={submit}
                disabled={!text.trim() || submitting || !hasDiscordAuth}
                className="px-4 py-1.5 bg-indigo-500/70 hover:bg-indigo-400/70 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
              >
                {submitting ? "Analyzing..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
