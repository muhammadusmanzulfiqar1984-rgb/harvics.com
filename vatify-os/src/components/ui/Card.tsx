import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'outline' | 'glass';
}

export const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white shadow-sm border border-brand-gold/10',
    outline: 'border border-brand-maroon/10 bg-transparent',
    glass: 'bg-white/50 backdrop-blur-md border border-white/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-3xl p-6',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
