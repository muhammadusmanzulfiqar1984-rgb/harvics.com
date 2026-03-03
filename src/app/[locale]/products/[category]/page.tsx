
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import ProductCategoryClient from './ProductCategoryClient'
import { getCategoryInfo, getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getSubcategoriesForCategory } from '@/utils/folderScanner'
import { getProductCategoryContent } from '@/utils/contentPopulator'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const categories = ['beverages', 'confectionery', 'snacks', 'pasta', 'bakery', 'culinary', 'frozenFoods']

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

  // Get category info from folder-based data
  const categoryInfo = getCategoryInfo(category)
  if (!categoryInfo) {
    notFound()
  }

  // Get subcategories from folder structure
  const subcategories = getSubcategoriesForCategory(category)
  
  if (subcategories.length === 0) {
    notFound()
  }

  // Get intelligent content from content populator
  const intelligentContent = getProductCategoryContent(category, locale)

  const categoryTitle = t(`${category}`) || intelligentContent.hero.title
  const categoryDescription = t(`${category}Desc`) || intelligentContent.hero.subtitle

  const categories = getFolderBasedCategories() || []
  
  return (
    <main className="min-h-screen bg-white">
      
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
