"use client";
import { useState } from "react";

// Conceptual simulation of CRYSTALS-Kyber KEM
// Real Kyber uses Module-LWE over polynomial rings. This is an educational approximation.

const PARAM_SETS = [
  { name: "Kyber-512",  security: "AES-128 equivalent", k: 2, eta: 3 },
  { name: "Kyber-768",  security: "AES-192 equivalent", k: 3, eta: 2 },
  { name: "Kyber-1024", security: "AES-256 equivalent", k: 4, eta: 2 },
];

function randomHex(bytes: number): string {
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("").toUpperCase();
}

function simulateKeyGen(k: number): { pk: string; sk: string; matrixA: string } {
  const pkLen = k * 32;
  const skLen = k * 32 + pkLen + 32 + 32;
  return {
    pk: randomHex(Math.min(pkLen, 32)) + "…",
    sk: randomHex(Math.min(skLen, 16)) + "…",
    matrixA: `${k}×${k} matrix A (${k * k * 256} coefficients mod 3329)`,
  };
}

function simulateEncapsulate(pk: string): { ciphertext: string; sharedSecretBob: string } {
  void pk;
  return {
    ciphertext: randomHex(32) + "…",
    sharedSecretBob: randomHex(32),
  };
}

function simulateDecapsulate(sk: string, ciphertext: string, sharedSecretBob: string): string {
  void sk; void ciphertext;
  // In a real implementation, this recovers the same shared secret
  return sharedSecretBob; // conceptual: same secret
}

type Step = "idle" | "keygen" | "encapsulate" | "decapsulate" | "done";

interface KyberState {
  pk: string; sk: string; matrixA: string;
  ciphertext: string;
  sharedSecretBob: string;
  sharedSecretAlice: string;
}

export default function CRYSTALSKyber() {
  const [paramIdx, setParamIdx] = useState(1);
  const [step, setStep] = useState<Step>("idle");
  const [state, setState] = useState<Partial<KyberState>>({});
  const [animating, setAnimating] = useState(false);

  const params = PARAM_SETS[paramIdx];

  function doStep(s: Step) {
    setAnimating(true);
    setTimeout(() => {
      if (s === "keygen") {
        const kg = simulateKeyGen(params.k);
        setState({ pk: kg.pk, sk: kg.sk, matrixA: kg.matrixA });
      } else if (s === "encapsulate") {
        const enc = simulateEncapsulate(state.pk ?? "");
        setState(prev => ({ ...prev, ciphertext: enc.ciphertext, sharedSecretBob: enc.sharedSecretBob }));
      } else if (s === "decapsulate") {
        const dec = simulateDecapsulate(state.sk ?? "", state.ciphertext ?? "", state.sharedSecretBob ?? "");
        setState(prev => ({ ...prev, sharedSecretAlice: dec }));
      }
      setStep(s === "keygen" ? "keygen" : s === "encapsulate" ? "encapsulate" : "done");
      setAnimating(false);
    }, 600);
  }

  function reset() {
    setStep("idle");
    setState({});
  }

  const stepOrder: Step[] = ["keygen", "encapsulate", "decapsulate"];
  const stepLabels = ["1. Key Generation", "2. Encapsulate", "3. Decapsulate"];
  const currentStepIdx = stepOrder.indexOf(step);
  const secretsMatch = state.sharedSecretAlice && state.sharedSecretBob &&
    state.sharedSecretAlice === state.sharedSecretBob;

  return (
    <div className="space-y-4">
      {/* Param selector */}
      <div>
        <p className="text-xs text-white/40 tracking-widest uppercase mb-2">Parameter set</p>
        <div className="flex gap-2">
          {PARAM_SETS.map((p, i) => (
            <button key={p.name} onClick={() => { setParamIdx(i); reset(); }}
              className="flex-1 py-2 px-3 rounded-xl text-xs text-center transition-all cursor-pointer border"
              style={paramIdx === i
                ? { background: "rgba(124,58,237,0.4)", borderColor: "rgba(168,85,247,0.6)", color: "#fff" }
                : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              <p className="font-bold">{p.name}</p>
              <p className="opacity-60 mt-0.5">{p.security}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-2">
        {stepLabels.map((label, i) => {
          const done = currentStepIdx >= i;
          const active = currentStepIdx === i;
          return (
            <div key={i} className="flex-1 rounded-xl p-2 text-center text-xs transition-all"
              style={{
                background: done ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(168,85,247,0.6)" : done ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: done ? "#c4b5fd" : "rgba(255,255,255,0.3)",
              }}>
              {done && <span className="mr-1">✓</span>}{label}
            </div>
          );
        })}
      </div>

      {/* Alice + Bob panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Alice */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <p className="font-semibold text-purple-300 text-sm">Alice (Key Owner)</p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1"
                style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}>Public Key</span>
              <p className="mono text-white/50 break-all">{state.pk ?? "not generated"}</p>
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1"
                style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>Private Key</span>
              <p className="mono text-white/50">{state.sk ? "••••••••••••••••…" : "not generated"}</p>
            </div>
            {state.matrixA && (
              <p className="text-white/30 italic">{state.matrixA}</p>
            )}
            {step === "done" && state.sharedSecretAlice && (
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1"
                  style={{ background: secretsMatch ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)", color: secretsMatch ? "#34d399" : "#f87171" }}>
                  Shared Secret (Alice)
                </span>
                <p className="mono break-all" style={{ color: secretsMatch ? "#34d399" : "#f87171" }}>
                  {state.sharedSecretAlice}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bob */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="font-semibold text-white/70 text-sm">Bob (Sender)</p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1"
                style={{ background: "rgba(14,165,233,0.2)", color: "#38bdf8" }}>Ciphertext</span>
              <p className="mono text-white/50 break-all">{state.ciphertext ?? "waiting…"}</p>
            </div>
            {state.sharedSecretBob && (
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1"
                  style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}>Shared Secret (Bob)</span>
                <p className="mono break-all text-green-400">{state.sharedSecretBob}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alice's decapsulated result */}
      {step === "done" && (
        <div className="rounded-xl p-4" style={{
          background: secretsMatch ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${secretsMatch ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
        }}>
          <p className="text-xs font-semibold mb-2" style={{ color: secretsMatch ? "#34d399" : "#f87171" }}>
            {secretsMatch ? "✓ Shared secrets match — secure channel established" : "✗ Secrets differ — decapsulation failed"}
          </p>
          <p className="text-xs text-white/40">
            Alice and Bob now share a symmetric key ({params.name} provides {params.security} security).
            This key exchange is resistant to Shor's algorithm — unlike RSA or ECDH.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {step === "idle" && (
          <button onClick={() => doStep("keygen")} disabled={animating}
            className="flex-1 py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
            {animating ? "Generating…" : "1. Alice: Generate Keys"}
          </button>
        )}
        {step === "keygen" && (
          <button onClick={() => doStep("encapsulate")} disabled={animating}
            className="flex-1 py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)" }}>
            {animating ? "Encapsulating…" : "2. Bob: Encapsulate Secret"}
          </button>
        )}
        {step === "encapsulate" && (
          <button onClick={() => doStep("decapsulate")} disabled={animating}
            className="flex-1 py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
            {animating ? "Decapsulating…" : "3. Alice: Decapsulate"}
          </button>
        )}
        {step === "done" && (
          <button onClick={reset}
            className="flex-1 py-3 rounded-xl font-semibold text-white cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-white/25 text-center">
        Conceptual simulation. Real Kyber uses lattice-based polynomial arithmetic (Module-LWE).
      </p>
    </div>
  );
}
