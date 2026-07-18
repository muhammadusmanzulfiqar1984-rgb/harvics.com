'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import ContactSection from '@/components/layout/ContactSection'

gsap.registerPlugin(ScrollTrigger)

const INDUSTRIES = [
  { name: 'Textiles', img: '/assets/harvictrade/heroes/textiles-hero.jpg', slug: 'textiles' },
  { name: 'FMCG', img: '/assets/harvictrade/heroes/fmcg-hero.jpg', slug: 'fmcg' },
  { name: 'Commodities', img: '/assets/harvictrade/heroes/commodities-hero.jpg', slug: 'commodities' },
  { name: 'Industrial', img: '/assets/harvictrade/heroes/industrial-hero.jpg', slug: 'industrial' },
  { name: 'Minerals', img: '/assets/harvictrade/heroes/minerals-hero.jpg', slug: 'minerals' },
  { name: 'Energy', img: '/assets/harvictrade/heroes/energy-hero.jpg', slug: 'energy' },
  { name: 'Electronics', img: '/assets/harvictrade/heroes/electronics-hero.jpg', slug: 'electronics' },
]

const STEPS = [
  {
    n: '01',
    t: 'Browse & search',
    d: 'Explore verified listings. Filter by origin, MOQ, certification and Incoterms.',
    img: '/assets/shared/heroes/harvictrade-marketplace.jpg',
  },
  {
    n: '02',
    t: 'Submit RFQ',
    d: 'Request quotes from vetted suppliers. Specify quantity, delivery and timeline.',
    img: '/assets/shared/heroes/distributor-portal-hero.jpg',
  },
  {
    n: '03',
    t: 'Compare & negotiate',
    d: 'Receive competitive quotes. Match to the best-fit supplier for your corridor.',
    img: '/assets/shared/heroes/supplier-portal-hero.jpg',
  },
  {
    n: '04',
    t: 'Trade securely',
    d: 'Execute with escrow, LC/TT and end-to-end shipment tracking.',
    img: '/assets/shared/heroes/trade-finance-hero.jpg',
  },
]

const PRODUCTS = [
  { name: 'Premium Basmati Rice 1121 Sella', origin: 'Pakistan', img: '/assets/harvictrade/products/basmati-rice.jpg' },
  { name: 'Hi-Vis Safety Jacket EN20471', origin: 'Turkey', img: '/assets/harvictrade/products/safety-jacket.jpg' },
  { name: 'Copper Cathode Grade A', origin: 'Chile', img: '/assets/harvictrade/products/copper-cathode.jpg' },
  { name: 'Extra Virgin Olive Oil — 1L', origin: 'Spain', img: '/assets/harvictrade/products/olive-oil.jpg' },
]

