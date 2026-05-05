// components/sidebar/DemoSidebar.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useProgress } from '@/hooks/useProgress'

interface Demo {
  slug: string
  name: string
  diff: 'Beginner' | 'Intermediate' | 'Advanced'
  tier: 'free' | 'pro' | 'research'
}

const DEMOS: Demo[] = [
  { slug: 'superposition',        name: 'Superposition demo',        diff: 'Beginner',     tier: 'free' },
  { slug: 'entanglement',          name: 'Entanglement demo',          diff: 'Beginner',     tier: 'free' },
  { slug: 'entangled-bloch-spheres', name: 'Entangled Bloch spheres', diff: 'Beginner',     tier: 'free' },
  { slug: 'bloch-sphere',          name: 'Bloch sphere',              diff: 'Beginner',     tier: 'free' },
  { slug: 'deutsch-jozsa',        name: 'Deutsch-Jozsa',              diff: 'Beginner',     tier: 'free' },
  { slug: 'qrng',                 name: 'Quantum Random N.',          diff: 'Beginner',     tier: 'free' },
  { slug: 'password-analyzer',   name: 'Quantum password analyzer',  diff: 'Beginner',     tier: 'free' },
  { slug: 'classical-vs-quantum', name: 'Classical vs quantum',       diff: 'Beginner',     tier: 'free' },
  { slug: 'grovers-search',       name: "Grover's search",            diff: 'Intermediate', tier: 'pro' },
  { slug: 'bb84-protocol',        name: 'BB84 protocol (QKD)',        diff: 'Intermediate', tier: 'pro' },
  { slug: 'crystals-kyber',       name: 'CRYSTALS-Kyber',             diff: 'Intermediate', tier: 'pro' },
  { slug: 'bernstein-vazirani',   name: 'Bernstein-Vazirani',         diff: 'Intermediate', tier: 'pro' },
  { slug: 'harvest-now',          name: 'Harvest now, decrypt later', diff: 'Intermediate', tier: 'pro' },
  { slug: 'circuit-builder',      name: 'Quantum circuit builder',    diff: 'Intermediate', tier: 'pro' },
  { slug: 'quantum-risk-auditor', name: 'Quantum risk auditor',       diff: 'Intermediate', tier: 'pro' },
  { slug: 'cbom-generator',       name: 'CBOM generator',             diff: 'Intermediate', tier: 'pro' },
  { slug: 'pqc-switch',           name: 'PQC switch: RSA vs ML-KEM',  diff: 'Intermediate', tier: 'pro' },
  { slug: 'shors-algorithm',      name: "Shor's algorithm + RSA",     diff: 'Advanced',     tier: 'research' },
  { slug: 'quantum-teleportation',name: 'Quantum teleportation',      diff: 'Advanced',     tier: 'research' },
  { slug: 'simons-algorithm',     name: "Simon's algorithm",          diff: 'Advanced',     tier: 'research' },
]

const DIFF_STYLES: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: '#064e3b', color: '#34d399' },
  Intermediate: { bg: '#1e1a4a', color: '#a78bfa' },
  Advanced:     { bg: '#451a03', color: '#fb923c' },
}

interface DemoSidebarProps {
  /** When provided, overrides URL-based active detection */
  activeSlug?: string
  /** When provided, called instead of router.push on unlocked demos */
  onSelect?: (slug: string) => void
}

