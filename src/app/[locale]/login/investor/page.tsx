import React from 'react'
// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import InvestorLoginForm from './InvestorLoginForm'

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

export default function InvestorLoginPage() {
  const t = useTranslations('investor')
  const locale = useLocale()

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-[#6B1F2B] text-center pb-32">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
              {t('login.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('login.subtitle')}
            </p>
          </div>
        </section>

        {/* Content Section with Negative Margin */}
        <section className="px-6 pb-20 -mt-20">
          <div className="max-w-4xl mx-auto">
            {/* Login Form */}
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto mb-16 border border-gray-100">
              <InvestorLoginForm />
            </div>

            {/* Additional Info - Light Theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4 bg-[#6B1F2B]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">📊</div>
                <h3 className="text-xl font-bold text-[#6B1F2B] mb-2 font-serif">
                  {t('login.features.financials.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('login.features.financials.description')}
                </p>
              </div>
              <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4 bg-[#6B1F2B]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">📈</div>
                <h3 className="text-xl font-bold text-[#6B1F2B] mb-2 font-serif">
                  {t('login.features.reports.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('login.features.reports.description')}
                </p>
              </div>
              <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4 bg-[#6B1F2B]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">💼</div>
                <h3 className="text-xl font-bold text-[#6B1F2B] mb-2 font-serif">
                  {t('login.features.portfolio.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('login.features.portfolio.description')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
