'use client'
import { useEffect, useRef } from 'react'

export function LaserBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let raf: number
    let t = 0
    let mx = 0.5, my = 0.5   // smoothed mouse (normalised 0-1)
    let tmx = 0.5, tmy = 0.5  // target mouse

    /* ── resize ── */
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
    }

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      tmx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
      tmy = Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height))
    }

    /* ── helpers ── */
    const glowLine = (
      x1: number, y1: number, x2: number, y2: number,
      rr: number, gg: number, bb: number,
      alpha: number, w: number,
    ) => {
      ctx.save()
      ctx.shadowColor = `rgb(${rr},${gg},${bb})`
      ctx.lineCap = 'round'

      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
      ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha * 0.12})`
      ctx.lineWidth = w * 12; ctx.shadowBlur = 50; ctx.stroke()

      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
      ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha * 0.45})`
      ctx.lineWidth = w * 3;  ctx.shadowBlur = 18; ctx.stroke()

      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
      ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`
      ctx.lineWidth = w;      ctx.shadowBlur = 4;  ctx.stroke()

      ctx.restore()
    }

    const glowDot = (x: number, y: number, r: number, a: number) => {
      ctx.save()
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle   = `rgba(130,255,130,${a})`
      ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 22
      ctx.fill(); ctx.restore()
    }

    /* ── main loop ── */
    const frame = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight

      // ease toward mouse
      mx += (tmx - mx) * 0.04
      my += (tmy - my) * 0.04

      // dark trail
      ctx.fillStyle = 'rgba(0,0,0,0.17)'
      ctx.fillRect(0, 0, W, H)

      // vanishing point — shifts with mouse
      const vx = W * (0.20 + mx * 0.38)
      const vy = H * (0.26 + my * 0.30)

      /* 1 ── radial fan from vanishing point → floor */
      for (let i = 0; i < 24; i++) {
        const p  = i / 23
        const ex = -W * 0.2 + p * W * 1.4
        const ey = H * 1.08
        if (ey <= vy) continue
        const pulse = 0.45 + 0.55 * Math.sin(t * 0.5 + i * 0.7)
        glowLine(vx, vy, ex, ey, 0, 210, 65, pulse * 0.16, 0.6)
      }

      /* 2 ── horizontal floor lines (perspective spacing) */
      for (let i = 0; i < 15; i++) {
        const p   = i / 14
        const y   = vy + (H * 1.05 - vy) * Math.pow(p, 0.52)
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.85 + i * 0.6)
        const a   = (0.16 + pulse * 0.18) * (1 - p * 0.35)
        glowLine(-W * 0.05, y, W * 1.05, y, 0, 200, 60, a, 0.6)
        // travelling spark
        const px = ((t * 88 + i * 79) % (W * 1.3)) - W * 0.15
        glowDot(px, y, 2, pulse * 0.72)
      }

      /* 3 ── vertical bars (right half — like the image) */
      for (let i = 0; i < 9; i++) {
        const p   = i / 8
        const bx  = W * (0.46 + p * 0.51) + (mx - 0.5) * W * 0.07
        const hf  = 0.06 + 0.16 * Math.abs(Math.sin(t * 0.28 + i * 1.12 + 0.5))
        const topY = vy - H * hf
        const pulse = 0.45 + 0.55 * Math.sin(t * 0.52 + i * 0.88)
        glowLine(bx, vy, bx, topY, 0, 255, 80, 0.25 + pulse * 0.30, 1.2)
        glowDot(bx, topY, 2.5, pulse * 0.85)
      }

      t  += 0.012
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMouse)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
