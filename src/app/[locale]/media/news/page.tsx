// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'media')
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

interface NewsPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = await params

  const newsItems = [
    { date: 'April 2026', title: 'Harvics OS v2.5 Launches with Neural Governance Layer', excerpt: 'The latest release of our enterprise operating system introduces AI-powered compliance validation on every transaction — checking legal, budget, and contractual obligations in real-time across 40+ jurisdictions before any action executes.' },
    { date: 'March 2026', title: 'Expansion into Southeast Asian Markets', excerpt: 'Harvics Global Ventures announces entry into Vietnam, Thailand, and Indonesia — bringing our multi-vertical trading capabilities to one of the world\'s fastest-growing economic regions. Operations begin Q2 2026.' },
    { date: 'February 2026', title: 'Strategic Partnership with Gulf Logistics Network', excerpt: 'New partnership enables real-time container tracking, cold chain monitoring, and AI-optimised routing across GCC ports — reducing average delivery times by 23% for FMCG and commodities shipments.' },
    { date: 'January 2026', title: 'Harvics Deploys AI Demand Forecasting Across All Verticals', excerpt: 'Six machine learning models now live in production — correlating weather patterns, cultural calendars, competitor intelligence, and historical transactions to predict demand with 89% accuracy across 10 industry verticals.' },
    { date: 'December 2025', title: '42+ Countries Milestone Reached', excerpt: 'Harvics Global Ventures surpasses the 42-country mark with new operations in East Africa and Central Asia. The platform now supports 38 languages with native localisation — not just translation.' },
    { date: 'November 2025', title: 'Multi-Language Platform Supporting 38 Languages', excerpt: 'Full RTL support for Arabic, Hebrew, Farsi, and Urdu. Every module, every label, every document — available in the user\'s native language with culturally appropriate formatting for dates, currencies, and addresses.' },
    { date: 'October 2025', title: 'Carbon-Neutral Operations Commitment', excerpt: 'Harvics commits to carbon-neutral supply chain operations by 2028. Initial programmes include green logistics partnerships, renewable energy procurement for warehousing, and ESG tracking integrated into Harvics OS.' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Press Room</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            News & Press Releases
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            The latest developments from Harvics Global Ventures.
          </p>
        </div>
      </section>

      {/* News List */}
      <section className="max-w-[900px] mx-auto px-4 py-16">
        <div className="space-y-6">
          {newsItems.map((item, index) => (
            <div key={index} className="bg-white border border-[#C3A35E]/15 p-8 hover:border-[#C3A35E] transition-colors">
              <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider mb-3">{item.date}</div>
              <h3 className="text-xl font-semibold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.01em' }}>{item.title}</h3>
              <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{item.excerpt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Media Inquiries</h3>
            <p className="text-white/50 text-sm">For press enquiries, interviews, and media kits contact media@harvics.com</p>
          </div>
          <Link href={`/${locale}/media/contacts`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Media Contacts
          </Link>
        </div>
      </section>
    </main>
  )
}

