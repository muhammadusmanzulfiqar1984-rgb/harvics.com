import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'login', {
    title: undefined,
    description: undefined,
  })
}

// Next.js App Router locale-aware 404 page
export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale?: string }>
}) {
  let locale = 'en'
  try {
    const p = await params
    locale = p?.locale || 'en'
  } catch {
    // params not available in some contexts, default to 'en'
  }

  const t = await getTranslations({ locale, namespace: 'errors.notFound' })
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(locale)

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center max-w-md">
        {/* 404 Graphic */}
        <div className="mb-8">
          <span className="text-8xl font-bold text-[#6B1F2B] opacity-20 select-none">
            404
          </span>
        </div>

        {/* Harvics Logo Mark */}
        <div className="w-16 h-1 bg-[#C3A35E] mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-black mb-3">
          {t('heading')}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}`}
            className="bg-[#6B1F2B] text-white px-6 py-3 font-semibold hover:bg-[#5a0012] transition-colors"
          >
            {t('goHome')}
          </Link>
          <Link
            href={`/${locale}`}
            className="border border-[#6B1F2B] text-[#6B1F2B] px-6 py-3 font-semibold hover:bg-[#6B1F2B] hover:text-white transition-colors"
          >
            {t('goBack')}
          </Link>
        </div>

        {/* Support link */}
        <p className="mt-8 text-sm text-gray-400">
          <Link href={`/${locale}/help`} className="text-[#C3A35E] hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
