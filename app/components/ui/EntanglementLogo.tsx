'use client'

interface Props {
  size?: number
  animate?: boolean
}

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'q-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        <filter id="q-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="q-outer-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>

        {/* Sphere: solid base + metallic highlight */}
        <radialGradient id="q-sphere-base" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#e8e0f8"/>
          <stop offset="18%"  stopColor="#b49fdc"/>
          <stop offset="45%"  stopColor="#6d28d9"/>
          <stop offset="75%"  stopColor="#2e1a6e"/>
          <stop offset="100%" stopColor="#130e28"/>
        </radialGradient>

        {/* Rim light */}
        <radialGradient id="q-rim" cx="50%" cy="50%" r="50%">
          <stop offset="72%"  stopColor="transparent"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7"/>
        </radialGradient>

        {/* Ambient purple glow behind everything */}
        <radialGradient id="q-bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
        </radialGradient>

        {/* Ring chrome gradients */}
        <linearGradient id="q-rg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#4c1d95" stopOpacity="0.5"/>
          <stop offset="28%"  stopColor="#ddd6f3"/>
          <stop offset="55%"  stopColor="#a78bfa"/>
          <stop offset="80%"  stopColor="#c4b8e8"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="q-rg2" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%"   stopColor="#5b21b6" stopOpacity="0.5"/>
          <stop offset="35%"  stopColor="#ede9fe"/>
          <stop offset="65%"  stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="q-rg3" x1="85%" y1="0%" x2="15%" y2="100%">
          <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0.5"/>
          <stop offset="40%"  stopColor="#ddd6f3"/>
          <stop offset="70%"  stopColor="#9d77e8"/>
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.5"/>
        </linearGradient>

        <clipPath id="q-sphere-clip">
          <circle cx="50" cy="50" r="21.5"/>
        </clipPath>
      </defs>

      {/* Ambient glow */}
      <circle cx="50" cy="50" r="48" fill="url(#q-bg-glow)"/>

      {/* ── BACK ring arcs (dim — far side) ── */}
      <path d="M 7,50 A 43,12.5 0 0,0 93,50"
        stroke="url(#q-rg1)" strokeWidth="2.2" strokeLinecap="round" fill="none"
        opacity="0.28" filter="url(#q-glow)"/>
      <path d="M 7,50 A 43,12.5 0 0,0 93,50"
        stroke="url(#q-rg2)" strokeWidth="2.2" strokeLinecap="round" fill="none"
        opacity="0.28" filter="url(#q-glow)"
        transform="rotate(60,50,50)"/>
      <path d="M 7,50 A 43,12.5 0 0,0 93,50"
        stroke="url(#q-rg3)" strokeWidth="2.2" strokeLinecap="round" fill="none"
        opacity="0.28" filter="url(#q-glow)"
        transform="rotate(-60,50,50)"/>

      {/* ── SPHERE ── */}
      {/* Dark backing so sphere is visible against dark page */}
      <circle cx="50" cy="50" r="22" fill="#0f0a22"/>
      {/* Metallic gradient sphere */}
      <circle cx="50" cy="50" r="22" fill="url(#q-sphere-base)"/>

      {/* Cage lattice clipped inside sphere */}
      <g clipPath="url(#q-sphere-clip)" opacity="0.5">
        {/* Latitude bands */}
        <ellipse cx="50" cy="43" rx="19.5" ry="3.5"  stroke="#a78bfa" strokeWidth="0.6" fill="none"/>
        <ellipse cx="50" cy="50" rx="21.5" ry="4.2"  stroke="#a78bfa" strokeWidth="0.6" fill="none"/>
        <ellipse cx="50" cy="57" rx="19.5" ry="3.5"  stroke="#a78bfa" strokeWidth="0.6" fill="none"/>
        {/* Meridian arcs */}
        <ellipse cx="50" cy="50" rx="3.5" ry="21.5"  stroke="#a78bfa" strokeWidth="0.6" fill="none"/>
        <ellipse cx="50" cy="50" rx="3.5" ry="21.5"  stroke="#a78bfa" strokeWidth="0.6" fill="none" transform="rotate(60,50,50)"/>
        <ellipse cx="50" cy="50" rx="3.5" ry="21.5"  stroke="#a78bfa" strokeWidth="0.6" fill="none" transform="rotate(-60,50,50)"/>
      </g>

      {/* Rim light */}
      <circle cx="50" cy="50" r="22" fill="url(#q-rim)"/>
      {/* Sphere border */}
      <circle cx="50" cy="50" r="22" stroke="#7c3aed" strokeWidth="0.6" strokeOpacity="0.5" fill="none"/>

      {/* Specular highlights */}
      <ellipse cx="44" cy="42" rx="7" ry="4.5" fill="white" opacity="0.15" transform="rotate(-25,44,42)"/>
      <circle  cx="41" cy="40" r="2.5"         fill="white" opacity="0.22"/>

      {/* ── FRONT ring arcs (bright — near side) ── */}
      <path d="M 7,50 A 43,12.5 0 0,1 93,50"
        stroke="url(#q-rg1)" strokeWidth="3.2" strokeLinecap="round" fill="none"
        filter="url(#q-glow)"/>
      <path d="M 7,50 A 43,12.5 0 0,1 93,50"
        stroke="url(#q-rg2)" strokeWidth="3.2" strokeLinecap="round" fill="none"
        filter="url(#q-glow)"
        transform="rotate(60,50,50)"/>
      <path d="M 7,50 A 43,12.5 0 0,1 93,50"
        stroke="url(#q-rg3)" strokeWidth="3.2" strokeLinecap="round" fill="none"
        filter="url(#q-glow)"
        transform="rotate(-60,50,50)"/>

      {/* Small glowing tips at ring ends */}
      <circle cx="7"  cy="50"    r="1.8" fill="#c4b8e8" filter="url(#q-glow)"/>
      <circle cx="93" cy="50"    r="1.8" fill="#c4b8e8" filter="url(#q-glow)"/>
      <circle cx="28.5" cy="19"  r="1.8" fill="#a78bfa" filter="url(#q-glow)"/>
      <circle cx="71.5" cy="81"  r="1.8" fill="#a78bfa" filter="url(#q-glow)"/>
      <circle cx="28.5" cy="81"  r="1.8" fill="#a78bfa" filter="url(#q-glow)"/>
      <circle cx="71.5" cy="19"  r="1.8" fill="#a78bfa" filter="url(#q-glow)"/>

      <style>{`
        @keyframes q-breathe {
          0%,100% { filter: drop-shadow(0 0 5px rgba(124,58,237,0.4)); }
          50%      { filter: drop-shadow(0 0 18px rgba(167,139,250,0.9)); }
        }
      `}</style>
    </svg>
  )
}
