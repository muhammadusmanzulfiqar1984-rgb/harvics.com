import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getOffersPageContent } from '@/utils/contentPopulator'
import { getProductImages } from '@/utils/harvicsProductImages'
import Image from 'next/image'
// Header and Footer are provided by layout.tsx

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

interface PromotionsPageProps {
  params: Promise<{ locale: string }>
}

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  // Get intelligent content from content populator
  const content = getOffersPageContent('promotions', locale)

  // Use promotions from content populator or fallback to default
  const promotions = content.sections[0]?.items || [
    { icon: '🎁', title: 'Buy 2 Get 1 Free', description: 'On selected items', color: 'from-blue-500 to-cyan-500' },
    { icon: '🚚', title: 'Free Shipping', description: 'On orders over $50', color: 'from-green-500 to-emerald-500' },
    { icon: '🎓', title: 'Student Discount', description: '20% off with valid ID', color: 'from-purple-500 to-pink-500' },
    { icon: '⭐', title: 'Loyalty Rewards', description: 'Earn points on every purchase', color: 'from-white to-white200' },
  ]

  // Get product images for promotions
  const promotionProductImages = getProductImages(3)

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              {promotions.map((promo, index) => {
                const productImage = promotionProductImages[index % promotionProductImages.length]
                return (
                  <div key={index} className={`bg-gradient-to-r ${promo.color} p-8 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-20">
                      <Image
                        src={productImage}
                        alt={`Harvics ${promo.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 128px, 160px"
                      />
                    </div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4">{promo.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                      <p className="text-lg mb-4">{promo.description}</p>
                      <button className="bg-white text-white/90 px-6 py-3 font-bold hover:scale-105 transition-all">
                        Learn More
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-white border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#C3A35E] mb-6 text-center">Active Promotions</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item, index) => (
                  <div key={item} className="flex items-center justify-between p-4 bg-white gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden flex-shrink-0">
                        <Image
                          src={promotionProductImages[index]}
                          alt={`Harvics Product Promotion ${item}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 80px, 96px"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white/90">Promotion {item}</h4>
                        <p className="text-white/90">Valid until end of month</p>
                      </div>
                    </div>
                    <button className="bg-white text-white px-6 py-2 font-bold hover:bg-white transition-colors">
                      Apply
                    </button>
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

