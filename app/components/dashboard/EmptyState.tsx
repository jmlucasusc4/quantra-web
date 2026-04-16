// components/dashboard/EmptyState.tsx
// Drop this into your dashboard page — renders when completedDemos.length === 0
'use client'

import { useRouter } from 'next/navigation'

const FIRST_DEMOS = [
  { slug: 'superposition', name: 'Superposition demo', diff: 'Beginner', desc: 'Start here — explore a qubit in equal superposition.' },
  { slug: 'entanglement', name: 'Entanglement demo', diff: 'Beginner', desc: 'See two qubits become quantum-correlated.' },
  { slug: 'bloch-sphere', name: 'Bloch sphere', diff: 'Beginner', desc: 'Drag sliders to explore the full single-qubit state space.' },
]

export function EmptyDashboardState() {
  const router = useRouter()

  return (
    <div style={{
      background: '#110e24',
      border: '1px solid #2a2450',
      borderRadius: 16,
      padding: '40px 32px',
      textAlign: 'center',
      marginBottom: 20,
    }}>
      {/* Atom icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#4c1d95',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: 28,
      }}>
        ⚛
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#a78bfa', marginBottom: 8 }}>
        Welcome to Quantra
      </h2>
      <p style={{ fontSize: 14, color: '#8b7eb8', marginBottom: 32, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 32px' }}>
        Run your first quantum simulation to start building your readiness score.
        Each demo takes under 2 minutes.
      </p>

      {/* Suggested demos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {FIRST_DEMOS.map(demo => (
          <button
            key={demo.slug}
            onClick={() => router.push(`/?demo=${demo.slug}`)}
            style={{
              background: '#0d0b1a',
              border: '1px solid #2a2450',
              borderRadius: 12,
              padding: '16px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2450')}
          >
            <div style={{
              fontSize: 10, fontWeight: 500,
              background: '#064e3b', color: '#34d399',
              padding: '2px 8px', borderRadius: 20,
              display: 'inline-block', marginBottom: 8,
            }}>
              {demo.diff}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2d9f3', marginBottom: 4 }}>
              {demo.name}
            </div>
            <div style={{ fontSize: 11, color: '#8b7eb8', lineHeight: 1.4 }}>
              {demo.desc}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push('/?demo=superposition')}
        style={{
          background: '#7c3aed', border: 'none',
          color: '#fff', padding: '12px 28px',
          borderRadius: 9, fontSize: 14, fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Start with Superposition →
      </button>

      {/* Progress hint */}
      <p style={{ fontSize: 12, color: '#3a3060', marginTop: 20 }}>
        Complete all 15 demos to earn your Quantum Pro certificate
      </p>
    </div>
  )
}

// Usage in your dashboard page:
// import { EmptyDashboardState } from '@/components/dashboard/EmptyState'
//
// const { completedDemos } = useProgress()
//
// {completedDemos.length === 0 ? (
//   <EmptyDashboardState />
// ) : (
//   <YourExistingDashboardContent />
// )}
