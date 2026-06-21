import React from 'react'

export interface AISuggestion {
  id: string
  text: string
  highlights?: Array<{ word: string; color: string }>
}

export interface HarvicsCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
  className?: string
}

const PAD = { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export const HarvicsCard: React.FC<HarvicsCardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  className = '',
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-harvics-burgundy border border-harvics-goldDivider shadow-[0_4px_24px_rgba(26,5,5,0.5)] transition-all duration-150 ${className}`}
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-harvics-gold/50 to-transparent" />
    {(title || actions) && (
      <div className="flex justify-between items-center px-4 py-3 border-b border-harvics-goldDivider">
        <div>
          {title && <h3 className="text-[15px] font-black text-harvics-cream tracking-tight">{title}</h3>}
          {subtitle && <p className="text-[11px] text-harvics-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    <div className={PAD[padding]}>{children}</div>
  </div>
)
