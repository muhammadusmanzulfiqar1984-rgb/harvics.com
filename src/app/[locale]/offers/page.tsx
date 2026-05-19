'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { Gift } from 'lucide-react';

export default function OffersIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{
      backgroundImage: 'url(\'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=2000&h=1080&q=80\')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <EmptyState
        icon={Gift}
        title="Exclusive Offers"
        description="Browse our latest promotions, seasonal deals, and loyalty rewards. View available offers from our product lines."
        action={{
          label: 'View Promotions',
          href: '/en/offers/promotions',
        }}
        />
      </div>
    </div>
  );
}
