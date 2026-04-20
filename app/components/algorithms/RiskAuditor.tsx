"use client";
import { useState } from "react";

type Risk = "broken" | "weakened" | "safe";
interface Algo { name: string; type: string; risk: Risk; reason: string; inUse: boolean; }

const INITIAL: Algo[] = [
  { name: "RSA-2048",          type: "Asymmetric",   risk: "broken",   reason: "Broken by Shor's in polynomial time",        inUse: false },
  { name: "RSA-4096",          type: "Asymmetric",   risk: "broken",   reason: "Broken by Shor's in polynomial time",        inUse: false },
  { name: "ECC / ECDSA",       type: "Asymmetric",   risk: "broken",   reason: "Discrete log broken by Shor's",              inUse: false },
  { name: "Diffie-Hellman",    type: "Key Exchange", risk: "broken",   reason: "Discrete log broken by Shor's",              inUse: false },
  { name: "AES-128",           type: "Symmetric",    risk: "weakened", reason: "Grover's halves key strength → 64-bit",      inUse: false },
  { name: "AES-256",           type: "Symmetric",    risk: "safe",     reason: "Reduces to 128-bit effective — still secure", inUse: false },
  { name: "SHA-256",           type: "Hash",         risk: "weakened", reason: "Collision resistance weakened",              inUse: false },
  { name: "SHA-512",           type: "Hash",         risk: "safe",     reason: "Sufficient margin against Grover's",         inUse: false },
  { name: "CRYSTALS-Kyber",    type: "PQC KEM",      risk: "safe",     reason: "NIST-selected post-quantum standard",        inUse: false },
  { name: "CRYSTALS-Dilithium",type: "PQC Sig",      risk: "safe",     reason: "NIST-selected post-quantum standard",        inUse: false },
  { name: "SPHINCS+",          type: "PQC Sig",      risk: "safe",     reason: "Hash-based, quantum-resistant",              inUse: false },
  { name: "FALCON",            type: "PQC Sig",      risk: "safe",     reason: "NIST-selected post-quantum standard",        inUse: false },
];

const GROUPS = ["Asymmetric", "Key Exchange", "Symmetric", "Hash", "PQC KEM", "PQC Sig"];

const RISK_COLOR: Record<Risk, string> = {
  broken: "#f87171", weakened: "#fb923c", safe: "#34d399",
};
const RISK_LABEL: Record<Risk, string> = {
  broken: "BROKEN", weakened: "WEAKENED", safe: "SAFE",
};

export default function RiskAuditor() {
  const [algos, setAlgos] = useState<Algo[]>(INITIAL);

  function toggle(name: string) {
    setAlgos(a => a.map(x => x.name === name ? { ...x, inUse: !x.inUse } : x));
  }

  const inUse = algos.filter(a => a.inUse);
  const score = inUse.filter(a => a.risk === "broken").length * 3 + inUse.filter(a => a.risk === "weakened").length;
  const [riskLabel, riskColor] =
    score === 0 ? ["✅ Quantum Safe",  "#34d399"] :
    score <= 2  ? ["⚠️ Low Risk",       "#fbbf24"] :
    score <= 5  ? ["🔶 Medium Risk",    "#fb923c"] :
                  ["🚨 High Risk",      "#f87171"];

  return (
    <div className="space-y-4" style={{ minWidth: 0, width: "100%" }}>
      {inUse.length > 0 && (
        <div className="p-3 rounded-xl border" style={{ borderColor: riskColor + "44", background: riskColor + "11" }}>
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-white/40">Risk Level</p>
              <p className="font-bold" style={{ color: riskColor }}>{riskLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">In use</p>
              <p className="font-semibold text-white">{inUse.length} algorithms</p>
            </div>
          </div>
        </div>
      )}

      {GROUPS.map(group => {
        const groupAlgos = algos.filter(a => a.type === group);
        return (
          <div key={group}>
            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">{group}</p>
            <div className="rounded-xl overflow-hidden border border-white/5">
              {groupAlgos.map((algo, i) => (
                <div key={algo.name}
                  className={i > 0 ? "border-t border-white/5" : ""}
                  style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px" }}>
                  {/* Toggle — fixed 44px column, never shrinks */}
                  <div style={{ flexShrink: 0, minWidth: 0, paddingTop: "2px" }}>
                    <button
                      onClick={() => toggle(algo.name)}
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "9999px",
                        background: algo.inUse ? RISK_COLOR[algo.risk] : "rgba(255,255,255,0.15)",
                        position: "relative",
                        cursor: "pointer",
                        border: "none",
                        flexShrink: 0,
                        transition: "background 0.2s",
                      }}>
                      <span style={{
                        position: "absolute",
                        top: "3px",
                        left: algo.inUse ? "23px" : "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                  {/* Text column — flex:1 fills remaining space; minWidth:0 + overflow:hidden prevent blowout */}
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{algo.name}</span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        color: RISK_COLOR[algo.risk],
                        background: RISK_COLOR[algo.risk] + "22",
                      }}>
                        {RISK_LABEL[algo.risk]}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: "1.4" }}>{algo.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
