import Link from 'next/link'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function OrdersHelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
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
              Order Support
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
              Track and manage your orders and deliveries
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-4xl mx-auto">
             <div className="mb-6">
              <Link href={`/${locale}/help/`} className="inline-flex items-center text-[#6B1F2B] hover:text-[#50000b] font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm">
                ← Back to Help Center
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <p className="text-gray-600 leading-relaxed text-lg">Order and delivery support content will appear here.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

