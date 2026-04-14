import { NextRequest, NextResponse } from "next/server";
import { stripe, tierFromPriceId, type Tier } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import type Stripe from "stripe";

async function upsertSubscription(
  uid: string,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const tier: Tier = subscription.status === "active" || subscription.status === "trialing"
    ? tierFromPriceId(priceId)
    : "free";

  await adminDb()
    .collection("users")
    .doc(uid)
    .set(
      {
        tier,
        stripeCustomerId:     customerId,
        stripeSubscriptionId: subscription.id,
        stripeStatus:         subscription.status,
        stripePriceId:        priceId,
        currentPeriodEnd:     (subscription as unknown as { current_period_end: number }).current_period_end,
        updatedAt:            Date.now(),
      },
      { merge: true },
    );
}

/** Resolve UID from subscription metadata or reverse-lookup via customerId */
async function resolveUid(
  sub: Stripe.Subscription,
  customerId: string,
): Promise<string | null> {
  // 1. Prefer metadata set at subscription creation
  if (sub.metadata?.uid) return sub.metadata.uid;

  // 2. Fall back to Firestore reverse-lookup
  const snap = await adminDb()
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0].id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session    = event.data.object as Stripe.Checkout.Session;
        const uid        = session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";

        if (!uid || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string" ? session.subscription : session.subscription.id,
        );
        await upsertSubscription(uid, sub, customerId);
        break;
      }

      case "customer.subscription.updated": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const uid        = await resolveUid(sub, customerId);
        if (uid) await upsertSubscription(uid, sub, customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const uid        = await resolveUid(sub, customerId);
        if (uid) {
          await adminDb().collection("users").doc(uid).set(
            { tier: "free", stripeStatus: "canceled", updatedAt: Date.now() },
            { merge: true },
          );
        }
        break;
      }

      default:
        // Unhandled event — ignore
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
