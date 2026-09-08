import WaitingRoom from '@/components/meeting/WaitingRoom'
import { getMeetingById } from '@/lib/meetings'

export default async function WaitingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>
}) {
  const { meetingId } = await params
  const meeting = await getMeetingById(meetingId)
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-10">
      <WaitingRoom meetingId={meetingId} title={meeting?.title} />
    </main>
  )
}
