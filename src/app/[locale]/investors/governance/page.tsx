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

interface GovernancePageProps {
  params: Promise<{ locale: string }>
}

export default async function GovernancePage({ params }: GovernancePageProps) {
  const { locale } = await params

  const governancePillars = [
    { icon: '👥', title: 'Board of Directors', desc: 'The Board provides strategic oversight and ensures the company operates in the long-term interests of all stakeholders. Our directors bring deep expertise across global trade, technology, finance, and emerging market operations.' },
    { icon: '📋', title: 'Audit & Risk Committee', desc: 'Oversees financial reporting integrity, internal controls, risk management frameworks, and compliance with regulatory requirements across all 40+ operating jurisdictions.' },
    { icon: '⚖️', title: 'Ethics & Compliance', desc: 'Enforces our zero-tolerance anti-corruption policy, manages the whistleblower programme, and ensures adherence to FCPA, UK Bribery Act, and local anti-bribery legislation in every market.' },
    { icon: '🔐', title: 'Data Governance', desc: 'GDPR-aligned data protection framework with dedicated Data Protection Officers. All personal data processing is governed by strict access controls, encryption, and retention policies.' },
    { icon: '🌍', title: 'ESG Oversight', desc: 'Monitors environmental, social, and governance performance. Sets sustainability targets, tracks carbon footprint across the supply chain, and publishes annual ESG disclosures.' },
    { icon: '🏛️', title: 'Regulatory Affairs', desc: 'Dedicated regulatory affairs function managing licensing, trade compliance, sanctions screening, and customs regulations across the Middle East, Europe, South Asia, and Africa.' },
  ]

  const policies = [
    'Code of Business Conduct & Ethics',
    'Anti-Money Laundering (AML) Policy',
    'Know Your Customer (KYC) Procedures',
    'Whistleblower Protection Policy',
    'Supplier Code of Ethics',
    'Conflict of Interest Guidelines',
    'Information Security & Data Protection Policy',
    'Modern Slavery & Human Trafficking Statement',
    'Anti-Bribery & Corruption Policy',
    'Related Party Transactions Policy',
  ]

  const navItems = [
    { label: 'Governance', href: `/${locale}/investors/governance`, active: true },
    { label: 'Shares & Bonds', href: `/${locale}/investors/shares`, active: false },
    { label: 'Publications', href: `/${locale}/investors/publications`, active: false },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-harvics-burgundy py-20 px-4 border-b border-harvics-gold/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-harvics-gold font-bold uppercase tracking-[0.2em] mb-3">Investors</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Corporate Governance
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Integrity, transparency, and accountability are the foundations of how we operate across 42+ countries and 10 industry verticals.
          </p>
        </div>
      </section>

      {/* Investor Nav */}
      <section className="bg-[#5a1a24] border-b border-harvics-gold/20">
        <div className="max-w-[1200px] mx-auto px-4 flex gap-0">
          {navItems.map((n) => (
            <Link key={n.label} href={n.href}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${n.active ? 'text-harvics-gold border-b-2 border-harvics-gold' : 'text-white/50 hover:text-white/80'}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Governance Pillars */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-harvics-burgundy mb-8 text-center">Governance Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {governancePillars.map((p) => (
            <div key={p.title} className="bg-white border border-harvics-gold/15 p-8">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="text-lg font-semibold text-harvics-burgundy mb-3">{p.title}</h3>
              <p className="text-sm text-harvics-burgundy/55 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Policies */}
      <section className="bg-white border-t border-b border-harvics-gold/20">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-harvics-burgundy mb-8 text-center">Corporate Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto">
            {policies.map((p) => (
              <div key={p} className="flex items-center gap-3 p-4 border border-harvics-gold/15 bg-white">
                <span className="text-harvics-gold font-bold">✓</span>
                <span className="text-sm font-medium text-harvics-burgundy">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Investor Relations</h3>
            <p className="text-white/50 text-sm">For governance inquiries, contact our investor relations team at ir@harvics.com</p>
          </div>
          <Link href={`/${locale}/compliance`}
            className="px-8 py-3 bg-harvics-gold text-harvics-burgundy text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            View Compliance
          </Link>
        </div>
      </section>
    </main>
  )
}

