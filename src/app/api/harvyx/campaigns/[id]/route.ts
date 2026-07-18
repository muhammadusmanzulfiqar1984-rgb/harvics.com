import { NextResponse } from 'next/server';
import { getCampaign, loadCampaigns, saveCampaigns } from '@/lib/harvyx/campaignStore';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const campaigns = await loadCampaigns();
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const cur = campaigns[idx];
    if (body.status) cur.status = body.status;
    if (body.name) cur.name = String(body.name);
    campaigns[idx] = cur;
    await saveCampaigns(campaigns);
    return NextResponse.json({ ok: true, campaign: cur });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
