"use client";
import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Progress {
  completedDemos: string[];   // algorithm keys that have been completed
  simsRunTotal:   number;
  simsRunToday:   number;
  simsRunDate:    string;     // "YYYY-MM-DD" — resets simsRunToday when it changes
  keysGenerated:  number;     // cumulative BB84 / QRNG keys produced
}

const DEFAULT: Progress = {
  completedDemos: [],
  simsRunTotal:   0,
  simsRunToday:   0,
  simsRunDate:    "",
  keysGenerated:  0,
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProgress() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<Progress>(DEFAULT);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      setProgress(DEFAULT);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const d = snap.data();
          setProgress({
            completedDemos: d.completedDemos ?? [],
            simsRunTotal:   d.simsRunTotal   ?? 0,
            simsRunToday:   d.simsRunToday   ?? 0,
            simsRunDate:    d.simsRunDate    ?? "",
            keysGenerated:  d.keysGenerated  ?? 0,
          });
        } else {
          setProgress(DEFAULT);
        }
        setLoading(false);
      },
      err => {
        console.error("[useProgress]", err);
        setProgress(DEFAULT);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, authLoading]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  /** Mark a demo as completed. Idempotent — arrayUnion won't duplicate. */
  const markCompleted = useCallback(async (demoKey: string) => {
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { completedDemos: arrayUnion(demoKey) }, { merge: true });
  }, [user]);

  /** Increment both the all-time and today counters (resets today counter on new day). */
  const recordSimRun = useCallback(async () => {
    if (!user || !db) return;
    const today   = todayISO();
    const isToday = progress.simsRunDate === today;
    const ref     = doc(db, "users", user.uid);
    await setDoc(
      ref,
      {
        simsRunTotal: (progress.simsRunTotal ?? 0) + 1,
        simsRunToday: isToday ? (progress.simsRunToday ?? 0) + 1 : 1,
        simsRunDate:  today,
      },
      { merge: true },
    );
  }, [user, progress]);

  /** Accumulate QRNG / BB84 key count. */
  const recordKeysGenerated = useCallback(async (count: number) => {
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(
      ref,
      { keysGenerated: (progress.keysGenerated ?? 0) + count },
      { merge: true },
    );
  }, [user, progress]);

  const fractionCompleted = (total: number) =>
    total > 0 ? progress.completedDemos.length / total : 0;

  return {
    progress,
    loading,
    markCompleted,
    recordSimRun,
    recordKeysGenerated,
    fractionCompleted,
  };
}
