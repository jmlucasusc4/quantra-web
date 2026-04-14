"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

type FnType = "constant-0" | "constant-1" | "balanced-identity" | "balanced-flip";

const FUNCTIONS: { value: FnType; label: string; desc: string }[] = [
  { value: "constant-0",       label: "f(x) = 0",        desc: "Constant — always returns 0" },
  { value: "constant-1",       label: "f(x) = 1",        desc: "Constant — always returns 1" },
  { value: "balanced-identity",label: "f(x) = x",        desc: "Balanced — returns x unchanged" },
  { value: "balanced-flip",    label: "f(x) = NOT x",    desc: "Balanced — returns flipped x" },
];

function runDeutschJozsa(fn: FnType, n: number): { counts: Record<string, number>; result: "constant" | "balanced" } {
  // n-qubit Deutsch-Jozsa: n data qubits + 1 ancilla
  const sim = new QuantumSimulator(n + 1);
  // Ancilla qubit 0 → |−⟩
  sim.pauliX(0);
  for (let i = 0; i <= n; i++) sim.hadamard(i);

  // Apply oracle
  if (fn === "constant-1") {
    sim.pauliX(0);
  } else if (fn === "balanced-identity") {
    for (let i = 1; i <= n; i++) sim.cnot(i, 0);
  } else if (fn === "balanced-flip") {
    sim.pauliX(0);
    for (let i = 1; i <= n; i++) sim.cnot(i, 0);
    sim.pauliX(0);
  }
  // constant-0: oracle is identity, no-op

  // Hadamard on data qubits
  for (let i = 1; i <= n; i++) sim.hadamard(i);

  const raw = sim.measure(512);
  // Collapse to just the data qubits (drop ancilla bit)
  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.slice(1); // drop ancilla bit
    counts[key] = (counts[key] ?? 0) + v;
  }

  // If all measurements are |00...0⟩ → constant, else balanced
  const allZero = Object.keys(counts).every(k => k === "0".repeat(n));
  return { counts, result: allZero ? "constant" : "balanced" };
}

export default function DeutschJozsa() {
  const [fn, setFn] = useState<FnType>("constant-0");
  const [n, setN] = useState(3);
  const [result, setResult] = useState<{ counts: Record<string, number>; result: "constant" | "balanced" } | null>(null);
  const [classical, setClassical] = useState<number | null>(null);

  function run() {
    const r = runDeutschJozsa(fn, n);
    setResult(r);
    // Classical worst case: 2^(n-1)+1 queries
    setClassical(Math.pow(2, n - 1) + 1);
  }

  const selected = FUNCTIONS.find(f => f.value === fn)!;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60 shrink-0">Qubits (n):</label>
          <input type="range" min={1} max={4} value={n}
            onChange={e => { setN(+e.target.value); setResult(null); }}
            className="flex-1 accent-purple-500" />
          <span className="text-sm text-white/60 w-4">{n}</span>
        </div>
        <div>
          <p className="text-sm text-white/60 mb-2">Oracle function:</p>
          <div className="grid grid-cols-2 gap-2">
            {FUNCTIONS.map(f => (
              <button key={f.value} onClick={() => { setFn(f.value); setResult(null); }}
                className="text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer border"
                style={fn === f.value
                  ? { background: "rgba(124,58,237,0.4)", borderColor: "rgba(168,85,247,0.6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                <p className="font-semibold mono">{f.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={run}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Run Deutsch-Jozsa (512 shots)
      </button>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-white/40 mb-1">Quantum queries</p>
              <p className="text-2xl font-bold text-purple-400">1</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-white/40 mb-1">Classical worst case</p>
              <p className="text-2xl font-bold text-red-400">{classical}</p>
            </div>
          </div>

          <div className="rounded-xl p-4 text-center" style={{
            background: result.result === "constant" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${result.result === "constant" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          }}>
            <p className="text-xs text-white/40 mb-1">Verdict</p>
            <p className="text-xl font-bold" style={{ color: result.result === "constant" ? "#34d399" : "#f87171" }}>
              f(x) is {result.result.toUpperCase()}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {result.result === "constant"
                ? "All measurements collapsed to |0...0⟩ — definitive in 1 query"
                : "Measurements spread across states — definitively balanced in 1 query"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/40 tracking-widest uppercase">Measurement Distribution (data qubits)</p>
            <Histogram counts={result.counts} />
          </div>
        </div>
      )}
    </div>
  );
}
