import { navVerticals, slugify } from '@/data/megaMenuData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSubcategoryProducts, getVerticalProducts, getProductImage } from '@/data/productCatalog'
import { getCategoryDescription } from '@/data/verticalDescriptions'
import type { Metadata } from 'next'
import CategoryPageClient from './CategoryPageClient'

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

  const products = getSubcategoryProducts(vertical, category) || []
  const catDesc = getCategoryDescription(vertical, category)

  return (
    <CategoryPageClient
      locale={locale}
      vertical={vertical}
      category={category}
      verticalData={verticalData}
      block={block}
      products={products}
      catDesc={catDesc}
    />
  )
}
