'use client'

import Link from 'next/link'

export default function WaitingRoom({ meetingId, title }: { meetingId: string; title?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-meet-border bg-meet-panel p-8 text-center">
      <h1 className="text-xl font-semibold">Waiting room</h1>
      <p className="mt-2 text-sm text-white/60">{title || 'Meeting'}</p>
      <p className="mt-4 text-sm text-white/50">The host will let you in shortly.</p>
      <Link href={`/meeting/${meetingId}/prejoin`} className="mt-6 inline-block text-sm text-meet-gold hover:underline">
        ← Back to pre-join
      </Link>
    </div>
  )
}
