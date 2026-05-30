'use client'

import React from 'react'
import Link from 'next/link'

interface TierBreadcrumbProps {
  tier0?: { label: string; href?: string }
  tier1?: { label: string; href?: string }
  tier2?: { label: string; href?: string }
  tier3?: { label: string; href?: string }
  tier4?: { label: string; href?: string }
  currentTier?: '0' | '1' | '2' | '3' | '4'
}

export default function TierBreadcrumb({
  tier0, tier1, tier2, tier3, tier4
}: TierBreadcrumbProps) {
  const crumbs = [tier0, tier1, tier2, tier3, tier4].filter(Boolean) as { label: string; href?: string }[]
  if (crumbs.length === 0) return null

  return (
    <nav className="mb-4 flex items-center gap-1.5 text-xs text-[#8E8E93]" aria-label="Tier navigation breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-[#C7C7CC]">/</span>}
            {isLast || !crumb.href ? (
              <span className={`font-medium ${isLast ? 'text-[#1A1A1A]' : 'text-[#8E8E93]'}`}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-[#1A1A1A] transition-colors">{crumb.label}</Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
