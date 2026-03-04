// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')
  const categories = getFolderBasedCategories()
  
  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        {/* Hero */}
        <section className="relative bg-[#6B1F2B] py-24 px-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-5" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">Since 2019 · Dubai, UAE</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              {t('title')}
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>
        
        {/* Story Card */}
        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#C3A35E]/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">Our Story</div>
                  <h2 className="text-3xl font-bold text-[#6B1F2B] mb-6" style={{ letterSpacing: '-0.02em' }}>{t('ourStory')}</h2>
                  <p className="text-[#6B1F2B]/60 mb-6 leading-relaxed text-base">
                    {t('story1')}
                  </p>
                  <p className="text-[#6B1F2B]/60 mb-8 leading-relaxed text-base">
                    {t('story2')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-[#F5F1E8] px-6 py-3 border border-[#C3A35E]/20">
                      <span className="text-[#6B1F2B] font-bold text-sm uppercase tracking-wide">{t('est2018')}</span>
                    </div>
                    <div className="bg-[#F5F1E8] px-6 py-3 border border-[#C3A35E]/20">
                      <span className="text-[#6B1F2B] font-bold text-sm uppercase tracking-wide">{t('countries40')}</span>
                    </div>
                    <div className="bg-[#F5F1E8] px-6 py-3 border border-[#C3A35E]/20">
                      <span className="text-[#6B1F2B] font-bold text-sm uppercase tracking-wide">{t('productLines6')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative order-1 lg:order-2 flex items-center justify-center">
                  <div className="w-full h-64 md:h-96 flex items-center justify-center bg-[#F5F1E8] border border-[#C3A35E]/20 p-8 md:p-12">
                    <img 
                      src="/Images/logo.png" 
                      alt="Harvics Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="px-4 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-3">What We Do</div>
              <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>10 Industry Verticals. One Platform.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: '🧵', label: 'Textiles' },
                { icon: '🛒', label: 'FMCG' },
                { icon: '📦', label: 'Commodities' },
                { icon: '🏭', label: 'Industrial' },
                { icon: '⛏️', label: 'Minerals' },
                { icon: '🛢️', label: 'Oil & Gas' },
                { icon: '🏢', label: 'Real Estate' },
                { icon: '🔍', label: 'Sourcing' },
                { icon: '💳', label: 'Finance' },
                { icon: '🤖', label: 'AI & Tech' },
              ].map((v) => (
                <div key={v.label} className="bg-white border border-[#C3A35E]/20 p-6 text-center hover:border-[#C3A35E] transition-colors">
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <div className="text-sm font-semibold text-[#6B1F2B]">{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Numbers */}
        <section className="bg-[#6B1F2B] py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '40+', label: 'Countries' },
                { value: '10', label: 'Industry Verticals' },
                { value: '38', label: 'Languages Supported' },
                { value: '2019', label: 'Founded' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-bold text-[#C3A35E] mb-2">{stat.value}</div>
                  <div className="text-sm text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="py-16 px-4">
          <div className="max-w-[1200px] mx-auto text-center">
            <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-3">Global Presence</div>
            <h2 className="text-3xl font-bold text-[#6B1F2B] mb-8" style={{ letterSpacing: '-0.02em' }}>Dubai · London · Lahore · Karachi</h2>
            <p className="text-[#6B1F2B]/60 max-w-2xl mx-auto leading-relaxed">
              Headquartered in Dubai, UAE with operations spanning the Middle East, South Asia, Europe, and Africa. 
              Our multi-regional presence enables real-time market intelligence and rapid execution.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
