import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function AccountHelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('help')

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
              {t('account.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              {t('account.subtitle')}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-4xl mx-auto">
             <div className="mb-6">
              <Link href={`/${locale}/help/`} className="inline-flex items-center text-[#6B1F2B] hover:text-[#50000b] font-medium transition-colors bg-white px-4 py-2 shadow-sm">
                ← {t('backToHelpCenter')}
              </Link>
            </div>
            
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <div className="space-y-5 text-[#2b2b2b] leading-relaxed">
                <p>
                  We treat account access as a commercial control perimeter, not a convenience feature. Every Harvics profile is
                  structured against role, corridor, and authority scope so leadership teams can move quickly while preserving audit-grade
                  governance across procurement, logistics, finance, and compliance actions.
                </p>
                <p>
                  For enterprise partners operating between Europe, GCC, and South Asia, we recommend a three-layer identity model:
                  executive oversight users, operational execution users, and finance-verification users. This structure protects high-value
                  decisions while keeping day-to-day throughput fast across Czech Republic, Germany, Poland, Scandinavia, UAE, KSA, and Pakistan.
                </p>
                <p>
                  If your team needs controlled onboarding, delegated permissions, or account recovery under legal hold conditions,
                  our support desk can provision governed access workflows aligned with HarvicsOS and private-label supply operations.
                  For complex cases, request an escalation and we will assign a corridor-aligned account specialist.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

