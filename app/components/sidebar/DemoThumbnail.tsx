'use client'

import { useEffect, useRef } from 'react'

// ─── Color constants (match the Swift app palette) ────────────────────────────
const A = [159, 82,  255] as const  // accent purple
const B = [77,  153, 255] as const  // blue

const S = 30  // canvas logical size in px

function rgb(c: readonly [number, number, number], a = 1) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`
}

// ─── Canvas primitives ────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  if (w <= 0 || h <= 0) return
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
}

// ─── Per-algorithm draw functions ─────────────────────────────────────────────

function drawSuperposition(ctx: CanvasRenderingContext2D, t: number) {
  const s = Math.sin(t * Math.PI * 1.2)
  const maxH = S - 8, bottom = S - 4
  const h0 = (0.5 + s * 0.38) * maxH
  const h1 = (0.5 - s * 0.38) * maxH
  const barW = 5, gap = 3
  const x0 = (S - barW * 2 - gap) / 2, x1 = x0 + barW + gap

  ctx.fillStyle = rgb(A); roundRect(ctx, x0, bottom - h0, barW, h0, 2); ctx.fill()
  ctx.fillStyle = rgb(B); roundRect(ctx, x1, bottom - h1, barW, h1, 2); ctx.fill()
}

function drawEntanglement(ctx: CanvasRenderingContext2D, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2)
  const mid = S / 2, r = 3, lx = 6, rx = S - 6

  ctx.beginPath()
  ctx.moveTo(lx + r, mid)
  ctx.bezierCurveTo(S * 0.35, mid - 7 * pulse, S * 0.65, mid - 7 * pulse, rx - r, mid)
  ctx.strokeStyle = rgb(A, 0.35 + 0.55 * pulse)
  ctx.lineWidth = 1.2
  ctx.stroke()

  for (const [x, color] of [[lx, A], [rx, B]] as [[number, typeof A], [number, typeof B]]) {
    ctx.strokeStyle = rgb(color, 0.12 + 0.2 * pulse)
    ctx.lineWidth = 1; disc(ctx, x, mid, r + 2); ctx.stroke()
    ctx.fillStyle = rgb(color); disc(ctx, x, mid, r); ctx.fill()
  }
}

function drawBloch(ctx: CanvasRenderingContext2D, t: number) {
  const cx = S / 2, cy = S / 2, R = S / 2 - 3

  ctx.strokeStyle = rgb(A, 0.5); ctx.lineWidth = 1; disc(ctx, cx, cy, R); ctx.stroke()
  ctx.strokeStyle = rgb(A, 0.25); ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.35, 0, 0, Math.PI * 2); ctx.stroke()

  ctx.fillStyle = rgb(A, 0.4)
  disc(ctx, cx, cy - R, 1.5); ctx.fill()
  disc(ctx, cx, cy + R, 1.5); ctx.fill()

  const angle = t * Math.PI * 0.7
  const vx = cx + (R - 2) * Math.sin(angle) * 0.85
  const vy = cy - (R - 2) * Math.cos(angle * 0.6) * 0.85
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vx, vy)
  ctx.strokeStyle = rgb(A); ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillStyle = rgb(A); disc(ctx, vx, vy, 2); ctx.fill()
}

function drawTeleport(ctx: CanvasRenderingContext2D, t: number) {
  const cycle = (t % 2) / 2, mid = S / 2, r = 3

  ctx.beginPath(); ctx.moveTo(8, mid); ctx.lineTo(S - 8, mid)
  ctx.strokeStyle = rgb(A, 0.2); ctx.lineWidth = 1; ctx.stroke()

  const leftA  = cycle < 0.45 ? 1 - cycle / 0.45 : 0
  const rightA = cycle > 0.55 ? (cycle - 0.55) / 0.45 : 0
  const flashA = (cycle > 0.42 && cycle < 0.58)
    ? Math.max(0, 1 - Math.abs(cycle - 0.5) / 0.08) : 0

  if (leftA  > 0.01) { ctx.fillStyle = rgb(A, leftA);  disc(ctx, 8,     mid, r); ctx.fill() }
  if (rightA > 0.01) { ctx.fillStyle = rgb(B, rightA); disc(ctx, S - 8, mid, r); ctx.fill() }
  if (flashA > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${(flashA * 0.75).toFixed(3)})`
    disc(ctx, S / 2, mid, 5); ctx.fill()
  }
}

