'use client'
// Entanglement Knot — parametric trefoil with true over/under weaving.
// Chrome gradient: Black → DarkViolet → Silver → Purple → Silver → Black.
// Three lobes, 3 crossings, node beads at crossing peaks.

import { useMemo } from 'react'

interface Props {
  size?: number
  animate?: boolean
}

const N = 300   // path samples
const SCALE = 27
const CX = 100
const CY = 100
const THRESH_SQ = 20   // 4.5 px crossing threshold (scaled space)
const MIN_GAP   = 38   // min index separation between crossing arms
const HALF_GAP  = 8    // indices blanked on the under-strand

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  const { fullPath, gappedPath, beads } = useMemo(() => {
    const TWO_PI = Math.PI * 2

    // ── Sample trefoil knot ──────────────────────────────────────────────
    const pts: Array<{ px: number; py: number; z: number }> = []
    for (let i = 0; i < N; i++) {
      const t  = (i / N) * TWO_PI
      pts.push({
        px: CX + (Math.sin(t) + 2 * Math.sin(2 * t)) * SCALE,
        py: CY + (Math.cos(t) - 2 * Math.cos(2 * t)) * SCALE,
        z:  Math.sin(3 * t),   // depth: positive = toward viewer
      })
    }

    // ── Detect the 3 self-intersections ─────────────────────────────────
    const crossings: Array<{ under: number; over: number }> = []

    for (let i = 0; i < N && crossings.length < 3; i++) {
      for (let dj = MIN_GAP; dj <= N - MIN_GAP; dj++) {
        const j  = (i + dj) % N
        if (j <= i && dj < N / 2) continue   // avoid double-counting
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
          }
        }
      }
    }

    // ── Gap set: blank the under-strand near each crossing ───────────────
    const gapSet = new Set<number>()
    for (const { under } of crossings) {
      for (let k = -HALF_GAP; k <= HALF_GAP; k++) {
        gapSet.add(((under + k) % N + N) % N)
      }
    }

    // ── Build SVG path strings ───────────────────────────────────────────
    const toPath = (applyGaps: boolean) => {
      const parts: string[] = []
      let pen = false
      for (let i = 0; i < N; i++) {
        if (applyGaps && gapSet.has(i)) { pen = false; continue }
        const { px, py } = pts[i]
        parts.push(pen
          ? `L${px.toFixed(1)},${py.toFixed(1)}`
          : `M${px.toFixed(1)},${py.toFixed(1)}`
        )
        pen = true
      }
      return parts.join(' ')
    }

    // Bead positions: midpoint between the two crossing arms
    const beads = crossings.map(({ under, over }) => {
      const u = pts[under], o = pts[over]
      return { px: (u.px + o.px) / 2, py: (u.py + o.py) / 2 }
    })

    return {
      fullPath:   toPath(false) + ' Z',
      gappedPath: toPath(true),
      beads,
    }
  }, [])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'elk-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* Chrome gradients: near-black → deep violet → silver → purple → silver → black */}
        <linearGradient id="elk-g1" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06060C"/>
          <stop offset="18%"  stopColor="#4C1D95"/>
          <stop offset="40%"  stopColor="#C8D0DC"/>
          <stop offset="58%"  stopColor="#7C3AED"/>
          <stop offset="78%"  stopColor="#A0A8B4"/>
          <stop offset="100%" stopColor="#040508"/>
        </linearGradient>
        <linearGradient id="elk-g2" x1="200" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#05060B"/>
          <stop offset="20%"  stopColor="#5B21B6"/>
          <stop offset="44%"  stopColor="#E2E8F0"/>
          <stop offset="62%"  stopColor="#6D28D9"/>
          <stop offset="82%"  stopColor="#94A3B8"/>
          <stop offset="100%" stopColor="#040610"/>
        </linearGradient>
        <linearGradient id="elk-g3" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06070E"/>
          <stop offset="22%"  stopColor="#6D28D9"/>
          <stop offset="48%"  stopColor="#DDE4EC"/>
          <stop offset="66%"  stopColor="#8B5CF6"/>
          <stop offset="88%"  stopColor="#8899A6"/>
          <stop offset="100%" stopColor="#050710"/>
        </linearGradient>

        {/* Purple ambient behind logo */}
        <radialGradient id="elk-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4C1D95" stopOpacity="0.28"/>
          <stop offset="45%"  stopColor="#7C3AED" stopOpacity="0.09"/>
          <stop offset="100%" stopColor="#0F0C2A" stopOpacity="0"/>
        </radialGradient>

        {/* Crystal core fill */}
        <radialGradient id="elk-crystal" cx="33%" cy="26%" r="72%">
          <stop offset="0%"   stopColor="#DDD5FF"/>
          <stop offset="28%"  stopColor="#7C3AED"/>
          <stop offset="62%"  stopColor="#2E1065"/>
          <stop offset="100%" stopColor="#060710"/>
        </radialGradient>

        {/* Node bead fill */}
        <radialGradient id="elk-bead" cx="28%" cy="24%" r="66%">
          <stop offset="0%"   stopColor="#F8FAFC"/>
          <stop offset="38%"  stopColor="#A78BFA"/>
          <stop offset="72%"  stopColor="#4C1D95"/>
          <stop offset="100%" stopColor="#06080F"/>
        </radialGradient>

        {/* Soft glow on chrome strands */}
        <filter id="elk-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.8" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Node bead glow */}
        <filter id="elk-nglow" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Crystal drop shadow */}
        <filter id="elk-cshadow">
          <feDropShadow dx="1" dy="2" stdDeviation="4" floodColor="#3B0764" floodOpacity="0.55"/>
        </filter>
      </defs>

      {/* Ambient purple glow disc */}
      <circle cx="100" cy="100" r="96" fill="url(#elk-ambient)"/>

      {/* ── SHADOW BASE — full closed path in near-black, thick ── */}
      {/* Makes the under-strand "pop" through the gaps of the chrome layer */}
      <path d={fullPath}
        stroke="#04050B" strokeWidth="18"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.97"/>

      {/* ── CHROME LAYER — gapped path, gradient strokes ── */}
      {/* Shadow outline */}
      <path d={gappedPath}
        stroke="#060810" strokeWidth="14"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Primary chrome gradient */}
      <path d={gappedPath}
        stroke="url(#elk-g1)" strokeWidth="10"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        filter="url(#elk-glow)"/>
      {/* Secondary gradient overlay (shifted) */}
      <path d={gappedPath}
        stroke="url(#elk-g2)" strokeWidth="10"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
      {/* Specular white highlight */}
      <path d={gappedPath}
        stroke="rgba(255,255,255,0.55)" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── CRYSTAL DIAMOND CORE ── */}
      {/* Soft shadow blob */}
      <ellipse cx="101" cy="103" rx="18" ry="16"
        fill="#1E0052" opacity="0.55" style={{ filter: 'blur(6px)' }}/>
      {/* Diamond body */}
      <path d="M100,76 C107,76 124,93 124,100 C124,107 107,124 100,124 C93,124 76,107 76,100 C76,93 93,76 100,76 Z"
        fill="url(#elk-crystal)" filter="url(#elk-cshadow)"/>
      {/* Outer facet */}
      <path d="M100,76 L124,100 L100,124 L76,100 Z"
        stroke="rgba(167,139,250,0.18)" strokeWidth="0.6" fill="none"/>
      {/* Inner facet */}
      <path d="M100,84 L116,100 L100,116 L84,100 Z"
        stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none"/>
      {/* Specular streak */}
      <ellipse cx="89" cy="87" rx="7.5" ry="4"
        fill="white" opacity="0.22" transform="rotate(-42 89 87)"/>
      <circle cx="87" cy="85" r="2.2" fill="white" opacity="0.30"/>
      {/* Border ring */}
      <path d="M100,76 C107,76 124,93 124,100 C124,107 107,124 100,124 C93,124 76,107 76,100 C76,93 93,76 100,76 Z"
        stroke="rgba(109,40,217,0.4)" strokeWidth="0.7" fill="none"/>

      {/* ── NODE BEADS at crossing midpoints ── */}
      {beads.map((b, i) => (
        <g key={i} filter="url(#elk-nglow)">
          <circle cx={b.px} cy={b.py} r={8.5} fill="#04050C"/>
          <circle cx={b.px} cy={b.py} r={7.2} fill="url(#elk-bead)"/>
          <circle cx={b.px - 2.2} cy={b.py - 2.2} r={2.4} fill="white" opacity="0.62"/>
        </g>
      ))}

      <style>{`
        @keyframes elk-breathe {
          0%,100% { filter: drop-shadow(0 0 5px rgba(109,40,217,0.4)); }
          50%      { filter: drop-shadow(0 0 24px rgba(124,58,237,0.9)); }
        }
      `}</style>
    </svg>
  )
}
