// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'investors')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface PublicationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function PublicationsPage({ params }: PublicationsPageProps) {
  const { locale } = await params

  const navItems = [
    { label: 'Governance', href: `/${locale}/investors/governance`, active: false },
    { label: 'Shares & Bonds', href: `/${locale}/investors/shares`, active: false },
    { label: 'Publications', href: `/${locale}/investors/publications`, active: true },
  ]

  const publications = [
    { year: '2026', title: 'H1 2026 Investor Update', type: 'PDF', category: 'Investor Update', desc: 'Half-year performance summary covering trade volume growth, market expansion, and Harvics OS platform milestones.' },
    { year: '2025', title: 'Annual Report 2025', type: 'PDF', category: 'Annual Report', desc: 'Comprehensive review of operations across 42+ countries, financial performance, and strategic outlook for 2026.' },
    { year: '2025', title: 'ESG & Sustainability Report 2025', type: 'PDF', category: 'ESG Report', desc: 'Environmental, social, and governance performance metrics including carbon footprint, supply chain ethics, and community impact.' },
    { year: '2025', title: 'Technology & AI Platform Overview', type: 'PDF', category: 'Technology', desc: 'Technical overview of Harvics OS — the AI-powered enterprise operating system covering 10 industry verticals and 20 business domains.' },
    { year: '2024', title: 'Annual Report 2024', type: 'PDF', category: 'Annual Report', desc: 'Year-end review covering expansion to 42+ countries, launch of AI-driven demand forecasting, and multi-language platform deployment.' },
    { year: '2024', title: 'Corporate Governance Report 2024', type: 'PDF', category: 'Governance', desc: 'Board composition, committee activities, risk management framework, and compliance programme performance across all jurisdictions.' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Investors</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Publications & Reports
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Financial reports, ESG disclosures, and investor communications from Harvics Global Ventures.
          </p>
        </div>
      </section>

      {/* Investor Nav */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 flex gap-0">
          {navItems.map((n) => (
            <Link key={n.label} href={n.href}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${n.active ? 'text-[#C3A35E] border-b-2 border-[#C3A35E]' : 'text-white/50 hover:text-white/80'}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Publications List */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="space-y-4">
          {publications.map((pub, index) => (
            <div key={index} className="bg-white border border-[#C3A35E]/15 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#C3A35E] transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-2 py-0.5 uppercase tracking-wider">{pub.category}</span>
                  <span className="text-xs text-[#6B1F2B]/40">{pub.year}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#6B1F2B] mb-1">{pub.title}</h3>
                <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{pub.desc}</p>
              </div>
              <span className="flex-shrink-0 px-6 py-3 bg-[#6B1F2B] text-white text-sm font-bold hover:bg-[#5a1a24] transition-colors cursor-pointer">
                Request {pub.type}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#6B1F2B]/40 text-center mt-8">
          To request access to publications, please contact ir@harvics.com with your institutional details.
        </p>
      </section>
    </main>
  )
}

