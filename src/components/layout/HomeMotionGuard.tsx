'use client'

import { usePathname } from 'next/navigation'

/** Corridor home uses GSAP pin/scrub — skip generic apple scroll parallax (conflicts with Lenis). */
export default function HomeMotionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCorridorHome = pathname != null && /^\/[^/]+\/?$/.test(pathname)
  if (isCorridorHome) return null
  return <>{children}</>
}
