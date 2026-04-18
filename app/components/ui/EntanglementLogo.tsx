'use client'
// Trefoil knot rendered from parametric equations.
// Parametric: x(t) = sin(t) + 2sin(2t), y(t) = cos(t) - 2cos(2t)
// Sampled at N points, converted to SVG cubic bezier path.
// Weaving achieved by splitting the stroke into segments and alternating z-order.

import { useMemo } from 'react'

interface Props {
  size?: number
  animate?: boolean
}

const N = 300  // sample resolution

function trefoilPoints(cx: number, cy: number, r: number) {
  const pts: { x: number; y: number; t: number }[] = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 * Math.PI
    const x = cx + r * (Math.sin(t) + 2 * Math.sin(2 * t)) / 3
    const y = cy + r * (Math.cos(t) - 2 * Math.cos(2 * t)) / 3
    pts.push({ x, y, t })
  }
  return pts
}

// Build SVG polyline "d" string from a slice of points
function segmentD(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

// Determine if point at parameter t is "over" or "under" at each crossing.
// For the trefoil, crossings occur near t = π/3, π, 5π/3 (every 2π/3).
// We split the path into 6 alternating segments: over, under, over, under, over, under.
function buildSegments(pts: { x: number; y: number; t: number }[]) {
  // 6 crossing boundaries evenly spaced
  const boundaries = [0, 1, 2, 3, 4, 5, 6].map(i => (i / 6) * 2 * Math.PI)
  const segments: { pts: { x: number; y: number }[]; over: boolean }[] = []

  for (let seg = 0; seg < 6; seg++) {
    const tStart = boundaries[seg]
    const tEnd   = boundaries[seg + 1]
    const slice  = pts.filter(p => p.t >= tStart && p.t <= tEnd)
    // Overlap slightly at edges for seamless joins
    const prev = pts.find(p => p.t >= tStart - 0.05 && p.t < tStart)
    const next = pts.find(p => p.t > tEnd && p.t <= tEnd + 0.05)
    const full = [...(prev ? [prev] : []), ...slice, ...(next ? [next] : [])]
    segments.push({ pts: full, over: seg % 2 === 0 })
  }
  return segments
}

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  const cx = 50, cy = 50, r = 42

  const pts = useMemo(() => trefoilPoints(cx, cy, r), [])
  const segments = useMemo(() => buildSegments(pts), [pts])

  const underSegs = segments.filter(s => !s.over)
  const overSegs  = segments.filter(s => s.over)

  const id = (s: string) => `el-${s}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'el-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* Metallic chrome stroke gradient */}
        <linearGradient id={id('chrome')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.85)"/>
          <stop offset="30%"  stopColor="#c4b8e8"/>
          <stop offset="60%"  stopColor="#a855f7"/>
          <stop offset="100%" stopColor="rgba(20,10,40,0.7)"/>
        </linearGradient>

        {/* Specular highlight — white top edge */}
        <linearGradient id={id('spec')} x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>

        {/* Glow filter */}
        <filter id={id('glow')} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>

        {/* Strong outer glow for "under" segments (they peek out) */}
        <filter id={id('glow2')} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feFlood floodColor="#a855f7" floodOpacity="0.5" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feComposite in="SourceGraphic" in2="glow" operator="over"/>
        </filter>
      </defs>

      {/* ── Ambient purple glow behind knot ── */}
      <circle cx="50" cy="50" r="46"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="20"
        strokeOpacity="0.08"
        filter={`url(#${id('glow2')})`}
      />

      {/* ── UNDER segments (drawn first — appear behind) ── */}
      {underSegs.map((seg, i) => (
        <g key={`under-${i}`}>
          {/* Thick shadow beneath to create depth */}
          <path
            d={segmentD(seg.pts)}
            stroke="#0a0518"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Chrome fill */}
          <path
            d={segmentD(seg.pts)}
            stroke={`url(#${id('chrome')})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </g>
      ))}

      {/* ── OVER segments (drawn last — appear in front) ── */}
      {overSegs.map((seg, i) => (
        <g key={`over-${i}`} filter={`url(#${id('glow')})`}>
          {/* Shadow beneath */}
          <path
            d={segmentD(seg.pts)}
            stroke="#0a0518"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          {/* Chrome body */}
          <path
            d={segmentD(seg.pts)}
            stroke={`url(#${id('chrome')})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Specular highlight — thin white line on upper edge */}
          <path
            d={segmentD(seg.pts)}
            stroke={`url(#${id('spec')})`}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>
      ))}

      <style>{`
        @keyframes el-breathe {
          0%,100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.4)); }
          50%      { filter: drop-shadow(0 0 16px rgba(168,85,247,0.9)); }
        }
      `}</style>
    </svg>
  )
}
