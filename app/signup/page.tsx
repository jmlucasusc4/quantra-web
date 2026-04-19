"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { SocialAuthButton } from "@/app/components/auth/SocialAuthButton";
import Image from "next/image";

const RULES = [
  { label: "At least 8 characters",         check: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",          check: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",          check: (p: string) => /[a-z]/.test(p) },
  { label: "One number",                    check: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)", check: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(p) },
];

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const rules = RULES.map(r => ({ ...r, pass: r.check(password) }));
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = firstName.trim().length > 0 && rules.every(r => r.pass) && passwordsMatch && email.includes("@");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(""); setLoading(true);
    try {
      await signUp(email, password);
      if (auth.currentUser) {
        const name = firstName.trim();
        await updateProfile(auth.currentUser, { displayName: name });
        await setDoc(doc(db, "users", auth.currentUser.uid), { displayName: name }, { merge: true });
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="auth-card-glow w-full max-w-sm">
      <div className="auth-card p-8 space-y-6">

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src="/quantra-logo.png" alt="Quantra" width={96} height={96} />
          </div>
          <div>
            <h1 className="text-2xl auth-heading">Create Account</h1>
            <p className="text-sm mt-1 auth-subtext">Join Quantra</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/40 tracking-wide">First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
              className="auth-input"
              placeholder="Jane" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="auth-input"
              placeholder="you@example.com" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="auth-input"
              placeholder="••••••••" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 tracking-wide">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="auth-input"
              placeholder="••••••••" />
          </div>

          {password && (
            <div className="space-y-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
              {rules.map(r => (
                <div key={r.label} className="flex items-center gap-2 text-xs">
                  <span className={r.pass ? "text-green-400" : "text-white/25"}>
                    {r.pass ? "✓" : "○"}
                  </span>
                  <span className={r.pass ? "text-white/70" : "text-white/25"}>{r.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs">
                <span className={passwordsMatch ? "text-green-400" : "text-white/25"}>
                  {passwordsMatch ? "✓" : "○"}
                </span>
                <span className={passwordsMatch ? "text-white/70" : "text-white/25"}>Passwords match</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={!canSubmit || loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-30 cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.35), 0 4px 16px rgba(0,0,0,0.4)",
              transition: "box-shadow 0.2s, opacity 0.2s",
            }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="space-y-2">
          <SocialAuthButton provider="google" mode="signup" />
          <SocialAuthButton provider="github" mode="signup" />
        </div>

        <p className="text-center text-sm text-white/35">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400/80 hover:text-purple-300 font-medium transition-colors">Log In</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
