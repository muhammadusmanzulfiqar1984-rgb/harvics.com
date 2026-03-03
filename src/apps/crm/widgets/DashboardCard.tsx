'use client'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: 'green' | 'red' | 'gold'
}

const accentMap: Record<NonNullable<DashboardCardProps['accent']>, { text: string; border: string; bg: string }> = {
  green: {
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50'
  },
  red: {
    text: 'text-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50'
  },
  gold: {
    text: 'text-[#ffffff]',
    border: 'border-[#ffffff]/30',
    bg: 'bg-[#ffffff]/5'
  },
}

export const DashboardCard = ({ title, value, subtitle, accent = 'gold' }: DashboardCardProps) => {
  const accentStyles = accentMap[accent]
  
  return (
    <div className={`bg-white rounded-lg border ${accentStyles.border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-5 group hover:border-[#ffffff]/50`}>
      <span className="text-[11px] uppercase tracking-wider text-black/60 mb-3 font-medium">{title}</span>
      <span className={`text-3xl font-semibold ${accentStyles.text} mb-2 leading-tight`}>{value}</span>
      {subtitle && (
        <span className="text-xs text-black/50 mt-auto leading-relaxed">{subtitle}</span>
      )}
    </div>
  )
}

