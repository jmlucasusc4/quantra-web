"use client";
import { useState, useMemo } from "react";

// ── Entropy math ──────────────────────────────────────────────────────────────
function charsetSize(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
  return size || 1;
}

function analyze(pw: string) {
  const L = pw.length;
  const A = charsetSize(pw);

  // Entropy in bits = L * log2(A)
  const entropyBits = L * Math.log2(A);

  // Classical brute force: 2^entropyBits ops → at 10^12 guesses/s
  const classicalOps = Math.pow(2, entropyBits);
  const classicalSecs = classicalOps / 1e12;

  // Grover's attack: √(2^entropyBits) = 2^(entropyBits/2) ops
  // At 10^9 Grover iterations/sec (conservative future quantum hardware estimate)
  const quantumBits  = entropyBits / 2;
  const quantumOps   = Math.pow(2, quantumBits);
  const quantumSecs  = quantumOps / 1e9;

  return { entropyBits, classicalOps, classicalSecs, quantumBits, quantumOps, quantumSecs, L, A };
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || secs > 1e40) return "longer than the age of the universe";
  if (secs < 0.001)      return "< 1 ms";
  if (secs < 1)          return `${(secs * 1000).toFixed(0)} ms`;
  if (secs < 60)         return `${secs.toFixed(1)} seconds`;
  if (secs < 3600)       return `${(secs / 60).toFixed(1)} minutes`;
  if (secs < 86400)      return `${(secs / 3600).toFixed(1)} hours`;
  if (secs < 31536000)   return `${(secs / 86400).toFixed(0)} days`;
  if (secs < 3.15e9)     return `${(secs / 31536000).toFixed(0)} years`;
  if (secs < 3.15e12)    return `${(secs / 3.15e9).toFixed(0)} thousand years`;
  if (secs < 3.15e15)    return `${(secs / 3.15e12).toFixed(0)} million years`;
  if (secs < 3.15e18)    return `${(secs / 3.15e15).toFixed(0)} billion years`;
  return "longer than the age of the universe";
}

function formatOps(ops: number): string {
  if (!isFinite(ops) || ops > 1e80) return "2^∞";
  if (ops < 1e3)  return ops.toFixed(0);
  if (ops < 1e6)  return `${(ops / 1e3).toFixed(1)}K`;
  if (ops < 1e9)  return `${(ops / 1e6).toFixed(1)}M`;
  if (ops < 1e12) return `${(ops / 1e9).toFixed(1)}B`;
  if (ops < 1e15) return `${(ops / 1e12).toFixed(1)}T`;
  return `2^${Math.round(Math.log2(ops))}`;
}

// ── Verdict ───────────────────────────────────────────────────────────────────
function verdict(quantumBits: number, entropyBits: number) {
  if (entropyBits < 28)  return { label: "INSTANTLY CRACKED",  color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)",  desc: "Weak even classically. Any attacker — quantum or not — breaks this in milliseconds." };
  if (quantumBits < 64)  return { label: "QUANTUM-VULNERABLE", color: "#fb923c", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.3)",   desc: "A quantum computer using Grover's algorithm breaks this within practical time limits. Equivalent to less than 64-bit symmetric security." };
  if (quantumBits < 100) return { label: "MARGINAL",           color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)",   desc: "Borderline quantum resistance. Safe today, but below NIST's 128-bit post-quantum security recommendation." };
  if (quantumBits < 128) return { label: "APPROACHING SAFE",   color: "#a3e635", bg: "rgba(163,230,53,0.08)",  border: "rgba(163,230,53,0.25)",  desc: "Close to quantum-resistant but below the 128-bit threshold. A few more characters and you're safe." };
  return                         { label: "QUANTUM-RESISTANT",  color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)",  desc: "Grover's algorithm cannot reduce this to a tractable attack. You meet NIST's 128-bit post-quantum security level." };
}

