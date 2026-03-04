import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

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

interface TravelMoneyPageProps {
  params: Promise<{ locale: string }>
}

export default async function TravelMoneyPage({ params }: TravelMoneyPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#6B1F2B]">
      <div className="pt-20">
        <section className="py-12 md:py-24 bg-gradient-to-br from-[#6B1F2B] via-[#6B1F2B] to-[#6B1F2B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#C3A35E] mb-4 md:mb-6">
              Travel Money
            </h1>
            <p className="text-base md:text-xl text-white max-w-3xl mx-auto">
              Get the best exchange rates for your travel currency needs
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#6B1F2B] border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-black mb-4">Why Choose Us?</h3>
                <ul className="space-y-3 text-black">
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Competitive exchange rates
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    No hidden fees
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Order online or in-store
                  </li>
                  <li className="flex items-center">
                    <span className="text-white mr-2">✓</span>
                    Over 50 currencies available
                  </li>
                </ul>
              </div>
              <div className="bg-[#6B1F2B] border-2 border-[#6B1F2B]/20 p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-black mb-4">Popular Currencies</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['USD', 'EUR', 'GBP', 'AED', 'PKR', 'JPY'].map((currency) => (
                    <div key={currency} className="text-center p-4 bg-[#6B1F2B]">
                      <div className="font-bold text-black">{currency}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] p-8 md:p-12 text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Order Travel Money</h2>
              <p className="mb-6 text-lg">Get your currency delivered or collect in-store</p>
              <button className="bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] text-black px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300">
                Order Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

