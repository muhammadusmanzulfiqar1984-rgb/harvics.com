import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'

export default function LegalOSLayout({ children }: { children: React.ReactNode }) {
  const allowedRoles: UserRole[] = ['legal_admin', 'admin', 'super_admin', 'hq', 'company_admin']
  return <AuthGuard allowedRoles={allowedRoles}>{children}</AuthGuard>
}