function drawSpeed(ctx: CanvasRenderingContext2D, t: number) {
  const c = (t % 3) / 3, maxH = S - 8, bottom = S - 4
  const qH = Math.min(c * 3, 1) * maxH, cH = c * maxH * 0.55
  const barW = 5, gap = 3, x0 = (S - barW * 2 - gap) / 2, x1 = x0 + barW + gap

  ctx.strokeStyle = rgb(B, 0.15); ctx.lineWidth = 1
  roundRect(ctx, x0, bottom - maxH, barW, maxH, 2); ctx.stroke()
  ctx.strokeStyle = rgb(A, 0.15)
  roundRect(ctx, x1, bottom - maxH, barW, maxH, 2); ctx.stroke()

  if (qH > 0) { ctx.fillStyle = rgb(B); roundRect(ctx, x0, bottom - qH, barW, qH, 2); ctx.fill() }
  if (cH > 0) { ctx.fillStyle = rgb(A, 0.65); roundRect(ctx, x1, bottom - cH, barW, cH, 2); ctx.fill() }
}

function drawGrover(ctx: CanvasRenderingContext2D, t: number) {
  const pts = [[S*.3,S*.3],[S*.7,S*.3],[S*.3,S*.7],[S*.7,S*.7]]
  const hit = Math.floor(t / 0.7) % 4
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4)

  for (let i = 0; i < 4; i++) {
    const [x, y] = pts[i], isHit = i === hit
    ctx.fillStyle = rgb(A, isHit ? 1 : 0.3)
    disc(ctx, x, y, isHit ? 3.5 : 2); ctx.fill()
    if (isHit) {
      ctx.strokeStyle = rgb(A, pulse * 0.8); ctx.lineWidth = 1
      disc(ctx, x, y, 6); ctx.stroke()
    }
  }
}

function drawBB84(ctx: CanvasRenderingContext2D, t: number) {
  const cellW = 7, speed = 10
  const offset = (t * speed) % cellW
  const bits = [true, false, true, true, false, false, true]

  for (let row = 0; row < 2; row++) {
    const y = S * (row === 0 ? 0.33 : 0.67)
    const rowBits = row === 0 ? bits : [...bits].reverse()
    for (let col = -1; col < 5; col++) {
      const x = col * cellW - offset + 3
      if (x <= 0 || x >= S - 8) continue
      const idx = ((col % bits.length) + bits.length) % bits.length
      const hw = 2.3
      if (rowBits[idx]) {
        ctx.fillStyle = rgb(A); ctx.beginPath()
        ctx.moveTo(x, y - hw); ctx.lineTo(x + hw, y)
        ctx.lineTo(x, y + hw); ctx.lineTo(x - hw, y)
        ctx.closePath(); ctx.fill()
      } else {
        ctx.fillStyle = rgb(B); disc(ctx, x, y, hw); ctx.fill()
      }
    }
  }

  const lx = S - 6, ly = S / 2
  ctx.strokeStyle = rgb(A, 0.7); ctx.lineWidth = 1
  roundRect(ctx, lx - 3.5, ly - 2, 7, 6, 1.5); ctx.stroke()
  ctx.beginPath(); ctx.arc(lx, ly - 2, 2.8, Math.PI, 0, false); ctx.stroke()
}

