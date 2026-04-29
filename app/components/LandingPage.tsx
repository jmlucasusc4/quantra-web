"use client";
import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "16", label: "Interactive Simulations" },
  { value: "NIST", label: "PQC Aligned (FIPS 203/204)" },
  { value: "0", label: "Install Required" },
];

const FEATURES = [
  {
    icon: "⚛️",
    title: "Run Quantum Algorithms Live",
    desc: "Superposition, entanglement, Grover's search, Shor's factoring — every simulation runs in your browser. No setup, no cloud queue.",
  },
  {
    icon: "🔐",
    title: "Get PQC-Ready Before Your Audit",
    desc: "Walk through CRYSTALS-Kyber, BB84 QKD, and the Harvest Now / Decrypt Later threat model. Built around NIST's finalized post-quantum standards.",
  },
  {
    icon: "⚠️",
    title: "Audit Your Cryptographic Stack",
    desc: "The Quantum Risk Auditor maps your algorithm inventory to quantum vulnerability levels — and tells you exactly what to migrate first.",
  },
];

const ALGORITHMS = [
  { label: "Superposition Demo",        difficulty: "Beginner",     free: true,  slug: "superposition" },
  { label: "BB84 Protocol (QKD)",       difficulty: "Intermediate", free: false, slug: "bb84-protocol" },
  { label: "CRYSTALS-Kyber (PQC)",      difficulty: "Intermediate", free: false, slug: "crystals-kyber" },
  { label: "Shor's Algorithm + RSA",    difficulty: "Advanced",     free: false, slug: "shors-algorithm" },
  { label: "Quantum Risk Auditor",      difficulty: "Beginner",     free: false, slug: "quantum-risk-auditor" },
  { label: "Harvest Now, Decrypt Later",difficulty: "Beginner",     free: false, slug: "harvest-now" },
];

const DIFF_COLOR: Record<string, string> = {
  Beginner:     "#34d399",
  Intermediate: "#fbbf24",
  Advanced:     "#f87171",
};

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl"
        style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/quantra-mark.png" alt="Quantra" width={53} height={40} />
            <span className="font-bold text-lg tracking-tight text-white">Quantra</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing"
              className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff" }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
          NIST PQC Standards Finalized — Are You Ready?
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-2xl mb-4">
          Master Quantum Computing.<br />
          <span style={{ background: "linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Secure the Future.
          </span>
        </h1>

        <p className="text-base sm:text-lg max-w-xl mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
          Interactive quantum algorithm simulations for developers and security professionals.
          Get PQC-ready before your next compliance audit.
        </p>

        {/* Trust bar — UX Auditor recommendation #2 */}
        <p className="text-xs mb-8 tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
          🔒 Browser-based, no install &nbsp;·&nbsp; NIST FIPS 203 / 204 aligned &nbsp;·&nbsp; 256-bit encrypted
        </p>

        {/* CTAs — UX Auditor recommendation #1 & #3 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup"
            className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            Start Free — No Credit Card
          </Link>
          <Link href="/pricing"
            className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
            See Pricing
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12 flex-wrap justify-center">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="glass p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NIST Proof of Work ── */}
      <section className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <p className="text-xs font-bold tracking-widest uppercase text-center mb-6" style={{ color: "rgba(212,175,106,0.7)" }}>
          Built on Published Standards
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "FIPS 203", sub: "ML-KEM (CRYSTALS-Kyber)", href: "https://csrc.nist.gov/pubs/fips/203/final", badge: "Finalized Aug 2024" },
            { label: "FIPS 204", sub: "ML-DSA (CRYSTALS-Dilithium)", href: "https://csrc.nist.gov/pubs/fips/204/final", badge: "Finalized Aug 2024" },
            { label: "FIPS 205", sub: "SLH-DSA (SPHINCS+)", href: "https://csrc.nist.gov/pubs/fips/205/final", badge: "Finalized Aug 2024" },
            { label: "NIST IR 8547", sub: "Transition to PQC Standards", href: "https://csrc.nist.gov/pubs/ir/8547/ipd", badge: "Initial Public Draft" },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="glass p-4 flex flex-col gap-1.5 hover:border-yellow-500/30 transition-colors group"
              style={{ textDecoration: "none" }}>
              <span className="font-mono text-sm font-bold group-hover:text-yellow-300 transition-colors" style={{ color: "#d4af6a" }}>{s.label}</span>
              <span className="text-xs text-white/50 leading-snug">{s.sub}</span>
              <span className="text-[10px] mt-1" style={{ color: "rgba(52,211,153,0.7)" }}>{s.badge} ↗</span>
            </a>
          ))}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          Every simulation maps to a specific NIST publication. Click any card to read the standard.
        </p>
      </section>

      {/* ── Algorithm preview ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <h2 className="text-xl font-bold text-white mb-2 text-center">16 Simulations. One Platform.</h2>
        <p className="text-sm text-center mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          From quantum fundamentals to NIST-standardized PQC algorithms.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALGORITHMS.map(a => (
            <div key={a.slug} className="glass p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{a.label}</p>
                <span className="text-xs font-semibold" style={{ color: DIFF_COLOR[a.difficulty] }}>
                  {a.difficulty}
                </span>
              </div>
              {a.free
                ? <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>Free</span>
                : <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>Pro</span>
              }
            </div>
          ))}
          <div className="glass p-4 flex items-center justify-center">
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>+ 10 more simulations →</span>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24 w-full text-center">
        <div className="glass p-10 rounded-2xl"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <h2 className="text-2xl font-bold text-white mb-3">
            Your RSA keys are already at risk.
          </h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            Nation-state adversaries are harvesting encrypted data today to decrypt once
            quantum computers arrive. Start your PQC readiness training now.
          </p>
          <Link href="/signup"
            className="inline-block px-10 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            Start Free — No Credit Card Required
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-xs border-t border-white/5"
        style={{ color: "rgba(255,255,255,0.2)" }}>
        <div className="flex justify-center gap-6 mb-2">
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/login"   className="hover:text-white/60 transition-colors">Log in</Link>
          <Link href="/signup"  className="hover:text-white/60 transition-colors">Sign up</Link>
        </div>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
