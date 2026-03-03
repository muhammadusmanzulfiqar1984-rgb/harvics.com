'use client'

import React from 'react'

interface SectionCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
}

export default function SectionCard({ 
  title, 
  subtitle, 
  children, 
  className = '',
  headerActions 
}: SectionCardProps) {
  return (
    <section className={`space-y-4 rounded-lg border border-black200 bg-white p-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-black100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          {subtitle && (
            <p className="text-sm text-black mt-1">{subtitle}</p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>
      <div className="pt-2">
        {children}
      </div>
    </section>
  )
}

