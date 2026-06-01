
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import ProductCategoryClient from './ProductCategoryClient'
import { getMergedCategories } from '@/utils/getCategories'
import { getAllCategories } from '@/utils/folderScanner'
import { getProductCategoryContent } from '@/utils/contentPopulator'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  // Build every category key the folder scanner discovers across all 10 verticals
  // (FMCG food keeps its legacy short keys; new structure uses composite keys
  // like `apparels-apparel-womens-wear`, `fmcg-personal-care-skincare`, etc.)
  const categories = getAllCategories().map(c => c.key)

  return locales.flatMap(locale =>
    categories.map(category => ({ locale, category }))
  )
}

interface CategoryPageProps {
  params: Promise<{
    locale: string
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params
  const t = await getTranslations('products')

  // Merge local folder data with R2 manifest (Groq+FLUX generated images)
  const merged = await getMergedCategories()
  const categoryInfo = merged.find(c => c.key === category)
  if (!categoryInfo) {
    notFound()
  }

  const subcategories = categoryInfo.subcategories
  if (subcategories.length === 0) {
    notFound()
  }

  // Get intelligent content from content populator
  const intelligentContent = getProductCategoryContent(category, locale)

  const categoryTitle = t(`${category}`) || intelligentContent.hero.title
  const categoryDescription = t(`${category}Desc`) || intelligentContent.hero.subtitle

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      
      <div className="pt-20">
        <ProductCategoryClient
          subcategories={subcategories}
          categoryTitle={categoryTitle}
          categoryDescription={categoryDescription}
          locale={locale}
          categoryKey={category}
        />
      </div>
    </main>
  )
}
