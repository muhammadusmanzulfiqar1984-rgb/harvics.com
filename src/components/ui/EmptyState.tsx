'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-[var(--harvics-gold)]/10 to-[var(--harvics-maroon)]/10">
        <Icon className="w-12 h-12 text-[var(--harvics-gold)]" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[var(--harvics-maroon)] mb-2">
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <a
          href={action.href}
          className="inline-block px-6 py-2 bg-[var(--harvics-maroon)] text-white rounded-lg hover:bg-[var(--harvics-maroon)]/90 transition-colors duration-200"
        >
          {action.label}
        </a>
      )}
    </div>
  );
};
