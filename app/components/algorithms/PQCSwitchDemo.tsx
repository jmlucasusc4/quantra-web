"use client";
import { useState, useEffect, useRef } from "react";
import { shorFactor } from "@/lib/quantum";

// ── Attack log step ───────────────────────────────────────────────────────────
interface LogStep {
  label: string;
  status: "running" | "done" | "failed" | "warn";
}

// ── RSA attack sequence ───────────────────────────────────────────────────────
const RSA_N = 35; // small semiprime for demo; framed as representative of RSA structure

function buildRsaLog(factors: [number, number] | null): LogStep[] {
  return [
    { label: "Quantum Fourier Transform initialized", status: "done" },
    { label: "Period-finding oracle constructed for N=" + RSA_N, status: "done" },
    { label: "🔬 Quantum superposition over 2ⁿ states", status: "done" },
    { label: "Period r detected via QFT measurement", status: "done" },
    { label: `GCD computation: factors extracted → ${factors ? `${factors[0]} × ${factors[1]}` : "…"}`, status: "done" },
    { label: "Private key reconstructed from prime factors", status: "done" },
    { label: "Encrypted session decrypted", status: "done" },
  ];
}

// ── ML-KEM attack sequence ────────────────────────────────────────────────────
const MLKEM_STEPS: LogStep[] = [
  { label: "Initializing Shor's period-finding attack…", status: "warn" },
  { label: "Scanning ML-KEM public key for periodic structure", status: "warn" },
  { label: "No periodicity found — Module-LWE has no Fourier structure", status: "failed" },
  { label: "Falling back: Grover's search over shared secret space", status: "warn" },
  { label: "Kyber-768 key space: 2²⁵⁶ — Grover reduces to 2¹²⁸", status: "warn" },
  { label: "2¹²⁸ operations exceed all quantum hardware by 10ⁱⁿᶠ", status: "failed" },
  { label: "Attack aborted — no viable quantum attack path", status: "failed" },
];

