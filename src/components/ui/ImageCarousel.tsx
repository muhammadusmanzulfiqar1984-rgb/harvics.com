'use client'

/**
 * ImageCarousel — auto-sliding fade carousel for hero / campaign backgrounds.
 */

import React, { useState, useEffect } from 'react'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const FALLBACK_IMAGE = '/assets/brand/photo/logo.png'

interface ImageCarouselProps {
  images?: string[]
  autoSlideInterval?: number
  height?: string
  /** Pause while pointer is over the carousel root. Off by default so overlays don't freeze autoplay. */
  pauseOnHover?: boolean
  /** Show bottom dots + play/pause. */
  showControls?: boolean
}

const DEFAULT_IMAGES = [
  '/assets/shared/heroes/hero-banner-1.webp',
  '/assets/shared/heroes/hero-banner-2.webp',
]

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = DEFAULT_IMAGES,
  autoSlideInterval = 5000,
  height = 'h-[600px] md:h-[700px] lg:h-[800px]',
  pauseOnHover = false,
  showControls = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHoverPaused, setIsHoverPaused] = useState(false)
  const [isUserPaused, setIsUserPaused] = useState(false)

  const slideCount = images.length
  const isPaused = isUserPaused || (pauseOnHover && isHoverPaused)

  // Keep index in range if the image list shrinks.
  useEffect(() => {
    if (currentIndex >= slideCount && slideCount > 0) {
      setCurrentIndex(0)
    }
  }, [slideCount, currentIndex])

  // Autoplay — always runs unless explicitly paused (or reduced motion).
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount)
    }, autoSlideInterval)

    return () => window.clearInterval(id)
  }, [slideCount, autoSlideInterval, isPaused])

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  if (slideCount === 0) {
    return null
  }

  return (
    <div
      className={`relative w-full ${height} overflow-hidden bg-[#0a0406]`}
      onMouseEnter={pauseOnHover ? () => setIsHoverPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsHoverPaused(false) : undefined}
    >
      <div className="relative w-full h-full">
        {images.map((image, index) => {
          const isActive = index === currentIndex

          return (
            <div
              key={`${image}-${index}`}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 1.1s ease, transform 6s ease',
                zIndex: isActive ? 2 : 1,
                pointerEvents: 'none',
              }}
              aria-hidden={!isActive}
            >
              <HarvicsImage
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes={IMAGE_SIZES.hero}
                priority={index === 0}
                fallbackSrc={FALLBACK_IMAGE}
              />
            </div>
          )
        })}
      </div>

      {showControls && slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
          <div className="rounded-full bg-black/25 backdrop-blur-md px-3 py-2 flex items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`shrink-0 border-0 p-0 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'h-1.5 w-7 bg-white/95'
                    : 'h-1.5 w-1.5 bg-white/45 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
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
