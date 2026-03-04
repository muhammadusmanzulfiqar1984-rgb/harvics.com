
import Footer from '@/components/layout/Footer'
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import { getFooterPageContent } from '@/utils/contentPopulator'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Harvics',
  description: 'Frequently asked questions about Harvics products and services.',
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
  const categories = getFolderBasedCategories()
  const content = getFooterPageContent('faq', locale)

  const faqs = [
    {
      category: 'Products',
      questions: [
        { q: 'What products does Harvics offer?', a: 'We offer a wide range of premium food products including confectionery, beverages, snacks, pasta, bakery items, and frozen foods across multiple categories.' },
        { q: 'Where can I buy Harvics products?', a: 'Our products are available in retail stores across 40+ countries. Use our store locator or contact page to find a retailer near you.' },
        { q: 'Do you offer bulk ordering?', a: 'Yes, we offer bulk order discounts for businesses and retailers. Visit our Bulk Order Discounts page for more information.' }
      ]
    },
    {
      category: 'Orders & Shipping',
      questions: [
        { q: 'What are your shipping options?', a: 'We offer various shipping options including standard, express, and international shipping. Free shipping is available on orders over $50.' },
        { q: 'How long does delivery take?', a: 'Delivery times vary by location. Standard delivery typically takes 5-7 business days, while express delivery takes 2-3 business days.' },
        { q: 'Can I track my order?', a: 'Yes, you can track your order using the tracking number provided in your order confirmation email.' }
      ]
    },
    {
      category: 'Account & Payments',
      questions: [
        { q: 'How do I create an account?', a: 'Click on "Sign In" in the header and select "Create Account" to register for a new account.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, PayPal, and bank transfers for B2B orders.' },
        { q: 'Is my payment information secure?', a: 'Yes, we use industry-standard encryption to protect your payment information.' }
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        { q: 'What is your return policy?', a: 'We offer a 30-day return policy for unopened products in original packaging. Please contact our customer service for return authorization.' },
        { q: 'How do I request a refund?', a: 'Contact our customer service team with your order number and reason for return. We will process your refund within 5-7 business days.' }
      ]
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-20">
        <section className="py-12 md:py-24 px-4 md:px-6 bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
          <div className="max-w-7xl mx-auto text-center">
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="mb-6 text-lg">Our customer service team is here to help</p>
              <a
                href={`/${locale}/contact`}
                className="inline-block bg-gradient-to-r from-[#ffffff] to-[#ffffff] text-black px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

