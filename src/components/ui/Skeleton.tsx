'use client'

import React from 'react'

/**
 * Skeleton — Premium loading placeholder with gold shimmer.
 * Matches the Harvics Supreme design language.
 *
 * Usage:
 *   <Skeleton className="h-8 w-48" />           — text line
 *   <Skeleton className="h-64 w-full" />         — image block
 *   <Skeleton variant="card" />                   — product card
 *   <Skeleton variant="text" lines={3} />         — paragraph
 *   <Skeleton variant="stat" />                   — stat counter
 */

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'card' | 'stat' | 'circle' | 'image'
  lines?: number
  width?: string
  height?: string
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'default',
  lines = 1,
  width,
  height,
}) => {
  const shimmerBase =
    'relative overflow-hidden bg-[#EDE8DB] isolate'

  const shimmerOverlay = (
    <div
      className="absolute inset-0 z-10"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(195, 163, 94,0.08) 40%, rgba(195, 163, 94,0.15) 50%, rgba(195, 163, 94,0.08) 60%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'harvics-shimmer 1.8s ease-in-out infinite',
      }}
    />
  )

  /* ── Variants ── */
  if (variant === 'text') {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={shimmerBase}
            style={{
              height: '12px',
              width: i === lines - 1 ? '60%' : '100%',
            }}
          >
            {shimmerOverlay}
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-harvics-gold/10 p-0 ${className}`}>
        {/* Image area */}
        <div className={`${shimmerBase} w-full h-44`}>{shimmerOverlay}</div>
        {/* Content area */}
        <div className="p-4 space-y-2.5">
          <div className={`${shimmerBase} h-4 w-3/4`}>{shimmerOverlay}</div>
          <div className={`${shimmerBase} h-3 w-full`}>{shimmerOverlay}</div>
          <div className={`${shimmerBase} h-3 w-1/2`}>{shimmerOverlay}</div>
        </div>
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className={`${shimmerBase} h-8 w-20`}>{shimmerOverlay}</div>
        <div className={`${shimmerBase} h-3 w-16`}>{shimmerOverlay}</div>
      </div>
    )
  }

  if (variant === 'circle') {
    return (
      <div
        className={`${shimmerBase} ${className}`}
        style={{
          width: width || '48px',
          height: height || '48px',
          borderRadius: '50% !important' as any,
        }}
      >
        {shimmerOverlay}
      </div>
    )
  }

  if (variant === 'image') {
    return (
      <div
        className={`${shimmerBase} flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}
      >
        {shimmerOverlay}
        {/* Image icon placeholder */}
        <svg
          className="w-8 h-8 text-harvics-gold/15 z-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  /* ── Default (single block) ── */
  return (
    <div
      className={`${shimmerBase} ${className}`}
      style={{ width, height }}
    >
      {shimmerOverlay}
    </div>
  )
}

/**
 * SkeletonGrid — Grid of skeleton cards for product/category loading states.
 */
export const SkeletonGrid: React.FC<{
  count?: number
  columns?: number
  className?: string
}> = ({ count = 6, columns = 3, className = '' }) => {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  )
}

export default Skeleton
