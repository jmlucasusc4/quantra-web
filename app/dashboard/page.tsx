"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { useProgress } from "@/hooks/useProgress";
import { useActivity, activityLabel, relativeTime } from "@/hooks/useActivity";
import type { Tier } from "@/lib/stripe";
import Image from "next/image";
import { saveCertificate, makeCertId } from "@/lib/certificates";
import { EmptyDashboardState } from "@/app/components/dashboard/EmptyState";
import { QuantumCertificate } from "@/app/components/dashboard/QuantumCertificate";
import { OnboardingModal } from "@/app/components/onboarding/OnboardingModal";
import { SkillTree } from "@/app/components/dashboard/SkillTree";
import { TelemetryWidget } from "@/app/components/dashboard/TelemetryWidget";
import { QuickResume } from "@/app/components/dashboard/QuickResume";

// ── Tier presentation ──────────────────────────────────────────────────────────

const TIER_LABEL: Record<Tier, string> = {
  free:       "Free",
  pro:        "Pro",
  research:   "Research",
  enterprise: "Enterprise",
};

const TIER_BADGE: Record<Tier, string> = {
  free:       "bg-white/10 text-white/60 border-white/15",
  pro:        "bg-purple-600/25 text-purple-300 border-purple-500/40",
  research:   "bg-orange-600/25 text-orange-300 border-orange-500/40",
  enterprise: "bg-yellow-600/25 text-yellow-300 border-yellow-500/40",
};

