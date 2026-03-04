import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSubcategoryProducts, getVerticalProducts, getProductImage } from '@/data/productCatalog'
import { getCategoryDescription } from '@/data/verticalDescriptions'
import type { Metadata } from 'next'

const VALID_VERTICALS = navVerticals.map((v) => v.key)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; vertical: string; category: string }>
}): Promise<Metadata> {
  const { vertical, category } = await params
  const verticalData = navVerticals.find((v) => v.key === vertical)
  const block = verticalData?.blocks.find((b) => slugify(b.title) === category)
  const catDesc = getCategoryDescription(vertical, category)
  return {
    title: `${block?.title || category} — ${verticalData?.label || vertical} | Harvics`,
    description: catDesc?.description || `Explore Harvics ${block?.title || category} solutions across global markets.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; vertical: string; category: string }>
}) {
  const { locale, vertical, category } = await params

  if (!VALID_VERTICALS.includes(vertical)) {
    notFound()
  }

  const verticalData = navVerticals.find((v) => v.key === vertical)!
  const block = verticalData.blocks.find((b) => slugify(b.title) === category)

  if (!block) {
    notFound()
  }

  // Try to get products for this subcategory
  const products = getSubcategoryProducts(vertical, category) || []
  const catDesc = getCategoryDescription(vertical, category)

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumbs */}
      <div className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2 text-sm text-white/60">
          <Link href={`/${locale}`} className="hover:text-[#C3A35E] transition-colors">Home</Link>
          <span className="text-white/30">›</span>
          <Link href={`/${locale}/${vertical}`} className="hover:text-[#C3A35E] transition-colors">{verticalData.label}</Link>
          <span className="text-white/30">›</span>
          <span className="text-[#C3A35E] font-medium">{block.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#6B1F2B] py-16 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center">
            <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-2">
              {verticalData.label}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              {block.title}
            </h1>
            {catDesc && (
              <p className="text-base text-white/60 leading-relaxed max-w-[700px] mx-auto mb-4">
                {catDesc.description}
              </p>
            )}
          </div>
          {/* Highlights */}
          {catDesc && catDesc.highlights.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {catDesc.highlights.map((h) => (
                <span key={h} className="px-4 py-1.5 border border-[#C3A35E]/30 text-xs text-[#C3A35E] font-medium uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Items Grid */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {block.items.map((item) => (
            <Link
              key={item}
              href={`/${locale}/${vertical}/${category}/${slugify(item)}`}
              className="bg-white border border-[#C3A35E]/20 hover:border-[#C3A35E] p-6 text-center transition-colors group"
              style={{ borderRadius: 0, boxShadow: 'none' }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F1E8] border border-[#C3A35E]/20 overflow-hidden" style={{ borderRadius: 0 }}>
                <img src={getProductImage(item.toLowerCase())} alt={item} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="text-sm font-semibold text-[#6B1F2B] group-hover:text-[#6B1F2B]">
                {item}
              </h3>
            </Link>
          ))}
        </div>

        {/* Products for this category if available */}
        {products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-[#6B1F2B] mb-6">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white border border-[#C3A35E]/20 p-5"
                  style={{ borderRadius: 0, boxShadow: 'none' }}
                >
                  <h4 className="text-sm font-semibold text-[#6B1F2B] mb-1">{product.name}</h4>
                  {product.desc && <p className="text-xs text-[#6B1F2B]/50 mb-2">{product.desc}</p>}
                  <div className="text-sm font-bold text-[#C3A35E]">{product.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Need {block.title} Solutions?</h3>
            <p className="text-white/50 text-sm">Contact our sourcing team for competitive quotes and global supply.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Get a Quote
            </Link>
            <Link
              href={`/${locale}/${vertical}`}
              className="px-8 py-3 border border-[#C3A35E]/40 text-[#C3A35E] text-sm font-medium hover:border-[#C3A35E] transition-colors"
              style={{ borderRadius: 0 }}
            >
              ← Back to {verticalData.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
