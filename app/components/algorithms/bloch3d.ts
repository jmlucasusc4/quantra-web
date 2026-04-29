// Shared 3D Bloch sphere rendering — orthographic projection with view rotation

export type Vec3 = [number, number, number];

/** Rotate around Z by az, then around X by el */
function rotate(v: Vec3, az: number, el: number): Vec3 {
  const c1 = Math.cos(az), s1 = Math.sin(az);
  const x1 = v[0]*c1 - v[1]*s1;
  const y1 = v[0]*s1 + v[1]*c1;
  const z1 = v[2];
  const c2 = Math.cos(el), s2 = Math.sin(el);
  return [x1, y1*c2 - z1*s2, y1*s2 + z1*c2];
}

/** Project a Bloch 3-vector to canvas pixel coords + depth */
export function proj(v: Vec3, az: number, el: number, cx: number, cy: number, r: number) {
  const [x, , z] = rotate(v, az, el);
  const y2 = rotate(v, az, el)[1];
  return { sx: cx + r*x, sy: cy - r*z, depth: y2 }; // depth > 0 = away from viewer
}

export interface BlochDrawOpts {
  theta:     number;       // polar angle of state vector
  phi:       number;       // azimuthal angle of state vector
  az:        number;       // view azimuth
  el:        number;       // view elevation
  collapsed?: boolean;     // true = bright arrow; false = faded superposition
  tint?:     string;       // arrow hex color
  label?:    string;       // qubit label drawn top-center
}

const N = 72; // grid resolution

