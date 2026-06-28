import { NextResponse } from 'next/server';
import outreachRaw from '@/data/harvyx/outreach.json';

const items: Record<string, unknown>[] = [...(Array.isArray(outreachRaw) ? outreachRaw : [])];

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idx = items.findIndex((item) => item.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], status: 'sent', sentAt: new Date().toISOString() };
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
