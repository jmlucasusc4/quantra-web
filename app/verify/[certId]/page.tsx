import Image from 'next/image'
import type { CertificateData } from '@/lib/certificates'
import type { ReadinessResult } from '@/lib/readiness'

const LEVEL_LABEL: Record<string, string> = {
  novice: 'Novice', developing: 'Developing', proficient: 'Proficient', expert: 'Expert',
}

const CATEGORIES = [
  { key: 'algorithmsScore', label: 'Algorithms' },
  { key: 'cryptoScore',     label: 'Cryptography' },
  { key: 'riskScore',       label: 'Risk Analysis' },
  { key: 'pqcScore',        label: 'Post-Quantum' },
] as const

const NIST_STANDARDS = [
  { id: 'FIPS 203',         name: 'ML-KEM (CRYSTALS-Kyber)' },
  { id: 'FIPS 204',         name: 'ML-DSA (CRYSTALS-Dilithium)' },
  { id: 'NIST SP 800-208',  name: 'Post-Quantum Cryptography' },
  { id: 'NIST SP 800-57',   name: 'Key Management' },
  { id: 'CISA PQC',         name: 'Migration Guidance' },
]

async function getCert(certId: string): Promise<CertificateData | null> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin')
    const snap = await adminDb().collection('certificates').doc(certId).get()
    if (!snap.exists) return null
    return snap.data() as CertificateData
  } catch {
    return null
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#a89bc2', letterSpacing: '.06em', textTransform: 'uppercase' as const }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace' }}>{value}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: '#1e1640', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, borderRadius: 2, background: 'linear-gradient(90deg, #7c3aed, #d4af6a)' }} />
      </div>
    </div>
  )
}

function NotFound({ certId }: { certId: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0818', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#6b5e8c', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✗</div>
        <h1 style={{ fontSize: 18, color: '#f0ebff', marginBottom: 8 }}>Certificate Not Found</h1>
        <p style={{ fontSize: 13, marginBottom: 4 }}>No certificate found for ID:</p>
        <code style={{ fontSize: 12, color: '#a89bc2', background: '#1a1630', padding: '4px 10px', borderRadius: 6 }}>{certId}</code>
        <p style={{ fontSize: 12, marginTop: 16, color: '#4a3e6c' }}>
          This certificate may not exist or has not been issued yet.
        </p>
      </div>
    </div>
  )
}

export default async function VerifyPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params
  const cert = await getCert(certId)

  if (!cert) return <NotFound certId={certId} />

  const issued = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const r: ReadinessResult = cert.readiness

  return (
    <div style={{ minHeight: '100vh', background: '#07050f', fontFamily: 'system-ui, sans-serif', padding: '40px 16px' }}>

      {/* Verified badge */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.30)',
          borderRadius: 999, padding: '6px 18px',
        }}>
          <span style={{ fontSize: 14, color: '#34d399' }}>✓</span>
          <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
            Verified Certificate
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#4a3e6c', marginTop: 8 }}>
          This certificate was issued by Quantra and is authentic.
        </p>
      </div>

      {/* Certificate card */}
      <div style={{
        background: 'linear-gradient(145deg, #0c0920, #110e24, #0a0718)',
        border: '1px solid #3d2e6e', borderRadius: 20,
        padding: '40px 44px', position: 'relative', overflow: 'hidden',
        maxWidth: 680, margin: '0 auto',
      }}>
        {/* Corner ornaments */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={`${v}${h}`} style={{
            position: 'absolute', [v]: 16, [h]: 16, width: 28, height: 28,
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: '2px solid #d4af6a',
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: '2px solid #d4af6a',
            borderRadius: v === 'top' && h === 'left' ? '4px 0 0 0' : v === 'top' ? '0 4px 0 0' : h === 'left' ? '0 0 0 4px' : '0 0 4px 0',
            opacity: 0.6,
          }} />
        ))}

        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' as const }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Image src="/quantra-mark.png" alt="Quantra" width={80} height={60} />
          </div>
          <div style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase' as const, color: '#d4af6a', marginBottom: 6, fontWeight: 600 }}>
            Quantra · Official Certificate
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.04em', color: '#f0ebff', margin: 0, textTransform: 'uppercase' as const }}>
            Quantum Readiness Certificate
          </h2>
        </div>

        <div style={{ height: 1, margin: '0 auto 24px', background: 'linear-gradient(90deg, transparent, #3d2e6e, #d4af6a55, #3d2e6e, transparent)' }} />

        {/* Body */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: '#8b7eb8', marginBottom: 10 }}>This certifies that</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#f0ebff', marginBottom: 14 }}>{cert.displayName}</p>
          <p style={{ fontSize: 13, color: '#8b7eb8', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            has successfully completed all modules of the{' '}
            <span style={{ color: '#c4b5fd' }}>Quantra Quantum Readiness Program</span>{' '}
            and demonstrated proficiency in quantum computing fundamentals,
            cryptographic vulnerabilities, and post-quantum migration strategies.
          </p>
        </div>

        {/* Score overview */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 12, padding: '14px 24px', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#d4af6a', lineHeight: 1 }}>{r.total}</div>
            <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginTop: 2 }}>Overall Score</div>
          </div>
          <div style={{ width: 1, height: 40, background: '#2a2450' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>{LEVEL_LABEL[r.level]}</div>
            <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginTop: 2 }}>Level</div>
          </div>
          <div style={{ width: 1, height: 40, background: '#2a2450' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399', lineHeight: 1 }}>15/15</div>
            <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginTop: 2 }}>Demos</div>
          </div>
        </div>

        {/* Score bars */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {CATEGORIES.map(({ key, label }) => (
            <ScoreBar key={key} label={label} value={r.breakdown[key]} />
          ))}
        </div>

        {/* NIST alignment */}
        <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(109,40,217,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: '#6b5e8c', marginBottom: 10, fontWeight: 600 }}>
            Standards Alignment
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {NIST_STANDARDS.map(s => (
              <div key={s.id} style={{
                background: '#110e24', border: '1px solid #2a2450',
                borderRadius: 6, padding: '4px 10px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace' }}>{s.id}</span>
                <span style={{ fontSize: 9, color: '#6b5e8c' }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, margin: '0 0 20px', background: 'linear-gradient(90deg, transparent, #3d2e6e, #d4af6a55, #3d2e6e, transparent)' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginBottom: 2 }}>Date Issued</div>
            <div style={{ fontSize: 12, color: '#a89bc2' }}>{issued}</div>
          </div>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 9, color: '#6b5e8c', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 2 }}>quantra.space</div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginBottom: 2 }}>Certificate ID</div>
            <div style={{ fontSize: 12, color: '#a89bc2', fontFamily: 'ui-monospace, monospace' }}>{cert.certId}</div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2040', marginTop: 24 }}>
        Verify at quantra.space/verify/{cert.certId}
      </p>
    </div>
  )
}
