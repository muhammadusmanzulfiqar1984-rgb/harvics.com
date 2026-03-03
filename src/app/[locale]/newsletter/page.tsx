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

interface NewsletterPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()
  const content = getFooterPageContent('newsletter', locale)

  return (
    <main className="min-h-screen bg-[#6B1F2B]">
      <div className="pt-20">
        <section className="py-12 md:py-24 px-4 md:px-6 bg-gradient-to-br from-[#6B1F2B] via-[#6B1F2B] to-[#6B1F2B]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#C3A35E] mb-4 md:mb-6">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#6B1F2B] border-2 border-[#6B1F2B]/20 rounded-xl p-8 md:p-12 shadow-lg">
              <form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[#C3A35E] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border-2 border-[#6B1F2B]/20 rounded-lg focus:outline-none focus:border-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-[#C3A35E] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border-2 border-[#6B1F2B]/20 rounded-lg focus:outline-none focus:border-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-[#6B1F2B]/20" />
                    <span className="text-sm text-white/90">I agree to receive marketing communications</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300"
                >
                  Subscribe Now
                </button>
              </form>
            </div>

            <div className="mt-8 bg-[#6B1F2B] border border-black200 rounded-xl p-6">
              <h3 className="font-bold text-[#C3A35E] mb-3">What You'll Receive:</h3>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Latest product launches and updates
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Exclusive offers and promotions
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Company news and announcements
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Industry insights and trends
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

