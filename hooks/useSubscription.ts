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

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = snap.data() as Partial<Subscription>;
          setSub({ tier: data.tier ?? "free", ...data });
        } else {
          setSub(DEFAULT);
        }
        setLoading(false);
      },
      err => {
        console.error("[useSubscription]", err);
        setSub(DEFAULT);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, authLoading]);

  return { sub, loading };
}
