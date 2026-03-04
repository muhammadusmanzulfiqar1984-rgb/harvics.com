import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strategy | Harvics',
  description: 'Harvics strategic vision for global expansion.',
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

interface StrategyPageProps {
  params: Promise<{ locale: string }>
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const strategies = [
    {
      title: 'Global Expansion',
      description: 'Expanding our presence in emerging markets while strengthening our position in established markets',
      icon: '🌍'
    },
    {
      title: 'Product Innovation',
      description: 'Investing in R&D to develop new products that meet evolving consumer preferences',
      icon: '💡'
    },
    {
      title: 'Sustainability',
      description: 'Committed to sustainable practices across our supply chain and operations',
      icon: '🌱'
    },
    {
      title: 'Digital Transformation',
      description: 'Leveraging technology to enhance customer experience and operational efficiency',
      icon: '📱'
    }
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              Our Strategy
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Building a sustainable future through innovation and excellence
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              {strategies.map((strategy, index) => (
                <div key={index} className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl mb-6 bg-[#6B1F2B]/5 w-20 h-20 flex items-center justify-center">{strategy.icon}</div>
                  <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">{strategy.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{strategy.description}</p>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden bg-[#6B1F2B] p-8 md:p-16 text-center text-white">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">Our Vision</h2>
                <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
                  To be the world's leading premium consumer goods company, recognized for quality, innovation, and sustainability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

