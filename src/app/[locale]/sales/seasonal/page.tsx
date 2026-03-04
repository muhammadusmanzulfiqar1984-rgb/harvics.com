
import Footer from '@/components/layout/Footer'
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

interface SeasonalPageProps {
  params: Promise<{ locale: string }>
}

export default async function SeasonalPage({ params }: SeasonalPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  
  // Get product images for seasonal items
  const seasonalProductImages = getProductImages(3)

  const seasons = [
    { name: 'Spring Collection', discount: '30% OFF', color: 'from-green-400 to-emerald-500', icon: '🌸' },
    { name: 'Summer Sale', discount: '40% OFF', color: 'from-white to-white200', icon: '☀️' },
    { name: 'Autumn Deals', discount: '35% OFF', color: 'from-orange-500 to-red-500', icon: '🍂' },
    { name: 'Winter Specials', discount: '50% OFF', color: 'from-blue-400 to-cyan-500', icon: '❄️' },
  ]

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              Seasonal Sales
            </h1>
            <p className="text-base md:text-xl text-white max-w-3xl mx-auto">
              Shop seasonal collections with exclusive discounts
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              {seasons.map((season, index) => {
                const productImage = seasonalProductImages[index % seasonalProductImages.length]
                return (
                  <div key={index} className={`bg-gradient-to-r ${season.color} p-8 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-20">
                      <Image
                        src={productImage}
                        alt={`Harvics ${season.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 128px, 160px"
                      />
                    </div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4">{season.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{season.name}</h3>
                      <div className="text-3xl font-bold mb-4">{season.discount}</div>
                      <button className="bg-white text-black px-6 py-3 font-bold hover:scale-105 transition-all">
                        Shop Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-white border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Current Seasonal Offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item, index) => (
                  <div key={item} className="text-center">
                    <div className="relative h-32 mb-4 overflow-hidden">
                      <Image
                        src={seasonalProductImages[index]}
                        alt={`Harvics Seasonal Product ${item}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <h4 className="font-bold text-black mb-2">Seasonal Product {item}</h4>
                    <div className="text-white font-bold">Special Price</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

