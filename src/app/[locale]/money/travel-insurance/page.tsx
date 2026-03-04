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

interface TravelInsurancePageProps {
  params: Promise<{ locale: string }>
}

export default async function TravelInsurancePage({ params }: TravelInsurancePageProps) {
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
              Travel Insurance
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Travel with confidence knowing you're protected
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">What's Covered</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Medical expenses and emergency treatment
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Trip cancellation and interruption
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Lost or delayed baggage
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    24/7 emergency assistance
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Personal liability coverage
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">Coverage Options</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-[#6B1F2B] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Single Trip</h4>
                    <p className="text-gray-500 text-sm">Perfect for one-time travel</p>
                  </div>
                  <div className="border-l-4 border-[#6B1F2B] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Annual Multi-Trip</h4>
                    <p className="text-gray-500 text-sm">Coverage for multiple trips throughout the year</p>
                  </div>
                  <div className="border-l-4 border-[#6B1F2B] pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Family Coverage</h4>
                    <p className="text-gray-500 text-sm">Protect your entire family with one policy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] p-8 md:p-16 text-center text-white">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">Get Travel Insurance</h2>
                <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto font-light">Get a quote in minutes and travel with peace of mind</p>
                <button className="bg-white text-[#6B1F2B] px-8 py-4 font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                  Get Quote Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

