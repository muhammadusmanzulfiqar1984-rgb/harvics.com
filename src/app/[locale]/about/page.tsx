// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

// Generate static params for all locales
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

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')
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
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>
        
        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">{t('ourStory')}</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {t('story1')}
                  </p>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    {t('story2')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-gray-50 px-6 py-3 border border-gray-200 rounded-xl">
                      <span className="text-[#6B1F2B] font-medium uppercase tracking-wide">{t('est2018')}</span>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border border-gray-200 rounded-xl">
                      <span className="text-[#6B1F2B] font-medium uppercase tracking-wide">{t('countries40')}</span>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border border-gray-200 rounded-xl">
                      <span className="text-[#6B1F2B] font-medium uppercase tracking-wide">{t('productLines6')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative order-1 lg:order-2 flex items-center justify-center">
                  <div className="w-full h-64 md:h-96 flex items-center justify-center bg-white border border-gray-100 rounded-2xl p-8 md:p-12 shadow-inner">
                    <img 
                      src="/Images/logo.png" 
                      alt="Harvics Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
