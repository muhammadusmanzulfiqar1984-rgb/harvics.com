// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'offers')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface SpecialOffersPageProps {
  params: Promise<{ locale: string }>
}

export default async function SpecialOffersPage({ params }: SpecialOffersPageProps) {
  const { locale } = await params

  const featured = {
    title: 'Q2 2026 — Volume Commitment Programme',
    desc: 'Lock in preferential pricing across FMCG, textiles, and commodities by committing to quarterly volumes. Early commitments secure priority allocation during peak demand periods (Ramadan, Back-to-School, Festive Season).',
    benefits: ['5–15% below standard trade pricing', 'Priority allocation during peak seasons', 'Dedicated account manager', 'Flexible delivery scheduling across all markets'],
  }

  const offers = [
    { icon: '🚀', title: 'New Market Entry Package', desc: 'First-time buyers in new territories receive introductory pricing, sample shipments at cost, and a dedicated onboarding specialist. Available for buyers in Africa, Central Asia, and Southeast Asia.', tag: 'New Buyers', validity: 'Ongoing' },
    { icon: '📦', title: 'Full Container Load Discount', desc: 'Order a full 20ft or 40ft container across any product category and receive automatic volume discount. Combinable with seasonal offers. All Incoterms supported.', tag: 'Volume', validity: 'Permanent' },
    { icon: '🤝', title: 'Distributor Partnership Tier', desc: 'Exclusive distributors with annual commitments above $500K receive tiered rebates, marketing support funding, and co-branded materials. Includes access to Harvics OS distributor portal.', tag: 'Partners', validity: 'Annual' },
    { icon: '🔄', title: 'Multi-Vertical Bundle', desc: 'Combine orders across 2 or more verticals (e.g., FMCG + Textiles) in a single shipment and receive consolidated logistics pricing plus a 7% cross-vertical discount.', tag: 'Bundle', validity: 'Ongoing' },
    { icon: '📅', title: 'Pre-Season Booking Incentive', desc: 'Book seasonal stock 60+ days in advance and lock current pricing with no price escalation clause. Applies to Ramadan, Summer, Back-to-School, and Festive season lines.', tag: 'Seasonal', validity: 'Per Season' },
    { icon: '💳', title: 'Early Payment Discount', desc: 'Settle invoices within 10 days of shipment and receive a 2.5% cash discount. Available on all trade terms. Applicable to LC at sight and TT payments.', tag: 'Finance', validity: 'Permanent' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Trade Programmes</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Special Trade Offers
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Structured incentive programmes for buyers, distributors, and trade partners across all 10 verticals.
          </p>
        </div>
      </section>

      {/* Featured Programme */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="bg-[#6B1F2B] p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/20 px-3 py-1 uppercase tracking-wider">Featured</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>{featured.title}</h2>
          <p className="text-white/55 leading-relaxed mb-8 max-w-3xl">{featured.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featured.benefits.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <span className="text-[#C3A35E]">✓</span>
                <span className="text-sm text-white/70">{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href="mailto:trade@harvics.com" className="inline-block px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors">
              Enquire About Volume Commitment
            </a>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-[1200px] mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">All Trade Programmes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.title} className="bg-white border border-[#C3A35E]/15 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{offer.icon}</span>
                <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-2 py-0.5 uppercase tracking-wider">{offer.tag}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-3">{offer.title}</h3>
              <p className="text-sm text-[#6B1F2B]/55 leading-relaxed mb-6 flex-1">{offer.desc}</p>
              <div className="border-t border-[#C3A35E]/10 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B1F2B]/40">Validity</span>
                  <span className="font-semibold text-[#6B1F2B]">{offer.validity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Custom Trade Terms Available</h3>
            <p className="text-white/50 text-sm">For bespoke pricing, exclusive territory rights, or white-label partnerships — speak with our commercial team.</p>
          </div>
          <a href="mailto:trade@harvics.com"
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Contact Commercial Team
          </a>
        </div>
      </section>
    </main>
  )
}

