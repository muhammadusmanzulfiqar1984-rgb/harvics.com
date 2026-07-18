'use client'

import dynamic from 'next/dynamic'
import OpsAccessGate from '@/components/auth/OpsAccessGate'
import { MEET_NAME } from '@/data/meetAccess'

const MeetRoom = dynamic(() => import('./MeetRoom'), {
  ssr: false,
  loading: () => (
    <main
      className="min-h-screen pt-[136px] flex items-center justify-center"
      style={{ background: '#0a0808' }}
    >
      <p className="text-sm uppercase tracking-[0.2em] text-harvics-gold/70">Loading meeting…</p>
    </main>
  ),
})

export default function MeetRoomClient({
  meetingId,
  locale,
}: {
  meetingId: string
  locale: string
}) {
  return (
    <OpsAccessGate
      title={MEET_NAME}
      subtitle="Enter the ops access code to join this meeting room."
    >
      <MeetRoom meetingId={meetingId} locale={locale} />
    </OpsAccessGate>
  )
}
