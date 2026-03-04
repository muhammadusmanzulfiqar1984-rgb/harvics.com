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

interface MediaContactsPageProps {
  params: Promise<{ locale: string }>
}

export default async function MediaContactsPage({ params }: MediaContactsPageProps) {
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
              Media Contacts
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto">
              Get in touch with our media relations team
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-[#6B1F2B] mb-6">Press Inquiries</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#6B1F2B] mb-2">Media Relations</h3>
                  <p className="text-gray-600">Email: media@harvics.com</p>
                  <p className="text-gray-600">Phone: +44 20 7123 4567</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#6B1F2B] mb-2">Press Releases</h3>
                  <p className="text-gray-600">For press release submissions: press@harvics.com</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#6B1F2B] mb-2">General Inquiries</h3>
                  <p className="text-gray-600">Email: info@harvics.com</p>
                  <p className="text-gray-600">Phone: +44 20 7123 4567</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

