/** Redis helper — optional until REDIS_URL is set. */
export function redisConfigured() {
  return Boolean(process.env.REDIS_URL)
}

export async function cacheGet(_key: string): Promise<string | null> {
  if (!redisConfigured()) return null
  // Wire ioredis when REDIS_URL is provisioned
  return null
}

export async function cacheSet(_key: string, _value: string, _ttlSec = 300) {
  if (!redisConfigured()) return
}
