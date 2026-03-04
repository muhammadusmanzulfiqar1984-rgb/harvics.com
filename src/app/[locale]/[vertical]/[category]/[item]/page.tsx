import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductImage } from '@/data/productCatalog'

const VALID_VERTICALS = navVerticals.map((v) => v.key)

export default async function ItemPage({
  params,
}: {
  params: Promise<{ locale: string; vertical: string; category: string; item: string }>
}) {
  const { locale, vertical, category, item } = await params

  if (!VALID_VERTICALS.includes(vertical)) {
    notFound()
  }

  const verticalData = navVerticals.find((v) => v.key === vertical)!
  const block = verticalData.blocks.find((b) => slugify(b.title) === category)

  if (!block) {
    notFound()
  }

  const matchedItem = block.items.find((i) => slugify(i) === item)

  if (!matchedItem) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <section className="bg-[#6B1F2B] py-12 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-2">
            {verticalData.label} · {block.title}
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {matchedItem}
          </h1>
          <div className="mt-3 text-xs text-white/40">
            <Link href={`/${locale}`} className="hover:text-white/60">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/${vertical}`} className="hover:text-white/60">{verticalData.label}</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/${vertical}/${category}`} className="hover:text-white/60">{block.title}</Link>
            <span className="mx-2">›</span>
            <span className="text-[#C3A35E]">{matchedItem}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <div className="bg-white border border-[#C3A35E]/20 p-10" style={{ borderRadius: 0, boxShadow: 'none' }}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product image */}
            <div className="w-full md:w-[300px] h-[250px] bg-[#F5F1E8] border border-[#C3A35E]/20 flex-shrink-0 overflow-hidden" style={{ borderRadius: 0 }}>
              <img
                src={getProductImage(matchedItem.toLowerCase())}
                alt={matchedItem}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#6B1F2B] mb-4">{matchedItem}</h2>
              <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-6">
                Harvics provides comprehensive {matchedItem.toLowerCase()} solutions 
                as part of our {block.title.toLowerCase()} portfolio within the {verticalData.label.toLowerCase()} vertical. 
                Backed by our global supply chain network operating across multiple continents.
              </p>

              <div className="border-t border-[#C3A35E]/20 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B1F2B]/50">Vertical</span>
                  <span className="font-semibold text-[#6B1F2B]">{verticalData.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B1F2B]/50">Category</span>
                  <span className="font-semibold text-[#6B1F2B]">{block.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B1F2B]/50">Availability</span>
                  <span className="font-semibold text-[#C3A35E]">Global</span>
                </div>
              </div>

              <Link
                href={`/${locale}/contact`}
                className="inline-block mt-6 px-8 py-3 bg-[#6B1F2B] text-white text-sm font-semibold border border-[#6B1F2B] hover:bg-[#5a1a24] transition-colors"
                style={{ borderRadius: 0 }}
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Related Items */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-[#6B1F2B] mb-4">More in {block.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {block.items
              .filter((i) => slugify(i) !== item)
              .map((relItem) => (
                <Link
                  key={relItem}
                  href={`/${locale}/${vertical}/${category}/${slugify(relItem)}`}
                  className="bg-white border border-[#C3A35E]/20 p-4 text-center text-sm text-[#6B1F2B] hover:border-[#C3A35E] transition-colors"
                  style={{ borderRadius: 0, boxShadow: 'none' }}
                >
                  {relItem}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  )
}
