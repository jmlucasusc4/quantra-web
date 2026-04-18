'use client'
// EntanglementLogo.tsx
// SVG-based "Entanglement Loop" — intersecting orbital rings suggesting a Q
// and quantum correlation. Chrome/metallic gradient with neon purple glow.

interface Props {
  size?: number
  animate?: boolean
}

export function EntanglementLogo({ size = 72, animate = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'entangle-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* Outer glow filter */}
        <filter id="el-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Chrome gradient — ring 1 (horizontal) */}
        <linearGradient id="el-chrome-h" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#c4b8e8" />
          <stop offset="30%"  stopColor="#a78bfa" />
          <stop offset="60%"  stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>

        {/* Chrome gradient — ring 2 (vertical) */}
        <linearGradient id="el-chrome-v" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#e2d9f3" />
          <stop offset="40%"  stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Chrome gradient — ring 3 (diagonal) */}
        <linearGradient id="el-chrome-d" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7c3aed" />
          <stop offset="50%"  stopColor="#c4b8e8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>

        {/* Core sphere gradient */}
        <radialGradient id="el-core" cx="42%" cy="38%" r="58%">
          <stop offset="0%"   stopColor="#e2d9f3" stopOpacity="0.9" />
          <stop offset="40%"  stopColor="#a78bfa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1d1640" stopOpacity="0.8" />
        </radialGradient>

        {/* Purple glow behind everything */}
        <radialGradient id="el-bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="36" cy="36" r="34" fill="url(#el-bg-glow)" />

      {/* Outer dark ring base */}
      <circle cx="36" cy="36" r="30" fill="#0d0b1a" stroke="#2a2450" strokeWidth="1" />

      {/* Core sphere */}
      <circle cx="36" cy="36" r="12" fill="url(#el-core)" />
      <circle cx="32" cy="31" r="3.5" fill="white" fillOpacity="0.18" />

      {/* Orbital ring 1 — horizontal ellipse */}
      <ellipse
        cx="36" cy="36"
        rx="28" ry="10"
        stroke="url(#el-chrome-h)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        filter="url(#el-glow)"
      />

      {/* Orbital ring 2 — vertical ellipse */}
      <ellipse
        cx="36" cy="36"
        rx="10" ry="28"
        stroke="url(#el-chrome-v)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        filter="url(#el-glow)"
      />

      {/* Orbital ring 3 — diagonal ellipse */}
      <ellipse
        cx="36" cy="36"
        rx="28" ry="10"
        stroke="url(#el-chrome-d)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="6 4"
        transform="rotate(50 36 36)"
        opacity="0.7"
        filter="url(#el-glow)"
      />

      {/* Bright node points where rings intersect */}
      <circle cx="8"  cy="36" r="2.2" fill="#a78bfa" filter="url(#el-glow)" />
      <circle cx="64" cy="36" r="2.2" fill="#a78bfa" filter="url(#el-glow)" />
      <circle cx="36" cy="8"  r="2.2" fill="#c4b8e8" filter="url(#el-glow)" />
      <circle cx="36" cy="64" r="2.2" fill="#c4b8e8" filter="url(#el-glow)" />

      <style>{`
        @keyframes entangle-breathe {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(124,58,237,0.5)); transform: scale(1); }
          50%       { filter: drop-shadow(0 0 14px rgba(167,139,250,0.8)); transform: scale(1.04); }
        }
      `}</style>
    </svg>
  )
}
