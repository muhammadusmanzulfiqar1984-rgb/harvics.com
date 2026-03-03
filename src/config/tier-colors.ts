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
    // Tier 0: Purple - Foundational Engines
    primary: '#9333ea',        // Purple 600
    primaryDark: '#7e22ce',    // Purple 700
    primaryLight: '#a855f7',   // Purple 500
    bg: '#f3e8ff',             // Purple 100
    bgHover: '#e9d5ff',        // Purple 200
    border: '#9333ea',         // Purple 600
    text: '#581c87',           // Purple 900
    textActive: '#7e22ce',     // Purple 700
    badge: '#a855f7'           // Purple 500
  },
  '1': {
    // Tier 1: Blue - OS Domains
    primary: '#2563eb',        // Blue 600
    primaryDark: '#1d4ed8',    // Blue 700
    primaryLight: '#3b82f6',   // Blue 500
    bg: '#dbeafe',             // Blue 100
    bgHover: '#bfdbfe',        // Blue 200
    border: '#2563eb',         // Blue 600
    text: '#1e40af',           // Blue 900
    textActive: '#1d4ed8',     // Blue 700
    badge: '#3b82f6'           // Blue 500
  },
  '2': {
    // Tier 2: Green - Modules
    primary: '#16a34a',        // Green 600
    primaryDark: '#15803d',    // Green 700
    primaryLight: '#22c55e',   // Green 500
    bg: '#dcfce7',             // Green 100
    bgHover: '#bbf7d0',        // Green 200
    border: '#16a34a',         // Green 600
    text: '#14532d',           // Green 900
    textActive: '#15803d',     // Green 700
    badge: '#22c55e'           // Green 500
  },
  '3': {
    // Tier 3: Gold/Yellow - Screens (using Harvics brand gold)
    primary: '#C3A35E',        // Harvics Gold
    primaryDark: '#C3A35E',    // Dark Goldenrod
    primaryLight: '#F5C542',   // Light Gold
    bg: '#fef9c3',             // Yellow 100
    bgHover: '#fef08a',        // Yellow 200
    border: '#C3A35E',         // Harvics Gold
    text: '#713f12',           // Yellow 900
    textActive: '#C3A35E',     // Dark Goldenrod
    badge: '#F5C542'           // Light Gold
  },
  '4': {
    // Tier 4: Orange - Actions
    primary: '#ea580c',        // Orange 600
    primaryDark: '#c2410c',    // Orange 700
    primaryLight: '#f97316',   // Orange 500
    bg: '#ffedd5',             // Orange 100
    bgHover: '#fed7aa',        // Orange 200
    border: '#ea580c',         // Orange 600
    text: '#7c2d12',           // Orange 900
    textActive: '#c2410c',     // Orange 700
    badge: '#f97316'           // Orange 500
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

