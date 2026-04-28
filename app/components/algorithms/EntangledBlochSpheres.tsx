"use client"
import { useRef, useEffect, useState, useCallback } from "react"

type BellLabel = "Φ+" | "Φ-" | "Ψ+" | "Ψ-"
type Phase     = "ready" | "measured"

const BELL: { key: BellLabel; expr: string; correlated: boolean }[] = [
  { key: "Φ+", expr: "(|00⟩ + |11⟩)/√2", correlated: true  },
  { key: "Φ-", expr: "(|00⟩ − |11⟩)/√2", correlated: true  },
  { key: "Ψ+", expr: "(|01⟩ + |10⟩)/√2", correlated: false },
  { key: "Ψ-", expr: "(|01⟩ − |10⟩)/√2", correlated: false },
]

const YDX = -0.390
const YDY =  0.225
const ZSC =  0.88

function drawSphere(
  canvas: HTMLCanvasElement,
  theta: number,
  qubitLabel: string,
  state: "super" | "collapsed",
) {
  const ctx  = canvas.getContext("2d")!
  const dpr  = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const W    = rect.width  || 160
  const H    = rect.height || 200
  canvas.width  = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const cx = W / 2
  const cy = H / 2 + 6
  const r  = Math.min(W, H) / 2 - 30

  const proj = (bx: number, by: number, bz: number) => ({
    sx: cx + r * (bx + YDX * by),
    sy: cy + r * (-ZSC * bz + YDY * by),
    d:  bx - by,
  })

  // Sphere fill
  const grd = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.32, r * 0.04, cx, cy, r)
  grd.addColorStop(0,    "rgba(109,40,217,0.22)")
  grd.addColorStop(0.55, "rgba(46,16,101,0.14)")
  grd.addColorStop(1,    "rgba(10,5,30,0.50)")
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.fillStyle = grd; ctx.fill()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.strokeStyle = "rgba(139,92,246,0.45)"; ctx.lineWidth = 1.2; ctx.stroke()

  const N = 72

  // Latitude rings
  for (const deg of [-60, -30, 30, 60]) {
    const lat = deg * Math.PI / 180
    const cosL = Math.cos(lat), sinL = Math.sin(lat)
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI
      const p0 = proj(cosL * Math.cos(t0), cosL * Math.sin(t0), sinL)
      const p1 = proj(cosL * Math.cos(t1), cosL * Math.sin(t1), sinL)
      const front = (p0.d + p1.d) > 0
      ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy)
      ctx.strokeStyle = front ? "rgba(139,92,246,0.22)" : "rgba(99,60,200,0.07)"
      ctx.lineWidth   = front ? 0.7 : 0.4; ctx.stroke()
    }
  }

  // Equator
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI
    const p0 = proj(Math.cos(t0), Math.sin(t0), 0)
    const p1 = proj(Math.cos(t1), Math.sin(t1), 0)
    const front = (p0.d + p1.d) > 0
    ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy)
    ctx.strokeStyle = front ? "rgba(167,139,250,0.50)" : "rgba(139,92,246,0.12)"
    ctx.lineWidth   = front ? 1.1 : 0.5; ctx.stroke()
  }

  // Meridians
  for (const deg of [0, 90, 180, 270]) {
    const lon = deg * Math.PI / 180
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI
      const p0 = proj(Math.sin(t0) * Math.cos(lon), Math.sin(t0) * Math.sin(lon), Math.cos(t0))
      const p1 = proj(Math.sin(t1) * Math.cos(lon), Math.sin(t1) * Math.sin(lon), Math.cos(t1))
      const front = (p0.d + p1.d) > 0
      ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy)
      ctx.strokeStyle = front ? "rgba(139,92,246,0.18)" : "rgba(99,60,200,0.05)"
      ctx.lineWidth   = 0.5; ctx.stroke()
    }
  }

  // Axis labels
  const POLES: { b: [number, number, number]; lbl: string }[] = [
    { b: [ 0,  0,  1], lbl: "|0⟩" },
    { b: [ 0,  0, -1], lbl: "|1⟩" },
    { b: [ 1,  0,  0], lbl: "|+⟩" },
    { b: [-1,  0,  0], lbl: "|−⟩" },
  ]
  ctx.font = "bold 9px 'SF Mono', ui-monospace, monospace"
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  for (const { b, lbl } of POLES) {
    const tip   = proj(b[0] * 1.25, b[1] * 1.25, b[2] * 1.25)
    const front = proj(b[0], b[1], b[2]).d >= 0
    ctx.fillStyle = front ? "rgba(221,196,255,0.90)" : "rgba(139,92,246,0.35)"
    ctx.fillText(lbl, tip.sx, tip.sy)
  }

  // State vector
  const bx  = Math.sin(theta)
  const bz  = Math.cos(theta)
  const tip = proj(bx, 0, bz)
  const eq  = proj(bx, 0, 0)
  const alpha = state === "super" ? 0.38 : 1.0

  ctx.setLineDash([3, 3]); ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(eq.sx, eq.sy)
  ctx.strokeStyle = `rgba(168,85,247,${0.25 * alpha})`; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(eq.sx, eq.sy); ctx.lineTo(tip.sx, tip.sy)
  ctx.strokeStyle = `rgba(168,85,247,${0.18 * alpha})`; ctx.stroke()
  ctx.setLineDash([])

  const arrowCol = state === "super" ? `rgba(192,132,252,${alpha})` : "#c084fc"
  ctx.shadowColor = "#9333ea"; ctx.shadowBlur = state === "collapsed" ? 18 : 6
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tip.sx, tip.sy)
  ctx.strokeStyle = arrowCol; ctx.lineWidth = 2.4; ctx.stroke()
  ctx.shadowBlur  = 0

  const adx = tip.sx - cx, ady = tip.sy - cy
  const alen = Math.sqrt(adx * adx + ady * ady)
  if (alen > 6) {
    const ux = adx / alen, uy = ady / alen
    ctx.beginPath()
    ctx.moveTo(tip.sx, tip.sy)
    ctx.lineTo(tip.sx - ux * 11 + uy * 4.5, tip.sy - uy * 11 - ux * 4.5)
    ctx.lineTo(tip.sx - ux * 11 - uy * 4.5, tip.sy - uy * 11 + ux * 4.5)
    ctx.closePath()
    ctx.fillStyle   = arrowCol
    ctx.shadowColor = "#9333ea"; ctx.shadowBlur = state === "collapsed" ? 10 : 4
    ctx.fill(); ctx.shadowBlur = 0
  }

  ctx.beginPath(); ctx.arc(tip.sx, tip.sy, 4.5, 0, 2 * Math.PI)
  ctx.fillStyle   = state === "collapsed" ? "#ede9fe" : "rgba(237,233,254,0.38)"
  ctx.shadowColor = "#a855f7"; ctx.shadowBlur = state === "collapsed" ? 14 : 4
  ctx.fill(); ctx.shadowBlur = 0

  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI)
  ctx.fillStyle = "rgba(255,255,255,0.60)"; ctx.fill()

  // Qubit label
  ctx.font = "11px system-ui, sans-serif"
  ctx.textAlign = "center"; ctx.textBaseline = "top"
  ctx.fillStyle = "rgba(167,139,250,0.75)"
  ctx.fillText(qubitLabel, W / 2, 4)
}

