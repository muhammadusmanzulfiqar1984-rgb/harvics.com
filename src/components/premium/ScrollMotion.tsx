'use client'

import React, { useRef, useEffect, useState, ReactNode } from 'react'

/**
 * ScrollMotion — Advanced scroll-triggered animation wrapper.
 * Creates narrative flow with staggered reveals, parallax, and morphing.
 */

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur' | 'rotate' | 'slide-reveal' | 'morph' | 'parallax'

interface ScrollMotionProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  distance?: number
  threshold?: number
  once?: boolean
  className?: string
  stagger?: number // stagger delay for children
  parallaxSpeed?: number
  as?: keyof JSX.IntrinsicElements
}

const ScrollMotion: React.FC<ScrollMotionProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  distance = 60,
  threshold = 0.15,
  once = true,
  className = '',
  stagger = 0,
  parallaxSpeed = 0.3,
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  // Parallax effect
  useEffect(() => {
    if (animation !== 'parallax') return
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [animation])

  const getInitialStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transitionProperty: 'transform, opacity, filter',
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'transform, opacity',
    }

    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return { ...base, opacity: 0, transform: `translateY(${distance}px)` }
        case 'fade-down':
          return { ...base, opacity: 0, transform: `translateY(-${distance}px)` }
        case 'fade-left':
          return { ...base, opacity: 0, transform: `translateX(${distance}px)` }
        case 'fade-right':
          return { ...base, opacity: 0, transform: `translateX(-${distance}px)` }
        case 'scale':
          return { ...base, opacity: 0, transform: 'scale(0.85)' }
        case 'blur':
          return { ...base, opacity: 0, filter: 'blur(20px)', transform: `translateY(${distance * 0.5}px)` }
        case 'rotate':
          return { ...base, opacity: 0, transform: `rotate3d(1, 0, 0, 15deg) translateY(${distance}px)` }
        case 'slide-reveal':
          return { ...base, opacity: 0, clipPath: 'inset(0 100% 0 0)', transform: `translateX(-${distance * 0.5}px)` }
        case 'morph':
          return { ...base, opacity: 0, borderRadius: '60% 40% 60% 40%', transform: `scale(0.9) rotate(5deg)` }
        case 'parallax':
          return { ...base, opacity: 0, transform: `translateY(${distance}px)` }
        default:
          return { ...base, opacity: 0 }
      }
    }

    // Visible state
    switch (animation) {
      case 'parallax': {
        const elTop = ref.current?.getBoundingClientRect().top || 0
        const offset = (scrollY - elTop) * parallaxSpeed
        return { ...base, opacity: 1, transform: `translateY(${offset}px)` }
      }
      case 'slide-reveal':
        return { ...base, opacity: 1, clipPath: 'inset(0 0% 0 0)', transform: 'translateX(0)' }
      case 'morph':
        return { ...base, opacity: 1, borderRadius: '0%', transform: 'scale(1) rotate(0deg)' }
      default:
        return { ...base, opacity: 1, transform: 'none', filter: 'none' }
    }
  }

  return (
    // @ts-ignore
    <Tag ref={ref} className={className} style={getInitialStyle()}>
      {children}
    </Tag>
  )
}

/**
 * ScrollMotionGroup — Staggers children with sequential delays.
 */
interface ScrollMotionGroupProps {
  children: ReactNode[]
  animation?: AnimationType
  staggerDelay?: number
  className?: string
  childClassName?: string
  duration?: number
  distance?: number
}

export const ScrollMotionGroup: React.FC<ScrollMotionGroupProps> = ({
  children,
  animation = 'fade-up',
  staggerDelay = 100,
  className = '',
  childClassName = '',
  duration = 800,
  distance = 50,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, idx) => (
        <ScrollMotion
          animation={animation}
          delay={idx * staggerDelay}
          duration={duration}
          distance={distance}
          className={childClassName}
        >
          {child}
        </ScrollMotion>
      ))}
    </div>
  )
}

/**
 * ScrollCounter — Animated number counter triggered by scroll.
 */
interface ScrollCounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export const ScrollCounter: React.FC<ScrollCounterProps> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [started, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export default ScrollMotion
