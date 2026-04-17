// Header and Footer are provided by layout.tsx - DO NOT import them here
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'about')
}

interface BrandStoryPageProps {
  params: Promise<{ locale: string }>
}

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

export default async function BrandStoryPage({ params }: BrandStoryPageProps) {
  const { locale } = await params

  const chapters = [
    {
      year: '2019',
      title: 'The Founding Vision',
      text: 'Harvics Global Ventures was established in Dubai, UAE, by Muhammad Usman Zulfiqar with a singular conviction: that emerging markets deserve enterprise-grade commercial infrastructure — not watered-down versions of Western systems, but purpose-built platforms designed for the complexity of cross-border, multi-currency, multi-regulatory trade.',
    },
    {
      year: '2020',
      title: 'Resilience Through Disruption',
      text: 'While the world paused, Harvics accelerated. We expanded to 10 countries across Europe, the Middle East, and South Asia — building remote distribution partnerships and digital supply chain capabilities that would become the foundation of our operating model. The pandemic proved that digitally-native trade infrastructure was not optional — it was existential.',
    },
    {
      year: '2021–2022',
      title: 'Multi-Vertical Architecture',
      text: 'We expanded beyond FMCG and textiles into commodities, industrial equipment, minerals, oil & gas, real estate, sourcing solutions, financial services, and AI technology. Ten industries, one universal data model. This was the year we decided to build a platform, not just a trading company — the genesis of Harvics OS.',
    },
    {
      year: '2023–2024',
      title: 'Intelligence at Scale',
      text: 'Harvics OS became the nervous system of the business. Six machine learning models went live — demand forecasting, dynamic pricing, territory coverage, SKU optimization, strategy generation, and competitor intelligence. We reached 40+ countries, 38 languages, and deployed AI-driven governance that validates every transaction against legal, budget, and compliance rules before execution.',
    },
    {
      year: '2025–2026',
      title: 'The Operating System Era',
      text: 'Today, Harvics is building what no enterprise software company has attempted: a single AI-operated platform spanning 10 industries across 60+ countries — where procurement, logistics, finance, CRM, and manufacturing run on predictive intelligence with human approval gates. Not an ERP. Not a CRM. An operating system for global commerce.',
    },
  ]

  const values = [
    { icon: '⚡', title: 'Execution Over Theory', desc: 'We ship. Every strategy must convert to measurable commercial output.' },
    { icon: '🌍', title: 'Native Globalisation', desc: 'Not translation — true context switching. Currency, tax, culture, regulation — all automatic.' },
    { icon: '🔒', title: 'Governance by Design', desc: 'Every transaction passes through legal, budget, and compliance checks before execution.' },
    { icon: '🧠', title: 'Intelligence First', desc: 'AI is not a feature. It is the nervous system that runs through every module.' },
    { icon: '🤝', title: 'Trust as Infrastructure', desc: 'In emerging markets, commercial trust is the hardest asset to build and the most valuable to hold.' },
    { icon: '📐', title: 'Architecture Discipline', desc: 'One schema, one backend, one AI brain. Complexity is the enemy of scale.' },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-28 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E]/40 to-transparent" />
          <div className="relative z-10 max-w-[900px] mx-auto text-center">
            <span className="inline-block text-xs font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-5 border border-[#C3A35E]/30 px-3 py-1">
              Our Brand Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              Building the Commercial Infrastructure the World Needs
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              From a Dubai-based trading venture to a global AI-powered enterprise platform — this is the story of how Harvics is redefining what commercial systems can be.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />
        </section>

        {/* Timeline Chapters */}
        <section className="max-w-[900px] mx-auto px-4 py-20">
          <div className="relative">
            <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-[#C3A35E]/20" />
            <div className="space-y-10">
              {chapters.map((ch) => (
                <div key={ch.year} className="relative flex gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-[#6B1F2B] border-2 border-[#C3A35E]/40 flex items-center justify-center z-10">
                    <span className="text-[#C3A35E] font-bold text-xs">{ch.year}</span>
                  </div>
                  <div className="flex-1 bg-white border border-[#C3A35E]/15 p-8">
                    <h3 className="text-xl font-bold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.01em' }}>{ch.title}</h3>
                    <p className="text-[#6B1F2B]/55 leading-relaxed text-base">{ch.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="px-4 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">What Drives Us</span>
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              </div>
              <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>Our Core Principles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-white border border-[#C3A35E]/15 p-8">
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="text-lg font-bold text-[#6B1F2B] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission CTA */}
        <section className="bg-[#6B1F2B] py-16 px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              &ldquo;Design intelligent, future-ready commercial systems that convert opportunity into sustained global value.&rdquo;
            </h2>
            <p className="text-white/40 text-sm uppercase tracking-[0.15em] mt-6">— The Harvics Mission</p>
            <div className="mt-10">
              <Link
                href={`/${locale}/about`}
                className="inline-block px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
              >
                Back to About
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