// ── Animated log ──────────────────────────────────────────────────────────────
function AttackLog({ steps, speed = 500 }: { steps: LogStep[]; speed?: number }) {
  const [visible, setVisible] = useState(0);
  const prevStepsRef = useRef<LogStep[]>([]);

  useEffect(() => {
    if (steps !== prevStepsRef.current) {
      prevStepsRef.current = steps;
      setVisible(0);
    }
    if (visible >= steps.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), speed);
    return () => clearTimeout(t);
  }, [visible, steps, speed]);

  const COLOR: Record<LogStep["status"], string> = {
    done:    "#34d399",
    failed:  "#f87171",
    warn:    "#fbbf24",
    running: "#a78bfa",
  };
  const ICON: Record<LogStep["status"], string> = {
    done:    "✓",
    failed:  "✗",
    warn:    "⚠",
    running: "…",
  };

  return (
    <div className="rounded-xl p-4 font-mono text-xs space-y-1.5"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {steps.slice(0, visible).map((s, i) => (
        <div key={i} className="flex gap-2 items-start animate-fade-in">
          <span style={{ color: COLOR[s.status], minWidth: 12 }}>{ICON[s.status]}</span>
          <span style={{ color: s.status === "failed" ? "#f87171" : "rgba(255,255,255,0.65)" }}>{s.label}</span>
        </div>
      ))}
      {visible < steps.length && (
        <div className="flex gap-2 items-center">
          <span className="animate-pulse" style={{ color: "#a78bfa" }}>›</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>{steps[visible].label}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Mode = "rsa" | "mlkem";
type Phase = "idle" | "attacking" | "done";

export default function PQCSwitchDemo() {
  const [mode, setMode]   = useState<Mode>("rsa");
  const [phase, setPhase] = useState<Phase>("idle");
  const [rsaLog, setRsaLog] = useState<LogStep[]>([]);
  const [factors, setFactors] = useState<[number, number] | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setPhase("idle");
    setRsaLog([]);
    setFactors(null);
  }

  function runAttack() {
    setPhase("attacking");
    if (mode === "rsa") {
      // Run Shor's synchronously, animate log
      let result = shorFactor(RSA_N);
      for (let i = 0; i < 5; i++) { if (result.factors) break; result = shorFactor(RSA_N); }
      setFactors(result.factors);
      setRsaLog(buildRsaLog(result.factors));
      // Mark done after log animation completes
      setTimeout(() => setPhase("done"), buildRsaLog(result.factors).length * 520 + 300);
    } else {
      setTimeout(() => setPhase("done"), MLKEM_STEPS.length * 520 + 300);
    }
  }

  const isRsa   = mode === "rsa";
  const accentOk  = "#34d399";
  const accentBad = "#f87171";
  const accent    = isRsa ? accentBad : accentOk;

  const TARGET_INFO = isRsa ? {
    name: "RSA-2048",
    basis: "Integer factorisation (IFP)",
    quantumThreat: "Shor's algorithm — polynomial time",
    status: "QUANTUM-VULNERABLE",
    statusColor: accentBad,
    statusBg: "rgba(248,113,113,0.08)",
    statusBorder: "rgba(248,113,113,0.25)",
  } : {
    name: "ML-KEM / Kyber-768",
    basis: "Module Learning With Errors (Module-LWE)",
    quantumThreat: "No efficient quantum algorithm known",
    status: "QUANTUM-RESISTANT",
    statusColor: accentOk,
    statusBg: "rgba(52,211,153,0.08)",
    statusBorder: "rgba(52,211,153,0.25)",
  };

  return (
    <div className="space-y-5">

      {/* ── Mode toggle ─────────────────────────────────────────────── */}
      <div className="rounded-2xl p-1 flex gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {(["rsa", "mlkem"] as Mode[]).map(m => {
          const active = mode === m;
          const label  = m === "rsa" ? "RSA (Vulnerable)" : "ML-KEM (Quantum-Safe)";
          const bg     = m === "rsa"
            ? "linear-gradient(135deg,rgba(239,68,68,0.5),rgba(185,28,28,0.5))"
            : "linear-gradient(135deg,rgba(5,150,105,0.5),rgba(4,120,87,0.5))";
          return (
            <button key={m} onClick={() => switchMode(m)}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={active
                ? { background: bg, color: "#fff", boxShadow: "0 0 20px rgba(0,0,0,0.3)" }
                : { color: "rgba(255,255,255,0.35)" }}>
              {m === "rsa" ? "⚠ " : "✓ "}{label}
            </button>
          );
        })}
      </div>

      {/* ── Target info ──────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        style={{ background: TARGET_INFO.statusBg, border: `1px solid ${TARGET_INFO.statusBorder}` }}>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Algorithm</p>
          <p className="text-sm font-bold text-white">{TARGET_INFO.name}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Hard Problem</p>
          <p className="text-xs text-white/70">{TARGET_INFO.basis}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Quantum Threat</p>
          <p className="text-xs text-white/70">{TARGET_INFO.quantumThreat}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Status</p>
          <p className="text-xs font-bold" style={{ color: TARGET_INFO.statusColor }}>{TARGET_INFO.status}</p>
        </div>
      </div>

      {/* ── Attack button ─────────────────────────────────────────────── */}
      {phase === "idle" && (
        <button onClick={runAttack}
          className="w-full py-4 rounded-xl font-bold text-white text-sm cursor-pointer transition-all"
          style={{
            background: isRsa
              ? "linear-gradient(135deg,#dc2626,#b91c1c)"
              : "linear-gradient(135deg,#7c3aed,#6d28d9)",
          }}>
          {isRsa ? "⚡ Launch Quantum Attack on RSA" : "⚡ Attempt Quantum Attack on ML-KEM"}
        </button>
      )}

      {/* ── Attack log ────────────────────────────────────────────────── */}
      {phase !== "idle" && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            Quantum Attack Log
          </p>
          <AttackLog
            steps={isRsa ? rsaLog : MLKEM_STEPS}
            speed={500}
          />
        </div>
      )}

      {/* ── Result banner ──────────────────────────────────────────────── */}
      {phase === "done" && (
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{
            background: isRsa ? "rgba(220,38,38,0.1)" : "rgba(5,150,105,0.1)",
            border: `2px solid ${isRsa ? "rgba(248,113,113,0.4)" : "rgba(52,211,153,0.4)"}`,
          }}>
          <p className="text-3xl font-black tracking-tight" style={{ color: accent }}>
            {isRsa ? "ENCRYPTION BREACHED" : "ATTACK FAILED"}
          </p>
          {isRsa && factors && (
            <p className="font-mono text-sm" style={{ color: accentBad }}>
              {RSA_N} factored → {factors[0]} × {factors[1]} &nbsp;|&nbsp; RSA private key exposed
            </p>
          )}
          <p className="text-xs max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            {isRsa
              ? "A quantum computer running Shor's algorithm factors RSA in polynomial time. RSA-2048 provides zero security against a cryptographically-relevant quantum computer."
              : "ML-KEM security is based on Module-LWE — a lattice problem with no known quantum speedup. Shor's algorithm is inapplicable; Grover's search leaves 2¹²⁸ operations: computationally infeasible."}
          </p>
          <button onClick={() => { setPhase("idle"); setRsaLog([]); setFactors(null); }}
            className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            Run again
          </button>
        </div>
      )}

      {/* ── Comparison table ───────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden text-xs" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-3 px-4 py-2 text-[10px] uppercase tracking-widest"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
          <span>Property</span>
          <span className="text-center" style={{ color: accentBad }}>RSA-2048</span>
          <span className="text-center" style={{ color: accentOk }}>ML-KEM-768</span>
        </div>
        {[
          ["Hard problem",     "Integer factorisation",  "Module-LWE"],
          ["Classical security","128-bit",               "~178-bit"],
          ["Quantum security", "0-bit (broken)",         "~128-bit"],
          ["NIST status",      "Deprecated post-2030",   "FIPS 203 (2024)"],
          ["Quantum threat",   "Shor's — polynomial",    "None known"],
        ].map(([prop, rsa, kyber]) => (
          <div key={prop} className="grid grid-cols-3 px-4 py-2.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-white/50">{prop}</span>
            <span className="text-center" style={{ color: "rgba(248,113,113,0.85)" }}>{rsa}</span>
            <span className="text-center" style={{ color: "rgba(52,211,153,0.85)" }}>{kyber}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/20 text-center">
        Simulation uses small integers for demonstration. RSA-2048 factoring on real hardware requires millions of logical qubits.
      </p>
    </div>
  );
}
