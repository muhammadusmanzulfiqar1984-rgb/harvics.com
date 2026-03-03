'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export default function BackButton({ 
  href, 
  label = 'Back',
  className = '' 
}: BackButtonProps) {
  const router = useRouter()
  const locale = useLocale()

  const handleBack = () => {
    if (href) {
      router.push(`/${locale}${href}`)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:text-[#C3A35E] border border-black200 rounded-md hover:border-[#C3A35E] hover:bg-[#C3A35E]/5 transition-all duration-200 ${className}`}
      aria-label={label}
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

