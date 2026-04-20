// TODO: remove before shipping — Stripe connectivity test only, no auth check
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const env = (key: string) => process.env[key]?.trim() ?? "";

export async function GET() {
  try {
    const priceId = env("NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY");
    console.log("[test-checkout] priceId:", priceId);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://quantra.space/dashboard?upgrade=success",
      cancel_url:  "https://quantra.space/pricing",
    });
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
