
import Footer from '@/components/layout/Footer'
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

interface CreditCardsPageProps {
  params: Promise<{ locale: string }>
}

export default async function CreditCardsPage({ params }: CreditCardsPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
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
              Our Credit Cards
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Choose the perfect credit card for your lifestyle
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-4">Classic Card</h3>
                <div className="text-3xl font-medium text-[#6B1F2B] mb-4">0% APR</div>
                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> No annual fee</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Cashback on purchases</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Fraud protection</li>
                </ul>
                <button className="w-full bg-white border border-gray-200 text-gray-900 py-4 font-medium hover:bg-gray-50 hover:border-[#6B1F2B] hover:text-[#6B1F2B] transition-all duration-300">
                  Apply Now
                </button>
              </div>

              <div className="bg-white border-2 border-[#6B1F2B] p-8 shadow-xl transform md:-translate-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#6B1F2B]"></div>
                <div className="bg-[#6B1F2B] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-6">
                  Popular Choice
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-4">Premium Card</h3>
                <div className="text-3xl font-medium text-[#6B1F2B] mb-4">2.9% APR</div>
                <ul className="space-y-4 text-gray-700 mb-8">
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Enhanced rewards</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Travel insurance</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Airport lounge access</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Concierge service</li>
                </ul>
                <button className="w-full bg-[#6B1F2B] text-white py-4 font-medium hover:bg-[#2a0006] transition-all duration-300 shadow-lg">
                  Apply Now
                </button>
              </div>

              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-4">Business Card</h3>
                <div className="text-3xl font-medium text-[#6B1F2B] mb-4">1.9% APR</div>
                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Business expense tracking</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Higher credit limits</li>
                  <li className="flex items-center"><span className="text-[#6B1F2B] mr-2">✓</span> Dedicated support</li>
                </ul>
                <button className="w-full bg-white border border-gray-200 text-gray-900 py-4 font-medium hover:bg-gray-50 hover:border-[#6B1F2B] hover:text-[#6B1F2B] transition-all duration-300">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

