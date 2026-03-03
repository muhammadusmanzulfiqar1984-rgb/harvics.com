'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { getTierColors } from '@/config/tier-colors'

interface TierBreadcrumbProps {
  tier0?: { label: string; href?: string }
  tier1?: { label: string; href?: string }
  tier2?: { label: string; href?: string }
  tier3?: { label: string; href?: string }
  tier4?: { label: string; href?: string }
  currentTier?: '0' | '1' | '2' | '3' | '4'
}

export default function TierBreadcrumb({
  tier0,
  tier1,
  tier2,
  tier3,
  tier4,
  currentTier = '1'
}: TierBreadcrumbProps) {
  const locale = useLocale()
  const pathname = usePathname()

  const breadcrumbs = []
  
  // Tier 0: Foundational Engines
  if (tier0) {
    breadcrumbs.push({
      label: tier0.label,
      href: tier0.href || `/${locale}/os/tier0`,
      tier: '0'
    })
  }

  // Tier 1: OS Domain
  if (tier1) {
    breadcrumbs.push({
      label: tier1.label,
      href: tier1.href,
      tier: '1'
    })
  }

  // Tier 2: Module
  if (tier2) {
    breadcrumbs.push({
      label: tier2.label,
      href: tier2.href,
      tier: '2'
    })
  }

  // Tier 3: Screen
  if (tier3) {
    breadcrumbs.push({
      label: tier3.label,
      href: tier3.href,
      tier: '3'
    })
  }

  // Tier 4: Action
  if (tier4) {
    breadcrumbs.push({
      label: tier4.label,
      href: tier4.href,
      tier: '4'
    })
  }

  const getTierBadge = (tier: string) => {
    const tierColors = getTierColors(tier as '0' | '1' | '2' | '3' | '4')
    return {
      label: `Tier ${tier}`,
      bg: tierColors.bg,
      text: tierColors.text,
      border: tierColors.border
    }
  }

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="mb-4 flex items-center gap-2 text-sm bg-white/50 border border-[#C3A35E]/30 rounded-lg px-4 py-2" aria-label="Tier navigation breadcrumb">
      <div className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const tierBadge = getTierBadge(crumb.tier)
          
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-[#6B1F2B]/40 mx-1">/</span>
              )}
              {isLast ? (
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: tierBadge.bg,
                      color: tierBadge.text
                    }}
                  >
                    {tierBadge.label}
                  </span>
                  <span className="font-bold text-[#6B1F2B]">{crumb.label}</span>
                </div>
              ) : (
                <Link
                  href={crumb.href || '#'}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: tierBadge.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C3A35E'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = tierBadge.text
                  }}
                >
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: tierBadge.bg,
                      color: tierBadge.text
                    }}
                  >
                    {tierBadge.label}
                  </span>
                  <span className="text-[#6B1F2B]/70 hover:text-[#6B1F2B] font-medium">{crumb.label}</span>
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}

