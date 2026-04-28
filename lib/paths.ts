import type { Tier } from './stripe'

export interface LearningPath {
  id:          string
  name:        string
  role:        string
  tagline:     string
  description: string
  duration:    string
  difficulty:  'Beginner' | 'Intermediate' | 'Advanced'
  standards:   string[]
  demos:       string[]   // slugs in learning order
  requiredTier: Tier
  color:       string     // accent color
}

export const PATHS: LearningPath[] = [
  {
    id:          'ciso',
    name:        'CISO Track',
    role:        'Security Leadership',
    tagline:     'Quantum Risk for Security Leaders',
    description: 'Understand the business impact of quantum threats, assess your cryptographic exposure, and make the case for post-quantum migration — no math required.',
    duration:    '~45 min',
    difficulty:  'Beginner',
    standards:   ['NIST IR 8547', 'CISA PQC', 'FIPS 203'],
    demos: [
      'harvest-now',
      'quantum-risk-auditor',
      'classical-vs-quantum',
      'bb84-protocol',
      'crystals-kyber',
    ],
    requiredTier: 'pro',
    color: '#f87171',
  },
  {
    id:          'architect',
    name:        'Security Architect Track',
    role:        'Security Architecture',
    tagline:     'Post-Quantum Migration Engineering',
    description: 'Map your cryptographic inventory, evaluate algorithm replacement paths, and understand which quantum attacks actually threaten your stack.',
    duration:    '~90 min',
    difficulty:  'Intermediate',
    standards:   ['FIPS 203', 'FIPS 204', 'NIST SP 800-57', 'NIST IR 8547'],
    demos: [
      'superposition',
      'entanglement',
      'grovers-search',
      'shors-algorithm',
      'bb84-protocol',
      'crystals-kyber',
      'quantum-risk-auditor',
      'harvest-now',
    ],
    requiredTier: 'research',
    color: '#fbbf24',
  },
  {
    id:          'crypto-engineer',
    name:        'Crypto Engineer Track',
    role:        'Cryptography Engineering',
    tagline:     'Quantum Algorithms & Cryptographic Impact',
    description: 'Deep-dive into quantum algorithms from first principles — understand exactly why and how each one breaks classical cryptography, then explore the replacements.',
    duration:    '~2.5 hrs',
    difficulty:  'Advanced',
    standards:   ['FIPS 203', 'FIPS 204', 'FIPS 205', 'NIST SP 800-208'],
    demos: [
      'superposition',
      'entanglement',
      'bloch-sphere',
      'deutsch-jozsa',
      'bernstein-vazirani',
      'grovers-search',
      'simons-algorithm',
      'shors-algorithm',
      'bb84-protocol',
      'crystals-kyber',
      'circuit-builder',
    ],
    requiredTier: 'research',
    color: '#a78bfa',
  },
  {
    id:          'foundations',
    name:        'Foundations Track',
    role:        'All Roles',
    tagline:     'Quantum Fundamentals in 30 Minutes',
    description: 'The five demos every security professional needs before any deeper quantum work. Start here if you\'re new to quantum computing.',
    duration:    '~30 min',
    difficulty:  'Beginner',
    standards:   ['NIST IR 8547'],
    demos: [
      'superposition',
      'entanglement',
      'bloch-sphere',
      'harvest-now',
      'quantum-risk-auditor',
    ],
    requiredTier: 'free',
    color: '#34d399',
  },
]

export function getPath(id: string): LearningPath | undefined {
  return PATHS.find(p => p.id === id)
}

export function pathProgress(path: LearningPath, completedDemos: string[]): number {
  const done = path.demos.filter(s => completedDemos.includes(s)).length
  return Math.round((done / path.demos.length) * 100)
}

export function nextDemo(path: LearningPath, completedDemos: string[]): string | null {
  return path.demos.find(s => !completedDemos.includes(s)) ?? null
}
