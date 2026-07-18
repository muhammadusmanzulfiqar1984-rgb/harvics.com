'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'

type AppSpot = {
  code: string
  label: string
  name: string
  nameAccent?: string
  line: string
  points: string[]
  href: string
  cta: string
  img: string
  phone?: string
}

const APPS: AppSpot[] = [
  {
    code: '01',
    label: 'Finance OS',
    name: 'Harvoice',
    line: 'Invoicing, collections and AR — the voice of the books on the corridor.',
    points: ['Invoicing', 'Collections', 'Multi-currency'],
    href: '/apps/harvoice',
    cta: 'View Harvoice',
    img: '/assets/verticals/09-finance/categories/invoicing/hero.jpg',
    phone: '/assets/harvictrade/mobile/phone-quotes.jpg',
  },
  {
    code: '02',
    label: 'Settlement',
    name: 'HPay',
    line: 'Escrow wallets, FX rails and compliant close — payment without guesswork.',
    points: ['Escrow', 'FX rails', 'Compliance'],
    href: '/apps/hpay',
    cta: 'View HPay',
    img: '/assets/verticals/09-finance/categories/hpay/hero.jpg',
    phone: '/assets/harvictrade/mobile/phone-dashboard.jpg',
  },
  {
    code: '03',
    label: 'Access',
    name: 'Portals',
    line: 'Supplier, distributor and RFQ desks — one login into live corridor work.',
    points: ['Supplier', 'Distributor', 'RFQ inbox'],
    href: '/portals',
    cta: 'View portals',
    img: '/assets/shared/heroes/portals-hub-hero.jpg',
    phone: '/assets/harvictrade/mobile/phone-rfq-form.jpg',
  },
  {
    code: '04',
    label: 'Intelligence',
    name: 'Harvy',
    nameAccent: 'X',
    line: 'Lead intelligence, outreach sequences, reply desk and verified data bank.',
    points: ['ICP', 'Outreach', 'Data bank'],
    href: '/apps/harvyx',
    cta: 'View HarvyX',
    img: '/assets/verticals/10-ai-tech/categories/ai-solutions/hero.jpg',
    phone: '/assets/harvictrade/mobile/phone-marketplace-list.jpg',
  },
]

/**
 * Commercial cinema screen for Harvics apps — picture-led, not rail cards.
 */
