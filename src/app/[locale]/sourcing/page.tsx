'use client'

import React, { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getProductImage } from '@/data/productCatalog'
import PresentationAccessBanner from '@/components/presentations/PresentationAccessBanner'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const SOURCING_HERO_SLIDES = [
  '/assets/harvictrade/heroes/sourcing/01-factory.webp',
  '/assets/harvictrade/heroes/sourcing/02-qc.webp',
  '/assets/harvictrade/heroes/sourcing/03-containers.webp',
]

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
    description: 'Seamless global movement of goods — international freight, customs clearance, warehousing, and last-mile delivery across 42+ countries.',
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

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SourcingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = 'en' } = use(params)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % SOURCING_HERO_SLIDES.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [])

  const totalServices = SOURCING_DATA.reduce((sum, cat) => sum + cat.services.length, 0)

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ─── Hero — full-bleed auto-slider ─── */}
      <section className="relative min-h-[72vh] overflow-hidden border-b border-harvics-gold/30 md:min-h-[78vh]">
        {SOURCING_HERO_SLIDES.map((src, i) => (
          <HarvicsImage
            key={src}
            src={src}
            alt="Global Sourcing"
            fill
            sizes={IMAGE_SIZES.hero}
            priority={i === 0}
            className="object-cover"
            style={{
              opacity: i === heroIndex ? 1 : 0,
              transform: i === heroIndex ? 'scale(1)' : 'scale(1.05)',
              transition: 'opacity 1.15s ease, transform 7s ease',
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(61,18,18,0.88) 0%, rgba(61,18,18,0.55) 48%, rgba(13,13,13,0.35) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-[1200px] flex-col justify-end px-4 py-14 md:min-h-[78vh] md:py-20">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/55">
            <Link href={`/${locale}`} className="transition-colors hover:text-harvics-gold">
              Home
            </Link>
            <span>→</span>
            <span className="text-harvics-gold/90">Global Sourcing Solutions</span>
          </nav>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-harvics-gold">
            End-to-End Sourcing Ecosystem
          </p>
          <h1
            className="mb-4 max-w-[18ch] text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-[72px]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Global Sourcing Solutions
          </h1>
          <p className="mb-8 max-w-[540px] text-base leading-relaxed text-white/75 md:text-lg">
            Harvics delivers integrated sourcing ecosystems — from supplier discovery to final delivery —
            across multi-industry verticals worldwide. {totalServices} specialized services spanning
            manufacturing, quality, logistics, strategy, sustainability, and technology.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center bg-harvics-gold px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-harvics-burgundy transition hover:bg-[#d4b46e]"
            >
              Get a Quote
            </Link>
            <a
              href="#manufacturing"
              className="inline-flex items-center justify-center border border-white/35 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-harvics-gold"
            >
              Browse Solutions
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-4 mb-12 mt-6">
        <PresentationAccessBanner verticalKey="sourcing" />
      </div>

      {/* ─── Solutions Menu ─── */}
      <section className="bg-white border-b border-harvics-gold/20 py-6 px-4 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {SOURCING_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className={`px-5 py-2.5 text-sm font-medium border transition-colors ${
                  activeSection === cat.id
                    ? 'bg-harvics-burgundy text-white border-harvics-burgundy'
                    : 'bg-white border-harvics-gold/20 text-harvics-burgundy hover:bg-harvics-burgundy hover:text-white hover:border-harvics-burgundy'
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
            className={`mb-16 scroll-mt-24 ${catIdx > 0 ? 'pt-8 border-t border-harvics-gold/20' : ''}`}
          >
            {/* Category Header */}
            <div className="mb-8">
              <div className="text-xs text-harvics-gold font-bold uppercase tracking-[0.15em] mb-2">
                {String(catIdx + 1).padStart(2, '0')} / {String(SOURCING_DATA.length).padStart(2, '0')}
              </div>
              <h2 className="text-3xl font-bold text-harvics-burgundy font-serif mb-3">{category.title}</h2>
              <p className="text-base text-harvics-burgundy/60 max-w-[700px] leading-relaxed">{category.description}</p>
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
      <section className="bg-white py-16 px-4 border-t border-harvics-gold/20">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold text-harvics-burgundy font-serif text-center mb-12">
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
                className="bg-white border border-harvics-gold/20 p-6 hover:border-harvics-gold transition-colors"
                style={{ borderRadius: 0, boxShadow: 'none' }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-harvics-burgundy mb-2 font-serif">{item.title}</h3>
                <p className="text-sm text-harvics-burgundy/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="bg-harvics-burgundy py-16 px-4 border-t border-harvics-gold/40">
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
              className="px-8 py-3 bg-harvics-gold text-harvics-burgundy font-bold text-sm uppercase tracking-wider hover:bg-[#D4B86A] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Get Started
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-3 bg-transparent text-harvics-gold font-bold text-sm uppercase tracking-wider border border-harvics-gold/40 hover:bg-harvics-gold/10 transition-colors"
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
      className="bg-white border border-harvics-gold/20 hover:border-harvics-gold transition-all group flex flex-col"
      style={{ borderRadius: 0, boxShadow: 'none' }}
    >
      {/* Image Header */}
      <div className="h-[160px] bg-white border-b border-harvics-gold/20 overflow-hidden relative">
        <HarvicsImage
          src={getProductImage(service.keywords)}
          alt={service.title}
          fill
          sizes={IMAGE_SIZES.cardSm}
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 text-2xl">{service.icon}</div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-harvics-burgundy mb-1 font-serif">{service.title}</h3>
        <p className="text-xs text-harvics-gold font-semibold uppercase tracking-wider mb-4">{service.subtitle}</p>

        {/* Service Items */}
        <ul className="space-y-2 flex-1">
          {visibleItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-harvics-burgundy/70">
              <span className="text-harvics-gold text-xs mt-1 flex-shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Show More/Less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-xs font-semibold text-harvics-gold hover:text-harvics-burgundy transition-colors uppercase tracking-wider text-left"
          >
            {expanded ? '— Show Less' : `+ ${service.items.length - 4} More Services`}
          </button>
        )}
      </div>
    </div>
  )
}
