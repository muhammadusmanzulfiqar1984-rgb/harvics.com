// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const benefits = [
    { icon: '🌍', title: 'Access 50+ Buyer Markets', desc: 'Your products are visible to verified B2B buyers across the Middle East, Africa, Europe, South Asia, and Southeast Asia — without any sales team overhead.' },
    { icon: '🧠', title: 'AI-Powered Lead Matching', desc: 'Our AI engine matches your products to active buyer RFQs in real-time. No cold outreach. Only qualified, ready-to-buy leads.' },
    { icon: '💳', title: 'Secure Payment Guarantee', desc: 'Trade Assurance through escrow, LC, and TT — funds are secured before you ship. Zero payment risk on covered transactions.' },
    { icon: '📊', title: 'Seller Analytics Dashboard', desc: 'Track views, RFQ conversions, buyer demographics, and competitive positioning. Optimise your listings with data-driven insights.' },
    { icon: '📦', title: 'Integrated Logistics', desc: 'Harvics handles freight forwarding, customs clearance, and documentation. You focus on production — we handle the shipment.' },
    { icon: '✅', title: 'Verified Supplier Badge', desc: 'Complete our verification process (business license, factory audit, trade references) and earn the Verified Supplier badge that buyers trust.' },
  ]

  const tiers = [
    { name: 'Starter', price: 'Free', features: ['Up to 10 product listings', 'Basic buyer matching', 'Email RFQ notifications', 'Standard profile page'], cta: 'Get Started Free', highlight: false },
    { name: 'Growth', price: '$99/month', features: ['Up to 100 product listings', 'AI-powered lead matching', 'Priority in search results', 'Analytics dashboard', 'Verified Supplier badge', 'Dedicated account manager'], cta: 'Start Growth Plan', highlight: true },
    { name: 'Enterprise', price: 'Custom', features: ['Unlimited product listings', 'Premium placement & ads', 'Custom storefront page', 'API integration', 'Multi-user access', 'Trade finance facilitation', 'White-label catalogue'], cta: 'Contact Sales', highlight: false },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
        </div>
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-5 border border-[#C3A35E]/30 px-4 py-1.5">
            For Suppliers & Manufacturers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
            Sell to the World.<br />
            <span className="text-[#C3A35E]">From Day One.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            List your products on HarvicTrade and reach verified B2B buyers in 42+ countries. No cold calls. No trade shows. Just qualified leads, AI-matched to your catalogue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/harvictrade/register`}
              className="px-8 py-4 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#d4b46e] transition-colors">
              Register as Supplier
            </Link>
            <Link href={`/${locale}/contact`}
              className="px-8 py-4 border border-[#C3A35E]/50 text-[#C3A35E] font-bold text-sm uppercase tracking-wider hover:bg-[#C3A35E]/10 transition-colors">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>Why Sell on HarvicTrade?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white border border-[#C3A35E]/15 p-8">
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-lg font-bold text-[#6B1F2B] mb-2">{b.title}</h3>
              <p className="text-sm text-[#6B1F2B]/50 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="bg-white border-t border-[#C3A35E]/15 py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>Seller Plans</h2>
            <p className="text-[#6B1F2B]/50 mt-2">Start free. Scale when you are ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {tiers.map((tier) => (
              <div key={tier.name} className={`p-8 flex flex-col ${tier.highlight ? 'bg-[#6B1F2B] text-white border-2 border-[#C3A35E]' : 'bg-white border border-[#C3A35E]/15'}`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${tier.highlight ? 'text-[#C3A35E]' : 'text-[#6B1F2B]'}`}>{tier.name}</h3>
                  <div className={`text-3xl font-bold ${tier.highlight ? 'text-white' : 'text-[#6B1F2B]'}`}>{tier.price}</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={tier.highlight ? 'text-[#C3A35E]' : 'text-[#C3A35E]'}>✓</span>
                      <span className={tier.highlight ? 'text-white/80' : 'text-[#6B1F2B]/60'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 font-bold text-sm uppercase tracking-wider transition-colors ${tier.highlight ? 'bg-[#C3A35E] text-[#6B1F2B] hover:bg-[#d4b46e]' : 'bg-[#6B1F2B] text-white hover:bg-[#5a1a24]'}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Grow Your Export Business?</h3>
          <p className="text-white/40 max-w-xl mx-auto mb-8 text-sm">Join 1,200+ suppliers already selling on HarvicTrade. Your products. Our global network.</p>
          <Link href={`/${locale}/harvictrade/register`}
            className="inline-block px-10 py-4 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#d4b46e] transition-colors">
            Start Selling Today
          </Link>
        </div>
      </section>
    </main>
  )
}
