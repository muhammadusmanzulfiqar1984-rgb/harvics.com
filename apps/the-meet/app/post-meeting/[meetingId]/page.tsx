import Link from 'next/link'
import { getMeetingById } from '@/lib/meetings'

export default async function PostMeetingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>
}) {
  const { meetingId } = await params
  const meeting = await getMeetingById(meetingId)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Post-meeting</p>
      <h1 className="mt-1 text-2xl font-semibold">{meeting?.title || 'Meeting ended'}</h1>
      <p className="mt-3 text-sm text-white/55">
        Recording, transcript, and AI summary will appear here when configured (Deepgram + OpenAI + R2).
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-meet-border bg-meet-panel p-4 text-sm text-white/50">
          Transcript — pending
        </div>
        <div className="rounded-xl border border-meet-border bg-meet-panel p-4 text-sm text-white/50">
          Summary — pending
        </div>
      </div>
      <Link href="/dashboard" className="mt-8 inline-block text-sm text-meet-gold hover:underline">
        ← Back to dashboard
      </Link>
    </main>
  )
}
