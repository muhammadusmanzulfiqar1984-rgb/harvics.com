'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import '@livekit/components-styles'

const LiveInner = dynamic(() => import('./MeetingRoomLive'), { ssr: false })

export default function MeetingRoom({ meetingId }: { meetingId: string }) {
  const [token, setToken] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    setToken(sessionStorage.getItem(`meet_token_${meetingId}`) || '')
    setUrl(sessionStorage.getItem(`meet_url_${meetingId}`) || '')
  }, [meetingId])

  if (!token || !url) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-white/50">
        Missing room token. Open pre-join first.
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <LiveInner token={token} serverUrl={url} meetingId={meetingId} />
    </div>
  )
}
