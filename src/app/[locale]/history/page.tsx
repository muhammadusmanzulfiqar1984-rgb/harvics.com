import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our History | Harvics',
  description: 'From a Dubai startup in 2019 to a global enterprise spanning 40+ countries — the Harvics journey.',
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params

  const milestones = [
    { year: '2019', title: 'Founded in Dubai', description: 'Harvics Global Ventures established in the UAE with a vision to become a world-class FMCG and multi-vertical trading conglomerate. First operations launched across textiles and consumer goods.', highlight: 'Year One' },
    { year: '2020', title: 'First International Expansion', description: 'Expanded to 10 countries across Europe, Middle East, and South Asia despite global pandemic challenges. Launched digital supply chain operations and remote distribution partnerships.', highlight: '10 Countries' },
    { year: '2021', title: 'Multi-Vertical Expansion', description: 'Launched 5 new industry verticals: Commodities, Industrial Equipment, Minerals & Mining, Oil & Gas, and Real Estate. Total product catalog exceeded 500 SKUs across all verticals.', highlight: '5 New Verticals' },
    { year: '2022', title: 'Digital Transformation', description: 'Built the first version of Harvics OS — the AI-powered enterprise platform. Launched distributor portals, e-commerce capabilities, and real-time GPS fleet tracking across all markets.', highlight: 'Harvics OS v1' },
    { year: '2023', title: 'Sustainability & Scale', description: 'Committed to carbon-neutral operations. Reached 30+ countries. Launched HPay (digital payments platform), trade finance solutions, and AI-driven demand forecasting across all verticals.', highlight: '30+ Countries' },
    { year: '2024', title: 'Global Enterprise', description: 'Surpassed 40+ countries milestone. Deployed AI engine with 6 ML models for strategy, demand, pricing, coverage, and SKU optimization. Launched multi-language platform supporting 38 languages.', highlight: '40+ Countries' },
    { year: '2025', title: 'AI-First Operating System', description: 'Harvics OS v2 launched — unified enterprise operating system with real-time intelligence, Socket.io live feeds, Alpha Engine for market attack plans, and complete 8-level geographic hierarchy.', highlight: 'Harvics OS v2' },
    { year: '2026', title: 'The Vision Ahead', description: 'Scaling to 60+ countries. Building the world\'s first AI-operated FMCG enterprise where every function — procurement, logistics, finance, CRM — runs on predictive intelligence with human approval gates.', highlight: '60+ Target' },
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Since 2019</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Our Journey
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            From a Dubai startup to a global enterprise spanning 40+ countries, 10 industry verticals, and 38 languages.
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
            <h3 className="text-xl font-semibold text-white mb-2">Be Part of the Next Chapter</h3>
            <p className="text-white/50 text-sm">Join us as we scale to 60+ countries and build the future of AI-driven global commerce.</p>
          </div>
          <Link
            href={`/${locale}/careers`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            View Careers
          </Link>
        </div>
      </section>
    </main>
  )
}

