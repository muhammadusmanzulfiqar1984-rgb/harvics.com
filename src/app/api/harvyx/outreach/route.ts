import { NextResponse } from 'next/server';
import { getOutreachItems, addOutreachItem } from '@/lib/harvyx/outreachStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ items: getOutreachItems() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = addOutreachItem({
      id: `out_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      ...body,
    });
    return NextResponse.json({ ok: true, item: newItem });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
