'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { getProductImage } from '@/data/productCatalog'

// ─── Kids Product Data ───────────────────────────────────────────────────────

interface KidsProduct {
  name: string
  category: string
  size: string
  material: string
  price: string
  keywords: string
  badge?: string
}

const KIDS_PRODUCTS: KidsProduct[] = [
  // Boys
  { name: 'Boys Cotton T-Shirt', category: 'boys', size: '3-12 Years', material: 'Cotton', price: '$10 – $20', keywords: 'boy,tshirt,kids', badge: 'Best Seller' },
  { name: 'Boys Cargo Shorts', category: 'boys', size: '4-14 Years', material: 'Cotton Twill', price: '$14 – $24', keywords: 'boy,shorts,kids' },
  { name: 'Boys Denim Jacket', category: 'boys', size: '5-14 Years', material: 'Denim', price: '$28 – $45', keywords: 'boy,jacket,denim' },
  { name: 'Boys School Blazer', category: 'boys', size: '6-16 Years', material: 'Polyester Blend', price: '$35 – $55', keywords: 'blazer,school,uniform' },
  { name: 'Boys Polo Shirt', category: 'boys', size: '3-14 Years', material: 'Pique Cotton', price: '$12 – $22', keywords: 'boy,polo,kids' },
  { name: 'Boys Track Pants', category: 'boys', size: '3-14 Years', material: 'Jersey', price: '$15 – $25', keywords: 'boy,pants,kids' },
  // Girls
  { name: 'Girls Party Dress', category: 'girls', size: '3-12 Years', material: 'Polyester Satin', price: '$25 – $45', keywords: 'girl,dress,kids', badge: 'New' },
  { name: 'Girls Cotton Leggings', category: 'girls', size: '2-14 Years', material: 'Cotton Spandex', price: '$8 – $16', keywords: 'girl,leggings,kids' },
  { name: 'Girls Tunic Top', category: 'girls', size: '3-12 Years', material: 'Rayon', price: '$12 – $22', keywords: 'girl,tunic,kids' },
  { name: 'Girls Floral Skirt', category: 'girls', size: '3-10 Years', material: 'Cotton Voile', price: '$14 – $24', keywords: 'girl,skirt,kids' },
  { name: 'Girls School Pinafore', category: 'girls', size: '5-14 Years', material: 'Polyester', price: '$20 – $35', keywords: 'girl,uniform,school' },
  { name: 'Girls Cardigan', category: 'girls', size: '3-12 Years', material: 'Knit Cotton', price: '$18 – $30', keywords: 'girl,cardigan,kids' },
  // Baby
  { name: 'Baby Onesie Set (3-Pack)', category: 'baby', size: '0-18 Months', material: 'Organic Cotton', price: '$18 – $30', keywords: 'baby,onesie,kids', badge: 'Organic' },
  { name: 'Baby Knit Booties', category: 'baby', size: '0-12 Months', material: 'Soft Knit', price: '$8 – $14', keywords: 'baby,booties,kids' },
  { name: 'Baby Sleep Suit', category: 'baby', size: '0-24 Months', material: 'Organic Cotton', price: '$14 – $22', keywords: 'baby,sleepsuit,pajamas' },
  { name: 'Baby Muslin Swaddle', category: 'baby', size: 'One Size', material: 'Muslin', price: '$12 – $20', keywords: 'baby,swaddle,kids' },
  { name: 'Baby Romper', category: 'baby', size: '0-18 Months', material: 'Cotton Jersey', price: '$10 – $18', keywords: 'baby,romper,kids' },
  // School Uniform
  { name: 'School Uniform Set', category: 'school', size: '5-16 Years', material: 'Poly-Cotton', price: '$30 – $50', keywords: 'uniform,school,kids' },
  { name: 'School Shoes – Oxford', category: 'school', size: '10-3 UK', material: 'Leather', price: '$25 – $40', keywords: 'shoes,school,kids' },
  { name: 'School Backpack', category: 'school', size: 'Standard', material: 'Nylon', price: '$18 – $35', keywords: 'backpack,school,kids' },
  { name: 'PE Kit Set', category: 'school', size: '5-16 Years', material: 'Polyester', price: '$22 – $38', keywords: 'sport,school,kids' },
  // Accessories
  { name: 'Kids Sneakers', category: 'accessories', size: '8-3 UK', material: 'Canvas/Rubber', price: '$20 – $35', keywords: 'sneakers,kids,shoes' },
  { name: 'Winter Hoodie', category: 'accessories', size: '3-14 Years', material: 'Fleece', price: '$22 – $40', keywords: 'hoodie,kids,winter' },
  { name: 'Soft Cotton Pajamas', category: 'accessories', size: '3-12 Years', material: 'Cotton', price: '$15 – $25', keywords: 'pajamas,kids,sleepwear' },
  { name: 'Denim Jeans', category: 'accessories', size: '3-14 Years', material: 'Stretch Denim', price: '$18 – $30', keywords: 'jeans,kids,denim' },
  { name: 'Kids Rain Jacket', category: 'accessories', size: '3-12 Years', material: 'Waterproof Nylon', price: '$25 – $40', keywords: 'rain,jacket,kids' },
  { name: 'Kids Sun Hat', category: 'accessories', size: '2-10 Years', material: 'Cotton', price: '$8 – $15', keywords: 'hat,sun,kids' },
]

