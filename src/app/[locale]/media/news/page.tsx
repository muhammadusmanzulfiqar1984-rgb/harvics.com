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

interface NewsPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const newsItems = [
    { date: '2024-12-15', title: 'Harvics Expands to 5 New Markets', excerpt: 'Company announces expansion into Southeast Asia' },
    { date: '2024-11-20', title: 'New Product Line Launch', excerpt: 'Introducing premium organic product range' },
    { date: '2024-10-10', title: 'Sustainability Milestone Achieved', excerpt: 'Reached carbon-neutral operations across all facilities' }
  ]

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-sm">
        <Header categories={categories} />
      </div>
      <div className="h-[172px]" /> {/* Spacer */}
      
      <div className="pt-0">
        <section className="py-16 md:py-24 px-4 md:px-6 bg-[#6B1F2B] relative overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C3A35E] rounded-full filter blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C3A35E] rounded-full filter blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto text-center z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium text-white mb-4 md:mb-6 font-serif">
              News & Press Releases
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto font-light">
              Stay updated with the latest news from Harvics
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {newsItems.map((item, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl p-8 shadow-md hover:shadow-lg transition-all group">
                  <div className="text-sm text-gray-400 mb-2 font-medium tracking-wide">{new Date(item.date).toLocaleDateString()}</div>
                  <h3 className="text-xl font-medium text-[#6B1F2B] mb-3 group-hover:text-[#C3A35E] transition-colors font-serif">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{item.excerpt}</p>
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

