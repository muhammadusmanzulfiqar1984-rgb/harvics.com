import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const HARVYX_ACCESS_COOKIE = 'harvyx_ops'
const ACCESS_PAYLOAD = 'harvyx-access-v1'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getAccessCode(): string {
  return (process.env.HARVYX_ACCESS_CODE || '').trim()
}

/** Access gate disabled — HarvyX opens without a password. */
export function isAccessRequired(): boolean {
  return false
}

export function verifyAccessCode(code: string): boolean {
  const expected = getAccessCode()
  if (!expected) return true
  return code.trim() === expected
}

async function signingSecret(): Promise<string> {
  return (
    process.env.INTERNAL_API_KEY ||
    process.env.HARVYX_ACCESS_CODE ||
    'harvyx-dev-insecure'
  )
}

export async function createAccessToken(): Promise<string> {
  const secret = await signingSecret()
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(ACCESS_PAYLOAD)
  )
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!isAccessRequired()) return true
  if (!token) return false
  const expected = await createAccessToken()
  return token === expected
}

function readInternalApiKey(request: NextRequest): string | null {
  const key = process.env.INTERNAL_API_KEY
  if (!key) return null
  const header =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  return header === key ? key : null
}

export async function hasOpsAccess(request: NextRequest): Promise<boolean> {
  if (!isAccessRequired()) return true
  if (readInternalApiKey(request)) return true
  const token = request.cookies.get(HARVYX_ACCESS_COOKIE)?.value
  return isValidAccessToken(token)
}

export function opsAccessDeniedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Access required',
      code: 'OPS_ACCESS_REQUIRED',
      hint: 'Enter the ops access code on HarvyX or Meet',
    },
    { status: 401 }
  )
}

export function setAccessCookie(response: NextResponse, token: string): void {
  response.cookies.set(HARVYX_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearAccessCookie(response: NextResponse): void {
  response.cookies.set(HARVYX_ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
