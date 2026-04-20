import { NextRequest, NextResponse } from "next/server";
import { stripe, tierFromPriceId } from "@/lib/stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { priceId, idToken } = await req.json() as { priceId: string; idToken: string };

    if (!priceId || !idToken) {
      return NextResponse.json({ error: "Missing priceId or idToken" }, { status: 400 });
    }

    // Log token prefix and aud to confirm it's a valid JWT and spot project mismatches
    console.log("[stripe/checkout] idToken prefix:", idToken.slice(0, 20));
    const rawPayload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    console.log("[stripe/checkout] token aud:", rawPayload.aud, "admin projectId:", process.env.FIREBASE_ADMIN_PROJECT_ID);

    // Verify Firebase ID token — isolated try/catch to surface auth errors clearly
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(idToken);
    } catch (authErr: unknown) {
      const msg  = authErr instanceof Error ? authErr.message : String(authErr);
      const code = (authErr as Record<string, unknown>)?.code ?? "unknown";
      console.error("[stripe/checkout] verifyIdToken failed — code:", code, "message:", msg);
      return NextResponse.json({ error: `Token verification failed: ${msg}`, code }, { status: 401 });
    }
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

    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      client_reference_id: uid,
      mode:                 "subscription",
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          "https://quantra.space/dashboard?upgrade=success",
      cancel_url:           "https://quantra.space/pricing?upgrade=cancelled",
      subscription_data:    { metadata: { uid } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
