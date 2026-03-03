import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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

interface CSRPageProps {
  params: Promise<{ locale: string }>
}

export default async function CSRPage({ params }: CSRPageProps) {
  const { locale } = await params
  const t = await getTranslations('csr')

  const initiatives = [
    {
      id: 'sustainability',
      title: t('sustainability.title'),
      description: t('sustainability.description'),
      icon: '🌱',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      stats: [
        { label: t('sustainability.stats.renewable'), value: '85%' },
        { label: t('sustainability.stats.waste'), value: '60%' },
        { label: t('sustainability.stats.carbon'), value: '40%' }
      ]
    },
    {
      id: 'community',
      title: t('community.title'),
      description: t('community.description'),
      icon: '🤝',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      stats: [
        { label: t('community.stats.families'), value: '10,000+' },
        { label: t('community.stats.programs'), value: '25' },
        { label: t('community.stats.volunteers'), value: '500+' }
      ]
    },
    {
      id: 'education',
      title: t('education.title'),
      description: t('education.description'),
      icon: '📚',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      stats: [
        { label: t('education.stats.scholarships'), value: '500' },
        { label: t('education.stats.schools'), value: '50' },
        { label: t('education.stats.students'), value: '5,000+' }
      ]
    },
    {
      id: 'health',
      title: t('health.title'),
      description: t('health.description'),
      icon: '🏥',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      stats: [
        { label: t('health.stats.campaigns'), value: '15' },
        { label: t('health.stats.people'), value: '25,000+' },
        { label: t('health.stats.clinics'), value: '12' }
      ]
    }
  ]

  const achievements = [
    {
      year: '2024',
      title: t('achievements.2024.title'),
      description: t('achievements.2024.description'),
      icon: '🏆'
    },
    {
      year: '2023',
      title: t('achievements.2023.title'),
      description: t('achievements.2023.description'),
      icon: '🌟'
    },
    {
      year: '2022',
      title: t('achievements.2022.title'),
      description: t('achievements.2022.description'),
      icon: '🎯'
    }
  ]

  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-sm">
        <Header categories={categories} />
      </div>
      <div className="h-[172px]" /> {/* Spacer */}
      
      <div>
        {/* Hero Section */}
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-[#C3A35E]/30">
                <span className="text-3xl">🤝</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 px-4 font-light leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-white">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-medium text-[#C3A35E]">5+</div>
                <div className="text-sm text-white/80 uppercase tracking-wide mt-1">{t('hero.stats.years')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-medium text-[#C3A35E]">50+</div>
                <div className="text-sm text-white/80 uppercase tracking-wide mt-1">{t('hero.stats.countries')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-medium text-[#C3A35E]">1M+</div>
                <div className="text-sm text-white/80 uppercase tracking-wide mt-1">{t('hero.stats.lives')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Initiatives */}
        <section className="py-12 md:py-24 bg-white relative -mt-20 z-20 rounded-t-[2.5rem] mx-4 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-6">
                {t('initiatives.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('initiatives.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {initiatives.map((initiative, index) => (
                <div
                  key={initiative.id}
                  className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-6 mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${initiative.bgColor}`}>
                      <span className="text-3xl">{initiative.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3 group-hover:text-[#6B1F2B] transition-colors">
                        {initiative.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {initiative.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    {initiative.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="text-center">
                        <div className="text-2xl font-serif font-medium text-[#6B1F2B] mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Achievements */}
        <section className="py-12 md:py-24 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-6">
                {t('achievements.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('achievements.description')}
              </p>
            </div>

            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.year}
                  className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-[#6B1F2B] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#6B1F2B]/5 rounded-full flex items-center justify-center text-3xl">
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <span className="text-2xl font-serif font-medium text-[#6B1F2B]">{achievement.year}</span>
                        <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
                        <h3 className="text-xl font-medium text-gray-900">
                          {achievement.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 md:py-24 bg-[#6B1F2B] relative overflow-hidden">
           {/* Decorative Elements */}
           <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
           </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 font-light leading-relaxed">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:csr@harvics.com"
                className="bg-white text-[#6B1F2B] px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {t('cta.contact')}
              </a>
              <a
                href={`/${locale}/contact`}
                className="bg-transparent border border-white text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-white/10 transition-all duration-300"
              >
                {t('cta.learnMore')}
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
