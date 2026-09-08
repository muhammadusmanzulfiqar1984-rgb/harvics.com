'use client'

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react'
import { useRouter } from 'next/navigation'

export default function MeetingRoomLive({
  token,
  serverUrl,
  meetingId,
}: {
  token: string
  serverUrl: string
  meetingId: string
}) {
  const router = useRouter()
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      video
      audio
      data-lk-theme="default"
      style={{ height: '100%' }}
      onDisconnected={() => router.push(`/post-meeting/${meetingId}`)}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
