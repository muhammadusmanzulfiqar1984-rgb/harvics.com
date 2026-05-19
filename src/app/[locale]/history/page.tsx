import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'history')
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params
  const t = await getTranslations('history')

  const milestones = [
    { year: '2019', title: t('milestones.2019.title'), description: t('milestones.2019.description'), highlight: t('milestones.2019.highlight') },
    { year: '2020', title: t('milestones.2020.title'), description: t('milestones.2020.description'), highlight: t('milestones.2020.highlight') },
    { year: '2021', title: t('milestones.2021.title'), description: t('milestones.2021.description'), highlight: t('milestones.2021.highlight') },
    { year: '2022', title: t('milestones.2022.title'), description: t('milestones.2022.description'), highlight: t('milestones.2022.highlight') },
    { year: '2023', title: t('milestones.2023.title'), description: t('milestones.2023.description'), highlight: t('milestones.2023.highlight') },
    { year: '2024', title: t('milestones.2024.title'), description: t('milestones.2024.description'), highlight: t('milestones.2024.highlight') },
    { year: '2025', title: t('milestones.2025.title'), description: t('milestones.2025.description'), highlight: t('milestones.2025.highlight') },
    { year: '2026', title: t('milestones.2026.title'), description: t('milestones.2026.description'), highlight: t('milestones.2026.highlight') },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=600&fit=crop&q=75"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Since 2019</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-[900px] mx-auto px-4 py-16">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-[#C3A35E]/20" />

          <div className="space-y-8">
            {milestones.map((m, idx) => (
              <div key={m.year} className="relative flex gap-6">
                {/* Year circle */}
                <div className="flex-shrink-0 w-20 h-20 bg-[#6B1F2B] border-2 border-[#C3A35E]/40 flex items-center justify-center z-10" style={{ borderRadius: 0 }}>
                  <span className="text-[#C3A35E] font-bold text-sm">{m.year}</span>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white border border-[#C3A35E]/20 p-6 hover:border-[#C3A35E] transition-colors" style={{ borderRadius: 0, boxShadow: 'none' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#6B1F2B]">{m.title}</h3>
                    <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-3 py-1" style={{ borderRadius: 0 }}>{m.highlight}</span>
                  </div>
                  <p className="text-sm text-[#6B1F2B]/60 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('cta.title')}</h3>
            <p className="text-white/50 text-sm">{t('cta.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/careers`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </main>
  )
}

