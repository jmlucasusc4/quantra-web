// ── Quantum Simulator (TypeScript port of QuantumSimulator.swift) ──

export interface Complex {
  real: number;
  imag: number;
}

function add(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}
function mul(a: Complex, b: Complex): Complex {
  return { real: a.real * b.real - a.imag * b.imag, imag: a.real * b.imag + a.imag * b.real };
}
function scale(a: Complex, s: number): Complex {
  return { real: a.real * s, imag: a.imag * s };
}
function norm(a: Complex): number {
  return a.real * a.real + a.imag * a.imag;
}

const H_SCALE = 1 / Math.SQRT2;

export class QuantumSimulator {
  private n: number;
  private state: Complex[];

  constructor(numQubits: number) {
    this.n = numQubits;
    const size = 1 << numQubits;
    this.state = Array(size).fill(null).map(() => ({ real: 0, imag: 0 }));
    this.state[0] = { real: 1, imag: 0 };
  }

  hadamard(qubit: number) {
    const size = 1 << this.n;
    const step = 1 << qubit;
    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const a = this.state[i];
        const b = this.state[j];
        this.state[i] = scale(add(a, b), H_SCALE);
        this.state[j] = scale({ real: a.real - b.real, imag: a.imag - b.imag }, H_SCALE);
      }
    }
  }

  pauliX(qubit: number) {
    const size = 1 << this.n;
    const step = 1 << qubit;
    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
      }
    }
  }

  pauliZ(qubit: number) {
    const size = 1 << this.n;
    const step = 1 << qubit;
    for (let i = 0; i < size; i++) {
      if ((i & step) !== 0) {
        this.state[i] = scale(this.state[i], -1);
      }
    }
  }

  cnot(control: number, target: number) {
    const size = 1 << this.n;
    const cStep = 1 << control;
    const tStep = 1 << target;
    for (let i = 0; i < size; i++) {
      if ((i & cStep) !== 0 && (i & tStep) === 0) {
        const j = i | tStep;
        [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
      }
    }
  }

  phaseOracle(target: number) {
    this.state[target] = scale(this.state[target], -1);
  }

  groverDiffusion() {
    const size = 1 << this.n;
    let sumReal = 0, sumImag = 0;
    for (const s of this.state) { sumReal += s.real; sumImag += s.imag; }
    const avgReal = sumReal / size;
    const avgImag = sumImag / size;
    for (let i = 0; i < size; i++) {
      this.state[i] = {
        real: 2 * avgReal - this.state[i].real,
        imag: 2 * avgImag - this.state[i].imag,
      };
    }
  }

  measureQubit(qubit: number): number {
    const size = 1 << this.n;
    const step = 1 << qubit;
    let prob1 = 0;
    for (let i = 0; i < size; i++) {
      if ((i & step) !== 0) prob1 += norm(this.state[i]);
    }
    const result = Math.random() < prob1 ? 1 : 0;
    for (let i = 0; i < size; i++) {
      const bit = (i & step) !== 0 ? 1 : 0;
      if (bit !== result) this.state[i] = { real: 0, imag: 0 };
    }
    const norm2 = this.state.reduce((s, c) => s + norm(c), 0);
    const factor = 1 / Math.sqrt(norm2);
    this.state = this.state.map(c => scale(c, factor));
    return result;
  }

  measure(shots: number): Record<string, number> {
    const counts: Record<string, number> = {};
    const size = 1 << this.n;
    const probs = this.state.map(c => norm(c));
    for (let s = 0; s < shots; s++) {
      let r = Math.random();
      let idx = 0;
      for (let i = 0; i < size; i++) {
        r -= probs[i];
        if (r <= 0) { idx = i; break; }
      }
      const key = idx.toString(2).padStart(this.n, '0');
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }

  getState() { return this.state; }

  // ── Static circuits ──

  static superposition(): QuantumSimulator {
    const sim = new QuantumSimulator(1);
    sim.hadamard(0);
    return sim;
  }

  static entanglement(): QuantumSimulator {
    const sim = new QuantumSimulator(2);
    sim.hadamard(1);
    sim.cnot(1, 0);
    return sim;
  }

  static grover(numQubits: number, target: number): QuantumSimulator {
    const sim = new QuantumSimulator(numQubits);
    for (let i = 0; i < numQubits; i++) sim.hadamard(i);
    const iters = Math.round((Math.PI / 4) * Math.sqrt(1 << numQubits));
    for (let i = 0; i < iters; i++) {
      sim.phaseOracle(target);
      sim.groverDiffusion();
    }
    return sim;
  }

  static bernsteinVazirani(hidden: string): Record<string, number> {
    const n = hidden.length;
    const sim = new QuantumSimulator(n + 1);
    sim.pauliX(0);
    for (let i = 0; i <= n; i++) sim.hadamard(i);
    for (let i = 0; i < n; i++) {
      if (hidden[n - 1 - i] === '1') sim.cnot(i + 1, 0);
    }
    for (let i = 1; i <= n; i++) sim.hadamard(i);
    const raw = sim.measure(1024);
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const trimmed = k.slice(1);
      result[trimmed] = (result[trimmed] ?? 0) + v;
    }
    return result;
  }

  static teleportation(state: 'zero' | 'one' | 'plus' | 'minus', shots: number): Record<string, number> {
    const counts: Record<string, number> = {};
    for (let s = 0; s < shots; s++) {
      const sim = new QuantumSimulator(3);
      if (state === 'one') sim.pauliX(2);
      else if (state === 'plus') sim.hadamard(2);
      else if (state === 'minus') { sim.pauliX(2); sim.hadamard(2); }
      sim.hadamard(1);
      sim.cnot(1, 0);
      sim.cnot(2, 1);
      sim.hadamard(2);
      const m2 = sim.measureQubit(2);
      const m1 = sim.measureQubit(1);
      if (m1 === 1) sim.pauliX(0);
      if (m2 === 1) sim.pauliZ(0);
      const result = sim.measureQubit(0);
      const key = result.toString();
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }
}

// ── Shor's Algorithm ──

export interface ShorStep { description: string; value: string; }

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

export function shorFactor(n: number): { steps: ShorStep[]; factors: [number, number] | null } {
  const steps: ShorStep[] = [];
  steps.push({ description: 'Input number to factor', value: `N = ${n}` });
  const a = Math.floor(Math.random() * (n - 2)) + 2;
  steps.push({ description: 'Choose random a', value: `a = ${a}` });
  const g = gcd(a, n);
  if (g > 1) {
    steps.push({ description: 'Lucky! GCD(a, N) is non-trivial', value: `GCD(${a}, ${n}) = ${g}` });
    return { steps, factors: [g, n / g] };
  }
  steps.push({ description: 'GCD(a, N) = 1 — proceed to period finding', value: `GCD(${a}, ${n}) = 1` });
  steps.push({ description: '🔬 Quantum: QFT period-finding for a^x mod N', value: 'Running...' });
  let r = 1, val = a % n;
  while (val !== 1 && r < n) { val = (val * a) % n; r++; }
  steps.push({ description: 'Period found', value: `r = ${r}` });
  if (r % 2 !== 0) {
    steps.push({ description: 'Period is odd — retry with different a', value: 'r is odd' });
    return { steps, factors: null };
  }
  steps.push({ description: 'Period is even ✓', value: `r = ${r} is even` });
  let aPowHalf = 1;
  for (let i = 0; i < r / 2; i++) aPowHalf = (aPowHalf * a) % n;
  const f1 = gcd(aPowHalf + 1, n);
  const f2 = gcd(aPowHalf - 1 < 0 ? aPowHalf - 1 + n : aPowHalf - 1, n);
  steps.push({ description: `Compute a^(r/2) mod N`, value: `${a}^${r / 2} mod ${n} = ${aPowHalf}` });
  steps.push({ description: 'GCD(a^(r/2)+1, N)', value: `GCD(${aPowHalf + 1}, ${n}) = ${f1}` });
  steps.push({ description: 'GCD(a^(r/2)-1, N)', value: `GCD(${aPowHalf - 1}, ${n}) = ${f2}` });
  if ((f1 === 1 || f1 === n) && (f2 === 1 || f2 === n)) {
    steps.push({ description: 'Trivial factors — retry', value: 'Need different a' });
    return { steps, factors: null };
  }
  const p = f1 > 1 && f1 < n ? f1 : f2;
  const q = n / p;
  steps.push({ description: '✅ Factors found!', value: `${n} = ${p} × ${q}` });
  return { steps, factors: [p, q] };
}

// ── BB84 ──

export interface BB84Result {
  aliceBits: number[];
  aliceBases: number[];
  bobBases: number[];
  bobMeasured: number[];
  evePresent: boolean;
  eveBases: number[];
  siftedKey: number[];
  errorRate: number;
}

export function simulateBB84(numBits: number, evePresent: boolean): BB84Result {
  const rand = () => Math.random() < 0.5 ? 0 : 1;
  const aliceBits  = Array.from({ length: numBits }, rand);
  const aliceBases = Array.from({ length: numBits }, rand);
  const eveBases   = Array.from({ length: numBits }, rand);
  const bobBases   = Array.from({ length: numBits }, rand);

  const bobMeasured = aliceBits.map((bit, i) => {
    if (evePresent) {
      const eveResult = eveBases[i] === aliceBases[i] ? bit : rand();
      return bobBases[i] === eveBases[i] ? eveResult : rand();
    }
    return bobBases[i] === aliceBases[i] ? bit : rand();
  });

  const matchIndices = aliceBases.map((b, i) => b === bobBases[i] ? i : -1).filter(i => i >= 0);
  const siftedKey = matchIndices.map(i => aliceBits[i]);
  const bobSifted = matchIndices.map(i => bobMeasured[i]);
  const errors = siftedKey.filter((b, i) => b !== bobSifted[i]).length;
  const errorRate = siftedKey.length > 0 ? errors / siftedKey.length : 0;

  return { aliceBits, aliceBases, bobBases, bobMeasured, evePresent, eveBases, siftedKey, errorRate };
}
