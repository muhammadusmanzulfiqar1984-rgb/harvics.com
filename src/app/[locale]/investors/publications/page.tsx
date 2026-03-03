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

interface PublicationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function PublicationsPage({ params }: PublicationsPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const publications = [
    { year: '2024', title: 'Annual Report 2024', type: 'PDF' },
    { year: '2024', title: 'Quarterly Report Q4 2024', type: 'PDF' },
    { year: '2023', title: 'Annual Report 2023', type: 'PDF' },
    { year: '2023', title: 'Sustainability Report 2023', type: 'PDF' }
  ]

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
              Investor Publications
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto">
              Financial reports and investor documents
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {publications.map((pub, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-lg font-bold text-[#6B1F2B]">{pub.title}</h3>
                    <p className="text-sm text-gray-500">{pub.year}</p>
                  </div>
                  <button className="text-white bg-[#6B1F2B] px-6 py-2 rounded-lg font-bold hover:bg-[#2a0006] transition-colors">
                    Download {pub.type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

