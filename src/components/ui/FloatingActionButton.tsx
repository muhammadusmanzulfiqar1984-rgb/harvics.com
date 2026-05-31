'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

const FloatingActionButton: React.FC = () => {
  const t = useTranslations()
  const callUrl = 'tel:+12295455206'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={callUrl}
        aria-label="Call HarvyX"
        className="group inline-flex items-center gap-2.5 h-12 pl-4 pr-5 rounded-full bg-[#1A0505] text-[#C3A35E] border border-[#C3A35E]/40 hover:border-[#C3A35E] shadow-[0_8px_24px_rgba(26,5,5,0.35)] hover:shadow-[0_10px_28px_rgba(195,163,94,0.25)] transition-all duration-200"
      >
        <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#C3A35E]/10 group-hover:bg-[#C3A35E]/20 transition-colors">
          <span className="absolute inset-0 rounded-full ring-1 ring-[#C3A35E]/30 animate-ping opacity-60 group-hover:opacity-100" />
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase leading-none">
          Call HarvyX
        </span>
      </a>
    </div>
  )
}

export default FloatingActionButton
