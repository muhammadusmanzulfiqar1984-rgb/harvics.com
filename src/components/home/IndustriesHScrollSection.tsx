'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const INDUSTRIES = [
  {
    name: 'Textiles & Apparel',
    sub: 'Denim, fabrics, finished goods',
    img: '/assets/harvictrade/heroes/textiles/01-trench.webp',
    slug: 'textiles',
  },
  {
    name: 'FMCG & Food',
    sub: 'Packaged goods, distribution',
    img: '/assets/harvictrade/heroes/fmcg-hero.webp',
    slug: 'fmcg',
  },
  {
    name: 'Commodities',
    sub: 'Agri, softs, metals, energy',
    img: '/assets/harvictrade/heroes/commodities-hero.webp',
    slug: 'commodities',
  },
  {
    name: 'Industrial & PPE',
    sub: 'Machinery, MRO, safety',
    img: '/assets/harvictrade/heroes/industrial-hero.webp',
    slug: 'industrial',
  },
  {
    name: 'Minerals & Metals',
    sub: 'Industrial & precious metals',
    img: '/assets/harvictrade/heroes/minerals-hero.webp',
    slug: 'minerals',
  },
  {
    name: 'Oil, Gas & Energy',
    sub: 'Upstream to downstream',
    img: '/assets/harvictrade/heroes/energy-hero.webp',
    slug: 'energy',
  },
  {
    name: 'Electronics',
    sub: 'Consumer & enterprise devices',
    img: '/assets/harvictrade/heroes/electronics-hero.webp',
    slug: 'electronics',
  },
]

/**
 * Sticky horizontal industries — CSS sticky + scrub (no GSAP pin-spacer voids).
 */
export default function IndustriesHScrollSection() {
  const locale = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const fill = fillRef.current
    if (!section || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 800px)').matches

    const build = () => {
      ScrollTrigger.getById('industries-hscroll')?.kill()
      gsap.set(track, { x: 0 })

      const travel = Math.max(track.scrollWidth - window.innerWidth, 0)

      if (reduceMotion || isMobile || travel < 40) {
        section.style.height = 'auto'
        if (fill) fill.style.width = '100%'
        return
      }

      // Tall runway; sticky panel fills the viewport while scrubbing cards.
      section.style.height = `${window.innerHeight + travel}px`
      if (fill) fill.style.width = '0%'

      ScrollTrigger.create({
        id: 'industries-hscroll',
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(track, { x: -travel * self.progress })
          if (fill) fill.style.width = `${self.progress * 100}%`
        },
      })
    }

    const imgs = Array.from(track.querySelectorAll('img'))
    let pending = Math.max(imgs.length, 1)
    const ready = () => {
      pending -= 1
      if (pending > 0) return
      requestAnimationFrame(() => {
        build()
        ScrollTrigger.refresh()
      })
    }

    if (!imgs.length) ready()
    imgs.forEach((img) => {
      if (img.complete) ready()
      else {
        img.addEventListener('load', ready, { once: true })
        img.addEventListener('error', ready, { once: true })
      }
    })

    const t1 = window.setTimeout(() => {
      build()
      ScrollTrigger.refresh()
    }, 400)

    const onResize = () => {
      build()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(t1)
      window.removeEventListener('resize', onResize)
      ScrollTrigger.getById('industries-hscroll')?.kill()
      section.style.height = ''
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="relative bg-harvics-cream text-harvics-burgundy"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-harvics-cream pt-[5.5rem] pb-6 md:pt-24">
        <div className="mx-auto mb-5 flex w-full max-w-[1440px] items-end justify-between gap-5 px-5 md:px-12">
          <div>
            <p className="mb-2.5 harvics-corridor-eyebrow text-[11px] tracking-[0.22em]">
              05 · Verticals
            </p>
            <h2
              className="harvics-corridor-display text-harvics-burgundy"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 48px)',
              }}
            >
              Ten industries. One governed stack.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/harvictrade`}
              className="text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/55 hover:text-harvics-gold"
            >
              View all verticals
            </Link>
            <div className="relative h-0.5 w-[90px] overflow-hidden bg-harvics-burgundy/15 md:w-40" aria-hidden>
              <div ref={fillRef} className="absolute inset-y-0 left-0 w-0 bg-harvics-gold" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-full w-max gap-4 px-5 md:px-12"
            style={{ willChange: 'transform' }}
          >
            {INDUSTRIES.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/harvictrade/category/${item.slug}`}
                className="relative h-full w-[min(78vw,300px)] flex-none overflow-hidden bg-[#111] md:w-[min(38vw,480px)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.name}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover brightness-[0.68]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 z-[2]">
                  <strong
                    className="mb-2 block text-harvics-cream"
                    style={{
                      fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
                      fontSize: 'clamp(22px, 2.8vw, 34px)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                    }}
                  >
                    {item.name}
                  </strong>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-harvics-gold">
                    {item.sub}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
