"use client";
import { useEffect, useState, useCallback } from "react";
import {
  collection, onSnapshot, addDoc,
  orderBy, query, limit, serverTimestamp,
  deleteDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SimResult {
  id:         string;
  demoKey:    string;              // algorithm key  (e.g. "grover")
  demoLabel:  string;              // human label    (e.g. "Grover's Search")
  counts:     Record<string, number>;  // measurement histogram
  shots:      number;              // e.g. 1024
  params?:    Record<string, unknown>; // optional algo params (numQubits, target, etc.)
  timestamp:  number;              // ms epoch
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Real-time list of saved simulation results for the current user, newest first.
 * Firestore path: users/{uid}/results  (subcollection)
 *
 * @param limitCount Max results to subscribe to (default 50).
 */
export function useResults(limitCount = 50) {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<SimResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      setResults([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, "users", user.uid, "results");
    const q      = query(colRef, orderBy("timestamp", "desc"), limit(limitCount));

    const unsub = onSnapshot(
      q,
      snap => {
        setResults(
          snap.docs.map(d => {
            const data = d.data();
            return {
              id:        d.id,
              demoKey:   data.demoKey,
              demoLabel: data.demoLabel,
              counts:    data.counts   ?? {},
              shots:     data.shots    ?? 1024,
              params:    data.params,
              timestamp: data.timestamp?.toMillis?.() ?? Date.now(),
            } satisfies SimResult;
          }),
        );
        setLoading(false);
      },
      err => {
        console.error("[useResults]", err);
        setResults([]);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, authLoading, limitCount]);

  // ── Write helpers ──────────────────────────────────────────────────────────

  /** Persist a simulation result to Firestore. Returns the new doc ID. */
  const saveResult = useCallback(
    async (result: Omit<SimResult, "id" | "timestamp">): Promise<string | null> => {
      if (!user || !db) return null;
      const colRef = collection(db, "users", user.uid, "results");
      const ref = await addDoc(colRef, { ...result, timestamp: serverTimestamp() });
      return ref.id;
    },
    [user],
  );

  /** Delete a saved result by its Firestore doc ID. */
  const deleteResult = useCallback(
    async (resultId: string) => {
      if (!user || !db) return;
      await deleteDoc(doc(db, "users", user.uid, "results", resultId));
    },
    [user],
  );

  return { results, loading, saveResult, deleteResult };
}
