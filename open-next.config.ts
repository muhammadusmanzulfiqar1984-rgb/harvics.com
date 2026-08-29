import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'

/**
 * OpenNext on Cloudflare — R2 + regional cache only.
 * DO queue removed: DOQueueHandler was OOMing and 500'ing the homepage.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
    bypassTagCacheOnCacheHit: true,
  }),
  // No Durable Object queue — avoid DO memory limit crashes on revalidate.
  enableCacheInterception: false,
})
