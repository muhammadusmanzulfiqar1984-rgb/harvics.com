
import Footer from '@/components/layout/Footer'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getTranslations } from 'next-intl/server'

interface BrandStoryPageProps {
  params: Promise<{ locale: string }>
}

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

export default async function BrandStoryPage({ params }: BrandStoryPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories() || []
  const t = await getTranslations('about')

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-[#6B1F2B] via-[#4a000a] to-[#6B1F2B] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('brandStory.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {t('brandStory.subtitle')}
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  {t('brandStory.ourJourney.title')}
                </h2>
                <p className="text-lg text-black leading-relaxed mb-4">
                  {t('brandStory.ourJourney.content')}
                </p>
                <p className="text-lg text-black leading-relaxed mb-4">
                  {t('brandStory.ourJourney.content2')}
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  {t('brandStory.ourMission.title')}
                </h2>
                <p className="text-lg text-black leading-relaxed mb-4">
                  {t('brandStory.ourMission.content')}
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  {t('brandStory.ourValues.title')}
                </h2>
                <ul className="space-y-4 text-lg text-black">
                  <li className="flex items-start">
                    <span className="text-white mr-3 text-2xl">✓</span>
                    <span>{t('brandStory.ourValues.quality')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-3 text-2xl">✓</span>
                    <span>{t('brandStory.ourValues.innovation')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-3 text-2xl">✓</span>
                    <span>{t('brandStory.ourValues.sustainability')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-3 text-2xl">✓</span>
                    <span>{t('brandStory.ourValues.customerFocus')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  {t('brandStory.ourVision.title')}
                </h2>
                <p className="text-lg text-black leading-relaxed">
                  {t('brandStory.ourVision.content')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

