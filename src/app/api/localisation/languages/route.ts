import { NextResponse } from 'next/server'

/** Stub — localisation service not on this Next app. Stops 404 spam from src/lib/api.ts */
export async function GET() {
  return NextResponse.json({
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
    ],
    default: 'en',
  })
}
