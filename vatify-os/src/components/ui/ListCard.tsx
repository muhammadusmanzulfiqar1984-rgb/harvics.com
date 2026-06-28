import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ListCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export const ListCard = ({ icon, label, sublabel, onClick, rightElement, className }: ListCardProps) => {
  return (
    <motion.button
      whileHover={onClick ? { scale: 1.01, x: 4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left",
        onClick ? "hover:bg-white hover:shadow-sm border border-transparent hover:border-brand-gold/10" : "bg-white/30 border border-brand-gold/5",
        className
      )}
    >
      <div className="w-12 h-12 bg-brand-paper rounded-xl flex items-center justify-center text-brand-maroon shrink-0">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })}
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold tracking-tight truncate">{label}</h4>
        {sublabel && <p className="text-[10px] font-medium uppercase tracking-wider text-brand-gold truncate">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {rightElement}
        {onClick && <ChevronRight size={16} className="text-brand-gold/40" />}
      </div>
    </motion.button>
  );
};
