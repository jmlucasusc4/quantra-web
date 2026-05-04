'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type QuantumRisk = 'critical' | 'high' | 'medium' | 'low' | 'deprecated'
type KeyType = 'asymmetric' | 'symmetric' | 'hash' | 'protocol'

interface CryptoPattern {
  id: string
  name: string
  patterns: RegExp[]
  keyType: KeyType
  quantumRisk: QuantumRisk
  nistReplacement: string
  priority: 1 | 2 | 3
  description: string
}

interface Finding {
  pattern: CryptoPattern
  occurrences: number
  contexts: string[]
}

// ── Crypto detection patterns ─────────────────────────────────────────────────

const PATTERNS: CryptoPattern[] = [
  // Quantum-critical (Shor's algorithm)
  {
    id: 'rsa', name: 'RSA',
    patterns: [/\bRSA\b/g, /RSA[-_]?\d{3,4}/g, /pkcs[_\s]?1\b/gi, /rs256|rs384|rs512/gi, /rsaEncryption/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-KEM (FIPS 203) for key exchange · ML-DSA (FIPS 204) for signing',
    description: 'Completely broken by Shor\'s algorithm. All key sizes (1024–4096 bit) at risk.',
  },
  {
    id: 'ecdsa', name: 'ECDSA',
    patterns: [/\bECDSA\b/gi, /EC\s*PRIVATE\s*KEY/gi, /es256|es384|es512/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-DSA (FIPS 204) or SLH-DSA (FIPS 205)',
    description: 'Elliptic curve signatures. Broken by Shor\'s algorithm on all named curves.',
  },
  {
    id: 'ecdh', name: 'ECDH / ECDHE',
    patterns: [/\bECDH\b/gi, /\bECDHE\b/gi, /X25519|X448/gi, /elliptic.{0,8}diffie/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-KEM (FIPS 203)',
    description: 'Elliptic curve key exchange. Broken by Shor\'s algorithm.',
  },
  {
    id: 'ecc', name: 'ECC / Named Curves',
    patterns: [/\bECC\b/g, /P-256|P-384|P-521/gi, /secp256r1|secp384r1|secp521r1|prime256v1|secp256k1/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-KEM (FIPS 203) or ML-DSA (FIPS 204)',
    description: 'All named elliptic curves broken by Shor\'s algorithm.',
  },
  {
    id: 'dh', name: 'Diffie-Hellman',
    patterns: [/diffie.{0,5}hellman/gi, /\bDHE\b/g, /\bDH\b(?![\w-])/g, /DHparam/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-KEM (FIPS 203)',
    description: 'Classic DH and DHE key exchange. Broken by Shor\'s algorithm.',
  },
  {
    id: 'dsa', name: 'DSA',
    patterns: [/\bDSA\b(?![-_]SHA)/g, /digital.{0,10}signature.{0,10}alg/gi],
    keyType: 'asymmetric', quantumRisk: 'critical', priority: 1,
    nistReplacement: 'ML-DSA (FIPS 204) or SLH-DSA (FIPS 205)',
    description: 'Digital Signature Algorithm. Broken by Shor\'s algorithm.',
  },
  // Quantum-weakened (Grover's algorithm)
  {
    id: 'aes128', name: 'AES-128',
    patterns: [/AES[-_]?128/gi, /aes_128/gi, /128.bit.aes/gi],
    keyType: 'symmetric', quantumRisk: 'high', priority: 2,
    nistReplacement: 'AES-256 — doubles effective security against Grover\'s attack',
    description: 'Grover\'s algorithm reduces effective security to ~64 bits. Below NIST threshold.',
  },
  {
    id: 'aes256', name: 'AES-256',
    patterns: [/AES[-_]?256/gi, /256.bit.aes/gi],
    keyType: 'symmetric', quantumRisk: 'low', priority: 3,
    nistReplacement: 'No action required — already quantum-safe',
    description: 'Quantum-safe. Grover\'s reduces to ~128 bits effective — within NIST tolerance.',
  },
  {
    id: 'sha256', name: 'SHA-256',
    patterns: [/SHA[-_]?256/gi, /sha256/gi, /\bSHA2\b/gi, /HS256/gi],
    keyType: 'hash', quantumRisk: 'medium', priority: 2,
    nistReplacement: 'SHA-384 or SHA-512 for new systems requiring long-term quantum resistance',
    description: 'Grover\'s reduces collision resistance. Acceptable short-term; upgrade for new builds.',
  },
  {
    id: 'sha384', name: 'SHA-384',
    patterns: [/SHA[-_]?384/gi, /sha384/gi, /HS384/gi],
    keyType: 'hash', quantumRisk: 'low', priority: 3,
    nistReplacement: 'No action required — already quantum-safe',
    description: 'Quantum-safe at current output size.',
  },
  {
    id: 'sha512', name: 'SHA-512',
    patterns: [/SHA[-_]?512/gi, /sha512/gi, /HS512/gi],
    keyType: 'hash', quantumRisk: 'low', priority: 3,
    nistReplacement: 'No action required — already quantum-safe',
    description: 'Quantum-safe at current output size.',
  },
  // Classically deprecated
  {
    id: 'sha1', name: 'SHA-1',
    patterns: [/\bSHA[-_]?1\b(?![-_]?[2-9\d])/gi, /sha1(?!_?\d)/gi, /HS1\b/gi],
    keyType: 'hash', quantumRisk: 'deprecated', priority: 1,
    nistReplacement: 'SHA-256 minimum · SHA-384 preferred',
    description: 'Classically broken (SHAttered, 2017). Retire immediately.',
  },
  {
    id: 'md5', name: 'MD5',
    patterns: [/\bMD5\b/gi, /\bmd5\s*\(/gi],
    keyType: 'hash', quantumRisk: 'deprecated', priority: 1,
    nistReplacement: 'SHA-256 minimum',
    description: 'Classically broken. Do not use for any security purpose.',
  },
  {
    id: 'des', name: 'DES / 3DES',
    patterns: [/\b3DES\b/gi, /\bTripleDES\b/gi, /\bDES\b(?![\w-])/g, /des_ede/gi],
    keyType: 'symmetric', quantumRisk: 'deprecated', priority: 1,
    nistReplacement: 'AES-256-GCM',
    description: 'NIST deprecated 3DES in 2023. Retire immediately.',
  },
  {
    id: 'rc4', name: 'RC4',
    patterns: [/\bRC4\b/gi, /\bArcfour\b/gi, /\bRC_4\b/gi],
    keyType: 'symmetric', quantumRisk: 'deprecated', priority: 1,
    nistReplacement: 'AES-256-GCM or ChaCha20-Poly1305',
    description: 'Classically broken stream cipher. Retire immediately.',
  },
  {
    id: 'tls_old', name: 'TLS 1.0 / 1.1',
    patterns: [/TLS\s*1\.[01]/gi, /TLSv1\.[01]/gi, /SSLv[23]/gi, /PROTOCOL_TLS/gi],
    keyType: 'protocol', quantumRisk: 'deprecated', priority: 1,
    nistReplacement: 'TLS 1.3 with ML-KEM hybrid cipher suites',
    description: 'Classically deprecated. Disabled by RFC 8996. Retire immediately.',
  },
  {
    id: 'tls12', name: 'TLS 1.2',
    patterns: [/TLS\s*1\.2/gi, /TLSv1\.2/gi, /TLS_1_2/gi],
    keyType: 'protocol', quantumRisk: 'medium', priority: 2,
    nistReplacement: 'TLS 1.3 with ML-KEM hybrid key exchange',
    description: 'Acceptable short-term. Migrate to TLS 1.3 with PQC hybrid cipher suites.',
  },
  {
    id: 'chacha20', name: 'ChaCha20-Poly1305',
    patterns: [/ChaCha20/gi, /CHACHA20/gi, /chacha20_poly/gi],
    keyType: 'symmetric', quantumRisk: 'low', priority: 3,
    nistReplacement: 'No action required — already quantum-safe',
    description: '256-bit stream cipher. Quantum-safe at current parameters.',
  },
]

// ── Risk helpers ───────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<QuantumRisk, { label: string; color: string; bg: string; score: number }> = {
  critical:   { label: 'Critical',    color: '#f87171', bg: 'rgba(248,113,113,0.12)', score: -25 },
  high:       { label: 'High',        color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  score: -12 },
  medium:     { label: 'Medium',      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', score: -6  },
  low:        { label: 'Safe',        color: '#34d399', bg: 'rgba(52,211,153,0.10)', score: 0   },
  deprecated: { label: 'Deprecated',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', score: -20 },
}

const KEY_TYPE_LABEL: Record<KeyType, string> = {
  asymmetric: 'Asymmetric',
  symmetric:  'Symmetric',
  hash:       'Hash',
  protocol:   'Protocol',
}

const EXAMPLE_CODE = `# Example: Django app with mixed crypto usage
import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dh
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import ssl

# Generate RSA key pair (2048-bit)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

# ECDSA signing key on P-256
signing_key = ec.generate_private_key(ec.SECP256R1())

# Legacy MD5 checksum (do not use for security!)
file_hash = hashlib.md5(data).hexdigest()

# SHA-256 for HMAC
import hmac
token = hmac.new(secret, msg, hashlib.sha256).hexdigest()

# TLS 1.2 context
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS)
ctx.minimum_version = ssl.TLSVersion.TLSv1_2

# AES-128 encryption
from Crypto.Cipher import AES
cipher = AES.new(key_128, AES.MODE_GCM)

# DH key exchange
parameters = dh.generate_parameters(generator=2, key_size=2048)
`

// ── Scan function ─────────────────────────────────────────────────────────────

function scanCode(input: string): Finding[] {
  const findings: Finding[] = []
  const lines = input.split('\n')

  for (const pat of PATTERNS) {
    let total = 0
    const ctxSet = new Set<string>()

    for (const regex of pat.patterns) {
      regex.lastIndex = 0
      const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        globalRegex.lastIndex = 0
        const matches = line.match(globalRegex)
        if (matches) {
          total += matches.length
          const trimmed = line.trim()
          if (trimmed.length > 0 && ctxSet.size < 3) {
            ctxSet.add(trimmed.slice(0, 80) + (trimmed.length > 80 ? '…' : ''))
          }
        }
      }
    }

    if (total > 0) {
      findings.push({ pattern: pat, occurrences: total, contexts: Array.from(ctxSet) })
    }
  }

  // Sort: deprecated first, then critical, high, medium, low
  const order: QuantumRisk[] = ['deprecated', 'critical', 'high', 'medium', 'low']
  findings.sort((a, b) => order.indexOf(a.pattern.quantumRisk) - order.indexOf(b.pattern.quantumRisk))
  return findings
}

function computeScore(findings: Finding[]): number {
  let score = 100
  for (const f of findings) {
    score += RISK_CONFIG[f.pattern.quantumRisk].score
  }
  return Math.max(0, score)
}

function buildCBOM(findings: Finding[], score: number) {
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: 'Quantra', name: 'CBOM Generator', version: '1.0.0' }],
      properties: [
        { name: 'quantra:quantumReadinessScore', value: String(score) },
        { name: 'quantra:generatedAt', value: new Date().toISOString() },
      ],
    },
    components: findings.map(f => ({
      type: 'cryptographic-asset',
      name: f.pattern.name,
      cryptoProperties: {
        assetType: 'algorithm',
        keyType: f.pattern.keyType,
        quantumRisk: f.pattern.quantumRisk,
        occurrences: f.occurrences,
        nistMigrationPath: f.pattern.nistReplacement,
        migrationPriority: f.pattern.priority,
        description: f.pattern.description,
      },
      evidence: {
        occurrences: f.contexts.map(c => ({ location: c })),
      },
    })),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CBOMGenerator() {
  const [input, setInput] = useState('')
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [score, setScore] = useState(100)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const scan = useCallback(() => {
    if (!input.trim()) return
    const found = scanCode(input)
    setFindings(found)
    setScore(computeScore(found))
  }, [input])

  function loadExample() {
    setInput(EXAMPLE_CODE)
    setFindings(null)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      setInput(e.target?.result as string ?? '')
      setFindings(null)
    }
    reader.readAsText(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function exportJSON() {
    if (!findings) return
    const cbom = buildCBOM(findings, score)
    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'cbom.json'; a.click()
    URL.revokeObjectURL(url)
  }

  async function copyJSON() {
    if (!findings) return
    await navigator.clipboard.writeText(JSON.stringify(buildCBOM(findings, score), null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const critical   = findings?.filter(f => f.pattern.quantumRisk === 'critical').length ?? 0
  const deprecated = findings?.filter(f => f.pattern.quantumRisk === 'deprecated').length ?? 0
  const safe       = findings?.filter(f => f.pattern.quantumRisk === 'low').length ?? 0

  const scoreColor = score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#e2d9f3' }}>

      {/* Input area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragging ? '#7c3aed' : '#2a2450'}`,
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 12,
          background: dragging ? 'rgba(124,58,237,0.06)' : '#0d0b1a',
          transition: 'border-color .15s, background .15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#6b5e8c', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Paste source code · config files · TLS settings
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={loadExample}
              style={{ fontSize: 11, color: '#7c3aed', background: 'none', border: '1px solid #2a2450', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              Load example
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: 11, color: '#6b5e8c', background: 'none', border: '1px solid #2a2450', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              Upload file
            </button>
            <input ref={fileRef} type="file" style={{ display: 'none' }}
              accept=".py,.js,.ts,.java,.go,.rs,.rb,.cs,.cpp,.c,.h,.yaml,.yml,.json,.xml,.env,.conf,.cfg,.ini,.toml,.tf"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setFindings(null) }}
          placeholder="Paste your code here, or drag & drop a file…"
          rows={10}
          style={{
            width: '100%', resize: 'vertical',
            background: 'transparent', border: 'none', outline: 'none',
            color: '#e2d9f3', fontSize: 12, fontFamily: 'ui-monospace, monospace',
            lineHeight: 1.6,
          }}
        />
        {dragging && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7c3aed', paddingTop: 8 }}>
            Drop file to scan
          </div>
        )}
      </div>

      <button
        onClick={scan}
        disabled={!input.trim()}
        style={{
          width: '100%', padding: '11px',
          background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#1a1630',
          border: 'none', borderRadius: 10,
          color: input.trim() ? '#fff' : '#3a3060',
          fontSize: 13, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'default',
          marginBottom: 20, transition: 'background .15s',
        }}
      >
        Generate CBOM →
      </button>

      {/* Results */}
      {findings !== null && (
        <>
          {/* Score bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16,
          }}>
            {[
              { label: 'Readiness Score', value: score, unit: '/ 100', color: scoreColor },
              { label: 'Critical / Deprecated', value: critical + deprecated, unit: 'algorithms', color: '#f87171' },
              { label: 'Algorithms Detected', value: findings.length, unit: 'total', color: '#a78bfa' },
              { label: 'Already Safe', value: safe, unit: 'algorithms', color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#6b5e8c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#3a3060', marginTop: 2 }}>{s.unit}</div>
              </div>
            ))}
          </div>

          {/* Score bar visual */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 6, background: '#1a1630', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${score}%`,
                background: `linear-gradient(90deg, #f87171, #fbbf24, #34d399)`,
                backgroundSize: '200% 100%',
                backgroundPosition: `${100 - score}% 0`,
                borderRadius: 3, transition: 'width .6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#3a3060', marginTop: 4 }}>
              <span>0 — Critical risk</span>
              <span>100 — Quantum-ready</span>
            </div>
          </div>

          {findings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#34d399', fontSize: 14 }}>
              No known cryptographic patterns detected. Paste code to scan.
            </div>
          ) : (
            <>
              {/* CBOM table */}
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2450' }}>
                      {['Algorithm', 'Type', 'Quantum Risk', 'Found', 'NIST Migration Path', 'Priority'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 9, color: '#6b5e8c', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {findings.map((f, i) => {
                      const risk = RISK_CONFIG[f.pattern.quantumRisk]
                      return (
                        <tr key={f.pattern.id} style={{ borderBottom: '1px solid #1a1630', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '10px 10px', fontWeight: 600, color: '#f0ebff', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                            {f.pattern.name}
                          </td>
                          <td style={{ padding: '10px 10px', color: '#8b7eb8', fontSize: 11 }}>
                            {KEY_TYPE_LABEL[f.pattern.keyType]}
                          </td>
                          <td style={{ padding: '10px 10px' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              color: risk.color, background: risk.bg,
                              border: `1px solid ${risk.color}30`,
                              padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                            }}>
                              {risk.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 10px', color: '#a78bfa', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                            {f.occurrences}×
                          </td>
                          <td style={{ padding: '10px 10px', color: '#6b5e8c', fontSize: 11, maxWidth: 280 }}>
                            {f.pattern.nistReplacement}
                          </td>
                          <td style={{ padding: '10px 10px' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              color: f.pattern.priority === 1 ? '#f87171' : f.pattern.priority === 2 ? '#fbbf24' : '#34d399',
                            }}>
                              P{f.pattern.priority}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Context snippets for critical/deprecated */}
              {findings.filter(f => ['critical','deprecated'].includes(f.pattern.quantumRisk) && f.contexts.length > 0).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#6b5e8c', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, fontWeight: 600 }}>
                    Detected In Code
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {findings
                      .filter(f => ['critical','deprecated'].includes(f.pattern.quantumRisk) && f.contexts.length > 0)
                      .slice(0, 5)
                      .map(f => (
                        <div key={f.pattern.id} style={{ background: '#0d0b1a', border: '1px solid #2a2450', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: RISK_CONFIG[f.pattern.quantumRisk].color, marginBottom: 6, fontFamily: 'ui-monospace, monospace' }}>
                            {f.pattern.name}
                          </div>
                          {f.contexts.map((ctx, i) => (
                            <div key={i} style={{ fontSize: 11, color: '#8b7eb8', fontFamily: 'ui-monospace, monospace', lineHeight: 1.5, borderLeft: '2px solid #2a2450', paddingLeft: 8, marginBottom: 2 }}>
                              {ctx}
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Export actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={exportJSON}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    border: 'none', borderRadius: 9, color: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ↓ Export CBOM (CycloneDX JSON)
                </button>
                <button
                  onClick={copyJSON}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent', border: '1px solid #2a2450',
                    borderRadius: 9, color: copied ? '#34d399' : '#8b7eb8',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
