import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

interface ImagesPageProps {
  params: Promise<{ locale: string }>
}

export default async function ImagesPage({ params }: ImagesPageProps) {
  const { locale } = await params
  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white">
        <Header categories={categories} />
      </div>
      <div className="h-20" /> {/* Spacer */}
      
      <div className="pt-0">
        <section className="py-12 md:py-24 px-4 md:px-6 bg-[#6B1F2B]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 md:mb-6">
              Media Images
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto">
              Download high-resolution images for media use
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 p-8 shadow-sm">
              <p className="text-gray-600 mb-6">
                Our media image gallery is currently being updated. For immediate access to high-resolution images, 
                please contact our media relations team at media@harvics.com
              </p>
              <a
                href={`/${locale}/media/contacts`}
                className="inline-block bg-[#6B1F2B] text-white px-6 py-3 font-bold hover:bg-[#2a0006] transition-all"
              >
                Contact Media Team
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

