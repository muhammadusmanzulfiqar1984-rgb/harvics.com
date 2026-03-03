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
  const allowedRoles: UserRole[] = ['admin', 'super_admin', 'hq', 'country_manager', 'gps_admin']
  
  const navigation: Array<{
    label: string
    href?: string
    icon: string
    children?: Array<{ label: string; href: string }>
  }> = [
    {
      label: 'Dashboard',
      href: `/${locale}/os/logistics/gps`,
      icon: '📊'
    },
    {
      label: 'Real-Time Tracking',
      children: [
        { label: 'Live Map', href: `/${locale}/os/logistics/gps` },
        { label: 'Vehicle List', href: `/${locale}/os/logistics/gps/vehicles` }
      ],
      icon: '📍'
    },
    {
      label: 'Routes',
      children: [
        { label: 'Route List', href: `/${locale}/os/logistics/routes` },
        { label: 'Route Planning', href: `/${locale}/os/logistics/routes/planning` },
        { label: 'Route Analytics', href: `/${locale}/os/logistics/routes/analytics` }
      ],
      icon: '🗺️'
    },
    {
      label: 'Fleet',
      children: [
        { label: 'Vehicle List', href: `/${locale}/os/logistics/fleet` },
        { label: 'Vehicle Details', href: `/${locale}/os/logistics/fleet/details` },
        { label: 'Fleet Analytics', href: `/${locale}/os/logistics/fleet/analytics` }
      ],
      icon: '🚛'
    },
    {
      label: 'Map',
      href: `/${locale}/os/logistics/map`,
      icon: '🗺️'
    },
    {
      label: 'Analytics',
      href: `/${locale}/os/logistics/analytics`,
      icon: '📈'
    },
    {
      label: 'Settings',
      href: `/${locale}/os/logistics/gps/settings`,
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

