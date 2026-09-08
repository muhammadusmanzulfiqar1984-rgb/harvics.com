import PreJoin from '@/components/meeting/PreJoin'
import { getMeetingById } from '@/lib/meetings'

export default async function PreJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ meetingId: string }>
  searchParams: Promise<{ host?: string; token?: string }>
}) {
  const { meetingId } = await params
  const sp = await searchParams
  const meeting = await getMeetingById(meetingId)

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-10">
      <PreJoin
        meetingId={meetingId}
        inviteToken={sp.token}
        asHost={sp.host === '1'}
        title={meeting?.title}
      />
    </main>
  )
}
