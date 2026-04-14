"use client";
import { useState } from "react";

type Algorithm = {
  name: string;
  threat: "broken" | "weakened" | "safe";
  quantumYear: number | null; // estimated year quantum computer breaks it
};

const ALGORITHMS: Algorithm[] = [
  { name: "RSA-2048",           threat: "broken",   quantumYear: 2030 },
  { name: "RSA-4096",           threat: "broken",   quantumYear: 2033 },
  { name: "ECC / ECDSA P-256",  threat: "broken",   quantumYear: 2029 },
  { name: "Diffie-Hellman 2048",threat: "broken",   quantumYear: 2030 },
  { name: "AES-128",            threat: "weakened", quantumYear: 2035 },
  { name: "AES-256",            threat: "safe",     quantumYear: null },
  { name: "CRYSTALS-Kyber",     threat: "safe",     quantumYear: null },
  { name: "CRYSTALS-Dilithium", threat: "safe",     quantumYear: null },
];

const SENSITIVITY_YEARS: Record<string, number> = {
  "Public data":          1,
  "Business data":        5,
  "Personal data":        10,
  "Financial records":    15,
  "Medical records":      20,
  "Trade secrets":        25,
  "State secrets":        30,
};

const THREAT_COLOR = { broken: "#f87171", weakened: "#fb923c", safe: "#34d399" };

const CURRENT_YEAR = 2026;

export default function HarvestNow() {
  const [algoKey, setAlgoKey] = useState("RSA-2048");
  const [sensitivity, setSensitivity] = useState("Business data");
  const [harvestYear] = useState(CURRENT_YEAR);

  const algo = ALGORITHMS.find(a => a.name === algoKey)!;
  const retentionYears = SENSITIVITY_YEARS[sensitivity];
  const exposedUntil = harvestYear + retentionYears;
  const quantumBreaksAt = algo.quantumYear;

  let verdict: { text: string; color: string; detail: string };
  if (algo.threat === "safe") {
    verdict = {
      text: "Quantum Safe",
      color: "#34d399",
      detail: `${algo.name} is resistant to both classical and quantum attacks. No migration urgency for this algorithm.`,
    };
  } else if (quantumBreaksAt && quantumBreaksAt > exposedUntil) {
    verdict = {
      text: "Probably Safe (marginal)",
      color: "#fbbf24",
      detail: `Your data needs to stay secret until ${exposedUntil}. Quantum computers are estimated to break ${algo.name} around ${quantumBreaksAt} — but estimates carry uncertainty. Begin migration planning.`,
    };
  } else if (quantumBreaksAt) {
    verdict = {
      text: "AT RISK — Data Will Be Exposed",
      color: "#f87171",
      detail: `A quantum computer capable of breaking ${algo.name} is estimated to exist by ${quantumBreaksAt}. Your harvested data stays sensitive until ${exposedUntil}. There is a ${exposedUntil - quantumBreaksAt}-year window of exposure.`,
    };
  } else {
    verdict = {
      text: "Unknown Risk",
      color: "#94a3b8",
      detail: "Insufficient data to estimate.",
    };
  }

  const timelineItems = [
    { year: harvestYear, label: "Adversary harvests data", color: "#f87171", active: true },
    ...(quantumBreaksAt && algo.threat !== "safe" ? [{ year: quantumBreaksAt, label: `Quantum computer breaks ${algo.name}`, color: "#fb923c", active: true }] : []),
    { year: exposedUntil, label: `Data no longer sensitive (${sensitivity})`, color: "#94a3b8", active: true },
  ].sort((a, b) => a.year - b.year);

  const minYear = timelineItems[0].year - 1;
  const maxYear = timelineItems[timelineItems.length - 1].year + 1;
  const span = maxYear - minYear;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-white/60 mb-2">Encryption algorithm in use:</p>
          <div className="grid grid-cols-2 gap-2">
            {ALGORITHMS.map(a => (
              <button key={a.name} onClick={() => setAlgoKey(a.name)}
                className="text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border"
                style={algoKey === a.name
                  ? { background: "rgba(124,58,237,0.4)", borderColor: "rgba(168,85,247,0.6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                <span className="font-semibold">{a.name}</span>
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ color: THREAT_COLOR[a.threat], background: THREAT_COLOR[a.threat] + "22" }}>
                  {a.threat.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-white/60 mb-2">Data sensitivity:</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SENSITIVITY_YEARS).map(s => (
              <button key={s} onClick={() => setSensitivity(s)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border"
                style={sensitivity === s
                  ? { background: "rgba(124,58,237,0.4)", borderColor: "rgba(168,85,247,0.6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                {s} <span className="opacity-50">({SENSITIVITY_YEARS[s]}y)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="rounded-xl p-4" style={{ background: verdict.color + "11", border: `1px solid ${verdict.color}44` }}>
        <p className="text-xs text-white/40 mb-1">Risk Assessment</p>
        <p className="font-bold text-lg mb-2" style={{ color: verdict.color }}>{verdict.text}</p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{verdict.detail}</p>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs text-white/40 tracking-widest uppercase mb-3">Timeline</p>
        <div className="relative pt-6">
          {/* Track */}
          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

          {timelineItems.map((item, i) => {
            const pct = ((item.year - minYear) / span) * 100;
            const isLast = i === timelineItems.length - 1;
            return (
              <div key={i} className="absolute" style={{ left: `${pct}%`, top: 0, transform: "translateX(-50%)" }}>
                <div className="w-3 h-3 rounded-full border-2 border-white/20 mt-[-4px]"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}88` }} />
                <div className={`absolute mt-2 text-[10px] whitespace-nowrap ${isLast ? "right-0" : i === 0 ? "left-0" : "left-1/2 -translate-x-1/2"}`}
                  style={{ color: item.color }}>
                  <span className="font-bold">{item.year}</span>
                  <br />
                  <span className="opacity-70">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
        Quantum-readiness estimates based on 2024 NIST/NSA projections. Actual timelines may vary. Treat any sensitive data protected by broken algorithms as already at risk.
      </div>
    </div>
  );
}
