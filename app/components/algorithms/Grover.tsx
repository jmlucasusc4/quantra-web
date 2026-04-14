"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

export default function Grover() {
  const [numQubits, setNumQubits] = useState(3);
  const [target, setTarget] = useState("101");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  function run() {
    setError("");
    if (target.length !== numQubits || !/^[01]+$/.test(target)) {
      setError(`Target must be a ${numQubits}-character binary string.`);
      return;
    }
    const idx = parseInt(target, 2);
    setCounts(QuantumSimulator.grover(numQubits, idx).measure(1024));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm text-white/60 shrink-0">Qubits: {numQubits}</label>
        <input type="range" min={2} max={5} value={numQubits} onChange={e => {
          const n = +e.target.value;
          setNumQubits(n);
          setTarget("0".repeat(n));
          setCounts({});
        }} className="flex-1 accent-purple-500" />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/60 shrink-0">Target:</label>
        <input
          value={target}
          onChange={e => { setTarget(e.target.value); setError(""); }}
          className="mono flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
          placeholder="e.g. 101"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={run}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Run Simulation (1024 shots)
      </button>
      {Object.keys(counts).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 tracking-widest uppercase">Measurement Results</p>
          <Histogram counts={counts} />
        </div>
      )}
    </div>
  );
}
