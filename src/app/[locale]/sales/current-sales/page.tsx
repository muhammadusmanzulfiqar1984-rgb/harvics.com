
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getSalesPageContent } from '@/utils/contentPopulator'
import { getProductImages } from '@/utils/harvicsProductImages'
import Image from 'next/image'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

interface CurrentSalesPageProps {
  params: Promise<{ locale: string }>
}

export default async function CurrentSalesPage({ params }: CurrentSalesPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  // Get intelligent content from content populator
  const content = getSalesPageContent('current-sales', locale)
  
  // Get product images for current sales
  const saleProductImages = getProductImages(6)

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-[#6B1F2B] via-[#5a000c] to-[#6B1F2B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
            {/* Show dynamic count if available */}
            {content.sections[0]?.config?.showCount && (
              <div className="mt-6 text-[#C3A35E] text-lg">
                <span className="font-bold">{content.sections[0]?.items?.length || 156}</span> items on sale
              </div>
            )}
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((item, index) => (
                <div key={item} className="bg-white border border-[#C3A35E]/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="bg-[#C3A35E] text-[#6B1F2B] px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
                    SALE
                  </div>
                  <div className="relative h-48 rounded-lg mb-4 overflow-hidden bg-gray-100">
                    <Image
                      src={saleProductImages[index]}
                      alt={`Harvics Product on Sale ${item}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#6B1F2B] mb-2">Product Name {item}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-[#6B1F2B]">$29.99</span>
                    <span className="text-gray-500 line-through">$49.99</span>
                    <span className="text-red-600 text-sm font-bold">40% OFF</span>
                  </div>
                  <button className="w-full bg-[#6B1F2B] text-[#C3A35E] py-3 rounded-lg font-bold hover:bg-[#5a000c] transition-colors border border-[#C3A35E]/50">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

