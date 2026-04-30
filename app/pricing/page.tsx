"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Pricing: quarterly is the default billing cadence; yearly saves ~25%
const PLANS_QUARTERLY = { PRO: 79, RESEARCH: 249 };
const PLANS_YEARLY    = { PRO: 276, RESEARCH: 948 };

// Static lookup so Next.js can replace NEXT_PUBLIC_ vars at build time.
// Dynamic bracket access (process.env[key]) bypasses build-time substitution.
const PRICE_IDS: Record<string, string> = {
  PRO_QUARTERLY:      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY      ?? "",
  PRO_YEARLY:         process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY         ?? "",
  RESEARCH_QUARTERLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_QUARTERLY ?? "",
  RESEARCH_YEARLY:    process.env.NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_YEARLY    ?? "",
};

type Feature = { text: string; available: boolean };

// Maps to env var suffix: STRIPE_PRICE_{priceKey}_QUARTERLY / _YEARLY
// null = free or enterprise (no Stripe checkout)
type PriceKey = "PRO" | "RESEARCH" | null;

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
  priceKey: PriceKey;
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
    priceKey: null,
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
    price: null, // dynamic — set by toggle
    period: "",
    tagline: "For security professionals who need the full simulation suite.",
    badge: "Most Popular",
    accentColor: "#a855f7",
    accentBg: "rgba(124,58,237,0.18)",
    ctaLabel: "Join Beta — Founding Member",
    ctaStyle: "primary",
    priceKey: "PRO",
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
    price: null, // dynamic — set by toggle
    period: "",
    tagline: "Advanced algorithms and API access for teams and researchers.",
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
    ctaLabel: "Join Research Beta",
    ctaStyle: "outline",
    priceKey: "RESEARCH",
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
    priceKey: null,
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
  const { user, loading: authLoading } = useAuth();
  const router   = useRouter();

  const isFree       = plan.name === "Free";
  const isEnterprise = plan.name === "Enterprise";
  const isPaid       = !isFree && !isEnterprise;

  // Resolve display price and period label from priceKey
  const quarterlyPrice = plan.priceKey ? PLANS_QUARTERLY[plan.priceKey] : null;
  const yearlyPrice    = plan.priceKey ? PLANS_YEARLY[plan.priceKey]    : null;
  const displayPrice   = isPaid ? (yearly ? yearlyPrice : quarterlyPrice) : 0;
  const periodLabel    = isPaid ? (yearly ? "/ year" : "/ quarter") : "forever";
  // Show per-month equivalent under the price
  const perMonth       = isPaid
    ? yearly
      ? `$${Math.round(yearlyPrice! / 12)}/mo billed annually`
      : `$${Math.round(quarterlyPrice! / 3)}/mo billed quarterly`
    : null;

  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  // Clear error when billing period toggles
  useEffect(() => { setErr(""); }, [yearly]);

  async function handleCta() {
    console.log("Button clicked");
    if (isFree) { router.push("/signup"); return; }
    if (isEnterprise) { window.location.href = "mailto:sales@quantra.ai"; return; }
    if (!plan.priceKey) return;

    console.log("User:", user?.uid);
    console.log("Auth loading:", authLoading);
    if (!user) { router.push("/login?next=/pricing"); return; }

    setBusy(true); setErr("");
    try {
      const suffix  = yearly ? "YEARLY" : "QUARTERLY";
      const priceId = (PRICE_IDS[`${plan.priceKey}_${suffix}`] ?? "").trim();
      if (!priceId) { setErr("Price not configured — contact support."); setBusy(false); return; }

      const idToken = await auth.currentUser?.getIdToken();
      console.log("[Stripe checkout] priceId:", priceId, "idToken:", idToken?.slice(0, 20));

      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId, idToken }),
      });
      console.log("API response:", res.status, await res.clone().json());
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setErr(data.error ?? "Something went wrong.");
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden relative"
      style={{
        background: plan.badge ? "rgba(124,58,237,0.14)" : "#0d0b1a",
        border: `1px solid ${plan.badge ? "rgba(168,85,247,0.45)" : "#2a2450"}`,
        boxShadow: plan.badge ? "0 0 48px rgba(124,58,237,0.22)" : "none",
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
          <div className="flex items-baseline gap-1 mb-1">
            {isEnterprise ? (
              <span className="text-2xl font-bold" style={{ color: plan.accentColor }}>Custom</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-white">${displayPrice}</span>
                <span className="text-white/40 text-sm">{periodLabel}</span>
              </>
            )}
          </div>
          {perMonth && <p className="text-xs text-white/30 mb-1">{perMonth}</p>}
          {plan.badge && <p className="text-xs mb-2" style={{ color: "rgba(167,139,250,0.7)" }}>Founding member pricing — locked for life</p>}
          <p className="text-sm text-white/50 leading-snug">{plan.tagline}</p>
        </div>

        {/* CTA */}
        {err && <p className="text-red-400 text-xs mb-2 text-center">{err}</p>}
        <button onClick={handleCta} disabled={busy || (isPaid && authLoading)}
          className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all cursor-pointer disabled:opacity-50"
          style={
            plan.ctaStyle === "primary"
              ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }
              : plan.ctaStyle === "enterprise"
              ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
              : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }
          }>
          {isPaid && authLoading ? "Loading…" : busy ? "Redirecting…" : plan.ctaLabel}
        </button>

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
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("[Stripe env]", {
      NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY:      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY,
      NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY:         process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
      NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_QUARTERLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_QUARTERLY,
      NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_YEARLY:    process.env.NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_YEARLY,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07050f", color: "#e2d9f3" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(7,5,15,0.92)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/quantra-mark.png" alt="Quantra" width={53} height={40} />
            <span className="font-bold text-lg tracking-tight text-white">Quantra</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {!authLoading && (
              user ? (
                <>
                  <span className="text-white/40 text-xs hidden sm:block">{user.email}</span>
                  <Link href="/"
                    className="text-white/60 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout().then(() => router.push("/login"))}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white/50 hover:text-white transition-colors">Log in</Link>
                  <Link href="/signup" className="px-4 py-1.5 rounded-lg font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    Sign up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="text-white/50">From learning fundamentals to enterprise-grade quantum risk auditing.</p>

          {/* Quarterly / Yearly toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-sm ${!yearly ? "text-white" : "text-white/40"}`}>Quarterly</span>
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
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", minWidth: 900 }}>
            {PLANS.map(plan => (
              <PlanCard key={plan.name} plan={plan} yearly={yearly} />
            ))}
          </div>
        </div>

        {/* Compare link */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/40">
            Not sure which plan?{" "}
            <a href="#compare" className="text-purple-400 hover:text-purple-300 transition-colors">
              Compare all features ↓
            </a>
          </p>
        </div>

        {/* Feature comparison table */}
        <div id="compare" className="mt-16 overflow-x-auto -mx-4 px-4">
          <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(167,139,250,0.6)" }}>Full Comparison</p>
          <table className="w-full text-sm" style={{ minWidth: 640, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="text-left pb-4 text-white/30 font-normal text-xs w-1/3">Feature</th>
                {["Free", "Pro", "Research", "Enterprise"].map(n => (
                  <th key={n} className="pb-4 text-center font-semibold text-white/80 text-xs">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Superposition / Entanglement / Bloch", "✓","✓","✓","✓"],
                ["Deutsch-Jozsa / Bernstein-Vazirani",   "✓","✓","✓","✓"],
                ["256-bit QRNG",                         "✓","✓","✓","✓"],
                ["Grover's search",                      "—","✓","✓","✓"],
                ["BB84 / QKD protocol",                  "—","✓","✓","✓"],
                ["CRYSTALS-Kyber (PQC)",                 "—","✓","✓","✓"],
                ["Harvest-now simulator",                "—","✓","✓","✓"],
                ["Full circuit builder",                 "—","✓","✓","✓"],
                ["Shor's algorithm + RSA",               "—","—","✓","✓"],
                ["Quantum teleportation",                "—","—","✓","✓"],
                ["Simon's algorithm",                    "—","—","✓","✓"],
                ["REST API access",                      "—","—","✓","✓"],
                ["Bulk QRNG (up to 1 MB)",               "—","—","✓","✓"],
                ["Org quantum risk reports",             "—","—","✓","✓"],
                ["Team seats",                           "1","1","5","Unlimited"],
                ["SSO / SAML",                           "—","—","—","✓"],
                ["FIPS 140-3 compliance docs",           "—","—","—","✓"],
                ["Dedicated instance",                   "—","—","—","✓"],
                ["Custom SLA / whitelabeling",           "—","—","—","✓"],
              ].map(([feature, ...cells], i) => (
                <tr key={feature} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                  <td className="py-2.5 pr-4 text-white/50 text-xs">{feature}</td>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="py-2.5 text-center text-xs font-mono"
                      style={{ color: cell === "—" ? "rgba(255,255,255,0.18)" : cell === "✓" ? "#a78bfa" : "#f0ebff" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

      <footer className="text-center py-6 text-xs border-t" style={{ color: "#2a2040", borderColor: "#0f0d1e" }}>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
