"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

export default function Superposition() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCounts(QuantumSimulator.superposition().measure(1024))}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
      >
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