// ── Small reusable pieces ──────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#13102a] border border-purple-900/30 p-5 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs text-white/40 uppercase tracking-widest">{label}</span>
      <span className="text-3xl font-semibold text-white">{value}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </Card>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round(value));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-purple-300 font-mono">{pct}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const LEVEL_COLOR = {
  novice:      "text-white/50",
  developing:  "text-blue-400",
  proficient:  "text-purple-400",
  expert:      "text-yellow-400",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { sub, loading: subLoading, hasAccess }  = useSubscription();
  const { completedDemos, readiness, loading: progressLoading } = useProgress();
  const { activities, loading: actLoading }     = useActivity(15);

  // Redirect unauthenticated visitors
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/dashboard");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0d0b1a] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const tier        = sub.tier ?? "free";
  const periodEnd   = (sub as any).currentPeriodEnd as number | undefined;
  const totalSims   = (sub as any).totalSimsRun        as number | undefined ?? 0;
  const keysGen     = (sub as any).totalKeysGenerated   as number | undefined ?? 0;

  const renewalText = periodEnd
    ? `Renews ${new Date(periodEnd * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : tier === "free" ? "No active subscription" : null;

  const loading = subLoading || progressLoading;

  const ALL_DEMO_SLUGS = [
    'superposition','entanglement','bloch-sphere','deutsch-jozsa',
    'classical-vs-quantum','grovers-search','bb84-protocol','crystals-kyber',
    'harvest-now','quantum-risk-auditor','bernstein-vazirani','circuit-builder',
    'simons-algorithm','shors-algorithm','quantum-teleportation',
  ];
  const allComplete = ALL_DEMO_SLUGS.every(s => completedDemos.includes(s));
  const certId = makeCertId(user.uid);

  useEffect(() => {
    if (!allComplete) return;
    saveCertificate({
      certId,
      uid: user.uid,
      displayName: user.displayName ?? user.email ?? "Quantum Scholar",
      readiness,
    }).catch(() => {});
  }, [allComplete, certId, user.uid, user.displayName, user.email, readiness]);

  return (
    <div className="min-h-screen bg-[#0d0b1a] text-white">
      <OnboardingModal />
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0d0b1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/quantra-mark.png" alt="Quantra" width={53} height={40} />
            <span className="font-medium text-white/80">Quantra</span>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-sm text-white/50">Dashboard</span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Certificate ───────────────────────────────────────────── */}
        {allComplete && (
          <QuantumCertificate
            displayName={user.displayName ?? user.email ?? "Quantum Scholar"}
            readiness={readiness}
            certId={certId}
          />
        )}

        {/* ── Tier card ─────────────────────────────────────────────── */}
        <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Account</p>
            <p className="text-lg font-medium truncate">{user.displayName ?? user.email}</p>
            {user.displayName && (
              <p className="text-sm text-white/40 truncate">{user.email}</p>
            )}
            {renewalText && (
              <p className="text-sm text-white/40 mt-0.5">{renewalText}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${TIER_BADGE[tier]}`}>
              {TIER_LABEL[tier]}
            </span>
            {tier === "free" && (
              <a
                href="/pricing"
                className="text-sm px-4 py-1.5 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] transition-colors font-medium"
              >
                Upgrade
              </a>
            )}
          </div>
        </Card>

        {/* ── Zero state ───────────────────────────────────────────── */}
        {!progressLoading && completedDemos.length === 0 && (
          <EmptyDashboardState />
        )}

        {/* ── Stat cards (only when demos have been run) ────────────── */}
        {(progressLoading || completedDemos.length > 0) && (<>
        <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Demos completed"
            value={loading ? "—" : completedDemos.length}
            sub="of 16 total"
          />
          <StatCard
            label="Readiness score"
            value={loading ? "—" : readiness.total}
            sub={loading ? undefined : readiness.level}
          />
          <StatCard
            label="Keys generated"
            value={loading ? "—" : keysGen.toLocaleString()}
            sub="QRNG bits"
          />
          <StatCard
            label="Simulations run"
            value={loading ? "—" : totalSims.toLocaleString()}
          />
        </div>

        {/* ── Telemetry widget ──────────────────────────────────────── */}
        <TelemetryWidget
          totalSimsRun={totalSims}
          totalKeysGenerated={keysGen}
          completedCount={completedDemos.length}
        />

        {/* ── Quick Resume ──────────────────────────────────────────── */}
        <QuickResume activities={activities} />

        {/* ── Skill Tree ────────────────────────────────────────────── */}
        <Card>
          <SkillTree
            completedDemos={completedDemos}
            hasAccess={hasAccess}
          />
        </Card>

        {/* ── Readiness breakdown ────────────────────────────────────── */}
        <Card>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-medium">Quantum Readiness</h2>
            <span className={`text-sm font-medium capitalize ${LEVEL_COLOR[readiness.level]}`}>
              {readiness.level}
            </span>
          </div>

          {/* Overall bar */}
          <div className="mb-5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Overall score</span>
              <span className="text-purple-300 font-mono font-semibold">{readiness.total} / 100</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${readiness.total}%`,
                  background: "linear-gradient(90deg,#7c3aed,#a855f7,#c084fc)",
                }}
              />
            </div>
          </div>

          {/* Category breakdown */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            <ProgressBar label="Algorithms"    value={readiness.breakdown.algorithmsScore} />
            <ProgressBar label="Cryptography"  value={readiness.breakdown.cryptoScore}     />
            <ProgressBar label="Risk awareness"value={readiness.breakdown.riskScore}       />
            <ProgressBar label="Post-quantum"  value={readiness.breakdown.pqcScore}        />
          </div>

          {readiness.nextRecommended && (
            <p className="mt-5 text-sm text-white/40">
              Next recommended:{" "}
              <span className="text-purple-400 font-mono">{readiness.nextRecommended}</span>
            </p>
          )}
        </Card>

        {/* ── Activity feed ─────────────────────────────────────────── */}
        <Card>
          <h2 className="font-medium mb-4">Recent Activity</h2>
          {actLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">
              No activity yet — run a simulation to get started.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {activities.map(a => (
                <li key={a.id} className="flex items-center justify-between py-3 gap-4">
                  <span className="text-sm text-white/75 truncate">{activityLabel(a)}</span>
                  <span className="text-xs text-white/30 shrink-0">{relativeTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        </>)}

      </main>
    </div>
  );
}
