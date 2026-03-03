'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

const MediaSection: React.FC = () => {
  const t = useTranslations('media')
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isVisible, setIsVisible] = useState(true) // Start visible immediately
  
  // Fallback text values
  const getText = (key: string, fallback: string) => {
    try {
      const translated = t(key)
      if (translated === key || !translated || translated.trim() === '') {
        return fallback
      }
      return translated
    } catch (error) {
      return fallback
    }
  }

  const cartoonVideos = [
    {
      id: 'JVf_SUnK7Xs', // Your provided video
      title: 'Harvics Foods - Our Story',
      thumbnail: 'https://img.youtube.com/vi/JVf_SUnK7Xs/maxresdefault.jpg'
    }
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % cartoonVideos.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [cartoonVideos.length])

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#6B1F2B] relative overflow-hidden min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#C3A35E] to-[#C3A35E] rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#C3A35E] to-[#C3A35E] rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="opacity-100">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif text-[#C3A35E] drop-shadow-sm">
              {getText('title', 'Media & Promotions')}
            </h2>
            <div className="w-24 h-1 bg-[#C3A35E] mx-auto mt-6"></div>
          </div>
        </div>

        {/* Video Slider Container - Full Width */}
        <div className="opacity-100">
          <div className="relative w-full">
            {/* Main Video Display - Full Width */}
            <div className="relative bg-[#6B1F2B] shadow-2xl overflow-hidden border-2 border-[#C3A35E]/30">
              <div className="aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${cartoonVideos[currentVideo].id}?autoplay=0&controls=1&showinfo=0&rel=0`}
                  title={cartoonVideos[currentVideo].title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              {/* Video Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-xl font-ui-bold">
                  {cartoonVideos[currentVideo].title}
                </h3>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCurrentVideo((prev) => prev === 0 ? cartoonVideos.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentVideo((prev) => (prev + 1) % cartoonVideos.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {cartoonVideos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideo(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentVideo === index 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MediaSection
