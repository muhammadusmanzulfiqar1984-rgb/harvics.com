'use client'

/**
 * Page transition wrapper — passthrough only.
 * Opacity-based route transitions caused repeated invisible-page bugs site-wide.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
