/**
 * Unified Tier Color System
 * 
 * Consistent color scheme across all tiers for visual hierarchy:
 * - Tier 0: Purple (Foundational Engines)
 * - Tier 1: Blue (OS Domains)
 * - Tier 2: Green (Modules)
 * - Tier 3: Yellow/Gold (Screens)
 * - Tier 4: Orange (Actions)
 */

export type TierLevel = '0' | '1' | '2' | '3' | '4'

export interface TierColorScheme {
  // Main colors
  primary: string      // Main tier color
  primaryDark: string  // Darker variant
  primaryLight: string // Lighter variant
  bg: string          // Background color
  bgHover: string     // Hover background
  border: string      // Border color
  text: string        // Text color
  textActive: string  // Active text color
  badge: string       // Badge/indicator color
}

export const TIER_COLORS: Record<TierLevel, TierColorScheme> = {
  '0': {
    primary: 'var(--harvics-burgundy)',
    primaryDark: 'var(--harvics-dark)',
    primaryLight: 'var(--harvics-gold)',
    bg: 'var(--harvics-cream)',
    bgHover: 'var(--harvics-cream)',
    border: 'var(--harvics-burgundy)',
    text: 'var(--harvics-burgundy)',
    textActive: 'var(--harvics-dark)',
    badge: 'var(--harvics-gold)'
  },
  '1': {
    primary: 'var(--harvics-burgundy)',
    primaryDark: 'var(--harvics-dark)',
    primaryLight: 'var(--harvics-gold)',
    bg: 'var(--harvics-cream)',
    bgHover: 'var(--harvics-cream)',
    border: 'var(--harvics-burgundy)',
    text: 'var(--harvics-burgundy)',
    textActive: 'var(--harvics-dark)',
    badge: 'var(--harvics-gold)'
  },
  '2': {
    primary: 'var(--harvics-burgundy)',
    primaryDark: 'var(--harvics-dark)',
    primaryLight: 'var(--harvics-gold)',
    bg: 'var(--harvics-cream)',
    bgHover: 'var(--harvics-cream)',
    border: 'var(--harvics-burgundy)',
    text: 'var(--harvics-burgundy)',
    textActive: 'var(--harvics-dark)',
    badge: 'var(--harvics-gold)'
  },
  '3': {
    primary: 'var(--harvics-gold)',
    primaryDark: 'var(--harvics-burgundy)',
    primaryLight: 'var(--harvics-gold)',
    bg: 'var(--harvics-cream)',
    bgHover: 'var(--harvics-cream)',
    border: 'var(--harvics-gold)',
    text: 'var(--harvics-burgundy)',
    textActive: 'var(--harvics-gold)',
    badge: 'var(--harvics-gold)'
  },
  '4': {
    primary: 'var(--harvics-burgundy)',
    primaryDark: 'var(--harvics-dark)',
    primaryLight: 'var(--harvics-gold)',
    bg: 'var(--harvics-cream)',
    bgHover: 'var(--harvics-cream)',
    border: 'var(--harvics-burgundy)',
    text: 'var(--harvics-burgundy)',
    textActive: 'var(--harvics-dark)',
    badge: 'var(--harvics-gold)'
  }
}

/**
 * Get color scheme for a tier level
 */
export function getTierColors(tier: TierLevel): TierColorScheme {
  return TIER_COLORS[tier]
}

/**
 * Get CSS classes for tier styling
 */
export function getTierClasses(tier: TierLevel, isActive: boolean = false) {
  const colors = TIER_COLORS[tier]
  
  if (isActive) {
    return {
      container: `bg-gradient-to-r from-[${colors.primary}] to-[${colors.primaryDark}] text-white border-[${colors.border}]`,
      badge: `bg-[${colors.primaryLight}] text-[${colors.text}]`,
      text: `text-white`,
      border: `border-[${colors.border}]`
    }
  }
  
  return {
    container: `bg-[${colors.bg}] hover:bg-[${colors.bgHover}] text-[${colors.text}] border-[${colors.border}]`,
    badge: `bg-[${colors.bg}] text-[${colors.textActive}]`,
    text: `text-[${colors.text}] hover:text-[${colors.textActive}]`,
    border: `border-[${colors.border}]`
  }
}

