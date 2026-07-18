import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function OrdersHelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('help')

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
              {t('orders.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              {t('orders.subtitle')}
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-4xl mx-auto">
             <div className="mb-6">
              <Link href={`/${locale}/help/`} className="inline-flex items-center text-harvics-burgundy hover:text-[#50000b] font-medium transition-colors bg-white px-4 py-2 shadow-sm">
                ← {t('backToHelpCenter')}
              </Link>
            </div>
            
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <div className="space-y-5 text-[#2b2b2b] leading-relaxed">
                <p>
                  Harvics order operations are engineered for corridor-scale reliability. From RFQ to dispatch, each order event is
                  traceable through validation, allocation, shipment, and financial settlement, giving buyers and suppliers a single
                  operational truth across multi-country execution environments.
                </p>
                <p>
                  For private-label and strategic sourcing volumes, we advise using milestone-based order governance: commercial confirmation,
                  quality lock, production release, dispatch authorization, and landed reconciliation. This approach reduces variance,
                  protects margin visibility, and supports board-level reporting integrity.
                </p>
                <p>
                  If an order exception appears, open a support request with order ID, corridor, and delivery milestone status.
                  Our operations teams can triage inventory, customs, documentation, or payment dependencies and provide a controlled
                  recovery path aligned with HarvicsOS execution standards.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

