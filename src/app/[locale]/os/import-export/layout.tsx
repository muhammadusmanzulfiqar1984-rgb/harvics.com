import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'

export default function ImportExportOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const allowedRoles: UserRole[] = ['import_export_admin', 'admin', 'super_admin', 'hq']
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      {children}
    </AuthGuard>
  )
}

