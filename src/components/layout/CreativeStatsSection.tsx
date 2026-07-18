'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

const CreativeStatsSection: React.FC = () => {
  const t = useTranslations()
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const categories = getFolderBasedCategories()

  const stats = [
    { 
      number: '42+', 
      target: 42,
      suffix: '+',
      label: t('stats.countriesServed'), 
      icon: '🌍',
      color: 'from-red-500 to-red-700'
    },
    { 
      number: '10', 
      target: 10,
      suffix: '',
      label: t('stats.productCategories'), 
      icon: '📦',
      color: 'from-white to-white'
    },
    { 
      number: '1,185+', 
      target: 1185,
      suffix: '+',
      label: t('stats.productsDelivered'), 
      icon: '🚚',
      color: 'from-white to-white200'
    },
    { 
      number: '2019', 
      target: 2019,
      suffix: '',
      label: t('stats.establishedYear'), 
      icon: '🏢',
      color: 'from-red-500 to-red-700'
    }
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const countCountries = useCountUp(42, 1800, statsVisible)
  const countCategories = useCountUp(10, 1200, statsVisible)
  const countProducts = useCountUp(1185, 2000, statsVisible)
  const countYear = useCountUp(2019, 1600, statsVisible)
  const animatedNumbers = [countCountries + '+', String(countCategories), countProducts.toLocaleString() + '+', String(countYear)]

  return (
    <section className="py-20 px-6 bg-[#F8F9FA] relative overflow-hidden min-h-screen flex items-center">
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-5xl md:text-6xl font-bold text-harvics-burgundy mb-6 font-serif drop-shadow-sm">
              {t('products.productCategories')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              {t('products.discoverPremium')}
            </p>
            <div className="w-24 h-1 bg-harvics-burgundy mx-auto mt-6"></div>
          </div>
        </div>

        {/* Product Categories Grid */}
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {(categories || []).map((category, index) => (
              <div
                key={index}
                className={`group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 hover:scale-[1.02] ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
                onMouseEnter={() => setHoveredCategory(category.key)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Category Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image || '/assets/brand/photo/logo.png'} 
                    alt={t(`products.${category.key}`)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-harvics-burgundy mb-3 group-hover:text-[#2a0006] transition-colors duration-300">
                      {t(`products.${category.key}`)}
                    </h4>
                    <p className="text-gray-600 text-base mb-6 line-clamp-3">
                      {t(`products.${category.key}Desc`)}
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <div>
                    <div className="inline-flex items-center space-x-2 text-harvics-burgundy font-bold group-hover:translate-x-2 transition-transform duration-300">
                      <span>EXPLORE</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${1200 + index * 200}ms` }}
            >
              <div className="text-6xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold text-harvics-burgundy mb-2">
                {animatedNumbers[index]}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CreativeStatsSection