export function drawBloch(canvas: HTMLCanvasElement, opts: BlochDrawOpts) {
  const { theta, phi, az, el, collapsed = true, tint = "#c084fc", label = "" } = opts;

  const ctx = canvas.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const r  = Math.min(W, H) / 2 - 34;
  const p  = (v: Vec3) => proj(v, az, el, cx, cy, r);

  // ── Sphere fill ──────────────────────────────────────────────────────
  const grd = ctx.createRadialGradient(cx-r*0.28, cy-r*0.3, r*0.04, cx, cy, r);
  grd.addColorStop(0,    "rgba(109,40,217,0.25)");
  grd.addColorStop(0.60, "rgba(46,16,101,0.16)");
  grd.addColorStop(1,    "rgba(10,5,30,0.55)");
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = grd; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(139,92,246,0.45)"; ctx.lineWidth = 1.3; ctx.stroke();

  // ── Grid ─────────────────────────────────────────────────────────────
  function drawCircle(pts: Vec3[], major: boolean) {
    for (let i = 0; i < pts.length; i++) {
      const a = p(pts[i]), b = p(pts[(i+1) % pts.length]);
      const front = (a.depth + b.depth) < 0;
      const alpha = front
        ? (major ? 0.65 : 0.22)
        : (major ? 0.14 : 0.05);
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
      ctx.strokeStyle = major ? `rgba(167,139,250,${alpha})` : `rgba(139,92,246,${alpha})`;
      ctx.lineWidth = major ? 1.3 : 0.65; ctx.stroke();
    }
  }

  // Latitude rings
  for (const deg of [-60, -30, 0, 30, 60]) {
    const lat = deg * Math.PI / 180;
    const cosL = Math.cos(lat), sinL = Math.sin(lat);
    const pts = Array.from({length: N}, (_, i) => {
      const t = (i/N)*2*Math.PI;
      return [cosL*Math.cos(t), cosL*Math.sin(t), sinL] as Vec3;
    });
    drawCircle(pts, deg === 0);
  }

  // Meridians
  for (const deg of [0, 45, 90, 135]) {
    const lon = deg * Math.PI / 180;
    const pts = Array.from({length: N}, (_, i) => {
      const t = (i/N)*2*Math.PI;
      return [Math.sin(t)*Math.cos(lon), Math.sin(t)*Math.sin(lon), Math.cos(t)] as Vec3;
    });
    drawCircle(pts, false);
  }

  // ── Axis labels ───────────────────────────────────────────────────────
  const POLES: [Vec3, string][] = [
    [[0,0,1],  "|0⟩"],  [[0,0,-1], "|1⟩"],
    [[1,0,0],  "|+⟩"],  [[-1,0,0], "|−⟩"],
    [[0,1,0],  "|i⟩"],  [[0,-1,0], "|-i⟩"],
  ];
  ctx.font = "bold 11px 'SF Mono', ui-monospace, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const [v, lbl] of POLES) {
    const tip = p(v);
    const lpt = p([v[0]*1.24, v[1]*1.24, v[2]*1.24] as Vec3);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tip.sx, tip.sy);
    ctx.strokeStyle = tip.depth < 0 ? "rgba(167,139,250,0.5)" : "rgba(139,92,246,0.15)";
    ctx.lineWidth = 0.9; ctx.stroke();
    const alpha = Math.max(0.2, Math.min(1, 1 - lpt.depth * 1.1));
    ctx.fillStyle = `rgba(221,196,255,${alpha.toFixed(2)})`;
    ctx.fillText(lbl, lpt.sx, lpt.sy);
  }

  // ── State vector ──────────────────────────────────────────────────────
  const bx  = Math.sin(theta)*Math.cos(phi);
  const by  = Math.sin(theta)*Math.sin(phi);
  const bz  = Math.cos(theta);
  const vtip = p([bx, by, bz]);
  const veq  = p([bx, by, 0]);
  const alf  = collapsed ? 1.0 : 0.38;

  ctx.setLineDash([4,4]); ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(cx, cy);    ctx.lineTo(veq.sx, veq.sy);
  ctx.strokeStyle = `rgba(168,85,247,${(0.28*alf).toFixed(2)})`; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(veq.sx, veq.sy); ctx.lineTo(vtip.sx, vtip.sy);
  ctx.strokeStyle = `rgba(168,85,247,${(0.18*alf).toFixed(2)})`; ctx.stroke();
  ctx.setLineDash([]);

  const arrowColor = collapsed ? tint : `rgba(192,132,252,${alf.toFixed(2)})`;
  ctx.shadowColor = "#9333ea"; ctx.shadowBlur = collapsed ? 18 : 6;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vtip.sx, vtip.sy);
  ctx.strokeStyle = arrowColor; ctx.lineWidth = 2.5; ctx.stroke(); ctx.shadowBlur = 0;

  const adx = vtip.sx-cx, ady = vtip.sy-cy;
  const alen = Math.sqrt(adx*adx + ady*ady);
  if (alen > 8) {
    const ux = adx/alen, uy = ady/alen;
    ctx.beginPath();
    ctx.moveTo(vtip.sx, vtip.sy);
    ctx.lineTo(vtip.sx - ux*13 + uy*5, vtip.sy - uy*13 - ux*5);
    ctx.lineTo(vtip.sx - ux*13 - uy*5, vtip.sy - uy*13 + ux*5);
    ctx.closePath();
    ctx.fillStyle = arrowColor;
    ctx.shadowColor = "#9333ea"; ctx.shadowBlur = collapsed ? 10 : 4;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  ctx.beginPath(); ctx.arc(vtip.sx, vtip.sy, 5, 0, Math.PI*2);
  ctx.fillStyle = collapsed ? "#ede9fe" : `rgba(237,233,254,${alf.toFixed(2)})`;
  ctx.shadowColor = "#a855f7"; ctx.shadowBlur = collapsed ? 14 : 4;
  ctx.fill(); ctx.shadowBlur = 0;

  ctx.beginPath(); ctx.arc(veq.sx, veq.sy, 2.5, 0, Math.PI*2);
  ctx.fillStyle = `rgba(168,85,247,${(0.45*alf).toFixed(2)})`; ctx.fill();

  ctx.beginPath(); ctx.arc(cx, cy, 2.8, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.fill();

  // Optional qubit label
  if (label) {
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(167,139,250,0.70)";
    ctx.fillText(label, W/2, 6);
  }
}
