'use client'
// EntanglementLogo.tsx
// 3D metallic orb with cage lattice and three orbital rings at 60° intervals.
// Layer order: back ring arcs → sphere + lattice → front ring arcs → glow nodes

interface Props {
  size?: number
  animate?: boolean
}

export function EntanglementLogo({ size = 80, animate = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'q-breathe 4s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* Soft glow */}
        <filter id="q-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="q-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>

        {/* Sphere: metallic chrome, highlight at upper-left */}
        <radialGradient id="q-sphere" cx="36%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#ddd6f3"/>
          <stop offset="20%"  stopColor="#a78bfa"/>
          <stop offset="55%"  stopColor="#4c1d95"/>
          <stop offset="100%" stopColor="#130e28"/>
        </radialGradient>

        {/* Subtle rim light on sphere edge */}
        <radialGradient id="q-rim" cx="50%" cy="50%" r="50%">
          <stop offset="78%"  stopColor="transparent"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6"/>
        </radialGradient>

        {/* Background ambient glow */}
        <radialGradient id="q-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
        </radialGradient>

        {/* Ring gradients — chrome purple, each oriented differently */}
        <linearGradient id="q-r1" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%"   stopColor="#4c1d95" stopOpacity="0.7"/>
          <stop offset="30%"  stopColor="#c4b8e8"/>
          <stop offset="70%"  stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="q-r2" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0.7"/>
          <stop offset="40%"  stopColor="#e2d9f3"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="q-r3" x1="80%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.7"/>
          <stop offset="45%"  stopColor="#ddd6f3"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.7"/>
        </linearGradient>

        {/* Clip to sphere interior for lattice */}
        <clipPath id="q-clip">
          <circle cx="48" cy="48" r="15.8"/>
        </clipPath>
      </defs>

      {/* Ambient background glow */}
      <circle cx="48" cy="48" r="46" fill="url(#q-ambient)"/>

      {/* ── BACK arcs (lower opacity — the far side of each ring) ── */}
      {/* Ring 1 back (bottom arc) */}
      <path d="M 13,48 A 35,10.5 0 0,0 83,48"
        stroke="url(#q-r1)" strokeWidth="1.8" fill="none" opacity="0.32" filter="url(#q-glow)"/>
      {/* Ring 2 back */}
      <path d="M 13,48 A 35,10.5 0 0,0 83,48"
        stroke="url(#q-r2)" strokeWidth="1.8" fill="none" opacity="0.32" filter="url(#q-glow)"
        transform="rotate(60,48,48)"/>
      {/* Ring 3 back */}
      <path d="M 13,48 A 35,10.5 0 0,0 83,48"
        stroke="url(#q-r3)" strokeWidth="1.8" fill="none" opacity="0.32" filter="url(#q-glow)"
        transform="rotate(-60,48,48)"/>

      {/* ── SPHERE ── */}
      <circle cx="48" cy="48" r="16" fill="url(#q-sphere)"/>

      {/* Cage lattice clipped inside sphere */}
      <g clipPath="url(#q-clip)" opacity="0.45">
        {/* Latitude rings */}
        <ellipse cx="48" cy="42.5" rx="13.5" ry="2.8"  stroke="#a78bfa" strokeWidth="0.55" fill="none"/>
        <ellipse cx="48" cy="48"   rx="15.8" ry="3.4"  stroke="#a78bfa" strokeWidth="0.55" fill="none"/>
        <ellipse cx="48" cy="53.5" rx="13.5" ry="2.8"  stroke="#a78bfa" strokeWidth="0.55" fill="none"/>
        {/* Meridian arcs */}
        <ellipse cx="48" cy="48" rx="2.8" ry="15.8" stroke="#a78bfa" strokeWidth="0.55" fill="none"/>
        <ellipse cx="48" cy="48" rx="2.8" ry="15.8" stroke="#a78bfa" strokeWidth="0.55" fill="none" transform="rotate(60,48,48)"/>
        <ellipse cx="48" cy="48" rx="2.8" ry="15.8" stroke="#a78bfa" strokeWidth="0.55" fill="none" transform="rotate(-60,48,48)"/>
      </g>

      {/* Sphere border rim light */}
      <circle cx="48" cy="48" r="16" fill="url(#q-rim)" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.4"/>

      {/* Specular highlight — sharp white spot upper-left */}
      <ellipse cx="43" cy="41.5" rx="5.5" ry="3.5" fill="white" opacity="0.18" transform="rotate(-20,43,41.5)"/>
      <circle  cx="41" cy="40"   r="1.8"            fill="white" opacity="0.25"/>

      {/* ── FRONT arcs (full opacity — near side of each ring) ── */}
      {/* Ring 1 front (top arc) */}
      <path d="M 13,48 A 35,10.5 0 0,1 83,48"
        stroke="url(#q-r1)" strokeWidth="2.4" fill="none" filter="url(#q-glow)"/>
      {/* Ring 2 front */}
      <path d="M 13,48 A 35,10.5 0 0,1 83,48"
        stroke="url(#q-r2)" strokeWidth="2.4" fill="none" filter="url(#q-glow)"
        transform="rotate(60,48,48)"/>
      {/* Ring 3 front */}
      <path d="M 13,48 A 35,10.5 0 0,1 83,48"
        stroke="url(#q-r3)" strokeWidth="2.4" fill="none" filter="url(#q-glow)"
        transform="rotate(-60,48,48)"/>

      {/* ── Glowing nodes at ring endpoints ── */}
      {/* Ring 1 endpoints */}
      <circle cx="13" cy="48" r="2.8" fill="#c4b8e8" filter="url(#q-glow-strong)"/>
      <circle cx="83" cy="48" r="2.8" fill="#c4b8e8" filter="url(#q-glow-strong)"/>
      {/* Ring 2 endpoints: rotate(60,48,48) of (13,48) → (30.5,18.6) and (83,48) → (65.5,77.4) */}
      <circle cx="30.5" cy="18.6" r="2.8" fill="#a78bfa" filter="url(#q-glow-strong)"/>
      <circle cx="65.5" cy="77.4" r="2.8" fill="#a78bfa" filter="url(#q-glow-strong)"/>
      {/* Ring 3 endpoints: rotate(-60,48,48) of (13,48) → (30.5,77.4) and (83,48) → (65.5,18.6) */}
      <circle cx="30.5" cy="77.4" r="2.8" fill="#a78bfa" filter="url(#q-glow-strong)"/>
      <circle cx="65.5" cy="18.6" r="2.8" fill="#a78bfa" filter="url(#q-glow-strong)"/>

      <style>{`
        @keyframes q-breathe {
          0%,100% { filter: drop-shadow(0 0 6px rgba(124,58,237,0.45)); }
          50%      { filter: drop-shadow(0 0 18px rgba(167,139,250,0.85)); }
        }
      `}</style>
    </svg>
  )
}
