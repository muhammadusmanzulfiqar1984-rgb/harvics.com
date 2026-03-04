'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { slugify, type NavVertical } from '@/data/megaMenuData'
import { getVerticalProducts, getVerticalSubcategories, getSubcategoryProducts, getProductImage, type Product } from '@/data/productCatalog'

/** Rich descriptions & stats for each vertical */
const verticalMeta: Record<string, { tagline: string; description: string; stats: { label: string; value: string }[]; icon: string }> = {
  textiles: {
    tagline: 'Apparel, Fabrics & Home Textiles',
    description: 'From premium menswear and womenswear to home textiles and accessories — Harvics sources, manufactures, and distributes across the full textile value chain. Factory-direct partnerships in South Asia, Turkey, and China.',
    stats: [{ label: 'Categories', value: '17' }, { label: 'SKUs', value: '2,400+' }, { label: 'Countries', value: '22' }],
    icon: '🧵',
  },
  fmcg: {
    tagline: 'Food, Personal Care & Home Care',
    description: 'Full FMCG distribution — staples, dairy, packaged foods, beverages, personal care, and home care. Cold chain logistics, in-market distribution, and AI-driven demand forecasting.',
    stats: [{ label: 'Product Lines', value: '6' }, { label: 'SKUs', value: '1,800+' }, { label: 'Retail Points', value: '15,000+' }],
    icon: '🛒',
  },
  commodities: {
    tagline: 'Agri, Energy, Metals & Softs',
    description: 'Strategic commodities trading — energy, metals, agricultural products, edible oils, proteins, and industrial chemicals. Spot and contract-based trading with global counterparties.',
    stats: [{ label: 'Verticals', value: '7' }, { label: 'Trade Volume', value: '$120M+' }, { label: 'Partners', value: '80+' }],
    icon: '📦',
  },
  industrial: {
    tagline: 'Chemicals, Machinery & Safety',
    description: 'Industrial procurement and supply — CNC machinery, safety equipment, copper wire, iron ore, and MRO supplies. Turnkey solutions for manufacturing and construction sectors.',
    stats: [{ label: 'Product Range', value: '500+' }, { label: 'Industries Served', value: '12' }, { label: 'Countries', value: '15' }],
    icon: '🏭',
  },
  minerals: {
    tagline: 'Metals, Energy & Precious Minerals',
    description: 'Mining and minerals trading — iron ore, copper, aluminum, coal, lithium, gold, silver, and platinum. From mine to market with full compliance and traceability.',
    stats: [{ label: 'Mineral Types', value: '14' }, { label: 'Mining Partners', value: '25+' }, { label: 'Regions', value: '8' }],
    icon: '⛏️',
  },
  'oil-gas': {
    tagline: 'Upstream, Midstream & Downstream',
    description: 'End-to-end oil & gas services — exploration, pipeline EPC, refinery operations, trading & offtake, and HSE compliance. Operating across the Middle East, Africa, and Central Asia.',
    stats: [{ label: 'Service Lines', value: '4' }, { label: 'Projects', value: '30+' }, { label: 'Countries', value: '11' }],
    icon: '🛢️',
  },
  'real-estate': {
    tagline: 'Commercial, Residential & Industrial',
    description: 'Real estate development and facilities management — Grade-A offices, luxury residences, industrial parks, SEZ facilities, and full FM services across the GCC and South Asia.',
    stats: [{ label: 'Asset Classes', value: '4' }, { label: 'Sq Ft Managed', value: '2M+' }, { label: 'Cities', value: '8' }],
    icon: '🏢',
  },
  sourcing: {
    tagline: 'Global Sourcing & Quality Control',
    description: 'Strategic sourcing, OEM/ODM manufacturing, quality inspection, logistics consulting, and sustainable procurement. AI-powered supplier matching and blockchain traceability.',
    stats: [{ label: 'Services', value: '8' }, { label: 'Factories Audited', value: '400+' }, { label: 'Countries', value: '18' }],
    icon: '🔍',
  },
  finance: {
    tagline: 'Trade Finance, HPay & Risk',
    description: 'Financial services for global trade — letters of credit, forfaiting, digital wallets (HPay), invoicing, reconciliation, KYC/AML compliance, and risk scoring.',
    stats: [{ label: 'Products', value: '12' }, { label: 'Transactions/Mo', value: '50K+' }, { label: 'Compliance', value: '100%' }],
    icon: '💳',
  },
  ai: {
    tagline: 'Forecasting, Vision & Integration',
    description: 'AI-powered enterprise solutions — demand forecasting, computer vision for QC, conversational AI, data pipelines, ERP integration, and mobile apps. Built on Harvics\' proprietary ML models.',
    stats: [{ label: 'Models', value: '6' }, { label: 'Accuracy', value: '94%+' }, { label: 'Integrations', value: '15+' }],
    icon: '🤖',
  },
}

