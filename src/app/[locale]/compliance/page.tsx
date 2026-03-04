
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance & Ethics | Harvics',
  description: 'Harvics commitment to regulatory compliance, ethical business practices, and global standards.',
}

interface CompliancePageProps {
  params: Promise<{ locale: string }>
}

export default async function CompliancePage({ params }: CompliancePageProps) {
  const { locale } = await params

  const standards = [
    { icon: '⚖️', title: 'Regulatory Compliance', desc: 'Full adherence to UAE Federal Laws, DFSA regulations, and international trade compliance frameworks across all 40+ operating markets.' },
    { icon: '🔒', title: 'Data Protection', desc: 'GDPR-aligned data handling policies, end-to-end encryption, and strict access controls protecting customer and partner data globally.' },
    { icon: '🌍', title: 'Trade Compliance', desc: 'Sanctions screening, export controls, HS code verification, and customs compliance for cross-border operations in every geography.' },
    { icon: '🏭', title: 'Quality Standards', desc: 'ISO 9001 quality management, AQL 2.5 inspection standards, and comprehensive product safety certifications across all verticals.' },
    { icon: '🤝', title: 'Anti-Corruption', desc: 'Zero-tolerance anti-bribery policy aligned with FCPA and UK Bribery Act. Mandatory ethics training for all employees and partners.' },
    { icon: '♻️', title: 'Environmental', desc: 'ESG reporting, carbon footprint tracking, sustainable sourcing commitments, and waste reduction programs across the supply chain.' },
  ]

  const policies = [
    'Code of Business Conduct',
    'Anti-Money Laundering (AML) Policy',
    'Know Your Customer (KYC) Procedures',
    'Whistleblower Protection Policy',
    'Supplier Code of Ethics',
    'Conflict of Interest Guidelines',
    'Information Security Policy',
    'Modern Slavery Statement',
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero */}
      <section className="bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Governance</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Compliance & Ethics
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Integrity is the foundation of every transaction. We operate under strict regulatory frameworks across 40+ countries.
          </p>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { num: '40+', label: 'Countries Regulated' },
            { num: '100%', label: 'Sanctions Screening' },
            { num: 'ISO 9001', label: 'Quality Certified' },
            { num: 'Zero', label: 'Tolerance for Bribery' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-[#C3A35E]">{s.num}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Standards Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Our Compliance Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((s) => (
            <div key={s.title} className="bg-white border border-[#C3A35E]/20 p-8" style={{ borderRadius: 0, boxShadow: 'none' }}>
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-3">{s.title}</h3>
              <p className="text-sm text-[#6B1F2B]/60 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Policies List */}
      <section className="bg-white border-t border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-8 text-center">Corporate Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto">
            {policies.map((p) => (
              <div key={p} className="flex items-center gap-3 p-4 border border-[#C3A35E]/15 bg-[#F5F1E8]" style={{ borderRadius: 0 }}>
                <span className="text-[#C3A35E] font-bold">✓</span>
                <span className="text-sm font-medium text-[#6B1F2B]">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Questions About Compliance?</h3>
            <p className="text-white/50 text-sm">Our governance team is available to discuss compliance requirements and certifications.</p>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
            style={{ borderRadius: 0 }}
          >
            Contact Compliance Team
          </Link>
        </div>
      </section>
    </main>
  )
}
