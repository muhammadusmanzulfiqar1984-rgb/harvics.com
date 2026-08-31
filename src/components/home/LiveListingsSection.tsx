'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const PRODUCTS = [
  {
    name: 'Harvics Energy — Health Edition',
    meta: 'EU · EXW · Private label / bulk',
    img: '/assets/harvictrade/products/harvics-energy-drink.webp',
  },
  {
    name: 'Premium Linen Shirt Capsule — SS26',
    meta: 'EU · EXW Milan · MOQ 2,000 pcs',
    img: '/assets/harvictrade/products/apparel-linen-still.webp',
  },
  {
    name: 'Hi-Vis Safety Jacket EN20471 Class 3',
    meta: 'Turkey · EXW Istanbul · 5,000 pcs',
    img: '/assets/harvictrade/products/safety-jacket.webp',
  },
  {
    name: 'Copper Cathode Grade A — LME Registered',
    meta: 'Chile · CIF Rotterdam · 500 MT',
    img: '/assets/harvictrade/products/copper-cathode.webp',
  },
  {
    name: 'iPhone 17 Pro Max — 256GB',
    meta: 'Global · DDP · Bulk allocation',
    img: '/assets/harvictrade/products/iphone.webp',
  },
  {
    name: 'Extra Virgin Olive Oil — 1L Glass',
    meta: 'Spain · FOB Valencia · 2×40ft',
    img: '/assets/harvictrade/products/olive-oil.webp',
  },
  {
    name: 'Diesel EN590 10ppm — FOB',
    meta: 'UAE · FOB Jebel Ali · 5,000 MT',
    img: '/assets/harvictrade/products/diesel-tanker.webp',
  },
  {
    name: 'Portland Cement 42.5N — Bulk',
    meta: 'UAE · CIF East Africa · 10,000 MT',
    img: '/assets/harvictrade/products/cement.webp',
  },
  {
    name: 'Samsung Galaxy S25 Ultra — 256GB',
    meta: 'Global · DDP · Enterprise lot',
    img: '/assets/harvictrade/products/galaxy-phone.webp',
  },
]

/**
 * Trial 09 — live listings / cargo grid on cream.
 */
export default function LiveListingsSection() {
  const locale = useLocale()

  return (
    <section id="products" className="border-t border-harvics-gold/15 bg-harvics-cream px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 harvics-corridor-eyebrow text-[11px] tracking-[0.22em]">
              09 · Live listings
            </p>
            <h2
              className="harvics-corridor-display max-w-[16ch] text-harvics-burgundy"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
              }}
            >
              Moving through the corridor now.
            </h2>
          </div>
          <Link
            href={`/${locale}/harvictrade`}
            className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50 hover:text-harvics-gold md:block"
          >
            Browse marketplace →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {PRODUCTS.map((p) => (
            <Link
              key={p.name}
              href={`/${locale}/harvictrade`}
              className="group overflow-hidden border border-transparent bg-harvics-card hover:border-harvics-gold/35"
            >
              <div className="relative aspect-square overflow-hidden bg-harvics-cardMuted">
                <HarvicsImage
                  src={p.img}
                  alt={p.name}
                  fill
                  sizes={IMAGE_SIZES.productGrid}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-1.5 min-h-[2.6em] text-[13px] font-semibold leading-snug text-harvics-burgundy">
                  {p.name}
                </h3>
                <span className="text-[11px] text-harvics-muted">{p.meta}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
