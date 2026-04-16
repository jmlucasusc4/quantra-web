// app/api/og/route.tsx
// Generates a 1200x630 Open Graph image for shareable result cards.
// Usage: /api/og?demo=grovers-search&v1=|101⟩&l1=Target+state&v2=94%25&l2=Success+rate&v3=3+qubits&l3=Register+size&tier=Pro
//
// Deploy on Vercel — @vercel/og is zero-config on their edge runtime.
// Install: npm install @vercel/og

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const TIER_COLORS: Record<string, string> = {
  Free:     '#1e1a4a',
  Pro:      '#4c1d95',
  Research: '#431407',
}
const TIER_TEXT: Record<string, string> = {
  Free:     '#a78bfa',
  Pro:      '#a78bfa',
  Research: '#fb923c',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const demo  = searchParams.get('demo') ?? 'Quantum simulation'
  const tier  = searchParams.get('tier') ?? 'Pro'
  const desc  = searchParams.get('desc') ?? 'Run on Quantra — quantum cybersecurity simulator'
  const date  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Up to 3 stats: v1/l1, v2/l2, v3/l3
  const stats = [1, 2, 3]
    .map(i => ({ value: searchParams.get(`v${i}`), label: searchParams.get(`l${i}`) }))
    .filter(s => s.value && s.label) as { value: string; label: string }[]

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: '#0d0b1a',
          display: 'flex', flexDirection: 'column',
          padding: '60px 64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top border accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#7c3aed' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, background: '#7c3aed', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff', fontWeight: 700,
            }}>Q</div>
            <span style={{ fontSize: 22, fontWeight: 500, color: '#a78bfa' }}>Quantra</span>
          </div>
          <div style={{
            background: TIER_COLORS[tier] ?? '#4c1d95',
            color: TIER_TEXT[tier] ?? '#a78bfa',
            fontSize: 14, fontWeight: 500,
            padding: '6px 16px', borderRadius: 20,
          }}>
            {tier}
          </div>
        </div>

        {/* Demo name */}
        <div style={{ fontSize: 48, fontWeight: 500, color: '#e2d9f3', marginBottom: 12, lineHeight: 1.1 }}>
          {demo}
        </div>

        {/* Description */}
        <div style={{ fontSize: 20, color: '#8b7eb8', marginBottom: 48, lineHeight: 1.4 }}>
          {desc}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 'auto' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, background: '#13102a',
              border: '1px solid #2a2450',
              borderRadius: 12, padding: '20px 24px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 32, fontWeight: 500, color: '#a78bfa', marginBottom: 6 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 14, color: '#8b7eb8' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 24, borderTop: '1px solid #2a2450', marginTop: 32,
        }}>
          <div style={{ fontSize: 16, color: '#8b7eb8' }}>quantra.space</div>
          <div style={{ fontSize: 16, color: '#8b7eb8' }}>{date}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
