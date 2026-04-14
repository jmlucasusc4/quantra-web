"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";

const Superposition     = nextDynamic(() => import("./components/algorithms/Superposition"),     { ssr: false });
const Entanglement      = nextDynamic(() => import("./components/algorithms/Entanglement"),      { ssr: false });
const Grover            = nextDynamic(() => import("./components/algorithms/Grover"),            { ssr: false });
const BB84              = nextDynamic(() => import("./components/algorithms/BB84"),              { ssr: false });
const Teleportation     = nextDynamic(() => import("./components/algorithms/Teleportation"),     { ssr: false });
const BernsteinVazirani = nextDynamic(() => import("./components/algorithms/BernsteinVazirani"), { ssr: false });
const SpeedComparison   = nextDynamic(() => import("./components/algorithms/SpeedComparison"),   { ssr: false });
const BlochSphere       = nextDynamic(() => import("./components/algorithms/BlochSphere"),       { ssr: false });
const Shor              = nextDynamic(() => import("./components/algorithms/Shor"),              { ssr: false });
const RiskAuditor       = nextDynamic(() => import("./components/algorithms/RiskAuditor"),       { ssr: false });

const ALGORITHMS = [
  { key: "superposition",  label: "Superposition Demo",         description: "A single qubit in equal superposition via a Hadamard gate. Measurement yields |0⟩ or |1⟩ with ~50% probability each.", component: Superposition },
  { key: "entanglement",   label: "Entanglement Demo",          description: "Two qubits entangled into a Bell state (|00⟩+|11⟩)/√2. Measuring one instantly determines the other.", component: Entanglement },
  { key: "grover",         label: "Grover's Search",            description: "Finds a marked state in an unsorted database in O(√N) queries — quadratically faster than classical search.", component: Grover },
  { key: "bb84",           label: "BB84 Protocol (QKD)",        description: "Quantum Key Distribution: Alice and Bob establish a secret key using quantum states. Eavesdropping is detectable.", component: BB84 },
  { key: "teleportation",  label: "Quantum Teleportation",      description: "Transfers an unknown quantum state from Alice to Bob using entanglement and 2 classical bits.", component: Teleportation },
  { key: "bv",             label: "Bernstein-Vazirani",         description: "Finds a hidden binary string with a single oracle query. Classical algorithms require n queries.", component: BernsteinVazirani },
  { key: "speed",          label: "Classical vs Quantum Speed", description: "Side-by-side comparison of classical O(N) search vs Grover's O(√N) quantum search.", component: SpeedComparison },
  { key: "bloch",          label: "Bloch Sphere",               description: "Visualize any single-qubit state as a point on the Bloch sphere. Drag sliders to explore the state space.", component: BlochSphere },
  { key: "shor",           label: "Shor's Algorithm + RSA",     description: "Factors integers in polynomial time using quantum period-finding — exponentially faster than classical and breaks RSA.", component: Shor },
  { key: "risk",           label: "Quantum Risk Auditor",       description: "Audit your cryptographic stack for quantum vulnerability. Mark algorithms in use to see your risk level.", component: RiskAuditor },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState("superposition");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading…</div>
    </div>
  );

  const algo = ALGORITHMS.find(a => a.key === selected)!;
  const AlgoComponent = algo.component;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚛️</span>
            <span className="font-bold text-lg tracking-tight text-white">Quantra</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30 hidden sm:block">{user.email}</span>
            <button onClick={() => logout().then(() => router.push("/login"))}
              className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <nav className="glass p-2 space-y-1 lg:sticky lg:top-24">
            {ALGORITHMS.map(a => (
              <button
                key={a.key}
                onClick={() => setSelected(a.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  selected === a.key
                    ? "text-white font-semibold"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                style={selected === a.key ? { background: "rgba(124,58,237,0.5)", border: "1px solid rgba(168,85,247,0.4)" } : {}}
              >
                {a.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="glass p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-white">{algo.label}</h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{algo.description}</p>
            </div>
            <div className="border-t border-white/10" />
            <AlgoComponent />
          </div>
        </main>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
