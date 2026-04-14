"use client";
import { useEffect, useState, useCallback } from "react";
import {
  collection, onSnapshot, addDoc,
  orderBy, query, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivityType =
  | "demo_completed"
  | "sim_run"
  | "keys_generated"
  | "upgrade";

export interface ActivityEvent {
  id:         string;
  type:       ActivityType;
  demoKey?:   string;           // algorithm key (e.g. "grover")
  demoLabel?: string;           // human label (e.g. "Grover's Search")
  detail?:    string;           // free-form extra info
  timestamp:  number;           // ms epoch — converted from Firestore Timestamp
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Real-time feed of the user's recent activity, newest first.
 * Firestore path: users/{uid}/activity  (subcollection)
 *
 * @param limitCount Max events to subscribe to (default 20).
 */
export function useActivity(limitCount = 20) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents]   = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, "users", user.uid, "activity");
    const q      = query(colRef, orderBy("timestamp", "desc"), limit(limitCount));

    const unsub = onSnapshot(
      q,
      snap => {
        setEvents(
          snap.docs.map(d => {
            const data = d.data();
            return {
              id:         d.id,
              type:       data.type        as ActivityType,
              demoKey:    data.demoKey,
              demoLabel:  data.demoLabel,
              detail:     data.detail,
              // Firestore Timestamp → ms; fall back to now if missing
              timestamp:  data.timestamp?.toMillis?.() ?? Date.now(),
            } satisfies ActivityEvent;
          }),
        );
        setLoading(false);
      },
      err => {
        console.error("[useActivity]", err);
        setEvents([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, authLoading, limitCount]);

  // ── Write helper ───────────────────────────────────────────────────────────

  /** Append a new event to the user's activity feed. */
  const addEvent = useCallback(
    async (event: Omit<ActivityEvent, "id" | "timestamp">) => {
      if (!user || !db) return;
      const colRef = collection(db, "users", user.uid, "activity");
      await addDoc(colRef, { ...event, timestamp: serverTimestamp() });
    },
    [user],
  );

  return { events, loading, addEvent };
}
