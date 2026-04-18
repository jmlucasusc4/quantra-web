'use client'
import { useState, useEffect } from 'react'

interface Props {
  totalSimsRun: number
  totalKeysGenerated: number
  completedCount: number
}

interface Metric {
  label: string
  unit: string
  value: number
  min: number
  max: number
  color: string
  decimals: number
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function TelemetryWidget({ totalSimsRun, totalKeysGenerated, completedCount }: Props) {
  const baseFidelity = Math.min(99.9, 94 + completedCount * 0.25)
  const baseEntropy  = Math.min(9999, Math.max(100, totalKeysGenerated * 0.8 + totalSimsRun * 12))
  const baseVolume   = Math.min(512, Math.max(1, completedCount * 4))

  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Gate Fidelity',      unit: '%',    value: baseFidelity, min: baseFidelity - 1.5, max: baseFidelity + 0.1,  color: '#34d399', decimals: 2 },
    { label: 'Entropy Rate',       unit: ' b/s', value: baseEntropy,  min: baseEntropy  * 0.9, max: baseEntropy  * 1.1,  color: '#a78bfa', decimals: 0 },
    { label: 'Quantum Volume',     unit: '',     value: baseVolume,   min: baseVolume   * 0.95,max: baseVolume   * 1.05, color: '#38bdf8', decimals: 0 },
  ])

  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: parseFloat(lerp(m.value, randBetween(m.min, m.max), 0.35).toFixed(m.decimals)),
      })))
      setTick(t => t + 1)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      background: '#0d0b1a',
      border: '1px solid #2a2450',
      borderRadius: 16,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background pulse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px #34d399',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#e2d9f3' }}>Live Telemetry</span>
        </div>
        <span style={{ fontSize: 10, color: '#3a3060', fontFamily: 'monospace' }}>
          SIMULATED · TICK {String(tick).padStart(4, '0')}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {metrics.map(m => {
          const pct = ((m.value - m.min) / (m.max - m.min)) * 100
          return (
            <div key={m.label}>
              <div style={{ fontSize: 10, color: '#8b7eb8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color, fontFamily: 'monospace', marginBottom: 8, letterSpacing: '-0.5px' }}>
                {m.decimals > 0 ? m.value.toFixed(m.decimals) : Math.round(m.value).toLocaleString()}
                <span style={{ fontSize: 11, fontWeight: 400, color: '#8b7eb8', marginLeft: 2 }}>{m.unit}</span>
              </div>
              {/* Mini sparkline bar */}
              <div style={{ height: 3, background: '#1a1630', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(5, Math.min(100, pct))}%`,
                  background: m.color,
                  borderRadius: 2,
                  transition: 'width 1.6s ease',
                  boxShadow: `0 0 6px ${m.color}`,
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
