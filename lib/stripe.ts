import Stripe from "stripe";

// Singleton — reused across hot-reloads in dev; created lazily so build succeeds without keys
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe;
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  const instance = new Stripe(stripeKey, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
  if (process.env.NODE_ENV !== "production") globalForStripe.stripe = instance;
  return instance;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ── Tier helpers ─────────────────────────────────────────────────────

export type Tier = "free" | "pro" | "research" | "enterprise";

const TIER_ORDER: Tier[] = ["free", "pro", "research", "enterprise"];

export function tierAtLeast(userTier: Tier, required: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

/** Maps Stripe price IDs → subscription tier */
export function tierFromPriceId(priceId: string): Tier {
  const map: Record<string, Tier> = {
    [process.env.STRIPE_PRICE_PRO_QUARTERLY ?? ""]:      "pro",
    [process.env.STRIPE_PRICE_PRO_YEARLY ?? ""]:         "pro",
    [process.env.STRIPE_PRICE_RESEARCH_QUARTERLY ?? ""]: "research",
    [process.env.STRIPE_PRICE_RESEARCH_YEARLY ?? ""]:    "research",
  };
  return map[priceId] ?? "free";
}
