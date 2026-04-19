'use client'
// Entanglement Core — (2,3) Torus Knot, 6-arc Painter's Algorithm.
//
// Parametric (period 2π):
//   x(t) = (2 + cos 3t) · cos 2t
//   y(t) = (2 + cos 3t) · sin 2t
//   z(t) = sin 3t            ← depth
//
// z oscillates 3× per period → 6 alternating pos/neg arcs.
// Arcs sorted back→front and drawn in that order (painter's algorithm).
// Each arc gets 4 strokes:
//   ① Pure-black shadow border (width 20) — hard edge at crossings
//   ② Chrome gradient (width 13) — Black→Gray→White→Purple→Black
//   ③ Cross-diagonal sheen (width 13, 32% opacity)
//   ④ Specular highlight (1.2px white, offset −1.2, −1.2)

import { useMemo } from 'react'

interface Props { size?: number; animate?: boolean }

const N     = 600   // total samples — smooth at all display sizes
const SCALE = 25    // px per unit; knot radius 1–3 → 25–75px from centre

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  const { arcs, beads } = useMemo(() => {
    const TAU = Math.PI * 2

    // ── 1. Sample the (2,3) torus knot ────────────────────────────────────
    const pts: Array<{ px: number; py: number; z: number }> = []
    for (let i = 0; i < N; i++) {
      const t = (i / N) * TAU
      const r = 2 + Math.cos(3 * t)
      pts.push({
        px: 100 + r * Math.cos(2 * t) * SCALE,
        py: 100 + r * Math.sin(2 * t) * SCALE,
        z:  Math.sin(3 * t),
      })
    }

    // ── 2. Divide into 6 arcs, compute mean-z for each ───────────────────
    const ARC = Math.floor(N / 6)   // samples per arc
    const OVER = 6                   // samples each arc extends past its boundary
    //   (the overlap lets round linecaps cover the adjacent arc at crossings)

    const arcList = Array.from({ length: 6 }, (_, a) => {
      const lo  = Math.max(0, a * ARC - OVER)
      const hi  = Math.min(N - 1, (a + 1) * ARC + OVER)
      const seg = pts.slice(lo, hi + 1)
      const meanZ = seg.reduce((s, p) => s + p.z, 0) / seg.length
      const d = seg
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px.toFixed(1)},${p.py.toFixed(1)}`)
        .join(' ')
      return { d, meanZ }
    })

    // ── 3. Painter's sort: lowest z first (drawn behind) ─────────────────
    arcList.sort((a, b) => a.meanZ - b.meanZ)

    // ── 4. Bead positions — 3 outer crossing boundaries (r = 3 peak) ─────
    //   t = 0, 2π/3, 4π/3  →  r = 2+cos(0) = 3 (maximum radius)
    const beadTs = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
    const beads = beadTs.map(t => ({
      px: 100 + (2 + Math.cos(3 * t)) * Math.cos(2 * t) * SCALE,
      py: 100 + (2 + Math.cos(3 * t)) * Math.sin(2 * t) * SCALE,
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
        {/* ── Chrome: pure-Black → dark-Gray → bright-White → Purple → White → Gray → Black ── */}
        <linearGradient id="elk-ch" x1="18" y1="18" x2="182" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#000000"/>
          <stop offset="12%"  stopColor="#252535"/>
          <stop offset="32%"  stopColor="#EAEEF5"/>
          <stop offset="50%"  stopColor="#A78BFA"/>
          <stop offset="68%"  stopColor="#E0E6F0"/>
          <stop offset="86%"  stopColor="#1C1C28"/>
          <stop offset="100%" stopColor="#000000"/>
        </linearGradient>
        {/* Cross-axis sheen for round-tube depth */}
        <linearGradient id="elk-ch2" x1="182" y1="18" x2="18" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#020209"/>
          <stop offset="18%"  stopColor="#5B21B6"/>
          <stop offset="38%"  stopColor="#F4F6FA"/>
          <stop offset="56%"  stopColor="#6D28D9"/>
          <stop offset="76%"  stopColor="#D0D8E8"/>
          <stop offset="100%" stopColor="#010108"/>
        </linearGradient>

        {/* Purple radial light source — "neon purple glow" behind the knot */}
        <radialGradient id="elk-bloom-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.55"/>
          <stop offset="50%"  stopColor="#4C1D95" stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#0A0818" stopOpacity="0"/>
        </radialGradient>

        {/* Rounded-square core */}
        <radialGradient id="elk-core" cx="30%" cy="24%" r="78%">
          <stop offset="0%"   stopColor="#DDD5FF"/>
          <stop offset="22%"  stopColor="#7C3AED"/>
          <stop offset="52%"  stopColor="#2E1065"/>
          <stop offset="100%" stopColor="#06070F"/>
        </radialGradient>

        {/* Chrome node bead */}
        <radialGradient id="elk-bead" cx="26%" cy="22%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="28%"  stopColor="#C4B5FD"/>
          <stop offset="62%"  stopColor="#4C1D95"/>
          <stop offset="100%" stopColor="#030508"/>
        </radialGradient>

        {/* Strand glow for chrome pass */}
        <filter id="elk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Bead glow */}
        <filter id="elk-nglow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4.5" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Core shadow */}
        <filter id="elk-cshadow">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#3B0764" floodOpacity="0.7"/>
        </filter>
      </defs>

      {/* ── Purple radial "neon light source" (blur radius 25 equivalent) ── */}
      <circle cx="100" cy="100" r="88" fill="url(#elk-bloom-rg)"/>

      {/* ── 6 arc layers drawn back-to-front (painter's algorithm) ── */}
      {/*   Each arc: ① black shadow border  ② chrome  ③ sheen  ④ specular  */}
      {arcs.map((arc, i) => (
        <g key={i}>
          {/* ① Hard black border — at crossings this creates the dark separation line */}
          <path d={arc.d}
            stroke="#000000" strokeWidth="20"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* ② Primary chrome gradient — Black→Gray→White→Purple→Black */}
          <path d={arc.d}
            stroke="url(#elk-ch)" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            filter="url(#elk-glow)"/>
          {/* ③ Cross-diagonal sheen (32% blend adds round-tube depth) */}
          <path d={arc.d}
            stroke="url(#elk-ch2)" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.32"/>
          {/* ④ Specular highlight — 1.2pt white, −1.2/−1.2 top-left offset */}
          <path d={arc.d}
            stroke="rgba(255,255,255,0.68)" strokeWidth="1.2"
            strokeLinecap="round" fill="none"
            transform="translate(-1.2,-1.2)"/>
        </g>
      ))}

      {/* ── CORE: Rounded-square (obsidian chrome centre) ── */}
      <ellipse cx="101" cy="104" rx="17" ry="15"
        fill="#1A0040" opacity="0.75" style={{ filter: 'blur(8px)' }}/>
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        fill="url(#elk-core)" filter="url(#elk-cshadow)"/>
      {/* Outer bevel */}
      <rect x="84" y="84" width="32" height="32" rx="6" ry="6"
        stroke="rgba(167,139,250,0.22)" strokeWidth="0.6" fill="none"/>
      {/* Inner bevel */}
      <rect x="88" y="88" width="24" height="24" rx="4" ry="4"
        stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" fill="none"/>
      {/* Specular sheen */}
      <ellipse cx="87" cy="86" rx="7" ry="3.5"
        fill="white" opacity="0.24" transform="rotate(-40 87 86)"/>
      <circle cx="85" cy="84" r="2" fill="white" opacity="0.32"/>
      {/* Purple border ring */}
      <rect x="80" y="80" width="40" height="40" rx="9" ry="9"
        stroke="rgba(109,40,217,0.45)" strokeWidth="0.8" fill="none"/>

      {/* ── NODE BEADS at the 3 outer crossing peaks ── */}
      {beads.map((b, i) => (
        <g key={i} filter="url(#elk-nglow)">
          <circle cx={b.px} cy={b.py} r={10}   fill="#000000"/>
          <circle cx={b.px} cy={b.py} r={8.2}  fill="url(#elk-bead)"/>
          <circle cx={b.px - 2.8} cy={b.py - 2.8} r={2.8} fill="white" opacity="0.72"/>
        </g>
      ))}

      <style>{`
        @keyframes elk-breathe {
          0%,100% {
            filter: drop-shadow(0 0 7px rgba(109,40,217,0.55))
                    drop-shadow(0 0 22px rgba(76,29,149,0.28));
          }
          50% {
            filter: drop-shadow(0 0 32px rgba(124,58,237,1.0))
                    drop-shadow(0 0 64px rgba(109,40,217,0.48));
          }
        }
      `}</style>
    </svg>
  )
}
