
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getFooterPageContent } from '@/utils/contentPopulator'

import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'faq')
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

interface FAQPageProps {
  params: Promise<{ locale: string }>
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  const categories = getFolderBasedCategories()
  const content = getFooterPageContent('faq', locale)

  const faqs = [
    {
      category: t('products.category'),
      questions: [
        { q: t('products.q1'), a: t('products.a1') },
        { q: t('products.q2'), a: t('products.a2') },
        { q: t('products.q3'), a: t('products.a3') }
      ]
    },
    {
      category: t('ordersShipping.category'),
      questions: [
        { q: t('ordersShipping.q1'), a: t('ordersShipping.a1') },
        { q: t('ordersShipping.q2'), a: t('ordersShipping.a2') },
        { q: t('ordersShipping.q3'), a: t('ordersShipping.a3') }
      ]
    },
    {
      category: t('accountPayments.category'),
      questions: [
        { q: t('accountPayments.q1'), a: t('accountPayments.a1') },
        { q: t('accountPayments.q2'), a: t('accountPayments.a2') },
        { q: t('accountPayments.q3'), a: t('accountPayments.a3') }
      ]
    },
    {
      category: t('returnsRefunds.category'),
      questions: [
        { q: t('returnsRefunds.q1'), a: t('returnsRefunds.a1') },
        { q: t('returnsRefunds.q2'), a: t('returnsRefunds.a2') }
      ]
    }
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      
      <div className="pt-20">
        <section className="py-12 md:py-24 px-4 md:px-6 bg-[#6B1F2B] relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop&q=75"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-xl text-white max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <div key={index} className="bg-white border-2 border-[#6B1F2B]/20 p-6 shadow-lg">
                      <h3 className="text-lg font-bold text-black mb-2">{faq.q}</h3>
                      <p className="text-black">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] p-8 md:p-12 text-white text-center mt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('contactCta.title')}</h2>
              <p className="mb-6 text-lg">{t('contactCta.subtitle')}</p>
              <a
                href={`/${locale}/contact`}
                className="inline-block bg-gradient-to-r from-[#ffffff] to-[#ffffff] text-black px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300"
              >
                {t('contactCta.button')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

