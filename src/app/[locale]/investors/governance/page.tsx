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

interface GovernancePageProps {
  params: Promise<{ locale: string }>
}

export default async function GovernancePage({ params }: GovernancePageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white">
        <Header categories={categories} />
      </div>
      <div className="h-20" /> {/* Spacer */}
      
      <div className="pt-0">
        <section className="py-12 md:py-24 px-4 md:px-6 bg-[#6B1F2B]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 md:mb-6">
              Corporate Governance
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto">
              Our commitment to transparency and ethical business practices
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-3">Board of Directors</h2>
                <p className="text-gray-600">Our board is committed to strong corporate governance and oversight.</p>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-3">Governance Policies</h2>
                <p className="text-gray-600">We maintain comprehensive governance policies and procedures.</p>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-3">Compliance</h2>
                <p className="text-gray-600">We adhere to all applicable laws and regulations in the countries where we operate.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

