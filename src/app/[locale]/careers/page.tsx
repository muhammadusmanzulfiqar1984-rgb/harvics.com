
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getFooterPageContent } from '@/utils/contentPopulator'

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

interface CareersPageProps {
  params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: CareersPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  const content = getFooterPageContent('careers', locale)

  const departments = [
    { name: 'Sales & Marketing', icon: '📊', count: 12 },
    { name: 'Operations & Logistics', icon: '🚚', count: 8 },
    { name: 'Research & Development', icon: '🔬', count: 5 },
    { name: 'Finance & Accounting', icon: '💰', count: 6 },
    { name: 'Human Resources', icon: '👥', count: 4 },
    { name: 'Information Technology', icon: '💻', count: 7 }
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
              {content.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              {content.hero.subtitle}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {content.sections[0]?.items?.map((item: any, index: number) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl mb-6 bg-[#6B1F2B]/5 w-16 h-16 rounded-xl flex items-center justify-center">{item.icon}</div>
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-12 shadow-sm mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-8 text-center">Open Positions by Department</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept, index) => (
                  <div key={index} className="group bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-[#6B1F2B] hover:border-[#6B1F2B] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{dept.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-white text-lg">{dept.name}</h3>
                          <p className="text-sm text-gray-500 group-hover:text-white/80">{dept.count} positions</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] rounded-2xl p-8 md:p-16 text-center">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6">Ready to Join Our Team?</h2>
                <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto font-light">Explore our open positions and find the perfect role for your skills and passion.</p>
                <button className="bg-white text-[#6B1F2B] px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                  View Open Positions
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

