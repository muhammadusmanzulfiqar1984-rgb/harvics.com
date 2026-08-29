import { ClerkProvider } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

/** Clerk only under /[locale]/harvyx/* — not the rest of the marketing site. */
export default function HarvyXLocaleLayout({ children }: { children: React.ReactNode }) {
  const pk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || ''

  if (!pk) return children
  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>
}
