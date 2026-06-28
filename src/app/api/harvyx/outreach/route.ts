import { NextResponse } from 'next/server';
import outreachRaw from '@/data/harvyx/outreach.json';

// outreach.json is a plain array
const items: Record<string, unknown>[] = [...(Array.isArray(outreachRaw) ? outreachRaw : [])];

export async function GET() {
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem: Record<string, unknown> = {
      id: `out_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      ...body,
    };
    items.unshift(newItem);
    return NextResponse.json({ ok: true, item: newItem });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
