'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/data/countryData'
import { useLocaleContext } from '@/contexts/LocaleProvider'

export default function TestLocalization() {
  const locale = useLocale()
  const t = useTranslations('home')
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const { countryData, selectedCountry } = useCountry()
  const localeContext = useLocaleContext()

  // Test currency formatting
  const testAmount = 1234.56
  let formattedCurrency = 'N/A'
  try {
    if (countryData && selectedCountry) {
      const countryCode = countryData.currency?.code || selectedCountry.toUpperCase().slice(0, 2) || 'US'
      formattedCurrency = formatCurrency(testAmount, countryCode)
    } else {
      formattedCurrency = localeContext.formatCurrency(testAmount)
    }
  } catch (error) {
    formattedCurrency = `Error: ${error}`
  }

  // Test date formatting
  const testDate = new Date()
  let formattedDate = 'N/A'
  try {
    formattedDate = localeContext.formatDate(testDate)
  } catch (error) {
    formattedDate = `Error: ${error}`
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-white/90">🔍 Localization Test Page</h1>
        
        <div className="space-y-6">
          {/* Locale Info */}
          <section className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Current Locale</h2>
            <div className="bg-white p-4 rounded">
              <p><strong>Locale:</strong> {locale}</p>
              <p><strong>Source:</strong> {localeContext.source}</p>
              <p><strong>Currency:</strong> {localeContext.currency}</p>
            </div>
          </section>

          {/* Translation Tests */}
          <section className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Translation Tests</h2>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded">
                <p><strong>home.welcome:</strong> {t('welcome')}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p><strong>navigation.home:</strong> {tNav('home')}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p><strong>common.loading:</strong> {tCommon('loading')}</p>
              </div>
            </div>
          </section>

          {/* Currency Formatting */}
          <section className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Currency Formatting</h2>
            <div className="bg-white p-4 rounded">
              <p><strong>Test Amount:</strong> {testAmount}</p>
              <p><strong>Formatted:</strong> {formattedCurrency}</p>
              <p><strong>Country:</strong> {selectedCountry || 'Not selected'}</p>
              <p><strong>Country Code:</strong> {countryData?.currency?.code || selectedCountry?.toUpperCase().slice(0, 2) || 'N/A'}</p>
            </div>
          </section>

          {/* Date Formatting */}
          <section className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Date Formatting</h2>
            <div className="bg-white p-4 rounded">
              <p><strong>Current Date:</strong> {testDate.toISOString()}</p>
              <p><strong>Formatted:</strong> {formattedDate}</p>
            </div>
          </section>

          {/* Raw Messages Check */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Messages Check</h2>
            <div className="bg-white p-4 rounded">
              <p className="text-sm text-white/90">
                If translations show keys like "home.welcome" instead of actual text, 
                the messages are not loading correctly.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

