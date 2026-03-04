import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

interface SharesPageProps {
  params: Promise<{ locale: string }>
}

export default async function SharesPage({ params }: SharesPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-sm">
        <Header categories={categories} />
      </div>
      <div className="h-[172px]" /> {/* Spacer matching portals page */}
      
      <div className="pt-0">
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              Shares, ADRs & Bonds
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Investor information and stock trading details
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 p-8 md:p-12 shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 bg-[#6B1F2B]/5 mb-6 mx-auto">
                <span className="text-3xl">📈</span>
              </div>
              <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4 text-center">Investor Information</h2>
              <p className="text-gray-600 mb-8 text-center leading-relaxed max-w-2xl mx-auto">
                For detailed information about shares, ADRs, and bonds, please contact our investor relations team 
                or visit our investor relations portal for real-time data and reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/${locale}/investor-relations`}
                  className="bg-[#6B1F2B] text-white px-8 py-4 font-medium hover:bg-[#50000b] hover:scale-105 transition-all duration-300 shadow-lg text-center"
                >
                  Investor Relations
                </a>
                <a
                  href={`/${locale}/contact`}
                  className="bg-white border border-gray-200 text-gray-900 px-8 py-4 font-medium hover:bg-gray-50 hover:border-[#6B1F2B] hover:text-[#6B1F2B] transition-all duration-300 text-center"
                >
                  Contact IR Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