export default function CorridorHome() {
  const locale = useLocale()
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 800px)').matches

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    lenis.on('scroll', ScrollTrigger.update)
    const tickerFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      // Hero media scrub
      const heroMedia = root.querySelector('.corridor-hero-media')
      if (heroMedia) {
        gsap.fromTo(
          heroMedia,
          { scale: 1.12 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.corridor-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      gsap.to('.corridor-hero-content', {
        y: -40,
        opacity: 0.35,
        scale: 0.94,
        ease: 'none',
        scrollTrigger: {
          trigger: '.corridor-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Manifesto line
      gsap.fromTo(
        '.corridor-manifesto-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.corridor-manifesto',
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: true,
          },
        }
      )

      // Campaign pin + unblur
      const campaign = root.querySelector('.corridor-campaign') as HTMLElement | null
      const campaignPin = root.querySelector('.corridor-campaign-pin') as HTMLElement | null
      const campaignImg = root.querySelector('.corridor-campaign-img') as HTMLElement | null

      if (campaign && campaignPin && campaignImg && !reduceMotion) {
        ScrollTrigger.create({
          trigger: campaign,
          start: 'top top',
          end: 'bottom bottom',
          pin: campaignPin,
          pinSpacing: true,
          scrub: true,
        })

        gsap.fromTo(
          campaignImg,
          { filter: 'blur(28px) brightness(0.4)', scale: 1.18 },
          {
            filter: 'blur(0px) brightness(0.72)',
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: campaign,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        )

        gsap.fromTo(
          '.corridor-campaign-copy > *',
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: campaign,
              start: '10% top',
              end: '55% top',
              scrub: true,
            },
          }
        )
      }

      // Horizontal categories — sticky + scrub
      const hSection = root.querySelector('.corridor-hscroll') as HTMLElement | null
      const hTrack = root.querySelector('.corridor-hscroll-track') as HTMLElement | null
      const hFill = root.querySelector('.corridor-h-progress') as HTMLElement | null

      const buildHorizontal = () => {
        const existing = ScrollTrigger.getById('corridor-hscroll')
        if (existing) existing.kill()
        if (!hSection || !hTrack) return

        gsap.set(hTrack, { x: 0 })
        const travel = Math.max(hTrack.scrollWidth - window.innerWidth, 0)
        hSection.style.height = `${window.innerHeight + travel}px`

        if (isMobile || reduceMotion || travel < 20) {
          hSection.style.height = 'auto'
          if (hFill) hFill.style.width = '100%'
          return
        }

        ScrollTrigger.create({
          id: 'corridor-hscroll',
          trigger: hSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            gsap.set(hTrack, { x: -travel * self.progress })
            if (hFill) hFill.style.width = `${self.progress * 100}%`
          },
        })
      }

      const imgs = hTrack ? Array.from(hTrack.querySelectorAll('img')) : []
      let loaded = 0
      const ready = () => {
        loaded += 1
        if (loaded >= Math.max(imgs.length, 1)) {
          buildHorizontal()
          ScrollTrigger.refresh()
        }
      }
      if (!imgs.length) ready()
      else {
        imgs.forEach((img) => {
          if ((img as HTMLImageElement).complete) ready()
          else {
            img.addEventListener('load', ready, { once: true })
            img.addEventListener('error', ready, { once: true })
          }
        })
        setTimeout(() => {
          buildHorizontal()
          ScrollTrigger.refresh()
        }, 800)
      }

      // Marquee
      gsap.fromTo(
        '.corridor-marquee-track',
        { x: '5%' },
        {
          x: '-55%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.corridor-marquee',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )

      // Process dual-column parallax
      const processStage = root.querySelector('.corridor-process-stage')
      if (processStage && !isMobile) {
        gsap.to('.corridor-col-left', {
          y: -140,
          ease: 'none',
          scrollTrigger: {
            trigger: processStage,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
        gsap.to('.corridor-col-right', {
          y: -300,
          ease: 'none',
          scrollTrigger: {
            trigger: processStage,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      gsap.utils.toArray<HTMLElement>('.corridor-step').forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Soft reveals
      gsap.utils.toArray<HTMLElement>('[data-corridor-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
            },
          }
        )
      })
    }, root)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
    }
  }, [])

  return (
    <main
      ref={rootRef}
      id="homepage-main"
      className="w-full min-h-screen bg-harvics-cream text-harvics-burgundy"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* 01 · HERO + MOVIE */}
      <section className="corridor-hero relative min-h-[calc(100vh-8rem)] flex items-end overflow-hidden bg-harvics-burgundy">
        <div className="corridor-hero-media absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/shared/heroes/hero-page-1.jpg"
          >
            <source src="/assets/media/video/corridor-reel.mp4?v=night1" type="video/mp4" />
          </video>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(61, 18, 18,0.72) 0%, rgba(13,13,13,0.35) 48%, rgba(13,13,13,0.15) 100%), linear-gradient(to top, rgba(61, 18, 18,0.55) 0%, transparent 45%)',
          }}
        />
        <div className="corridor-hero-content relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-12 pb-16 md:pb-24">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
            Film · Hero reel
          </p>
          <h1
            className="mb-5 text-harvics-cream"
            style={{
              fontFamily: 'var(--font-playfair-display), Georgia, serif',
              fontSize: 'clamp(48px, 9vw, 104px)',
              fontWeight: 500,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            <span className="text-harvics-gold">Harvics</span>
            <br />
            Global Ventures
          </h1>
          <p className="mb-3 max-w-[28ch] text-base md:text-lg font-medium text-harvics-cream">
            The corridor for global trade.
          </p>
          <p className="mb-8 max-w-[40ch] text-[15px] leading-relaxed text-harvics-cream/60">
            Source, move and settle across industries — verified supply, protected settlement, one
            operating system.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/harvictrade`}
              className="inline-flex items-center px-6 py-3.5 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#d4b65a] transition-colors"
            >
              Enter marketplace
            </Link>
            <a
              href="#industries"
              className="inline-flex items-center px-6 py-3.5 border border-harvics-gold/50 text-harvics-gold text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-colors"
            >
              Browse categories
            </a>
          </div>
        </div>
      </section>

      {/* 02 · STATEMENT */}
      <section className="corridor-manifesto border-b border-harvics-gold/30 px-5 md:px-12 py-20 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-2 md:items-end md:gap-16">
          <div data-corridor-reveal>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
              02 · Statement
            </p>
            <h2
              className="max-w-[14ch] text-harvics-burgundy"
              style={{
                fontFamily: 'var(--font-playfair-display), Georgia, serif',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 500,
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
              }}
            >
              Trade is a corridor. We built the rails.
            </h2>
          </div>
          <p
            className="max-w-[42ch] text-[15px] md:text-[17px] leading-relaxed text-harvics-muted"
            data-corridor-reveal
          >
            Not a catalogue. Not a brochure. An operating path from RFQ to delivery — across
            textiles, FMCG, commodities, industrial, minerals and energy.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-[1440px]">
          <div
            className="corridor-manifesto-line h-px origin-left bg-gradient-to-r from-harvics-gold to-transparent"
          />
        </div>
      </section>

      {/* 03 · CAMPAIGN PIN */}
      <section className="corridor-campaign relative h-[260vh] bg-harvics-burgundy">
        <div className="corridor-campaign-pin relative h-screen w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/shared/heroes/harvictrade-hero.jpg"
            alt=""
            className="corridor-campaign-img absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-harvics-burgundy/50" />
          <div className="corridor-campaign-copy absolute inset-0 z-10 flex flex-col justify-end px-5 pb-16 md:px-12 md:pb-24 max-w-[1440px] mx-auto w-full left-0 right-0">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
              03 · See corridor
            </p>
            <h2
              className="mb-6 max-w-[12ch] text-harvics-cream"
              style={{
                fontFamily: 'var(--font-playfair-display), Georgia, serif',
                fontSize: 'clamp(40px, 8vw, 96px)',
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
              }}
            >
              Trade with certainty.
            </h2>
            <Link
              href={`/${locale}/harvictrade`}
              className="inline-flex w-fit items-center px-6 py-3.5 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              Enter HarvicTrade
            </Link>
          </div>
        </div>
      </section>

      {/* 04 · HORIZONTAL CATEGORIES */}
      <section className="corridor-hscroll relative bg-harvics-burgundy text-harvics-cream" id="industries">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-[7.5rem] pb-6">
          <div className="mx-auto mb-5 flex w-full max-w-[1440px] items-end justify-between gap-5 px-5 md:px-12">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
                04 · Categories
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair-display), Georgia, serif',
                  fontSize: 'clamp(28px, 4.5vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                }}
              >
                Industries that move.
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/harvictrade`}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-cream/70 hover:text-harvics-gold"
              >
                See all
              </Link>
              <div className="relative h-0.5 w-36 overflow-hidden bg-harvics-cream/20">
                <div className="corridor-h-progress absolute inset-y-0 left-0 w-0 bg-harvics-gold" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="corridor-hscroll-track flex h-full w-max gap-4 px-5 md:px-12">
              {INDUSTRIES.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/harvictrade/category/${item.slug}`}
                  className="relative h-full w-[min(38vw,480px)] flex-none overflow-hidden bg-[#111]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover brightness-[0.68]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <strong
                      className="mb-1 block text-harvics-cream"
                      style={{
                        fontFamily: 'var(--font-playfair-display), Georgia, serif',
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        fontWeight: 500,
                      }}
                    >
                      {item.name}
                    </strong>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-harvics-gold">
                      Browse →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 05 · MARQUEE */}
      <section className="corridor-marquee overflow-hidden border-y border-harvics-gold/30 bg-harvics-cream py-10 md:py-14">
        <div className="corridor-marquee-track flex w-max whitespace-nowrap">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pr-4 text-harvics-burgundy"
              style={{
                fontFamily: 'var(--font-playfair-display), Georgia, serif',
                fontSize: 'clamp(32px, 6vw, 64px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
              }}
            >
              EU CORRIDORS <em className="not-italic text-harvics-gold">·</em> GCC ROUTES{' '}
              <em className="not-italic text-harvics-gold">·</em> SOUTH ASIA LANES{' '}
              <em className="not-italic text-harvics-gold">·</em> VERIFIED SUPPLY{' '}
              <em className="not-italic text-harvics-gold">·</em> ESCROW SETTLEMENT{' '}
              <em className="not-italic text-harvics-gold">·</em> HARVICTRADE{' '}
              <em className="not-italic text-harvics-gold">·</em>{' '}
            </span>
          ))}
        </div>
      </section>

      {/* 06 · PROCESS */}
      <section className="bg-harvics-cream px-5 md:px-12" id="process">
        <div className="corridor-process-stage relative mx-auto min-h-[200vh] max-w-[1440px] py-20 md:py-28">
          <div className="sticky top-28 z-[2] mb-10 pointer-events-none">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold pointer-events-auto">
              06 · The passage
            </p>
            <h2
              className="max-w-[11ch] text-harvics-burgundy"
              style={{
                fontFamily: 'var(--font-playfair-display), Georgia, serif',
                fontSize: 'clamp(40px, 8vw, 96px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
              }}
            >
              From search to shipment.
            </h2>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-harvics-muted pointer-events-auto">
              Four steps. Two columns. They move at different speeds as you fall through the
              corridor.
            </p>
          </div>

          <div className="relative z-[1] grid grid-cols-1 gap-4 pt-[12vh] md:grid-cols-2 md:gap-10">
            <div className="corridor-col-left flex flex-col gap-6">
              {[STEPS[0], STEPS[2]].map((s) => (
                <article
                  key={s.n}
                  className="corridor-step overflow-hidden border border-harvics-gold/30 bg-harvics-card"
                >
                  <div className="p-7 md:p-9">
                    <div
                      className="text-harvics-gold/55"
                      style={{
                        fontFamily: 'var(--font-playfair-display), Georgia, serif',
                        fontSize: 'clamp(48px, 6vw, 72px)',
                        lineHeight: 0.9,
                      }}
                    >
                      {s.n}
                    </div>
                    <h3 className="mt-5 mb-2 text-lg font-semibold text-harvics-burgundy">{s.t}</h3>
                    <p className="max-w-[34ch] text-sm leading-relaxed text-harvics-muted">{s.d}</p>
                  </div>
                  <div className="h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt="" className="h-full w-full object-cover brightness-90" />
                  </div>
                </article>
              ))}
            </div>
            <div className="corridor-col-right flex flex-col gap-6 md:mt-[18vh]">
              {[STEPS[1], STEPS[3]].map((s) => (
                <article
                  key={s.n}
                  className="corridor-step overflow-hidden border border-harvics-gold/30 bg-harvics-card"
                >
                  <div className="p-7 md:p-9">
                    <div
                      className="text-harvics-gold/55"
                      style={{
                        fontFamily: 'var(--font-playfair-display), Georgia, serif',
                        fontSize: 'clamp(48px, 6vw, 72px)',
                        lineHeight: 0.9,
                      }}
                    >
                      {s.n}
                    </div>
                    <h3 className="mt-5 mb-2 text-lg font-semibold text-harvics-burgundy">{s.t}</h3>
                    <p className="max-w-[34ch] text-sm leading-relaxed text-harvics-muted">{s.d}</p>
                  </div>
                  <div className="h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt="" className="h-full w-full object-cover brightness-90" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 07 · GATE */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-harvics-burgundy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/shared/heroes/portals-hub-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-50"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(61, 18, 18,0.9) 0%, rgba(13,13,13,0.5) 55%, rgba(13,13,13,0.25) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-24 md:px-12">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
            07 · The gate
          </p>
          <h2
            className="mb-4 max-w-[12ch] text-harvics-cream"
            data-corridor-reveal
            style={{
              fontFamily: 'var(--font-playfair-display), Georgia, serif',
              fontSize: 'clamp(40px, 7vw, 72px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            HarvicTrade.
          </h2>
          <p className="mb-8 max-w-[40ch] text-[15px] leading-relaxed text-harvics-cream/60" data-corridor-reveal>
            Enterprise B2B marketplace — verified suppliers, escrow-protected settlement, corridors
            across 42+ countries.
          </p>
          <div className="mb-8 flex flex-wrap gap-8 border-t border-harvics-gold/25 pt-6" data-corridor-reveal>
            {[
              ['1,185+', 'Listings'],
              ['42+', 'Countries'],
              ['24h', 'Quote turnaround'],
            ].map(([n, l]) => (
              <div key={l}>
                <strong
                  className="block text-harvics-gold"
                  style={{
                    fontFamily: 'var(--font-playfair-display), Georgia, serif',
                    fontSize: 28,
                    fontWeight: 500,
                  }}
                >
                  {n}
                </strong>
                <span className="text-[10px] uppercase tracking-[0.16em] text-harvics-cream/40">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3" data-corridor-reveal>
            <Link
              href={`/${locale}/harvictrade`}
              className="inline-flex items-center px-6 py-3.5 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              Enter marketplace
            </Link>
            <Link
              href={`/${locale}/portals`}
              className="inline-flex items-center px-6 py-3.5 border border-harvics-cream/35 text-harvics-cream text-[11px] font-bold uppercase tracking-[0.14em] hover:border-harvics-gold hover:text-harvics-gold"
            >
              Open a portal
            </Link>
          </div>
        </div>
      </section>

      {/* 08 · PRODUCTS */}
      <section className="bg-harvics-card px-5 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-harvics-gold">
                08 · In motion
              </p>
              <h2
                className="max-w-[14ch] text-harvics-burgundy"
                data-corridor-reveal
                style={{
                  fontFamily: 'var(--font-playfair-display), Georgia, serif',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                }}
              >
                What moves this week.
              </h2>
            </div>
            <Link
              href={`/${locale}/harvictrade`}
              className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-muted hover:text-harvics-burgundy md:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.name}
                href={`/${locale}/harvictrade`}
                className="group overflow-hidden border border-transparent bg-harvics-cream hover:border-harvics-gold/30"
                data-corridor-reveal
              >
                <div className="aspect-square overflow-hidden bg-harvics-cardMuted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-1.5 min-h-[2.6em] text-[13px] font-semibold leading-snug text-harvics-burgundy">
                    {p.name}
                  </h3>
                  <span className="text-[11px] text-harvics-muted">{p.origin}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 09 · CONTACT (real site section) */}
      <ContactSection />
    </main>
  )
}
