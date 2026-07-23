// Shared auth for HarvyX API routes.
// - MCP / external clients: send header `x-api-key: <HARVYX_API_KEY>`
// - Browser console (no key header): allowed (same-origin ops UI)

export function authenticate(request: Request): Response | null {
  const apiKey = request.headers.get('x-api-key')
  const validKey = process.env.HARVYX_API_KEY

  // No API key header → browser / internal console traffic
  if (!apiKey) return null

  if (!validKey) {
    console.error('[HarvyX] HARVYX_API_KEY env var not set')
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (apiKey !== validKey) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
