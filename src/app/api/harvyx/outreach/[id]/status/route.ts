import { NextResponse } from 'next/server';
import { updateOutreachItem, findOutreachItem } from '@/lib/harvyx/outreachStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!findOutreachItem(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    updateOutreachItem(id, { status });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
