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
 * 1. Add images to the public/Images folder
 * 2. Update the DEFAULT_IMAGES array below with your image paths
 * 3. Or pass a custom images array as a prop: <ImageCarousel images={['/Images/path1.jpg', '/Images/path2.jpg']} />
 * 
 * HOW TO CHANGE SLIDE INTERVAL:
 * Pass autoSlideInterval prop (in milliseconds): <ImageCarousel autoSlideInterval={3000} />
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images?: string[]
  autoSlideInterval?: number
  height?: string
}

// ============================================
// HOW TO ADD YOUR OWN IMAGES:
// ============================================
// 1. Put your image files in: public/Images/ folder
// 2. Add the image path below in this format: '/Images/your-filename.jpg'
// 3. Example: If you add "my-photo.jpg" to public/Images/, write: '/Images/my-photo.jpg'
//
// Current images are from your public/Images folder - 100% FREE (no hosting costs!)
// ============================================

const DEFAULT_IMAGES = [
  // Add your images here! Format: '/Images/filename.jpg'
  '/Images/Harvics.com/Bakery/Biscuits and Cookies/biscuits.png',
  '/Images/Harvics.com/Beverages/Carbonated/carbonated.png',
  '/Images/New folder/Confectionary/WhatsApp Image 2025-09-19 at 1.50.04 AM.jpeg',
  '/Images/Harvics.com/Culinary/sauces and condiments/sauce.png',
  '/Images/Harvics.com/Snacks/Chips and Crisps/chips.png',
  '/Images/Harvics.com/Pastas/pasta (3).png',
  '/Images/Harvics.com/Frozen Foods/Chicken Nuggets/chicken-nuggets.png',
  '/Images/Logo.JPG',
  '/Images/worldmap.jpg',
  '/Images/worldmap1.jpeg',
  '/Images/Harvics.com/Bakery/Cakes and Pastreis/cake.png',
  '/Images/Harvics.com/Beverages/Functional/energy (2).png',
  '/Images/Harvics.com/Bakery/Wafer and Wafer Bars/wafer.png',
  '/Images/6607de09-0cc0-4118-9c32-facc547a75bd.JPG',
  '/Images/d9e78976-4d7d-4838-8342-07102dcf573d.JPG',
  // 👆 Add more images above this line 👆
  // Example: '/Images/your-new-image.jpg',
]

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = DEFAULT_IMAGES,
  autoSlideInterval = 5000, // 5 seconds default
  height = 'h-[600px] md:h-[700px] lg:h-[800px]'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current = []
    }
  }, [])

  // Auto-slide functionality removed - images stay static
  // Users can manually navigate using arrows or dots

  // Manual navigation
  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
    timeoutRefs.current.push(timeout)
  }

  const goToPrevious = () => {
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      )
      setIsTransitioning(false)
    }, 150)
    timeoutRefs.current.push(timeout)
  }

  const goToNext = () => {
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      setIsTransitioning(false)
    }, 150)
    timeoutRefs.current.push(timeout)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className={`relative w-full ${height} overflow-hidden bg-white`}>
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
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={isActive}
                  sizes="100vw"
                  onError={(e) => {
                    // Fallback to logo if image fails to load
                    const target = e.target as HTMLImageElement
                    if (target.src !== '/Images/logo.png') {
                      target.src = '/Images/logo.png'
                    }
                  }}
                />
                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B1F2B]/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#6B1F2B]/60" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-white border-2 border-[#C3A35E]/30 p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-white border-2 border-[#C3A35E]/30 p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-white w-8 h-3 md:w-12 md:h-3 shadow-lg shadow-white/50'
                  : 'bg-white/40 hover:bg-white/60 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / images.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ImageCarousel

