import Footer from '@/components/layout/Footer'
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

interface LocationsPageProps {
  params: Promise<{ locale: string }>
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  const locations = [
    {
      region: 'Europe',
      offices: [
        { city: 'London', country: 'United Kingdom', address: '123 Business Street, London, UK', phone: '+44 20 7123 4567' },
        { city: 'Milan', country: 'Italy', address: '456 Via Commerciale, Milan, Italy', phone: '+39 02 1234 5678' }
      ]
    },
    {
      region: 'North America',
      offices: [
        { city: 'New York', country: 'United States', address: '789 Corporate Avenue, New York, NY, USA', phone: '+1 212 555 1234' }
      ]
    },
    {
      region: 'Middle East',
      offices: [
        { city: 'Dubai', country: 'United Arab Emirates', address: '321 Trade Center, Dubai, UAE', phone: '+971 4 123 4567' }
      ]
    },
    {
      region: 'Asia',
      offices: [
        { city: 'Karachi', country: 'Pakistan', address: '654 Industrial Road, Karachi, Pakistan', phone: '+92 21 1234 5678' }
      ]
    }
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
              Global Addresses
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Find our offices and facilities around the world
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            {locations.map((region, regionIndex) => (
              <div key={regionIndex} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-6 pl-4 border-l-4 border-[#6B1F2B]">{region.region}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {region.offices.map((office, officeIndex) => (
                    <div key={officeIndex} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-serif font-medium text-gray-900 group-hover:text-[#6B1F2B] transition-colors">
                          {office.city}, {office.country}
                        </h3>
                        <span className="text-2xl">📍</span>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{office.address}</p>
                      <div className="flex items-center text-gray-500 pt-4 border-t border-gray-50">
                        <span className="font-medium mr-2 text-gray-900">Phone:</span> 
                        <a href={`tel:${office.phone}`} className="hover:text-[#6B1F2B] transition-colors">{office.phone}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

