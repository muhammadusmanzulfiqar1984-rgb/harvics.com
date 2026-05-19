import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import ProductLineClient from './ProductLineClient'
import { SUPPORTED_LOCALES } from '@/config/locales'
import enMessages from '@/locales/en.json'

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
  const fallbackProducts = enMessages.products as Record<string, any>

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
      { id: 'goal-1', name: 'Harvics GOAL Bubble Gum', description: 'Classic bubble gum flavor', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-2', name: 'Harvics GOAL Strawberry', description: 'Sweet strawberry bubble gum', image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-3', name: 'Harvics GOAL Blue Raspberry', description: 'Tangy blue raspberry bubble gum', image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-4', name: 'Harvics GOAL Watermelon', description: 'Refreshing watermelon bubble gum', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-5', name: 'Harvics GOAL Grape', description: 'Rich grape bubble gum', image: 'https://images.unsplash.com/photo-1560857876-0519c4857c56?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-6', name: 'Harvics GOAL Cherry', description: 'Bold cherry bubble gum', image: 'https://images.unsplash.com/photo-1534119768988-c496e0738c44?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-7', name: 'Harvics GOAL Orange', description: 'Zesty orange bubble gum', image: 'https://images.unsplash.com/photo-1563262924-641a8b3d397f?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-8', name: 'Harvics GOAL Lemon', description: 'Sour lemon bubble gum', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-9', name: 'Harvics GOAL Apple', description: 'Crisp apple bubble gum', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-10', name: 'Harvics GOAL Tropical', description: 'Exotic tropical bubble gum', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-11', name: 'Harvics GOAL Mint', description: 'Cool mint bubble gum', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-12', name: 'Harvics GOAL Cola', description: 'Classic cola bubble gum', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-13', name: 'Harvics GOAL Bubblegum', description: 'Original bubblegum flavor', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop&q=70', weight: '15g' },
      { id: 'goal-14', name: 'Harvics GOAL Berry Mix', description: 'Mixed berry bubble gum', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=600&fit=crop&q=70', weight: '15g' },
    ],
    harvicsBearPops: [
      { id: 'bearpops-1', name: 'Harvics BearPops Original', description: 'Fruity gummy bears', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=600&fit=crop&q=70', weight: '25g' },
      { id: 'bearpops-2', name: 'Harvics BearPops Sour', description: 'Sour gummy bears', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&h=600&fit=crop&q=70', weight: '25g' },
      { id: 'bearpops-3', name: 'Harvics BearPops Tropical', description: 'Tropical gummy bears', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&h=600&fit=crop&q=70', weight: '25g' },
    ],
    harvicsCatoPops: [
      { id: 'catopops-1', name: 'Harvics CatoPops Strawberry', description: 'Strawberry chewy candy', image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=600&fit=crop&q=70', weight: '20g' },
      { id: 'catopops-2', name: 'Harvics CatoPops Orange', description: 'Orange chewy candy', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=600&h=600&fit=crop&q=70', weight: '20g' },
      { id: 'catopops-3', name: 'Harvics CatoPops Grape', description: 'Grape chewy candy', image: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=600&h=600&fit=crop&q=70', weight: '20g' },
      { id: 'catopops-4', name: 'Harvics CatoPops Apple', description: 'Apple chewy candy', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=600&fit=crop&q=70', weight: '20g' },
    ],
    harvicsChocone: [
      { id: 'chocone-1', name: 'Harvics Chocone Classic', description: 'Classic chocolate cone', image: 'https://images.unsplash.com/photo-1598614187854-26a60e982dc4?w=600&h=600&fit=crop&q=70', weight: '35g' },
      { id: 'chocone-2', name: 'Harvics Chocone Hazelnut', description: 'Hazelnut chocolate cone', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=600&fit=crop&q=70', weight: '35g' },
      { id: 'chocone-3', name: 'Harvics Chocone Caramel', description: 'Caramel chocolate cone', image: 'https://images.unsplash.com/photo-1596803244618-8dce2b1f5c3a?w=600&h=600&fit=crop&q=70', weight: '35g' },
    ],
    harvicsClassic: [
      { id: 'classic-1', name: 'Harvics Classic Candy', description: 'Assorted classic candies', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=600&fit=crop&q=70', weight: '30g' },
    ],
    harvicsEclair: [
      { id: 'eclair-1', name: 'Harvics Eclair Chocolate', description: 'Rich chocolate eclair', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop&q=70', weight: '40g' },
      { id: 'eclair-2', name: 'Harvics Eclair Vanilla', description: 'Smooth vanilla eclair', image: 'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?w=600&h=600&fit=crop&q=70', weight: '40g' },
    ],
    harvicsFruityPops: [
      { id: 'fruitypops-1', name: 'Harvics FruityPops Mixed Berry', description: 'Mixed berry fruit pops', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=600&fit=crop&q=70', weight: '20g' },
    ],
    harvicsHeartPops: [
      { id: 'heartpops-1', name: 'Harvics HeartPops Strawberry', description: 'Strawberry heart-shaped candy', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop&q=70', weight: '18g' },
      { id: 'heartpops-2', name: 'Harvics HeartPops Cherry', description: 'Cherry heart-shaped candy', image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600&h=600&fit=crop&q=70', weight: '18g' },
    ],
    harvicsMolten: [
      { id: 'molten-1', name: 'Harvics Molten Dark Chocolate', description: 'Intense dark chocolate with molten center', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=600&fit=crop&q=70', weight: '45g' },
    ],
    harvicsSnapbar: [
      { id: 'snapbar-1', name: 'Harvics Snapbar Milk Chocolate', description: 'Crispy milk chocolate bar', image: 'https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=600&h=600&fit=crop&q=70', weight: '50g' },
      { id: 'snapbar-2', name: 'Harvics Snapbar Dark Chocolate', description: 'Crispy dark chocolate bar', image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&h=600&fit=crop&q=70', weight: '50g' },
    ],
    harvicsSweetverse: [
      { id: 'sweetverse-1', name: 'Harvics Sweetverse Assorted', description: 'A universe of sweet flavors', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop&q=70', weight: '30g' },
    ],
  }

  const products = productsData[productLineKey] || []
  const fallbackTitle = fallbackProducts[productLineKey]?.title || productLineKey
  const fallbackDescription = fallbackProducts[productLineKey]?.description || ''
  const hasTranslator = typeof (t as any).has === 'function'

  const productLineTitle = hasTranslator && (t as any).has(`${productLineKey}.title`)
    ? t(`${productLineKey}.title`)
    : fallbackTitle
  const productLineDescription = hasTranslator && (t as any).has(`${productLineKey}.description`)
    ? t(`${productLineKey}.description`)
    : fallbackDescription

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
