import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface HarvicsKPICardProps {
  label: string
  value: string | number
  change?: number
  changePeriod?: string
}

export const HarvicsKPICard: React.FC<HarvicsKPICardProps> = ({
  label,
  value,
  change,
  changePeriod,
}) => {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className="relative overflow-hidden flex-1 min-w-[200px] h-[84px] rounded-xl border border-harvics-goldDivider bg-harvics-burgundy shadow-[0_4px_20px_rgba(61, 18, 18,0.6)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-harvics-gold to-transparent" />
      <div className="p-4 h-full flex flex-col justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-muted">{label}</div>
        <div className="flex items-end justify-between">
          <div className="text-[24px] font-black text-harvics-cream leading-none tabular-nums">{value}</div>
          {change !== undefined && (
            <div className="flex flex-col items-end gap-0.5">
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-harvics-muted'}`}>
                {isPositive && <TrendingUp size={10} />}
                {isNegative && <TrendingDown size={10} />}
                {!isPositive && !isNegative && <Minus size={10} />}
                {Math.abs(change)}%
              </div>
              {changePeriod && <div className="text-[9px] text-harvics-muted">{changePeriod}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
