'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

const FloatingActionButton: React.FC = () => {
  const t = useTranslations()
  const whatsappUrl = 'https://wa.me/447405527427'

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Main WhatsApp Chat Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#ffffff] via-[#ffffff] to-[#ffffff] text-black shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label={t('common.chatWithUs') || 'Chat with Us on WhatsApp'}
      >
        <span className="text-2xl">
          💬
        </span>
        <div className="absolute right-20 bg-white text-white text-xs px-3 py-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-[#C3A35E]/30">
          {t('common.chatWithUs') || 'Chat with Us'}
        </div>
      </a>
    </div>
  )
}

export default FloatingActionButton
