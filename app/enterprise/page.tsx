'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'

const PAIN_POINTS = [
  {
    icon: '⏱',
    title: '2027 NSS compliance deadline',
    desc: 'US National Security Systems must begin PQC migration. Your security team needs to understand the threat landscape before your migration plan is finalized.',
  },
  {
    icon: '🔐',
    title: 'RSA and ECC are end-of-life',
    desc: 'NIST has set a hard prohibition date of 2035. Organizations that start training in 2026 have time. Organizations that wait until 2030 do not.',
  },
  {
    icon: '🏢',
    title: 'Generic training doesn\'t cut it',
    desc: 'One-day compliance overviews leave your team with vocabulary, not capability. Quantra builds hands-on intuition through interactive simulations — no physics PhD required.',
  },
]

const TRACKS = [
  {
    role: 'CISOs & Security Leadership',
    color: '#f87171',
    time: '~45 min',
    outcomes: [
      'Communicate quantum risk to the board without technical jargon',
      'Assess organizational cryptographic exposure',
      'Build the business case for PQC migration budget',
    ],
    standards: ['NIST IR 8547', 'CISA PQC'],
  },
  {
    role: 'Security Architects',
    color: '#fbbf24',
    time: '~90 min',
    outcomes: [
      'Map cryptographic inventory to NIST vulnerability categories',
      'Evaluate algorithm replacement paths (RSA → ML-KEM, ECDSA → ML-DSA)',
      'Prioritize migration by threat timeline and system criticality',
    ],
    standards: ['FIPS 203', 'FIPS 204', 'NIST SP 800-57'],
  },
  {
    role: 'Cryptography Engineers',
    color: '#a78bfa',
    time: '~2.5 hrs',
    outcomes: [
      'Understand exactly how Shor\'s and Grover\'s algorithms break classical crypto',
      'Implement and evaluate CRYSTALS-Kyber key encapsulation',
      'Read and write quantum circuits for cryptographic primitives',
    ],
    standards: ['FIPS 203', 'FIPS 204', 'FIPS 205'],
  },
]

const DIFFERENTIATORS = [
  {
    title: 'Vendor-neutral',
    desc: 'No IBM cloud. No Google hardware lock-in. Pure cryptographic fundamentals that apply to any stack.',
  },
  {
    title: 'Browser-based simulations',
    desc: 'Zero setup. Runs in any browser. No Jupyter, no Python environment, no IT ticket required.',
  },
  {
    title: 'NIST-mapped curriculum',
    desc: 'Every demo maps to a specific FIPS standard or NIST publication. Your team learns what the standard actually requires.',
  },
  {
    title: 'Verifiable credentials',
    desc: 'Completion certificates include a public verification URL and NIST standards alignment — suitable for compliance documentation.',
  },
]

const SECTORS = [
  'Financial Services', 'Defense & Government', 'Healthcare', 'Critical Infrastructure', 'Technology', 'Legal & Professional Services',
]

const INPUT_STYLE = { background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 8, color: '#e2d9f3', padding: '11px 14px', fontSize: 13, outline: 'none', width: '100%' } as const

function ContactForm() {
  const [status, setStatus]   = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg]   = useState('')
  const formRef               = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      fd.get('name'),
          email:     fd.get('email'),
          org:       fd.get('org'),
          team_size: fd.get('team_size'),
          message:   fd.get('message'),
        }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (data.ok) { setStatus('done'); formRef.current?.reset() }
      else { setErrMsg(data.error ?? 'Something went wrong.'); setStatus('error') }
    } catch {
      setErrMsg('Network error — please try again.'); setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>Message received</div>
        <p style={{ fontSize: 14, color: '#8b7eb8', lineHeight: 1.7 }}>
          We&apos;ll follow up within one business day to discuss your team&apos;s requirements.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Name" name="name" required style={INPUT_STYLE} />
        <input placeholder="Work email" name="email" type="email" required style={INPUT_STYLE} />
      </div>
      <input placeholder="Organization" name="org" style={INPUT_STYLE} />
      <select name="team_size" style={{ ...INPUT_STYLE, color: '#8b7eb8' }}>
        <option value="">Team size</option>
        <option>1–10</option>
        <option>11–50</option>
        <option>51–200</option>
        <option>200+</option>
      </select>
      <textarea
        placeholder="What are you trying to accomplish? (e.g. PQC migration training, compliance prep, team upskilling)"
        name="message" rows={4}
        style={{ ...INPUT_STYLE, resize: 'vertical' }}
      />
      {status === 'error' && <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center' }}>{errMsg}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', color: '#fff', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: status === 'sending' ? 'default' : 'pointer', opacity: status === 'sending' ? 0.7 : 1 }}
      >
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  )
}

