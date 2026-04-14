"use client";
import { useRef, useEffect, useState } from "react";

const PRESETS = [
  { label: "|0⟩", theta: 0, phi: 0 },
  { label: "|1⟩", theta: Math.PI, phi: 0 },
  { label: "|+⟩", theta: Math.PI / 2, phi: 0 },
  { label: "|−⟩", theta: Math.PI / 2, phi: Math.PI },
  { label: "|i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
  { label: "|-i⟩", theta: Math.PI / 2, phi: (3 * Math.PI) / 2 },
];

export default function BlochSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(Math.PI / 2);
  const [phi, setPhi] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) / 2 - 20;

    ctx.clearRect(0, 0, W, H);

    // Sphere outline
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Equator ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.25, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.stroke();

    // Axes
    const axes = [
      { dx: 0, dy: -1, label: "|0⟩" },
      { dx: 0, dy: 1, label: "|1⟩" },
      { dx: 1, dy: 0, label: "|+⟩" },
      { dx: -1, dy: 0, label: "|−⟩" },
    ];
    axes.forEach(({ dx, dy, label }) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * r, cy + dy * r);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, cx + dx * (r + 16), cy + dy * (r + 16) + 4);
    });

    // State vector
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    const px = cx + r * sinT * Math.cos(phi);
    const py = cy - r * cosT;

    // Shadow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * sinT * Math.cos(phi), cy - r * 0.25 * sinT * Math.sin(phi));
    ctx.strokeStyle = "rgba(124,58,237,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrowhead
    const dx2 = px - cx, dy2 = py - cy;
    const len = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (len > 0) {
      const ux = dx2 / len, uy = dy2 / len;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - ux * 12 + uy * 6, py - uy * 12 - ux * 6);
      ctx.lineTo(px - ux * 12 - uy * 6, py - uy * 12 + ux * 6);
      ctx.closePath();
      ctx.fillStyle = "#a855f7";
      ctx.fill();
    }

    // Dots
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#d8b4fe";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fill();
  }, [theta, phi]);

  const cosHalf = Math.cos(theta / 2).toFixed(2);
  const sinHalf = Math.sin(theta / 2).toFixed(2);
  const phiDeg = Math.round((phi * 180) / Math.PI) % 360;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setTheta(p.theta); setPhi(p.phi); }}
            className="px-3 py-1.5 rounded-lg text-sm mono bg-purple-900/40 border border-purple-500/30 text-white hover:bg-purple-800/50 cursor-pointer transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} width={300} height={220}
        className="w-full rounded-xl bg-white/3 border border-white/5" style={{ maxHeight: 220 }} />

      <p className="mono text-center text-sm text-purple-300">
        |ψ⟩ = {cosHalf}|0⟩ + e^(i{phiDeg}°)·{sinHalf}|1⟩
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28">θ (polar): {Math.round(theta * 180 / Math.PI)}°</span>
          <input type="range" min={0} max={Math.PI} step={0.01} value={theta}
            onChange={e => setTheta(+e.target.value)} className="flex-1 accent-purple-500" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28">φ (azimuthal): {Math.round(phi * 180 / Math.PI)}°</span>
          <input type="range" min={0} max={2 * Math.PI} step={0.01} value={phi}
            onChange={e => setPhi(+e.target.value)} className="flex-1 accent-purple-500" />
        </div>
      </div>
    </div>
  );
}
