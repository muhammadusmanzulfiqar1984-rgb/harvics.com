'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Next.js App Router error boundary (client component required)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking in production
    console.error('[Harvics Error Boundary]', error)
  }, [error])

  // useTranslations falls back gracefully if messages not loaded
  let t: ((key: string) => string) | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    t = useTranslations('errors.serverError')
  } catch {
    // During SSR failures messages may not be available
  }

  const heading = t ? t('heading') : 'Something went wrong'
  const description = t ? t('description') : 'An unexpected error occurred. Please try refreshing the page.'
  const tryAgain = t ? t('tryAgain') : 'Try Again'
  const reload = t ? t('reload') : 'Reload Page'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 border-2 border-harvics-burgundy flex items-center justify-center">
            <svg
              className="w-8 h-8 text-harvics-burgundy"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <div className="w-16 h-1 bg-harvics-gold mx-auto mb-6" />

        <h2 className="text-2xl font-bold text-black mb-3">{heading}</h2>

        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <details className="mb-6 text-left p-4 bg-gray-50 border border-gray-200 text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
              Error Details (Dev Only)
            </summary>
            <pre className="whitespace-pre-wrap text-xs text-red-600 overflow-auto max-h-40">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-harvics-burgundy text-white px-6 py-3 font-semibold hover:bg-[#5a0012] transition-colors"
          >
            {tryAgain}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="border border-harvics-burgundy text-harvics-burgundy px-6 py-3 font-semibold hover:bg-harvics-burgundy hover:text-white transition-colors"
          >
            {reload}
          </button>
        </div>
      </div>
    </div>
  )
}
