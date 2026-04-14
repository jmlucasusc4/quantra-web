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
const DeutschJozsa      = nextDynamic(() => import("./components/algorithms/DeutschJozsa"),      { ssr: false });
const QRNG              = nextDynamic(() => import("./components/algorithms/QRNG"),              { ssr: false });
const HarvestNow        = nextDynamic(() => import("./components/algorithms/HarvestNow"),        { ssr: false });
const SimonsAlgorithm   = nextDynamic(() => import("./components/algorithms/SimonsAlgorithm"),   { ssr: false });
const CircuitBuilder    = nextDynamic(() => import("./components/algorithms/CircuitBuilder"),    { ssr: false });
const CRYSTALSKyber     = nextDynamic(() => import("./components/algorithms/CRYSTALSKyber"),     { ssr: false });

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const DIFF_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  Beginner:     { color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  Intermediate: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  Advanced:     { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const ALGORITHMS: {
  key: string; label: string; description: string; difficulty: Difficulty;
  whyItMatters: string; component: React.ComponentType;
}[] = [
  {
    key: "superposition", label: "Superposition Demo", difficulty: "Beginner",
    description: "A single qubit in equal superposition via a Hadamard gate. Measurement yields |0⟩ or |1⟩ with ~50% probability each.",
    whyItMatters: "Superposition lets qubits exist in multiple states simultaneously — the foundation of every quantum speedup. Without it, quantum computers would be no faster than classical ones.",
    component: Superposition,
  },
  {
    key: "entanglement", label: "Entanglement Demo", difficulty: "Beginner",
    description: "Two qubits entangled into a Bell state (|00⟩+|11⟩)/√2. Measuring one instantly determines the other.",
    whyItMatters: "Entanglement is the resource that powers quantum communication and quantum key distribution. It allows measurement correlations that no classical system can replicate, making eavesdropping physically detectable.",
    component: Entanglement,
  },
  {
    key: "deutsch", label: "Deutsch-Jozsa", difficulty: "Beginner",
    description: "Determines whether a black-box function is constant or balanced in a single oracle query. Classical algorithms require up to 2^(n-1)+1 queries.",
    whyItMatters: "The first proof that quantum computers can solve certain problems exponentially faster than classical computers. It laid the theoretical groundwork for Shor's and Grover's algorithms.",
    component: DeutschJozsa,
  },
  {
    key: "grover", label: "Grover's Search", difficulty: "Intermediate",
    description: "Finds a marked state in an unsorted database in O(√N) queries — quadratically faster than classical search.",
    whyItMatters: "Grover's algorithm effectively halves the bit-security of symmetric encryption. AES-128 drops to ~64-bit effective security — below the safety threshold. AES-256 is the minimum recommendation in a post-quantum world.",
    component: Grover,
  },
  {
    key: "bb84", label: "BB84 Protocol (QKD)", difficulty: "Intermediate",
    description: "Quantum Key Distribution: Alice and Bob establish a secret key using quantum states. Eavesdropping is detectable.",
    whyItMatters: "BB84 provides information-theoretically secure key exchange — security guaranteed by physics, not computational hardness. Unlike RSA, it cannot be broken retroactively by a future quantum computer.",
    component: BB84,
  },
  {
    key: "harvest", label: "Harvest Now, Decrypt Later", difficulty: "Beginner",
    description: "Simulate the adversarial strategy of collecting encrypted traffic today to decrypt once a quantum computer becomes available.",
    whyItMatters: "Nation-state adversaries are already storing encrypted government, financial, and health data. Long-lived secrets (classified docs, medical records, intellectual property) encrypted with RSA or ECC today are at risk the moment a cryptographically-relevant quantum computer exists.",
    component: HarvestNow,
  },
  {
    key: "qrng", label: "Quantum Random Number Generator", difficulty: "Beginner",
    description: "Generate truly random cryptographic key material using quantum superposition. Classical PRNGs are deterministic — quantum measurement is not.",
    whyItMatters: "Weak randomness is one of the most exploited vulnerabilities in cryptographic systems. Quantum randomness is certified by physics to be unpredictable, making it ideal for key generation, nonces, and IV selection.",
    component: QRNG,
  },
  {
    key: "teleportation", label: "Quantum Teleportation", difficulty: "Advanced",
    description: "Transfers an unknown quantum state from Alice to Bob using entanglement and 2 classical bits.",
    whyItMatters: "Quantum teleportation is the basis of quantum networking and the quantum internet. It enables secure state transfer without the quantum state ever traversing a classical channel, preventing interception.",
    component: Teleportation,
  },
  {
    key: "bv", label: "Bernstein-Vazirani", difficulty: "Intermediate",
    description: "Finds a hidden binary string with a single oracle query. Classical algorithms require n queries.",
    whyItMatters: "Demonstrates oracle separation between quantum and classical complexity classes. A precursor to Simon's algorithm, which directly inspired Shor's period-finding approach to breaking RSA.",
    component: BernsteinVazirani,
  },
  {
    key: "simon", label: "Simon's Algorithm", difficulty: "Advanced",
    description: "Finds the hidden period of a 2-to-1 function exponentially faster than any classical algorithm — the quantum algorithm that directly inspired Shor's.",
    whyItMatters: "Simon's algorithm was the theoretical blueprint for Shor's algorithm. Understanding it reveals exactly why quantum period-finding breaks the mathematical structure underlying RSA, ECC, and Diffie-Hellman.",
    component: SimonsAlgorithm,
  },
  {
    key: "speed", label: "Classical vs Quantum Speed", difficulty: "Beginner",
    description: "Side-by-side comparison of classical O(N) search vs Grover's O(√N) quantum search.",
    whyItMatters: "Visualizing the quadratic speedup makes concrete why doubling key sizes (AES-128 → AES-256) is necessary. The gap widens dramatically at the key sizes used in real-world cryptography.",
    component: SpeedComparison,
  },
  {
    key: "bloch", label: "Bloch Sphere", difficulty: "Beginner",
    description: "Visualize any single-qubit state as a point on the Bloch sphere. Drag sliders to explore the state space.",
    whyItMatters: "The Bloch sphere is the fundamental geometric model of a qubit. Every quantum gate is a rotation on this sphere — understanding it is the key to reading quantum circuit diagrams.",
    component: BlochSphere,
  },
  {
    key: "shor", label: "Shor's Algorithm + RSA", difficulty: "Advanced",
    description: "Factors integers in polynomial time using quantum period-finding — exponentially faster than classical and breaks RSA.",
    whyItMatters: "Shor's algorithm renders RSA, ECC, and Diffie-Hellman completely broken. Every TLS connection, HTTPS website, and signed software update relies on these. A cryptographically-relevant quantum computer makes today's PKI obsolete overnight.",
    component: Shor,
  },
  {
    key: "circuit", label: "Quantum Circuit Builder", difficulty: "Intermediate",
    description: "Drag-and-drop H, X, Z, S, T gates onto 3 qubits across 5 time slots and simulate the resulting state vector with live probability bars.",
    whyItMatters: "Reading and writing quantum circuits is the universal language of quantum computing. Every quantum algorithm — Grover's, Shor's, BB84 — is a circuit. This builder lets you discover gate behaviors hands-on and see how combinations create entanglement and interference.",
    component: CircuitBuilder,
  },
  {
    key: "kyber", label: "CRYSTALS-Kyber (PQC)", difficulty: "Intermediate",
    description: "Walk through the NIST-standardized post-quantum KEM: keygen → encapsulate → decapsulate. Alice and Bob establish a shared secret safe from Shor's algorithm.",
    whyItMatters: "CRYSTALS-Kyber is the NIST-selected replacement for RSA and ECC key exchange. Based on the hardness of Module-LWE, it resists both classical and quantum attacks. TLS 1.3 and major cloud providers are actively migrating to it now.",
    component: CRYSTALSKyber,
  },
  {
    key: "risk", label: "Quantum Risk Auditor", difficulty: "Beginner",
    description: "Audit your cryptographic stack for quantum vulnerability. Mark algorithms in use to see your risk level.",
    whyItMatters: "Most organizations have no inventory of which quantum-vulnerable algorithms they depend on. NIST's post-quantum standards (CRYSTALS-Kyber, Dilithium) are finalized — migration planning must begin now to meet compliance windows.",
    component: RiskAuditor,
  },
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
            {ALGORITHMS.map(a => {
              const ds = DIFF_STYLE[a.difficulty];
              const isActive = selected === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => setSelected(a.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive ? "text-white font-semibold" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                  style={isActive ? { background: "rgba(124,58,237,0.5)", border: "1px solid rgba(168,85,247,0.4)" } : {}}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{a.label}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: ds.color, background: ds.bg }}>
                      {a.difficulty}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="glass p-6 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{algo.label}</h1>
                <span className="text-xs font-semibold px-2 py-1 rounded shrink-0"
                  style={{ color: DIFF_STYLE[algo.difficulty].color, background: DIFF_STYLE[algo.difficulty].bg }}>
                  {algo.difficulty}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{algo.description}</p>
            </div>
            <div className="border-t border-white/10" />
            <AlgoComponent />
            <div className="border-t border-white/10" />
            <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(168,85,247,0.8)" }}>
                Why This Matters
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {algo.whyItMatters}
              </p>
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
