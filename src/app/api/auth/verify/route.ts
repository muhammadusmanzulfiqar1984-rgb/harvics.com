import { NextResponse } from 'next/server'

/** Stub — marketing site has no session backend. Stops 404 spam from src/lib/api.ts */
export async function GET() {
  return NextResponse.json({
    valid: false,
    user: null,
  })
}

export async function POST() {
  return GET()
}
