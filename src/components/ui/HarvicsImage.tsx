'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const DEFAULT_FALLBACK = '/assets/brand/photo/logo.png'

/** Responsive `sizes` presets for common layout patterns */
export const IMAGE_SIZES = {
  hero: '100vw',
  heroHalf: '(max-width: 1024px) 100vw, 50vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  cardSm: '(max-width: 768px) 100vw, 320px',
  thumbnail: '64px',
  thumbnailLg: '96px',
  product: '(max-width: 768px) 100vw, 400px',
  productGrid: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  logo: '(max-width: 768px) 60vw, 320px',
  portal: '(max-width: 768px) 100vw, 400px',
  phone: '(max-width: 768px) 45vw, 220px',
  lightbox: '(max-width: 1200px) 92vw, 1100px',
  contactHero: '(max-width: 896px) 100vw, 896px',
} as const

export type HarvicsImageProps = {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  /** Set on LCP / above-the-fold heroes */
  priority?: boolean
  fallbackSrc?: string
  quality?: number
}

export function HarvicsImage({
  src,
  alt,
  className,
  style,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK,
  quality = 80,
}: HarvicsImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  const resolvedSizes = sizes ?? (fill ? IMAGE_SIZES.hero : `${width ?? 800}px`)

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        style={style}
        sizes={resolvedSizes}
        priority={priority}
        quality={quality}
        onError={() => {
          if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
        }}
      />
    )
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      style={style}
      sizes={resolvedSizes}
      priority={priority}
      quality={quality}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
      }}
    />
  )
}

export default HarvicsImage
