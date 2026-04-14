"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Tier } from "@/lib/stripe";

export interface Subscription {
  tier: Tier;
  stripeStatus?: string;
  currentPeriodEnd?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const DEFAULT: Subscription = { tier: "free" };

export function useSubscription(): { sub: Subscription; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [sub, setSub]       = useState<Subscription>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      setSub(DEFAULT);
      setLoading(false);
      return;
    }

    // Safety net: if Firestore doesn't respond within 5 s, fall back to free tier
    const timeout = setTimeout(() => {
      console.warn("[useSubscription] Firestore timeout — defaulting to free tier");
      setSub(DEFAULT);
      setLoading(false);
    }, 5000);

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        clearTimeout(timeout);
        if (snap.exists()) {
          const data = snap.data() as Partial<Subscription>;
          setSub({ tier: data.tier ?? "free", ...data });
        } else {
          setSub(DEFAULT);
        }
        setLoading(false);
      },
      err => {
        clearTimeout(timeout);
        console.error("[useSubscription]", err);
        setSub(DEFAULT);
        setLoading(false);
      },
    );

    return () => { clearTimeout(timeout); unsub(); };
  }, [user, authLoading]);

  return { sub, loading };
}
