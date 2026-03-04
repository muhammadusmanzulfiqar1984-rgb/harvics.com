import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SUPPORTED_LOCALES } from '@/config/locales'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | Harvics',
  description: 'Get help with orders, accounts, and Harvics services.',
}


export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('help')

  const helpCategories = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: '❓',
      href: `/${locale}/faq/`
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get in touch with our support team',
      icon: '📞',
      href: `/${locale}/contact/`
    },
    {
      id: 'guides',
      title: 'User Guides',
      description: 'Step-by-step guides and tutorials',
      icon: '📚',
      href: `/${locale}/help/guides/`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Solve common issues',
      icon: '🔧',
      href: `/${locale}/help/troubleshooting/`
    },
    {
      id: 'account',
      title: 'Account Help',
      description: 'Manage your account and settings',
      icon: '👤',
      href: `/${locale}/help/account/`
    },
    {
      id: 'orders',
      title: 'Order Support',
      description: 'Help with orders and deliveries',
      icon: '📦',
      href: `/${locale}/help/orders/`
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
              Help Center
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Find the help you need
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            {/* Help Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-[#6B1F2B]/5 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="text-xl font-serif font-medium text-gray-900 mb-3 group-hover:text-[#6B1F2B] transition-colors">{category.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

