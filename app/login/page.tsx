"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SocialAuthButton } from "@/app/components/auth/SocialAuthButton";
import { EntanglementLogo } from "@/app/components/ui/EntanglementLogo";

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
      <div className="glass w-full max-w-sm p-8 space-y-6">

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EntanglementLogo size={90} animate />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-white/40 tracking-wide mt-0.5">Log in to Quantra</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/50">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/7 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-purple-500 transition-colors"
              placeholder="you@example.com" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-white/50">Password</label>
              <Link href="/reset-password" className="text-xs text-purple-400 hover:text-purple-300">Forgot password?</Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/7 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
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

        <p className="text-center text-sm text-white/40">
          No account?{" "}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
