'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

const HomepageLenis = dynamic(() => import('@/components/home/HomepageLenis'), {
  ssr: false,
})

/** Smooth scroll — isolated so Lenis/GSAP never blanks the homepage. */
export default function HomeMotion() {
  return (
    <ErrorBoundary fallback={null}>
      <HomepageLenis />
    </ErrorBoundary>
  )
}
