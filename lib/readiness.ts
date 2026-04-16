// lib/readiness.ts
// Computes quantum readiness score from completed demos.
// Called both client-side (preview) and server-side (Firestore write).

export interface ReadinessBreakdown {
  algorithmsScore: number
  cryptoScore: number
  riskScore: number
  pqcScore: number
}

export interface ReadinessResult {
  total: number
  breakdown: ReadinessBreakdown
  level: 'novice' | 'developing' | 'proficient' | 'expert'
  nextRecommended: string | null
}

// Each demo contributes points to specific categories (out of 100 each)
const DEMO_WEIGHTS: Record<string, Partial<ReadinessBreakdown>> = {
  'superposition':        { algorithmsScore: 10 },
  'entanglement':         { algorithmsScore: 10 },
  'bloch-sphere':         { algorithmsScore: 10 },
  'deutsch-jozsa':        { algorithmsScore: 15 },
  'classical-vs-quantum': { algorithmsScore: 15 },
  'grovers-search':       { algorithmsScore: 25, cryptoScore: 20 },
  'bernstein-vazirani':   { algorithmsScore: 15 },
  'simons-algorithm':     { algorithmsScore: 20 },
  'shors-algorithm':      { algorithmsScore: 25, cryptoScore: 30 },
  'bb84-protocol':        { cryptoScore: 25, pqcScore: 10 },
  'quantum-teleportation':{ cryptoScore: 15 },
  'crystals-kyber':       { cryptoScore: 20, pqcScore: 35 },
  'circuit-builder':      { algorithmsScore: 10, cryptoScore: 10 },
  'harvest-now':          { riskScore: 50, pqcScore: 20 },
  'quantum-risk-auditor': { riskScore: 50, pqcScore: 35 },
  'qrng':                 { cryptoScore: 10, pqcScore: 10 },
}

// Learning path — recommended order for next demo
const LEARNING_PATH = [
  'superposition', 'entanglement', 'bloch-sphere', 'deutsch-jozsa',
  'classical-vs-quantum', 'grovers-search', 'bb84-protocol',
  'crystals-kyber', 'harvest-now', 'quantum-risk-auditor',
  'bernstein-vazirani', 'circuit-builder', 'simons-algorithm',
  'shors-algorithm', 'quantum-teleportation',
]

export function computeReadiness(completedDemos: string[]): ReadinessResult {
  const completed = new Set(completedDemos)

  const raw: ReadinessBreakdown = {
    algorithmsScore: 0,
    cryptoScore: 0,
    riskScore: 0,
    pqcScore: 0,
  }

  for (const slug of completed) {
    const weights = DEMO_WEIGHTS[slug]
    if (!weights) continue
    for (const [key, val] of Object.entries(weights)) {
      raw[key as keyof ReadinessBreakdown] += val as number
    }
  }

  // Clamp each category to 100
  const breakdown: ReadinessBreakdown = {
    algorithmsScore: Math.min(100, Math.round(raw.algorithmsScore)),
    cryptoScore:     Math.min(100, Math.round(raw.cryptoScore)),
    riskScore:       Math.min(100, Math.round(raw.riskScore)),
    pqcScore:        Math.min(100, Math.round(raw.pqcScore)),
  }

  // Weighted average: algorithms 30%, crypto 30%, risk 20%, pqc 20%
  const total = Math.round(
    breakdown.algorithmsScore * 0.30 +
    breakdown.cryptoScore     * 0.30 +
    breakdown.riskScore       * 0.20 +
    breakdown.pqcScore        * 0.20
  )

  const level =
    total >= 80 ? 'expert' :
    total >= 55 ? 'proficient' :
    total >= 30 ? 'developing' : 'novice'

  // Find first uncompleted demo in learning path
  const nextRecommended = LEARNING_PATH.find(slug => !completed.has(slug)) ?? null

  return { total, breakdown, level, nextRecommended }
}
