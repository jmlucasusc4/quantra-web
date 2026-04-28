'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { PATHS, pathProgress, nextDemo } from '@/lib/paths'
import { useProgress } from '@/hooks/useProgress'
import { useAuth } from '@/lib/auth-context'
import { useSubscription } from '@/hooks/useSubscription'

const DIFF_COLOR: Record<string, string> = {
  Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171',
}

// Friendly demo name lookup
const DEMO_NAMES: Record<string, string> = {
  'superposition':         'Superposition Demo',
  'entanglement':          'Entanglement Demo',
  'bloch-sphere':          'Bloch Sphere',
  'deutsch-jozsa':         'Deutsch-Jozsa',
  'qrng':                  'Quantum Random Number Generator',
  'classical-vs-quantum':  'Classical vs Quantum Speed',
  'grovers-search':        "Grover's Search",
  'bb84-protocol':         'BB84 Protocol (QKD)',
  'crystals-kyber':        'CRYSTALS-Kyber (PQC)',
  'bernstein-vazirani':    'Bernstein-Vazirani',
  'harvest-now':           'Harvest Now, Decrypt Later',
  'circuit-builder':       'Quantum Circuit Builder',
  'quantum-risk-auditor':  'Quantum Risk Auditor',
  'shors-algorithm':       "Shor's Algorithm + RSA",
  'quantum-teleportation': 'Quantum Teleportation',
  'simons-algorithm':      "Simon's Algorithm",
  'entangled-bloch-spheres': 'Entangled Bloch Spheres',
}

export default function PathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { completedDemos, loading: progressLoading } = useProgress()
  const { hasAccess } = useSubscription()

  const path = PATHS.find(p => p.id === pathId)
  if (!path) {
    return (
      <div style={{ minHeight: '100vh', background: '#07050f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#6b5e8c' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✗</div>
          <p>Path not found. <Link href="/paths" style={{ color: '#a78bfa' }}>View all paths →</Link></p>
        </div>
      </div>
    )
  }

  const loading   = authLoading || progressLoading
  const pct       = loading ? 0 : pathProgress(path, completedDemos)
  const next      = loading ? null : nextDemo(path, completedDemos)
  const locked    = !hasAccess(path.requiredTier as any)
  const completed = pct === 100

  return (
    <div style={{ minHeight: '100vh', background: '#07050f', fontFamily: 'system-ui, sans-serif', color: '#e2d9f3' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1630', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(7,5,15,0.90)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <Link href="/paths" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/quantra-mark.png" alt="Quantra" width={40} height={30} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f0ebff' }}>Quantra</span>
          <span style={{ color: '#3a2e5c', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 14, color: '#7c6aad' }}>Learning Paths</span>
          <span style={{ color: '#3a2e5c', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 14, color: '#7c6aad' }}>{path.name}</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 12, color: '#6b5e8c', textDecoration: 'none' }}>Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Path header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: path.color, background: `${path.color}18`, border: `1px solid ${path.color}35`, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
              {path.role}
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f0ebff', marginBottom: 6 }}>{path.name}</h1>
          <p style={{ fontSize: 14, color: '#a78bfa', marginBottom: 12, fontStyle: 'italic' }}>{path.tagline}</p>
          <p style={{ fontSize: 14, color: '#8b7eb8', lineHeight: 1.7, marginBottom: 20 }}>{path.description}</p>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: DIFF_COLOR[path.difficulty] }}>{path.difficulty}</span>
            <span style={{ fontSize: 12, color: '#4a3e6c' }}>{path.demos.length} demos</span>
            <span style={{ fontSize: 12, color: '#4a3e6c' }}>{path.duration}</span>
          </div>

          {/* Standards */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 24 }}>
            {path.standards.map(s => (
              <span key={s} style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#d4af6a', background: '#1a1630', border: '1px solid #2a2450', padding: '3px 10px', borderRadius: 4 }}>
                {s}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          {user && !loading && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b5e8c' }}>Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: path.color, fontFamily: 'ui-monospace, monospace' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#1e1640', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: `linear-gradient(90deg, #7c3aed, ${path.color})`, transition: 'width .5s ease' }} />
              </div>
            </div>
          )}

          {/* CTA */}
          {locked ? (
            <button
              onClick={() => router.push(`/pricing?upgrade=${path.requiredTier}`)}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Unlock {path.requiredTier.charAt(0).toUpperCase() + path.requiredTier.slice(1)} to Start →
            </button>
          ) : completed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.30)', borderRadius: 10, padding: '10px 20px' }}>
                <span style={{ color: '#34d399', fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>Path Complete</span>
              </div>
              <Link href="/dashboard" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none' }}>View certificate →</Link>
            </div>
          ) : next ? (
            <button
              onClick={() => router.push(`/?demo=${next}`)}
              style={{ background: `linear-gradient(135deg, ${path.color}cc, ${path.color}99)`, border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {pct === 0 ? 'Start Path' : 'Continue'} → {DEMO_NAMES[next] ?? next}
            </button>
          ) : null}
        </div>

        {/* Demo sequence */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b5e8c', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            Demo Sequence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {path.demos.map((slug, i) => {
              const done = completedDemos.includes(slug)
              const isCurrent = !loading && slug === next
              return (
                <div key={slug} style={{ display: 'flex', gap: 0 }}>
                  {/* Spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${done ? '#34d399' : isCurrent ? path.color : '#2a2450'}`,
                      background: done ? '#34d399' : isCurrent ? `${path.color}25` : '#0d0b1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: done ? '#07050f' : isCurrent ? path.color : '#4a3e6c',
                      fontWeight: 700, zIndex: 1,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < path.demos.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 16, background: done ? '#34d39944' : '#1e1640', margin: '2px 0' }} />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => !locked && router.push(`/?demo=${slug}`)}
                    style={{
                      flex: 1, marginLeft: 12, marginBottom: i < path.demos.length - 1 ? 6 : 0,
                      background: isCurrent ? `${path.color}0a` : '#0d0b1a',
                      border: `1px solid ${isCurrent ? path.color + '40' : done ? '#34d39930' : '#2a2450'}`,
                      borderRadius: 10, padding: '12px 16px',
                      cursor: locked ? 'default' : 'pointer',
                      opacity: locked ? 0.5 : 1,
                      transition: 'border-color .15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: done ? '#6b5e8c' : '#e2d9f3', fontWeight: isCurrent ? 600 : 400 }}>
                        {DEMO_NAMES[slug] ?? slug}
                      </span>
                      {isCurrent && <span style={{ fontSize: 11, color: path.color }}>Next ▶</span>}
                      {done && <span style={{ fontSize: 11, color: '#34d399' }}>Done</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
