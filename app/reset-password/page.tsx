"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass w-full max-w-sm p-8 space-y-6">

        <div className="text-center space-y-1">
          <div className="text-4xl">🔑</div>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-white/40">We&apos;ll send a reset link to your email.</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-400 text-sm">Reset link sent to <strong>{email}</strong></p>
            <Link href="/login" className="block w-full py-3 rounded-xl font-semibold text-white text-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/50">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/7 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-purple-500 transition-colors"
                placeholder="you@example.com" />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading || !email}
              className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <Link href="/login" className="block text-center text-sm text-white/40 hover:text-white/60">
              Cancel
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
