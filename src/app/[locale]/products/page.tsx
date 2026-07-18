// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import ProductSlider from '@/components/ui/ProductSlider'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getMergedFolderBasedCategories } from '@/data/folderBasedProducts'

import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'products')
}


// Generate static params for all locales
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('products')
  const { locale } = await params
  
  // Use merged categories (local FS + R2 generated images)
  const folderCategories = await getMergedFolderBasedCategories()
  const productCategories = (folderCategories || []).map(category => ({
    key: category.key,
    image: category.image || '/assets/brand/photo/logo.png',
    icon: category.icon,
    color: category.color,
    url: `/${locale}${category.url}`
  }))

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        {/* ═══════ HERO ═══════ */}
        <section className="relative bg-gradient-to-br from-harvics-burgundy via-[#5a1a24] to-[#4a1520] py-28 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(195, 163, 94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-harvics-gold/40 to-transparent" />

          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <span className="inline-block text-xs font-bold text-harvics-gold uppercase tracking-[0.25em] mb-5 border border-harvics-gold/30 px-3 py-1">
              Full Catalog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              {t('pageTitle')}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              {t('discoverPremium')}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-harvics-gold/30 to-transparent" />
        </section>

        {/* ═══════ PRODUCT SLIDER ═══════ */}
        <section className="relative z-20 -mt-16 mb-12">
           <div className="max-w-[1200px] mx-auto px-4">
             <div className="bg-white border border-harvics-gold/15 overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(107, 31, 43, 0.08)' }}>
               <ProductSlider categories={folderCategories} />
             </div>
           </div>
        </section>

        {/* ═══════ CATEGORIES GRID ═══════ */}
        <section className="pb-20">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-harvics-gold/50" />
                <span className="text-xs font-bold text-harvics-gold uppercase tracking-[0.2em]">Browse By Category</span>
                <div className="w-6 h-[2px] bg-harvics-gold/50" />
              </div>
              <h2 className="text-3xl font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.02em' }}>
                {t('productCategories')}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {productCategories.map((category, index) => (
                <Link
                  key={index}
                  href={category.url}
                  className="group relative aspect-[4/3] overflow-hidden border border-harvics-gold/10 hover:border-harvics-gold/40 transition-all duration-500"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={category.image} 
                      alt={t(category.key)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-harvics-burgundy/90 via-[#3D1212]/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
                  </div>
                  
                  {/* Top gold accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-harvics-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-harvics-gold transition-colors duration-300" style={{ letterSpacing: '-0.01em' }}>
                      {t(category.key)}
                    </h4>
                    <div className="mt-1 text-xs text-white/40 font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      Explore →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
