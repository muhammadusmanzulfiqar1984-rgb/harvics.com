'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const hideForMeetRoom = /\/meet\/[^/]+/.test(pathname || '')
  const hideForHomepageTrial = /\/homepage-trial\/?$/.test(pathname || '')
  if (hideForMeetRoom || hideForHomepageTrial) return null
  return <Footer />
}
