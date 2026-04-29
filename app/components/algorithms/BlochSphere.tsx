"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { drawBloch } from "./bloch3d";

const PRESETS = [
  { label: "|0⟩",  theta: 0,             phi: 0 },
  { label: "|1⟩",  theta: Math.PI,       phi: 0 },
  { label: "|+⟩",  theta: Math.PI/2,     phi: 0 },
  { label: "|−⟩",  theta: Math.PI/2,     phi: Math.PI },
  { label: "|i⟩",  theta: Math.PI/2,     phi: Math.PI/2 },
  { label: "|-i⟩", theta: Math.PI/2,     phi: (3*Math.PI)/2 },
];

export default function BlochSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(Math.PI / 3);
  const [phi,   setPhi]   = useState(Math.PI / 5);
  const [playing, setPlaying] = useState(false);

  // Mutable view + drag state in refs so the rAF loop reads current values
  const viewRef    = useRef({ az: 0.5, el: 0.15 });
  const dragRef    = useRef({ active: false, lastX: 0, lastY: 0 });
  const animRef    = useRef(0);
  const playingRef = useRef(false);
  const thetaRef   = useRef(theta);
  const phiRef     = useRef(phi);

  useEffect(() => { thetaRef.current = theta; }, [theta]);
  useEffect(() => { phiRef.current   = phi;   }, [phi]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawBloch(canvas, {
      theta:     thetaRef.current,
      phi:       phiRef.current,
      az:        viewRef.current.az,
      el:        viewRef.current.el,
      collapsed: true,
    });
  }, []);

  // Redraw when slider/preset changes
  useEffect(() => { redraw(); }, [theta, phi, redraw]);

  // Auto-rotation loop
  useEffect(() => {
    playingRef.current = playing;
    if (playing) {
      const tick = () => {
        if (!playingRef.current) return;
        viewRef.current.az += 0.008;
        redraw();
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(animRef.current);
    }
    return () => { playingRef.current = false; cancelAnimationFrame(animRef.current); };
  }, [playing, redraw]);

  // Resize
  useEffect(() => {
    const ro = new ResizeObserver(redraw);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [redraw]);

  // Pointer drag
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    viewRef.current.az += dx * 0.007;
    viewRef.current.el  = Math.max(-Math.PI/2, Math.min(Math.PI/2, viewRef.current.el + dy * 0.007));
    redraw();
  }
  function onPointerUp() { dragRef.current.active = false; }

  const cosHalf = Math.cos(theta/2).toFixed(2);
  const sinHalf = Math.sin(theta/2).toFixed(2);
  const phiDeg  = Math.round((phi*180)/Math.PI) % 360;
  const thetaDeg = Math.round(theta*180/Math.PI);

  return (
    <div className="space-y-4">
      {/* Readout */}
      <div className="flex gap-6 font-mono text-sm">
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">θ</div>
          <div className="text-white/80">{theta.toFixed(3)} rad</div>
        </div>
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">φ</div>
          <div className="text-white/80">{phi.toFixed(3)} rad</div>
        </div>
        <div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Purity</div>
          <div className="text-white/80">1.000</div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map(pr => (
          <button
            key={pr.label}
            onClick={() => { setTheta(pr.theta); setPhi(pr.phi); }}
            className="px-3 py-1.5 rounded-lg text-sm font-mono bg-purple-900/40 border border-purple-500/30 text-white hover:bg-purple-800/50 cursor-pointer transition-colors"
          >
            {pr.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative select-none">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl bg-[#07050f] border border-purple-500/20 touch-none cursor-grab active:cursor-grabbing"
          style={{ height: 320 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        <button
          onClick={() => setPlaying(p => !p)}
          title={playing ? "Pause rotation" : "Auto-rotate"}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors"
          style={{ background: playing ? "rgba(124,58,237,0.55)" : "rgba(124,58,237,0.25)", border: "1px solid rgba(167,139,250,0.3)" }}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <span className="absolute bottom-3 left-3 text-[10px] text-white/20 pointer-events-none select-none">drag to rotate</span>
      </div>

      {/* State equation */}
      <p className="font-mono text-center text-sm text-purple-300 tracking-wide">
        |ψ⟩ = {cosHalf}|0⟩ + e^(i{phiDeg}°)·{sinHalf}|1⟩
      </p>

      {/* Sliders */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28 shrink-0">θ (polar): {thetaDeg}°</span>
          <input type="range" min={0} max={Math.PI} step={0.01} value={theta}
            onChange={e => setTheta(+e.target.value)}
            className="flex-1 accent-purple-500" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28 shrink-0">φ (azimuthal): {phiDeg}°</span>
          <input type="range" min={0} max={2*Math.PI} step={0.01} value={phi}
            onChange={e => setPhi(+e.target.value)}
            className="flex-1 accent-purple-500" />
        </div>
      </div>
    </div>
  );
}
