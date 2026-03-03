'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'

export default function DocumentAttributes() {
  const locale = useLocale()

  useEffect(() => {
    // Set lang and dir attributes on document element
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement
      
      // Set language
      htmlElement.setAttribute('lang', locale)
      
      // Set direction for RTL languages
      const rtlLocales = ['ar', 'he', 'fa', 'ur', 'ps']
      const direction = rtlLocales.includes(locale) ? 'rtl' : 'ltr'
      htmlElement.setAttribute('dir', direction)
    }
  }, [locale])

  return null
}