function drawOracle(ctx: CanvasRenderingContext2D, t: number) {
  const cycle = (t % 1.4) / 1.4, cx = S / 2, cy = S / 2, boxW = 10, boxH = 14

  ctx.strokeStyle = rgb(A, 0.7); ctx.lineWidth = 1
  roundRect(ctx, cx - boxW/2, cy - boxH/2, boxW, boxH, 2); ctx.stroke()

  for (let i = 0; i < 3; i++) {
    const p = (cycle + i * 0.33) % 1
    ctx.fillStyle = rgb(B, 0.5 + 0.5 * (1 - p))
    disc(ctx, 4 + p * (cx - boxW/2 - 4), cy - 4 + i * 4, 1.5); ctx.fill()
  }

  ctx.fillStyle = rgb(A, 0.5 + 0.5 * cycle)
  disc(ctx, cx + boxW/2 + cycle * (S - cx - boxW/2 - 4), cy, 2); ctx.fill()
}

function drawShor(ctx: CanvasRenderingContext2D, t: number) {
  const split = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.8)
  const cx = S / 2, cy = S / 2, R = 8

  for (let i = 0; i < 6; i++) {
    const base = i * Math.PI / 3 - Math.PI / 2
    const angle = base + (i < 3 ? -1 : 1) * split * 0.45
    ctx.fillStyle = rgb(i < 3 ? A : B)
    disc(ctx, cx + R * Math.cos(angle), cy + R * Math.sin(angle), 2.5); ctx.fill()
  }

  if (split > 0.5) {
    const a = (split - 0.5) / 0.5
    ctx.strokeStyle = `rgba(255,255,255,${(a * 0.18).toFixed(3)})`; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(cx, cy - 11); ctx.lineTo(cx, cy + 11); ctx.stroke()
  }
}

function drawShield(ctx: CanvasRenderingContext2D, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.5)
  const risk = 0.3 + 0.5 * pulse
  const cx = S / 2, cy = S / 2, w = 14, h = 16
  const rc = risk > 0.65 ? ([255, 80, 80] as const) : A

  const shield = new Path2D()
  shield.moveTo(cx, cy - h/2); shield.lineTo(cx + w/2, cy - h/2 + 4)
  shield.lineTo(cx + w/2, cy + 2)
  shield.bezierCurveTo(cx + w/2, cy + h/2 - 2, cx + 2, cy + h/2, cx, cy + h/2)
  shield.bezierCurveTo(cx - 2, cy + h/2, cx - w/2, cy + h/2 - 2, cx - w/2, cy + 2)
  shield.lineTo(cx - w/2, cy - h/2 + 4); shield.closePath()

  ctx.fillStyle = rgb(rc, 0.18 + risk * 0.28); ctx.fill(shield)
  ctx.strokeStyle = rgb(A, 0.75); ctx.lineWidth = 1; ctx.stroke(shield)

  ctx.fillStyle = rgb(rc, 0.9)
  roundRect(ctx, cx - 4, cy + 2, 8 * risk, 2, 1); ctx.fill()
}

function drawClock(ctx: CanvasRenderingContext2D, t: number) {
  const cx = S / 2, cy = S / 2, R = 10

  ctx.strokeStyle = rgb(A, 0.6); ctx.lineWidth = 1; disc(ctx, cx, cy, R); ctx.stroke()
  ctx.fillStyle = rgb(A, 0.5)
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2
    disc(ctx, cx + (R - 2.5) * Math.sin(a), cy - (R - 2.5) * Math.cos(a), 1); ctx.fill()
  }

  const angle = (t % 1) * Math.PI * 2 - Math.PI / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy); ctx.lineTo(cx + (R - 4) * Math.cos(angle), cy + (R - 4) * Math.sin(angle))
  ctx.strokeStyle = rgb(A); ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillStyle = rgb(A); disc(ctx, cx, cy, 1.5); ctx.fill()

  const wp = 0.5 + 0.5 * Math.sin(t * Math.PI * 3)
  ctx.fillStyle = `rgba(255,60,60,${(0.65 + 0.35 * wp).toFixed(3)})`
  disc(ctx, cx + R - 3, cy - R - 3, 3); ctx.fill()
}

