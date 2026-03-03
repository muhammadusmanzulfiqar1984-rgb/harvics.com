'use client'

import OSLayoutShell from '@/components/os-domains/OSLayoutShell'
import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'
import { useLocale } from 'next-intl'

export default function ImportExportOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const allowedRoles: UserRole[] = ['admin', 'super_admin', 'hq', 'import_export_admin']
  
  const navigation: Array<{
    label: string
    href?: string
    icon: string
    children?: Array<{ label: string; href: string }>
  }> = [
    {
      label: 'Dashboard',
      href: `/${locale}/os/import/dashboard`,
      icon: '📊'
    },
    {
      label: 'Import Orders',
      children: [
        { label: 'Order List', href: `/${locale}/os/import/orders` },
        { label: 'New Import Order', href: `/${locale}/os/import/orders/new` }
      ],
      icon: '📥'
    },
    {
      label: 'Export Orders',
      children: [
        { label: 'Order List', href: `/${locale}/os/export/orders` },
        { label: 'New Export Order', href: `/${locale}/os/export/orders/new` }
      ],
      icon: '📤'
    },
    {
      label: 'Customs',
      children: [
        { label: 'Customs Clearance', href: `/${locale}/os/import/customs` },
        { label: 'Customs Documents', href: `/${locale}/os/import/customs/documents` }
      ],
      icon: '🏛️'
    },
    {
      label: 'Trade Documents',
      children: [
        { label: 'Document List', href: `/${locale}/os/import/documents` },
        { label: 'Document Templates', href: `/${locale}/os/import/documents/templates` }
      ],
      icon: '📄'
    },
    {
      label: 'Settings',
      href: `/${locale}/os/import/settings`,
      icon: '⚙️'
    }
  ]
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <OSLayoutShell
        domainName="Import/Export OS"
        domainIcon="📦"
        navigation={navigation}
        allowedRoles={allowedRoles}
      >
        {children}
      </OSLayoutShell>
    </AuthGuard>
  )
}
