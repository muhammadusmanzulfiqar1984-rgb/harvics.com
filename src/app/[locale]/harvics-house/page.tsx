'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function HarvicsHousePage() {
  const t = useTranslations('harvicsHouse')

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-[#6B1F2B] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/Images/HARVICS FOODS.png"
            alt="Harvics House Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif text-[#C3A35E] mb-6 tracking-wide">
            {t('title') || 'Harvics House'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
            {t('subtitle') || 'A Legacy of Excellence and Tradition'}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-full mb-12 text-center">
             <h2 className="text-3xl font-serif text-[#6B1F2B] mb-6 border-b border-[#C3A35E]/30 pb-4 inline-block">
              {t('aboutTitle') || 'Welcome to Harvics House'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg max-w-3xl mx-auto">
              {t('description') || 'Harvics House represents the pinnacle of our commitment to quality and heritage.'}
            </p>
          </div>

          {/* PDF Viewer */}
          <div className="w-full h-[85vh] bg-gray-100 shadow-2xl border-4 border-[#C3A35E]/20 overflow-hidden relative">
            <iframe
              src="/files/Harvics_House.pdf"
              className="w-full h-full"
              title="Harvics House PDF"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-[#6B1F2B] text-xl mb-4">
                  Unable to display PDF file.
                </p>
                <a 
                  href="/files/Harvics_House.pdf"
                  className="bg-[#C3A35E] text-[#6B1F2B] px-6 py-3 rounded hover:bg-[#b89628] transition-colors"
                  download
                >
                  Download Harvics House Profile
                </a>
              </div>
            </iframe>
          </div>
        </div>
      </section>
    </main>
  )
}
