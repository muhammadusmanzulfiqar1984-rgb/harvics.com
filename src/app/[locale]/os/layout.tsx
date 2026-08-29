import OsAppShell from '@/components/os/OsAppShell'

/**
 * One OS system chrome for all locale OS routes.
 * Domain pages no longer bring their own competing sidebars.
 */
export default function LocaleOsLayout({ children }: { children: React.ReactNode }) {
  return <OsAppShell>{children}</OsAppShell>
}
