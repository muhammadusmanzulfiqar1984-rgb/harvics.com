'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

const HomepageLenis = dynamic(() => import('@/components/home/HomepageLenis'), {
  ssr: false,
})

/** Smooth scroll on homepage editorial bands — isolated so Lenis/GSAP never blanks the page. */
export default function HomeMotion() {
  return (
    <ErrorBoundary fallback={null}>
      <HomepageLenis />
    </ErrorBoundary>
  )
}
