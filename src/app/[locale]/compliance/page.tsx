
import Footer from '@/components/layout/Footer'

interface CompliancePageProps {
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

export default async function CompliancePage({ params }: CompliancePageProps) {
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
              Compliance & Ethics
            </h1>
            <p className="text-white/80 text-lg max-w-2xl font-light">
              Our commitment to integrity and regulatory standards
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-[#C3A35E]/30 rounded-xl p-8 md:p-12 shadow-sm min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#6B1F2B]/5 rounded-xl flex items-center justify-center mx-auto mb-6 border border-[#C3A35E]/20">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-4">Under Construction</h2>
                <p className="text-[#6B1F2B]/70">
                  Detailed compliance information and policies will be available soon.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
