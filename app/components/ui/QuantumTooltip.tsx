'use client'
// components/ui/QuantumTooltip.tsx
// Wrap any quantum term in <QuantumTooltip term="qubit"> to show
// a plain-English definition on hover.

import { useState, useRef, useEffect } from 'react'

const GLOSSARY: Record<string, { short: string; plain: string }> = {
  qubit: {
    short: 'Quantum bit',
    plain: 'The quantum equivalent of a classical bit. Unlike a regular bit (0 or 1), a qubit can exist in superposition — a mix of both — until measured.',
  },
  superposition: {
    short: 'Being in multiple states at once',
    plain: "A qubit in superposition is simultaneously 0 and 1. When you measure it, it randomly collapses to one value. This is what gives quantum computers their parallelism.",
  },
  entanglement: {
    short: 'Quantum correlation between qubits',
    plain: "Two entangled qubits are linked — measuring one instantly determines the other's state, no matter how far apart they are. Einstein called it 'spooky action at a distance'.",
  },
  hadamard: {
    short: 'H gate — creates superposition',
    plain: "The Hadamard gate puts a qubit into equal superposition (50/50 chance of 0 or 1). It's the most common first step in quantum algorithms.",
  },
  'hadamard gate': {
    short: 'H gate — creates superposition',
    plain: "The Hadamard gate puts a qubit into equal superposition (50/50 chance of 0 or 1). It's the most common first step in quantum algorithms.",
  },
  decoherence: {
    short: 'Quantum state breaking down',
    plain: 'Qubits are fragile. Interaction with the environment causes them to lose their quantum properties and behave classically. This is why quantum computers need extreme cooling.',
  },
  'bloch sphere': {
    short: '3D model of a qubit state',
    plain: 'A geometric representation of all possible single-qubit states. The north pole is |0⟩, south pole is |1⟩, and every other point is a superposition.',
  },
  oracle: {
    short: 'Black-box function in quantum algorithms',
    plain: "A subroutine that marks the solution to a search problem. The quantum algorithm doesn't need to know how it works — just that it can identify the answer.",
  },
  amplitude: {
    short: 'Probability weight of a quantum state',
    plain: "The square of a state's amplitude gives its probability of being measured. Quantum algorithms manipulate amplitudes to make correct answers more likely.",
  },
  interference: {
    short: 'Amplitudes adding or cancelling',
    plain: 'Like waves, quantum amplitudes can constructively interfere (add up) or destructively interfere (cancel). Algorithms use this to amplify correct answers and suppress wrong ones.',
  },
  "shor's algorithm": {
    short: 'Quantum integer factoring',
    plain: "A quantum algorithm that factors large integers exponentially faster than any known classical algorithm. It would break RSA encryption if run on a sufficiently large quantum computer.",
  },
  "grover's algorithm": {
    short: 'Quantum search speedup',
    plain: 'Searches an unsorted database of N items in O(√N) steps instead of O(N). This gives a quadratic speedup — halving the effective bit-security of symmetric encryption like AES.',
  },
  rsa: {
    short: 'Public-key encryption standard',
    plain: "A widely used encryption system based on the difficulty of factoring large numbers. Vulnerable to Shor's algorithm on a sufficiently powerful quantum computer.",
  },
  ecc: {
    short: 'Elliptic curve cryptography',
    plain: "A form of public-key cryptography based on elliptic curves. More efficient than RSA but also vulnerable to quantum attacks via a variant of Shor's algorithm.",
  },
  'post-quantum cryptography': {
    short: 'Encryption resistant to quantum attacks',
    plain: 'Cryptographic algorithms designed to be secure against both classical and quantum computers. NIST standardized CRYSTALS-Kyber and CRYSTALS-Dilithium in 2024.',
  },
  'crystals-kyber': {
    short: 'NIST post-quantum KEM',
    plain: 'A key encapsulation mechanism standardized by NIST. Based on the hardness of the Module Learning With Errors (MLWE) problem, which quantum computers cannot solve efficiently.',
  },
  qkd: {
    short: 'Quantum Key Distribution',
    plain: 'A method of securely sharing encryption keys using quantum mechanics. Any eavesdropping attempt disturbs the quantum states and is detectable. BB84 is the most well-known protocol.',
  },
  bb84: {
    short: 'First QKD protocol (1984)',
    plain: 'The first quantum key distribution protocol, invented by Bennett and Brassard in 1984. Uses photon polarization to share a secret key — eavesdropping is detectable by checking error rates.',
  },
}

interface Props {
  term: string
  children: React.ReactNode
}

export function QuantumTooltip({ term, children }: Props) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const ref = useRef<HTMLSpanElement>(null)
  const entry = GLOSSARY[term.toLowerCase()]

  useEffect(() => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPosition(rect.top < 160 ? 'bottom' : 'top')
    }
  }, [visible])

  if (!entry) return <>{children}</>

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span style={{
        borderBottom: '1px dashed #7c3aed',
        color: '#a78bfa',
        cursor: 'help',
      }}>
        {children}
      </span>

      {visible && (
        <span style={{
          position: 'absolute',
          [position === 'top' ? 'bottom' : 'top']: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
          background: '#1d1640',
          border: '1px solid #2a2450',
          borderRadius: 10,
          padding: '12px 14px',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          <span style={{
            display: 'block',
            fontSize: 11, fontWeight: 500,
            color: '#a78bfa', marginBottom: 5,
          }}>
            {entry.short}
          </span>
          <span style={{
            display: 'block',
            fontSize: 12, color: '#8b7eb8', lineHeight: 1.5,
          }}>
            {entry.plain}
          </span>
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: -5,
            left: '50%',
            width: 8, height: 8,
            background: '#1d1640',
            border: '1px solid #2a2450',
            borderRight: 'none', borderBottom: 'none',
            transform: position === 'top'
              ? 'translateX(-50%) rotate(225deg)'
              : 'translateX(-50%) rotate(45deg)',
          }} />
        </span>
      )}
    </span>
  )
}

// Terms auto-wrapped by WithTooltips in app/page.tsx:
// qubit, superposition, hadamard gate, entanglement, bb84, rsa
