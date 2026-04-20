// TODO: remove before shipping — Stripe connectivity test only, no auth check
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",  // price is recurring — must be subscription not payment
      line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY, quantity: 1 }],
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
