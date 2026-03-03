import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import ProductLineClient from './ProductLineClient'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const productLines = [
    'goal', 'bearpops', 'catopops', 'chocone', 'classic', 'eclair',
    'fruitypops', 'heartpops', 'molten', 'snapbar'
  ]

  return locales.flatMap(locale =>
    productLines.map(productLine => ({ locale, productLine }))
  )
}

interface ProductLinePageProps {
  params: Promise<{
    locale: string
    productLine: string
  }>
}

export default async function ProductLinePage({ params }: ProductLinePageProps) {
  const { locale, productLine } = await params
  const t = await getTranslations('products')

  const productLineMap: { [key: string]: string } = {
    'goal': 'harvicsGoal',
    'bearpops': 'harvicsBearPops',
    'catopops': 'harvicsCatoPops',
    'chocone': 'harvicsChocone',
    'classic': 'harvicsClassic',
    'eclair': 'harvicsEclair',
    'fruitypops': 'harvicsFruityPops',
    'heartpops': 'harvicsHeartPops',
    'molten': 'harvicsMolten',
    'snapbar': 'harvicsSnapbar'
  }

  const productLineKey = productLineMap[productLine]
  if (!productLineKey) {
    notFound()
  }

  // Sample products for each product line - replace with your actual data
  const productsData: { [key: string]: any[] } = {
    harvicsGoal: [
      { id: 'goal-1', name: 'Harvics GOAL Bubble Gum', description: 'Classic bubble gum flavor', image: '/Images/Confectionary/Harvics%20GOAL/1758826456796.jpg', weight: '15g' },
      { id: 'goal-2', name: 'Harvics GOAL Strawberry', description: 'Sweet strawberry bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/1758828024533.jpg', weight: '15g' },
      { id: 'goal-3', name: 'Harvics GOAL Blue Raspberry', description: 'Tangy blue raspberry bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/1758828341543.jpg', weight: '15g' },
      { id: 'goal-4', name: 'Harvics GOAL Watermelon', description: 'Refreshing watermelon bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/1758996674745.jpg', weight: '15g' },
      { id: 'goal-5', name: 'Harvics GOAL Grape', description: 'Rich grape bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/1758997397789.jpg', weight: '15g' },
      { id: 'goal-6', name: 'Harvics GOAL Cherry', description: 'Bold cherry bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/1758997520121.jpg', weight: '15g' },
      { id: 'goal-7', name: 'Harvics GOAL Orange', description: 'Zesty orange bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20250927-WA0023.jpg', weight: '15g' },
      { id: 'goal-8', name: 'Harvics GOAL Lemon', description: 'Sour lemon bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20250927-WA0036.jpg', weight: '15g' },
      { id: 'goal-9', name: 'Harvics GOAL Apple', description: 'Crisp apple bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20250927-WA0037.jpg', weight: '15g' },
      { id: 'goal-10', name: 'Harvics GOAL Tropical', description: 'Exotic tropical bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20250927-WA0038.jpg', weight: '15g' },
      { id: 'goal-11', name: 'Harvics GOAL Mint', description: 'Cool mint bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20250927-WA0039.jpg', weight: '15g' },
      { id: 'goal-12', name: 'Harvics GOAL Cola', description: 'Classic cola bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20251004-WA0059.jpg', weight: '15g' },
      { id: 'goal-13', name: 'Harvics GOAL Bubblegum', description: 'Original bubblegum flavor', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20251004-WA0060.jpg', weight: '15g' },
      { id: 'goal-14', name: 'Harvics GOAL Berry Mix', description: 'Mixed berry bubble gum', image: '/Images/Confectionary/Harvics%20GOAL/IMG-20251005-WA0063.jpg', weight: '15g' },
    ],
    harvicsBearPops: [
      { id: 'bearpops-1', name: 'Harvics BearPops Original', description: 'Fruity gummy bears', image: '/Images/Confectionary/Harvics%20BearPops/1759696963916.jpg', weight: '25g' },
      { id: 'bearpops-2', name: 'Harvics BearPops Sour', description: 'Sour gummy bears', image: '/Images/Confectionary/Harvics%20BearPops/1759697222105.jpg', weight: '25g' },
      { id: 'bearpops-3', name: 'Harvics BearPops Tropical', description: 'Tropical gummy bears', image: '/Images/Confectionary/Harvics%20BearPops/IMG-20250905-WA0004.jpg', weight: '25g' },
    ],
    harvicsCatoPops: [
      { id: 'catopops-1', name: 'Harvics CatoPops Strawberry', description: 'Strawberry chewy candy', image: '/Images/Confectionary/Harvics%20CatoPops/1759728470458.jpg', weight: '20g' },
      { id: 'catopops-2', name: 'Harvics CatoPops Orange', description: 'Orange chewy candy', image: '/Images/Confectionary/Harvics%20CatoPops/1759728715172.jpg', weight: '20g' },
      { id: 'catopops-3', name: 'Harvics CatoPops Grape', description: 'Grape chewy candy', image: '/Images/Confectionary/Harvics%20CatoPops/1759731594552.jpg', weight: '20g' },
      { id: 'catopops-4', name: 'Harvics CatoPops Apple', description: 'Apple chewy candy', image: '/Images/Confectionary/Harvics%20CatoPops/1759731824403.jpg', weight: '20g' },
    ],
    harvicsChocone: [
      { id: 'chocone-1', name: 'Harvics Chocone Classic', description: 'Classic chocolate cone', image: '/Images/Confectionary/Harvics%20Chocone/1759832828111.jpg', weight: '35g' },
      { id: 'chocone-2', name: 'Harvics Chocone Hazelnut', description: 'Hazelnut chocolate cone', image: '/Images/Confectionary/Harvics%20Chocone/1759839974132.jpg', weight: '35g' },
      { id: 'chocone-3', name: 'Harvics Chocone Caramel', description: 'Caramel chocolate cone', image: '/Images/Confectionary/Harvics%20Chocone/1759840263381.jpg', weight: '35g' },
    ],
    harvicsClassic: [
      { id: 'classic-1', name: 'Harvics Classic Candy', description: 'Assorted classic candies', image: '/Images/Confectionary/Harvics%20Classic/file_000000000b0461f8badd340f6a1f6cbb.png', weight: '30g' },
    ],
    harvicsEclair: [
      { id: 'eclair-1', name: 'Harvics Eclair Chocolate', description: 'Rich chocolate eclair', image: '/Images/Confectionary/Harvics%20Eclair/1758464045330.jpg', weight: '40g' },
      { id: 'eclair-2', name: 'Harvics Eclair Vanilla', description: 'Smooth vanilla eclair', image: '/Images/Confectionary/Harvics%20Eclair/IMG-20250921-WA0059.jpg', weight: '40g' },
    ],
    harvicsFruityPops: [
      { id: 'fruitypops-1', name: 'Harvics FruityPops Mixed Berry', description: 'Mixed berry fruit pops', image: '/Images/Confectionary/Harvics%20FruityPops/file_00000000564c61f4a4968e2a0be732f5.png', weight: '20g' },
    ],
    harvicsHeartPops: [
      { id: 'heartpops-1', name: 'Harvics HeartPops Strawberry', description: 'Strawberry heart-shaped candy', image: '/Images/Confectionary/Harvics%20HeartPops/1759698888156.jpg', weight: '18g' },
      { id: 'heartpops-2', name: 'Harvics HeartPops Cherry', description: 'Cherry heart-shaped candy', image: '/Images/Confectionary/Harvics%20HeartPops/1759699683702.jpg', weight: '18g' },
    ],
    harvicsMolten: [
      { id: 'molten-1', name: 'Harvics Molten Dark Chocolate', description: 'Intense dark chocolate with molten center', image: '/Images/Confectionary/Harvics%20Molten/1758457917826.jpg', weight: '45g' },
    ],
    harvicsSnapbar: [
      { id: 'snapbar-1', name: 'Harvics Snapbar Milk Chocolate', description: 'Crispy milk chocolate bar', image: '/Images/Confectionary/Harvics%20Snapbar/1759837758873(1).jpg', weight: '50g' },
      { id: 'snapbar-2', name: 'Harvics Snapbar Dark Chocolate', description: 'Crispy dark chocolate bar', image: '/Images/Confectionary/Harvics%20Snapbar/1759837758873.jpg', weight: '50g' },
    ],
    harvicsSweetverse: [
      { id: 'sweetverse-1', name: 'Harvics Sweetverse Assorted', description: 'A universe of sweet flavors', image: '/Images/Confectionary/Harvics%20Sweetverse/1758472382421.jpg', weight: '30g' },
    ],
  }

  const products = productsData[productLineKey] || []
  const productLineTitle = t(`${productLineKey}.title`)
  const productLineDescription = t(`${productLineKey}.description`)

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900 dark:via-red-800 dark:to-red-900 transition-colors duration-300">
      <div className="pt-20">
        <ProductLineClient
          products={products}
          productLineTitle={productLineTitle}
          productLineDescription={productLineDescription}
          locale={locale}
          productLineKey={productLineKey}
        />
      </div>
    </main>
  )
}
