/**
 * Accessibility Utilities for Harvics Website
 * Provides consistent accessibility improvements across all components
 */

// Common ARIA labels for reusable elements
export const ariaLabels = {
  menu: 'Menu',
  close: 'Close',
  search: 'Search',
  cart: 'Shopping Cart',
  wishlist: 'Wishlist',
  language: 'Change Language',
  country: 'Change Country',
  theme: 'Toggle Dark Mode',
  contact: 'Contact Us',
  more: 'Learn More',
  next: 'Next',
  previous: 'Previous',
  loading: 'Loading',
  error: 'Error',
  success: 'Success'
}

// Keyboard navigation helpers
export const handleKeyboardNavigation = (
  e: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onEnter?.()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    onEscape?.()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    onArrowUp?.()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    onArrowDown?.()
  }
}

// Focus management utilities
export const trapFocus = (element: HTMLElement | null) => {
  if (!element) return

  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTab)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTab)
  }
}

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

