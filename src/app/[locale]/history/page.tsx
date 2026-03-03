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

interface HistoryPageProps {
  params: Promise<{ locale: string }>
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const milestones = [
    { year: '2019', title: 'Company Founded', description: 'Harvics Global Ventures was established with a vision to deliver premium consumer goods worldwide' },
    { year: '2020', title: 'First International Expansion', description: 'Expanded operations to 10 countries across Europe and Middle East' },
    { year: '2021', title: 'Product Line Expansion', description: 'Launched 5 new product categories including beverages and frozen foods' },
    { year: '2022', title: 'Digital Transformation', description: 'Launched e-commerce platform and digital customer portals' },
    { year: '2023', title: 'Sustainability Initiative', description: 'Committed to carbon-neutral operations and sustainable sourcing' },
    { year: '2024', title: '40+ Countries', description: 'Reached milestone of operating in 40+ countries worldwide' }
  ]

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
              Our History
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              A journey of growth, innovation, and excellence since 2019
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#6B1F2B] before:via-gray-200 before:to-gray-200 md:before:mx-auto md:before:translate-x-0">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-[#6B1F2B] text-[#C3A35E] shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-serif font-medium text-lg z-10 relative">
                      {milestone.year}
                    </div>
                    <div className="w-[calc(100%-6rem)] md:w-[calc(50%-5rem)] p-6 bg-gray-50 border border-gray-100 rounded-xl hover:border-[#6B1F2B]/30 hover:shadow-lg transition-all duration-300">
                      <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

