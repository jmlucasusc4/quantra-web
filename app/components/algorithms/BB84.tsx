"use client";
import { useState } from "react";
import { simulateBB84, type BB84Result } from "@/lib/quantum";

export default function BB84() {
  const [evePresent, setEvePresent] = useState(false);
  const [result, setResult] = useState<BB84Result | null>(null);

  function run() { setResult(simulateBB84(20, evePresent)); }

  const errorPct = result ? (result.errorRate * 100).toFixed(1) : null;
  const riskColor = result
    ? result.errorRate > 0.15 ? "#f87171" : result.errorRate > 0 ? "#fb923c" : "#34d399"
    : "#34d399";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Eve (eavesdropper)</span>
        <button
          onClick={() => setEvePresent(e => !e)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: evePresent ? "#ef4444" : "rgba(255,255,255,0.2)",
            position: "relative", flexShrink: 0, transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: evePresent ? 23 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", display: "block",
          }} />
        </button>
      </div>

      <button onClick={run}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Simulate BB84 (20 bits)
      </button>

      {result && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl border" style={{ borderColor: riskColor + "44", background: riskColor + "11" }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-white/40">Key Error Rate</p>
                <p className="text-lg font-bold" style={{ color: riskColor }}>{errorPct}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Sifted Key Length</p>
                <p className="font-semibold text-white">{result.siftedKey.length} bits</p>
              </div>
            </div>
            {result.evePresent && result.errorRate > 0.1 && (
              <p className="text-xs mt-2" style={{ color: riskColor }}>⚠ High error rate — eavesdropping detected!</p>
            )}
            {!result.evePresent && (
              <p className="text-xs mt-2 text-green-400">✓ Channel is secure — no eavesdropping detected.</p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs mono">
              <thead>
                <tr className="text-white/40">
                  <td className="pb-2">Alice bits</td>
                  <td className="pb-2">Alice bases</td>
                  <td className="pb-2">Bob bases</td>
                  <td className="pb-2">Bob result</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.aliceBits.slice(0, 10).join(" ")}</td>
                  <td>{result.aliceBases.slice(0, 10).map(b => b ? "×" : "+").join(" ")}</td>
                  <td>{result.bobBases.slice(0, 10).map(b => b ? "×" : "+").join(" ")}</td>
                  <td>{result.bobMeasured.slice(0, 10).join(" ")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
