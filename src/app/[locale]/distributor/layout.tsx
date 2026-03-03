'use client'

import ErrorBoundary from '@/components/shared/ErrorBoundary'
import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'

export default function DistributorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <AuthGuard allowedRoles={['distributor']}>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  )
}

