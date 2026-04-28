import Image from 'next/image'
import Link from 'next/link'

const LAST_REVIEWED = 'April 27, 2026'

const FINALIZED = [
  {
    id: 'FIPS 203',
    name: 'ML-KEM',
    full: 'Module-Lattice Key-Encapsulation Mechanism',
    basis: 'CRYSTALS-Kyber',
    published: 'August 13, 2024',
    purpose: 'Key encapsulation / key exchange',
    replaces: 'RSA, ECDH',
    demo: { label: 'CRYSTALS-Kyber demo', href: '/?demo=crystals-kyber' },
    ref: 'https://csrc.nist.gov/pubs/fips/203/final',
  },
  {
    id: 'FIPS 204',
    name: 'ML-DSA',
    full: 'Module-Lattice Digital Signature Algorithm',
    basis: 'CRYSTALS-Dilithium',
    published: 'August 13, 2024',
    purpose: 'Digital signatures',
    replaces: 'RSA-PSS, ECDSA',
    demo: null,
    ref: 'https://csrc.nist.gov/pubs/fips/204/final',
  },
  {
    id: 'FIPS 205',
    name: 'SLH-DSA',
    full: 'Stateless Hash-Based Digital Signature Algorithm',
    basis: 'SPHINCS+',
    published: 'August 13, 2024',
    purpose: 'Digital signatures (hash-based)',
    replaces: 'RSA-PSS, ECDSA',
    demo: null,
    ref: 'https://csrc.nist.gov/pubs/fips/205/final',
  },
]

const IN_PROGRESS = [
  {
    id: 'FIPS 206',
    name: 'FN-DSA',
    full: 'Falcon-Based Digital Signature Algorithm',
    basis: 'FALCON',
    status: 'Draft — public comment period',
    expected: 'Late 2026 / Early 2027',
    ref: 'https://csrc.nist.gov/pubs/fips/206/ipd',
  },
  {
    id: 'HQC',
    name: 'HQC',
    full: 'Hamming Quasi-Cyclic',
    basis: 'Code-based cryptography',
    status: 'Selected for standardization',
    expected: 'TBD',
    ref: 'https://csrc.nist.gov/projects/post-quantum-cryptography',
  },
]

const PUBLICATIONS = [
  {
    id: 'NIST IR 8547',
    name: 'Transition to Post-Quantum Cryptography Standards',
    desc: 'Migration roadmap and implementation guidance for federal systems.',
    ref: 'https://csrc.nist.gov/pubs/ir/8547/ipd',
  },
  {
    id: 'NIST SP 800-208',
    name: 'Recommendation for Stateful Hash-Based Signature Schemes',
    desc: 'Covers LMS and XMSS — complementary to FIPS 205.',
    ref: 'https://csrc.nist.gov/pubs/sp/800/208/final',
  },
  {
    id: 'NIST SP 800-57',
    name: 'Recommendation for Key Management',
    desc: 'Key lifecycle guidance applicable to PQC key material.',
    ref: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final',
  },
]

const DEADLINES = [
  {
    year: '2027',
    label: 'NSS Compliance Begins',
    desc: 'US National Security Systems must begin PQC migration.',
    urgent: true,
  },
  {
    year: '2031',
    label: 'Legacy Algorithms Deprecated',
    desc: 'Quantum-vulnerable algorithms with 112-bit security strength deprecated for federal systems.',
    urgent: false,
  },
  {
    year: '2035',
    label: 'Full Prohibition',
    desc: 'RSA, ECC, and Diffie-Hellman prohibited from all NIST standards.',
    urgent: false,
  },
]

const RELATED_DEMOS = [
  { label: 'CRYSTALS-Kyber (FIPS 203)',       href: '/?demo=crystals-kyber',       standard: 'FIPS 203' },
  { label: 'Harvest Now, Decrypt Later',       href: '/?demo=harvest-now',          standard: 'IR 8547'  },
  { label: 'Quantum Risk Auditor',             href: '/?demo=quantum-risk-auditor', standard: 'IR 8547'  },
  { label: "Shor's Algorithm + RSA",           href: '/?demo=shors-algorithm',      standard: 'Context'  },
  { label: 'BB84 Protocol (QKD)',              href: '/?demo=bb84-protocol',        standard: 'SP 800-57'},
]

