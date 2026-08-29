import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { getHarvyxConciergeUrl } from '@/lib/harvyx-concierge'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata = {
  title: 'HarvyX Concierge — Elite Executive Assistant | Harvics Apps',
  description:
    'Elite AI concierge for executives — voice and text, flights, hotels, transfers, itineraries, and secure handoff. Login required.',
}

function clerkOn() {
  return Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '').trim() &&
      (process.env.CLERK_SECRET_KEY || '').trim(),
  )
}

export default async function HarvyxConciergePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const launchUrl = getHarvyxConciergeUrl()
  const returnPath = `/${locale}/apps/harvyx-concierge`

  if (clerkOn()) {
    const session = await auth()
    if (!session?.userId) {
      redirect(`/app/sign-in?redirect_url=${encodeURIComponent(returnPath)}`)
    }
  }

  return (
    <main className="fixed inset-0 z-[80] bg-black flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-harvics-gold/20 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] text-harvics-gold font-bold">
            Harvics · Elite Concierge · Secured
          </p>
          <h1 className="text-sm md:text-base font-semibold text-white truncate">
            HarvyX Concierge
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center justify-center px-4 py-2 border border-harvics-gold/40 text-harvics-gold text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-colors"
          >
            ← Apps
          </Link>
          <a
            href={launchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-harvics-gold text-[#1a0d00] text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
          >
            Full Screen
          </a>
        </div>
      </header>
      <iframe
        title="HarvyX Concierge"
        src={launchUrl}
        className="flex-1 w-full border-0 bg-black"
        allow="microphone; camera; clipboard-write; autoplay; fullscreen"
        referrerPolicy="no-referrer"
      />
    </main>
  )
}
