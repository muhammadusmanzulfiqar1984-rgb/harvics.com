'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function CompetitorIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{
      backgroundImage: 'url(\'https://images.unsplash.com/photo-1460925895917-aeb19d518758?auto=format&fit=crop&w=2000&h=1080&q=80\')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <EmptyState
        icon={BarChart3}
        title="Competitor Intelligence"
        description="Analyze market trends, competitor positioning, and industry benchmarks. Access competitive intelligence dashboards."
        action={{
          label: 'View Dashboard',
          href: '/en/competitor/dashboard',
        }}
        />
      </div>
    </div>
  );
}
