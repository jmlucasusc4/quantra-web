"use client";
import Link from "next/link";
import Image from "next/image";

// ── Data ──────────────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: "IonQ",
    type: "Pure-Play Quantum",
    logo: "🔵",
    hiring: true,
    roles: ["Quantum Software Engineer", "Algorithm Researcher", "DevRel Engineer"],
    jobsUrl: "https://ionq.com/careers",
    color: "#60a5fa",
  },
  {
    name: "IBM Quantum",
    type: "Enterprise / Cloud",
    logo: "🔷",
    hiring: true,
    roles: ["Quantum Systems Engineer", "PQC Security Architect", "Research Scientist"],
    jobsUrl: "https://careers.ibm.com/",
    color: "#818cf8",
  },
  {
    name: "Google Quantum AI",
    type: "Research / Hardware",
    logo: "🟢",
    hiring: true,
    roles: ["Quantum Hardware Engineer", "Software Engineer (Cirq)", "Research Scientist"],
    jobsUrl: "https://www.google.com/about/careers/applications/jobs/results/?company=Google&employment_type=FULL_TIME&employment_type=PART_TIME&location=California,%20USA&location=Munich,%20Germany&location=Seattle,%20WA,%20USA&location=Zurich,%20Switzerland&q=quantum&sort_by=relevance&src=Online%2FGoogle%20Website%2FQuantum_AI&utm_campaign=Quantum_AI&utm_medium=Google%20Website&utm_source=online",
    color: "#34d399",
  },
  {
    name: "Quantinuum",
    type: "Trapped Ion / Enterprise",
    logo: "🟣",
    hiring: true,
    roles: ["Quantum Algorithm Developer", "Cybersecurity Researcher", "Solutions Engineer"],
    jobsUrl: "https://www.quantinuum.com/careers",
    color: "#a78bfa",
  },
  {
    name: "Microsoft Azure Quantum",
    type: "Cloud / Topological",
    logo: "🔹",
    hiring: true,
    roles: ["Quantum Network Engineer", "PQC Cryptographer", "Principal Engineer"],
    jobsUrl: "https://careers.microsoft.com/",
    color: "#38bdf8",
  },
  {
    name: "PsiQuantum",
    type: "Photonic Hardware",
    logo: "🌟",
    hiring: true,
    roles: ["Photonics Engineer", "Quantum Error Correction", "Systems Architect"],
    jobsUrl: "https://www.psiquantum.com/careers",
    color: "#fbbf24",
  },
  {
    name: "Cloudflare",
    type: "Network Security",
    logo: "🟠",
    hiring: true,
    roles: ["PQC Cryptography Engineer", "TLS Protocol Engineer", "Security Researcher"],
    jobsUrl: "https://www.cloudflare.com/careers/",
    color: "#fb923c",
  },
  {
    name: "NSA / CISA",
    type: "Government / Federal",
    logo: "🦅",
    hiring: true,
    roles: ["Cryptanalyst", "PQC Migration Specialist", "Information Assurance"],
    jobsUrl: "https://www.intelligencecareers.gov/",
    color: "#f87171",
  },
  {
    name: "NIST",
    type: "Standards / Research",
    logo: "📐",
    hiring: true,
    roles: ["Cryptographic Standards Researcher", "Computer Scientist", "PQC Analyst"],
    jobsUrl: "https://www.nist.gov/careers",
    color: "#d4af6a",
  },
];

const ROLES = [
  {
    title: "Quantum Software Engineer",
    salary: "$160K – $240K",
    demand: "High",
    demandColor: "#34d399",
    skills: ["superposition", "entanglement", "circuit-builder", "deutsch-jozsa"],
    skillLabels: ["Superposition", "Entanglement", "Circuit Builder", "Deutsch-Jozsa"],
    desc: "Build quantum algorithms, circuits, and SDKs. Primary employers: IBM, IonQ, Google, startups.",
  },
  {
    title: "Post-Quantum Cryptographer",
    salary: "$180K – $280K",
    demand: "Very High",
    demandColor: "#a78bfa",
    skills: ["crystals-kyber", "bb84-protocol", "pqc-switch", "shors-algorithm"],
    skillLabels: ["CRYSTALS-Kyber", "BB84 QKD", "PQC Switch", "Shor's Algorithm"],
    desc: "Design and implement PQC migration strategies. Critical role as NIST FIPS 203/204 rollouts accelerate.",
  },
  {
    title: "Security Architect (Quantum)",
    salary: "$200K – $320K",
    demand: "Very High",
    demandColor: "#a78bfa",
    skills: ["quantum-risk-auditor", "cbom-generator", "harvest-now", "crystals-kyber"],
    skillLabels: ["Risk Auditor", "CBOM Generator", "Harvest Now", "CRYSTALS-Kyber"],
    desc: "Lead enterprise cryptographic inventory and PQC migration planning. CISO-track role at Fortune 500s.",
  },
  {
    title: "Quantum Research Scientist",
    salary: "$140K – $220K + equity",
    demand: "Moderate",
    demandColor: "#fbbf24",
    skills: ["simons-algorithm", "grovers-search", "quantum-teleportation", "bloch-sphere"],
    skillLabels: ["Simon's Algorithm", "Grover's Search", "Teleportation", "Bloch Sphere"],
    desc: "Advance the theoretical and applied frontiers of quantum computing. PhD typically required.",
  },
  {
    title: "Cryptanalyst (Federal)",
    salary: "$120K – $180K + clearance",
    demand: "High",
    demandColor: "#34d399",
    skills: ["bb84-protocol", "shors-algorithm", "bernstein-vazirani", "harvest-now"],
    skillLabels: ["BB84 QKD", "Shor's Algorithm", "Bernstein-Vazirani", "Harvest Now"],
    desc: "Assess vulnerabilities in adversary cryptographic systems. NSA, CISA, DoD, Intelligence Community.",
  },
  {
    title: "Quantum DevRel / Educator",
    salary: "$120K – $170K",
    demand: "Growing",
    demandColor: "#60a5fa",
    skills: ["superposition", "entanglement", "bloch-sphere", "deutsch-jozsa"],
    skillLabels: ["Superposition", "Entanglement", "Bloch Sphere", "Deutsch-Jozsa"],
    desc: "Teach, document, and evangelize quantum platforms. Strong communicators with technical depth.",
  },
];

