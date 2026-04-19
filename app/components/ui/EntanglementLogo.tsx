'use client'
// Entanglement Core — (2,3) Torus Knot, crossing-exact Painter's Algorithm.
//
// Parametric (period 2π):
//   x(t) = (2 + cos 3t) · cos 2t
//   y(t) = (2 + cos 3t) · sin 2t
//   z(t) = sin 3t
//
// Pipeline:
//  1. Sample 600 pts.
//  2. Detect the 3 self-intersections numerically → 6 arm indices.
//  3. Sort arm indices → exact arc boundaries at the crossing seams.
//  4. Compute mean-z per arc → painter's sort (back → front).
//  5. Draw each arc: ① black shadow border  ② chrome gradient
//                    ③ cross-sheen  ④ 0.5pt white specular at (−1,−1).
//
// At every crossing the front-arc's 20px black border fires after the
// rear-arc, producing a hard-edged "strand passes in front" separation.

import { useMemo } from 'react'

interface Props { size?: number; animate?: boolean }

const N        = 600
const SCALE    = 25
const CX = 100, CY = 100
const THRESH_SQ = 20   // ≈4.5 px
const MIN_GAP   = 55

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  const { arcs, beads } = useMemo(() => {
    const TAU = Math.PI * 2

    // ── 1. Sample ────────────────────────────────────────────────────────
    const pts: Array<{ px: number; py: number; z: number }> = []
    for (let i = 0; i < N; i++) {
      const t = (i / N) * TAU
      const r = 2 + Math.cos(3 * t)
      pts.push({
        px: CX + r * Math.cos(2 * t) * SCALE,
        py: CY + r * Math.sin(2 * t) * SCALE,
        z:  Math.sin(3 * t),
      })
    }

    // ── 2. Detect 3 self-intersections ───────────────────────────────────
    const crossings: Array<{ under: number; over: number }> = []

    outer: for (let i = 0; i < N; i++) {
      for (let dj = MIN_GAP; dj <= N - MIN_GAP; dj++) {
        const j = (i + dj) % N
        if (j <= i && dj < N / 2) continue   // skip duplicate pairs
        const dx = pts[i].px - pts[j].px
        const dy = pts[i].py - pts[j].py
        if (dx * dx + dy * dy < THRESH_SQ) {
          const dup = crossings.some(c =>
            Math.abs(c.under - i) < MIN_GAP ||
            Math.abs(c.under - j) < MIN_GAP ||
            Math.abs(c.over  - i) < MIN_GAP ||
            Math.abs(c.over  - j) < MIN_GAP
          )
          if (!dup) {
            crossings.push(
              pts[i].z < pts[j].z
                ? { under: i, over: j }
                : { under: j, over: i }
            )
            if (crossings.length === 3) break outer
          }
        }
      }
    }

    // ── 3. Build exact arc boundaries from the 6 arm indices ─────────────
    // Each crossing contributes 2 arm indices (under & over).
    // Sorted in ascending order → 6 break-points along the closed curve.
    const breakPts = crossings
      .flatMap(c => [c.under, c.over])
      .sort((a, b) => a - b)

    // Fall back to equal-sixth divisions if detection missed any crossing.
    const seams = breakPts.length === 6
      ? breakPts
      : Array.from({ length: 6 }, (_, k) => Math.round(k * N / 6))

    // ── 4. Slice curve into 6 arcs, compute mean-z ───────────────────────
    const arcList = seams.map((start, k) => {
      const end = k < 5 ? seams[k + 1] : seams[0] + N   // last arc wraps
      const seg: typeof pts = []
      for (let i = start; i <= end; i++) seg.push(pts[i % N])
      const meanZ = seg.reduce((s, p) => s + p.z, 0) / seg.length
      const d = seg
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px.toFixed(1)},${p.py.toFixed(1)}`)
        .join(' ')
      return { d, meanZ }
    })

    // ── 5. Painter's sort — lowest z (behind) drawn first ────────────────
    arcList.sort((a, b) => a.meanZ - b.meanZ)

    // Beads: spatial midpoint between each crossing's two arms.
    const beads = crossings.map(c => ({
      px: (pts[c.under].px + pts[c.over].px) / 2,
      py: (pts[c.under].py + pts[c.over].py) / 2,
    }))

    return { arcs: arcList, beads }
  }, [])

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'elk-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* ── Liquid-metal chrome: Black → Silver → Purple → Silver → Black ── */}
        <linearGradient id="elk-ch" x1="18" y1="18" x2="182" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#000000"/>
          <stop offset="15%"  stopColor="#3A3A50"/>
          <stop offset="33%"  stopColor="#F6F9FF"/>   {/* bright silver peak */}
          <stop offset="50%"  stopColor="#A78BFA"/>   {/* deep purple midpoint */}
          <stop offset="67%"  stopColor="#F0F4FF"/>   {/* silver recovery */}
          <stop offset="84%"  stopColor="#2C2C40"/>
          <stop offset="100%" stopColor="#000000"/>
        </linearGradient>

        {/* Cross-axis sheen — adds round-tube dimensionality */}
        <linearGradient id="elk-ch2" x1="182" y1="18" x2="18" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#010108"/>
          <stop offset="18%"  stopColor="#5B21B6"/>
          <stop offset="40%"  stopColor="#FFFFFF"/>
          <stop offset="56%"  stopColor="#6D28D9"/>
          <stop offset="78%"  stopColor="#BEC8DC"/>
          <stop offset="100%" stopColor="#010108"/>
        </linearGradient>

        {/* Purple radial glow — the neon light source behind the knot */}
        <radialGradient id="elk-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.75"/>
          <stop offset="40%"  stopColor="#4C1D95" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#0A0818" stopOpacity="0"/>
        </radialGradient>

        {/* Core rounded-square fill */}
        <radialGradient id="elk-core" cx="30%" cy="24%" r="78%">
          <stop offset="0%"   stopColor="#DDD5FF"/>
          <stop offset="22%"  stopColor="#7C3AED"/>
          <stop offset="52%"  stopColor="#2E1065"/>
          <stop offset="100%" stopColor="#06070F"/>
        </radialGradient>

        {/* Chrome bead fill */}
        <radialGradient id="elk-bead" cx="26%" cy="22%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="28%"  stopColor="#C4B5FD"/>
          <stop offset="62%"  stopColor="#4C1D95"/>
          <stop offset="100%" stopColor="#030508"/>
        </radialGradient>

        {/* Strand glow (tight — keeps chrome crisp) */}
        <filter id="elk-sg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Bead glow */}
        <filter id="elk-ng" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4.5" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Core shadow */}
        <filter id="elk-cs">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#3B0764" floodOpacity="0.72"/>
        </filter>
      </defs>

      {/* ── Purple radial neon source (blur-radius 20, behind the knot) ── */}
      <circle cx="100" cy="100" r="82"
        fill="url(#elk-bloom)"
        style={{ filter: 'blur(14px)' }}/>

      {/* ── 6 arc layers — painter's order, back → front ── */}
      {arcs.map((arc, i) => (
        <g key={i}>
          {/* ① Pure-black shadow border — hard crossing-seam edge at width 20 */}
          <path d={arc.d}
            stroke="#000000" strokeWidth="20"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>

          {/* ② Liquid-metal chrome gradient */}
          <path d={arc.d}
            stroke="url(#elk-ch)" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            filter="url(#elk-sg)"/>

          {/* ③ Cross-diagonal sheen (28% opacity — round-tube depth cue) */}
          <path d={arc.d}
            stroke="url(#elk-ch2)" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.28"/>

          {/* ④ Specular highlight — 0.5pt white at offset (−1, −1) */}
          <path d={arc.d}
            stroke="rgba(255,255,255,0.90)" strokeWidth="0.5"
            strokeLinecap="round" fill="none"
            transform="translate(-1,-1)"/>
        </g>
      ))}

      {/* ── Core: obsidian rounded square ── */}
      <ellipse cx="101" cy="104" rx="18" ry="16"
        fill="#180038" opacity="0.80" style={{ filter: 'blur(9px)' }}/>
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        fill="url(#elk-core)" filter="url(#elk-cs)"/>
      <rect x="84" y="84" width="32" height="32" rx="6" ry="6"
        stroke="rgba(167,139,250,0.22)" strokeWidth="0.6" fill="none"/>
      <rect x="88" y="88" width="24" height="24" rx="4" ry="4"
        stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" fill="none"/>
      <ellipse cx="87" cy="86" rx="7" ry="3.5"
        fill="white" opacity="0.25" transform="rotate(-40 87 86)"/>
      <circle cx="85" cy="84" r="2" fill="white" opacity="0.33"/>
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        stroke="rgba(109,40,217,0.46)" strokeWidth="0.8" fill="none"/>

      {/* ── Chrome node beads at crossing midpoints ── */}
      {beads.map((b, i) => (
        <g key={i} filter="url(#elk-ng)">
          <circle cx={b.px} cy={b.py} r={10}   fill="#000000"/>
          <circle cx={b.px} cy={b.py} r={8.2}  fill="url(#elk-bead)"/>
          <circle cx={b.px - 2.8} cy={b.py - 2.8} r={2.8} fill="white" opacity="0.74"/>
        </g>
      ))}

      <style>{`
        @keyframes elk-breathe {
          0%,100% {
            filter: drop-shadow(0 0 8px rgba(109,40,217,0.60))
                    drop-shadow(0 0 24px rgba(76,29,149,0.32));
          }
          50% {
            filter: drop-shadow(0 0 32px rgba(124,58,237,1.0))
                    drop-shadow(0 0 64px rgba(109,40,217,0.52));
          }
        }
      `}</style>
    </svg>
  )
}
