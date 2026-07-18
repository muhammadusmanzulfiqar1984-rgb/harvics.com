import { NextResponse } from 'next/server';
import {
  buildCampaignLeads,
  loadCampaigns,
  resolveLeadsByIds,
  saveCampaigns,
  stepsFromTemplate,
  type Campaign,
} from '@/lib/harvyx/campaignStore';
import { LINKEDIN_CAMPAIGN_TEMPLATES } from '@/lib/harvyx/campaignTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  const campaigns = await loadCampaigns();
  return NextResponse.json({
    campaigns,
    templates: LINKEDIN_CAMPAIGN_TEMPLATES,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim() || `LinkedIn campaign ${new Date().toLocaleDateString()}`;
    const templateId = String(body.templateId || 'connect_dm');
    const template = LINKEDIN_CAMPAIGN_TEMPLATES.find((t) => t.id === templateId)
      || LINKEDIN_CAMPAIGN_TEMPLATES[1];

    const leadIds = Array.isArray(body.leadIds) ? body.leadIds.map(String) : [];
    if (!leadIds.length) {
      return NextResponse.json({ error: 'leadIds required — tick contacts first' }, { status: 400 });
    }

    const leads = await resolveLeadsByIds(leadIds.slice(0, 500));
    const { entries, withLinkedin, skipped } = buildCampaignLeads(leads);

    const customMessages = body.messages && typeof body.messages === 'object' ? body.messages : {};
    const steps = stepsFromTemplate(template.steps).map((s, i) => ({
      ...s,
      messageTemplate: String(customMessages[i] ?? customMessages[s.type] ?? s.messageTemplate),
    }));

    const campaign: Campaign = {
      id: `camp_${Date.now().toString(36)}`,
      name,
      templateId: template.id,
      channel: 'linkedin',
      status: 'draft',
      createdAt: new Date().toISOString(),
      steps,
      leads: entries,
    };

    const campaigns = await loadCampaigns();
    campaigns.unshift(campaign);
    await saveCampaigns(campaigns);

    return NextResponse.json({
      ok: true,
      campaign,
      summary: { total: entries.length, withLinkedin, skipped, template: template.name },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
