import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function TroubleshootingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('help')

  const issues = [
    { id: 'login', title: t('troubleshooting.items.login.title'), description: t('troubleshooting.items.login.description'), icon: '🔐' },
    { id: 'payment', title: t('troubleshooting.items.payment.title'), description: t('troubleshooting.items.payment.description'), icon: '💳' },
    { id: 'delivery', title: t('troubleshooting.items.delivery.title'), description: t('troubleshooting.items.delivery.description'), icon: '🚚' },
    { id: 'website', title: t('troubleshooting.items.website.title'), description: t('troubleshooting.items.website.description'), icon: '🌐' }
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        <section className="h-[300px] relative bg-harvics-burgundy overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-harvics-gold rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-harvics-gold rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">
              {t('troubleshooting.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              {t('troubleshooting.subtitle')}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-7xl mx-auto">
             <div className="mb-8">
              <Link href={`/${locale}/help/`} className="inline-flex items-center text-harvics-burgundy hover:text-[#50000b] font-medium transition-colors bg-white px-4 py-2 shadow-sm">
                ← {t('backToHelpCenter')}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="text-4xl mb-6 bg-harvics-burgundy/5 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">{issue.icon}</div>
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-3 group-hover:text-harvics-burgundy transition-colors">{issue.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

