// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import ProductSlider from '@/components/ui/ProductSlider'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

// Generate static params for all locales
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

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('products')
  const { locale } = await params
  
  // Use folder-based categories
  const folderCategories = getFolderBasedCategories()
  const productCategories = (folderCategories || []).map(category => ({
    key: category.key,
    image: category.image || '/Images/logo.png',
    icon: category.icon,
    color: category.color,
    url: `/${locale}${category.url}`
  }))

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
              {t('pageTitle')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              {t('discoverPremium')}
            </p>
          </div>
        </section>

        {/* Product Slider Section */}
        <section className="relative z-20 -mt-20 mb-12">
           <div className="max-w-7xl mx-auto px-4">
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
               <ProductSlider categories={folderCategories} />
             </div>
           </div>
        </section>

        {/* Product Categories Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-6">
                {t('productCategories')}
              </h2>
              <div className="w-24 h-1 bg-[#6B1F2B] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {productCategories.map((category, index) => (
                <Link
                  key={index}
                  href={category.url}
                  className="group relative aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={category.image} 
                      alt={t(category.key)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-xl md:text-2xl font-serif font-medium text-white group-hover:text-[#C3A35E] transition-colors duration-300">
                      {t(category.key)}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
