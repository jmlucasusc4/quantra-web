"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";

const YEARLY_DISCOUNT = 0.25;

type Feature = { text: string; available: boolean };

interface Plan {
  name: string;
  price: number | null; // null = custom
  period: string;
  tagline: string;
  badge?: string;
  accentColor: string;
  accentBg: string;
  ctaLabel: string;
  ctaStyle: "primary" | "outline" | "enterprise";
  sections: { heading: string; features: Feature[] }[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    tagline: "Explore quantum fundamentals. No card needed.",
    accentColor: "rgba(255,255,255,0.7)",
    accentBg: "rgba(255,255,255,0.06)",
    ctaLabel: "Get Started Free",
    ctaStyle: "outline",
    sections: [
      {
        heading: "DEMOS",
        features: [
          { text: "Superposition", available: true },
          { text: "Entanglement", available: true },
          { text: "Bloch sphere", available: true },
          { text: "Deutsch-Jozsa", available: true },
          { text: "Grover's search", available: false },
          { text: "BB84 / QKD protocol", available: false },
          { text: "CRYSTALS-Kyber", available: false },
        ],
      },
      {
        heading: "TOOLS",
        features: [
          { text: "256-bit QRNG", available: true },
          { text: "Circuit builder", available: false },
          { text: "Risk auditor", available: false },
          { text: "Export results", available: false },
        ],
      },
    ],
  },
  {
    name: "Pro",
    price: 29,
    period: "mo",
    tagline: "For security professionals who need the full simulation suite.",
    badge: "Most Popular",
    accentColor: "#a855f7",
    accentBg: "rgba(124,58,237,0.18)",
    ctaLabel: "Start Pro Trial",
    ctaStyle: "primary",
    sections: [
      {
        heading: "EVERYTHING IN FREE, PLUS",
        features: [
          { text: "Grover's search", available: true },
          { text: "BB84 / QKD protocol", available: true },
          { text: "CRYSTALS-Kyber", available: true },
          { text: "Bernstein-Vazirani", available: true },
          { text: "Harvest now simulator", available: true },
          { text: "Shor's algorithm + RSA", available: false },
          { text: "API access", available: false },
        ],
      },
      {
        heading: "TOOLS",
        features: [
          { text: "Full circuit builder", available: true },
          { text: "Save & export results", available: true },
          { text: "Shareable result cards", available: true },
          { text: "Shor's algorithm", available: false },
        ],
      },
    ],
  },
  {
    name: "Research",
    price: 99,
    period: "mo",
    tagline: "Advanced algorithms and API access for teams and researchers.",
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
    ctaLabel: "Start Research Trial",
    ctaStyle: "outline",
    sections: [
      {
        heading: "EVERYTHING IN PRO, PLUS",
        features: [
          { text: "Shor's algorithm + RSA", available: true },
          { text: "Quantum teleportation", available: true },
          { text: "Simon's algorithm", available: true },
          { text: "Classical vs quantum speed", available: true },
          { text: "SSO / SAML", available: false },
          { text: "Compliance docs", available: false },
        ],
      },
      {
        heading: "PLATFORM",
        features: [
          { text: "REST API access", available: true },
          { text: "Bulk QRNG (up to 1 MB)", available: true },
          { text: "Org quantum risk reports", available: true },
          { text: "Up to 5 team seats", available: true },
        ],
      },
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    tagline: "For organizations with security budgets and compliance requirements.",
    accentColor: "#34d399",
    accentBg: "rgba(52,211,153,0.1)",
    ctaLabel: "Contact Sales",
    ctaStyle: "enterprise",
    sections: [
      {
        heading: "EVERYTHING IN RESEARCH, PLUS",
        features: [
          { text: "Unlimited team seats", available: true },
          { text: "SSO / SAML", available: true },
          { text: "FIPS 140-3 compliance docs", available: true },
          { text: "Custom SLA", available: true },
        ],
      },
      {
        heading: "SECURITY",
        features: [
          { text: "Dedicated instance option", available: true },
          { text: "Audit logs & access controls", available: true },
          { text: "Quarterly risk briefings", available: true },
          { text: "Priority support (4hr SLA)", available: true },
          { text: "Custom demo whitelabeling", available: true },
        ],
      },
    ],
  },
];

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const isEnterprise = plan.price === null;
  const displayPrice = isEnterprise
    ? null
    : yearly
    ? Math.round((plan.price! * (1 - YEARLY_DISCOUNT)))
    : plan.price;

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden relative"
      style={{
        background: plan.badge ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${plan.badge ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`,
        boxShadow: plan.badge ? "0 0 40px rgba(124,58,237,0.2)" : "none",
      }}>
      {plan.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
          <div className="flex items-baseline gap-1 mb-2">
            {isEnterprise ? (
              <span className="text-2xl font-bold" style={{ color: plan.accentColor }}>Custom</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-white">${displayPrice}</span>
                <span className="text-white/40 text-sm">/{plan.period}</span>
              </>
            )}
          </div>
          <p className="text-sm text-white/50 leading-snug">{plan.tagline}</p>
        </div>

        {/* CTA */}
        <Link href={plan.ctaStyle === "enterprise" ? "mailto:sales@quantra.ai" : "/signup"}
          className="block text-center py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all"
          style={
            plan.ctaStyle === "primary"
              ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }
              : plan.ctaStyle === "enterprise"
              ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
              : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }
          }>
          {plan.ctaLabel}
        </Link>

        {/* Feature sections */}
        <div className="space-y-5 flex-1">
          {plan.sections.map(section => (
            <div key={section.heading}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: plan.accentColor, opacity: 0.7 }}>
                {section.heading}
              </p>
              <ul className="space-y-1.5">
                {section.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2 text-sm"
                    style={{ color: f.available ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.22)" }}>
                    {f.available
                      ? <span style={{ color: plan.accentColor }}>›</span>
                      : <span className="w-3 h-px inline-block" style={{ background: "rgba(255,255,255,0.15)" }} />}
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">⚛️</span>
            <span className="font-bold text-lg tracking-tight text-white">Quantra</span>
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="text-white/50 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="px-4 py-1.5 rounded-lg font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="text-white/50">From learning fundamentals to enterprise-grade quantum risk auditing.</p>

          {/* Monthly / Yearly toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-sm ${!yearly ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button onClick={() => setYearly(y => !y)}
              className="w-12 h-6 rounded-full relative transition-colors cursor-pointer"
              style={{ background: yearly ? "#7c3aed" : "rgba(255,255,255,0.15)" }}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${yearly ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${yearly ? "text-white" : "text-white/40"}`}>
              Yearly
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}>
                Save 25%
              </span>
            </span>
          </div>
        </div>

        {/* Plan grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {PLANS.map(plan => (
            <PlanCard key={plan.name} plan={plan} yearly={yearly} />
          ))}
        </div>

        {/* Compare link */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/40">
            Not sure which plan?{" "}
            <a href="#compare" className="text-purple-400 hover:text-purple-300 transition-colors">
              Compare all plans in detail ↓
            </a>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-white/30">
          {[
            "All simulations run client-side",
            "Cancel anytime",
            "SOC 2 in progress",
            "NIST PQC aligned",
          ].map(badge => (
            <div key={badge} className="flex items-center gap-1.5">
              <span style={{ color: "#34d399" }}>●</span>
              {badge}
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
