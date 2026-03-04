import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSubcategoryProducts, getVerticalProducts, getProductImage } from '@/data/productCatalog'

const VALID_VERTICALS = navVerticals.map((v) => v.key)

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

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <section className="bg-[#6B1F2B] py-12 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-2">
            {verticalData.label}
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {block.title}
          </h1>
          <div className="mt-3 text-xs text-white/40">
            <Link href={`/${locale}`} className="hover:text-white/60">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/${vertical}`} className="hover:text-white/60">{verticalData.label}</Link>
            <span className="mx-2">›</span>
            <span className="text-[#C3A35E]">{block.title}</span>
          </div>
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
    </main>
  )
}
