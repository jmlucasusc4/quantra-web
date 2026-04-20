"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  confirmPasswordReset,
  applyActionCode,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ── Per-mode copy ──────────────────────────────────────────────────────────────

const MODE_COPY = {
  resetPassword: {
    heading: "Set New Password",
    sub:     "Choose a strong password for your Quantra account.",
  },
  verifyEmail: {
    heading: "Verify Email",
    sub:     "Confirming your email address…",
  },
  recoverEmail: {
    heading: "Recover Email",
    sub:     "Restoring your previous email address…",
  },
} as const;

type Mode = keyof typeof MODE_COPY;

// ── Main inner component (needs useSearchParams) ───────────────────────────────

function ActionHandler() {
  const params  = useSearchParams();
  const mode    = params.get("mode")    as Mode | null;
  const oobCode = params.get("oobCode") ?? "";

  const [status,   setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message,  setMessage]  = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy,     setBusy]     = useState(false);

  // Auto-apply for verifyEmail and recoverEmail on mount
  useEffect(() => {
    if (!oobCode || mode === "resetPassword") return;
    if (mode !== "verifyEmail" && mode !== "recoverEmail") {
      setStatus("error");
      setMessage("Unknown action. Please request a new link.");
      return;
    }
    setStatus("loading");
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success");
        setMessage(
          mode === "verifyEmail"
            ? "Your email has been verified. You can now log in."
            : "Your email address has been restored. You can now log in."
        );
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message ?? "The link is invalid or has expired.");
      });
  }, [mode, oobCode]);

  // Password reset submit
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage("Passwords don't match."); return; }
    setBusy(true); setMessage("");
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
      setMessage("Your password has been updated. You can now log in.");
    } catch (err: Error | unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "The link is invalid or has expired.");
    }
    setBusy(false);
  }

  const copy = mode && mode in MODE_COPY ? MODE_COPY[mode] : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d0b1a" }}>
      <div className="auth-card-glow w-full max-w-sm">
      <div className="auth-card p-8 space-y-6">

        {/* Logo + heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src="/quantra-logo.png" alt="Quantra" width={96} height={96} />
          </div>
          <div>
            <h1 className="text-2xl auth-heading">{copy?.heading ?? "Quantra"}</h1>
            {status === "idle" || status === "loading" ? (
              <p className="text-sm mt-1 auth-subtext">{copy?.sub ?? ""}</p>
            ) : null}
          </div>
        </div>

        {/* Loading spinner */}
        {status === "loading" && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-green-400 text-sm">{message}</p>
            <Link
              href="/login"
              className="block w-full py-3 rounded-xl font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)" }}
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-4 text-center">
            <p className="text-red-400 text-sm">{message}</p>
            <Link
              href="/login"
              className="block w-full py-3 rounded-xl font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)" }}
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Reset password form */}
        {mode === "resetPassword" && status !== "success" && status !== "error" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/40 tracking-wide">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/40 tracking-wide">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            {message && <p className="text-red-400 text-sm text-center">{message}</p>}

            <button
              type="submit"
              disabled={busy || !password || !confirm}
              className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 cursor-pointer"
              style={{
                background:  "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)",
                boxShadow:   "0 0 24px rgba(124,58,237,0.35), 0 4px 16px rgba(0,0,0,0.4)",
                transition:  "box-shadow 0.2s, opacity 0.2s",
              }}
            >
              {busy ? "Updating…" : "Set New Password"}
            </button>

            <Link href="/login" className="block text-center text-sm text-white/40 hover:text-white/60 transition-colors">
              Cancel
            </Link>
          </form>
        )}

      </div>
      </div>
    </div>
  );
}

// ── Page export with Suspense boundary (required for useSearchParams) ──────────

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0b1a" }}>
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    }>
      <ActionHandler />
    </Suspense>
  );
}