export default function StandardsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07050f', fontFamily: 'system-ui, sans-serif', color: '#e2d9f3' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1630', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(7,5,15,0.90)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/quantra-mark.png" alt="Quantra" width={40} height={30} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f0ebff' }}>Quantra</span>
          <span style={{ color: '#3a2e5c', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 14, color: '#7c6aad' }}>Standards Tracker</span>
        </Link>
        <div style={{ fontSize: 11, color: '#4a3e6c' }}>
          Last reviewed: <span style={{ color: '#7c6aad' }}>{LAST_REVIEWED}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#d4af6a', marginBottom: 10, fontWeight: 600 }}>
            Live Reference
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebff', marginBottom: 12, lineHeight: 1.2 }}>
            Post-Quantum Cryptography Standards
          </h1>
          <p style={{ fontSize: 14, color: '#8b7eb8', lineHeight: 1.7, maxWidth: 580 }}>
            Current status of NIST PQC standards, migration deadlines, and the Quantra demos that cover each one.
            Maintained as standards evolve — last reviewed {LAST_REVIEWED}.
          </p>
        </div>

        {/* Finalized standards */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#34d399', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>
              Finalized — Active Standards
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FINALIZED.map(s => (
              <div key={s.id} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace' }}>{s.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebff' }}>{s.name}</span>
                      <span style={{ fontSize: 10, background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '2px 8px', borderRadius: 99 }}>
                        Finalized
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b5e8c', marginBottom: 8 }}>{s.full}</div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#4a3e6c', textTransform: 'uppercase', letterSpacing: '.06em' }}>Basis  </span>
                        <span style={{ fontSize: 11, color: '#a89bc2' }}>{s.basis}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#4a3e6c', textTransform: 'uppercase', letterSpacing: '.06em' }}>Purpose  </span>
                        <span style={{ fontSize: 11, color: '#a89bc2' }}>{s.purpose}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: '#4a3e6c', textTransform: 'uppercase', letterSpacing: '.06em' }}>Replaces  </span>
                        <span style={{ fontSize: 11, color: '#f87171' }}>{s.replaces}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#4a3e6c' }}>Published {s.published}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {s.demo && (
                        <Link href={s.demo.href} style={{ fontSize: 11, color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', padding: '4px 10px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          ▶ {s.demo.label}
                        </Link>
                      )}
                      <a href={s.ref} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#4a3e6c', padding: '4px 10px', border: '1px solid #1a1630', borderRadius: 6, textDecoration: 'none' }}>
                        NIST ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* In progress */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>
              In Progress
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {IN_PROGRESS.map(s => (
              <div key={s.id} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace' }}>{s.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebff' }}>{s.name}</span>
                      <span style={{ fontSize: 10, background: 'rgba(251,191,36,0.10)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', padding: '2px 8px', borderRadius: 99 }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b5e8c', marginBottom: 8 }}>{s.full}</div>
                    <div style={{ fontSize: 11, color: '#a89bc2' }}>
                      <span style={{ color: '#4a3e6c', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10 }}>Basis  </span>
                      {s.basis}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#4a3e6c' }}>Expected: {s.expected}</div>
                    <a href={s.ref} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#4a3e6c', padding: '4px 10px', border: '1px solid #1a1630', borderRadius: 6, textDecoration: 'none' }}>
                      NIST ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Migration deadlines */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#f87171', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>
              Migration Deadlines
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {DEADLINES.map(d => (
              <div key={d.year} style={{
                flex: 1, minWidth: 200,
                background: '#0d0b1a',
                border: `1px solid ${d.urgent ? 'rgba(248,113,113,0.30)' : '#2a2450'}`,
                borderRadius: 14, padding: '20px 20px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: d.urgent ? '#f87171' : '#d4af6a', lineHeight: 1, marginBottom: 6 }}>{d.year}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', marginBottom: 8 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: '#6b5e8c', lineHeight: 1.6 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Related publications */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>
              Related Publications
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PUBLICATIONS.map(p => (
              <div key={p.id} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace', marginRight: 10 }}>{p.id}</span>
                  <span style={{ fontSize: 12, color: '#c4b5fd' }}>{p.name}</span>
                  <div style={{ fontSize: 11, color: '#4a3e6c', marginTop: 3 }}>{p.desc}</div>
                </div>
                <a href={p.ref} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#4a3e6c', padding: '4px 10px', border: '1px solid #1a1630', borderRadius: 6, textDecoration: 'none', flexShrink: 0 }}>
                  NIST ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Related demos */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8' }} />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>
              Related Quantra Demos
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {RELATED_DEMOS.map(d => (
              <Link key={d.href} href={d.href} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#0d0b1a', border: '1px solid #2a2450',
                borderRadius: 10, padding: '10px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#d4af6a', background: '#1a1630', padding: '2px 6px', borderRadius: 4 }}>{d.standard}</span>
                <span style={{ fontSize: 12, color: '#c4b5fd' }}>{d.label}</span>
                <span style={{ fontSize: 12, color: '#3a2e5c' }}>▶</span>
              </Link>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #1a1630', fontSize: 11, color: '#2a2040', textAlign: 'center' }}>
          Quantra maintains this page as NIST standards evolve. Source: csrc.nist.gov
        </div>
      </div>
    </div>
  )
}
