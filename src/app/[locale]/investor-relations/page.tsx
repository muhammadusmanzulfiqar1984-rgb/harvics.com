import React from 'react'
import StockTicker from '@/components/ui/StockTicker'
import StockChart from '@/components/ui/StockChart'
import BinanceLiveBoard from '@/components/ui/BinanceLiveBoard'
import InvestorRelationsTabs from '@/components/os-domains/InvestorRelationsTabs'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import InvestorRelationsForm from './InvestorRelationsForm'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

export default function InvestorRelationsPage() {
  const t = useTranslations('investor')
  const locale = useLocale()

  // Helper function to safely get translations with fallback
  // next-intl returns the key in format "namespace.key" when translation is missing
  const getTranslation = (key: string, fallback: string) => {
    try {
      const result = t(key)
      // Check if result indicates missing translation
      const isMissing = !result || 
                       result === key || 
                       result === `investor.${key}` || 
                       result.startsWith('investor.') ||
                       (typeof result === 'string' && result.includes('.') && result.split('.').length >= 2 && result.startsWith('investor.'))
      
      if (isMissing) {
        return fallback
      }
      return result
    } catch (error) {
      return fallback
    }
  }

  const contactInfo = [
    {
      icon: '📧',
      title: getTranslation('contact.email', 'Email'),
      value: 'investors@harvics.com',
      action: 'mailto:investors@harvics.com'
    },
    {
      icon: '💼',
      title: getTranslation('contact.officeHours', 'Office Hours'),
      value: getTranslation('contact.officeHoursValue', 'Monday - Friday, 9:00 AM - 5:00 PM GMT'),
      action: '#'
    }
  ]

  const investmentTypes = [
    { value: 'equity', label: getTranslation('form.investmentTypes.equity', 'Equity') },
    { value: 'debt', label: getTranslation('form.investmentTypes.debt', 'Debt') },
    { value: 'partnership', label: getTranslation('form.investmentTypes.partnership', 'Partnership') },
    { value: 'acquisition', label: getTranslation('form.investmentTypes.acquisition', 'Acquisition') },
    { value: 'other', label: getTranslation('form.investmentTypes.other', 'Other') }
  ]

  const categories = getFolderBasedCategories()

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-white">
        <Header categories={categories} />
      </div>
      <div className="h-20" /> {/* Spacer */}
      
      <StockTicker />
      <div>
        {/* Tabbed Interface - Original Theme */}
        <InvestorRelationsTabs />

        {/* Stock Chart Section */}
        <section className="py-12 md:py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#6B1F2B] mb-4 md:mb-6 font-serif">
                Live Stock Performance
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto px-4 text-base md:text-lg">
                Track real-time performance of Harvics Foods and Harvics Global stocks
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <StockChart />
            </div>
          </div>
        </section>

        {/* Binance Live Markets Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-medium text-[#6B1F2B] mb-2 font-serif">
                Live Crypto (Binance)
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real-time crypto prices streamed directly from Binance
              </p>
            </div>
            <BinanceLiveBoard />
          </div>
        </section>

        {/* Hero Section - Premium Design */}
        <section className="relative py-20 md:py-32 bg-[#6B1F2B] overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 md:mb-8 font-serif tracking-tight leading-tight">
                {getTranslation('hero.title', 'Investor Relations')}
              </h1>
              <div className="w-32 h-1 bg-white/50 mx-auto mb-8"></div>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-10 md:mb-12 px-4 leading-relaxed font-light">
                {getTranslation('hero.subtitle', 'Connect with Harvics Global Ventures and explore investment opportunities in the premium FMCG sector.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20fiat%20currency.%20Please%20provide%20more%20information."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg md:text-xl font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/30 flex items-center space-x-3 overflow-hidden border border-green-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-2xl">💵</span>
                  <span className="relative z-10">Invest in Fiat</span>
                </a>
                <a 
                  href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20Bitcoin.%20Please%20provide%20more%20information%20about%20Bitcoin%20investment%20options."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg md:text-xl font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/30 flex items-center space-x-3 overflow-hidden border border-orange-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-2xl">₿</span>
                  <span className="relative z-10">Invest in Bitcoin</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Options Section - Premium Design */}
        <section className="py-16 md:py-24 bg-[#F8F9FA] relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C3A35E] rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C3A35E] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#6B1F2B] mb-6 font-serif tracking-tight">
                Investment Opportunities
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed font-light">
                Choose your preferred investment method and start your journey with Harvics Foods
              </p>
              <div className="w-24 h-1 bg-[#C3A35E] mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto">
              <a 
                href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20fiat%20currency.%20Please%20provide%20more%20information."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500"></div>
                <div className="relative p-10 md:p-12 rounded-3xl border border-gray-100 hover:border-green-500/30 transition-all duration-500 hover:scale-[1.02] bg-white">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-green-50 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="text-5xl">💵</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium text-[#6B1F2B] mb-4 group-hover:text-green-700 transition-colors duration-300 font-serif">
                      Fiat Investment
                    </h3>
                    <div className="w-20 h-0.5 bg-green-500/30 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed font-light">
                      Invest using traditional fiat currencies including USD, EUR, GBP with secure banking methods.
                    </p>
                    <div className="inline-block bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/30">
                      Invest in Fiat
                    </div>
                  </div>
                </div>
              </a>

              <a 
                href="https://wa.me/447405527427?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Harvics%20Foods%20using%20Bitcoin.%20Please%20provide%20more%20information%20about%20Bitcoin%20investment%20options."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500"></div>
                <div className="relative p-10 md:p-12 rounded-3xl border border-gray-100 hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02] bg-white">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-orange-50 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="text-5xl">₿</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium text-[#6B1F2B] mb-4 group-hover:text-orange-700 transition-colors duration-300 font-serif">
                      Bitcoin Investment
                    </h3>
                    <div className="w-20 h-0.5 bg-orange-500/30 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed font-light">
                      Invest using Bitcoin with secure blockchain technology and instant global transactions.
                    </p>
                    <div className="inline-block bg-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/30">
                      Invest in Bitcoin
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Contact Information Section - Premium Design */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#6B1F2B] mb-6 font-serif tracking-tight">
                {getTranslation('contact.title', 'Contact Investor Relations')}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed font-light">
                {getTranslation('contact.subtitle', 'Get in touch with our investor relations team for inquiries and information.')}
              </p>
              <div className="w-24 h-1 bg-[#C3A35E] mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.action}
                  className="group relative overflow-hidden"
                >
                  <div className="relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#C3A35E]/30 transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#6B1F2B]/5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-4xl">{info.icon}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-medium text-[#6B1F2B] mb-3 group-hover:text-[#C3A35E] transition-colors duration-300 font-serif">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 text-base md:text-lg font-light">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-12 md:py-16 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#6B1F2B] mb-4 md:mb-6 font-serif">
                {getTranslation('form.title', 'Investment Inquiry Form')}
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4 font-light">
                {getTranslation('form.subtitle', 'Submit your investment inquiry and our team will get back to you promptly.')}
              </p>
            </div>

            <InvestorRelationsForm />
          </div>
        </section>

        {/* Additional Information Section - Premium Design */}
        <section className="py-16 md:py-24 bg-[#6B1F2B] relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C3A35E] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C3A35E] rounded-full blur-[120px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#C3A35E] mb-6 font-serif tracking-tight">
                {getTranslation('info.title', 'Investment Information')}
              </h2>
              <div className="w-24 h-1 bg-white/20 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {/* Financial Performance Card */}
              <div className="group relative">
                <div className="relative p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#C3A35E] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C3A35E]/10">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#C3A35E] text-[#6B1F2B] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 group-hover:text-[#C3A35E] transition-colors duration-300 font-serif">
                        {getTranslation('info.financials.title', 'Financial Performance')}
                      </h3>
                      <div className="w-16 h-0.5 bg-[#C3A35E]/50 mb-4"></div>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg font-light">
                    {getTranslation('info.financials.description', 'Comprehensive financial data including revenue, profit margins, and key performance indicators across all business segments.')}
                  </p>
                </div>
              </div>

              {/* Investment Opportunities Card */}
              <div className="group relative">
                <div className="relative p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#C3A35E] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C3A35E]/10">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#C3A35E] text-[#6B1F2B] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 group-hover:text-[#C3A35E] transition-colors duration-300 font-serif">
                        {getTranslation('info.opportunities.title', 'Investment Opportunities')}
                      </h3>
                      <div className="w-16 h-0.5 bg-[#C3A35E]/50 mb-4"></div>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg font-light">
                    {getTranslation('info.opportunities.description', 'Explore diverse investment opportunities including equity, debt, partnerships, and strategic acquisitions.')}
                  </p>
                </div>
              </div>

              {/* Global Presence Card */}
              <div className="group relative">
                <div className="relative p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#C3A35E] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C3A35E]/10">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#C3A35E] text-[#6B1F2B] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 group-hover:text-[#C3A35E] transition-colors duration-300 font-serif">
                        {getTranslation('info.global.title', 'Global Presence')}
                      </h3>
                      <div className="w-16 h-0.5 bg-[#C3A35E]/50 mb-4"></div>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg font-light">
                    {getTranslation('info.global.description', 'Operating in 40+ countries with a strong presence across multiple continents and markets.')}
                  </p>
                </div>
              </div>

              {/* Strategic Partnerships Card */}
              <div className="group relative">
                <div className="relative p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#C3A35E] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#C3A35E]/10">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#C3A35E] text-[#6B1F2B] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 group-hover:text-[#C3A35E] transition-colors duration-300 font-serif">
                        {getTranslation('info.partnership.title', 'Strategic Partnerships')}
                      </h3>
                      <div className="w-16 h-0.5 bg-[#C3A35E]/50 mb-4"></div>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg font-light">
                    {getTranslation('info.partnership.description', 'Building long-term strategic partnerships with key stakeholders, suppliers, and distribution networks worldwide.')}
                  </p>
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
