"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { tierAtLeast, type Tier } from "@/lib/stripe";

const TIER_LABELS: Record<Tier, string> = {
  free:       "Free",
  pro:        "Pro",
  research:   "Research",
  enterprise: "Enterprise",
};

const TIER_PRICE: Record<Tier, string> = {
  free:       "$0",
  pro:        "$29/mo",
  research:   "$99/mo",
  enterprise: "Custom",
};

interface Props {
  requiredTier: Tier;
  children: React.ReactNode;
}

export default function UpgradeGate({ requiredTier, children }: Props) {
  const { user }          = useAuth();
  const { sub, loading }  = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  // Free content never needs a subscription check — render immediately.
  if (requiredTier === "free") return <>{children}</>;

  if (loading) return <div className="h-40 flex items-center justify-center"><span className="text-white/30 text-sm">Loading…</span></div>;

  if (tierAtLeast(sub.tier, requiredTier)) return <>{children}</>;

  async function handleUpgrade() {
    if (!user) return;
    setUpgrading(true);
    setError("");
    try {
      // Map required tier to its quarterly price ID (default billing cadence)
      const PRICE_MAP: Record<string, string> = {
        pro:      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY      ?? "",
        research: process.env.NEXT_PUBLIC_STRIPE_PRICE_RESEARCH_QUARTERLY ?? "",
      };
      const priceId = PRICE_MAP[requiredTier];
      if (!priceId) {
        // Enterprise — send to pricing page
        window.location.href = "/pricing";
        return;
      }
      const idToken  = await user.getIdToken();
      const res      = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId, idToken }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error — please try again.");
    }
    setUpgrading(false);
  }

  return (
    <div className="relative">
      {/* Blurred preview of the locked content */}
      <div className="pointer-events-none select-none" style={{ filter: "blur(4px)", opacity: 0.35 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
        style={{ background: "rgba(15,5,48,0.7)", backdropFilter: "blur(2px)" }}>
        <div className="text-center max-w-xs px-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(168,85,247,0.3)" }}>
            🔒
          </div>
          <div>
            <p className="font-bold text-white">
              {TIER_LABELS[requiredTier]} feature
            </p>
            <p className="text-sm text-white/50 mt-1">
              This demo requires the {TIER_LABELS[requiredTier]} plan ({TIER_PRICE[requiredTier]}).
            </p>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {requiredTier === "enterprise" ? (
            <Link href="/pricing"
              className="block py-2.5 px-5 rounded-xl font-semibold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              Contact Sales
            </Link>
          ) : (
            <button onClick={handleUpgrade} disabled={upgrading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {upgrading ? "Redirecting…" : `Upgrade to ${TIER_LABELS[requiredTier]}`}
            </button>
          )}

          <Link href="/pricing" className="block text-xs text-white/30 hover:text-white/60 transition-colors">
            Compare all plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
