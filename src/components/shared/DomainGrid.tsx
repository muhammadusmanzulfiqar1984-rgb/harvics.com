'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export interface DomainItem {
  id: string
  label: string
  description: string
  href: string
  icon?: string
  meta?: string
}

interface DomainGridProps {
  domains: DomainItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export default function DomainGrid({ 
  domains, 
  columns = 3,
  className = '' 
}: DomainGridProps) {
  const locale = useLocale()

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {domains.map((domain) => {
        const href = domain.href.startsWith('/') 
          ? `/${locale}${domain.href}`
          : `/${locale}/${domain.href}`

        return (
          <Link
            key={domain.id}
            href={href}
            className="group p-5 rounded-lg border border-black200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              {domain.icon && (
                <span className="text-3xl">{domain.icon}</span>
              )}
              <svg
                className="w-5 h-5 text-black opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-black mb-2 group-hover:text-[#440000] transition-colors">
              {domain.label}
            </h4>
            <p className="text-sm text-black mb-3 line-clamp-2">
              {domain.description}
            </p>
            {domain.meta && (
              <p className="text-xs text-black opacity-70 mb-3">
                {domain.meta}
              </p>
            )}
            <span className="text-sm font-medium text-[#F5C542] group-hover:underline">
              Open →
            </span>
          </Link>
        )
      })}
    </div>
  )
}

