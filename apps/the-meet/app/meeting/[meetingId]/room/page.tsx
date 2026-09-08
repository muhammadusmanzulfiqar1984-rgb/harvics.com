'use client'

import MeetingRoom from '@/components/meeting/MeetingRoom'
import { use } from 'react'

export default function RoomPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = use(params)
  return <MeetingRoom meetingId={meetingId} />
}
