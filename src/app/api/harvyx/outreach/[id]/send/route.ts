import { NextResponse } from 'next/server';
import { sendLinkedInOutreach } from '@/lib/harvyx/linkedinAutomation';
import { findOutreachItem, updateOutreachItem } from '@/lib/harvyx/outreachStore';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = findOutreachItem(id);
    if (!item) return NextResponse.json({ error: 'Outreach item not found' }, { status: 404 });

    const channel = String(item.channel || item.type || '').toLowerCase();
    const isLinkedIn = channel.includes('linkedin');

    if (isLinkedIn) {
      const result = await sendLinkedInOutreach({
        channel: String(item.channel || item.type || ''),
        linkedin: String(item.linkedin || ''),
        message: String(item.message || ''),
        target: String(item.target || ''),
      });

      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            mode: result.mode || 'manual',
            error: result.error,
            hint: result.hint,
            linkedin: 'linkedin' in result ? result.linkedin : undefined,
            message: 'message' in result ? result.message : undefined,
          },
          { status: result.mode === 'manual' ? 503 : 502 },
        );
      }

      updateOutreachItem(id, {
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentVia: result.mode,
        phantomContainerId: result.containerId,
      });

      return NextResponse.json({
        ok: true,
        mode: result.mode,
        containerId: result.containerId,
      });
    }

    updateOutreachItem(id, { status: 'sent', sentAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, mode: 'marked' });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
