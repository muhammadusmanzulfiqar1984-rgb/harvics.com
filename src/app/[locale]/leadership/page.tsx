import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

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

interface LeadershipPageProps {
  params: Promise<{ locale: string }>
}

export default async function LeadershipPage({ params }: LeadershipPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const leaders = [
    { name: 'John Smith', role: 'Chief Executive Officer', bio: 'Leading Harvics with 20+ years of experience in consumer goods', image: '/Images/logo.png' },
    { name: 'Sarah Johnson', role: 'Chief Operating Officer', bio: 'Expert in operations and supply chain management', image: '/Images/logo.png' },
    { name: 'Michael Brown', role: 'Chief Financial Officer', bio: 'Financial strategist with extensive global market experience', image: '/Images/logo.png' },
    { name: 'Emily Davis', role: 'Chief Marketing Officer', bio: 'Brand builder and marketing innovator', image: '/Images/logo.png' }
  ]

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
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
              Our Leadership
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Meet the team driving Harvics forward
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {leaders.map((leader, index) => (
                <div key={index} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 text-center group">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md group-hover:border-[#6B1F2B] transition-all duration-300">
                    <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-[#6B1F2B] font-medium mb-4 text-sm uppercase tracking-wide">{leader.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

