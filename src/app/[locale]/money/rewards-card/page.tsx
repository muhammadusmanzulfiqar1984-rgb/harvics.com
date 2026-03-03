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

interface RewardsCardPageProps {
  params: Promise<{ locale: string }>
}

export default async function RewardsCardPage({ params }: RewardsCardPageProps) {
  const { locale } = await params
  const t = await getTranslations('money')
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              M&S Rewards Credit Card
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Earn rewards on every purchase with our exclusive credit card
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-6 bg-[#6B1F2B]/5 w-16 h-16 rounded-xl flex items-center justify-center">💳</div>
                <h3 className="text-xl font-serif font-medium text-gray-900 mb-3">Cashback Rewards</h3>
                <p className="text-gray-600">Earn up to 5% cashback on all purchases</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-6 bg-[#6B1F2B]/5 w-16 h-16 rounded-xl flex items-center justify-center">🎁</div>
                <h3 className="text-xl font-serif font-medium text-gray-900 mb-3">Exclusive Offers</h3>
                <p className="text-gray-600">Access to special promotions and discounts</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-6 bg-[#6B1F2B]/5 w-16 h-16 rounded-xl flex items-center justify-center">✈️</div>
                <h3 className="text-xl font-serif font-medium text-gray-900 mb-3">Travel Benefits</h3>
                <p className="text-gray-600">Complimentary travel insurance and airport lounge access</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] rounded-2xl p-8 md:p-16 text-center">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6">Apply Now</h2>
                <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto font-light">Get approved in minutes and start earning rewards today</p>
                <button className="bg-white text-[#6B1F2B] px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                  Apply for Credit Card
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