export default function EntangledBlochSpheres() {
  const refA = useRef<HTMLCanvasElement>(null)
  const refB = useRef<HTMLCanvasElement>(null)

  const [bell,   setBell]   = useState<BellLabel>("Φ+")
  const [phase,  setPhase]  = useState<Phase>("ready")
  const [thetaA, setThetaA] = useState(0)
  const [thetaB, setThetaB] = useState(0)

  const draw = useCallback(() => {
    const s = phase === "measured" ? "collapsed" : "super"
    if (refA.current) drawSphere(refA.current, thetaA, "Qubit A", s)
    if (refB.current) drawSphere(refB.current, thetaB, "Qubit B", s)
  }, [thetaA, thetaB, phase])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const ro = new ResizeObserver(() => draw())
    if (refA.current) ro.observe(refA.current)
    if (refB.current) ro.observe(refB.current)
    return () => ro.disconnect()
  }, [draw])

  function measure() {
    const def = BELL.find(b => b.key === bell)!
    const aZero = Math.random() < 0.5
    const newA  = aZero ? 0 : Math.PI
    const newB  = def.correlated
      ? (aZero ? 0 : Math.PI)
      : (aZero ? Math.PI : 0)
    setThetaA(newA); setThetaB(newB); setPhase("measured")
  }

  function reset() { setThetaA(0); setThetaB(0); setPhase("ready") }

  const def    = BELL.find(b => b.key === bell)!
  const labelA = phase === "measured" ? (thetaA === 0 ? "|0⟩" : "|1⟩") : null
  const labelB = phase === "measured" ? (thetaB === 0 ? "|0⟩" : "|1⟩") : null

  return (
    <div className="space-y-4">
      {/* Bell state selector */}
      <div className="flex gap-2 flex-wrap">
        {BELL.map(b => (
          <button
            key={b.key}
            onClick={() => { setBell(b.key); reset() }}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors cursor-pointer ${
              bell === b.key
                ? "bg-purple-700/60 border-purple-500 text-white"
                : "bg-purple-900/30 border-purple-500/25 text-white/60 hover:bg-purple-800/40"
            }`}
          >
            |{b.key}⟩
          </button>
        ))}
      </div>

      <p className="text-center text-sm font-mono text-purple-300/80 tracking-wide">{def.expr}</p>

      {/* Two spheres */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <canvas ref={refA} className="w-full rounded-xl bg-[#0c0a1e] border border-purple-500/20" style={{ height: 200 }} />
          <p className="text-center text-xs font-mono h-4" style={{ color: "rgba(192,132,252,0.85)" }}>
            {labelA ?? ""}
          </p>
        </div>
        <div className="space-y-1">
          <canvas ref={refB} className="w-full rounded-xl bg-[#0c0a1e] border border-purple-500/20" style={{ height: 200 }} />
          <p className="text-center text-xs font-mono h-4" style={{ color: "rgba(192,132,252,0.85)" }}>
            {labelB ?? ""}
          </p>
        </div>
      </div>

      {/* Correlation result */}
      {phase === "measured" && (
        <div className="rounded-xl p-3 text-center space-y-1"
          style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(168,85,247,0.20)" }}>
          <p className="text-sm text-white/70">
            Qubit A collapsed to{" "}
            <span className="font-mono text-purple-300">{labelA}</span>
            {" — Qubit B instantly became "}
            <span className="font-mono text-purple-300">{labelB}</span>.
          </p>
          <p className="text-xs text-white/35">
            {def.correlated
              ? "Correlated: same outcome guaranteed for any basis."
              : "Anti-correlated: opposite outcome guaranteed."}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={measure}
          disabled={phase === "measured"}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          ⚡ Measure Qubit A
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/10 hover:text-white/80 hover:border-white/20 cursor-pointer transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-white/30 text-center">
        No signal travels between qubits — the correlation is enforced by quantum mechanics at the moment of entanglement.
      </p>
    </div>
  )
}