const CATEGORIES = [
  { key: 'all', label: 'All', count: KIDS_PRODUCTS.length },
  { key: 'boys', label: 'Boys', count: KIDS_PRODUCTS.filter((p) => p.category === 'boys').length },
  { key: 'girls', label: 'Girls', count: KIDS_PRODUCTS.filter((p) => p.category === 'girls').length },
  { key: 'baby', label: 'Baby', count: KIDS_PRODUCTS.filter((p) => p.category === 'baby').length },
  { key: 'school', label: 'School Uniform', count: KIDS_PRODUCTS.filter((p) => p.category === 'school').length },
  { key: 'accessories', label: 'Accessories', count: KIDS_PRODUCTS.filter((p) => p.category === 'accessories').length },
]

const SIZES = ['0-3 Months', '3-6 Months', '6-12 Months', '1-2 Years', '3-5 Years', '6-9 Years', '10-14 Years']
const MATERIALS = ['Cotton', 'Organic Cotton', 'Polyester', 'Denim', 'Linen', 'Wool', 'Leather (Genuine / PU / Vegan)']
const MANUFACTURING = ['Hand-stitched', 'Machine-made', 'Sustainable / Eco-friendly']
const POSITIONING = ['Economy', 'Mid-range', 'Premium / Luxury']
const REGIONS = ['Europe', 'GCC', 'Asia', 'Africa']

// ─── Page Component ──────────────────────────────────────────────────────────

