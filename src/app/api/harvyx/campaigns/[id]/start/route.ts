import { NextResponse } from 'next/server';
import { fillTemplate } from '@/lib/harvyx/campaignTemplates';
import { addDays, getCampaign, loadCampaigns, saveCampaigns } from '@/lib/harvyx/campaignStore';
import { addOutreachItem } from '@/lib/harvyx/outreachStore';
import { getLinkedInStatus, sendViaPhantomBuster } from '@/lib/harvyx/linkedinAutomation';

export const dynamic = 'force-dynamic';

/**
 * POST — activate campaign and queue step 1 outreach drafts.
 * Optional body: { launchPhantom: true } to also fire PhantomBuster for connect step.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const campaign = await getCampaign(id);
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const now = new Date().toISOString();
    const step = campaign.steps[0];
    if (!step) return NextResponse.json({ error: 'Campaign has no steps' }, { status: 400 });

    const scheduledAt = addDays(now, step.delayDays);
    let queued = 0;
    const linkedinUrls: string[] = [];

    for (const lead of campaign.leads) {
      if (lead.status === 'skipped' || !lead.linkedin) continue;
      const message = fillTemplate(step.messageTemplate, lead);
      const outreachItem = {
        id: `out_${Date.now()}_${lead.leadId}`,
        status: 'approved',
        channel: step.type,
        type: step.type === 'linkedin_connect' ? 'LinkedIn connect' : 'LinkedIn DM',
        target: lead.contactName || lead.company,
        company: lead.company,
        linkedin: lead.linkedin,
        message,
        campaignId: campaign.id,
        campaignStep: 0,
        scheduledAt,
        createdAt: now,
      };
      addOutreachItem(outreachItem);
      lead.status = 'queued';
      lead.stepIndex = 0;
      lead.nextStepAt = scheduledAt;
      lead.lastActionAt = now;
      linkedinUrls.push(lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`);
      queued++;
    }

    campaign.status = 'active';
    campaign.startedAt = now;

    const campaigns = await loadCampaigns();
    const idx = campaigns.findIndex((c) => c.id === campaign.id);
    if (idx !== -1) campaigns[idx] = campaign;
    await saveCampaigns(campaigns);

    let phantom: Record<string, unknown> | null = null;
    if (body.launchPhantom && step.type === 'linkedin_connect' && linkedinUrls.length) {
      const li = getLinkedInStatus();
      const sampleLead = campaign.leads.find((l) => l.linkedin && l.status !== 'skipped');
      if (li.ready && linkedinUrls[0] && sampleLead) {
        const pb = await sendViaPhantomBuster({
          linkedinUrl: linkedinUrls[0],
          message: fillTemplate(step.messageTemplate, sampleLead),
          channel: step.type,
        });
        phantom = pb.ok ? { containerId: pb.containerId } : { error: pb.error, hint: pb.hint };
      } else {
        phantom = { error: li.hint };
      }
    }

    return NextResponse.json({
      ok: true,
      campaign,
      queued,
      step: { index: 0, ...step, scheduledAt },
      linkedinUrls: linkedinUrls.slice(0, 20),
      linkedinTotal: linkedinUrls.length,
      phantom,
      hint: queued
        ? `Step 1 queued for ${queued} contacts. Open Outreach tab to review messages.`
        : 'No contacts with LinkedIn URLs — enrich profiles first.',
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
