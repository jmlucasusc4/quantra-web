"use client";
import { useRef, useEffect, useState } from "react";

const PRESETS = [
  { label: "|0⟩", theta: 0,            phi: 0 },
  { label: "|1⟩", theta: Math.PI,       phi: 0 },
  { label: "|+⟩", theta: Math.PI / 2,   phi: 0 },
  { label: "|−⟩", theta: Math.PI / 2,   phi: Math.PI },
  { label: "|i⟩", theta: Math.PI / 2,   phi: Math.PI / 2 },
  { label: "|-i⟩",theta: Math.PI / 2,   phi: (3 * Math.PI) / 2 },
];

// Oblique projection constants
// X → screen-right  |  Z → screen-up  |  Y → lower-left (into page)
const YDX = -0.390;   // screen-x contribution per unit Bloch-y
const YDY =  0.225;   // screen-y contribution per unit Bloch-y (canvas y ↓)
const ZSC =  0.88;    // z-axis vertical scale (leaves room for labels)

export default function BlochSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(Math.PI / 3);
  const [phi,   setPhi]   = useState(Math.PI / 5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d")!;
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W    = rect.width  || 360;
    const H    = rect.height || 300;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2 + 6;
    const r  = Math.min(W, H) / 2 - 38;

    // Project Bloch 3D → canvas 2D
    const proj = (bx: number, by: number, bz: number) => ({
      sx: cx + r * (bx + YDX * by),
      sy: cy + r * (-ZSC * bz + YDY * by),
      d:  bx - by,   // depth: positive = front hemisphere
    });

    // ── Sphere fill ───────────────────────────────────────────────────
    const grd = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.32, r * 0.04, cx, cy, r);
    grd.addColorStop(0,   "rgba(109,40,217,0.28)");
    grd.addColorStop(0.55,"rgba(46,16,101,0.18)");
    grd.addColorStop(1,   "rgba(10,5,30,0.55)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();

    // Sphere outline
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(139,92,246,0.55)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // ── Grid lines ────────────────────────────────────────────────────
    const N = 80;

    function drawLatitude(latRad: number) {
      const cosL = Math.cos(latRad), sinL = Math.sin(latRad);
      for (let i = 0; i < N; i++) {
        const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI;
        const p0 = proj(cosL * Math.cos(t0), cosL * Math.sin(t0), sinL);
        const p1 = proj(cosL * Math.cos(t1), cosL * Math.sin(t1), sinL);
        const front = (p0.d + p1.d) > 0;
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.strokeStyle = front ? "rgba(139,92,246,0.30)" : "rgba(99,60,200,0.08)";
        ctx.lineWidth   = front ? 0.8 : 0.5;
        ctx.stroke();
      }
    }

    function drawMeridian(lonRad: number) {
      for (let i = 0; i < N; i++) {
        const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI;
        const p0 = proj(Math.sin(t0) * Math.cos(lonRad), Math.sin(t0) * Math.sin(lonRad), Math.cos(t0));
        const p1 = proj(Math.sin(t1) * Math.cos(lonRad), Math.sin(t1) * Math.sin(lonRad), Math.cos(t1));
        const front = (p0.d + p1.d) > 0;
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.strokeStyle = front ? "rgba(139,92,246,0.22)" : "rgba(99,60,200,0.06)";
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }

    // Latitude rings at ±30° and ±60°
    [-60, -30, 30, 60].forEach(d => drawLatitude(d * Math.PI / 180));

    // Equator — more prominent
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI;
      const p0 = proj(Math.cos(t0), Math.sin(t0), 0);
      const p1 = proj(Math.cos(t1), Math.sin(t1), 0);
      const front = (p0.d + p1.d) > 0;
      ctx.beginPath();
      ctx.moveTo(p0.sx, p0.sy);
      ctx.lineTo(p1.sx, p1.sy);
      ctx.strokeStyle = front ? "rgba(167,139,250,0.60)" : "rgba(139,92,246,0.15)";
      ctx.lineWidth   = front ? 1.3 : 0.6;
      ctx.stroke();
    }

    // Meridians at 0°, 90°, 180°, 270°
    [0, 90, 180, 270].forEach(d => drawMeridian(d * Math.PI / 180));

    // ── Axes & labels ─────────────────────────────────────────────────
    const POLES: { b: [number,number,number]; label: string }[] = [
      { b: [ 0,  0,  1], label: "|0⟩"  },
      { b: [ 0,  0, -1], label: "|1⟩"  },
      { b: [ 1,  0,  0], label: "|+⟩"  },
      { b: [-1,  0,  0], label: "|−⟩"  },
      { b: [ 0,  1,  0], label: "|i⟩"  },
      { b: [ 0, -1,  0], label: "|-i⟩" },
    ];

    POLES.forEach(({ b, label }) => {
      const pole = proj(b[0], b[1], b[2]);
      const tip  = proj(b[0] * 1.22, b[1] * 1.22, b[2] * 1.22);
      const base = proj(-b[0] * 0.08, -b[1] * 0.08, -b[2] * 0.08);
      const front = pole.d >= 0;

      ctx.beginPath();
      ctx.moveTo(base.sx, base.sy);
      ctx.lineTo(pole.sx, pole.sy);
      ctx.strokeStyle = front ? "rgba(167,139,250,0.55)" : "rgba(139,92,246,0.18)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      ctx.fillStyle     = front ? "rgba(221,196,255,0.95)" : "rgba(139,92,246,0.45)";
      ctx.font          = "bold 11px 'SF Mono', ui-monospace, monospace";
      ctx.textAlign     = "center";
      ctx.textBaseline  = "middle";
      ctx.fillText(label, tip.sx, tip.sy);
    });

    // ── State vector ──────────────────────────────────────────────────
    const bx  = Math.sin(theta) * Math.cos(phi);
    const by  = Math.sin(theta) * Math.sin(phi);
    const bz  = Math.cos(theta);
    const tip = proj(bx, by, bz);
    const eq  = proj(bx, by, 0);    // equatorial projection point

    // Dashed projection helpers
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(eq.sx, eq.sy);
    ctx.strokeStyle = "rgba(168,85,247,0.32)";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(eq.sx, eq.sy);
    ctx.lineTo(tip.sx, tip.sy);
    ctx.strokeStyle = "rgba(168,85,247,0.22)";
    ctx.stroke();

    ctx.setLineDash([]);

    // Arrow — glowing shaft
    ctx.shadowColor = "#9333ea";
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.sx, tip.sy);
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth   = 2.5;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Arrowhead
    const adx = tip.sx - cx, ady = tip.sy - cy;
    const alen = Math.sqrt(adx * adx + ady * ady);
    if (alen > 6) {
      const ux = adx / alen, uy = ady / alen;
      ctx.beginPath();
      ctx.moveTo(tip.sx, tip.sy);
      ctx.lineTo(tip.sx - ux * 13 + uy * 5, tip.sy - uy * 13 - ux * 5);
      ctx.lineTo(tip.sx - ux * 13 - uy * 5, tip.sy - uy * 13 + ux * 5);
      ctx.closePath();
      ctx.fillStyle  = "#c084fc";
      ctx.shadowColor = "#9333ea";
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    // Tip dot
    ctx.beginPath();
    ctx.arc(tip.sx, tip.sy, 5.5, 0, 2 * Math.PI);
    ctx.fillStyle   = "#ede9fe";
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur  = 16;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Equatorial projection dot
    ctx.beginPath();
    ctx.arc(eq.sx, eq.sy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(168,85,247,0.45)";
    ctx.fill();

    // Centre dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fill();

  }, [theta, phi]);

  const cosHalf = Math.cos(theta / 2).toFixed(2);
  const sinHalf = Math.sin(theta / 2).toFixed(2);
  const phiDeg  = Math.round((phi * 180) / Math.PI) % 360;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => { setTheta(p.theta); setPhi(p.phi); }}
            className="px-3 py-1.5 rounded-lg text-sm mono bg-purple-900/40 border border-purple-500/30 text-white hover:bg-purple-800/50 cursor-pointer transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-xl bg-[#0c0a1e] border border-purple-500/20"
        style={{ height: 300 }}
      />

      <p className="mono text-center text-sm text-purple-300 tracking-wide">
        |ψ⟩ = {cosHalf}|0⟩ + e^(i{phiDeg}°)·{sinHalf}|1⟩
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28 shrink-0">
            θ (polar): {Math.round(theta * 180 / Math.PI)}°
          </span>
          <input type="range" min={0} max={Math.PI} step={0.01} value={theta}
            onChange={e => setTheta(+e.target.value)}
            className="flex-1 accent-purple-500" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60 w-28 shrink-0">
            φ (azimuthal): {phiDeg}°
          </span>
          <input type="range" min={0} max={2 * Math.PI} step={0.01} value={phi}
            onChange={e => setPhi(+e.target.value)}
            className="flex-1 accent-purple-500" />
        </div>
      </div>
    </div>
  );
}
