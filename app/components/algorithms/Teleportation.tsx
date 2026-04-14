"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

const STATES = [
  { key: "zero",  label: "|0⟩", expected: "Should measure |0⟩ 100% of the time" },
  { key: "one",   label: "|1⟩", expected: "Should measure |1⟩ 100% of the time" },
  { key: "plus",  label: "|+⟩", expected: "Should measure |0⟩ and |1⟩ ~50/50" },
  { key: "minus", label: "|−⟩", expected: "Should measure |0⟩ and |1⟩ ~50/50" },
] as const;

type StateKey = typeof STATES[number]["key"];

export default function Teleportation() {
  const [selected, setSelected] = useState<StateKey>("zero");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const expectedLabel = STATES.find(s => s.key === selected)?.expected ?? "";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {STATES.map(s => (
          <button key={s.key} onClick={() => { setSelected(s.key); setCounts({}); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold mono transition-colors cursor-pointer ${selected === s.key ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/40">{expectedLabel}</p>
      <button
        onClick={() => setCounts(QuantumSimulator.teleportation(selected, 1024))}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Teleport (1024 shots)
      </button>
      {Object.keys(counts).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 tracking-widest uppercase">Bob&apos;s Measurement</p>
          <Histogram counts={counts} />
        </div>
      )}
    </div>
  );
}
