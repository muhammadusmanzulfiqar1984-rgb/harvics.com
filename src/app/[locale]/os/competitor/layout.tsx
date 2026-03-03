'use client'

import OSLayoutShell from '@/components/os-domains/OSLayoutShell'
import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'
import { useLocale } from 'next-intl'

export default function CompetitorIntelOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const allowedRoles: UserRole[] = ['admin', 'super_admin', 'hq', 'country_manager']
  
  const navigation: Array<{
    label: string
    href?: string
    icon: string
    children?: Array<{ label: string; href: string }>
  }> = [
    {
      label: 'Dashboard',
      href: `/${locale}/os/competitor/analysis`,
      icon: '📊'
    },
    {
      label: 'Product Tracking',
      children: [
        { label: 'Product List', href: `/${locale}/os/competitor/products` },
        { label: 'Product Comparison', href: `/${locale}/os/competitor/products/compare` },
        { label: 'Product Details', href: `/${locale}/os/competitor/products/details` }
      ],
      icon: '📦'
    },
    {
      label: 'Price Intelligence',
      children: [
        { label: 'Price Alerts', href: `/${locale}/os/competitor/pricing/alerts` },
        { label: 'Price Trends', href: `/${locale}/os/competitor/pricing/trends` },
        { label: 'Price Comparison', href: `/${locale}/os/competitor/pricing/compare` }
      ],
      icon: '💰'
    },
    {
      label: 'Market Analysis',
      children: [
        { label: 'Market Share', href: `/${locale}/os/competitor/market/share` },
        { label: 'Market Trends', href: `/${locale}/os/competitor/market/trends` },
        { label: 'Market Reports', href: `/${locale}/os/competitor/market/reports` }
      ],
      icon: '📈'
    },
    {
      label: 'Competitors',
      children: [
        { label: 'Competitor List', href: `/${locale}/os/competitor/list` },
        { label: 'Competitor Profiles', href: `/${locale}/os/competitor/profiles` }
      ],
      icon: '🏢'
    },
    {
      label: 'Settings',
      href: `/${locale}/os/competitor/settings`,
      icon: '⚙️'
    }
  ]
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <OSLayoutShell
        domainName="Competitor Intelligence OS"
        domainIcon="🔍"
        navigation={navigation}
        allowedRoles={allowedRoles}
      >
        {children}
      </OSLayoutShell>
    </AuthGuard>
  )
}

