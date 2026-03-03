import Link from 'next/link'

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

interface ResearchPageProps {
  params: Promise<{ locale: string }>
}

export default async function ResearchPage({ params }: ResearchPageProps) {
  const { locale } = await params

  const pillars = [
    {
      title: 'Product Science',
      description: 'Formulation, sensory research, and shelf-life optimization across core categories.',
      icon: '🧪'
    },
    {
      title: 'Food Safety & Quality',
      description: 'Microbiological testing, packaging integrity, and traceability controls.',
      icon: '🛡️'
    },
    {
      title: 'Sustainable Materials',
      description: 'Low-impact packaging, recyclability trials, and responsible sourcing standards.',
      icon: '🌱'
    },
    {
      title: 'Consumer Insights',
      description: 'Regional taste profiling, preference mapping, and rapid concept validation.',
      icon: '📈'
    }
  ]

  const programs = [
    {
      title: 'Regional Flavor Lab',
      description: 'Local palate research for GCC, MENA, and export markets.'
    },
    {
      title: 'Shelf-Life Acceleration',
      description: 'Stability trials to ensure consistent quality in high-heat environments.'
    },
    {
      title: 'Clean Label Initiative',
      description: 'Ingredient simplification and natural flavor pathways.'
    }
  ]

  const collaborations = [
    'University partnerships for ingredient science',
    'Supplier co-innovation for sustainable materials',
    'Retail analytics for category performance insights'
  ]

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        <section className="h-[380px] relative bg-[#6B1F2B] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              Research & Innovation
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Advancing product quality, safety, and sustainability through disciplined research and regional insight.
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {pillars.map((pillar, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl mb-5 bg-[#6B1F2B]/5 w-16 h-16 rounded-xl flex items-center justify-center">{pillar.icon}</div>
                  <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-8 md:p-12 shadow-sm">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-6">Active Programs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programs.map((program, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#6B1F2B] mb-2">{program.title}</h3>
                    <p className="text-sm text-gray-600">{program.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] rounded-2xl p-8 md:p-16 text-white">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Collaborative Research</h2>
                  <p className="text-white/80 leading-relaxed">
                    We partner with academic and industry leaders to accelerate product development and ensure world-class standards.
                  </p>
                  <ul className="mt-6 space-y-3 text-white/90">
                    {collaborations.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-[#C3A35E]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 text-center">
                  <h3 className="text-2xl font-serif font-medium mb-3">Work With Us</h3>
                  <p className="text-white/80 mb-6">
                    Explore research collaborations, lab trials, and product development partnerships.
                  </p>
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center bg-white text-[#6B1F2B] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
                  >
                    Contact the Research Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
