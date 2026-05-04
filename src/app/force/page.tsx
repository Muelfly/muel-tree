"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import type { WeaveNode as DreamNode, WeaveEdge as DreamEdge } from "@/types";
import { applyForceLayout3D } from "@/lib/force3d";

const WeaveCanvas = dynamic(() => import("@/components/WeaveCanvas"), {
  ssr: false,
});

const COLORS = [
  "#fbbf24", "#818cf8", "#34d399", "#f472b6",
  "#60a5fa", "#fb923c", "#a78bfa", "#38bdf8",
];

function randomInSphere(r: number) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const rad = r * Math.cbrt(Math.random());
  return {
    x: rad * Math.sin(phi) * Math.cos(theta),
    y: rad * Math.sin(phi) * Math.sin(theta),
    z: rad * Math.cos(phi),
  };
}

export default function ForcePage() {
  const [nodes, setNodes] = useState<DreamNode[]>([]);
  const [edges, setEdges] = useState<DreamEdge[]>([]);
  const [count, setCount] = useState(12);

  const generate = useCallback(() => {
    const newNodes: DreamNode[] = Array.from({ length: count }, (_, i) => ({
      id: `n${i}`,
      label: `Dream ${i}`,
      ...randomInSphere(15),
      vx: 0, vy: 0, vz: 0,
      color: COLORS[i % COLORS.length],
      radius: 0.5,
    }));

    const newEdges: DreamEdge[] = [];
    for (let i = 1; i < count; i++) {
      newEdges.push({ source: `n${Math.floor(Math.random() * i)}`, target: `n${i}`, similarity: 0.5 + Math.random() * 0.5 });
    }
    for (let i = 0; i < Math.floor(count * 0.3); i++) {
      const a = Math.floor(Math.random() * count);
      const b = Math.floor(Math.random() * count);
      if (a !== b) newEdges.push({ source: `n${a}`, target: `n${b}`, weight: 0.5, similarity: Math.random() });
    }

    const laid = applyForceLayout3D(newNodes, newEdges, 150);
    setNodes(laid);
    setEdges(newEdges);
  }, [count]);

  return (
    <div className="w-screen h-screen bg-[#050508] relative overflow-hidden">
      <WeaveCanvas nodes={nodes} edges={edges} newNodeIds={new Set()} onNodeClick={() => {}} />
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 px-5 py-3 rounded-xl backdrop-blur-sm">
        <label className="text-gray-400 text-sm flex items-center gap-2">
          노드
          <input
            type="range" min={3} max={60} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="accent-indigo-500 w-24"
          />
          <span className="text-white font-mono w-4">{count}</span>
        </label>
        <button
          onClick={generate}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          생성
        </button>
      </div>
    </div>
  );
}
