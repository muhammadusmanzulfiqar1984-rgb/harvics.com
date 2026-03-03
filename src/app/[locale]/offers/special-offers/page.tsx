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

interface SpecialOffersPageProps {
  params: Promise<{ locale: string }>
}

export default async function SpecialOffersPage({ params }: SpecialOffersPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  // Get intelligent content from content populator
  const content = getOffersPageContent('special-offers', locale)
  
  // Get product images for special offers
  const specialOfferImages = getProductImages(6)

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-[#6B1F2B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium text-[#C3A35E] mb-4 md:mb-6 font-serif">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto font-light">
              {content.hero.subtitle}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#6B1F2B] to-[#5a000c] rounded-xl p-8 md:p-12 text-white mb-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={specialOfferImages[0]}
                  alt="Harvics Flash Sale"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-medium mb-4 font-serif text-[#C3A35E]">Flash Sale - Limited Time!</h2>
                <p className="text-xl mb-6 font-light">Ends in: 2 days, 14 hours, 32 minutes</p>
                <button className="bg-[#C3A35E] text-[#6B1F2B] px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all shadow-lg">
                  Shop Flash Sale
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((item, index) => (
                <div key={item} className="bg-white border border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all group">
                  <div className="bg-[#6B1F2B] text-[#C3A35E] px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4 tracking-wider uppercase">
                    SPECIAL
                  </div>
                  <div className="relative h-48 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={specialOfferImages[index]}
                      alt={`Harvics Special Offer Product ${item}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="text-xl font-medium text-[#6B1F2B] mb-2 font-serif">Special Offer {item}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-semibold text-[#C3A35E]">$39.99</span>
                    <span className="text-gray-400 line-through text-sm">$79.99</span>
                  </div>
                  <button className="w-full bg-[#6B1F2B] text-white py-3 rounded-lg font-medium hover:bg-[#5a000c] transition-colors">
                    View Offer
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

