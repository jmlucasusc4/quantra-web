"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SocialAuthButton } from "@/app/components/auth/SocialAuthButton";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="auth-card-glow w-full max-w-sm">
      <div className="auth-card p-8 space-y-6">

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src="/quantra-logo.png" alt="Quantra" width={80} height={80} />
          </div>
          <div>
            <h1 className="text-2xl auth-heading">Welcome Back</h1>
            <p className="text-sm mt-1 auth-subtext">Log in to Quantra</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/40 tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="auth-input"
              placeholder="you@example.com" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-white/40 tracking-wide">Password</label>
              <Link href="/reset-password" className="text-xs text-purple-400/70 hover:text-purple-300 transition-colors">Forgot password?</Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="auth-input"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.35), 0 4px 16px rgba(0,0,0,0.4)",
              transition: "box-shadow 0.2s, opacity 0.2s",
            }}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="space-y-2">
          <SocialAuthButton provider="google"    mode="signin" />
          <SocialAuthButton provider="github"    mode="signin" />
          <SocialAuthButton provider="microsoft" mode="signin" />
          <SocialAuthButton provider="twitter"   mode="signin" />
        </div>

        <p className="text-center text-sm text-white/35">
          No account?{" "}
          <Link href="/signup" className="text-purple-400/80 hover:text-purple-300 font-medium transition-colors">Sign Up</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
