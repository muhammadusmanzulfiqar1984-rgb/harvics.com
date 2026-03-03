// Header and Footer are provided by layout.tsx
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
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

interface ClearancePageProps {
  params: Promise<{ locale: string }>
}

export default async function ClearancePage({ params }: ClearancePageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  
  // Get product images for clearance items
  const clearanceProductImages = getProductImages(8)

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-red-600 via-red-500 to-pink-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              Clearance Sale
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              Final reductions - Up to 70% off selected items
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border-2 border-white rounded-xl p-6 mb-8 text-center">
              <p className="text-lg font-bold text-white/90">
                ⚠️ Limited Stock Available - While Supplies Last
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                <div key={item} className="bg-white border-2 border-red-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
                    CLEARANCE
                  </div>
                  <div className="relative h-48 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={clearanceProductImages[index]}
                      alt={`Harvics Clearance Product ${item}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#C3A35E] mb-2">Clearance Item {item}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold text-red-600">$19.99</span>
                    <span className="text-white/90 line-through text-sm">$69.99</span>
                  </div>
                  <div className="text-sm text-red-600 font-bold mb-4">71% OFF</div>
                  <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                    Buy Now
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

