'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { DollarSign } from 'lucide-react';

export default function MoneyIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{
      backgroundImage: 'url(\'https://images.unsplash.com/photo-1606152407867-696051a672e2?auto=format&fit=crop&w=2000&h=1080&q=80\')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <EmptyState
        icon={DollarSign}
        title="Currency & Forex"
        description="Real-time exchange rates, currency conversions, and financial market data across 42+ regions."
        action={{
          label: 'View Exchange Rates',
          href: '/en/money/exchange-rates',
        }}
        />
      </div>
    </div>
  );
}