export default function KidsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en'
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    let products = KIDS_PRODUCTS
    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      )
    }
    return [...products].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })
  }, [activeCategory, sortBy, searchQuery])

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* ─── Hero Banner ─── */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-5" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="lg:max-w-[700px]">
              <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">
                Textiles — Kids Collection
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
                Kids Clothing & Accessories
              </h1>
              <p className="text-base text-white/60 leading-relaxed max-w-[600px] mb-6">
                From newborn essentials to school uniforms — Harvics supplies the complete kids wear range.
                Premium cotton, organic fabrics, and sustainable manufacturing across our global factory network.
                OEM, ODM, and private label programs available for all categories.
              </p>
              <div className="text-xs text-white/40">
                <Link href={`/${locale}`} className="hover:text-white/60 transition-colors">Home</Link>
                <span className="mx-2">›</span>
                <Link href={`/${locale}/textiles`} className="hover:text-white/60 transition-colors">Textiles</Link>
                <span className="mx-2">›</span>
                <span className="text-[#C3A35E]">Kids</span>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#C3A35E]">26</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#C3A35E]">5</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#C3A35E]">40+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Quick Nav ─── */}
      <section className="bg-white border-b border-[#C3A35E]/20 py-6 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 text-sm font-medium border transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-[#6B1F2B] text-white border-[#6B1F2B]'
                    : 'bg-[#F5F1E8] border-[#C3A35E]/20 text-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white hover:border-[#6B1F2B]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-[240px] flex-shrink-0">
          <div className="border border-[#C3A35E]/30 bg-white p-5" style={{ borderRadius: 0, position: 'sticky', top: '120px' }}>
            {/* Search */}
            <div className="mb-6 pb-4 border-b border-[#C3A35E]/15">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kids products..."
                className="w-full px-3 py-2 text-sm text-[#6B1F2B] bg-[#F5F1E8] border border-[#C3A35E]/20 focus:border-[#C3A35E] focus:outline-none placeholder:text-[#6B1F2B]/30"
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Category Filter */}
            <FilterGroup title="Category">
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key === activeCategory ? 'all' : cat.key)}
                  className={`block w-full text-left text-sm py-2 border-b border-[#C3A35E]/10 transition-colors flex justify-between ${
                    activeCategory === cat.key ? 'text-[#6B1F2B] font-bold' : 'text-[#6B1F2B]/60 hover:text-[#6B1F2B]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[#6B1F2B]/30 text-xs">({cat.count})</span>
                </button>
              ))}
            </FilterGroup>

            {/* Size Filter */}
            <FilterGroup title="Size">
              {SIZES.map((size) => (
                <div key={size} className="text-sm text-[#6B1F2B]/60 py-1.5 border-b border-[#C3A35E]/10 hover:text-[#6B1F2B] cursor-pointer transition-colors">
                  {size}
                </div>
              ))}
            </FilterGroup>

            {/* Material Filter */}
            <FilterGroup title="Material">
              {MATERIALS.map((mat) => (
                <div key={mat} className="text-sm text-[#6B1F2B]/60 py-1.5 border-b border-[#C3A35E]/10 hover:text-[#6B1F2B] cursor-pointer transition-colors">
                  {mat}
                </div>
              ))}
            </FilterGroup>

            {/* Manufacturing */}
            <FilterGroup title="Manufacturing">
              {MANUFACTURING.map((mfg) => (
                <div key={mfg} className="text-sm text-[#6B1F2B]/60 py-1.5 border-b border-[#C3A35E]/10 hover:text-[#6B1F2B] cursor-pointer transition-colors">
                  {mfg}
                </div>
              ))}
            </FilterGroup>

            {/* Market Positioning */}
            <FilterGroup title="Market Positioning">
              {POSITIONING.map((pos) => (
                <div key={pos} className="text-sm text-[#6B1F2B]/60 py-1.5 border-b border-[#C3A35E]/10 hover:text-[#6B1F2B] cursor-pointer transition-colors">
                  {pos}
                </div>
              ))}
            </FilterGroup>

            {/* Region */}
            <FilterGroup title="Region">
              {REGIONS.map((region) => (
                <div key={region} className="text-sm text-[#6B1F2B]/60 py-1.5 border-b border-[#C3A35E]/10 hover:text-[#6B1F2B] cursor-pointer transition-colors">
                  {region}
                </div>
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort & Count Bar */}
          <div className="flex items-center justify-between mb-6 border-b border-[#C3A35E]/20 pb-3">
            <span className="text-sm text-[#6B1F2B]/60">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {activeCategory !== 'all' && (
                <span className="ml-1">
                  in <strong className="text-[#6B1F2B]">{CATEGORIES.find((c) => c.key === activeCategory)?.label}</strong>
                </span>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all group relative"
                style={{ borderRadius: 0, boxShadow: 'none' }}
              >
                {/* Badge */}
                {product.badge && (
                  <div
                    className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#C3A35E] text-[#6B1F2B]"
                    style={{ borderRadius: 0 }}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Image */}
                <div className="h-[280px] bg-[#F5F1E8] flex items-center justify-center border-b border-[#C3A35E]/20 overflow-hidden">
                  <img
                    src={getProductImage(product.keywords)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<span class="text-5xl opacity-20">👶</span>'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="text-[10px] text-[#C3A35E] font-bold uppercase tracking-wider mb-1">
                    {product.category} • {product.material}
                  </div>
                  <h4 className="text-sm font-semibold text-[#6B1F2B] mb-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-[#C3A35E]">{product.price}</span>
                    <span className="text-[10px] text-[#6B1F2B]/40">{product.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-20">👶</div>
              <p className="text-lg text-[#6B1F2B]/40 font-serif">No products match your search.</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery('') }}
                className="mt-4 px-6 py-2 text-sm font-semibold text-[#6B1F2B] border border-[#C3A35E]/30 hover:bg-[#6B1F2B] hover:text-white transition-colors"
                style={{ borderRadius: 0 }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <section className="bg-[#6B1F2B] py-16 px-4 border-t border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-serif">
            Looking for OEM / Private Label Kids Wear?
          </h2>
          <p className="text-base text-white/60 max-w-[600px] mx-auto mb-8">
            Harvics partners with manufacturers across South Asia, Turkey, and China to deliver
            custom kids clothing at scale. MOQ from 500 pieces. All fabrics certified OEKO-TEX and GOTS.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#D4B86A] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Request a Quote
            </Link>
            <Link
              href={`/${locale}/sourcing`}
              className="px-8 py-3 bg-transparent text-[#C3A35E] font-bold text-sm uppercase tracking-wider border border-[#C3A35E]/40 hover:bg-[#C3A35E]/10 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Our Sourcing Solutions
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Filter Group Sub-Component ──────────────────────────────────────────────

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-4 border-b border-[#C3A35E]/15">
      <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}
