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

interface BulkOrdersPageProps {
  params: Promise<{ locale: string }>
}

export default async function BulkOrdersPage({ params }: BulkOrdersPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  
  // Get product images for bulk orders showcase
  const bulkOrderProductImages = getProductImages(5)

  const tiers = [
    { min: 10, discount: '10%', color: 'from-blue-400 to-blue-600' },
    { min: 25, discount: '15%', color: 'from-green-400 to-green-600' },
    { min: 50, discount: '20%', color: 'from-white to-white200' },
    { min: 100, discount: '25%', color: 'from-orange-400 to-orange-600' },
    { min: 250, discount: '30%', color: 'from-red-400 to-red-600' },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              Bulk Order Discounts
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              Save more when you buy in bulk - Perfect for businesses and retailers
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border-2 border-[#6B1F2B]/20 p-8 shadow-lg mb-12">
              <h3 className="text-2xl font-bold text-[#C3A35E] mb-6 text-center">Discount Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {tiers.map((tier, index) => (
                  <div key={index} className={`bg-gradient-to-r ${tier.color} p-6 text-white text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <Image
                        src={bulkOrderProductImages[index]}
                        alt={`Harvics Bulk Order Tier ${tier.min} units`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 20vw"
                      />
                    </div>
                    <div className="relative z-10">
                      <div className="text-3xl font-bold mb-2">{tier.discount}</div>
                      <div className="text-sm">Min. {tier.min} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-[#C3A35E] mb-4">Benefits</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Significant cost savings on large orders
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Priority processing and shipping
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Flexible payment terms
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Custom packaging options
                  </li>
                </ul>
              </div>
              <div className="bg-white border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-[#C3A35E] mb-4">Who Can Benefit?</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Retailers and distributors
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Corporate buyers
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Event organizers
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Wholesale customers
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={bulkOrderProductImages[0]}
                  alt="Harvics Bulk Orders"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Request a Bulk Order Quote</h2>
                <p className="mb-6 text-lg">Contact our sales team for personalized pricing</p>
                <button className="bg-gradient-to-r from-[#ffffff] to-[#ffffff] text-white/90 px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300">
                  Contact Sales Team
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