export function DemoSidebar({ activeSlug, onSelect }: DemoSidebarProps = {}) {
  const router   = useRouter()
  const pathname = usePathname()
  const { tier, hasAccess } = useSubscription()
  const { isComplete } = useProgress()
  const [search, setSearch] = useState('')

  const currentSlug = activeSlug ?? pathname?.split('/demo/')?.[1] ?? ''

  const filtered      = DEMOS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
  const freeDemos     = filtered.filter(d => d.tier === 'free')
  const proDemos      = filtered.filter(d => d.tier === 'pro')
  const researchDemos = filtered.filter(d => d.tier === 'research')

  function handleClick(demo: Demo) {
    if (hasAccess(demo.tier as any)) {
      if (onSelect) {
        onSelect(demo.slug)
      } else {
        router.push(`/demo/${demo.slug}`)
      }
    } else {
      router.push(`/pricing?locked=${demo.slug}&upgrade=${demo.tier}`)
    }
  }

  return (
    <div style={{
      width: 240, background: '#0d0b1a',
      border: '1px solid #2a2450', borderRadius: 14,
      padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search demos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          background: '#110e24', border: '1px solid #2a2450',
          borderRadius: 8, color: '#e2d9f3', padding: '7px 10px',
          fontSize: 12, marginBottom: 8, width: '100%',
        }}
      />

      {/* FREE section */}
      <SectionLabel label="Free" />
      {freeDemos.map(demo => (
        <DemoItem
          key={demo.slug} demo={demo}
          active={currentSlug === demo.slug}
          complete={isComplete(demo.slug)}
          locked={false}
          onClick={() => handleClick(demo)}
        />
      ))}

      {/* PRO section */}
      <SectionDivider
        label="Pro"
        color="#a78bfa"
        locked={!hasAccess('pro')}
        onUpgrade={() => router.push('/pricing?upgrade=pro')}
      />
      {proDemos.map(demo => (
        <DemoItem
          key={demo.slug} demo={demo}
          active={currentSlug === demo.slug}
          complete={isComplete(demo.slug)}
          locked={!hasAccess('pro')}
          onClick={() => handleClick(demo)}
        />
      ))}

      {/* RESEARCH section */}
      <SectionDivider
        label="Research"
        color="#fb923c"
        locked={!hasAccess('research')}
        onUpgrade={() => router.push('/pricing?upgrade=research')}
      />
      {researchDemos.map(demo => (
        <DemoItem
          key={demo.slug} demo={demo}
          active={currentSlug === demo.slug}
          complete={isComplete(demo.slug)}
          locked={!hasAccess('research')}
          onClick={() => handleClick(demo)}
        />
      ))}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10, color: '#3a3060', textTransform: 'uppercase',
      letterSpacing: '.08em', padding: '6px 4px 2px',
    }}>
      {label}
    </div>
  )
}

function SectionDivider({
  label, color, locked, onUpgrade,
}: {
  label: string; color: string; locked: boolean; onUpgrade: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 4px 4px', marginTop: 4,
      borderTop: '1px solid #1a1630',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>
          {label}
        </span>
        {locked && <span style={{ fontSize: 12 }}>🔒</span>}
      </div>
      {locked && (
        <button
          onClick={onUpgrade}
          style={{
            background: '#1d1640', border: '1px solid #2a2450',
            color, fontSize: 10, padding: '2px 8px',
            borderRadius: 20, cursor: 'pointer',
          }}
        >
          Unlock
        </button>
      )}
    </div>
  )
}

function DemoItem({
  demo, active, complete, locked, onClick,
}: {
  demo: Demo; active: boolean; complete: boolean; locked: boolean; onClick: () => void
}) {
  const ds = DIFF_STYLES[demo.diff]
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 9,
        cursor: locked ? 'not-allowed' : 'pointer',
        background: active ? '#1d1640' : 'transparent',
        border: active ? '1px solid #7c3aed' : '1px solid transparent',
        opacity: locked ? 0.55 : 1,
        transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!locked && !active) e.currentTarget.style.background = '#110e24' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Completion dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: complete ? '#10b981' : '#1a1630',
        border: complete ? 'none' : '1px solid #2a2450',
      }} />

      <span style={{ fontSize: 12, color: locked ? '#3a3060' : '#c4b8e8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {demo.name}
      </span>

      {locked
        ? <span style={{ fontSize: 10, color: '#3a3060' }}>🔒</span>
        : <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: ds.bg, color: ds.color, flexShrink: 0 }}>
            {demo.diff.slice(0, 3)}
          </span>
      }
    </div>
  )
}
