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

interface ClubRewardsPageProps {
  params: Promise<{ locale: string }>
}

export default async function ClubRewardsPage({ params }: ClubRewardsPageProps) {
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
              Club Rewards
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Join our exclusive rewards club and unlock amazing benefits
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">Membership Benefits</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Points on every purchase
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Birthday rewards and special offers
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Early access to sales and promotions
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Free shipping on orders over $50
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">How It Works</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">Sign Up</h4>
                      <p className="text-gray-500">Create your free account</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">Shop & Earn</h4>
                      <p className="text-gray-500">Earn points with every purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">Redeem</h4>
                      <p className="text-gray-500">Use points for discounts and rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] p-8 md:p-16 text-center">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6">Join Club Rewards Today</h2>
                <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto font-light">Start earning rewards immediately</p>
                <button className="bg-white text-[#6B1F2B] px-8 py-4 font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                  Sign Up Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

