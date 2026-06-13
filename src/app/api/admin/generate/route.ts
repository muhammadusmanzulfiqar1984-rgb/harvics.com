import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Local-dev proxy: adds INTERNAL_API_KEY server-side so the admin UI works without exposing secrets. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Admin generate is for local dev only' }, { status: 403 });
  }

  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'INTERNAL_API_KEY missing from .env.local' }, { status: 500 });
  }

  const body = await request.text();
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
