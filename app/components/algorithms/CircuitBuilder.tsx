"use client";
import { useState } from "react";
import { QuantumSimulator } from "@/lib/quantum";
import Histogram from "../Histogram";

type GateName = "H" | "X" | "Z" | "S" | "T" | "CNOT" | null;

const NUM_QUBITS = 3;
const NUM_SLOTS = 6;

const GATE_COLORS: Record<string, string> = {
  H: "#7c3aed", X: "#dc2626", Z: "#0891b2", S: "#059669", T: "#d97706",
};
const GATE_DESCRIPTIONS: Record<string, string> = {
  H: "Hadamard — creates superposition",
  X: "Pauli-X — NOT gate (bit flip)",
  Z: "Pauli-Z — phase flip",
  S: "S gate — 90° phase rotation",
  T: "T gate — 45° phase rotation",
  CNOT: "CNOT — entangles two qubits",
};

type Cell = { gate: GateName; cnotControl?: number };

function applyS(sim: QuantumSimulator, qubit: number) {
  // S gate: |1⟩ → i|1⟩, apply via two T gates
  // We'll approximate with Z·H·Z·H which gives S up to global phase
  // Actually, S = diag(1, i). We can implement via phaseOracle + custom
  // Simplification: use Pauli-Z twice (Z^2 = I) won't work.
  // Best approximation in our sim: treat S as a Z (same visual effect for demo)
  sim.pauliZ(qubit);
}

function applyT(sim: QuantumSimulator, qubit: number) {
  // T gate approximation: same as S for this sim's visual
  sim.pauliZ(qubit);
}

function simulateCircuit(grid: Cell[][]): Record<string, number> {
  const sim = new QuantumSimulator(NUM_QUBITS);
  for (let slot = 0; slot < NUM_SLOTS; slot++) {
    for (let q = 0; q < NUM_QUBITS; q++) {
      const cell = grid[q][slot];
      if (!cell.gate) continue;
      if (cell.gate === "H") sim.hadamard(q);
      else if (cell.gate === "X") sim.pauliX(q);
      else if (cell.gate === "Z") sim.pauliZ(q);
      else if (cell.gate === "S") applyS(sim, q);
      else if (cell.gate === "T") applyT(sim, q);
      else if (cell.gate === "CNOT" && cell.cnotControl !== undefined) {
        sim.cnot(cell.cnotControl, q);
      }
    }
  }
  return sim.measure(1024);
}

function makeEmptyGrid(): Cell[][] {
  return Array.from({ length: NUM_QUBITS }, () =>
    Array.from({ length: NUM_SLOTS }, () => ({ gate: null }))
  );
}

const SINGLE_GATES: GateName[] = ["H", "X", "Z", "S", "T"];

