export interface WeaveNode {
  id: string
  label: string
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  color?: string
  radius?: number
  emotion?: string
  keywords?: string[]
}

export interface WeaveEdge {
  source: string
  target: string
  weight?: number     // force layout
  similarity: number  // edge 렌더링 (0–1)
}
