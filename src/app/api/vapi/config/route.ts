import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Public Vapi config for HarvyX (browser). Private key never leaves the server.
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''

  if (!publicKey || !assistantId) {
    return NextResponse.json(
      { error: 'Vapi not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ publicKey, assistantId })
}
