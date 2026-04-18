'use client'
// Entanglement Core — (2,3) Torus Knot, procedural chrome shader.
//
// Parametric equations (torus knot, period 2π):
//   x(t) = (2 + cos(3t)) · cos(2t)
//   y(t) = (2 + cos(3t)) · sin(2t)
//   z(t) = sin(3t)               ← depth, drives over/under
//
// Six draw-call layers:
//   0. Ambient glow disc
//   1. Purple bloom halo
//   2. Obsidian shadow fill (makes gaps read as "behind")
//   3. Dark outline border
//   4. Primary chrome gradient stroke
//   5. Secondary cross-gradient sheen (blended 38%)
//   6. Specular highlight stroke — 1.2px white, offset (-1.2, -1.2)

import { useMemo } from 'react'

interface Props { size?: number; animate?: boolean }

const N        = 500   // sample count — smooth at any size
const SCALE    = 25    // px/unit; range ±3 → ±75px from centre (200×200 vb)
const CX = 100, CY = 100
const THRESH_SQ = 22   // crossing detection: ≈4.7px
const MIN_GAP   = 55   // min index gap between two crossing arms
const HALF_GAP  = 10   // indices blanked on the under-strand

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  const { fullPath, gappedPath, beads } = useMemo(() => {
    const TAU = Math.PI * 2

    // ── 1. Sample the (2,3) torus knot ────────────────────────────────────
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

    // ── 2. Detect the 3 self-intersections in the 2D projection ───────────
    const crossings: Array<{ under: number; over: number }> = []

    outer: for (let i = 0; i < N; i++) {
      for (let dj = MIN_GAP; dj <= N - MIN_GAP; dj++) {
        const j  = (i + dj) % N
        if (j <= i && dj < N / 2) continue   // avoid duplicate pairs
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

    // ── 3. Gap set — indices where the under-strand is blanked ────────────
    const gapSet = new Set<number>()
    for (const { under } of crossings) {
      for (let k = -HALF_GAP; k <= HALF_GAP; k++) {
        gapSet.add(((under + k) % N + N) % N)
      }
    }

    // ── 4. Build SVG path strings ──────────────────────────────────────────
    const toPath = (applyGaps: boolean): string => {
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

    // Beads: midpoint between the two arms of each crossing
    const beads = crossings.map(({ under, over }) => ({
      px: (pts[under].px + pts[over].px) / 2,
      py: (pts[under].py + pts[over].py) / 2,
    }))

    return {
      fullPath:   toPath(false) + ' Z',
      gappedPath: toPath(true),
      beads,
    }
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
        {/* ── Chrome: Black → Gray → White → Purple → Black ── */}
        <linearGradient id="elk-chrome" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#050508"/>
          <stop offset="15%"  stopColor="#40415A"/>
          <stop offset="34%"  stopColor="#E6ECF4"/>
          <stop offset="50%"  stopColor="#A78BFA"/>
          <stop offset="67%"  stopColor="#D2D8E4"/>
          <stop offset="84%"  stopColor="#2C2D3E"/>
          <stop offset="100%" stopColor="#030407"/>
        </linearGradient>
        {/* Cross-diagonal sheen for visual depth */}
        <linearGradient id="elk-chrome2" x1="180" y1="20" x2="20" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#04050B"/>
          <stop offset="18%"  stopColor="#6D28D9"/>
          <stop offset="40%"  stopColor="#EEF2F8"/>
          <stop offset="58%"  stopColor="#7C3AED"/>
          <stop offset="78%"  stopColor="#C8D0DC"/>
          <stop offset="100%" stopColor="#030409"/>
        </linearGradient>

        {/* Ambient indigo disc */}
        <radialGradient id="elk-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3B0764" stopOpacity="0.40"/>
          <stop offset="42%"  stopColor="#6D28D9" stopOpacity="0.13"/>
          <stop offset="100%" stopColor="#090718" stopOpacity="0"/>
        </radialGradient>

        {/* Rounded-square core */}
        <radialGradient id="elk-core" cx="30%" cy="24%" r="78%">
          <stop offset="0%"   stopColor="#D8CFFF"/>
          <stop offset="22%"  stopColor="#7C3AED"/>
          <stop offset="52%"  stopColor="#2E1065"/>
          <stop offset="100%" stopColor="#06070F"/>
        </radialGradient>

        {/* Chrome node bead */}
        <radialGradient id="elk-bead" cx="26%" cy="22%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="28%"  stopColor="#C4B5FD"/>
          <stop offset="62%"  stopColor="#4C1D95"/>
          <stop offset="100%" stopColor="#040609"/>
        </radialGradient>

        {/* Strand chromatic glow */}
        <filter id="elk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Purple bloom — layers blurred purple under the shadow base */}
        <filter id="elk-bloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Bead glow */}
        <filter id="elk-nglow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4.5" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Core shadow */}
        <filter id="elk-cshadow">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#3B0764" floodOpacity="0.65"/>
        </filter>
      </defs>

      {/* ── LAYER 0: Ambient indigo glow disc ── */}
      <circle cx="100" cy="100" r="94" fill="url(#elk-ambient)"/>

      {/* ── LAYER 1: Purple bloom halo ── */}
      <path d={fullPath}
        stroke="rgba(109,40,217,0.52)" strokeWidth="24"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        filter="url(#elk-bloom)" opacity="0.5"/>

      {/* ── LAYER 2: Obsidian shadow fill ── */}
      {/* Fills every part of the knot in near-black first.           */}
      {/* The gapped chrome layer is drawn on top, leaving the dark   */}
      {/* shadow visible inside the gaps → strands read as "behind".  */}
      <path d={fullPath}
        stroke="#01020A" strokeWidth="22"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.99"/>

      {/* ── LAYER 3: Outer chrome border (dark halo around tube) ── */}
      <path d={gappedPath}
        stroke="#06070E" strokeWidth="18"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── LAYER 4: Primary chrome gradient ── */}
      <path d={gappedPath}
        stroke="url(#elk-chrome)" strokeWidth="12"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        filter="url(#elk-glow)"/>

      {/* ── LAYER 5: Secondary cross-diagonal sheen (38% blend) ── */}
      <path d={gappedPath}
        stroke="url(#elk-chrome2)" strokeWidth="12"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.38"/>

      {/* ── LAYER 6: Specular highlight ── */}
      {/* 1.2px white stroke offset (-1.2, -1.2) = top-left light-catch */}
      <path d={gappedPath}
        stroke="rgba(255,255,255,0.60)" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        transform="translate(-1.2,-1.2)"/>

      {/* ── CORE: Rounded square (matches reference image) ── */}
      {/* Shadow blob */}
      <ellipse cx="101" cy="104" rx="16" ry="14"
        fill="#1A0040" opacity="0.7" style={{ filter: 'blur(8px)' }}/>
      {/* Body */}
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        fill="url(#elk-core)" filter="url(#elk-cshadow)"/>
      {/* Outer bevel */}
      <rect x="84" y="84" width="32" height="32" rx="6" ry="6"
        stroke="rgba(167,139,250,0.2)" strokeWidth="0.6" fill="none"/>
      {/* Inner bevel */}
      <rect x="88" y="88" width="24" height="24" rx="4" ry="4"
        stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none"/>
      {/* Specular streak */}
      <ellipse cx="87" cy="86" rx="7" ry="3.5"
        fill="white" opacity="0.22" transform="rotate(-40 87 86)"/>
      <circle cx="85" cy="84" r="2" fill="white" opacity="0.30"/>
      {/* Border glow */}
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        stroke="rgba(109,40,217,0.44)" strokeWidth="0.7" fill="none"/>

      {/* ── NODE BEADS at crossing midpoints ── */}
      {beads.map((b, i) => (
        <g key={i} filter="url(#elk-nglow)">
          {/* Dark outer ring */}
          <circle cx={b.px} cy={b.py} r={9.5}  fill="#01020A"/>
          {/* Chrome bead */}
          <circle cx={b.px} cy={b.py} r={7.8}  fill="url(#elk-bead)"/>
          {/* Specular dot */}
          <circle cx={b.px - 2.5} cy={b.py - 2.5} r={2.6} fill="white" opacity="0.68"/>
        </g>
      ))}

      <style>{`
        @keyframes elk-breathe {
          0%,100% {
            filter: drop-shadow(0 0 6px rgba(109,40,217,0.50))
                    drop-shadow(0 0 18px rgba(76,29,149,0.22));
          }
          50% {
            filter: drop-shadow(0 0 28px rgba(124,58,237,1.0))
                    drop-shadow(0 0 55px rgba(109,40,217,0.42));
          }
        }
      `}</style>
    </svg>
  )
}
