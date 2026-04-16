'use client'
// components/onboarding/OnboardingModal.tsx
// Shows once on first login — stored in localStorage so it never repeats.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'

const STEPS = [
  {
    title: 'Welcome to Quantra',
    subtitle: 'Quantum security, made interactive',
    body: 'Quantra lets you run real quantum algorithm simulations in your browser — no physics degree required. Every demo connects quantum computing directly to cybersecurity.',
    cta: 'Get started',
    visual: '⚛',
  },
  {
    title: 'Pick your level',
    subtitle: 'Start anywhere, grow fast',
    body: 'Beginner demos take under 2 minutes and need no prior knowledge. Intermediate and Advanced demos unlock as your readiness score grows.',
    cta: 'Got it',
    visual: '📈',
    levels: [
      { label: 'Beginner', color: '#34d399', bg: '#064e3b', desc: 'Superposition, Bloch sphere, Entanglement' },
      { label: 'Intermediate', color: '#a78bfa', bg: '#1e1a4a', desc: "Grover's search, BB84, CRYSTALS-Kyber" },
      { label: 'Advanced', color: '#fb923c', bg: '#451a03', desc: "Shor's algorithm, Teleportation, Simon's" },
    ],
  },
  {
    title: 'Build your readiness score',
    subtitle: 'Track your quantum security posture',
    body: 'Every simulation you run contributes to your Quantum Readiness Score — a measure of how prepared you are for the post-quantum cryptography transition.',
    cta: 'Run my first demo →',
    visual: '🛡',
    score: true,
  },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const router = useRouter()
  const { completedDemos } = useProgress()

  useEffect(() => {
    const seen = localStorage.getItem('quantra_onboarded')
    if (!seen && completedDemos.length === 0) {
      setOpen(true)
    }
  }, [completedDemos])

  function handleCTA() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  function finish() {
    localStorage.setItem('quantra_onboarded', '1')
    setOpen(false)
    router.push('/?demo=superposition')
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <div className="onboarding-modal" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(6, 4, 14, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#13102a',
        border: '1px solid #2a2450',
        borderRadius: 20,
        padding: '40px 36px',
        maxWidth: 480, width: '100%',
        position: 'relative',
      }}>
        {/* Skip */}
        <button
          onClick={finish}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            color: '#3a3060', fontSize: 12, cursor: 'pointer',
          }}
        >
          Skip
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 8, height: 8,
              borderRadius: 4, transition: 'width .3s',
              background: i === step ? '#7c3aed' : '#2a2450',
            }} />
          ))}
        </div>

        {/* Visual */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#4c1d95',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 32,
        }}>
          {current.visual}
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#8b7eb8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
            {current.subtitle}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: '#a78bfa', marginBottom: 12 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: 14, color: '#8b7eb8', lineHeight: 1.7 }}>
            {current.body}
          </p>
        </div>

        {/* Step 2 — difficulty levels */}
        {current.levels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {current.levels.map(l => (
              <div key={l.label} style={{
                background: '#0d0b1a', border: '1px solid #1a1630',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: l.bg, color: l.color,
                  padding: '3px 10px', borderRadius: 20, flexShrink: 0,
                }}>
                  {l.label}
                </span>
                <span style={{ fontSize: 12, color: '#8b7eb8' }}>{l.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 3 — readiness score preview */}
        {current.score && (
          <div style={{
            background: '#0d0b1a', border: '1px solid #1a1630',
            borderRadius: 12, padding: '16px 18px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 500, color: '#7c3aed' }}>0</div>
              <div>
                <div style={{ fontSize: 13, color: '#e2d9f3', fontWeight: 500 }}>Novice</div>
                <div style={{ fontSize: 11, color: '#8b7eb8' }}>Run your first demo to start scoring</div>
              </div>
            </div>
            {['Algorithms', 'Cryptography', 'Risk awareness', 'Post-quantum'].map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8b7eb8', minWidth: 110 }}>{cat}</span>
                <div style={{ flex: 1, height: 4, background: '#1a1630', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: '0%', background: '#7c3aed', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: '#3a3060' }}>0%</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCTA}
          style={{
            width: '100%', padding: '13px',
            background: '#7c3aed', border: 'none',
            color: '#fff', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          {current.cta}
        </button>
      </div>
    </div>
  )
}
