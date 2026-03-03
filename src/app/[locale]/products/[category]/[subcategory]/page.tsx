import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import SubcategoryClient from './SubcategoryClient'
import { getCategoryInfo, getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getSubcategoriesForCategory, getImagesForSubcategory, getCategoriesFromFolder } from '@/utils/folderScanner'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const categories = ['beverages', 'confectionery', 'snacks', 'pasta', 'bakery', 'culinary', 'frozenFoods']
  
  // Get all subcategories for each category
  // Note: This scans the folder structure, so it's done at build time
  // Cache the categories once to avoid repeated scans
  const params: { locale: string; category: string; subcategory: string }[] = []
  
  try {
    // Get all categories once (this will use the cache)
    const allCategories = getCategoriesFromFolder()
    
    for (const locale of locales) {
      for (const category of categories) {
        // Find category from cached result
        const categoryData = allCategories.find(cat => cat.key === category)
        if (categoryData && categoryData.subcategories) {
          for (const subcategory of categoryData.subcategories) {
            params.push({ locale, category, subcategory: subcategory.slug })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating static params for subcategories:', error)
    // Return empty array if folder scanning fails - pages will be generated on-demand
    return []
  }
  
  return params
}

interface SubcategoryPageProps {
  params: Promise<{
    locale: string
    category: string
    subcategory: string
  }>
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { locale, category, subcategory } = await params
  const t = await getTranslations('products')

  // Get category info
  const categoryInfo = getCategoryInfo(category)
  if (!categoryInfo) {
    notFound()
  }

  // Get subcategories to find the current one
  const subcategories = getSubcategoriesForCategory(category)
  const currentSubcategory = subcategories.find(sub => sub.slug === subcategory)
  
  if (!currentSubcategory) {
    notFound()
  }

  // Get images for this subcategory
  const images = getImagesForSubcategory(category, subcategory)
  
  // Don't return 404 if no images - just show empty state
  // This allows the page to load and show the navigation structure

  const categoryTitle = t(`${category}`)
  const subcategoryTitle = currentSubcategory.name
  const categories = getFolderBasedCategories() || []

  return (
    <main className="min-h-screen bg-[#6B1F2B]">
      <div className="pt-20">
        <SubcategoryClient
          images={images}
          categoryTitle={categoryTitle}
          subcategoryTitle={subcategoryTitle}
          locale={locale}
          categoryKey={category}
          subcategorySlug={subcategory}
        />
      </div>
    </main>
  )
}

