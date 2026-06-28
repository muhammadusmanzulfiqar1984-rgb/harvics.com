import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export const StatCard = ({ label, value, subtext, highlight, icon }: StatCardProps) => {
  return (
    <Card 
      variant={highlight ? 'default' : 'outline'} 
      className={highlight ? 'bg-brand-maroon text-white border-none' : ''}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className={highlight ? 'text-brand-gold/80 text-[10px] font-bold uppercase tracking-widest' : 'text-brand-gold text-[10px] font-bold uppercase tracking-widest'}>
            {label}
          </p>
          <h4 className="text-3xl font-serif font-medium tracking-tight">
            {value}
          </h4>
        </div>
        {icon && (
          <div className={highlight ? 'text-brand-gold/40' : 'text-brand-gold/20'}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 24 })}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Badge variant={highlight ? 'secondary' : 'primary'} className="px-2 py-0.5">
          {subtext}
        </Badge>
      </div>
    </Card>
  );
};
