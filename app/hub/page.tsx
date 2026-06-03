"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { QuantumLabHub } from "@/app/components/dashboard/QuantumLabHub";

export default function HubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading…</div>
    </div>
  );

  return <QuantumLabHub />;
}
