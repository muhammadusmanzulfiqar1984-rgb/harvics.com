import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'

export default function CompetitorIntelOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const allowedRoles: UserRole[] = ['admin', 'super_admin', 'hq', 'country_manager']
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      {children}
    </AuthGuard>
  )
}

