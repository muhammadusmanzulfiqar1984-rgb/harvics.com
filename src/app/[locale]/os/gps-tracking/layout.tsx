'use client'

import OSLayoutShell from '@/components/os-domains/OSLayoutShell'
import AuthGuard from '@/components/shared/AuthGuard'
import { UserRole } from '@/types/userScope'
import { useLocale } from 'next-intl'

export default function GPSTrackingOSLayout({
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
      href: `/${locale}/os/gps-tracking`,
      icon: '📊'
    },
    {
      label: 'Real-Time Tracking',
      children: [
        { label: 'Live Map', href: `/${locale}/os/gps-tracking/map` },
        { label: 'Vehicle List', href: `/${locale}/os/gps-tracking/vehicles` }
      ],
      icon: '📍'
    },
    {
      label: 'Routes',
      children: [
        { label: 'Route List', href: `/${locale}/os/gps-tracking/routes` },
        { label: 'Route Planning', href: `/${locale}/os/gps-tracking/routes/planning` },
        { label: 'Route Analytics', href: `/${locale}/os/gps-tracking/routes/analytics` }
      ],
      icon: '🗺️'
    },
    {
      label: 'Fleet',
      children: [
        { label: 'Vehicle List', href: `/${locale}/os/gps-tracking/fleet` },
        { label: 'Fleet Analytics', href: `/${locale}/os/gps-tracking/fleet/analytics` }
      ],
      icon: '🚛'
    },
    {
      label: 'Settings',
      href: `/${locale}/os/gps-tracking/settings`,
      icon: '⚙️'
    }
  ]
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <OSLayoutShell
        domainName="GPS Tracking OS"
        domainIcon="📍"
        navigation={navigation}
        allowedRoles={allowedRoles}
      >
        {children}
      </OSLayoutShell>
    </AuthGuard>
  )
}

