import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import { getProductImage } from '@/data/productCatalog'
import { getItemDescription } from '@/data/verticalDescriptions'
import ItemPageClient from './ItemPageClient'
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
    <ItemPageClient
      locale={locale}
      verticalLabel={verticalData.label}
      verticalKey={verticalData.key}
      blockTitle={block.title}
      categorySlug={category}
      matchedItem={matchedItem}
      itemSlug={item}
      description={itemDesc?.description || ''}
      specs={itemDesc?.specs || []}
      imageSrc={getProductImage(matchedItem.toLowerCase())}
      relatedItems={block.items
        .filter((i) => slugify(i) !== item)
        .map((i) => ({ name: i, slug: slugify(i) }))}
    />
  )
}
