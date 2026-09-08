import { AccessToken } from 'livekit-server-sdk'

export function livekitConfigured() {
  return Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET)
}

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
  const apiKey = process.env.LIVEKIT_API_KEY || ''
  const apiSecret = process.env.LIVEKIT_API_SECRET || ''
  if (!url || !apiKey || !apiSecret) {
    throw new Error('Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET')
  }
  return { url, apiKey, apiSecret }
}

export async function mintRoomToken(opts: {
  roomName: string
  identity: string
  name: string
  canPublish?: boolean
  metadata?: string
}) {
  const { url, apiKey, apiSecret } = getLiveKitConfig()
  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    metadata: opts.metadata,
    ttl: '6h',
  })
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.canPublish !== false,
    canSubscribe: true,
    canPublishData: true,
  })
  return { token: await at.toJwt(), url }
}
