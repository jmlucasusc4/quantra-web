'use client'
// Entanglement Loop — silver/chrome atomic icon matching reference.
// Three tubular elliptical rings at 60° intervals, rounded-diamond crystal core,
// 6 spherical node beads. Layered SVG: back arcs → crystal → front arcs → nodes.

interface Props {
  size?: number
  animate?: boolean
}

// Ring endpoints (cx=100, cy=100, rx=72, ry=22, viewBox 200x200)
// Ring 0°:   left=(28,100)       right=(172,100)
// Ring 60°:  topL=(64,37.6)      botR=(136,162.4)
// Ring 120°: topR=(136,37.6)     botL=(64,162.4)
const NODES: [number, number][] = [
  [28, 100], [172, 100],
  [64, 37.6], [136, 162.4],
  [136, 37.6], [64, 162.4],
]

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'el-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* ── Chrome gradients for each ring ── */}
        <linearGradient id="el-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#111827"/>
          <stop offset="22%"  stopColor="#6b7280"/>
          <stop offset="48%"  stopColor="#e2e8f0"/>
          <stop offset="68%"  stopColor="#c4cdd6"/>
          <stop offset="88%"  stopColor="#9ca3af"/>
          <stop offset="100%" stopColor="#1f2937"/>
        </linearGradient>
        <linearGradient id="el-g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#0f172a"/>
          <stop offset="25%"  stopColor="#94a3b8"/>
          <stop offset="50%"  stopColor="#f1f5f9"/>
          <stop offset="72%"  stopColor="#cbd5e1"/>
          <stop offset="100%" stopColor="#1e293b"/>
        </linearGradient>
        <linearGradient id="el-g3" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor="#1e293b"/>
          <stop offset="30%"  stopColor="#9ba8b4"/>
          <stop offset="55%"  stopColor="#dde4ec"/>
          <stop offset="78%"  stopColor="#8899a6"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>

        {/* Crystal diamond fill */}
        <radialGradient id="el-crystal" cx="38%" cy="30%" r="72%">
          <stop offset="0%"   stopColor="#dde4ec"/>
          <stop offset="35%"  stopColor="#94a3b8"/>
          <stop offset="70%"  stopColor="#334155"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </radialGradient>

        {/* Node bead fill */}
        <radialGradient id="el-bead" cx="32%" cy="28%" r="68%">
          <stop offset="0%"   stopColor="#f8fafc"/>
          <stop offset="40%"  stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </radialGradient>

        {/* Background blue-indigo ambient glow */}
        <radialGradient id="el-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.22"/>
          <stop offset="55%"  stopColor="#6366f1" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0"/>
        </radialGradient>

        {/* Soft glow on front arcs */}
        <filter id="el-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Node glow */}
        <filter id="el-node-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>

        {/* Drop shadow for crystal */}
        <filter id="el-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
        </filter>
      </defs>

      {/* Ambient glow background */}
      <circle cx="100" cy="100" r="96" fill="url(#el-ambient)"/>

      {/* ══ BACK ARCS — far side, dimmed ══ */}
      {/* Ring 0° back (bottom arc) */}
      <path d="M 28,100 A 72,22 0 0,0 172,100"
        stroke="#060810" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M 28,100 A 72,22 0 0,0 172,100"
        stroke="url(#el-g1)" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Ring 60° back */}
      <path d="M 64,37.6 A 72,22 60 0,0 136,162.4"
        stroke="#060810" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M 64,37.6 A 72,22 60 0,0 136,162.4"
        stroke="url(#el-g2)" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Ring 120° back */}
      <path d="M 136,37.6 A 72,22 120 0,0 64,162.4"
        stroke="#060810" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M 136,37.6 A 72,22 120 0,0 64,162.4"
        stroke="url(#el-g3)" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* ══ CRYSTAL DIAMOND CORE ══ */}
      {/* Drop shadow */}
      <path d="M 100,72 C 106,72 128,94 128,100 C 128,106 106,128 100,128 C 94,128 72,106 72,100 C 72,94 94,72 100,72 Z"
        fill="#000" opacity="0.5" transform="translate(3,4)" style={{ filter: 'blur(5px)' }}/>
      {/* Body */}
      <path d="M 100,72 C 106,72 128,94 128,100 C 128,106 106,128 100,128 C 94,128 72,106 72,100 C 72,94 94,72 100,72 Z"
        fill="url(#el-crystal)" filter="url(#el-shadow)"/>
      {/* Inner facet lines */}
      <path d="M 100,72 L 128,100 L 100,128 L 72,100 Z"
        stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" fill="none"/>
      <path d="M 100,80 L 120,100 L 100,120 L 80,100 Z"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none"/>
      {/* Specular highlight */}
      <ellipse cx="88" cy="86" rx="9" ry="5.5"
        fill="white" opacity="0.18" transform="rotate(-40,88,86)"/>
      <circle cx="85" cy="84" r="3" fill="white" opacity="0.22"/>
      {/* Crystal edge border */}
      <path d="M 100,72 C 106,72 128,94 128,100 C 128,106 106,128 100,128 C 94,128 72,106 72,100 C 72,94 94,72 100,72 Z"
        stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" fill="none"/>

      {/* ══ FRONT ARCS — near side, full chrome ══ */}
      {/* Ring 0° front (top arc) */}
      <path d="M 28,100 A 72,22 0 0,1 172,100"
        stroke="#050810" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M 28,100 A 72,22 0 0,1 172,100"
        stroke="url(#el-g1)" strokeWidth="8" strokeLinecap="round" fill="none"
        filter="url(#el-glow)"/>
      <path d="M 28,100 A 72,22 0 0,1 172,100"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* Ring 60° front */}
      <path d="M 64,37.6 A 72,22 60 0,1 136,162.4"
        stroke="#050810" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M 64,37.6 A 72,22 60 0,1 136,162.4"
        stroke="url(#el-g2)" strokeWidth="8" strokeLinecap="round" fill="none"
        filter="url(#el-glow)"/>
      <path d="M 64,37.6 A 72,22 60 0,1 136,162.4"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* Ring 120° front */}
      <path d="M 136,37.6 A 72,22 120 0,1 64,162.4"
        stroke="#050810" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M 136,37.6 A 72,22 120 0,1 64,162.4"
        stroke="url(#el-g3)" strokeWidth="8" strokeLinecap="round" fill="none"
        filter="url(#el-glow)"/>
      <path d="M 136,37.6 A 72,22 120 0,1 64,162.4"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* ══ NODE BEADS at ring tips ══ */}
      {NODES.map(([x, y], i) => (
        <g key={i} filter="url(#el-node-glow)">
          {/* Dark outer ring */}
          <circle cx={x} cy={y} r={7}   fill="#090d14"/>
          {/* Chrome bead */}
          <circle cx={x} cy={y} r={6.2} fill="url(#el-bead)"/>
          {/* Specular dot */}
          <circle cx={x - 2} cy={y - 2} r={2} fill="white" opacity="0.55"/>
        </g>
      ))}

      <style>{`
        @keyframes el-breathe {
          0%,100% { filter: drop-shadow(0 0 5px rgba(99,102,241,0.35)); }
          50%      { filter: drop-shadow(0 0 20px rgba(99,102,241,0.75)); }
        }
      `}</style>
    </svg>
  )
}
