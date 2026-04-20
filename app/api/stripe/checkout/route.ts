import { NextRequest, NextResponse } from "next/server";
import { stripe, tierFromPriceId } from "@/lib/stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { priceId, idToken } = await req.json() as { priceId: string; idToken: string };

    if (!priceId || !idToken) {
      return NextResponse.json({ error: "Missing priceId or idToken" }, { status: 400 });
    }

    // Log token aud before verifying so we can spot project ID mismatches
    const rawPayload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    console.log("[stripe/checkout] token aud:", rawPayload.aud, "admin projectId:", process.env.FIREBASE_ADMIN_PROJECT_ID);

    // Verify Firebase ID token
    const decoded = await adminAuth().verifyIdToken(idToken);
    const uid   = decoded.uid;
    const email = decoded.email ?? "";

    // Validate price ID is one we recognise
    const tier = tierFromPriceId(priceId);
    if (tier === "free") {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Look up or create Stripe customer
    const userDoc = await adminDb().collection("users").doc(uid).get();
    let customerId: string | undefined = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { uid } });
      customerId = customer.id;
      await adminDb().collection("users").doc(uid).set({ stripeCustomerId: customerId }, { merge: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      client_reference_id: uid,
      mode:                 "subscription",
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           `${appUrl}/pricing`,
      subscription_data:    { metadata: { uid } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
