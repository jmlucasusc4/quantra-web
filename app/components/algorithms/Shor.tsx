"use client";
import { useState } from "react";
import { shorFactor, type ShorStep } from "@/lib/quantum";

const CANDIDATES = [15, 21, 33, 35, 77];

export default function Shor() {
  const [n, setN] = useState(15);
  const [steps, setSteps] = useState<ShorStep[]>([]);
  const [factors, setFactors] = useState<[number, number] | null>(null);

  function run() {
    let result = shorFactor(n);
    for (let i = 0; i < 5; i++) {
      if (result.factors) break;
      result = shorFactor(n);
    }
    setSteps(result.steps);
    setFactors(result.factors);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {CANDIDATES.map(c => (
          <button key={c} onClick={() => { setN(c); setSteps([]); setFactors(null); }}
            className={`px-4 py-2 rounded-lg mono text-sm font-semibold cursor-pointer transition-colors ${n === c ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
            {c}
          </button>
        ))}
      </div>

      <button onClick={run}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Factor {n}
      </button>

      {steps.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-white/3 border border-white/5">
          {steps.map((step, i) => {
            const isQuantum = step.description.includes("🔬");
            const isResult = step.description.includes("✅");
            const accent = isResult ? "#34d399" : isQuantum ? "#fb923c" : "#7c3aed";
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 shrink-0 rounded mt-1" style={{ height: 32, background: accent }} />
                <div>
                  <p className="text-xs text-white/50">{step.description}</p>
                  <p className="mono text-sm font-bold" style={{ color: isResult ? "#34d399" : "#fff" }}>{step.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {factors && (
        <p className="mono text-xl font-bold text-green-400 text-center">
          {n} = {factors[0]} × {factors[1]}
        </p>
      )}

      {steps.length > 0 && (
        <div className="p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 text-xs text-orange-300">
          <p className="font-semibold mb-1">RSA IMPLICATION</p>
          RSA-2048 relies on the hardness of factoring a 2048-bit semiprime. A quantum computer running Shor&apos;s algorithm could factor it in hours, breaking all RSA-encrypted traffic.
        </div>
      )}
    </div>
  );
}
