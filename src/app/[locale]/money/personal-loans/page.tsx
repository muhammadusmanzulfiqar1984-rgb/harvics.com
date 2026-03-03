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

interface PersonalLoansPageProps {
  params: Promise<{ locale: string }>
}

export default async function PersonalLoansPage({ params }: PersonalLoansPageProps) {
  const { locale } = await params
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
              Personal Loans
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Flexible personal loans to help you achieve your goals
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">Loan Features</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Competitive interest rates from 3.9% APR
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Loan amounts from $1,000 to $50,000
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Flexible repayment terms (1-7 years)
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    Quick approval process
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#6B1F2B] mr-3 text-lg">✓</span>
                    No early repayment fees
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">What You Can Use It For</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">🏠</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Home Improvements</h4>
                      <p className="text-gray-500 text-sm">Renovate your home or make upgrades</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">🚗</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Vehicle Purchase</h4>
                      <p className="text-gray-500 text-sm">Buy a car or motorcycle</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">🎓</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Education</h4>
                      <p className="text-gray-500 text-sm">Fund your or your child's education</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-white bg-[#6B1F2B] rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">💒</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Special Events</h4>
                      <p className="text-gray-500 text-sm">Weddings, celebrations, and more</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] rounded-2xl p-8 md:p-16 text-center text-white">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">Get a Loan Quote</h2>
                <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto font-light">Check your eligibility and get an instant quote</p>
                <button className="bg-white text-[#6B1F2B] px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
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

