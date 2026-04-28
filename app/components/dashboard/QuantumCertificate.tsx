'use client'
import Image from 'next/image'
import type { ReadinessResult } from '@/lib/readiness'

interface Props {
  displayName: string
  readiness: ReadinessResult
  completedAt: string   // ISO date string
  certId: string
}

const LEVEL_LABEL: Record<string, string> = {
  novice:     'Novice',
  developing: 'Developing',
  proficient: 'Proficient',
  expert:     'Expert',
}

const CATEGORIES = [
  { key: 'algorithmsScore', label: 'Algorithms' },
  { key: 'cryptoScore',     label: 'Cryptography' },
  { key: 'riskScore',       label: 'Risk Analysis' },
  { key: 'pqcScore',        label: 'Post-Quantum' },
] as const

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#a89bc2', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#d4af6a', fontFamily: 'ui-monospace, monospace' }}>
          {value}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: '#1e1640', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, borderRadius: 2,
          background: 'linear-gradient(90deg, #7c3aed, #d4af6a)',
          transition: 'width .6s ease',
        }} />
      </div>
    </div>
  )
}

export function QuantumCertificate({ displayName, readiness, completedAt, certId }: Props) {
  const issued = new Date(completedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  function handlePrint() {
    window.print()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(certId)
  }

  return (
    <>
      {/* Print-only isolation style */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .qrc-print-wrapper { display: block !important; position: fixed !important; inset: 0; }
          .qrc-actions { display: none !important; }
        }
      `}</style>

      <div className="qrc-print-wrapper">
        {/* Certificate card */}
        <div id="quantum-certificate" style={{
          background: 'linear-gradient(145deg, #0c0920 0%, #110e24 50%, #0a0718 100%)',
          border: '1px solid #3d2e6e',
          borderRadius: 20,
          padding: '40px 44px',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 680,
          margin: '0 auto',
        }}>
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: 16, left: 16, width: 28, height: 28,
            borderTop: '2px solid #d4af6a', borderLeft: '2px solid #d4af6a', borderRadius: '4px 0 0 0', opacity: 0.6 }} />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28,
            borderTop: '2px solid #d4af6a', borderRight: '2px solid #d4af6a', borderRadius: '0 4px 0 0', opacity: 0.6 }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, width: 28, height: 28,
            borderBottom: '2px solid #d4af6a', borderLeft: '2px solid #d4af6a', borderRadius: '0 0 0 4px', opacity: 0.6 }} />
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 28, height: 28,
            borderBottom: '2px solid #d4af6a', borderRight: '2px solid #d4af6a', borderRadius: '0 0 4px 0', opacity: 0.6 }} />

          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <Image src="/quantra-mark.png" alt="Quantra" width={80} height={60} />
            </div>
            <div style={{
              fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase',
              color: '#d4af6a', marginBottom: 6, fontWeight: 600,
            }}>
              Quantra · Official Certificate
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '.04em',
              color: '#f0ebff', margin: 0, textTransform: 'uppercase',
            }}>
              Quantum Readiness Certificate
            </h2>
          </div>

          {/* Divider */}
          <div style={{
            height: 1, margin: '0 auto 24px',
            background: 'linear-gradient(90deg, transparent, #3d2e6e, #d4af6a55, #3d2e6e, transparent)',
          }} />

          {/* Body */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: '#8b7eb8', marginBottom: 10, letterSpacing: '.04em' }}>
              This certifies that
            </p>
            <p style={{
              fontSize: 26, fontWeight: 700, color: '#f0ebff',
              marginBottom: 14, letterSpacing: '.01em',
            }}>
              {displayName}
            </p>
            <p style={{ fontSize: 13, color: '#8b7eb8', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
              has successfully completed all modules of the{' '}
              <span style={{ color: '#c4b5fd' }}>Quantra Quantum Readiness Program</span>{' '}
              and demonstrated proficiency in quantum computing fundamentals,
              cryptographic vulnerabilities, and post-quantum migration strategies.
            </p>
          </div>

          {/* Score overview */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
            background: '#0d0b1a', border: '1px solid #2a2450',
            borderRadius: 12, padding: '14px 24px', marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#d4af6a', lineHeight: 1 }}>
                {readiness.total}
              </div>
              <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Overall Score
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: '#2a2450' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>
                {LEVEL_LABEL[readiness.level]}
              </div>
              <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Level
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: '#2a2450' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399', lineHeight: 1 }}>
                15/15
              </div>
              <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Demos
              </div>
            </div>
          </div>

          {/* Score bars */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {CATEGORIES.map(({ key, label }) => (
              <ScoreBar key={key} label={label} value={readiness.breakdown[key]} />
            ))}
          </div>

          {/* Divider */}
          <div style={{
            height: 1, margin: '0 0 20px',
            background: 'linear-gradient(90deg, transparent, #3d2e6e, #d4af6a55, #3d2e6e, transparent)',
          }} />

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Date Issued
              </div>
              <div style={{ fontSize: 12, color: '#a89bc2' }}>{issued}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#6b5e8c', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                quantra.space
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#6b5e8c', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Certificate ID
              </div>
              <div style={{ fontSize: 12, color: '#a89bc2', fontFamily: 'ui-monospace, monospace' }}>{certId}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="qrc-actions" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          <button
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff',
              padding: '10px 22px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            ↓ Download PDF
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: '1px solid #3d2e6e', color: '#a89bc2',
              padding: '10px 22px', borderRadius: 9,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Copy Cert ID
          </button>
        </div>
      </div>
    </>
  )
}
