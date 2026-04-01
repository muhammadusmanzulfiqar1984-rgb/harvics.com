import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'media')
}

interface MediaPageProps {
  params: Promise<{ locale: string }>
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'media' })

  const sections = [
    {
      icon: '📰',
      title: t('sections.news.title'),
      desc: t('sections.news.desc'),
      href: `/${locale}/media/news`,
      cta: t('sections.news.cta'),
    },
    {
      icon: '📸',
      title: t('sections.gallery.title'),
      desc: t('sections.gallery.desc'),
      href: `/${locale}/media/images`,
      cta: t('sections.gallery.cta'),
    },
    {
      icon: '📞',
      title: t('sections.contacts.title'),
      desc: t('sections.contacts.desc'),
      href: `/${locale}/media/contacts`,
      cta: t('sections.contacts.cta'),
    },
  ]

  const highlights = [
    { num: '40+', label: t('highlights.marketsCovered') },
    { num: '10', label: t('highlights.industryVerticals') },
    { num: '2019', label: t('highlights.foundedIn') },
    { num: '38', label: t('highlights.languagesSupported') },
  ]

  const recentNews = [
    { date: 'Dec 2025', title: t('headlines.expansion') },
    { date: 'Nov 2025', title: t('headlines.aiPlatform') },
    { date: 'Oct 2025', title: t('headlines.carbonNeutral') },
    { date: 'Sep 2025', title: t('headlines.partnership') },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">{t('corporate')}</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {highlights.map((h) => (
            <div key={h.label}>
              <div className="text-2xl font-bold text-[#C3A35E]">{h.num}</div>
              <div className="text-xs text-white/50 mt-1">{h.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Sections */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white border border-[#C3A35E]/20 p-8 flex flex-col" style={{ borderRadius: 0, boxShadow: 'none' }}>
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-3">{s.title}</h3>
              <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-6 flex-1">{s.desc}</p>
              <Link
                href={s.href}
                className="inline-block px-6 py-3 bg-[#6B1F2B] text-white text-sm font-semibold hover:bg-[#5a1a24] transition-colors text-center"
                style={{ borderRadius: 0 }}
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Headlines */}
      <section className="bg-white border-t border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">{t('recentHeadlines')}</h2>
          <div className="space-y-4 max-w-[800px] mx-auto">
            {recentNews.map((n) => (
              <Link
                key={n.title}
                href={`/${locale}/media/news`}
                className="flex items-center gap-4 p-5 border border-[#C3A35E]/15 bg-white hover:border-[#C3A35E] transition-colors group"
                style={{ borderRadius: 0 }}
              >
                <span className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider whitespace-nowrap min-w-[80px]">{n.date}</span>
                <span className="text-sm font-medium text-[#6B1F2B] group-hover:text-[#6B1F2B]/80">{n.title}</span>
              </Link>
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
          {t('sections.contacts.cta')}
        </Link>
      </section>
    </main>
  )
}
