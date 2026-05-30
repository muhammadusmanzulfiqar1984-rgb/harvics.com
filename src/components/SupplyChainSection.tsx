'use client'

import React, { useEffect, useRef, useState } from 'react'

/* ============================================================
   HARVICS — Supply Chain Map  (batcloud-inspired)

   Flat 2D circle. Inside: a swarm of gold particles forming
   organic strands (river-delta / mycelium feel). Particles
   continuously drift + flicker in place. Around the rim: 14
   stage labels set tangentially. Faint maroon radial dividers
   split the circle into 14 sectors.

   Hover a stage label → the particles in that sector glow
   brighter gold and drift more energetically. Rest dim.

   Safety:
     - canvas particles capped 2200
     - rAF gated by IntersectionObserver
     - no backdrop-filter, no ResizeObserver
     - section locked to one snap frame height
   ============================================================ */

const COLORS = {
  bgFrom: '#FFFFFF',
  bgTo: '#F4ECDB',
  goldBase: '#C3A35E',
  goldLight: '#E8C76A',
  goldDeep: '#8C6B1F',
  amber: '#D78A1B',
  maroon: '#6B1F2B',
  maroonDeep: '#4A1620',
  charcoal: '#3A2A2A',
}

const STAGES = [
  'Sourcing', 'Procurement', 'Inbound', 'Warehousing',
  'Production', 'Quality', 'Packaging', 'Outbound',
  'Distribution', 'Transport', 'Last Mile', 'Retail',
  'Returns', 'Insights',
]

// Map of which stage is currently being highlighted (from the rim labels).
// -1 means nothing hovered. Stored in a ref to avoid React re-renders inside rAF.

