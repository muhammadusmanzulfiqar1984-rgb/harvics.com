// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import AnimatedStats from '@/components/ui/AnimatedStats'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'investors')
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

interface SharesPageProps {
  params: Promise<{ locale: string }>
}

export default async function SharesPage({ params }: SharesPageProps) {
  const { locale } = await params

  const navItems = [
    { label: 'Governance', href: `/${locale}/investors/governance`, active: false },
    { label: 'Shares & Bonds', href: `/${locale}/investors/shares`, active: true },
    { label: 'Publications', href: `/${locale}/investors/publications`, active: false },
  ]

  const instruments = [
    { type: 'Equity', name: 'Harvics Global Ventures', status: 'Private', exchange: 'Pre-IPO', desc: 'Harvics remains a privately held company. We are evaluating strategic options for public listing as part of our 2027–2028 growth roadmap.' },
    { type: 'Bonds', name: 'Trade Finance Notes', status: 'Limited Offering', exchange: 'Private Placement', desc: 'Structured trade finance instruments available to qualified institutional investors. Backed by receivables across 40+ markets with diversified industry exposure.' },
    { type: 'Sukuk', name: 'Harvics Sukuk Programme', status: 'In Development', exchange: 'DFSA Regulated', desc: 'Sharia-compliant investment certificates structured under Murabaha and Wakala frameworks, designed for GCC and Southeast Asian institutional investors.' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Investors</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Shares, Bonds & Instruments
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Investment opportunities and capital market instruments from Harvics Global Ventures.
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

      {/* Instruments */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="space-y-6">
          {instruments.map((inst) => (
            <div key={inst.name} className="bg-white border border-[#C3A35E]/15 p-8 flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <span className="inline-block text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-3 py-1 uppercase tracking-wider">{inst.type}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#6B1F2B] mb-1">{inst.name}</h3>
                <div className="flex gap-4 mb-3">
                  <span className="text-xs text-[#6B1F2B]/40">{inst.status}</span>
                  <span className="text-xs text-[#6B1F2B]/40">·</span>
                  <span className="text-xs text-[#6B1F2B]/40">{inst.exchange}</span>
                </div>
                <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{inst.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-[#6B1F2B] py-14 px-4">
        <div className="max-w-[1200px] mx-auto">
          <AnimatedStats
            stats={[
              { num: '42+', label: 'Operating Countries' },
              { num: '10', label: 'Industry Verticals' },
              { num: '$250M+', label: 'Trade Volume (Annual)' },
              { num: 'A-', label: 'Internal Credit Rating' },
            ]}
            containerClassName="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="bg-white border border-[#C3A35E]/15 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-4">Interested in Investing?</h2>
          <p className="text-sm text-[#6B1F2B]/55 max-w-2xl mx-auto mb-8 leading-relaxed">
            For detailed investment information, term sheets, and due diligence materials, please contact our investor relations team directly.
          </p>
          <a href="mailto:ir@harvics.com"
            className="inline-block px-8 py-3 bg-[#6B1F2B] text-white text-sm font-bold hover:bg-[#5a1a24] transition-colors">
            Contact IR Team — ir@harvics.com
          </a>
        </div>
      </section>
    </main>
  )
}

