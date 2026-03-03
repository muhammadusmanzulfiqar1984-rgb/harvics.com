/**
 * UI Enhancement Utilities
 * Common classes and utilities for consistent UI improvements
 */

// Standard hover states for interactive elements
export const hoverStates = {
  link: 'transition-all duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded px-1',
  button: 'transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
  card: 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
  navLink: 'transition-all duration-200 hover:text-black hover:border-black300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded-t'
}

// Loading state classes
export const loadingStates = {
  skeleton: 'loading-skeleton animate-pulse bg-white',
  spinner: 'inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin',
  dots: 'inline-flex gap-1',
  pulse: 'animate-pulse'
}

// Focus visible styles for keyboard navigation
export const focusVisible = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden'

// Text rendering improvements
export const textRendering = {
  normal: 'normal-case tracking-normal',
  uppercase: 'uppercase tracking-wider',
  wide: 'tracking-wider',
  widest: 'tracking-widest'
}

// Responsive text sizing
export const responsiveText = {
  heading: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  subheading: 'text-xl sm:text-2xl md:text-3xl',
  body: 'text-sm sm:text-base md:text-lg',
  small: 'text-xs sm:text-sm'
}

// Animation delays for staggered animations
export const animationDelays = {
  delay1: 'animation-delay-100',
  delay2: 'animation-delay-200',
  delay3: 'animation-delay-300',
  delay4: 'animation-delay-400',
  delay5: 'animation-delay-500'
}

