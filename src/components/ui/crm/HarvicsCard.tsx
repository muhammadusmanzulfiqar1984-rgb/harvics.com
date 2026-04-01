import React from 'react';

export interface AISuggestion {
  id: string;
  text: string;
  highlights?: Array<{ word: string; color: string }>;
}

export interface HarvicsCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
}

export const HarvicsCard: React.FC<HarvicsCardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  className = '',
}) => {
  const padMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        bg-[#0f172a]/95 
        border border-[rgba(75,85,99,0.5)] 
        rounded-[10px] 
        shadow-[0_15px_30px_rgba(0,0,0,0.35)]
        backdrop-blur-md
        transition-all duration-150
        hover:bg-[#0f172a]/85 hover:border-[rgba(100,120,160,0.5)]
        overflow-hidden
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-[rgba(75,85,99,0.5)]">
          <div>
            {title && <h3 className="text-[#e2e8f0] font-bold text-[20px] font-['DM_Sans']">{title}</h3>}
            {subtitle && <p className="text-[#94a3b8] text-[12px] mt-1 font-['DM_Sans']">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={padMap[padding]}>{children}</div>
    </div>
  );
};
