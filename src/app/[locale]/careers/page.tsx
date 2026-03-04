import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | Harvics',
  description: 'Join Harvics Global Ventures — explore opportunities across 40+ countries in FMCG, textiles, logistics, technology, and more.',
}

interface CareersPageProps {
  params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params

  const departments = [
    { name: 'Sales & Distribution', icon: '📊', count: 12, desc: 'Drive revenue across 40+ markets. Territory management, key accounts, distributor relations.' },
    { name: 'Supply Chain & Logistics', icon: '🚚', count: 8, desc: 'End-to-end supply chain from factory to shelf. Fleet management, warehousing, last-mile delivery.' },
    { name: 'Technology & AI', icon: '💻', count: 7, desc: 'Build Harvics OS — our AI-powered enterprise platform. Full-stack, ML engineering, data science.' },
    { name: 'Finance & Treasury', icon: '💰', count: 6, desc: 'Multi-currency treasury, trade finance, HPay digital payments, FX management across regions.' },
    { name: 'Procurement & Sourcing', icon: '🏭', count: 9, desc: 'Global sourcing from 15+ origin countries. Supplier audits, quality control, factory-direct programs.' },
    { name: 'Human Resources', icon: '👥', count: 4, desc: 'Talent acquisition, L&D, performance management across diverse geographies and cultures.' },
    { name: 'Legal & Compliance', icon: '⚖️', count: 3, desc: 'Trade compliance, sanctions screening, IP protection, contract management across jurisdictions.' },
    { name: 'Marketing & Brand', icon: '🎨', count: 5, desc: 'Multi-language campaigns, 38-locale content, digital marketing, brand strategy for 10 verticals.' },
  ]

  const benefits = [
    { icon: '🌍', title: 'Global Mobility', desc: 'Work across Dubai, London, Karachi, Lahore, and 40+ markets' },
    { icon: '📈', title: 'Growth Track', desc: 'Fast-track career progression in a scaling enterprise' },
    { icon: '🤖', title: 'AI-First Culture', desc: 'Work with cutting-edge AI and real-time intelligence systems' },
    { icon: '💎', title: 'Competitive Package', desc: 'Market-leading compensation, housing, and benefits' },
    { icon: '📚', title: 'Learning Budget', desc: 'Annual development budget for courses, conferences, and certifications' },
    { icon: '🏠', title: 'Flexible Work', desc: 'Hybrid arrangements with regional hub offices worldwide' },
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Join Us</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Build the Future of Global Trade
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            We&apos;re growing across 40+ countries. Join a team that&apos;s building the AI-powered operating system for global commerce.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { num: '54+', label: 'Open Positions' },
            { num: '40+', label: 'Countries' },
            { num: '10', label: 'Industry Verticals' },
            { num: '8', label: 'Departments Hiring' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-[#C3A35E]">{s.num}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Open Positions by Department</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="bg-white border border-[#C3A35E]/20 p-6 hover:border-[#C3A35E] transition-colors group cursor-pointer"
              style={{ borderRadius: 0, boxShadow: 'none' }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{dept.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-[#6B1F2B]">{dept.name}</h3>
                    <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-3 py-1" style={{ borderRadius: 0 }}>{dept.count} roles</span>
                  </div>
                  <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{dept.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Why Harvics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="p-6 border border-[#C3A35E]/15 bg-[#F5F1E8]" style={{ borderRadius: 0 }}>
                <span className="text-2xl">{b.icon}</span>
                <h3 className="text-base font-semibold text-[#6B1F2B] mt-3 mb-2">{b.title}</h3>
                <p className="text-sm text-[#6B1F2B]/55 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 text-center">
          <h3 className="text-2xl font-semibold text-white mb-3">Ready to Join?</h3>
          <p className="text-white/50 text-sm mb-8 max-w-[500px] mx-auto">Send your CV and cover letter. We review every application within 48 hours.</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-10 py-4 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  )
}

