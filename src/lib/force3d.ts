import { WeaveNode as DreamNode, WeaveEdge as DreamEdge } from "@/types";

const REPULSION = 150;
const ATTRACTION = 0.03;
const DAMPING = 0.85;
const CENTER_GRAVITY = 0.008;
const MIN_DIST = 2;

export function applyForceLayout3D(
  nodes: DreamNode[],
  edges: DreamEdge[],
  iterations = 150
): DreamNode[] {
  const w = nodes.map((n) => ({ ...n }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < w.length; i++) {
      for (let j = i + 1; j < w.length; j++) {
        const dx = w[j].x - w[i].x;
        const dy = w[j].y - w[i].y;
        const dz = w[j].z - w[i].z;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), MIN_DIST);
        const f = REPULSION / (dist * dist);
        w[i].vx -= (dx / dist) * f;
        w[i].vy -= (dy / dist) * f;
        w[i].vz -= (dz / dist) * f;
        w[j].vx += (dx / dist) * f;
        w[j].vy += (dy / dist) * f;
        w[j].vz += (dz / dist) * f;
      }
    }

    // Spring attraction along edges
    const map = new Map(w.map((n) => [n.id, n]));
    for (const edge of edges) {
      const src = map.get(edge.source);
      const tgt = map.get(edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dz = tgt.z - src.z;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.001);
      const f = dist * ATTRACTION * (edge.weight ?? 1);
      src.vx += (dx / dist) * f;
      src.vy += (dy / dist) * f;
      src.vz += (dz / dist) * f;
      tgt.vx -= (dx / dist) * f;
      tgt.vy -= (dy / dist) * f;
      tgt.vz -= (dz / dist) * f;
    }

    // Weak gravity toward origin
    for (const n of w) {
      n.vx -= n.x * CENTER_GRAVITY;
      n.vy -= n.y * CENTER_GRAVITY;
      n.vz -= n.z * CENTER_GRAVITY;
    }

    // Integrate
    for (const n of w) {
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.vz *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;
    }
  }

  return w;
}