function drawQRNG(ctx: CanvasRenderingContext2D, t: number) {
  const cols = 4, rows = 4, cw = (S - 4) / cols, ch = (S - 4) / rows
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const on = Math.sin(t * 3.1 + row * 7.3 + col * 13.7) > 0
      ctx.fillStyle = rgb(on ? A : B, on ? 0.85 : 0.18)
      disc(ctx, 2 + col * cw + cw / 2, 2 + row * ch + ch / 2, 2); ctx.fill()
    }
  }
}

function drawCircuit(ctx: CanvasRenderingContext2D, t: number) {
  ctx.strokeStyle = rgb(A, 0.35); ctx.lineWidth = 0.8
  for (const y of [S * 0.25, S * 0.5, S * 0.75]) {
    ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(S - 3, y); ctx.stroke()
  }
  const gx = 3 + ((t * 6) % (S - 10)), gy = S * 0.5
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4)
  ctx.fillStyle = rgb(A, 0.18 + 0.28 * pulse)
  roundRect(ctx, gx, gy - 5, 8, 10, 2); ctx.fill()
  ctx.strokeStyle = rgb(A, 0.8); ctx.lineWidth = 1
  roundRect(ctx, gx, gy - 5, 8, 10, 2); ctx.stroke()
}

function drawDefault(ctx: CanvasRenderingContext2D, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2)
  const cx = S / 2, cy = S / 2, angle = t * Math.PI * 1.2
  ctx.strokeStyle = rgb(A, 0.3); ctx.lineWidth = 1; disc(ctx, cx, cy, 8); ctx.stroke()
  ctx.fillStyle = rgb(A, 0.5 + 0.5 * pulse)
  disc(ctx, cx + 8 * Math.cos(angle), cy + 8 * Math.sin(angle), 2.5); ctx.fill()
}

// ─── Slug → draw function map ─────────────────────────────────────────────────

const DRAW: Record<string, (ctx: CanvasRenderingContext2D, t: number) => void> = {
  'superposition':          drawSuperposition,
  'entanglement':           drawEntanglement,
  'entangled-bloch-spheres':drawEntanglement,
  'bloch-sphere':           drawBloch,
  'deutsch-jozsa':          drawOracle,
  'qrng':                   drawQRNG,
  'password-analyzer':      drawShield,
  'classical-vs-quantum':   drawSpeed,
  'grovers-search':         drawGrover,
  'bb84-protocol':          drawBB84,
  'crystals-kyber':         drawBB84,
  'bernstein-vazirani':     drawOracle,
  'harvest-now':            drawClock,
  'circuit-builder':        drawCircuit,
  'quantum-risk-auditor':   drawShield,
  'cbom-generator':         drawOracle,
  'pqc-switch':             drawSpeed,
  'shors-algorithm':        drawShor,
  'quantum-teleportation':  drawTeleport,
  'simons-algorithm':       drawOracle,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DemoThumbnail({
  slug,
  locked,
  complete,
}: {
  slug: string
  locked: boolean
  complete: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const drawFn = DRAW[slug] ?? drawDefault

    function frame() {
      ctx!.clearRect(0, 0, S, S)
      drawFn(ctx!, performance.now() / 1000)
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [slug])

  return (
    <div style={{
      position: 'relative', width: S, height: S, flexShrink: 0,
      borderRadius: 7, overflow: 'hidden',
      background: locked ? 'rgba(159,82,255,0.07)' : 'rgba(159,82,255,0.15)',
      opacity: locked ? 0.4 : 1,
    }}>
      <canvas ref={canvasRef} width={S} height={S} style={{ display: 'block' }} />

      {/* Completion checkmark overlay */}
      {complete && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: 10, height: 10, borderRadius: '50%',
          background: '#10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 7, color: '#fff', lineHeight: 1,
        }}>
          ✓
        </div>
      )}
    </div>
  )
}
