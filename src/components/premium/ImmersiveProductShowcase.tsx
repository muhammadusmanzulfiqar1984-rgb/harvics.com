'use client'

import React, { useRef, useState, useEffect } from 'react'
import ScrollMotion, { ScrollCounter } from './ScrollMotion'

/**
 * ImmersiveProductShowcase — Multi-industry video grid with Apple-style effects.
 * Features video background grid, smooth transitions, and cinematic presentation.
 */

interface IndustryVideo {
  name: string
  category: string
  video?: string
  poster: string
  description: string
  color: string
}

const industryVideos: IndustryVideo[] = [
  {
    name: 'Textiles & Apparel',
    category: 'Premium Fabrics',
    poster: '/Images/textile.png',
    description: 'Global sourcing of premium textiles and apparel',
    color: '#4F46E5',
  },
  {
    name: 'FMCG Products',
    category: 'Food & Beverages',
    poster: '/FMCG IMAGES/Confectionary/Jelly/bearpops.jpg',
    description: 'Quality consumer goods for global markets',
    color: '#C3A35E',
  },
  {
    name: 'Commodities Trading',
    category: 'Global Markets',
    poster: '/Images/commodities.png',
    description: 'Strategic trading in agriculture, energy, and metals',
    color: '#F59E0B',
  },
  {
    name: 'Industrial Solutions',
    category: 'Machinery & Equipment',
    poster: '/Images/industrialsolutions.png',
    description: 'Advanced industrial chemicals and machinery',
    color: '#6B7280',
  },
  {
    name: 'Minerals & Resources',
    category: 'Energy & Mining',
    poster: '/Images/Minerals.png',
    description: 'Precious metals and energy minerals',
    color: '#92400E',
  },
  {
    name: 'Oil & Gas',
    category: 'Energy Sector',
    poster: '/Images/oilandgas.png',
    description: 'Complete upstream and downstream operations',
    color: '#DC2626',
  },
  {
    name: 'Real Estate',
    category: 'Property Development',
    poster: '/Images/real estate.png',
    description: 'Commercial and residential property development',
    color: '#0EA5E9',
  },
  {
    name: 'Sourcing Solutions',
    category: 'Global Procurement',
    poster: '/Images/sourcing-solutions.png',
    description: 'Global sourcing, quality control, and logistics',
    color: '#8B5CF6',
  },
  {
    name: 'Finance & HPay',
    category: 'Trade Finance',
    poster: '/Images/financial.png',
    description: 'Trade finance, digital payments, and compliance',
    color: '#10B981',
  },
  {
    name: 'AI & IT Solutions',
    category: 'Technology',
    poster: '/Images/it-solutions.png',
    description: 'Machine learning, analytics, and automation',
    color: '#F43F5E',
  },
]

const ImmersiveProductShowcase: React.FC = () => {
  const [activeIndustry, setActiveIndustry] = useState(0)
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({})
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const industry = industryVideos[activeIndustry]

  // Auto-play videos when in view
  useEffect(() => {
    const observers = videoRefs.current.map((video, idx) => {
      if (!video) return null
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
            setIsPlaying(prev => ({ ...prev, [idx]: true }))
          } else {
            video.pause()
            setIsPlaying(prev => ({ ...prev, [idx]: false }))
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(video)
      return observer
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  return (
    <section className="relative h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 50%, #f8f8f8 100%)' }}>
      
      {/* Industry Video Grid Hero */}
      <div className="relative w-full py-4 px-4">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Section Header */}
          <ScrollMotion animation="blur" duration={1200}>
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-black mb-1" 
                style={{ 
                  letterSpacing: '-0.03em',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
                }}
              >
                Industries in Motion
              </h2>
              <p className="text-sm text-gray-600 max-w-[800px] mx-auto leading-relaxed" 
                style={{ 
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
                }}
              >
                Experience our global operations across every major industry vertical
              </p>
            </div>
          </ScrollMotion>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5" style={{ height: '480px' }}>
            {industryVideos.map((ind, idx) => (
              <ScrollMotion
                key={idx}
                animation="fade-up"
                delay={idx * 100}
                duration={800}
              >
                <div
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    maxHeight: '460px',
                    height: '100%',
                    border: activeIndustry === idx ? '2px solid #C3A35E' : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: activeIndustry === idx 
                      ? '0 20px 60px rgba(195,163,94,0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  onClick={() => setActiveIndustry(idx)}
                >
                  {/* Video or Image Background */}
                  {ind.video ? (
                    <video
                      ref={el => { videoRefs.current[idx] = el }}
                      className="absolute inset-0 w-full h-full object-cover"
                      src={ind.video}
                      poster={ind.poster}
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={ind.poster}
                      alt={ind.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500"
                    style={{ opacity: activeIndustry === idx ? 0.9 : 0.7 }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span 
                        className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-sm"
                        style={{
                          background: `${ind.color}20`,
                          color: ind.color,
                          border: `1px solid ${ind.color}40`,
                        }}
                      >
                        {ind.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-white text-xl font-semibold mb-2 transition-all duration-300 group-hover:-translate-y-1"
                      style={{
                        letterSpacing: '-0.01em',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      {ind.name}
                    </h3>

                    {/* Description */}
                    <p 
                      className="text-white/80 text-sm leading-relaxed"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {ind.description}
                    </p>

                    {/* Play Indicator */}
                    {ind.video && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl"
                          style={{
                            background: 'rgba(195,163,94,0.3)',
                            border: '2px solid rgba(195,163,94,0.6)',
                          }}
                        >
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Active Indicator */}
                    {activeIndustry === idx && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C3A35E] to-transparent" />
                    )}
                  </div>
                </div>
              </ScrollMotion>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 py-3">
        <div className="max-w-[1000px] mx-auto px-4">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-0 backdrop-blur-xl"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(195,163,94,0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          >
            {[
              { value: 50, suffix: '+', label: 'Countries' },
              { value: 200, suffix: '+', label: 'Products' },
              { value: 15, suffix: 'K+', label: 'Tons/Year' },
              { value: 100, suffix: '%', label: 'Quality Tested' },
            ].map((stat, idx) => (
              <div key={idx} className={`p-6 text-center ${idx < 3 ? 'border-r border-[#C3A35E]/10' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold text-[#6B1F2B] mb-1">
                  <ScrollCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-[#6B1F2B]/50 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}

export default ImmersiveProductShowcase
