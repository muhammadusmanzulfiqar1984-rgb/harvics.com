'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { getProductImage } from '@/data/productCatalog'

// ─── Sourcing Data — Direct from SUPREME ─────────────────────────────────────

interface SourcingService {
  title: string
  subtitle: string
  icon: string
  keywords: string
  items: string[]
}

interface SourcingCategory {
  id: string
  title: string
  description: string
  services: SourcingService[]
}

const SOURCING_DATA: SourcingCategory[] = [
  {
    id: 'manufacturing',
    title: 'Manufacturing Excellence',
    description: 'From concept to mass production — OEM, ODM, and private label manufacturing across multi-industry verticals with global factory partnerships.',
    services: [
      {
        title: 'OEM / ODM Manufacturing Solutions',
        subtitle: 'From Concept to Mass Production',
        icon: '🏭',
        keywords: 'factory,manufacturing,industrial',
        items: [
          'Custom Product Manufacturing',
          'Original Equipment Manufacturing (OEM)',
          'Original Design Manufacturing (ODM)',
          'Industrial Engineering Support',
          'Prototype & Sample Development',
          'Tooling & Mold Fabrication',
          'Scalable Production Planning',
        ],
      },
      {
        title: 'Private Label & Brand Development',
        subtitle: 'Build Your Brand. Globally.',
        icon: '🏷️',
        keywords: 'brand,label,packaging',
        items: [
          'End-to-End Private Label Solutions',
          'Brand Identity Development',
          'Retail-Ready Packaging Engineering',
          'Product Customization',
          'Barcode & SKU Structuring',
          'Global Retail Compliance Support',
          'E-commerce Launch Preparation',
        ],
      },
      {
        title: 'Product Development & Innovation',
        subtitle: 'Market-Driven Product Engineering',
        icon: '💡',
        keywords: 'design,sketch,prototype',
        items: [
          'Market Research & Competitive Analysis',
          'Trend Forecasting',
          'Material & Component Sourcing',
          'Sample Engineering & Testing',
          'Cost Engineering & Value Optimization',
          'Product Lifecycle Management (PLM)',
          'Innovation & Sustainability Integration',
        ],
      },
    ],
  },
  {
    id: 'quality',
    title: 'Quality & Compliance',
    description: 'Precision-grade quality assurance — pre-production inspection to final container loading, plus global regulatory compliance and certifications.',
    services: [
      {
        title: 'Quality Assurance & Inspection Services',
        subtitle: 'Precision. Compliance. Reliability.',
        icon: '🔍',
        keywords: 'inspection,quality,check',
        items: [
          'Pre-Production Quality Inspection',
          'In-Line Production Monitoring',
          'Pre-Shipment Inspection',
          'Container Loading Supervision',
          'Third-Party Laboratory Testing',
          'Social & Ethical Compliance Audits',
          'Supplier Performance Evaluation',
        ],
      },
      {
        title: 'Regulatory Compliance & Certifications',
        subtitle: 'Global Standards. Guaranteed Compliance.',
        icon: '📜',
        keywords: 'document,compliance,stamp',
        items: [
          'ISO Certification Coordination',
          'CE / FDA / RoHS / REACH Compliance',
          'ESG & Sustainability Standards',
          'Social Compliance (BSCI, SEDEX, SA8000)',
          'Technical Documentation Management',
          'Import/Export Regulatory Advisory',
        ],
      },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics & Distribution',
    description: 'Seamless global movement of goods — international freight, customs clearance, warehousing, and last-mile delivery across 40+ countries.',
    services: [
      {
        title: 'Global Logistics & Distribution',
        subtitle: 'Seamless Global Movement of Goods',
        icon: '🚢',
        keywords: 'ship,cargo,container',
        items: [
          'International Freight (Air, Sea, Rail, Road)',
          'Customs Brokerage & Clearance',
          'Bonded & Regional Warehousing',
          'Cross-Docking & Consolidation',
          'Distribution Center Management',
          'Dropshipping & Fulfillment',
          'Last-Mile Coordination',
        ],
      },
      {
        title: 'Integrated Supply Chain Management',
        subtitle: 'Optimized. Intelligent. Resilient.',
        icon: '⛓️',
        keywords: 'network,connection,logistics',
        items: [
          'End-to-End Supply Chain Design',
          'Demand Forecasting & Planning',
          'Inventory Optimization',
          'Risk Mitigation Strategies',
          'Multi-Country Consolidation',
          'Vendor Performance Analytics',
          'Cost Optimization Programs',
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Consulting',
    description: 'Strategic procurement advisory, global supplier networks, and market entry support for businesses expanding into new regions.',
    services: [
      {
        title: 'Global Supplier Network',
        subtitle: 'Verified. Vetted. Globally Connected.',
        icon: '🌐',
        keywords: 'map,network,globe',
        items: [
          'Multi-Country Supplier Identification',
          'Pre-Qualified Manufacturer Database',
          'Factory Audits & Due Diligence',
          'Strategic Vendor Onboarding',
          'Long-Term Supplier Partnerships',
          'Capacity & Capability Mapping',
          'Regional Trade Intelligence',
        ],
      },
      {
        title: 'Strategic Procurement & Advisory',
        subtitle: 'Premium Strategic Service',
        icon: '📈',
        keywords: 'strategy,chess,graph',
        items: [
          'Global Procurement Strategy',
          'Cost Reduction & Negotiation Programs',
          'Category Management',
          'Tender & Bid Management',
          'Procurement Digitalization',
          'Spend Analytics & Reporting',
        ],
      },
      {
        title: 'Market Entry & Global Expansion',
        subtitle: 'Expand Your Reach',
        icon: '🚀',
        keywords: 'growth,chart,expansion',
        items: [
          'Country-Specific Sourcing Strategy',
          'Local Manufacturing Partnerships',
          'Trade Policy Advisory',
          'Import Licensing & Regulatory Navigation',
          'Distributor & Channel Partner Identification',
        ],
      },
    ],
  },
  {
    id: 'sustainability',
    title: 'Sustainability & Ethics',
    description: 'Green supply chain development — carbon monitoring, responsible sourcing, ethical labor compliance, and ESG reporting.',
    services: [
      {
        title: 'Sustainable & Ethical Sourcing',
        subtitle: 'Green Supply Chain Development',
        icon: '🌱',
        keywords: 'green,plant,eco',
        items: [
          'Carbon Footprint Monitoring',
          'Responsible Raw Material Sourcing',
          'Ethical Labor Compliance Monitoring',
          'ESG Reporting & Advisory',
          'Green Supply Chain Development',
        ],
      },
    ],
  },
  {
    id: 'technology',
    title: 'Technology & Innovation',
    description: 'AI-powered sourcing, digital procurement platforms, blockchain traceability, and real-time supply chain visibility.',
    services: [
      {
        title: 'Technology-Driven Sourcing',
        subtitle: 'AI-Powered & Future Ready',
        icon: '🤖',
        keywords: 'technology,ai,digital',
        items: [
          'AI-Powered Supplier Matching',
          'Digital Procurement Platforms',
          'Blockchain Traceability Systems',
          'Smart Contract Procurement',
          'Real-Time Supply Chain Visibility',
        ],
      },
    ],
  },
  {
    id: 'government',
    title: 'Government & Industrial Projects',
    description: 'Turnkey procurement for infrastructure, industrial equipment, and public sector contracts — from material sourcing to project delivery.',
    services: [
      {
        title: 'Turnkey Industrial & Government Procurement',
        subtitle: 'Infrastructure & Public Sector',
        icon: '🏛️',
        keywords: 'government,building,infrastructure',
        items: [
          'Infrastructure Material Sourcing',
          'Industrial Equipment Procurement',
          'EPC Support Services',
          'Public Sector & Government Contracts',
          'End-to-End Project Procurement Management',
        ],
      },
    ],
  },
]

const STATS = [
  { value: '400+', label: 'Factories Audited' },
  { value: '18', label: 'Countries' },
  { value: '7', label: 'Solution Categories' },
  { value: '50+', label: 'Active Services' },
]

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SourcingPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en'
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const totalServices = SOURCING_DATA.reduce((sum, cat) => sum + cat.services.length, 0)

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* ─── Hero ─── */}
      <section className="relative bg-[#6B1F2B] py-24 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-3" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
        <div className="max-w-[1200px] mx-auto relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="lg:max-w-[700px]">
              <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">
                End-to-End Sourcing Ecosystem
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                Global Sourcing Solutions
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-[600px] mb-8">
                Harvics delivers integrated sourcing ecosystems — from supplier discovery to final delivery —
                across multi-industry verticals worldwide. {totalServices} specialized services spanning
                manufacturing, quality, logistics, strategy, sustainability, and technology.
              </p>
              <div className="text-xs text-white/40">
                <Link href={`/${locale}`} className="hover:text-white/60 transition-colors">Home</Link>
                <span className="mx-2">›</span>
                <span className="text-[#C3A35E]">Global Sourcing Solutions</span>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-[#C3A35E]">{stat.value}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Solutions Menu ─── */}
      <section className="bg-white border-b border-[#C3A35E]/20 py-6 px-4 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {SOURCING_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className={`px-5 py-2.5 text-sm font-medium border transition-colors ${
                  activeSection === cat.id
                    ? 'bg-[#6B1F2B] text-white border-[#6B1F2B]'
                    : 'bg-[#F5F1E8] border-[#C3A35E]/20 text-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white hover:border-[#6B1F2B]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content — All Solution Categories ─── */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {SOURCING_DATA.map((category, catIdx) => (
          <section
            key={category.id}
            ref={(el) => { sectionRefs.current[category.id] = el }}
            id={category.id}
            className={`mb-16 scroll-mt-24 ${catIdx > 0 ? 'pt-8 border-t border-[#C3A35E]/20' : ''}`}
          >
            {/* Category Header */}
            <div className="mb-8">
              <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.15em] mb-2">
                {String(catIdx + 1).padStart(2, '0')} / {String(SOURCING_DATA.length).padStart(2, '0')}
              </div>
              <h2 className="text-3xl font-bold text-[#6B1F2B] font-serif mb-3">{category.title}</h2>
              <p className="text-base text-[#6B1F2B]/60 max-w-[700px] leading-relaxed">{category.description}</p>
            </div>

            {/* Service Cards */}
            <div className={`grid gap-6 ${category.services.length === 1 ? 'grid-cols-1' : category.services.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
              {category.services.map((service, svcIdx) => (
                <ServiceCard key={svcIdx} service={service} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ─── Why Harvics Sourcing ─── */}
      <section className="bg-white py-16 px-4 border-t border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold text-[#6B1F2B] font-serif text-center mb-12">
            Why Harvics Sourcing?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌍', title: 'Global Reach', desc: 'Sourcing operations across 18 countries with 400+ audited factories and verified suppliers.' },
              { icon: '🤖', title: 'AI-Powered', desc: 'Machine learning supplier matching, demand forecasting, and blockchain traceability built into every workflow.' },
              { icon: '🔒', title: 'Compliance First', desc: 'ISO, CE, FDA, BSCI, SEDEX, SA8000, OEKO-TEX — every standard covered, every shipment certified.' },
              { icon: '⚡', title: 'Speed to Market', desc: 'From sample approval to container loading in 45 days. Integrated logistics cuts lead times by 30%.' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#F5F1E8] border border-[#C3A35E]/20 p-6 hover:border-[#C3A35E] transition-colors"
                style={{ borderRadius: 0, boxShadow: 'none' }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-[#6B1F2B] mb-2 font-serif">{item.title}</h3>
                <p className="text-sm text-[#6B1F2B]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="bg-[#6B1F2B] py-16 px-4 border-t border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-serif">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-base text-white/60 max-w-[600px] mx-auto mb-8">
            Whether you need a single factory audit or a full turnkey procurement solution,
            Harvics delivers. Let&apos;s discuss your sourcing requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#D4B86A] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Get Started
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-3 bg-transparent text-[#C3A35E] font-bold text-sm uppercase tracking-wider border border-[#C3A35E]/40 hover:bg-[#C3A35E]/10 transition-colors"
              style={{ borderRadius: 0 }}
            >
              About Harvics
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Service Card Sub-Component ──────────────────────────────────────────────

function ServiceCard({ service }: { service: SourcingService }) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? service.items : service.items.slice(0, 4)
  const hasMore = service.items.length > 4

  return (
    <div
      className="bg-white border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all group flex flex-col"
      style={{ borderRadius: 0, boxShadow: 'none' }}
    >
      {/* Image Header */}
      <div className="h-[160px] bg-[#F5F1E8] border-b border-[#C3A35E]/20 overflow-hidden relative">
        <img
          src={getProductImage(service.keywords)}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            ;(e.target as HTMLImageElement).parentElement!.innerHTML =
              `<div class="w-full h-full flex items-center justify-center bg-[#F5F1E8]"><span class="text-5xl opacity-20">${service.icon}</span></div>`
          }}
        />
        <div className="absolute top-3 left-3 text-2xl">{service.icon}</div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-[#6B1F2B] mb-1 font-serif">{service.title}</h3>
        <p className="text-xs text-[#C3A35E] font-semibold uppercase tracking-wider mb-4">{service.subtitle}</p>

        {/* Service Items */}
        <ul className="space-y-2 flex-1">
          {visibleItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[#6B1F2B]/70">
              <span className="text-[#C3A35E] text-xs mt-1 flex-shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Show More/Less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-xs font-semibold text-[#C3A35E] hover:text-[#6B1F2B] transition-colors uppercase tracking-wider text-left"
          >
            {expanded ? '— Show Less' : `+ ${service.items.length - 4} More Services`}
          </button>
        )}
      </div>
    </div>
  )
}
