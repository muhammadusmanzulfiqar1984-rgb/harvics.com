import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function clerkOn() {
  return Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '').trim() &&
      (process.env.CLERK_SECRET_KEY || '').trim(),
  )
}

/**
 * /en/harvyx entry:
 * - signed in → console
 * - signed out → /app/sign-in (Clerk app UI, site theme — avoids locale ErrorBoundary crash)
 */
export default async function HarvyXAppEntryPage() {
  const consolePath = '/harvyx.html'
  const signIn = `/app/sign-in?redirect_url=${encodeURIComponent(consolePath)}`

  if (clerkOn()) {
    try {
      const session = await auth()
      if (session?.userId) {
        redirect(consolePath)
      }
    } catch {
      /* fall through to sign-in */
    }
    redirect(signIn)
  }

  redirect(consolePath)
}
