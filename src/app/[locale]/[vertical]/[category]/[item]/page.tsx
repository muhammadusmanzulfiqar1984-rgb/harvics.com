import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductImage } from '@/data/productCatalog'
import { getItemDescription } from '@/data/verticalDescriptions'
import type { Metadata } from 'next'

const VALID_VERTICALS = navVerticals.map((v) => v.key)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; vertical: string; category: string; item: string }>
}): Promise<Metadata> {
  const { vertical, category, item } = await params
  const verticalData = navVerticals.find((v) => v.key === vertical)
  const block = verticalData?.blocks.find((b) => slugify(b.title) === category)
  const matchedItem = block?.items.find((i) => slugify(i) === item)
  const itemDesc = getItemDescription(vertical, item)
  return {
    title: `${matchedItem || item} — ${block?.title || category} | Harvics`,
    description: itemDesc?.description || `Harvics ${matchedItem || item} — premium ${block?.title || category} solutions for global markets.`,
  }
}

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

  const itemDesc = getItemDescription(vertical, item)

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumbs */}
      <div className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2 text-sm text-white/60">
          <Link href={`/${locale}`} className="hover:text-[#C3A35E] transition-colors">Home</Link>
          <span className="text-white/30">›</span>
          <Link href={`/${locale}/${vertical}`} className="hover:text-[#C3A35E] transition-colors">{verticalData.label}</Link>
          <span className="text-white/30">›</span>
          <Link href={`/${locale}/${vertical}/${category}`} className="hover:text-[#C3A35E] transition-colors">{block.title}</Link>
          <span className="text-white/30">›</span>
          <span className="text-[#C3A35E] font-medium">{matchedItem}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#6B1F2B] py-14 px-4 border-b border-[#C3A35E]/40">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">
            {verticalData.label} · {block.title}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {matchedItem}
          </h1>
          {itemDesc?.description && (
            <p className="text-base text-white/50 max-w-[600px] mx-auto leading-relaxed mt-2">
              {itemDesc.description.slice(0, 120)}…
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <div className="bg-white border border-[#C3A35E]/20 p-10" style={{ borderRadius: 0, boxShadow: 'none' }}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product image */}
            <div className="w-full md:w-[300px] h-[250px] bg-[#F5F1E8] border border-[#C3A35E]/20 flex-shrink-0 overflow-hidden" style={{ borderRadius: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getProductImage(matchedItem.toLowerCase())}
                alt={matchedItem}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = '/Images/logo.png' }}
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#6B1F2B] mb-4">{matchedItem}</h2>
              <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-6">
                {itemDesc?.description ||
                  `Harvics provides comprehensive ${matchedItem.toLowerCase()} solutions as part of our ${block.title.toLowerCase()} portfolio within the ${verticalData.label.toLowerCase()} vertical. Backed by our global supply chain network operating across multiple continents.`}
              </p>

              {/* Specs */}
              {itemDesc?.specs && itemDesc.specs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {itemDesc.specs.map((spec, idx) => {
                      const [label, ...rest] = spec.split(':')
                      const value = rest.join(':').trim()
                      return (
                        <div key={idx} className="flex justify-between text-sm border-b border-[#C3A35E]/10 pb-2">
                          <span className="text-[#6B1F2B]/50 font-medium">{label}</span>
                          <span className="font-semibold text-[#6B1F2B] text-right max-w-[60%]">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

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

      {/* CTA Banner */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Interested in {matchedItem}?</h3>
            <p className="text-white/50 text-sm">Get a custom quote from our global sourcing team — competitive pricing, reliable supply.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Request Quote
            </Link>
            <Link
              href={`/${locale}/${vertical}/${category}`}
              className="px-8 py-3 border border-[#C3A35E]/40 text-[#C3A35E] text-sm font-medium hover:border-[#C3A35E] transition-colors"
              style={{ borderRadius: 0 }}
            >
              ← Back to {block.title}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
