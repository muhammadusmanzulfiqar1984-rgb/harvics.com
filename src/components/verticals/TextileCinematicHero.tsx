'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const HERO_VIDEO = '/assets/harvictrade/heroes/textiles/hero-cinematic.mp4'
const HERO_POSTER = '/assets/harvictrade/heroes/textiles/04-silk.webp'

interface TextileCinematicHeroProps {
  locale: string
  label: string
  tagline: string
}

export default function TextileCinematicHero({
  locale,
  label,
  tagline,
}: TextileCinematicHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [src, setSrc] = useState(HERO_VIDEO)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.setAttribute('webkit-playsinline', 'true')

    const markPlaying = () => setIsPlaying(true)
    const play = () => {
      const p = el.play()
      if (p) void p.then(markPlaying).catch(() => {})
    }

    const onTimeUpdate = () => {
      const t = el.currentTime % 5
      setTitleVisible(t >= 4 && t < 4.95)
    }
    const onError = () => {
      setIsPlaying(false)
    }

    play()
    el.addEventListener('loadeddata', play)
    el.addEventListener('canplay', play)
    el.addEventListener('playing', markPlaying)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('error', onError)

    return () => {
      el.removeEventListener('loadeddata', play)
      el.removeEventListener('canplay', play)
      el.removeEventListener('playing', markPlaying)
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('error', onError)
    }
  }, [src])

  return (
    <section className="relative min-h-[78vh] overflow-hidden border-b border-harvics-gold/30 md:min-h-[84vh]">
      <div className="absolute inset-0 z-0">
        <HarvicsImage
          src={HERO_POSTER}
          alt=""
          fill
          sizes={IMAGE_SIZES.hero}
          priority
          className="object-cover transition-opacity duration-700"
          style={{ opacity: isPlaying ? 0 : 1 }}
        />
      </div>

      <video
        ref={videoRef}
        key={src}
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        style={{
          filter: 'brightness(0.88) contrast(1.06) saturate(1.02)',
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
        poster={HERO_POSTER}
        src={src}
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(112deg, rgba(245,240,232,0.06) 0%, rgba(61,18,18,0.42) 38%, rgba(61,18,18,0.72) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.35]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 72% 40%, rgba(195,163,94,0.12) 0%, transparent 58%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center text-center transition-opacity duration-[900ms] ease-out"
        style={{ opacity: titleVisible ? 1 : 0 }}
        aria-hidden={!titleVisible}
      >
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-[0.55em] text-[#F5F0E8]/90"
          style={{ fontFamily: 'var(--font-serif, Georgia, "Times New Roman", serif)' }}
        >
          Harvics
        </p>
        <p
          className="text-sm font-normal uppercase tracking-[0.38em] text-[#C3A35E]/95 md:text-base"
          style={{ fontFamily: 'var(--font-serif, Georgia, "Times New Roman", serif)' }}
        >
          Textile &amp; Apparel
        </p>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-[1200px] flex-col justify-end px-4 py-14 md:min-h-[84vh] md:py-20">
        <nav className="mb-5 flex items-center gap-2 text-xs text-white/50">
          <Link href={`/${locale}`} className="transition-colors hover:text-harvics-gold">
            Home
          </Link>
          <span>→</span>
          <span className="text-harvics-gold/85">{label}</span>
        </nav>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-harvics-gold/90">
          {tagline}
        </p>

        <h1
          className="mb-4 max-w-[16ch] text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-[68px]"
          style={{ letterSpacing: '-0.03em' }}
        >
          {label}
        </h1>

        <p className="mb-8 max-w-[480px] text-base leading-relaxed text-white/70 md:text-lg">
          Heritage craftsmanship and factory-direct apparel supply — from premium woven fabrics to
          finished collections across Europe, the GCC and South Asia.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center bg-harvics-gold px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-harvics-burgundy transition hover:bg-[#d4b46e]"
          >
            Get a Quote
          </Link>
          <a
            href="#products"
            className="inline-flex items-center justify-center border border-white/30 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/90 transition hover:border-harvics-gold"
          >
            Browse Products
          </a>
        </div>
      </div>
    </section>
  )
}
