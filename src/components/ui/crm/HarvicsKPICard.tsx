import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface HarvicsKPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  accentColor?: string; // e.g. '#fbbf24' (gold), '#22c55e' (green)
  format?: 'number' | 'currency' | 'percent';
}

export const HarvicsKPICard: React.FC<HarvicsKPICardProps> = ({
  label,
  value,
  change,
  changePeriod,
  accentColor = '#1B3A6B',
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className="bg-[#0f172a]/95 border border-[rgba(75,85,99,0.5)] rounded-[10px] shadow-lg relative overflow-hidden flex-1 min-w-[200px] h-[80px] p-3 pl-4">
      {/* Top Accent Bar */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px]" 
        style={{ backgroundColor: accentColor }} 
      />
      
      <div className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mb-1 mt-1 font-['DM_Sans']">
        {label}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-[26px] font-bold text-white font-serif tracking-tight leading-none text-shadow-sm">
          {value}
        </div>
        
        {change !== undefined && (
          <div className="flex flex-col items-end">
            <div className={`flex items-center text-[10px] font-bold ${isPositive ? 'text-[#22c55e]' : isNegative ? 'text-[#ef4444]' : 'text-gray-400'}`}>
              {isPositive && <ArrowUpRight size={10} className="mr-0.5" />}
              {isNegative && <ArrowDownRight size={10} className="mr-0.5" />}
              {!isPositive && !isNegative && <Minus size={10} className="mr-0.5" />}
              {Math.abs(change)}%
            </div>
            {changePeriod && (
              <div className="text-[9px] text-[#475569]">{changePeriod}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