const BOARDS = [
  { name: "Quantum Computing Report Jobs", url: "https://quantumcomputingreport.com/jobs/", desc: "Curated quantum industry job listings" },
  { name: "QED-C Job Board",              url: "https://quantumconsortium.org/jobs/",      desc: "Quantum Economic Development Consortium" },
  { name: "LinkedIn — Quantum",     url: "https://linkedin.com/jobs/quantum-computing-jobs", desc: "Filter by 'quantum computing' keyword" },
  { name: "USAJOBS — Cryptography", url: "https://www.usajobs.gov/Search/Results?k=cryptography", desc: "Federal cryptography and quantum roles" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CareersPage() {
  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl"
        style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image src="/quantra-mark.png" alt="Quantra" width={40} height={30} />
            <span className="font-bold text-white">Quantra</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/hub"     className="text-xs text-white/50 hover:text-white transition-colors hidden sm:block">Lab Hub</Link>
            <Link href="/paths"   className="text-xs text-white/50 hover:text-white transition-colors hidden sm:block">Paths</Link>
            <Link href="/pricing" className="text-xs text-white/50 hover:text-white transition-colors hidden sm:block">Pricing</Link>
            <Link href="/careers" className="text-xs font-semibold text-purple-300 hidden sm:block">Careers</Link>
            <Link href="/signup"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
            ⚡ Quantum jobs growing 40% YoY — NIST PQC rollout is driving demand
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Quantum Careers
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            The skills you build on Quantra map directly to the roles companies are hiring for right now.
            Here's where the jobs are — and exactly what you need to get them.
          </p>
        </div>

        {/* Role breakdown */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Roles & What They Pay</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            Each role lists the Quantra simulations that directly build the required skills.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ROLES.map(role => (
              <div key={role.title} className="rounded-xl p-5 flex flex-col gap-3"
                style={{ background: "rgba(8,10,28,0.82)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{role.title}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: role.demandColor, background: `${role.demandColor}18`, border: `1px solid ${role.demandColor}40` }}>
                    {role.demand} Demand
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{role.desc}</p>
                <div className="text-sm font-bold" style={{ color: "#34d399" }}>{role.salary}</div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Build these skills on Quantra
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.skillLabels.map((label, i) => (
                      <Link key={label} href={`/?demo=${role.skills[i]}`}
                        className="text-[10px] px-2 py-0.5 rounded transition-colors hover:border-purple-400/50"
                        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
                        {label} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Companies hiring */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Companies Hiring Now</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            Direct links to careers pages. Updated manually — always check the source.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPANIES.map(co => (
              <a key={co.name} href={co.jobsUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5 no-underline group"
                style={{ background: "rgba(8,10,28,0.82)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${co.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white group-hover:text-white/90">{co.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{co.type}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ color: co.color, background: `${co.color}18`, border: `1px solid ${co.color}35` }}>
                    Hiring
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {co.roles.map(r => (
                    <p key={r} className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>· {r}</p>
                  ))}
                </div>
                <p className="text-[10px] mt-1" style={{ color: co.color }}>View openings →</p>
              </a>
            ))}
          </div>
        </section>

        {/* Job boards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Job Boards</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {BOARDS.map(b => (
              <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-4 flex items-center justify-between gap-3 no-underline hover:border-white/20 transition-colors"
                style={{ background: "rgba(8,10,28,0.82)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                <div>
                  <p className="font-semibold text-sm text-white">{b.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{b.desc}</p>
                </div>
                <span className="text-white/30 shrink-0">↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="rounded-2xl p-10 text-center"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(12px)" }}>
            <h2 className="text-2xl font-bold text-white mb-3">
              The skills gap is real. The opportunity is bigger.
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Most security engineers have never run a quantum algorithm.
              Start now — 20+ hands-on simulations, free tier included, no install required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup"
                className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                Start Learning Free
              </Link>
              <Link href="/pricing"
                className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
                See Pro Features
              </Link>
            </div>
          </div>
        </section>

      </div>

      <footer className="text-center py-8 text-xs border-t border-white/5 mt-8"
        style={{ color: "rgba(255,255,255,0.2)" }}>
        <div className="flex justify-center gap-6 mb-2">
          <Link href="/hub"      className="hover:text-white/50 transition-colors">Lab Hub</Link>
          <Link href="/paths"    className="hover:text-white/50 transition-colors">Paths</Link>
          <Link href="/pricing"  className="hover:text-white/50 transition-colors">Pricing</Link>
          <Link href="/enterprise" className="hover:text-white/50 transition-colors">Enterprise</Link>
        </div>
        Quantra — quantum simulations run entirely in your browser
      </footer>
    </div>
  );
}
