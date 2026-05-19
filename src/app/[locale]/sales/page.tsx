'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';

export default function SalesIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{
      backgroundImage: 'url(\'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&h=1080&q=80\')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <EmptyState
        icon={TrendingUp}
        title="Sales Performance"
        description="Track sales metrics, pipeline analysis, and revenue trends across territories and product lines."
        action={{
          label: 'View Sales Dashboard',
          href: '/en/sales/current-sales',
        }}
        />
      </div>
    </div>
  );
}
