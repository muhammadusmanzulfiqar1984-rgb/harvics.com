import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'

export default function GPSTrackingOSLayout({ children }: { children: React.ReactNode }) {
  const allowedRoles: UserRole[] = ['admin', 'super_admin', 'hq', 'country_manager', 'company_admin']
  return <AuthGuard allowedRoles={allowedRoles}>{children}</AuthGuard>
}