interface VerticalPageClientProps {
  vertical: NavVertical
  locale: string
}

const VerticalPageClient: React.FC<VerticalPageClientProps> = ({ vertical, locale }) => {
  const subcategories = getVerticalSubcategories(vertical.key)
  const allProducts = getVerticalProducts(vertical.key)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const meta = verticalMeta[vertical.key] || { tagline: '', description: '', stats: [], icon: '📊' }

  const displayProducts = activeFilter
    ? getSubcategoryProducts(vertical.key, activeFilter)
    : allProducts

  const sortedProducts = [...displayProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero Banner — Rich */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-5" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="lg:max-w-[700px]">
              <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">
                {meta.tagline || 'Harvics Global Ventures'}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
                {vertical.label}
              </h1>
              <p className="text-base text-white/60 leading-relaxed max-w-[600px] mb-6">
                {meta.description || `Comprehensive supply chain solutions across ${vertical.blocks.length} categories and ${allProducts.length}+ products.`}
              </p>
              {/* Breadcrumb */}
              <div className="text-xs text-white/40">
                <Link href={`/${locale}`} className="hover:text-white/60">Home</Link>
                <span className="mx-2">›</span>
                <span className="text-[#C3A35E]">{vertical.label}</span>
              </div>
            </div>
            {/* Stats */}
            {meta.stats.length > 0 && (
              <div className="flex gap-6 lg:gap-10">
                {meta.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#C3A35E]">{s.value}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Blocks — Quick Nav */}
      <section className="bg-white border-b border-[#C3A35E]/20 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {vertical.blocks.map((block) => (
              <Link
                key={block.title}
                href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                className="px-5 py-2.5 bg-[#F5F1E8] border border-[#C3A35E]/20 text-sm font-medium text-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white hover:border-[#6B1F2B] transition-colors"
              >
                {block.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-[220px] flex-shrink-0">
          <div className="border border-[#C3A35E]/30 bg-white p-5" style={{ borderRadius: 0, position: 'sticky', top: '120px' }}>
            <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider mb-4">Categories</h3>
            <button
              onClick={() => setActiveFilter(null)}
              className={`block w-full text-left text-sm py-2 border-b border-[#C3A35E]/10 transition-colors ${
                !activeFilter ? 'text-[#6B1F2B] font-bold' : 'text-[#6B1F2B]/60 hover:text-[#6B1F2B]'
              }`}
            >
              All ({allProducts.length})
            </button>
            {subcategories.map((sub) => {
              const count = getSubcategoryProducts(vertical.key, sub).length
              return (
                <button
                  key={sub}
                  onClick={() => setActiveFilter(sub)}
                  className={`block w-full text-left text-sm py-2 border-b border-[#C3A35E]/10 transition-colors capitalize ${
                    activeFilter === sub ? 'text-[#6B1F2B] font-bold' : 'text-[#6B1F2B]/60 hover:text-[#6B1F2B]'
                  }`}
                >
                  {sub.replace(/([A-Z])/g, ' $1').trim()} ({count})
                </button>
              )
            })}

            {/* Mega menu blocks as secondary nav */}
            <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider mt-6 mb-3">Explore</h3>
            {vertical.blocks.map((block) => (
              <Link
                key={block.title}
                href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                className="block text-sm text-[#6B1F2B]/60 hover:text-[#6B1F2B] py-1.5 border-b border-[#C3A35E]/10"
              >
                {block.title}
              </Link>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 border-b border-[#C3A35E]/20 pb-3">
            <span className="text-sm text-[#6B1F2B]/60">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
              className="text-sm text-[#6B1F2B] bg-transparent border border-[#C3A35E]/30 px-3 py-1"
              style={{ borderRadius: 0 }}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((product, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-colors group"
                style={{ borderRadius: 0, boxShadow: 'none' }}
              >
                <div className="h-[180px] bg-[#F5F1E8] flex items-center justify-center border-b border-[#C3A35E]/20 overflow-hidden">
                  <img
                    src={getProductImage(product.keywords)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl opacity-30">📦</span>' }}
                  />
                </div>
                {/* Info */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-[#6B1F2B] mb-1">{product.name}</h4>
                  {product.desc && (
                    <p className="text-xs text-[#6B1F2B]/50 mb-2">{product.desc}</p>
                  )}
                  <div className="text-sm font-bold text-[#C3A35E]">{product.price}</div>
                </div>
              </div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-16 text-[#6B1F2B]/40">
              <p className="text-lg">No products in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default VerticalPageClient
