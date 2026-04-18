'use client'
import { useRouter } from 'next/navigation'

const DEMO_NAMES: Record<string, string> = {
  'superposition':        'Superposition Demo',
  'entanglement':         'Entanglement Demo',
  'bloch-sphere':         'Bloch Sphere',
  'deutsch-jozsa':        'Deutsch-Jozsa',
  'qrng':                 'Quantum RNG',
  'classical-vs-quantum': 'Classical vs Quantum',
  'grovers-search':       "Grover's Search",
  'bb84-protocol':        'BB84 Protocol (QKD)',
  'crystals-kyber':       'CRYSTALS-Kyber',
  'bernstein-vazirani':   'Bernstein-Vazirani',
  'harvest-now':          'Harvest Now, Decrypt Later',
  'circuit-builder':      'Quantum Circuit Builder',
  'quantum-risk-auditor': 'Quantum Risk Auditor',
  'shors-algorithm':      "Shor's Algorithm + RSA",
  'quantum-teleportation':'Quantum Teleportation',
  'simons-algorithm':     "Simon's Algorithm",
}

const DIFF: Record<string, { label: string; color: string; bg: string }> = {
  'superposition':        { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'entanglement':         { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'bloch-sphere':         { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'deutsch-jozsa':        { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'qrng':                 { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'classical-vs-quantum': { label: 'Beginner',     color: '#34d399', bg: '#064e3b' },
  'grovers-search':       { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'bb84-protocol':        { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'crystals-kyber':       { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'bernstein-vazirani':   { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'harvest-now':          { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'circuit-builder':      { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'quantum-risk-auditor': { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a' },
  'shors-algorithm':      { label: 'Advanced',     color: '#fb923c', bg: '#451a03' },
  'quantum-teleportation':{ label: 'Advanced',     color: '#fb923c', bg: '#451a03' },
  'simons-algorithm':     { label: 'Advanced',     color: '#fb923c', bg: '#451a03' },
}

interface Activity {
  id: string
  type: string
  demoSlug?: string
  demoName?: string
  createdAt: number
}

interface Props {
  activities: Activity[]
}

function relativeTime(ms: number) {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function QuickResume({ activities }: Props) {
  const router = useRouter()

  // Get last 3 unique demos from activity
  const seen = new Set<string>()
  const recent: { slug: string; at: number }[] = []
  for (const a of activities) {
    const slug = a.demoSlug
    if (slug && !seen.has(slug)) {
      seen.add(slug)
      recent.push({ slug, at: a.createdAt })
      if (recent.length === 3) break
    }
  }

  if (recent.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 500, color: '#e2d9f3', marginBottom: 12 }}>
        Quick Resume
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {recent.map(({ slug, at }) => {
          const name = DEMO_NAMES[slug] ?? slug
          const diff = DIFF[slug]
          return (
            <div
              key={slug}
              style={{
                background: '#0d0b1a',
                border: '1px solid #2a2450',
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2450')}
              onClick={() => router.push(`/?demo=${slug}`)}
            >
              {diff && (
                <span style={{
                  fontSize: 9, fontWeight: 600,
                  background: diff.bg, color: diff.color,
                  padding: '2px 8px', borderRadius: 20,
                  display: 'inline-block', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                }}>
                  {diff.label}
                </span>
              )}
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e2d9f3', marginBottom: 6, lineHeight: 1.3 }}>
                {name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#3a3060' }}>{relativeTime(at)}</span>
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 500 }}>Resume →</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