// ── Bar ───────────────────────────────────────────────────────────────────────
function SecurityBar({ bits, max = 256, color, label }: { bits: number; max?: number; color: string; label: string }) {
  const pct = Math.min((bits / max) * 100, 100);
  const markers = [64, 128, 192];
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span>{label}</span>
        <span style={{ color }}>{bits.toFixed(0)} bits</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
        {markers.map(m => (
          <div key={m} className="absolute top-0 bottom-0 w-px"
            style={{ left: `${(m / max) * 100}%`, background: "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
        <span>0</span><span>64</span><span>128</span><span>192</span><span>256</span>
      </div>
    </div>
  );
}

// ── Grover animation ──────────────────────────────────────────────────────────
function GroverAnimation({ running, success }: { running: boolean; success: boolean }) {
  const steps = ["Initializing amplitude amplification…", "Superposition over all possible inputs…", "Oracle marks target state…", "Inversion about average…", "Iterating √N times…"];
  const [tick, setTick] = useState(0);

  // Simple tick counter for animation — reset on running change
  useState(() => {
    if (!running) { setTick(0); return; }
  });

  return (
    <div className="rounded-xl p-4 space-y-2 font-mono text-xs"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
        Grover&apos;s Attack Simulation
      </p>
      {steps.map((s, i) => {
        const show = running || success;
        const done = success;
        return (
          <div key={i} className="flex gap-2 items-center"
            style={{ opacity: show ? 1 : 0.25, transition: `opacity ${0.3 + i * 0.1}s` }}>
            <span style={{ color: done ? "#34d399" : running ? "#a78bfa" : "rgba(255,255,255,0.2)", minWidth: 10 }}>
              {done ? "✓" : running ? "›" : "○"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>{s}</span>
          </div>
        );
      })}
      {success && (
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <span style={{ color: "#f87171" }}>Attack complete — password space exhausted in √N iterations</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuantumPasswordAnalyzer() {
  const [pw, setPw]       = useState("");
  const [show, setShow]   = useState(false);
  const [attacked, setAttacked] = useState(false);
  const [attacking, setAttacking] = useState(false);

  const stats = useMemo(() => pw.length > 0 ? analyze(pw) : null, [pw]);
  const v     = stats ? verdict(stats.quantumBits, stats.entropyBits) : null;

  function runAttack() {
    if (!stats || stats.quantumBits >= 100) return;
    setAttacking(true);
    setTimeout(() => { setAttacking(false); setAttacked(true); }, 2800);
  }

  function reset() { setPw(""); setShow(false); setAttacked(false); setAttacking(false); }

  const canAttack = stats && stats.quantumBits < 100;

  return (
    <div className="space-y-5">

      {/* ── Explainer ───────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <p style={{ color: "rgba(255,255,255,0.6)" }}>
          Grover&apos;s algorithm gives quantum computers a <strong className="text-white">quadratic speedup</strong> over
          classical brute-force search. A password that takes a classical computer{" "}
          <em className="text-purple-300">millions of years</em> to crack might take a quantum computer{" "}
          <em className="text-orange-300">days</em>. Enter any password to see your real quantum exposure.
        </p>
      </div>

      {/* ── Input ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
          Enter a password or passphrase
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => { setPw(e.target.value); setAttacked(false); }}
              placeholder="e.g. hunter2 or correct-horse-battery-staple"
              className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>
          <button onClick={() => setShow(s => !s)}
            className="px-4 rounded-xl text-xs cursor-pointer"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Nothing is sent anywhere — analysis runs entirely in your browser.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      {stats && v && (
        <div className="space-y-4">

          {/* Verdict badge */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: v.bg, border: `2px solid ${v.border}` }}>
            <p className="text-2xl font-black tracking-tight mb-1" style={{ color: v.color }}>{v.label}</p>
            <p className="text-xs max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>{v.desc}</p>
          </div>

          {/* Security bars */}
          <div className="rounded-xl p-4 space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SecurityBar bits={stats.entropyBits} label="Classical security" color="#a78bfa" />
            <SecurityBar bits={stats.quantumBits}  label="Quantum security (post-Grover)" color={v.color} />
          </div>

          {/* Numbers grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Password entropy",        value: `${stats.entropyBits.toFixed(0)} bits`,    sub: `${stats.L} chars × ${stats.A}-char alphabet` },
              { label: "Quantum security level",  value: `${stats.quantumBits.toFixed(0)} bits`,    sub: stats.quantumBits >= 128 ? "NIST threshold met" : "Below NIST 128-bit threshold" },
              { label: "Classical crack time",    value: formatTime(stats.classicalSecs),            sub: "GPU cluster at 10¹² guesses/sec" },
              { label: "Quantum crack time",      value: formatTime(stats.quantumSecs),              sub: "Grover at 10⁹ iterations/sec" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-base font-bold text-white">{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Grover attack simulation — only for weak passwords */}
          {canAttack && (
            <div className="space-y-3">
              {!attacked && (
                <button onClick={runAttack} disabled={attacking}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
                  {attacking ? "Grover's algorithm running…" : "⚡ Simulate Quantum Attack"}
                </button>
              )}
              {(attacking || attacked) && (
                <GroverAnimation running={attacking} success={attacked} />
              )}
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-xl p-4 text-xs space-y-1.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="font-semibold text-white/70">Recommendation</p>
            {stats.quantumBits >= 128 ? (
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                Your password has sufficient entropy to resist Grover&apos;s attack. For cryptographic key material, the equivalent standard is AES-256 or SHA-384+.
              </p>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                To reach 128-bit quantum security you need at least <strong className="text-white">{Math.ceil(256 / Math.log2(stats.A))} characters</strong> from
                your current character set, or add more character types (uppercase, symbols) to shrink the
                required length. The NIST post-quantum standard recommends AES-256 for symmetric keys.
              </p>
            )}
          </div>

          <button onClick={reset}
            className="w-full py-2 rounded-xl text-xs cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
            Clear
          </button>
        </div>
      )}

      {!stats && (
        <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.2)" }}>
          Type a password above to see your quantum exposure
        </p>
      )}
    </div>
  );
}
