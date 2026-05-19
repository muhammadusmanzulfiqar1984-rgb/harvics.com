'use client'

import React, { useEffect, useRef, useState } from 'react'

/* ============================================================
   HARVICS — Cinematic Supply Chain Section
   Brand tokens:
     bg     #06080a
     maroon #7B1C2E
     gold   #C9A84C
     white  #ffffff
   ============================================================ */

const BG = '#06080a'
const MAROON = '#7B1C2E'
const GOLD = '#C9A84C'

type StageNode = {
  id: string
  label: string
  metric: string
  value: number   // 0-100 bar fill
  desc: string
}

const NODES: StageNode[] = [
  { id: 'sourcing',     label: 'Sourcing',         metric: 'Suppliers',     value: 92, desc: 'Global supplier network across 47 countries with real-time qualification scoring.' },
  { id: 'procurement',  label: 'Procurement',      metric: 'PO Cycle',      value: 78, desc: 'AI-driven PO routing cuts cycle time by 41% across raw material classes.' },
  { id: 'inbound',      label: 'Inbound Logistics',metric: 'On-Time Recv.', value: 88, desc: 'Predictive ETA on every container — port to gate, hour-level accuracy.' },
  { id: 'warehouse',    label: 'Warehousing',      metric: 'Slot Util.',    value: 84, desc: 'Dynamic bin allocation. Robotic put-away orchestrated by HARVICS WMS.' },
  { id: 'production',   label: 'Production',       metric: 'OEE',           value: 81, desc: 'Line OEE telemetry streamed every 2 seconds with anomaly auto-flag.' },
  { id: 'quality',      label: 'Quality',          metric: 'First-Pass',    value: 96, desc: 'Vision-AI inspection on every unit. Defect signatures learned per SKU.' },
  { id: 'packaging',    label: 'Packaging',        metric: 'Throughput',    value: 89, desc: 'Adaptive packaging line — auto-switch SKUs in under 90 seconds.' },
  { id: 'outbound',     label: 'Outbound',         metric: 'Dock Time',     value: 76, desc: 'Smart dock scheduling pairs trucks to lanes by carrier SLA.' },
  { id: 'distribution', label: 'Distribution',     metric: 'Fill Rate',     value: 93, desc: 'Multi-echelon distribution with daily replenishment optimization.' },
  { id: 'transport',    label: 'Transport',        metric: 'Route Eff.',    value: 87, desc: 'Live fleet telematics + dynamic re-routing for fuel + ETA.' },
  { id: 'lastmile',     label: 'Last Mile',        metric: 'DIFOT',         value: 91, desc: 'Last-mile orchestration across 3PL and own fleet — single pane.' },
  { id: 'retail',       label: 'Retail / B2B',     metric: 'Shelf Avail.',  value: 85, desc: 'Sell-through and shelf availability tracked SKU × store × day.' },
  { id: 'returns',      label: 'Returns',          metric: 'Recovery',      value: 72, desc: 'Reverse-logistics graph routes returns to nearest refurb / disposal node.' },
  { id: 'analytics',    label: 'Insights',         metric: 'Coverage',      value: 99, desc: 'Every event, every node, every minute — fed into HARVICS AI Engine.' },
]

const STREAMS = [
  { tag: 'Cold Chain',    hint: 'Temperature-controlled lane with 0–8°C continuous telemetry.' },
  { tag: 'Cross-Dock',    hint: 'Zero-storage transfer — inbound truck to outbound truck under 4h.' },
  { tag: 'Just-In-Time',  hint: 'Synchronized material flow tied to production takt time.' },
  { tag: 'Reverse Flow',  hint: 'Returns, recalls, and refurbishment loop into circular supply.' },
]

