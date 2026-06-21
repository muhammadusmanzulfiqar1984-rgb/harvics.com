import { NextRequest, NextResponse } from 'next/server'

const BACKEND =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_API_URL?.startsWith('https://')
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:4000'

export async function proxyWave8(req: NextRequest, backendPath: string): Promise<NextResponse> {
  const url = `${BACKEND}/api/wave8${backendPath}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Forward auth token
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  // Forward market-context headers
  for (const h of ['x-locale', 'x-country', 'x-currency', 'x-timezone']) {
    const v = req.headers.get(h)
    if (v) headers[h] = v
  }

  const init: RequestInit = { method: req.method, headers }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text()
    if (body) init.body = body
  }

  try {
    const upstream = await fetch(url, init)
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Backend unreachable', detail: err?.message },
      { status: 502 },
    )
  }
}
