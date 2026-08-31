'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const TEXTILE_HEROES = [
  '/assets/harvictrade/heroes/textiles/01-trench.webp',
  '/assets/harvictrade/heroes/textiles/02-rack.webp',
  '/assets/harvictrade/heroes/textiles/03-denim.webp',
  '/assets/harvictrade/heroes/textiles/04-silk.webp',
]

type Props = {
  locale: string
  name: string
  icon: string
  desc: string
  productCount: number
  subcategoryCount: number
}

/** Full-bleed rotating textile hero — Zara-style campaign slides. */
export default function TextileCategoryHero({
  locale,
  name,
  icon,
  desc,
  productCount,
  subcategoryCount,
}: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % TEXTILE_HEROES.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <section
      className="relative min-h-[58vh] overflow-hidden border-b border-harvics-gold/40 md:min-h-[68vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {TEXTILE_HEROES.map((src, i) => (
        <HarvicsImage
          key={src}
          src={src}
          alt={name}
          fill
          sizes={IMAGE_SIZES.hero}
          priority={i === 0}
          className="object-cover transition-opacity duration-[1100ms] ease-out"
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1)' : 'scale(1.04)',
            transition: 'opacity 1.1s ease, transform 6s ease',
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(61,18,18,0.88) 0%, rgba(61,18,18,0.55) 48%, rgba(13,13,13,0.35) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-[1200px] flex-col justify-end px-4 py-14 md:min-h-[68vh] md:py-20">
        <div className="mb-4 flex items-center gap-2 text-xs text-white/50">
          <Link href={`/${locale}/harvictrade`} className="transition-colors hover:text-harvics-gold">
            HarvicTrade
          </Link>
          <span>→</span>
          <span className="text-harvics-gold">{name}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-5xl">{icon}</span>
          <div>
            <h1
              className="mb-2 text-3xl font-bold text-white md:text-5xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              {name}
            </h1>
            <p className="max-w-2xl text-white/65">{desc}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="flex gap-6">
            <div>
              <span className="text-xl font-bold text-harvics-gold">
                {productCount.toLocaleString()}
              </span>
              <span className="ml-2 text-xs text-white/50">Products</span>
            </div>
            <div>
              <span className="text-xl font-bold text-harvics-gold">{subcategoryCount}</span>
              <span className="ml-2 text-xs text-white/50">Subcategories</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