export default function SupplyChainSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const wheelRef = useRef<HTMLDivElement | null>(null)
  const [activeNode, setActiveNode] = useState<string>(NODES[0].id)
  const [hoverStream, setHoverStream] = useState<number | null>(null)

  const active = NODES.find(n => n.id === activeNode) || NODES[0]

  /* ---------- Cinematic canvas backdrop ---------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Drifting cargo containers
    type Container = { x: number; y: number; w: number; h: number; vx: number; hue: string; alpha: number }
    const containers: Container[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * 1600 - 200,
      y: Math.random() * 600 + 40,
      w: 60 + Math.random() * 90,
      h: 22 + Math.random() * 14,
      vx: 0.15 + Math.random() * 0.45,
      hue: Math.random() > 0.55 ? MAROON : GOLD,
      alpha: 0.06 + Math.random() * 0.12,
    }))

    // Trade-route paths (gold data particles flow along these sine curves)
    const routes = [
      { yBase: 120, amp: 30, period: 380, speed: 0.6 },
      { yBase: 240, amp: 50, period: 460, speed: 0.4 },
      { yBase: 380, amp: 40, period: 320, speed: 0.7 },
      { yBase: 500, amp: 55, period: 540, speed: 0.35 },
    ]

    type Particle = { t: number; route: number; speed: number; size: number; alpha: number }
    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      t: Math.random() * 2000,
      route: Math.floor(Math.random() * routes.length),
      speed: 0.6 + Math.random() * 1.6,
      size: 1 + Math.random() * 2.2,
      alpha: 0.4 + Math.random() * 0.6,
    }))

    // Floating stage labels (drift across like ghost text)
    const STAGE_WORDS = ['SOURCE', 'MOVE', 'STORE', 'MAKE', 'INSPECT', 'SHIP', 'DELIVER', 'SENSE']
    type FloatLabel = { x: number; y: number; vx: number; text: string; alpha: number; size: number }
    const labels: FloatLabel[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * 1400 - 200,
      y: 80 + Math.random() * 500,
      vx: 0.08 + Math.random() * 0.22,
      text: STAGE_WORDS[Math.floor(Math.random() * STAGE_WORDS.length)],
      alpha: 0.04 + Math.random() * 0.06,
      size: 40 + Math.random() * 80,
    }))

    let t0 = performance.now()
    const draw = (now: number) => {
      const dt = Math.min(40, now - t0)
      t0 = now

      // Base fade — slight trail so particles ribbon
      ctx.fillStyle = 'rgba(6,8,10,0.35)'
      ctx.fillRect(0, 0, W, H)

      // Maroon ambient glow blobs
      const g1 = ctx.createRadialGradient(W * 0.15, H * 0.3, 20, W * 0.15, H * 0.3, 360)
      g1.addColorStop(0, 'rgba(123,28,46,0.35)')
      g1.addColorStop(1, 'rgba(123,28,46,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      const g2 = ctx.createRadialGradient(W * 0.85, H * 0.75, 20, W * 0.85, H * 0.75, 400)
      g2.addColorStop(0, 'rgba(201,168,76,0.18)')
      g2.addColorStop(1, 'rgba(201,168,76,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      // Floating stage labels
      labels.forEach(l => {
        l.x += l.vx * (dt / 16)
        if (l.x > W + 300) {
          l.x = -300
          l.y = 80 + Math.random() * (H - 160)
          l.text = STAGE_WORDS[Math.floor(Math.random() * STAGE_WORDS.length)]
        }
        ctx.save()
        ctx.globalAlpha = l.alpha
        ctx.fillStyle = GOLD
        ctx.font = `700 ${l.size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto`
        ctx.fillText(l.text, l.x, l.y)
        ctx.restore()
      })

      // Drifting cargo containers
      containers.forEach(c => {
        c.x += c.vx * (dt / 16)
        if (c.x > W + 200) {
          c.x = -c.w - 50
          c.y = Math.random() * (H - 80) + 40
        }
        ctx.save()
        ctx.globalAlpha = c.alpha
        ctx.strokeStyle = c.hue
        ctx.lineWidth = 1
        ctx.fillStyle = c.hue
        ctx.fillRect(c.x, c.y, c.w, c.h)
        // container ridges
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'
        for (let i = 1; i < 6; i++) {
          const rx = c.x + (c.w / 6) * i
          ctx.beginPath()
          ctx.moveTo(rx, c.y)
          ctx.lineTo(rx, c.y + c.h)
          ctx.stroke()
        }
        ctx.restore()
      })

      // Trade routes (thin gold sine lines)
      routes.forEach((r, ri) => {
        ctx.save()
        ctx.strokeStyle = 'rgba(201,168,76,0.10)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = 0; x <= W; x += 8) {
          const y = r.yBase + Math.sin((x + now * 0.03 * r.speed) / r.period * Math.PI * 2) * r.amp
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
        void ri
      })

      // Gold data particles flowing along routes
      particles.forEach(p => {
        p.t += p.speed * (dt / 16) * 4
        const r = routes[p.route]
        const x = (p.t % (W + 200)) - 100
        const y = r.yBase + Math.sin((x + now * 0.03 * r.speed) / r.period * Math.PI * 2) * r.amp
        ctx.save()
        ctx.globalAlpha = p.alpha
        const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4)
        grad.addColorStop(0, GOLD)
        grad.addColorStop(1, 'rgba(201,168,76,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff8d6'
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Subtle scanline
      ctx.save()
      ctx.globalAlpha = 0.04
      ctx.fillStyle = GOLD
      const scanY = (now * 0.05) % H
      ctx.fillRect(0, scanY, W, 1)
      ctx.restore()

      // Vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(0,0,0,0.65)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  /* ---------- Rotating wheel geometry ---------- */
  const wheelSize = 520
  const radius = wheelSize / 2 - 60
  const center = wheelSize / 2

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: BG, minHeight: 760, color: '#fff' }}
    >
      {/* Cinematic canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: 'block' }}
      />

      {/* Top gradient sheen */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(123,28,46,0.35) 0%, rgba(6,8,10,0) 100%)' }}
      />

      {/* Bottom maroon edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-[11px] tracking-[0.4em] mb-3"
            style={{ color: GOLD }}
          >
            HARVICS — SUPPLY CHAIN OS
          </p>
          <h2
            className="text-4xl lg:text-6xl font-light leading-tight"
            style={{ color: '#fff', letterSpacing: '-0.02em' }}
          >
            One spine. <span style={{ color: GOLD, fontWeight: 600 }}>Fourteen stages.</span>
            <br />
            <span style={{ color: '#fff', opacity: 0.65 }}>Zero blind spots.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm lg:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
            A single command surface for every node, every flow, every signal — from raw source to shelf and back again.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-start">
          {/* ---------- LEFT: Rotating Wheel ---------- */}
          <div className="relative flex items-center justify-center">
            <div
              ref={wheelRef}
              className="relative"
              style={{ width: wheelSize, height: wheelSize, maxWidth: '100%' }}
            >
              {/* Outer halo */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${MAROON}22 0%, transparent 70%)`,
                  filter: 'blur(12px)',
                }}
              />

              {/* Rotating rings (spin slowly) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${GOLD}55`,
                  animation: 'sc-spin 60s linear infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: 28,
                  border: `1px dashed ${GOLD}33`,
                  animation: 'sc-spin-rev 80s linear infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: 56,
                  border: `1px solid ${MAROON}88`,
                }}
              />

              {/* Center hub */}
              <div
                className="absolute rounded-full flex flex-col items-center justify-center text-center"
                style={{
                  inset: '38%',
                  background: `radial-gradient(circle, ${MAROON} 0%, ${BG} 80%)`,
                  border: `1px solid ${GOLD}`,
                  boxShadow: `0 0 40px ${MAROON}88, inset 0 0 20px ${GOLD}33`,
                }}
              >
                <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.3em' }}>HARVICS</p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 2 }}>CORE</p>
              </div>

              {/* Node ring — counter-spinning container so labels stay upright while ring rotates */}
              <div
                className="absolute inset-0"
                style={{ animation: 'sc-spin 90s linear infinite' }}
              >
                {NODES.map((n, i) => {
                  const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2
                  const x = center + Math.cos(angle) * radius
                  const y = center + Math.sin(angle) * radius
                  const isActive = n.id === activeNode
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onMouseEnter={() => setActiveNode(n.id)}
                      onFocus={() => setActiveNode(n.id)}
                      onClick={() => setActiveNode(n.id)}
                      className="absolute flex items-center justify-center group"
                      style={{
                        left: x,
                        top: y,
                        transform: 'translate(-50%, -50%)',
                        animation: 'sc-spin-rev 90s linear infinite', // counter-rotate so text stays upright
                      }}
                    >
                      <span
                        className="block rounded-full transition-all"
                        style={{
                          width: isActive ? 16 : 10,
                          height: isActive ? 16 : 10,
                          background: isActive ? GOLD : '#ffffff',
                          boxShadow: isActive
                            ? `0 0 18px ${GOLD}, 0 0 4px ${GOLD}`
                            : `0 0 6px rgba(255,255,255,0.5)`,
                          border: isActive ? `2px solid ${MAROON}` : '1px solid rgba(255,255,255,0.4)',
                        }}
                      />
                      <span
                        className="absolute whitespace-nowrap text-[10px] tracking-wider uppercase pointer-events-none"
                        style={{
                          top: 22,
                          color: isActive ? GOLD : 'rgba(255,255,255,0.7)',
                          fontWeight: isActive ? 700 : 500,
                          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                        }}
                      >
                        {n.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Pulse ring at active node — drawn as overlay */}
              <ActivePulse activeId={activeNode} center={center} radius={radius} />
            </div>
          </div>

          {/* ---------- RIGHT: Live Stage Metrics ---------- */}
          <div>
            <div
              className="relative rounded-md p-6 lg:p-8"
              style={{
                background: 'rgba(10,12,14,0.72)',
                border: `1px solid ${GOLD}33`,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.3em]" style={{ color: GOLD }}>LIVE STAGE METRICS</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Hover a wheel node to inspect
                  </p>
                </div>
                <span
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                  />
                  Streaming
                </span>
              </div>

              {/* Metric rows */}
              <div className="space-y-2.5">
                {NODES.map(n => {
                  const isActive = n.id === activeNode
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onMouseEnter={() => setActiveNode(n.id)}
                      onFocus={() => setActiveNode(n.id)}
                      className="w-full text-left group transition-all"
                      style={{
                        padding: '8px 10px',
                        borderRadius: 4,
                        background: isActive ? `${MAROON}33` : 'transparent',
                        borderLeft: `2px solid ${isActive ? GOLD : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-xs"
                          style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.78)', fontWeight: isActive ? 600 : 400 }}
                        >
                          {n.label}
                        </span>
                        <span
                          className="text-[10px] tabular-nums tracking-wider"
                          style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.5)' }}
                        >
                          {n.metric} · <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{n.value}%</span>
                        </span>
                      </div>
                      <div
                        className="relative h-[3px] rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.07)' }}
                      >
                        <div
                          style={{
                            width: `${n.value}%`,
                            height: '100%',
                            background: isActive
                              ? `linear-gradient(90deg, ${MAROON}, ${GOLD})`
                              : `linear-gradient(90deg, ${MAROON}88, ${GOLD}aa)`,
                            transition: 'width 1.2s cubic-bezier(.2,.8,.2,1)',
                            boxShadow: isActive ? `0 0 8px ${GOLD}88` : 'none',
                          }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active node description panel */}
              <div
                className="mt-5 p-4 rounded"
                style={{
                  background: `linear-gradient(135deg, ${MAROON}40, rgba(6,8,10,0.6))`,
                  border: `1px solid ${GOLD}44`,
                  minHeight: 90,
                }}
                key={active.id}
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-sm font-semibold" style={{ color: GOLD }}>{active.label}</p>
                  <p className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {active.metric.toUpperCase()} · {active.value}%
                  </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {active.desc}
                </p>
              </div>

              {/* Stream tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {STREAMS.map((s, i) => (
                  <button
                    key={s.tag}
                    type="button"
                    onMouseEnter={() => setHoverStream(i)}
                    onMouseLeave={() => setHoverStream(null)}
                    onFocus={() => setHoverStream(i)}
                    onBlur={() => setHoverStream(null)}
                    className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded transition-all"
                    style={{
                      color: hoverStream === i ? BG : GOLD,
                      background: hoverStream === i ? GOLD : 'transparent',
                      border: `1px solid ${GOLD}66`,
                      fontWeight: 600,
                    }}
                  >
                    {s.tag}
                  </button>
                ))}
              </div>

              {hoverStream !== null && (
                <p
                  className="mt-3 text-xs"
                  style={{ color: 'rgba(255,255,255,0.7)', borderLeft: `2px solid ${GOLD}`, paddingLeft: 10 }}
                >
                  {STREAMS[hoverStream].hint}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes sc-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes sc-spin-rev {
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </section>
  )
}

/* ---------- Active node pulse ring overlay ---------- */
function ActivePulse({
  activeId,
  center,
  radius,
}: {
  activeId: string
  center: number
  radius: number
}) {
  const idx = NODES.findIndex(n => n.id === activeId)
  if (idx < 0) return null
  // Position calculated against the same rotating ring transform — the parent ring rotates,
  // so we render the pulse inside the same rotating group. To keep things simple we render a
  // static halo on the wheel center instead (the ring nodes themselves already glow when active).
  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: center,
        top: center,
        width: radius * 2,
        height: radius * 2,
        transform: 'translate(-50%, -50%)',
        border: `1px solid ${GOLD}22`,
        animation: 'sc-spin 120s linear infinite',
      }}
    />
  )
}
