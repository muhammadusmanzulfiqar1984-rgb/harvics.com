import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'HarvyX Console',
  description: 'HarvyX operator console',
}

function clerkOn() {
  return Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '').trim() &&
      (process.env.CLERK_SECRET_KEY || '').trim(),
  )
}

/** Authenticated entry → full-screen Growth OS (avoids marketing chrome + iframe CSP). */
export default async function HarvyXConsolePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (clerkOn()) {
    try {
      const session = await auth()
      if (!session?.userId) {
        redirect(`/app/sign-in?redirect_url=/harvyx.html`)
      }
    } catch {
      redirect(`/app/sign-in?redirect_url=/harvyx.html`)
    }
  }

  redirect('/harvyx.html')
}
