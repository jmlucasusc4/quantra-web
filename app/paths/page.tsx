'use client'
import Image from 'next/image'
import Link from 'next/link'
import { PATHS } from '@/lib/paths'

const DIFF_COLOR: Record<string, string> = {
  Beginner:     '#34d399',
  Intermediate: '#fbbf24',
  Advanced:     '#f87171',
}

const TIER_LABEL: Record<string, string> = {
  free:     'Free',
  pro:      'Pro',
  research: 'Research',
}

export default function PathsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07050f', fontFamily: 'system-ui, sans-serif', color: '#e2d9f3' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1630', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(7,5,15,0.90)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/quantra-mark.png" alt="Quantra" width={40} height={30} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f0ebff' }}>Quantra</span>
          <span style={{ color: '#3a2e5c', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 14, color: '#7c6aad' }}>Learning Paths</span>
        </Link>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/standards" style={{ fontSize: 12, color: '#6b5e8c', textDecoration: 'none' }}>Standards</Link>
          <Link href="/dashboard" style={{ fontSize: 12, color: '#6b5e8c', textDecoration: 'none' }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#d4af6a', marginBottom: 10, fontWeight: 600 }}>
            Role-Based Curriculum
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebff', marginBottom: 12, lineHeight: 1.2 }}>
            Learning Paths
          </h1>
          <p style={{ fontSize: 14, color: '#8b7eb8', lineHeight: 1.7, maxWidth: 560 }}>
            Structured demo sequences mapped to your role and mapped to NIST PQC standards.
            Each path delivers the specific knowledge your team needs — nothing more, nothing less.
          </p>
        </div>

        {/* Path cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PATHS.map(path => (
            <Link key={path.id} href={`/paths/${path.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#0d0b1a',
                border: `1px solid #2a2450`,
                borderLeft: `3px solid ${path.color}`,
                borderRadius: 16,
                padding: '28px 28px',
                transition: 'border-color .15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = path.color)}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2450'
                e.currentTarget.style.borderLeftColor = path.color
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Role badge */}
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: path.color, background: `${path.color}18`, border: `1px solid ${path.color}35`, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                        {path.role}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebff', marginBottom: 4 }}>{path.name}</h2>
                    <p style={{ fontSize: 13, color: '#a78bfa', marginBottom: 10, fontStyle: 'italic' }}>{path.tagline}</p>
                    <p style={{ fontSize: 13, color: '#6b5e8c', lineHeight: 1.6, marginBottom: 16, maxWidth: 520 }}>{path.description}</p>

                    {/* Standards */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                      {path.standards.map(s => (
                        <span key={s} style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#d4af6a', background: '#1a1630', border: '1px solid #2a2450', padding: '2px 8px', borderRadius: 4 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, color: DIFF_COLOR[path.difficulty], background: `${DIFF_COLOR[path.difficulty]}15`, border: `1px solid ${DIFF_COLOR[path.difficulty]}30`, padding: '3px 10px', borderRadius: 99 }}>
                        {path.difficulty}
                      </span>
                      <span style={{ fontSize: 11, color: '#6b5e8c', background: '#1a1630', border: '1px solid #2a2450', padding: '3px 10px', borderRadius: 99 }}>
                        {TIER_LABEL[path.requiredTier]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#4a3e6c' }}>{path.demos.length} demos · {path.duration}</div>
                    <div style={{ fontSize: 12, color: path.color, fontWeight: 500 }}>
                      View path →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: '24px 28px', background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', marginBottom: 6 }}>Enterprise &amp; Team Training</div>
          <p style={{ fontSize: 13, color: '#6b5e8c', lineHeight: 1.6, marginBottom: 16 }}>
            Need custom paths mapped to your organization&apos;s cryptographic inventory and compliance requirements?
          </p>
          <Link href="/enterprise" style={{ fontSize: 13, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', padding: '10px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 500 }}>
            Talk to us about Enterprise →
          </Link>
        </div>
      </div>
    </div>
  )
}
