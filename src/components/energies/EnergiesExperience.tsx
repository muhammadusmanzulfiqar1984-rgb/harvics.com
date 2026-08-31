'use client'

import { useEffect, useRef, useState } from 'react'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'
import '@/styles/energies-tokens.css'
import {
  HE_CHAPTERS,
  HE_CORRIDORS,
  HE_FEED_FLOW,
  HE_FEEDSTOCK,
  HE_IMAGES,
  HE_INTEL,
  HE_LOG_STAGES,
  HE_PARTNERS,
  HE_PLANT,
  HE_PROCESS,
  HE_PRODUCTS,
  HE_REGIONS,
  HE_SYSTEM,
  HE_TRACE,
  HE_TRADE,
} from '@/data/energies/content'

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('.he-reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('on')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

function useActiveChapter() {
  const [active, setActive] = useState('system')
  const [scrolled, setScrolled] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36)
      const hero = document.getElementById('hero')
      setHeroVisible(hero ? hero.getBoundingClientRect().bottom > 80 : false)
      let current = 'system'
      for (const ch of HE_CHAPTERS) {
        const el = document.getElementById(ch.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 120) current = ch.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { active, scrolled, heroVisible }
}

const MAIL = {
  dossier: 'mailto:info@harvics.com?subject=Request%20Project%20Dossier%20—%20Harvics%20Energies',
  trade: 'mailto:info@harvics.com?subject=Request%20Trade%20Quote%20—%20Harvics%20Energies',
  partner: 'mailto:partnerships@harvics.com?subject=Partner%20with%20Harvics%20Energies',
  discuss: 'mailto:info@harvics.com?subject=Talk%20to%20Harvics%20Energies',
}

const PLAN_LABEL: Record<string, string> = {
  '01': 'Receiving',
  '02': 'Pre-treat',
  '03': 'Reaction',
  '04': 'Separation',
  '05': 'Purify',
  '06': 'By-product',
  '07': 'Tank farm',
  '08': 'Lab',
  '09': 'Utilities',
  '10': 'Control',
  '11': 'Loading',
  '12': 'Logistics',
}

function usePrefersReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

function SitePlan({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const lastRef = useRef(active)
  const reduced = usePrefersReduced()

  const box = (id: string) => {
    const z = HE_PLANT.find((p) => p.id === id) ?? HE_PLANT[0]
    return { x: z.x * 10, y: z.y * 6.2, w: z.w * 10, h: z.h * 6.2 }
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    let raf = 0
    let tx = 0.52
    let ty = 0.38
    const apply = () => {
      raf = 0
      root.style.setProperty('--sx', `${tx * 100}%`)
      root.style.setProperty('--sy', `${ty * 100}%`)
      root.style.setProperty('--px', String((tx - 0.5) * 18))
      root.style.setProperty('--py', String((ty - 0.5) * 12))
      let best = lastRef.current
      let bestD = 1
      for (const z of HE_PLANT) {
        const cx = (z.x + z.w / 2) / 100
        const cy = (z.y + z.h / 2) / 100
        const d = (cx - tx) ** 2 + (cy - ty) ** 2
        if (d < bestD) {
          bestD = d
          best = z.id
        }
      }
      if (bestD < 0.05 && best !== lastRef.current) {
        lastRef.current = best
        selectRef.current(best)
      }
    }
    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect()
      tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      tx = 0.52
      ty = 0.38
      if (!raf) raf = requestAnimationFrame(apply)
    }
    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    apply()
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div ref={rootRef} className="he-siteplan" aria-label="Industrial site plan — development concept">
      <HarvicsImage src={HE_IMAGES.plant} alt="Renewable fuels complex masterplan — development concept" fill sizes={IMAGE_SIZES.hero} />
      <div className="he-scanlamp" aria-hidden />
      <div className="he-scanring" aria-hidden />
      <div className="he-hotmap-frame">Live inspection · Development concept · Move cursor to scan</div>
      <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice">
        <path
          className="he-pipe-live"
          d="M160 210 H280 H420 H560 H720 H860 M420 280 V 390 H 460 M140 430 H 280 V 390 M640 390 H 780"
          fill="none"
          stroke="rgba(196,164,112,0.7)"
          strokeWidth="1.2"
        />
        {HE_PLANT.map((z) => {
          const { x, y, w, h } = box(z.id)
          const on = active === z.id
          return (
            <g
              key={z.id}
              className={`he-siteplan-hit ${on ? 'on' : ''}`}
              onMouseEnter={() => onSelect(z.id)}
              onFocus={() => onSelect(z.id)}
              onClick={() => onSelect(z.id)}
              tabIndex={0}
              role="button"
              aria-label={`${z.id} ${z.title}`}
            >
              {z.id === '07' ? (
                <>
                  <rect x={x} y={y} width={w} height={h} className="he-siteplan-zone" />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <circle
                      key={i}
                      cx={x + 36 + i * 62}
                      cy={y + h / 2}
                      r="22"
                      fill="none"
                      stroke={on ? '#C4A470' : 'rgba(196,164,112,0.45)'}
                      strokeWidth="1.1"
                    />
                  ))}
                </>
              ) : (
                <rect x={x} y={y} width={w} height={h} className="he-siteplan-zone" />
              )}
              <text x={x + 10} y={y + 18} className="he-siteplan-label">
                {z.id} {PLAN_LABEL[z.id]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ProcessFilm({
  processN,
  setProcessN,
}: {
  processN: string
  setProcessN: (n: string) => void
}) {
  const pinRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReduced()
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = pinRef.current
    if (!el || reduced) return
    let raf = 0
    const tick = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(0, -r.top), Math.max(1, total))
      const t = total > 0 ? scrolled / total : 0
      setP(t)
      const idx = Math.min(HE_PROCESS.length - 1, Math.floor(t * (HE_PROCESS.length - 0.001)))
      const n = HE_PROCESS[idx].n
      setProcessN(n)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced, setProcessN])

  const raw = p * (HE_PROCESS.length - 1)
  const i = Math.min(HE_PROCESS.length - 1, Math.floor(raw))
  const f = raw - i
  const a = HE_PROCESS[i]
  const b = HE_PROCESS[Math.min(HE_PROCESS.length - 1, i + 1)]
  const stage = f > 0.48 ? b : a
  const ken = 1.05 + (raw % 1) * 0.07

  const jump = (idx: number) => {
    const el = pinRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    const top = window.scrollY + el.getBoundingClientRect().top
    window.scrollTo({ top: top + (idx / Math.max(1, HE_PROCESS.length - 1)) * total, behavior: 'smooth' })
  }

  if (reduced) {
    return (
      <div className="he-process-cinematic">
        <div className="he-process-spine" aria-hidden>
          <div className="he-display text-[28px] he-gold he-num">{processN}</div>
          <div className="he-process-spine-line mt-4" />
        </div>
        <div>
          {HE_PROCESS.map((s) => (
            <article key={s.n} className="he-process-shot" data-process-n={s.n}>
              <div className="he-img-bleed !min-h-[280px]">
                <HarvicsImage src={s.image} alt={s.title} fill sizes={IMAGE_SIZES.card} />
              </div>
              <div>
                <div className="he-meta mb-3 he-num">{s.n}</div>
                <h3 className="he-display he-h3 mb-4">{s.title}</h3>
                <p className="text-[14px] he-muted leading-relaxed">{s.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={pinRef} className="he-process-pin">
      <div className="he-process-sticky">
        <div className="he-process-film">
          <HarvicsImage
            src={a.image}
            alt={a.title}
            fill
            sizes={IMAGE_SIZES.hero}
            className="he-process-plate"
            style={{ opacity: 1 - f * 0.92, transform: `scale(${ken})` }}
          />
          <HarvicsImage
            src={b.image}
            alt={b.title}
            fill
            sizes={IMAGE_SIZES.hero}
            className="he-process-plate"
            style={{ opacity: f, transform: `scale(${1.08 - (raw % 1) * 0.05})` }}
          />
          <div className="he-process-veil" aria-hidden />
          <svg className="he-process-trace" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden>
            <path
              d="M80 420 C 220 400, 240 220, 380 210 S 560 280, 620 180 S 820 120, 920 160"
              fill="none"
              stroke="#C4A470"
              strokeWidth="1.4"
              strokeDasharray="1200"
              strokeDashoffset={1200 - p * 1200}
            />
            <circle cx={80 + p * 840} cy={210 + Math.sin(p * 6.2) * 80} r="4.5" fill="#C4A470" />
          </svg>
          <div className="he-process-kicker">
            <p className="he-eyebrow mb-3">03 · Process</p>
            <h2 className="he-display he-h2" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              Engineered molecule by molecule.
            </h2>
          </div>
          <div className="he-process-hud">
            <div className="he-meta he-num mb-3 he-gold">{stage.n} / 07</div>
            <h3 className="he-display he-h3 mb-4">{stage.title}</h3>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(244,241,234,0.72)', maxWidth: '36rem' }}>
              {stage.body}
            </p>
            <div className="mt-5 space-y-2 he-meta" style={{ color: 'rgba(196,164,112,0.75)' }}>
              {stage.panel.map((line) => (
                <div key={line}>— {line}</div>
              ))}
            </div>
          </div>
          <div className="he-process-ticks" role="tablist" aria-label="Process stages">
            {HE_PROCESS.map((s, idx) => (
              <button
                key={s.n}
                type="button"
                role="tab"
                aria-selected={stage.n === s.n}
                className={stage.n === s.n ? 'on' : ''}
                onClick={() => jump(idx)}
              >
                {s.n}
              </button>
            ))}
          </div>
          <div className="he-process-progress" aria-hidden>
            <i style={{ transform: `scaleX(${p})` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EnergiesExperience() {
  useReveal()
  const { active, scrolled } = useActiveChapter()
  const [plantActive, setPlantActive] = useState('05')
  const [systemActive, setSystemActive] = useState('04')
  const [fuelIndex, setFuelIndex] = useState(0)
  const [processN, setProcessN] = useState('01')
  const plant = HE_PLANT.find((p) => p.id === plantActive) || HE_PLANT[0]
  const system = HE_SYSTEM.find((s) => s.n === systemActive) || HE_SYSTEM[0]
  const fuel = HE_PRODUCTS[fuelIndex]
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--px', String(x * 10))
      el.style.setProperty('--py', String(y * 6))
      el.style.setProperty('--hx', `${(x + 0.5) * 100}%`)
      el.style.setProperty('--hy', `${(y + 0.5) * 100}%`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const stages = document.querySelectorAll('.he-system-stage')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-on')
        })
      },
      { threshold: 0.45 },
    )
    stages.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const shots = document.querySelectorAll('[data-process-n]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const n = (e.target as HTMLElement).dataset.processN
            if (n) setProcessN(n)
          }
        })
      },
      { threshold: 0.45 },
    )
    shots.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <div className="he-root">
      <div className="he-grain" aria-hidden />

      <nav className={`he-chapter-nav ${scrolled ? 'scrolled' : ''}`} aria-label="Harvics Energies chapters">
        <span className="he-chapter-label">Oil &amp; Gas · Energies</span>
        <div className="he-chapter-links">
          {HE_CHAPTERS.map((c) => (
            <a key={c.id} href={`#${c.id}`} className={active === c.id ? 'active' : ''}>
              {c.label}
            </a>
          ))}
        </div>
        <a href="#dossier" className="he-nav-cta">
          Project Dossier →
        </a>
      </nav>

      <section id="hero" ref={heroRef} className="he-hero">
        <div className="he-hero-layers" aria-hidden>
          <div
            className="he-hero-bg"
            style={{
              backgroundImage: `url('${HE_IMAGES.hero}')`,
              transform: 'translate(calc(var(--px, 0) * -1px), calc(var(--py, 0) * -1px)) scale(1.06)',
              transition: 'transform 0.55s var(--he-ease)',
            }}
          />
          <div className="he-hero-mid" />
          <div className="he-hero-fg" />
          <div className="he-hero-scan" aria-hidden />
        </div>

        <div className="he-scan">
          <div className="he-eyebrow mb-3">Facility Scan</div>
          <div>Project Status</div>
          <div>Under Development</div>
          <div className="mt-2">Capacity</div>
          <div>To Be Announced</div>
          <div className="mt-2">Class</div>
          <div>Renewable Fuels Complex</div>
        </div>
        <div className="he-telemetry">
          <div className="he-eyebrow mb-3">Telemetry</div>
          <div>Feedstock · Target Network</div>
          <div>Trade · Indicative Desk</div>
          <div>Intelligence · Platform Layer</div>
        </div>

        <div className="he-shell relative z-10 w-full">
          <p className="he-eyebrow mb-5">Harvics Energies · A Harvics Global Ventures Initiative</p>
          <h1 className="he-display he-h1 text-[var(--he-cream)] max-w-[14ch]">
            Energy,
            <br />
            <span className="he-gold">Reengineered.</span>
          </h1>
          <p className="he-lead he-muted mt-7">
            Renewable fuels infrastructure engineered from feedstock to global trade.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2 he-meta" style={{ color: 'rgba(244,241,234,0.42)' }}>
            <span>Renewable Fuels</span>
            <span>Industrial Infrastructure</span>
            <span>Global Energy Trade</span>
          </div>
          <div className="he-btn-row mt-10 flex flex-wrap gap-3">
            <a href="#system" className="he-btn he-btn-primary">
              Explore the Platform
            </a>
            <a href={MAIL.dossier} className="he-btn he-btn-ghost">
              Request Project Dossier
            </a>
          </div>
          <div className="he-hero-rail">
            {['Feedstock', 'Process', 'Storage', 'Logistics', 'Trade'].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="he-surface-charcoal">
        <div className="he-shell he-section he-reveal">
          <p className="he-eyebrow mb-5">The Energy System</p>
          <h2 className="he-display he-h2 max-w-[12ch]">
            From feedstock
            <br />
            to global trade.
          </h2>
          <p className="he-lead he-muted mt-6">
            An integrated industrial chain connecting sourcing, processing, quality, storage, logistics and markets.
          </p>

          <div className="he-pipe" aria-label="Industrial energy flow">
            {HE_SYSTEM.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className={`he-pipe-node ${systemActive === s.n ? 'on' : ''}`}
                onMouseEnter={() => setSystemActive(s.n)}
                onFocus={() => setSystemActive(s.n)}
                onClick={() => setSystemActive(s.n)}
              >
                <span className="he-meta he-num">{s.n}</span>
                <span className="he-pipe-title">{s.title}</span>
                {i < HE_SYSTEM.length - 1 && <i aria-hidden />}
              </button>
            ))}
          </div>
          <div className="he-pipe-board">
            <div className="he-eyebrow mb-2">Stage {system.n}</div>
            <div className="he-display text-[28px] md:text-[36px] mb-2">{system.title}</div>
            <p className="he-muted text-[15px] max-w-xl">{system.body}</p>
          </div>
        </div>
      </section>

      <section id="plant" className="he-surface-charcoal" style={{ paddingTop: 'var(--he-pad-y)', paddingBottom: 0 }}>
        <div className="he-shell">
          <div className="he-reveal he-split mb-10 items-end">
            <div>
              <p className="he-eyebrow mb-5">02 · Plant</p>
              <h2 className="he-display he-h2">
                The plant
                <br />
                is the platform.
              </h2>
            </div>
            <p className="he-lead he-muted">
              A future-facing renewable-fuels complex designed around integrated processing, quality control, storage
              and dispatch.
            </p>
          </div>

          <div className="he-reveal he-plant-desktop grid lg:grid-cols-[1.7fr_0.4fr] gap-0 border border-[var(--he-line)]">
            <SitePlan active={plantActive} onSelect={setPlantActive} />
            <aside className="he-inspect">
              <div>
                <p className="he-eyebrow mb-4">Zone {plant.id}</p>
                <h3 className="he-display he-h3 mb-3">{plant.title}</h3>
                <p className="text-[13px] he-muted leading-relaxed mb-6">{plant.purpose}</p>
                <dl className="he-coords">
                  <dt>Area</dt>
                  <dd>{plant.zone}</dd>
                  <dt>Status</dt>
                  <dd>Development Concept</dd>
                </dl>
              </div>
              <div className="mt-10 pt-6 border-t border-[var(--he-line)] he-meta space-y-2">
                <div>Capacity · To be announced</div>
                <div>Location · To be announced</div>
                <div>Project status · Under development</div>
              </div>
            </aside>
          </div>

          <div className="he-plant-mobile mt-2">
            <div className="border border-[var(--he-line)] p-5 mb-4">
              <p className="he-eyebrow mb-3">Zone {plant.id}</p>
              <h3 className="he-display text-[28px] mb-2">{plant.title}</h3>
              <p className="text-[13px] he-muted leading-relaxed">{plant.purpose}</p>
              <div className="mt-4 he-meta">Status · Development Concept</div>
            </div>
            {HE_PLANT.map((z) => (
              <button
                key={z.id}
                type="button"
                className={`w-full text-left px-5 py-4 border border-[var(--he-line)] border-b-0 last:border-b ${
                  plantActive === z.id ? 'bg-[rgba(61,16,20,0.35)]' : ''
                }`}
                onClick={() => setPlantActive(z.id)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] tracking-wide uppercase">{z.title}</span>
                  <span className="he-meta he-num">{z.id}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="process">
        <ProcessFilm processN={processN} setProcessN={setProcessN} />
      </section>

      <section id="feedstock" className="he-surface-cream he-ink" style={{ paddingTop: 28, paddingBottom: 'var(--he-pad-y)' }}>
        <div className="he-shell he-reveal">
          <p className="he-eyebrow mb-5">04 · Feedstock</p>
          <h2 className="he-display he-h2 max-w-[11ch]">
            The molecule
            <br />
            starts here.
          </h2>
          <p className="he-lead he-muted mt-3">Reliable renewable fuel begins with reliable feedstock.</p>
          <p className="he-meta mt-2">Target Feedstock Network — not existing suppliers</p>

          <div className="he-net" aria-label="Target feedstock network">
            <svg viewBox="0 0 1000 280" preserveAspectRatio="xMidYMid meet">
              <text x="40" y="28" fill="var(--harvics-gold)" fontSize="10" letterSpacing="2.2" fontWeight="600">
                SOURCE NODES
              </text>
              {[
                { id: 'uco', y: 72, t: 'UCO' },
                { id: 'veg', y: 124, t: 'VEG OILS' },
                { id: 'fat', y: 176, t: 'ANIMAL FATS' },
                { id: 'eli', y: 228, t: 'ELIGIBLE STREAMS' },
              ].map((n, i) => {
                const d = `M88 ${n.y} C 280 ${n.y}, 320 148, 470 148`
                return (
                  <g key={n.id}>
                    <circle cx="72" cy={n.y} r="7" fill="var(--harvics-burgundy)" />
                    <circle className="he-net-pulse" cx="72" cy={n.y} r="7" fill="none" stroke="var(--harvics-gold)" />
                    <text x="90" y={n.y + 4} fill="var(--harvics-burgundy)" fontSize="12" letterSpacing="1.2" fontWeight="600">
                      {n.t}
                    </text>
                    <path
                      id={`he-feed-${n.id}`}
                      className="he-net-flow"
                      d={d}
                      fill="none"
                      stroke="var(--harvics-gold)"
                      strokeWidth="1.2"
                    />
                    <circle r="3.5" fill="var(--harvics-burgundy)">
                      <animateMotion dur={`${2.4 + i * 0.35}s`} repeatCount="indefinite" rotate="auto">
                        <mpath href={`#he-feed-${n.id}`} />
                      </animateMotion>
                    </circle>
                  </g>
                )
              })}
              <rect x="430" y="112" width="180" height="72" fill="var(--harvics-cream)" stroke="var(--harvics-burgundy)" strokeWidth="1.2" />
              <text x="448" y="144" fill="var(--harvics-burgundy)" fontSize="12" letterSpacing="1.6" fontWeight="700">
                AGGREGATION
              </text>
              <text x="448" y="164" fill="var(--harvics-gold)" fontSize="9" letterSpacing="1.4">
                VERIFY · TRACE
              </text>
              <path id="he-feed-gate" className="he-net-flow" d="M610 148 H720" fill="none" stroke="var(--harvics-gold)" strokeWidth="1.6" />
              <circle r="4" fill="var(--harvics-gold)">
                <animateMotion dur="1.6s" repeatCount="indefinite">
                  <mpath href="#he-feed-gate" />
                </animateMotion>
              </circle>
              <rect x="720" y="98" width="220" height="100" fill="var(--harvics-burgundy)" />
              <text x="744" y="146" fill="var(--harvics-cream)" fontSize="13" letterSpacing="1.6" fontWeight="700">
                PLANT GATE
              </text>
              <text x="744" y="168" fill="var(--harvics-gold)" fontSize="9" letterSpacing="1.4">
                DELIVER
              </text>
            </svg>
          </div>

          <div className="he-feed-list">
            {HE_FEEDSTOCK.map((f, i) => (
              <div key={f.title} className="he-rule-row">
                <div className="he-meta he-num pt-1">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="text-[15px] tracking-wide uppercase">{f.title}</div>
                  <div className="he-meta mt-2">{f.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="he-chain mt-6">
            {HE_FEED_FLOW.map((s, i) => (
              <span key={s} className="contents">
                <span className="he-chain-node">{s}</span>
                {i < HE_FEED_FLOW.length - 1 && (
                  <span className="he-chain-arrow" aria-hidden>
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="fuels" className="he-section he-surface-cream he-ink">
        <div className="he-shell he-reveal">
          <p className="he-eyebrow mb-5">05 · Fuels</p>
          <h2 className="he-display he-h2 max-w-[14ch] mb-10">
            Renewable molecules.
            <br />
            Industrial applications.
          </h2>
          <div className="he-split items-stretch">
            <div className="he-img-bleed !min-h-[380px] border border-[var(--he-line-ink)]">
              <HarvicsImage src={fuel.image} alt={fuel.product} fill sizes={IMAGE_SIZES.heroHalf} />
            </div>
            <div>
              {HE_PRODUCTS.map((p, i) => (
                <button
                  key={p.product}
                  type="button"
                  className={`he-rule-row w-full text-left ${fuelIndex === i ? 'is-on' : ''}`}
                  onMouseEnter={() => setFuelIndex(i)}
                  onFocus={() => setFuelIndex(i)}
                  onClick={() => setFuelIndex(i)}
                >
                  <div className="he-meta he-num pt-1" style={{ color: fuelIndex === i ? 'var(--he-gold)' : undefined }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="text-[15px] tracking-wide uppercase">{p.product}</div>
                    <p className="text-[13px] he-muted mt-2 leading-relaxed">{p.application}</p>
                    <div className="he-meta mt-2">Specification · Available on request</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="trade" className="he-section he-surface-charcoal">
        <div className="he-shell he-reveal">
          <div className="he-split mb-10 items-end">
            <div>
              <p className="he-eyebrow mb-5">06 · Trade</p>
              <h2 className="he-display he-h2">
                The energy
                <br />
                trade desk.
              </h2>
            </div>
            <p className="he-lead he-muted">
              Physical energy requires more than production. It requires markets, counterparties, logistics and
              execution.
            </p>
          </div>
          <div className="he-terminal">
            <div className="he-terminal-bar">
              <span className="he-meta">Indicative Market View</span>
              <span className="he-meta" style={{ color: 'rgba(244,241,234,0.35)' }}>
                Demonstration / Indicative Data
              </span>
            </div>
            <div className="he-trade-scroll">
              <table className="he-trade-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Trade Lane</th>
                    <th>Delivery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {HE_TRADE.map((row, i) => (
                    <tr key={`${row.product}-${i}`}>
                      <td style={{ color: 'var(--he-cream)' }}>{row.product}</td>
                      <td>{row.origin}</td>
                      <td>{row.destination}</td>
                      <td>{row.lane}</td>
                      <td>{row.delivery}</td>
                      <td>
                        <span className="he-status-pill">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="he-btn-row mt-8 flex flex-wrap gap-3">
            <a href={MAIL.trade} className="he-btn he-btn-primary">
              Request Trade Quote →
            </a>
          </div>
        </div>
      </section>

      <section id="logistics" className="he-surface-graphite" style={{ paddingTop: 72, paddingBottom: 0 }}>
        <div className="he-shell he-reveal mb-8">
          <p className="he-eyebrow mb-5">07 · Logistics</p>
          <h2 className="he-display he-h2 max-w-[14ch]">
            Energy doesn&apos;t
            <br />
            stop at the plant gate.
          </h2>
        </div>
        <div className="he-log-film">
          {HE_LOG_STAGES.map((s) => (
            <figure key={s.title} className="he-log-shot">
              <HarvicsImage src={s.image} alt={s.title} fill sizes={IMAGE_SIZES.card} />
              <figcaption className="absolute bottom-6 left-6 z-10 he-eyebrow">{s.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="global" className="he-section he-surface-charcoal">
        <div className="he-shell he-reveal">
          <p className="he-eyebrow mb-5">08 · Global</p>
          <h2 className="he-display he-h2 max-w-[14ch] mb-10">
            Built local.
            <br />
            Designed for global trade.
          </h2>
          <div className="he-map">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <ellipse cx="500" cy="290" rx="420" ry="210" fill="none" stroke="rgba(244,241,234,0.04)" />
              {HE_CORRIDORS.map((c, i) => {
                const [x1, y1] = c.from
                const [x2, y2] = c.to
                return (
                  <path
                    key={c.label}
                    d={`M${x1 * 10} ${y1 * 5.6} Q${(x1 + x2) * 5} ${(y1 + y2) * 2.6 - 40} ${x2 * 10} ${y2 * 5.6}`}
                    fill="none"
                    stroke="rgba(196,164,112,0.55)"
                    strokeWidth="1"
                    strokeDasharray="5 7"
                  >
                    <animate attributeName="stroke-dashoffset" from="48" to="0" dur={`${6 + i}s`} repeatCount="indefinite" />
                  </path>
                )
              })}
              {HE_REGIONS.map((r) => (
                <circle key={r.name} cx={r.x * 10} cy={r.y * 5.6} r="3" fill="rgba(196,164,112,0.85)" />
              ))}
            </svg>
            {HE_REGIONS.map((r) => (
              <div key={r.name} className="he-map-label" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                <strong>{r.name}</strong>
                <span>{r.tag}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 he-meta" style={{ color: 'rgba(244,241,234,0.4)' }}>
            {HE_CORRIDORS.map((c) => (
              <span key={c.label}>{c.label}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="intelligence" className="he-section he-surface-cream he-ink">
        <div className="he-shell">
          <div className="he-reveal he-split mb-10">
            <div>
              <p className="he-eyebrow mb-5">09 · Intelligence</p>
              <h2 className="he-display he-h2">
                The physical network
                <br />
                has a digital brain.
              </h2>
            </div>
            <p className="he-lead he-muted md:mt-10">
              Harvics intelligence layers connect physical energy infrastructure with market signals, sourcing data,
              operational visibility and trade workflows.
            </p>
          </div>
          <div className="he-reveal he-intel-stack mb-10 relative">
            <HarvicsImage src={HE_IMAGES.plant} alt="Supply chain intelligence map" fill sizes={IMAGE_SIZES.hero} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 420" aria-hidden>
              <path d="M80 340 L240 220 L420 240 L620 160 L860 120" fill="none" stroke="#C4A470" strokeWidth="1.2" />
              {['SUPPLY', 'PLANT', 'STORAGE', 'MARKET', 'TRADE'].map((t, i) => (
                <text key={t} x={80 + i * 190} y={380} fill="#F4F1EA" fontSize="11" letterSpacing="2">
                  {t}
                </text>
              ))}
            </svg>
          </div>
          <div className="he-reveal">
            {HE_INTEL.map((item, i) => (
              <div key={item.title} className="he-rule-row !border-[var(--he-line-ink)]">
                <div className="he-meta he-num pt-1">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="text-[14px] tracking-wide uppercase mb-1">{item.title}</div>
                  <p className="text-[13px] he-muted leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compliance" className="he-section he-surface-cream he-ink">
        <div className="he-shell he-reveal">
          <p className="he-eyebrow mb-5">10 · Quality</p>
          <h2 className="he-display he-h2 max-w-[10ch] mb-6">
            Every batch
            <br />
            has a story.
          </h2>
          <div className="overflow-x-auto">
            <div className="flex min-w-[720px] border-t border-b border-[var(--he-line-ink)]">
              {HE_TRACE.map((step, i) => (
                <div key={step} className="flex-1 min-w-[96px] p-5">
                  <div className="he-meta mb-4 he-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-[11px] tracking-[0.12em] uppercase leading-snug">{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 he-meta" style={{ color: 'rgba(23,21,22,0.45)' }}>
            <span>Traceability</span>
            <span>Quality Control</span>
            <span>Documentation</span>
            <span>Regulatory Workflow</span>
            <span>Sustainability Data</span>
          </div>
        </div>
      </section>

      <section id="partners" className="he-section he-surface-cream he-ink">
        <div className="he-shell he-reveal">
          <p className="he-eyebrow mb-5">11 · Partners</p>
          <h2 className="he-display he-h2 mb-12">
            Energy infrastructure
            <br />
            is built through partnership.
          </h2>
          {HE_PARTNERS.map((p, i) => (
            <div key={p} className="he-rule-row !border-[var(--he-line-ink)]">
              <div className="he-meta he-num pt-1">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-[15px] tracking-[0.12em] uppercase">{p}</div>
            </div>
          ))}
          <div className="mt-10">
            <a href={MAIL.discuss} className="he-btn he-btn-primary">
              Discuss the Platform →
            </a>
          </div>
        </div>
      </section>

      <section id="dossier" className="relative he-section he-surface-burgundy overflow-hidden">
        <HarvicsImage
          src={HE_IMAGES.hero}
          alt="Project dossier background"
          fill
          sizes={IMAGE_SIZES.hero}
          className="object-cover opacity-25"
        />
        <div className="he-shell relative z-10 max-w-3xl he-reveal">
          <p className="he-eyebrow mb-5">Project Dossier</p>
          <h2 className="he-display he-h2">
            Build the next
            <br />
            energy network.
          </h2>
          <p className="he-lead he-muted mt-6">
            Explore the Harvics Energies development platform, renewable-fuels infrastructure strategy and global trade
            vision.
          </p>
          <div className="he-btn-row mt-10 flex flex-wrap gap-3">
            <a href={MAIL.dossier} className="he-btn he-btn-ghost">
              Request Project Dossier
            </a>
            <a href={MAIL.partner} className="he-btn he-btn-ghost">
              Partner with Harvics
            </a>
          </div>
        </div>
      </section>

      <section id="finale" className="relative min-h-[88svh] flex items-end overflow-hidden">
        <HarvicsImage src={HE_IMAGES.finale} alt="Renewable fuels finale" fill sizes={IMAGE_SIZES.hero} priority className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(23,21,22,0.94), rgba(23,21,22,0.5) 50%, rgba(23,21,22,0.55))',
          }}
        />
        <div className="he-shell relative z-10 w-full pb-20 pt-32 he-reveal">
          <h2 className="he-display he-h2 max-w-[16ch]">
            From feedstock to fuel.
            <br />
            From plant to market.
          </h2>
          <p className="he-lead he-muted mt-6">
            Harvics Energies is developing an integrated platform connecting renewable fuels, industrial infrastructure
            and global energy trade.
          </p>
          <div className="he-btn-row mt-10 flex flex-wrap gap-3">
            <a href={MAIL.partner} className="he-btn he-btn-primary">
              Partner with Harvics
            </a>
            <a href={MAIL.trade} className="he-btn he-btn-ghost">
              Trade with Harvics
            </a>
            <a href={MAIL.dossier} className="he-btn he-btn-ghost">
              Request Project Dossier
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
