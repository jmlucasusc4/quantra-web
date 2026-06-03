"use client";

import Link from "next/link";
import Image from "next/image";

type Diff = "Beg" | "Int" | "Adv";

interface Card {
  slug: string;
  label: string;
  sub?: string;
  diff: Diff;
  icon: React.ReactNode;
}

const DIFF: Record<Diff, { label: string; color: string; bg: string; border: string }> = {
  Beg: { label: "Beg", color: "#34d399", bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.4)" },
  Int: { label: "Int", color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.4)"  },
  Adv: { label: "Adv", color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.4)" },
};

// ── SVG Icons ──────────────────────────────────────────────────────────────────

const SuperpositionIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <path d="M5 30 Q15 10 25 30 Q35 50 45 30 Q55 10 65 30 Q72 44 80 30"
      stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M5 30 Q15 50 25 30 Q35 10 45 30 Q55 50 65 30 Q72 16 80 30"
      stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <circle cx="40" cy="30" r="3" fill="#a78bfa" opacity="0.9"/>
    <line x1="40" y1="10" x2="40" y2="50" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3"/>
  </svg>
);

const EntanglementIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <circle cx="22" cy="30" r="14" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8"/>
    <circle cx="58" cy="30" r="14" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8"/>
    <path d="M30 22 Q40 30 50 22" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
    <path d="M30 38 Q40 30 50 38" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
    <circle cx="22" cy="30" r="3" fill="#a78bfa"/>
    <circle cx="58" cy="30" r="3" fill="#38bdf8"/>
    <text x="19" y="34" fill="white" fontSize="7" fontFamily="monospace" opacity="0.6">Q</text>
    <text x="55" y="34" fill="white" fontSize="7" fontFamily="monospace" opacity="0.6">Q</text>
  </svg>
);

const EntangledBlochIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    {[20, 60].map((cx, i) => (
      <g key={i}>
        <ellipse cx={cx} cy="30" rx="14" ry="14" stroke={i === 0 ? "#a78bfa" : "#38bdf8"} strokeWidth="1.2" opacity="0.8"/>
        <ellipse cx={cx} cy="30" rx="14" ry="5" stroke={i === 0 ? "#a78bfa" : "#38bdf8"} strokeWidth="0.8" opacity="0.4"/>
        <line x1={cx} y1="16" x2={cx} y2="44" stroke="white" strokeWidth="0.6" opacity="0.3"/>
        <line x1={cx - 14} y1="30" x2={cx + 14} y2="30" stroke="white" strokeWidth="0.6" opacity="0.3"/>
        <line x1={cx} y1="30" x2={cx + 10} y2="20" stroke={i === 0 ? "#e879f9" : "#34d399"} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    ))}
    <path d="M34 30 Q40 24 46 30" stroke="#e879f9" strokeWidth="1" strokeDasharray="2 2" opacity="0.7"/>
  </svg>
);

const BlochSphereIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <ellipse cx="40" cy="30" rx="22" ry="22" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
    <ellipse cx="40" cy="30" rx="22" ry="8" stroke="#a78bfa" strokeWidth="0.8" opacity="0.35"/>
    <line x1="40" y1="8" x2="40" y2="52" stroke="white" strokeWidth="0.7" opacity="0.3"/>
    <line x1="18" y1="30" x2="62" y2="30" stroke="white" strokeWidth="0.7" opacity="0.3"/>
    <line x1="40" y1="30" x2="56" y2="18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="56" cy="18" r="3" fill="#38bdf8"/>
    <text x="37" y="6" fill="white" fontSize="6" opacity="0.5">|0⟩</text>
    <text x="37" y="56" fill="white" fontSize="6" opacity="0.5">|1⟩</text>
  </svg>
);

const DeutschIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    {[20, 35, 50].map((y, i) => (
      <g key={i}>
        <line x1="8" y1={y} x2="72" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
        <rect x="20" y={y - 5} width="10" height="10" rx="2" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth="1"/>
        <text x="23" y={y + 3} fill="white" fontSize="5" opacity="0.8">H</text>
        <rect x="40" y={y - 5} width="14" height="10" rx="2" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" strokeWidth="1"/>
        <text x="43" y={y + 3} fill="white" fontSize="5" opacity="0.8">Uf</text>
        {i < 2 && <line x1="54" y1={y} x2="54" y2={y + 15} stroke="rgba(232,121,249,0.5)" strokeWidth="1" strokeDasharray="2 2"/>}
      </g>
    ))}
    <text x="5" y="23" fill="#a78bfa" fontSize="6" opacity="0.7">|0⟩</text>
    <text x="5" y="38" fill="#a78bfa" fontSize="6" opacity="0.7">|0⟩</text>
    <text x="5" y="53" fill="#a78bfa" fontSize="6" opacity="0.7">|1⟩</text>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="22" y="30" width="36" height="24" rx="4" fill="rgba(232,121,249,0.2)" stroke="#e879f9" strokeWidth="1.5"/>
    <path d="M30 30V22a10 10 0 0120 0v8" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="41" r="4" fill="#e879f9" opacity="0.9"/>
    <line x1="40" y1="45" x2="40" y2="50" stroke="#e879f9" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="14" cy="10" r="2" fill="#a78bfa" opacity="0.6"/>
    <circle cx="66" cy="10" r="2" fill="#38bdf8" opacity="0.6"/>
    <path d="M14 10 Q40 4 66 10" stroke="rgba(167,139,250,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
  </svg>
);

const QRNGIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="10" y="15" width="60" height="32" rx="4" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.4)" strokeWidth="1"/>
    {["1","0","1","1","0","1","0","1","1","0","1","0"].map((bit, i) => (
      <text key={i} x={14 + (i % 6) * 9} y={26 + Math.floor(i / 6) * 12}
        fill={bit === "1" ? "#34d399" : "rgba(255,255,255,0.3)"}
        fontSize="8" fontFamily="monospace">{bit}</text>
    ))}
    <circle cx="63" cy="48" r="5" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="1"/>
    <path d="M60 48 L62 50 L66 46" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BB84Icon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <circle cx="15" cy="30" r="8" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.2"/>
    <text x="11" y="33" fill="white" fontSize="7" opacity="0.8">A</text>
    <circle cx="65" cy="30" r="8" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.2"/>
    <text x="61" y="33" fill="white" fontSize="7" opacity="0.8">B</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <circle cx={28 + i * 8} cy="30" r="3" fill={i%2===0?"rgba(167,139,250,0.6)":"rgba(232,121,249,0.6)"}/>
        {i%2===0
          ? <line x1={28+i*8-2} y1={30-2} x2={28+i*8+2} y2={30+2} stroke="white" strokeWidth="0.8"/>
          : <><line x1={28+i*8} y1={30-3} x2={28+i*8} y2={30+3} stroke="white" strokeWidth="0.8"/>
              <line x1={28+i*8-3} y1={30} x2={28+i*8+3} y2={30} stroke="white" strokeWidth="0.8"/></>
        }
      </g>
    ))}
    <path d="M23 30 L57 30" stroke="rgba(255,255,255,0.15)" strokeWidth="6"/>
    <text x="32" y="50" fill="rgba(255,255,255,0.4)" fontSize="5" fontFamily="monospace">quantum channel</text>
  </svg>
);

const BVIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <text x="10" y="20" fill="#a78bfa" fontSize="8" fontFamily="monospace" opacity="0.9">s = 1011</text>
    <rect x="10" y="26" width="60" height="14" rx="3" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/>
    <text x="16" y="36" fill="#38bdf8" fontSize="7" fontFamily="monospace">1 query → found</text>
    <path d="M40 44 L40 52" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="14" y="58" fill="#34d399" fontSize="7" fontFamily="monospace" opacity="0.8">classical: n queries</text>
  </svg>
);

const HarvestIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="25" y="8" width="30" height="42" rx="4" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.4)" strokeWidth="1.2"/>
    <line x1="25" y1="30" x2="55" y2="30" stroke="rgba(248,113,113,0.3)" strokeWidth="1"/>
    <path d="M40 12 Q37 24 40 30 Q43 36 40 48" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="40" cy="30" rx="6" ry="3" fill="rgba(248,113,113,0.4)"/>
    <circle cx="14" cy="30" r="5" fill="rgba(248,113,113,0.2)" stroke="#f87171" strokeWidth="1"/>
    <path d="M11 30 L13 32 L17 28" stroke="#f87171" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="8" y="45" fill="rgba(248,113,113,0.6)" fontSize="5">NOW</text>
    <text x="56" y="45" fill="#f87171" fontSize="5">2030</text>
    <path d="M20 44 L60 44" stroke="rgba(248,113,113,0.3)" strokeWidth="0.8" markerEnd="url(#arr)"/>
  </svg>
);

const RiskIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <path d="M40 8 L56 16 L56 34 Q56 46 40 52 Q24 46 24 34 L24 16 Z"
      fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.5"/>
    <path d="M33 30 L38 35 L48 24" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="60" cy="14" r="6" fill="rgba(248,113,113,0.3)" stroke="#f87171" strokeWidth="1"/>
    <text x="57" y="17" fill="#f87171" fontSize="8" fontWeight="bold">!</text>
  </svg>
);

const KyberIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <polygon points="40,8 52,20 52,40 40,52 28,40 28,20" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="1.2"/>
    <polygon points="40,16 48,24 48,36 40,44 32,36 32,24" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="0.8"/>
    <polygon points="40,24 44,28 44,32 40,36 36,32 36,28" fill="rgba(232,121,249,0.3)" stroke="#e879f9" strokeWidth="0.8"/>
    <line x1="40" y1="8" x2="40" y2="52" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
    <line x1="28" y1="20" x2="52" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
    <line x1="52" y1="20" x2="28" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
  </svg>
);

const CircuitIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    {[15,28,41].map((y, row) => (
      <g key={row}>
        <line x1="6" y1={y} x2="74" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
        {[18,32,46,60].map((x, col) => (
          <rect key={col} x={x-5} y={y-5} width="10" height="10" rx="2"
            fill={`rgba(${row===0?'167,139,250':row===1?'56,189,248':'232,121,249'},0.25)`}
            stroke={`rgba(${row===0?'167,139,250':row===1?'56,189,248':'232,121,249'},0.7)`}
            strokeWidth="0.8"/>
        ))}
      </g>
    ))}
    <line x1="18" y1="28" x2="18" y2="41" stroke="rgba(232,121,249,0.5)" strokeWidth="0.8"/>
    <line x1="46" y1="15" x2="46" y2="28" stroke="rgba(232,121,249,0.5)" strokeWidth="0.8"/>
    <text x="5" y="18" fill="#a78bfa" fontSize="5" opacity="0.6">q₀</text>
    <text x="5" y="31" fill="#38bdf8" fontSize="5" opacity="0.6">q₁</text>
    <text x="5" y="44" fill="#e879f9" fontSize="5" opacity="0.6">q₂</text>
  </svg>
);

const CBOMIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="18" y="8" width="44" height="46" rx="4" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.35)" strokeWidth="1.2"/>
    {[18,26,34,42].map((y, i) => (
      <g key={i}>
        <rect x="25" y={y} width={i===0?30:i===1?22:i===2?26:18} height="4" rx="1"
          fill={i===0?"rgba(248,113,113,0.5)":i===1?"rgba(251,191,36,0.5)":"rgba(52,211,153,0.4)"}/>
      </g>
    ))}
    <rect x="14" y="36" width="16" height="16" rx="3" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1"/>
    <path d="M18 44 L20 46 L24 42" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PQCSwitchIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="10" y="22" width="26" height="16" rx="8" fill="rgba(248,113,113,0.2)" stroke="#f87171" strokeWidth="1.2"/>
    <circle cx="18" cy="30" r="5" fill="#f87171" opacity="0.9"/>
    <text x="8" y="48" fill="#f87171" fontSize="6" opacity="0.7">RSA</text>
    <rect x="44" y="22" width="26" height="16" rx="8" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="1.2"/>
    <circle cx="62" cy="30" r="5" fill="#34d399" opacity="0.9"/>
    <text x="42" y="48" fill="#34d399" fontSize="6" opacity="0.7">ML-KEM</text>
    <path d="M36 26 L44 26 M36 34 L44 34" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
    <path d="M37 30 L43 30" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#a)"/>
  </svg>
);

const PwIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <rect x="10" y="20" width="60" height="22" rx="4" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.35)" strokeWidth="1"/>
    <text x="16" y="34" fill="rgba(255,255,255,0.7)" fontSize="8" fontFamily="monospace">••••••••</text>
    <path d="M10 50 L25 50" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 50 L40 50" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M10 50 L70 50" stroke="#34d399" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <text x="10" y="58" fill="rgba(255,255,255,0.3)" fontSize="5">quantum crack time</text>
  </svg>
);

const ShorIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <text x="30" y="22" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace">N</text>
    <path d="M40 26 L28 40 M40 26 L52 40" stroke="rgba(248,113,113,0.5)" strokeWidth="1.2"/>
    <text x="22" y="50" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">p</text>
    <text x="46" y="50" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">q</text>
    <text x="8" y="34" fill="rgba(248,113,113,0.5)" fontSize="6">RSA broken</text>
  </svg>
);

const TeleportIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <circle cx="15" cy="30" r="10" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.2"/>
    <text x="11" y="33" fill="white" fontSize="7" opacity="0.7">|ψ⟩</text>
    <circle cx="65" cy="30" r="10" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="1.2"/>
    <text x="61" y="33" fill="white" fontSize="7" opacity="0.7">|ψ⟩</text>
    <path d="M25 30 Q40 10 55 30" stroke="#e879f9" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
    <path d="M25 30 Q40 50 55 30" stroke="rgba(56,189,248,0.5)" strokeWidth="1" strokeLinecap="round"/>
    <text x="33" y="22" fill="#e879f9" fontSize="5">entanglement</text>
    <text x="28" y="52" fill="rgba(56,189,248,0.5)" fontSize="5">2 classical bits</text>
  </svg>
);

const SimonIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    {[0,1,2,3,4,5,6,7].map(i => (
      <g key={i}>
        <line x1={8+i*9} y1="50" x2={8+i*9} y2={50-(i%4===0?32:i%4===1?20:i%4===2?32:20)}
          stroke={i<4?"#a78bfa":"#38bdf8"} strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
      </g>
    ))}
    <path d="M8 50 Q26 18 44 50 Q62 18 80 50" stroke="rgba(232,121,249,0.4)" strokeWidth="1" fill="none"/>
    <text x="14" y="12" fill="rgba(232,121,249,0.6)" fontSize="5">period s</text>
    <path d="M8 14 L44 14" stroke="rgba(232,121,249,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
  </svg>
);

const SpeedIcon = () => (
  <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
    <text x="6" y="16" fill="rgba(255,255,255,0.4)" fontSize="6">Classical O(N)</text>
    <path d="M8 22 L72 52" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="6" y="34" fill="rgba(255,255,255,0.4)" fontSize="6">Quantum O(√N)</text>
    <path d="M8 40 Q30 42 72 52" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="72" cy="52" r="2" fill="white" opacity="0.5"/>
  </svg>
);

// ── Card data ──────────────────────────────────────────────────────────────────

const FOUNDATIONS: Card[] = [
  { slug: "superposition",        label: "Superposition Demo",      diff: "Beg", icon: <SuperpositionIcon/> },
  { slug: "entanglement",         label: "Entanglement Demo",        diff: "Beg", icon: <EntanglementIcon/> },
  { slug: "entangled-bloch-spheres", label: "Entangled Bloch Sphere", diff: "Beg", icon: <EntangledBlochIcon/> },
  { slug: "bloch-sphere",         label: "Bloch Sphere",            diff: "Beg", icon: <BlochSphereIcon/> },
];

const ALGORITHMS: Card[] = [
  { slug: "deutsch-jozsa",       label: "Deutsch-Jozsa Algorithm",   sub: "Balanced / Constant",      diff: "Beg", icon: <DeutschIcon/> },
  { slug: "password-analyzer",   label: "Quantum Password Analysis", sub: "Grover crack time",         diff: "Adv", icon: <LockIcon/> },
  { slug: "qrng",                label: "Quantum Random N.",         sub: "True randomness",           diff: "Beg", icon: <QRNGIcon/> },
  { slug: "bb84-protocol",       label: "BB84 QKD Protocol",         sub: "Quantum key distribution",  diff: "Int", icon: <BB84Icon/> },
  { slug: "bernstein-vazirani",  label: "Bernstein-Vazirani",        sub: "Hidden string oracle",      diff: "Int", icon: <BVIcon/> },
  { slug: "pqc-switch",          label: "PQC Switch",                sub: "RSA vs ML-KEM",             diff: "Int", icon: <PQCSwitchIcon/> },
];

const APPLICATIONS: Card[] = [
  { slug: "harvest-now",         label: "Harvest Now, Decrypt Later", diff: "Beg", icon: <HarvestIcon/> },
  { slug: "quantum-risk-auditor",label: "Quantum Risk Auditor",       diff: "Beg", icon: <RiskIcon/> },
  { slug: "crystals-kyber",      label: "CRYSTALS-Kyber (PQC)",       diff: "Int", icon: <KyberIcon/> },
  { slug: "circuit-builder",     label: "Quantum Circuit Builder",    diff: "Int", icon: <CircuitIcon/> },
  { slug: "cbom-generator",      label: "CBOM Generator",             diff: "Int", icon: <CBOMIcon/> },
];

