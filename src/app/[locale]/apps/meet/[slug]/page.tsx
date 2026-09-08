import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import MeetRoomShell from '@/components/harvics-meet/MeetRoomShell'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function HarvicsMeetRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ token?: string; host?: string }>
}) {
  const { locale, slug } = await params
  const q = await searchParams

  return (
    <main className="min-h-screen bg-[#0a0808] px-4 py-16 text-white md:py-24">
      <MeetRoomShell
        locale={locale}
        slug={slug}
        inviteToken={q.token}
        asHost={q.host === '1' || q.host === 'true'}
      />
    </main>
  )
}
