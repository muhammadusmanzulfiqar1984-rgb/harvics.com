// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import EmployeeLoginForm from './EmployeeLoginForm'

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

export default async function EmployeeLoginPage() {
  const t = await getTranslations('employeeLogin')

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#6B1F2B] flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#6B1F2B] mb-2">
                {t('title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('subtitle')}
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white p-6 shadow-sm border border-gray-100">
              <EmployeeLoginForm />
            </div>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-white border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-[#6B1F2B]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6B1F2B] text-sm">📅</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {t('features.schedule.title')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t('features.schedule.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-[#6B1F2B]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6B1F2B] text-sm">📋</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {t('features.tasks.title')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t('features.tasks.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-[#6B1F2B]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6B1F2B] text-sm">💼</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {t('features.hr.title')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t('features.hr.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
