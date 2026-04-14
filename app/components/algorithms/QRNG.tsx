"use client";
import { useState, useRef } from "react";
import { QuantumSimulator } from "@/lib/quantum";

type Format = "hex" | "binary" | "base64" | "decimal";

function shannonEntropy(bits: number[]): number {
  if (bits.length === 0) return 0;
  const p1 = bits.filter(b => b === 1).length / bits.length;
  const p0 = 1 - p1;
  if (p0 === 0 || p1 === 0) return 0;
  return -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
}

function generateQRNGBits(numBits: number): number[] {
  const bits: number[] = [];
  // Each Hadamard superposition measurement gives 1 truly random bit
  for (let i = 0; i < numBits; i++) {
    const sim = QuantumSimulator.superposition();
    bits.push(sim.measureQubit(0));
  }
  return bits;
}

function bitsToFormats(bits: number[]): Record<Format, string> {
  const binStr = bits.join("");
  // Hex
  const hexChunks: string[] = [];
  for (let i = 0; i < binStr.length; i += 4) {
    const chunk = binStr.slice(i, i + 4).padEnd(4, "0");
    hexChunks.push(parseInt(chunk, 2).toString(16).toUpperCase());
  }
  // Decimal (treat as big integer via BigInt)
  let dec = "0";
  try { dec = BigInt("0b" + binStr).toString(); } catch { /* too large — show partial */ }
  // Base64 — pack bits into bytes then encode
  const bytes: number[] = [];
  for (let i = 0; i < binStr.length; i += 8) {
    bytes.push(parseInt(binStr.slice(i, i + 8).padEnd(8, "0"), 2));
  }
  const b64 = btoa(String.fromCharCode(...bytes));
  return { binary: binStr, hex: hexChunks.join(""), base64: b64, decimal: dec };
}

export default function QRNG() {
  const [bits, setBits] = useState<number[]>([]);
  const [format, setFormat] = useState<Format>("hex");
  const [numBits, setNumBits] = useState(128);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function generate() {
    setAnimating(true);
    setBits([]);
    setCopied(false);
    let accumulated: number[] = [];
    const batchSize = 8;
    let batches = 0;
    const totalBatches = Math.ceil(numBits / batchSize);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const newBits = generateQRNGBits(Math.min(batchSize, numBits - accumulated.length));
      accumulated = [...accumulated, ...newBits];
      setBits([...accumulated]);
      batches++;
      if (batches >= totalBatches) {
        clearInterval(intervalRef.current!);
        setAnimating(false);
      }
    }, 40);
  }

  function copy() {
    if (bits.length === 0) return;
    const formatted = bitsToFormats(bits)[format];
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formats = bitsToFormats(bits);
  const entropy = shannonEntropy(bits);
  const balance = bits.length > 0 ? bits.filter(b => b === 1).length / bits.length : 0;
  const displayValue = bits.length > 0 ? formats[format] : "";

  const FORMATS: Format[] = ["hex", "binary", "base64", "decimal"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/60 shrink-0">Key size: {numBits} bits</label>
        <input type="range" min={64} max={512} step={64} value={numBits}
          onChange={e => { setNumBits(+e.target.value); setBits([]); }}
          className="flex-1 accent-purple-500" />
      </div>

      {/* Qubit collapse visualizer */}
      <div className="rounded-xl p-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs text-white/30 mb-2">Qubit collapse animation</p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: numBits }).map((_, i) => {
            const measured = i < bits.length;
            const val = bits[i];
            return (
              <div key={i} className="w-3 h-3 rounded-sm transition-all duration-100 flex items-center justify-center"
                style={{
                  background: !measured
                    ? "rgba(124,58,237,0.4)"
                    : val === 1
                    ? "rgba(168,85,247,0.9)"
                    : "rgba(255,255,255,0.15)",
                  boxShadow: !measured && animating ? "0 0 6px rgba(168,85,247,0.6)" : "none",
                }} />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span style={{ color: "rgba(124,58,237,0.8)" }}>■ superposition</span>
          <span style={{ color: "rgba(168,85,247,0.9)" }}>■ |1⟩</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>■ |0⟩</span>
        </div>
      </div>

      <button onClick={generate} disabled={animating}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        {animating ? "⟳ Collapsing qubits…" : "▶ Generate Quantum Key"}
      </button>

      {bits.length > 0 && (
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-white/40">Entropy</p>
              <p className="font-bold text-purple-400">{entropy.toFixed(4)}</p>
              <p className="text-xs text-white/30">bits/bit</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-white/40">Balance</p>
              <p className="font-bold" style={{ color: Math.abs(balance - 0.5) < 0.1 ? "#34d399" : "#fbbf24" }}>
                {(balance * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-white/30">ones</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-white/40">Bits</p>
              <p className="font-bold text-white">{bits.length}</p>
              <p className="text-xs text-white/30">measured</p>
            </div>
          </div>

          {/* Format selector */}
          <div className="flex gap-2">
            {FORMATS.map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize"
                style={format === f
                  ? { background: "rgba(124,58,237,0.5)", color: "#fff", border: "1px solid rgba(168,85,247,0.5)" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Key output */}
          <div className="relative">
            <div className="mono text-xs rounded-xl p-3 break-all leading-relaxed"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(168,85,247,0.9)", maxHeight: 120, overflowY: "auto" }}>
              {displayValue}
            </div>
            <button onClick={copy}
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer"
              style={{ background: "rgba(124,58,237,0.4)", color: copied ? "#34d399" : "#fff" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
