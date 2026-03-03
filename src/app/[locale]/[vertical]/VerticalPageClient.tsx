'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { slugify, type NavVertical } from '@/data/megaMenuData'
import { getVerticalProducts, getVerticalSubcategories, getSubcategoryProducts, type Product } from '@/data/productCatalog'

interface VerticalPageClientProps {
  vertical: NavVertical
  locale: string
}

const VerticalPageClient: React.FC<VerticalPageClientProps> = ({ vertical, locale }) => {
  const subcategories = getVerticalSubcategories(vertical.key)
  const allProducts = getVerticalProducts(vertical.key)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')

  const displayProducts = activeFilter
    ? getSubcategoryProducts(vertical.key, activeFilter)
    : allProducts

  const sortedProducts = [...displayProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0 // price sort would require numeric parsing
  })

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Hero Banner */}
      <section className="bg-[#6B1F2B] py-14 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-2">
            Harvics Global Ventures
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {vertical.label}
          </h1>
          <p className="text-sm text-white/60 max-w-[500px] mx-auto">
            Comprehensive supply chain solutions across {vertical.blocks.length} categories
            and {allProducts.length}+ products.
          </p>
          {/* Breadcrumb */}
          <div className="mt-4 text-xs text-white/40">
            <Link href={`/${locale}`} className="hover:text-white/60">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-[#C3A35E]">{vertical.label}</span>
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
                {/* Image placeholder */}
                <div className="h-[180px] bg-[#F5F1E8] flex items-center justify-center border-b border-[#C3A35E]/20">
                  <span className="text-4xl opacity-30">
                    {product.icon || '📦'}
                  </span>
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
