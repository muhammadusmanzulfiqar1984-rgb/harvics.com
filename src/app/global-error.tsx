'use client'

// Global error page - catches errors in the root layout itself
// Must be a Client Component with its own <html> and <body>
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; }
        `}</style>
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-1 bg-harvics-gold mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-black mb-3">
              Critical Error
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              A critical error occurred. Please reload the application.
            </p>
            {process.env.NODE_ENV === 'development' && error?.message && (
              <pre className="text-left bg-red-50 border border-red-200 p-3 text-xs text-status-error mb-6 whitespace-pre-wrap break-words max-h-32 overflow-auto">
                {error.message}
              </pre>
            )}
            <button
              onClick={reset}
              className="bg-harvics-maroon text-white px-6 py-3 font-semibold border-none cursor-pointer hover:bg-harvics-maroon-dark transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
