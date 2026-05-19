'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

export default function ReportsIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <EmptyState
        icon={FileText}
        title="Business Reports"
        description="Comprehensive analytics, performance metrics, and strategic insights across all HARVICS modules."
        action={{
          label: 'View Analytics',
          href: '/en/reports/analytics',
        }}
      />
    </div>
  );
}