export default function AppsCommercialSection() {
  const locale = useLocale()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const app = APPS[active]

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % APPS.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <section
      id="apps"
      className="relative overflow-hidden bg-harvics-burgundy text-harvics-cream"
      style={{ padding: 'clamp(60px, 8.5vw, 94px) 0 clamp(48px, 6.8vw, 75px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 15% 20%, rgba(195, 163, 94,0.14) 0%, transparent 42%), radial-gradient(ellipse at 90% 80%, rgba(61,18,18,0.55) 0%, transparent 48%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[2%] bottom-[6%] select-none font-medium leading-none text-transparent"
        style={{
          fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
          fontSize: 'clamp(68px, 12vw, 136px)',
          letterSpacing: '-0.05em',
          WebkitTextStroke: '1px rgba(195, 163, 94,0.1)',
        }}
      >
        APPS
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1220px] px-5 md:px-10">
        <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2.5 harvics-corridor-eyebrow text-[10px] tracking-[0.22em]">
              10 · Apps
            </p>
            <h2
              className="harvics-corridor-display max-w-[14ch] text-harvics-cream"
              style={{
                fontSize: 'clamp(28px, 4.7vw, 48px)',
              }}
            >
              Software for the corridor.
              <br />
              <span className="text-harvics-gold font-medium">Not another dashboard.</span>
            </h2>
          </div>
          <p className="harvics-corridor-body max-w-[34ch] !text-harvics-cream/55 md:text-[14px]">
            Four tools. One operating discipline — intelligence, finance voice, settlement, and
            portals — framed like a commercial, not a feature list.
          </p>
        </div>

        {/* Cinema screen */}
        <div className="relative overflow-hidden border border-harvics-gold/25 bg-black shadow-[0_32px_64px_rgba(0,0,0,0.55)]">
          {/* Letterbox bars */}
          <div className="absolute inset-x-0 top-0 z-20 h-2.5 bg-black md:h-3" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 z-20 h-2.5 bg-black md:h-3" aria-hidden />

          <div className="relative aspect-[17/9] w-full md:aspect-[11/4]">
            <AnimatePresence mode="wait">
              <motion.div
                key={app.code}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={app.img}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: 'brightness(0.55) contrast(1.08) saturate(1.05)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(105deg, rgba(10,4,4,0.88) 0%, rgba(10,4,4,0.35) 48%, rgba(10,4,4,0.15) 100%), linear-gradient(to top, rgba(10,4,4,0.75) 0%, transparent 45%)',
                  }}
                />

                {app.phone && (
                  <div className="pointer-events-none absolute bottom-[10%] right-[5%] hidden w-[19%] max-w-[187px] md:block">
                    <div className="overflow-hidden rounded-[1.15rem] border border-white/20 bg-black shadow-[0_20px_48px_rgba(0,0,0,0.65)] ring-1 ring-harvics-gold/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.phone} alt="" className="aspect-[9/19] w-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-8 lg:p-11">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-harvics-gold">
                    {app.code} · {app.label}
                  </p>
                  <h3
                    className="mb-2.5 text-harvics-cream"
                    style={{
                      fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
                      fontSize: 'clamp(30px, 5.1vw, 61px)',
                      fontWeight: 500,
                      letterSpacing: '-0.03em',
                      lineHeight: 0.95,
                    }}
                  >
                    {app.name}
                    {app.nameAccent && (
                      <span className="text-harvics-gold">{app.nameAccent}</span>
                    )}
                  </h3>
                  <p className="mb-4 max-w-[40ch] text-[13px] leading-relaxed text-harvics-cream/70 md:text-[15px]">
                    {app.line}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {app.points.map((p) => (
                      <span
                        key={p}
                        className="border border-harvics-gold/35 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-harvics-gold"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/${locale}${app.href}`}
                    className="inline-flex w-fit items-center gap-2 bg-harvics-gold px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
                  >
                    {app.cta} →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar for autoplay */}
          <div className="absolute bottom-2.5 left-0 right-0 z-30 h-[2px] bg-white/10 md:bottom-3">
            <motion.div
              key={`bar-${app.code}-${paused}`}
              className="h-full bg-harvics-gold"
              initial={{ width: '0%' }}
              animate={{ width: paused ? `${((active + 1) / APPS.length) * 100}%` : '100%' }}
              transition={paused ? { duration: 0 } : { duration: 5.2, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Filmstrip */}
        <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:grid-cols-4 md:gap-2.5">
          {APPS.map((item, i) => {
            const on = i === active
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setActive(i)}
                className={`group relative aspect-[17/9] overflow-hidden text-left transition-all ${
                  on ? 'ring-2 ring-harvics-gold' : 'ring-1 ring-white/10 hover:ring-harvics-gold/50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt=""
                  className={`h-full w-full object-cover transition-all duration-500 ${
                    on ? 'brightness-75' : 'brightness-40 group-hover:brightness-60'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-harvics-gold">
                    {item.code}
                  </div>
                  <div
                    className="text-harvics-cream"
                    style={{
                      fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
                      fontSize: 'clamp(14px, 1.7vw, 17px)',
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                    {item.nameAccent && (
                      <span className="text-harvics-gold">{item.nameAccent}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-harvics-gold/20 pt-6 md:flex-row md:items-center">
          <p className="max-w-[46ch] text-[13px] leading-relaxed text-harvics-cream/55">
            Need a human on the desk for sourcing, corridor routing or marketplace access — response
            within one business day.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center bg-harvics-gold px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
            >
              Contact the desk
            </Link>
            <Link
              href={`/${locale}/harvictrade`}
              className="inline-flex items-center border border-harvics-cream/35 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream hover:border-harvics-gold hover:text-harvics-gold"
            >
              Submit an RFQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
