'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  // Hide on homepage (e.g. /en, /ar, /fr — locale root only)
  const isHomepage = /^\/[a-z]{2}(\/)?$/.test(pathname || '')
  if (isHomepage) return null
  return <Footer />
}
