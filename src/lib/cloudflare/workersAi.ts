type AiRunner = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>
}

/** Workers AI binding (`env.AI`) — available on Cloudflare / OpenNext production. */
export async function getWorkersAI(): Promise<AiRunner | null> {
  try {
    const mod = await import('@opennextjs/cloudflare')
    const ctx = await mod.getCloudflareContext({ async: true })
    const ai = (ctx?.env as { AI?: AiRunner } | undefined)?.AI
    if (ai && typeof ai.run === 'function') return ai
  } catch {
    // Local `next dev` has no Worker bindings.
  }
  return null
}
