import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function HelpGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('help')

  const guides = [
    { id: 'getting-started', title: t('guides.items.gettingStarted.title'), description: t('guides.items.gettingStarted.description'), icon: '🚀' },
    { id: 'account-setup', title: t('guides.items.accountSetup.title'), description: t('guides.items.accountSetup.description'), icon: '⚙️' },
    { id: 'ordering', title: t('guides.items.ordering.title'), description: t('guides.items.ordering.description'), icon: '🛒' },
    { id: 'payment', title: t('guides.items.payment.title'), description: t('guides.items.payment.description'), icon: '💳' },
    { id: 'shipping', title: t('guides.items.shipping.title'), description: t('guides.items.shipping.description'), icon: '📦' },
    { id: 'returns', title: t('guides.items.returns.title'), description: t('guides.items.returns.description'), icon: '↩️' }
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        <section className="h-[300px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">
              {t('guides.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              {t('guides.subtitle')}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-7xl mx-auto">
             <div className="mb-8">
              <Link href={`/${locale}/help/`} className="inline-flex items-center text-[#6B1F2B] hover:text-[#50000b] font-medium transition-colors bg-white px-4 py-2 shadow-sm">
                ← {t('backToHelpCenter')}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <div key={guide.id} className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="text-4xl mb-6 bg-[#6B1F2B]/5 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">{guide.icon}</div>
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-3 group-hover:text-[#6B1F2B] transition-colors">{guide.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{guide.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

