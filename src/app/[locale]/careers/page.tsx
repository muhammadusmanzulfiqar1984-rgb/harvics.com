import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { getTranslations } from 'next-intl/server'

import AnimatedStats from '@/components/ui/AnimatedStats'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'careers')
}

interface CareersPageProps {
  params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'careers' })

  const departments = [
    { key: 'sales', icon: '📊', count: 12 },
    { key: 'supplyChain', icon: '🚚', count: 8 },
    { key: 'technology', icon: '💻', count: 7 },
    { key: 'finance', icon: '💰', count: 6 },
    { key: 'procurement', icon: '🏭', count: 9 },
    { key: 'hr', icon: '👥', count: 4 },
    { key: 'legal', icon: '⚖️', count: 3 },
    { key: 'marketing', icon: '🎨', count: 5 },
  ]

  const benefits = [
    { key: 'globalMobility', icon: '🌍' },
    { key: 'growthTrack', icon: '📈' },
    { key: 'aiCulture', icon: '🤖' },
    { key: 'competitivePackage', icon: '💎' },
    { key: 'learningBudget', icon: '📚' },
    { key: 'flexibleWork', icon: '🏠' },
  ]

  const stats = [
    { num: '54+', label: t('stats.openPositions') },
    { num: '42+', label: t('stats.countries') },
    { num: '10', label: t('stats.industryVerticals') },
    { num: '8', label: t('stats.departmentsHiring') },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop&q=75"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">{t('joinUs')}</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <AnimatedStats
            stats={stats}
            containerClassName="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          />
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">{t('openPositionsByDept')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.key}
              className="bg-white border border-[#C3A35E]/20 p-6 hover:border-[#C3A35E] transition-colors group cursor-pointer"
              style={{ borderRadius: 0, boxShadow: 'none' }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{dept.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-[#6B1F2B]">{t(`departments.${dept.key}.name`)}</h3>
                    <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-3 py-1" style={{ borderRadius: 0 }}>{dept.count} {t('roles')}</span>
                  </div>
                  <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{t(`departments.${dept.key}.desc`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">{t('whyHarvics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.key} className="p-6 border border-[#C3A35E]/15 bg-white" style={{ borderRadius: 0 }}>
                <span className="text-2xl">{b.icon}</span>
                <h3 className="text-base font-semibold text-[#6B1F2B] mt-4 mb-2">{t(`benefits.${b.key}.title`)}</h3>
                <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{t(`benefits.${b.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Link
          href={`/${locale}/contact`}
          className="inline-block px-10 py-4 bg-[#6B1F2B] text-white text-sm font-bold hover:bg-[#5a1a24] transition-colors"
          style={{ borderRadius: 0 }}
        >
          {t('joinUs')}
        </Link>
      </section>
    </main>
  )
}