const LOCKED: Card[] = [
  { slug: "shors-algorithm",      label: "Shor's Algorithm + RSA",   diff: "Adv", icon: <ShorIcon/> },
  { slug: "quantum-teleportation",label: "Quantum Teleportation",     diff: "Adv", icon: <TeleportIcon/> },
  { slug: "simons-algorithm",     label: "Simon's Algorithm",         diff: "Adv", icon: <SimonIcon/> },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function DiffBadge({ diff }: { diff: Diff }) {
  const d = DIFF[diff];
  return (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ color: d.color, background: d.bg, border: `1px solid ${d.border}` }}>
      [{d.label}]
    </span>
  );
}

function LabCard({ card }: { card: Card }) {
  return (
    <Link href={`/?demo=${card.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "rgba(15,23,42,0.75)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 18px 2px rgba(167,139,250,0.18), 0 0 0 1px rgba(167,139,250,0.25)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.35)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <DiffBadge diff={card.diff} />

      {/* Icon area */}
      <div className="h-24 flex items-center justify-center p-3"
        style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-full h-full max-w-[90px]">
          {card.icon}
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2.5">
        <p className="text-white text-[11px] font-semibold uppercase tracking-wide leading-tight">
          {card.label}
        </p>
        {card.sub && (
          <p className="text-white/40 text-[9px] mt-0.5 font-mono">{card.sub}</p>
        )}
      </div>
    </Link>
  );
}

function LockedCard({ card }: { card: Card }) {
  return (
    <div className="relative rounded-xl overflow-hidden cursor-not-allowed"
      style={{
        background: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}>
      {/* Blurred content underneath */}
      <div className="blur-sm pointer-events-none">
        <div className="h-24 flex items-center justify-center p-3"
          style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-full h-full max-w-[90px]">
            {card.icon}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-white text-[11px] font-semibold uppercase tracking-wide">{card.label}</p>
        </div>
      </div>

      {/* Unlock overlay */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ background: "rgba(15,23,42,0.55)" }}>
        <Link href="/pricing"
          className="text-white font-bold text-lg tracking-wide hover:text-purple-300 transition-colors"
          onClick={e => e.stopPropagation()}>
          Unlock
        </Link>
      </div>
    </div>
  );
}

function PathSection({ title, cards }: { title: string; cards: Card[] }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium">Learning Path</p>
        <h2 className="text-white font-bold text-base tracking-wider">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {cards.map(c => <LabCard key={c.slug} card={c} />)}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function QuantumLabHub() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* ── Glassmorphism foreground panel — body handles the earthrise bg ── */}
      <div className="relative min-h-screen"
        style={{
          background: "rgba(5,8,20,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* Logo + Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
            <Image src="/quantra-mark.png" alt="Quantra" width={53} height={40} priority />
            <div>
              <h1 className="text-white font-black text-2xl sm:text-3xl tracking-wider leading-none">
                QUANTUM LAB HUBS
              </h1>
              <div className="mt-1 h-px w-24" style={{ background: "linear-gradient(90deg,#7c3aed,transparent)" }}/>
            </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/careers" className="text-xs text-white/50 hover:text-white transition-colors">Careers</Link>
              <Link href="/paths"   className="text-xs text-white/50 hover:text-white transition-colors hidden sm:block">Paths</Link>
              <Link href="/pricing" className="text-xs text-white/50 hover:text-white transition-colors hidden sm:block">Pricing</Link>
              <Link href="/pricing"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                Upgrade Pro
              </Link>
            </div>
          </div>

          {/* Learning path rows */}
          <PathSection title="QUANTUM FOUNDATIONS"    cards={FOUNDATIONS} />
          <PathSection title="ALGORITHMS & PROTOCOLS" cards={ALGORITHMS}  />
          <PathSection title="QUANTUM APPLICATIONS"   cards={APPLICATIONS}/>

          {/* Locked & Pro row */}
          <div>
            <div className="mb-3">
              <h2 className="text-white/50 font-bold text-base tracking-wider flex items-center gap-2">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                LOCKED &amp; PRO
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LOCKED.map(c => <LockedCard key={c.slug} card={c} />)}
            </div>
          </div>

          {/* Sparkle watermark */}
          <div className="flex justify-end pb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 opacity-20">
              <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                fill="white"/>
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}