export default function EnterprisePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07050f', fontFamily: 'system-ui, sans-serif', color: '#e2d9f3' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1630', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(7,5,15,0.92)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/quantra-mark.png" alt="Quantra" width={40} height={30} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f0ebff' }}>Quantra</span>
        </Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/paths"    style={{ fontSize: 12, color: '#6b5e8c', textDecoration: 'none' }}>Paths</Link>
          <Link href="/standards" style={{ fontSize: 12, color: '#6b5e8c', textDecoration: 'none' }}>Standards</Link>
          <a href="#contact" style={{ fontSize: 12, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', padding: '7px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            Contact Sales
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: '#d4af6a', marginBottom: 16, fontWeight: 600 }}>
          Enterprise &amp; Team Training
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#f0ebff', lineHeight: 1.15, marginBottom: 20, maxWidth: 640, margin: '0 auto 20px' }}>
          Quantum Security Readiness for Your Entire Security Team
        </h1>
        <p style={{ fontSize: 16, color: '#8b7eb8', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 36px' }}>
          Vendor-neutral, NIST-mapped training for CISOs, security architects, and cryptography engineers.
          Built for organizations that need to act on PQC migration — not just understand it.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#contact" style={{ fontSize: 14, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', padding: '13px 30px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
            Talk to Us →
          </a>
          <Link href="/paths" style={{ fontSize: 14, color: '#a78bfa', background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.25)', padding: '13px 30px', borderRadius: 10, textDecoration: 'none', fontWeight: 500 }}>
            View Learning Paths
          </Link>
        </div>
      </section>

      {/* Urgency */}
      <section style={{ background: '#0a0818', borderTop: '1px solid #1a1630', borderBottom: '1px solid #1a1630', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#f87171', marginBottom: 24, fontWeight: 600, textAlign: 'center' }}>
            The Window Is Closing
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {PAIN_POINTS.map(p => (
              <div key={p.title} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 14, padding: '24px 22px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebff', marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#6b5e8c', lineHeight: 1.65 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based tracks */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#d4af6a', marginBottom: 10, fontWeight: 600 }}>
            Role-Based Curriculum
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebff', marginBottom: 12 }}>
            Right-Sized for Every Role on Your Team
          </h2>
          <p style={{ fontSize: 14, color: '#8b7eb8', maxWidth: 480, margin: '0 auto' }}>
            Three structured paths, each mapped to NIST standards and calibrated to what each role actually needs to do their job.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TRACKS.map(track => (
            <div key={track.role} style={{ background: '#0d0b1a', border: `1px solid #2a2450`, borderLeft: `3px solid ${track.color}`, borderRadius: 16, padding: '28px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: track.color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {track.role}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {track.outcomes.map(o => (
                      <li key={o} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8b7eb8', lineHeight: 1.5 }}>
                        <span style={{ color: track.color, flexShrink: 0, marginTop: 1 }}>→</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#4a3e6c', marginBottom: 8 }}>{track.time}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {track.standards.map(s => (
                      <span key={s} style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#d4af6a', background: '#1a1630', border: '1px solid #2a2450', padding: '2px 8px', borderRadius: 4 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section style={{ background: '#0a0818', borderTop: '1px solid #1a1630', borderBottom: '1px solid #1a1630', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebff', marginBottom: 12 }}>
              Why Quantra, Not IBM or Tonex?
            </h2>
            <p style={{ fontSize: 14, color: '#8b7eb8', maxWidth: 440, margin: '0 auto' }}>
              IBM trains quantum hardware customers. Tonex delivers one-day compliance checkboxes. Quantra builds operational understanding.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {DIFFERENTIATORS.map(d => (
              <div key={d.title} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 8 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: '#6b5e8c', lineHeight: 1.65 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target sectors */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b5e8c', marginBottom: 20, fontWeight: 600 }}>
          Priority Sectors
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {SECTORS.map(s => (
            <span key={s} style={{ fontSize: 12, color: '#a89bc2', background: '#0d0b1a', border: '1px solid #2a2450', padding: '6px 16px', borderRadius: 99 }}>
              {s}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#4a3e6c' }}>Compliance pressure is highest in financial services and defense — where training budgets are largest.</p>
      </section>

      {/* Contact form */}
      <section id="contact" style={{ background: '#0a0818', borderTop: '1px solid #1a1630', padding: '64px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#d4af6a', marginBottom: 12, fontWeight: 600 }}>
            Get Started
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f0ebff', marginBottom: 12 }}>
            Talk to Us About Enterprise
          </h2>
          <p style={{ fontSize: 14, color: '#8b7eb8', marginBottom: 36, lineHeight: 1.7 }}>
            We work with security teams to build custom paths mapped to your cryptographic inventory and compliance requirements.
            Reach out to discuss pilots, team licensing, and NICCS listing.
          </p>

          <ContactForm />
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 11, color: '#2a2040', borderTop: '1px solid #0f0d1e' }}>
        Quantra — vendor-neutral quantum security training · quantra.space
      </footer>
    </div>
  )
}