export default function SupplyChainSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const activeSectorRef = useRef<number>(-1)
  const [activeSector, setActiveSector] = useState<number>(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    let isVisible = false
    let cancelled = false

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(W * dpr))
      canvas.height = Math.max(1, Math.floor(H * dpr))
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ------ Particles (organic swarm: clusters + tendrils, not flat confetti) ------
    // We seed 70 anchor clusters spread around the circle; each particle is
    // assigned to a cluster and offset around it with falloff. This gives the
    // organic "river-delta / mycelium" look you see in batcloud.
    type P = {
      angle: number
      radiusUnit: number
      driftPhase: number
      flickerPhase: number
      flickerSpeed: number
      size: number
      baseAlpha: number
      sector: number
      brightness: number    // per-particle base brightness multiplier (creates tendril highlights)
    }
    const PARTICLE_COUNT = 2200
    const particles: P[] = new Array(PARTICLE_COUNT)
    const sectorCount = STAGES.length

    // 70 anchor clusters scattered across the disc
    const ANCHORS = 70
    const anchors: Array<{ a: number; r: number; b: number }> = []
    for (let k = 0; k < ANCHORS; k++) {
      anchors.push({
        a: Math.random() * Math.PI * 2,
        r: Math.pow(Math.random(), 0.45) * 0.88,    // bias toward outer 2/3
        b: 0.35 + Math.random() * 0.65,             // cluster brightness
      })
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Pick a random anchor; offset around it with gaussian-ish falloff
      const anchor = anchors[Math.floor(Math.random() * ANCHORS)]
      // Two-axis offset: tangential (along arc) + radial.
      // tangentialSigma is small → cluster stays tight; radialSigma
      // larger → tendrils stretch toward / away from center.
      const tang = (Math.random() + Math.random() + Math.random() - 1.5) * 0.18   // sum-of-3 ≈ gaussian
      const radl = (Math.random() + Math.random() + Math.random() - 1.5) * 0.13
      const a = anchor.a + tang
      let r = anchor.r + radl
      // keep particle inside the disc
      if (r < 0.04) r = 0.04 + Math.random() * 0.06
      if (r > 0.97) r = 0.97 - Math.random() * 0.06

      // Sector lookup: which of 14 sectors this particle's angle falls in.
      // Sector 0 starts at top (-π/2) and goes clockwise.
      const normalized = (((a + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const sectorIdx = Math.floor(normalized / (Math.PI * 2) * sectorCount) % sectorCount

      particles[i] = {
        angle: a,
        radiusUnit: r,
        driftPhase: Math.random() * Math.PI * 2,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.5 + Math.random() * 1.6,
        size: 0.5 + Math.random() * 1.1,
        baseAlpha: 0.28 + anchor.b * 0.35,           // cluster centers brighter
        sector: sectorIdx,
        brightness: anchor.b * (0.75 + Math.random() * 0.5),
      }
    }

    // ------ Continuous breathing wave ------
    // A wave-crest sweeps outward from center over WAVE_PERIOD_MS. Particles
    // get a brightness lift as the crest passes through their radiusUnit.
    // Two waves staggered for a continuous "pulse".
    const WAVE_PERIOD_MS = 4200
    const WAVE_WIDTH = 0.22    // fraction of radius the crest spans
    const WAVE_LIFT = 0.85     // alpha boost on crest

    // Smoothed sector glow ramp (so hover-on/off fades softly)
    const sectorGlow = new Float32Array(sectorCount)
    let lastNow = performance.now()

    const draw = (now: number) => {
      if (cancelled) return
      rafRef.current = requestAnimationFrame(draw)
      if (!isVisible) { lastNow = now; return }

      const dt = Math.min(64, now - lastNow)
      lastNow = now
      const time = now * 0.001

      // Smooth sector glow
      const active = activeSectorRef.current
      for (let s = 0; s < sectorCount; s++) {
        const target = s === active ? 1 : 0
        sectorGlow[s] += (target - sectorGlow[s]) * Math.min(1, dt / 220)
      }

      // ------ Background ------
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.55, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.8)
      bg.addColorStop(0, COLORS.bgTo)
      bg.addColorStop(1, COLORS.bgFrom)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // ------ Maroon halo ------
      const halo = ctx.createRadialGradient(W * 0.5, H * 0.55, 0, W * 0.5, H * 0.55, Math.min(W, H) * 0.55)
      halo.addColorStop(0, 'rgba(107,31,43,0.10)')
      halo.addColorStop(1, 'rgba(107,31,43,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, W, H)

      // ------ Geometry ------
      const cx = W * 0.5
      const cy = H * 0.55
      const R = Math.min(W * 0.46, H * 0.44)

      // ------ Outer circle outline ------
      ctx.save()
      ctx.strokeStyle = 'rgba(107,31,43,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // ------ 14 radial dividers ------
      ctx.save()
      ctx.strokeStyle = 'rgba(107,31,43,0.10)'
      ctx.lineWidth = 1
      for (let i = 0; i < sectorCount; i++) {
        const a = (i / sectorCount) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * R * 0.05, cy + Math.sin(a) * R * 0.05)
        ctx.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98)
        ctx.stroke()
      }
      ctx.restore()

      // ------ Particle swarm ------
      // Compute current wave crest positions (two waves, staggered).
      const wave1U = (now / WAVE_PERIOD_MS) % 1            // 0..1
      const wave2U = ((now / WAVE_PERIOD_MS) + 0.5) % 1

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i]
        const glow = sectorGlow[p.sector]   // 0..1

        // Drift around its home position. Hovered sector drifts harder.
        const driftAmp = 0.010 + glow * 0.022
        const angleDrift = Math.sin(time * 0.6 + p.driftPhase) * driftAmp
        const radiusDrift = Math.cos(time * 0.55 + p.driftPhase * 1.3) * driftAmp * 0.7
        const a = p.angle + angleDrift
        const rU = Math.max(0.02, Math.min(0.97, p.radiusUnit + radiusDrift))
        const r = R * rU
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r

        // Wave brightness: each crest contributes a lift when it passes
        // through this particle's radiusUnit. Smooth (quadratic) falloff.
        let waveAdd = 0
        const d1 = Math.abs(rU - wave1U)
        if (d1 < WAVE_WIDTH) { const k = 1 - d1 / WAVE_WIDTH; waveAdd += k * k * WAVE_LIFT }
        const d2 = Math.abs(rU - wave2U)
        if (d2 < WAVE_WIDTH) { const k = 1 - d2 / WAVE_WIDTH; waveAdd += k * k * WAVE_LIFT * 0.7 }

        // Flicker (per-particle twinkle)
        const flick = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * p.flickerSpeed + p.flickerPhase))

        // Sector dimming: if any sector is hovered, non-hovered sectors dim.
        const anyActive = active >= 0
        const dimMul = anyActive ? (0.30 + glow * 0.70) : 1

        // Final alpha: base * tendril brightness * flicker * wave * dim
        const alpha = Math.min(1, (p.baseAlpha + waveAdd * 0.55) * p.brightness * flick * dimMul)

        // Color: hovered sector → light gold; on-crest → amber-light; else gold base
        let color: string
        if (glow > 0.5) color = COLORS.goldLight
        else if (waveAdd > 0.5) color = COLORS.goldLight
        else if (waveAdd > 0.2 || glow > 0.15) color = COLORS.amber
        else color = COLORS.goldBase

        // Hovered + on-crest particles slightly larger
        const sz = p.size * (1 + glow * 0.6 + (waveAdd > 0.4 ? 0.5 : 0))

        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, sz, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // ------ Center hub ------
      const hubR = 22
      ctx.save()
      ctx.shadowColor = 'rgba(107,31,43,0.4)'
      ctx.shadowBlur = 16
      ctx.fillStyle = COLORS.maroon
      ctx.beginPath()
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = COLORS.goldBase
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = COLORS.goldLight
      ctx.font = '600 8px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('HARVICS', cx, cy - 4)
      ctx.fillText('CORE', cx, cy + 6)
      ctx.restore()
    }

    rafRef.current = requestAnimationFrame(draw)

    const visObs = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting && entry.intersectionRatio > 0.05 },
      { threshold: [0, 0.05, 0.3, 0.5] }
    )
    visObs.observe(canvas)

    return () => {
      cancelled = true
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      visObs.disconnect()
    }
  }, [])

  // Keep ref in sync with state for the rAF loop
  useEffect(() => { activeSectorRef.current = activeSector }, [activeSector])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: 'calc(100vh - 136px)',
        minHeight: 'calc(100vh - 136px)',
        background: `linear-gradient(180deg, ${COLORS.bgFrom} 0%, ${COLORS.bgTo} 100%)`,
      }}
    >
      {/* gallery corner brackets */}
      <CornerBrackets />

      <div className="relative h-full w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-10">
        {/* ----- LEFT: round map + tangential labels ----- */}
        <div className="relative h-full flex items-center justify-center">
          <div
            className="relative supplychain-stage"
            style={{ width: 'min(100%, 68vh)', aspectRatio: '1 / 1' }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ display: 'block', pointerEvents: 'none' }}
              aria-hidden="true"
            />

            {/* Tangential rim labels via SVG textPath. textPath follows
                a circle just outside the canvas circle so labels sit on
                the rim and read along the arc. */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {STAGES.map((s, i) => {
                  // Each label has its own arc path. We always draw the arc
                  // ABOVE the rim (so the text baseline sits outside the
                  // circle). For sectors on the bottom half of the circle the
                  // arc is swept the other way so text never reads upside-down.
                  const cx = 100, cy = 100
                  const sectorCount = STAGES.length
                  // mid angle in standard math (0° = right, 90° = top), measured CCW from +x
                  // SVG y grows downward; we lay out so sector 0 sits at TOP.
                  const midDeg = (i / sectorCount) * 360 - 90   // -90 = top
                  const arcSpan = (360 / sectorCount) * 0.88

                  // Decide if this label is on the bottom half (would be upside down).
                  // In SVG coords, "bottom half" = midDeg between 0° and 180° (where sin>0).
                  // After our −90° offset, sector 0..6 are above the equator, sectors 7..13 below.
                  const norm = ((midDeg % 360) + 360) % 360
                  const isBottom = norm > 0 && norm < 180

                  // Place the text path at a different radius for top vs bottom:
                  //   top labels — arc OUTSIDE the rim, swept clockwise → text sits above the curve, readable
                  //   bottom labels — arc OUTSIDE the rim, swept counter-clockwise → flipped right-side up
                  const r = 99

                  let startDeg: number, endDeg: number, sweep: 0 | 1
                  if (!isBottom) {
                    startDeg = midDeg - arcSpan / 2
                    endDeg = midDeg + arcSpan / 2
                    sweep = 1   // clockwise in SVG (because y is flipped)
                  } else {
                    // reverse direction so the baseline is on the OUTSIDE
                    // and the glyphs render upright
                    startDeg = midDeg + arcSpan / 2
                    endDeg = midDeg - arcSpan / 2
                    sweep = 0
                  }

                  const sRad = (startDeg * Math.PI) / 180
                  const eRad = (endDeg * Math.PI) / 180
                  const sx = cx + Math.cos(sRad) * r
                  const sy = cy + Math.sin(sRad) * r
                  const ex = cx + Math.cos(eRad) * r
                  const ey = cy + Math.sin(eRad) * r
                  return (
                    <path
                      key={s}
                      id={`supplychain-arc-${i}`}
                      d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`}
                      fill="none"
                    />
                  )
                })}
              </defs>
              {STAGES.map((s, i) => {
                const isActive = activeSector === i
                return (
                  <g
                    key={s}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setActiveSector(i)}
                    onMouseLeave={() => setActiveSector((cur) => cur === i ? -1 : cur)}
                  >
                    <text
                      fill={isActive ? COLORS.maroonDeep : COLORS.maroon}
                      fontSize={isActive ? 4.6 : 4.0}
                      fontWeight={isActive ? 700 : 600}
                      letterSpacing={0.6}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        textTransform: 'uppercase',
                        transition: 'font-size 0.2s, fill 0.2s',
                      }}
                    >
                      <textPath
                        href={`#supplychain-arc-${i}`}
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        {s}
                      </textPath>
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* ----- RIGHT: text + CTA ----- */}
        <div className="relative flex flex-col justify-center h-full">
          <p
            className="text-[10px] mb-3"
            style={{
              color: COLORS.maroon,
              letterSpacing: '0.42em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 700,
            }}
          >
            HARVICS · OPERATING SYSTEM
          </p>

          <h2
            className="font-light leading-[1.05]"
            style={{
              color: COLORS.maroonDeep,
              fontSize: 'clamp(28px, 4.2vw, 56px)',
              letterSpacing: '-0.02em',
            }}
          >
            One spine.
            <br />
            <span style={{ color: COLORS.goldBase, fontWeight: 600 }}>Fourteen stages.</span>
            <br />
            <span style={{ color: COLORS.maroonDeep, opacity: 0.55 }}>Zero blind spots.</span>
          </h2>

          <p
            className="mt-5 max-w-md text-sm lg:text-[15px] leading-relaxed"
            style={{ color: COLORS.charcoal, opacity: 0.78 }}
          >
            A single command surface for every node, every flow, every signal —
            from raw source to shelf and back again. Hover any stage on the
            map to light its territory.
          </p>

          {activeSector >= 0 && (
            <p
              className="mt-3 text-[11px]"
              style={{
                color: COLORS.maroon,
                letterSpacing: '0.3em',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontWeight: 700,
              }}
            >
              ▸ {STAGES[activeSector].toUpperCase()}
            </p>
          )}

          <a
            href="/en/os"
            className="inline-flex items-center gap-2 mt-7 text-[11px] uppercase tracking-[0.32em] transition-all"
            style={{
              background: COLORS.maroon,
              color: COLORS.goldLight,
              padding: '14px 26px',
              border: `1px solid ${COLORS.maroon}`,
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            Enter the cloud
            <span aria-hidden="true" style={{ fontSize: 14 }}>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ----- gallery corner brackets (top-left, top-right, bottom-left, bottom-right) ----- */
function CornerBrackets() {
  const arm = 18
  const inset = 22
  const color = COLORS.maroon
  const style: React.CSSProperties = { position: 'absolute', width: arm, height: arm, borderColor: color, borderStyle: 'solid', opacity: 0.55 }
  return (
    <>
      <span style={{ ...style, top: inset, left: inset, borderWidth: '1px 0 0 1px' }} />
      <span style={{ ...style, top: inset, right: inset, borderWidth: '1px 1px 0 0' }} />
      <span style={{ ...style, bottom: inset, left: inset, borderWidth: '0 0 1px 1px' }} />
      <span style={{ ...style, bottom: inset, right: inset, borderWidth: '0 1px 1px 0' }} />
    </>
  )
}
