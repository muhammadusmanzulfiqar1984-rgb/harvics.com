'use client'

// Root-level not-found page (English fallback, outside locale routing)
import Link from 'next/link'

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-white p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-harvics-maroon opacity-15 mb-4">
          404
        </div>
        <div className="w-16 h-1 bg-harvics-gold mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-black mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/en"
          className="bg-harvics-maroon text-white px-6 py-3 font-semibold inline-block no-underline hover:bg-harvics-maroon-dark transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
