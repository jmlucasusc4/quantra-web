'use client'
import { useRouter } from 'next/navigation'
import type { Tier } from '@/lib/stripe'

interface Demo {
  slug: string
  name: string
  diff: 'Beginner' | 'Intermediate' | 'Advanced'
  tier: 'free' | 'pro' | 'research'
}

const DEMOS: Demo[] = [
  { slug: 'superposition',        name: 'Superposition',          diff: 'Beginner',     tier: 'free' },
  { slug: 'entanglement',         name: 'Entanglement',            diff: 'Beginner',     tier: 'free' },
  { slug: 'bloch-sphere',         name: 'Bloch Sphere',            diff: 'Beginner',     tier: 'free' },
  { slug: 'deutsch-jozsa',        name: 'Deutsch-Jozsa',           diff: 'Beginner',     tier: 'free' },
  { slug: 'qrng',                 name: 'Quantum RNG',             diff: 'Beginner',     tier: 'free' },
  { slug: 'classical-vs-quantum', name: 'Classical vs Quantum',    diff: 'Beginner',     tier: 'free' },
  { slug: 'grovers-search',       name: "Grover's Search",         diff: 'Intermediate', tier: 'pro' },
  { slug: 'bb84-protocol',        name: 'BB84 (QKD)',              diff: 'Intermediate', tier: 'pro' },
  { slug: 'crystals-kyber',       name: 'CRYSTALS-Kyber',          diff: 'Intermediate', tier: 'pro' },
  { slug: 'bernstein-vazirani',   name: 'Bernstein-Vazirani',      diff: 'Intermediate', tier: 'pro' },
  { slug: 'harvest-now',          name: 'Harvest Now',             diff: 'Intermediate', tier: 'pro' },
  { slug: 'circuit-builder',      name: 'Circuit Builder',         diff: 'Intermediate', tier: 'pro' },
  { slug: 'quantum-risk-auditor', name: 'Risk Auditor',            diff: 'Intermediate', tier: 'pro' },
  { slug: 'shors-algorithm',      name: "Shor's Algorithm",        diff: 'Advanced',     tier: 'research' },
  { slug: 'quantum-teleportation',name: 'Teleportation',           diff: 'Advanced',     tier: 'research' },
  { slug: 'simons-algorithm',     name: "Simon's Algorithm",       diff: 'Advanced',     tier: 'research' },
]

const SECTION_CONFIG = {
  free:     { label: 'Free',     color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  pro:      { label: 'Pro',      color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  research: { label: 'Research', color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)'  },
} as const

interface Props {
  completedDemos: string[]
  hasAccess: (tier: Tier) => boolean
}

export function SkillTree({ completedDemos, hasAccess }: Props) {
  const router = useRouter()
  const completed = new Set(completedDemos)

  const sections = (['free', 'pro', 'research'] as const).map(tier => ({
    ...SECTION_CONFIG[tier],
    tier,
    demos: DEMOS.filter(d => d.tier === tier),
    unlocked: hasAccess(tier),
  }))

  const totalComplete = completedDemos.length
  const totalDemos = DEMOS.length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#e2d9f3' }}>Skill Tree</h2>
        <span style={{ fontSize: 12, color: '#8b7eb8' }}>
          {totalComplete} / {totalDemos} demos complete
        </span>
      </div>

      {/* Progress spine */}
      <div style={{ height: 4, background: '#1a1630', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(totalComplete / totalDemos) * 100}%`,
          background: 'linear-gradient(90deg, #34d399, #a78bfa, #fb923c)',
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* 3-column tree */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {sections.map(section => (
          <div key={section.tier}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8, paddingBottom: 8,
              borderBottom: `1px solid ${section.border}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: section.color, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {section.label}
              </span>
              {!section.unlocked && (
                <span style={{ fontSize: 10, color: '#3a3060' }}>🔒</span>
              )}
            </div>

            {/* Demo nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.demos.map(demo => {
                const done = completed.has(demo.slug)
                const locked = !section.unlocked
                return (
                  <div
                    key={demo.slug}
                    onClick={() => {
                      if (locked) {
                        router.push(`/pricing?upgrade=${section.tier}`)
                      } else {
                        router.push(`/?demo=${demo.slug}`)
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: done ? `1px solid ${section.color}22` : '1px solid #1a1630',
                      background: done ? section.bg : '#0d0b1a',
                      cursor: 'pointer',
                      opacity: locked ? 0.45 : 1,
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor = section.color + '55' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = done ? section.color + '22' : '#1a1630' }}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: done ? section.color : locked ? '#1a1630' : '#2a2450',
                      boxShadow: done ? `0 0 6px ${section.color}` : 'none',
                    }} />
                    <span style={{
                      fontSize: 11, color: done ? '#e2d9f3' : locked ? '#3a3060' : '#8b7eb8',
                      lineHeight: 1.3, flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {demo.name}
                    </span>
                    {done && (
                      <span style={{ fontSize: 9, color: section.color, flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Unlock CTA */}
            {!section.unlocked && (
              <button
                onClick={() => router.push(`/pricing?upgrade=${section.tier}`)}
                style={{
                  marginTop: 10, width: '100%',
                  padding: '7px', borderRadius: 8,
                  background: '#1d1640', border: `1px solid ${section.border}`,
                  color: section.color, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Unlock {section.label} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
