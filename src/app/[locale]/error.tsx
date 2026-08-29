'use client'

import { useEffect } from 'react'

/** Next.js App Router error boundary — always surface the real message. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Harvics page error]', error?.message, error?.stack)
    const msg = error?.message || ''
    const webpackHmr =
      msg.includes("reading 'call'") ||
      msg.includes('ChunkLoadError') ||
      msg.includes('Loading chunk')
    if (!webpackHmr || typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem('harvics_webpack_reload')) return
      sessionStorage.setItem('harvics_webpack_reload', '1')
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }, [error])

  return (
    <div className="min-h-[50vh] bg-white flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg w-full">
        <h2 className="text-2xl font-bold text-black mb-3">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We are sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        {error?.message ? (
          <pre className="mb-6 text-left p-4 bg-red-50 border border-red-200 text-xs text-red-700 overflow-auto max-h-56 whitespace-pre-wrap">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
            {error.digest ? `\n\ndigest: ${error.digest}` : ''}
          </pre>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="bg-harvics-burgundy text-white px-6 py-3 font-semibold"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-harvics-burgundy text-harvics-burgundy px-6 py-3 font-semibold"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
