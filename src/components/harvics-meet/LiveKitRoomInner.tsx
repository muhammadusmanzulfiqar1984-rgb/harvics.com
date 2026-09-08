'use client'

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react'

export default function LiveKitRoomInner({
  token,
  serverUrl,
  onLeave,
}: {
  token: string
  serverUrl: string
  onLeave: () => void
}) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      video
      audio
      onDisconnected={onLeave}
      style={{ height: '100%' }}
      data-lk-theme="default"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