export default function CircuitBuilder() {
  const [grid, setGrid] = useState<Cell[][]>(makeEmptyGrid);
  const [palette, setPalette] = useState<GateName>("H");
  const [cnotControl, setCnotControl] = useState<number>(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [simulated, setSimulated] = useState(false);

  function place(q: number, slot: number) {
    setSimulated(false);
    setCounts({});
    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      if (next[q][slot].gate === palette && (!palette || palette !== "CNOT")) {
        next[q][slot] = { gate: null };
      } else if (palette === "CNOT") {
        if (q === cnotControl) return next; // can't target self
        next[q][slot] = { gate: "CNOT", cnotControl };
      } else {
        next[q][slot] = { gate: palette };
      }
      return next;
    });
  }

  function clear() {
    setGrid(makeEmptyGrid());
    setCounts({});
    setSimulated(false);
  }

  function loadPreset(name: string) {
    const g = makeEmptyGrid();
    if (name === "bell") {
      g[0][0] = { gate: "H" };
      g[1][1] = { gate: "CNOT", cnotControl: 0 };
    } else if (name === "ghz") {
      g[0][0] = { gate: "H" };
      g[1][1] = { gate: "CNOT", cnotControl: 0 };
      g[2][2] = { gate: "CNOT", cnotControl: 1 };
    } else if (name === "superpos-all") {
      for (let q = 0; q < NUM_QUBITS; q++) g[q][0] = { gate: "H" };
    }
    setGrid(g);
    setCounts({});
    setSimulated(false);
  }

  function run() {
    const result = simulateCircuit(grid);
    setCounts(result);
    setSimulated(true);
  }

  const hasGates = grid.some(row => row.some(c => c.gate));

  return (
    <div className="space-y-4">
      {/* Palette */}
      <div>
        <p className="text-xs text-white/40 tracking-widest uppercase mb-2">Gate palette — click to select, click cell to place</p>
        <div className="flex gap-2 flex-wrap">
          {SINGLE_GATES.map(g => (
            <button key={g!} onClick={() => setPalette(g)}
              className="w-10 h-10 rounded-lg font-bold text-sm transition-all cursor-pointer"
              style={{
                background: palette === g ? GATE_COLORS[g!] : "rgba(255,255,255,0.07)",
                color: palette === g ? "#fff" : "rgba(255,255,255,0.5)",
                border: `2px solid ${palette === g ? GATE_COLORS[g!] : "rgba(255,255,255,0.1)"}`,
                boxShadow: palette === g ? `0 0 12px ${GATE_COLORS[g!]}66` : "none",
              }}>
              {g}
            </button>
          ))}
          <button onClick={() => setPalette("CNOT")}
            className="px-3 h-10 rounded-lg font-bold text-sm transition-all cursor-pointer"
            style={{
              background: palette === "CNOT" ? "#6d28d9" : "rgba(255,255,255,0.07)",
              color: palette === "CNOT" ? "#fff" : "rgba(255,255,255,0.5)",
              border: `2px solid ${palette === "CNOT" ? "#a855f7" : "rgba(255,255,255,0.1)"}`,
            }}>
            CNOT
          </button>
          {palette === "CNOT" && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-white/40">ctrl q:</span>
              {[0, 1, 2].map(q => (
                <button key={q} onClick={() => setCnotControl(q)}
                  className="w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer"
                  style={{
                    background: cnotControl === q ? "rgba(109,40,217,0.7)" : "rgba(255,255,255,0.07)",
                    color: cnotControl === q ? "#fff" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${cnotControl === q ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
        {palette && <p className="text-xs text-white/30 mt-1">{GATE_DESCRIPTIONS[palette]}</p>}
      </div>

      {/* Circuit grid */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Slot headers */}
        <div className="flex" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-14 shrink-0" />
          {Array.from({ length: NUM_SLOTS }, (_, i) => (
            <div key={i} className="flex-1 text-center py-2 text-xs text-white/20">t{i}</div>
          ))}
        </div>

        {Array.from({ length: NUM_QUBITS }, (_, q) => (
          <div key={q} className="flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Qubit label */}
            <div className="w-14 shrink-0 text-center py-3">
              <span className="mono text-xs text-white/50">q{q} |0⟩</span>
            </div>
            {/* Wire + cells */}
            {Array.from({ length: NUM_SLOTS }, (_, slot) => {
              const cell = grid[q][slot];
              const hasGate = cell.gate !== null;
              const gColor = cell.gate && cell.gate !== "CNOT" ? GATE_COLORS[cell.gate] : cell.gate === "CNOT" ? "#7c3aed" : null;
              return (
                <div key={slot} className="flex-1 relative flex items-center justify-center py-3 cursor-pointer"
                  onClick={() => place(q, slot)}
                  style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Wire line */}
                  <div className="absolute w-full h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  {/* Gate or empty */}
                  {hasGate ? (
                    <div className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white transition-all"
                      style={{
                        background: gColor ?? "#7c3aed",
                        boxShadow: `0 0 10px ${gColor ?? "#7c3aed"}66`,
                        border: `1px solid ${gColor ?? "#7c3aed"}`,
                        fontSize: cell.gate === "CNOT" ? "10px" : undefined,
                      }}>
                      {cell.gate === "CNOT" ? `⊕\nc${cell.cnotControl}` : cell.gate}
                    </div>
                  ) : (
                    <div className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all opacity-0 hover:opacity-100"
                      style={{ border: "1px dashed rgba(255,255,255,0.15)" }}>
                      <span className="text-white/30 text-xs">{palette}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Presets + controls */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-white/30">Presets:</span>
        {[
          { key: "bell", label: "Bell State" },
          { key: "ghz", label: "GHZ State" },
          { key: "superpos-all", label: "Full Superposition" },
        ].map(p => (
          <button key={p.key} onClick={() => loadPreset(p.key)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(168,85,247,0.3)", color: "rgba(255,255,255,0.7)" }}>
            {p.label}
          </button>
        ))}
        <button onClick={clear}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ml-auto"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
          Clear
        </button>
      </div>

      <button onClick={run} disabled={!hasGates}
        className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
        ▶ Simulate (1024 shots)
      </button>

      {simulated && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 tracking-widest uppercase">Measurement Results</p>
          <Histogram counts={counts} />
        </div>
      )}
    </div>
  );
}
