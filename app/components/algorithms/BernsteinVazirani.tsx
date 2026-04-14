"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

export default function BernsteinVazirani() {
  const [hidden, setHidden] = useState("1011");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  function run() {
    setError("");
    if (!/^[01]+$/.test(hidden) || hidden.length < 2) {
      setError("Enter a binary string of at least 2 bits.");
      return;
    }
    setCounts(QuantumSimulator.bernsteinVazirani(hidden));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-white/40 mb-1">Classical queries needed</p>
          <p className="text-2xl font-bold text-red-400">{hidden.length}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-white/40 mb-1">Quantum queries needed</p>
          <p className="text-2xl font-bold text-green-400">1</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-white/60 shrink-0">Hidden string:</label>
        <input value={hidden} onChange={e => { setHidden(e.target.value); setError(""); setCounts({}); }}
          className="mono flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
          placeholder="e.g. 1011" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={run}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Find Hidden String
      </button>

      {Object.keys(counts).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 tracking-widest uppercase">Result — Found in 1 Query</p>
          <Histogram counts={counts} />
        </div>
      )}
    </div>
  );
}
