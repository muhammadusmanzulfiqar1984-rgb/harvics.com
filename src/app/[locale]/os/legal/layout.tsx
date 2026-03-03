'use client'

import OSLayoutShell from '@/components/os-domains/OSLayoutShell'
import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'
import { useLocale } from 'next-intl'

export default function LegalOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const allowedRoles: UserRole[] = ['legal_admin', 'admin', 'super_admin']
  
  const navigation: Array<{
    label: string
    href?: string
    icon: string
    children?: Array<{ label: string; href: string }>
  }> = [
    {
      label: 'Dashboard',
      href: `/${locale}/os/legal`,
      icon: '📊'
    },
    {
      label: 'IPR Management',
      children: [
        { label: 'Trademarks', href: `/${locale}/os/legal/trademarks` },
        { label: 'Patents', href: `/${locale}/os/legal/patents` },
        { label: 'Copyrights', href: `/${locale}/os/legal/copyrights` }
      ],
      icon: '™️'
    },
    {
      label: 'Contracts',
      children: [
        { label: 'Contract List', href: `/${locale}/os/legal/contracts` },
        { label: 'Contract Templates', href: `/${locale}/os/legal/contracts/templates` }
      ],
      icon: '📄'
    },
    {
      label: 'Cases',
      children: [
        { label: 'Case List', href: `/${locale}/os/legal/cases` },
        { label: 'Case Details', href: `/${locale}/os/legal/cases/details` }
      ],
      icon: '⚖️'
    },
    {
      label: 'Compliance',
      children: [
        { label: 'Compliance Checklist', href: `/${locale}/os/legal/compliance` },
        { label: 'Compliance Reports', href: `/${locale}/os/legal/compliance/reports` }
      ],
      icon: '✅'
    },
    {
      label: 'Counterfeit',
      children: [
        { label: 'Counterfeit Reports', href: `/${locale}/os/legal/counterfeit` },
        { label: 'Anti-Counterfeit Actions', href: `/${locale}/os/legal/counterfeit/actions` }
      ],
      icon: '🚫'
    },
    {
      label: 'Settings',
      href: `/${locale}/os/legal/settings`,
      icon: '⚙️'
    }
  ]
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <OSLayoutShell
        domainName="Legal OS"
        domainIcon="⚖️"
        navigation={navigation}
        allowedRoles={allowedRoles}
      >
        {children}
      </OSLayoutShell>
    </AuthGuard>
  )
}

