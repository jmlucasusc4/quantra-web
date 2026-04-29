"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { drawBloch } from "./bloch3d"

type BellLabel = "Φ+" | "Φ-" | "Ψ+" | "Ψ-"
type Phase     = "ready" | "measured"

const BELL: { key: BellLabel; expr: string; correlated: boolean }[] = [
  { key: "Φ+", expr: "(|00⟩ + |11⟩)/√2", correlated: true  },
  { key: "Φ-", expr: "(|00⟩ − |11⟩)/√2", correlated: true  },
  { key: "Ψ+", expr: "(|01⟩ + |10⟩)/√2", correlated: false },
  { key: "Ψ-", expr: "(|01⟩ − |10⟩)/√2", correlated: false },
]

export default function EntangledBlochSpheres() {
  const refA = useRef<HTMLCanvasElement>(null)
  const refB = useRef<HTMLCanvasElement>(null)

  const [bell,   setBell]   = useState<BellLabel>("Φ+")
  const [phase,  setPhase]  = useState<Phase>("ready")
  const [thetaA, setThetaA] = useState(0)
  const [thetaB, setThetaB] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Shared view — both spheres rotate together
  const viewRef    = useRef({ az: 0.5, el: 0.15 })
  const dragRef    = useRef({ active: false, lastX: 0, lastY: 0 })
  const animRef    = useRef(0)
  const playingRef = useRef(false)

  const thetaARef = useRef(thetaA)
  const thetaBRef = useRef(thetaB)
  const phaseRef  = useRef(phase)
  useEffect(() => { thetaARef.current = thetaA }, [thetaA])
  useEffect(() => { thetaBRef.current = thetaB }, [thetaB])
  useEffect(() => { phaseRef.current  = phase  }, [phase])

  const redraw = useCallback(() => {
    const { az, el }  = viewRef.current
    const collapsed   = phaseRef.current === "measured"
    if (refA.current) drawBloch(refA.current, {
      theta: thetaARef.current, phi: 0, az, el,
      collapsed, tint: "#c084fc", label: "Qubit A",
    })
    if (refB.current) drawBloch(refB.current, {
      theta: thetaBRef.current, phi: 0, az, el,
      collapsed, tint: "#f472b6", label: "Qubit B",
    })
  }, [])

  useEffect(() => { redraw() }, [thetaA, thetaB, phase, redraw])

  // Auto-rotation
  useEffect(() => {
    playingRef.current = playing
    if (playing) {
      const tick = () => {
        if (!playingRef.current) return
        viewRef.current.az += 0.008
        redraw()
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(animRef.current)
    }
    return () => { playingRef.current = false; cancelAnimationFrame(animRef.current) }
  }, [playing, redraw])

  // Resize
  useEffect(() => {
    const ro = new ResizeObserver(redraw)
    if (refA.current) ro.observe(refA.current)
    if (refB.current) ro.observe(refB.current)
    return () => ro.disconnect()
  }, [redraw])

  // Pointer drag (either canvas rotates both)
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY
    viewRef.current.az += dx * 0.007
    viewRef.current.el  = Math.max(-Math.PI/2, Math.min(Math.PI/2, viewRef.current.el + dy * 0.007))
    redraw()
  }
  function onPointerUp() { dragRef.current.active = false }

  function measure() {
    const def  = BELL.find(b => b.key === bell)!
    const aZero = Math.random() < 0.5
    const newA  = aZero ? 0 : Math.PI
    const newB  = def.correlated ? (aZero ? 0 : Math.PI) : (aZero ? Math.PI : 0)
    setThetaA(newA); setThetaB(newB); setPhase("measured")
  }
  function reset() { setThetaA(0); setThetaB(0); setPhase("ready") }

  const def    = BELL.find(b => b.key === bell)!
  const labelA = phase === "measured" ? (thetaA === 0 ? "|0⟩" : "|1⟩") : null
  const labelB = phase === "measured" ? (thetaB === 0 ? "|0⟩" : "|1⟩") : null

  const canvasProps = {
    className: "w-full rounded-xl bg-[#07050f] border border-purple-500/20 touch-none cursor-grab active:cursor-grabbing",
    style: { height: 220 } as React.CSSProperties,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
  }

  return (
    <div className="space-y-4">
      {/* Bell state selector */}
      <div className="flex gap-2 flex-wrap">
        {BELL.map(b => (
          <button key={b.key}
            onClick={() => { setBell(b.key); reset() }}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors cursor-pointer ${
              bell === b.key
                ? "bg-purple-700/60 border-purple-500 text-white"
                : "bg-purple-900/30 border-purple-500/25 text-white/60 hover:bg-purple-800/40"
            }`}>
            |{b.key}⟩
          </button>
        ))}
      </div>

      <p className="text-center text-sm font-mono text-purple-300/80 tracking-wide">{def.expr}</p>

      {/* Spheres */}
      <div className="relative select-none">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <canvas ref={refA} {...canvasProps} />
            <p className="text-center text-xs font-mono h-4" style={{ color: "rgba(192,132,252,0.85)" }}>
              {labelA ?? ""}
            </p>
          </div>
          <div className="space-y-1">
            <canvas ref={refB} {...canvasProps} />
            <p className="text-center text-xs font-mono h-4" style={{ color: "rgba(244,114,182,0.85)" }}>
              {labelB ?? ""}
            </p>
          </div>
        </div>
        {/* Play / pause */}
        <button
          onClick={() => setPlaying(p => !p)}
          title={playing ? "Pause" : "Auto-rotate"}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors z-10"
          style={{ background: playing ? "rgba(124,58,237,0.55)" : "rgba(124,58,237,0.25)", border: "1px solid rgba(167,139,250,0.3)" }}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <span className="absolute top-3 left-3 text-[10px] text-white/20 pointer-events-none select-none">drag to rotate</span>
      </div>

      {/* Correlation result */}
      {phase === "measured" && (
        <div className="rounded-xl p-3 text-center space-y-1"
          style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(168,85,247,0.20)" }}>
          <p className="text-sm text-white/70">
            Qubit A collapsed to{" "}
            <span className="font-mono text-purple-300">{labelA}</span>
            {" — Qubit B instantly became "}
            <span className="font-mono text-pink-300">{labelB}</span>.
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
        <button onClick={measure} disabled={phase === "measured"}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
          ⚡ Measure Qubit A
        </button>
        <button onClick={reset}
          className="px-4 py-2.5 rounded-xl text-sm text-white/55 border border-white/10 hover:text-white/80 hover:border-white/20 cursor-pointer transition-colors">
          Reset
        </button>
      </div>

      <p className="text-xs text-white/30 text-center">
        No signal travels between qubits — the correlation is enforced by quantum mechanics at the moment of entanglement.
      </p>
    </div>
  )
}
