'use client'

/**
 * ImageCarousel Component
 * 
 * A beautiful, auto-sliding image carousel that displays images from the public/Images folder.
 * 
 * FEATURES:
 * - ✅ Auto-slides through images automatically (globally)
 * - ✅ 100% Cost-free (uses local images from public folder)
 * - ✅ Smooth fade transitions
 * - ✅ Navigation arrows and dot indicators
 * - ✅ Progress bar showing slide progress
 * - ✅ Fully responsive design
 * - ✅ Similar to professional carousels like 222.nestle.com
 * 
 * HOW TO CUSTOMIZE IMAGES:
 * 1. Add images to the public/assets/shared/ folder
 * 2. Update the DEFAULT_IMAGES array below with your image paths
 * 3. Or pass a custom images array as a prop: <ImageCarousel images={['/assets/shared/path1.jpg', '/assets/shared/path2.jpg']} />
 * 
 * HOW TO CHANGE SLIDE INTERVAL:
 * Pass autoSlideInterval prop (in milliseconds): <ImageCarousel autoSlideInterval={3000} />
 */

import React, { useState, useEffect } from 'react'

const FALLBACK_IMAGE = '/assets/brand/photo/logo.png'

interface ImageCarouselProps {
  images?: string[]
  autoSlideInterval?: number
  height?: string
}

// ============================================
// HOW TO ADD YOUR OWN IMAGES:
// ============================================
// 1. Put your image files in: public/assets/shared/ folder
// 2. Add the image path below in this format: '/assets/shared/your-filename.jpg'
// 3. Example: If you add "my-photo.jpg" to public/assets/shared/, write: '/assets/shared/my-photo.jpg'
//
// Current images live under public/assets/shared - served directly by Next.js (no hosting costs!)
// ============================================

const DEFAULT_IMAGES = [
  // Add your images here! Format: '/assets/...'
  '/assets/verticals/02-fmcg/categories/bakery/biscuits-and-cookies/biscuits.png',
  '/assets/verticals/02-fmcg/categories/beverages/carbonated/carbonated.png',
  '/assets/verticals/02-fmcg/categories/culinary/sauces-and-condiments/sauce-1.png',
  '/assets/verticals/02-fmcg/categories/snacks/chips-and-crisps/chips and crisp.png',
  '/assets/verticals/02-fmcg/categories/pastas/pasta (3).png',
  '/assets/verticals/02-fmcg/categories/frozen-foods/chicken-nuggets/chicken nuggets.png',
  '/assets/brand/photo/logo.png',
  '/assets/geo/worldmap.jpg',
  '/assets/geo/worldmap-alt.jpeg',
  '/assets/verticals/02-fmcg/categories/bakery/cakes-and-pastries/cake.png',
  '/assets/verticals/02-fmcg/categories/beverages/functional/energy (2).png',
  '/assets/verticals/02-fmcg/categories/bakery/wafer-and-wafer-bars/wafer.png',
  '/assets/shared/heroes/hero-banner-1.jpg',
  '/assets/shared/heroes/hero-banner-2.jpg',
  // 👆 Add more images above this line 👆
]

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = DEFAULT_IMAGES,
  autoSlideInterval = 5000, // 5 seconds default
  height = 'h-[600px] md:h-[700px] lg:h-[800px]'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isUserPaused, setIsUserPaused] = useState(false)

  // Auto-slide with pause-on-hover behavior.
  useEffect(() => {
    if (images.length <= 1 || isPaused || isUserPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [images.length, autoSlideInterval, isPaused, isUserPaused])

  // Manual navigation
  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div
      className={`relative w-full ${height} overflow-hidden bg-[#f5f5f7]`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel Container */}
      <div className="relative w-full h-full">
        {images.map((image, index) => {
          const isActive = index === currentIndex
          
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-[1.02] z-0'
              }`}
            >
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (target.src.endsWith(FALLBACK_IMAGE)) return
                    target.src = FALLBACK_IMAGE
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Apple-style controls */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <div className="rounded-full bg-black/25 backdrop-blur-md px-3 py-2 flex items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-7 bg-white/95'
                    : 'w-1.5 bg-white/45 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIsUserPaused((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition-colors"
            aria-label={isUserPaused ? 'Play carousel' : 'Pause carousel'}
            title={isUserPaused ? 'Play' : 'Pause'}
          >
            {isUserPaused ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M7 5h3v14H7zm7 0h3v14h-3z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageCarousel

