export type CampaignStepType = 'linkedin_connect' | 'linkedin_dm';

export interface CampaignStepTemplate {
  type: CampaignStepType;
  delayDays: number;
  label: string;
  defaultMessage: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  steps: CampaignStepTemplate[];
}

export const LINKEDIN_CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'connect_only',
    name: 'Connection requests',
    description: 'Day 0 — send LinkedIn connection requests with a short note.',
    steps: [
      {
        type: 'linkedin_connect',
        delayDays: 0,
        label: 'Connection request',
        defaultMessage:
          'Hi {{name}}, I came across {{company}} and would love to connect. We work across FMCG and textiles corridors — happy to share relevant opportunities.',
      },
    ],
  },
  {
    id: 'connect_dm',
    name: 'Connect → DM',
    description: 'Day 0 connect, Day 3 first message after they accept.',
    steps: [
      {
        type: 'linkedin_connect',
        delayDays: 0,
        label: 'Connection request',
        defaultMessage:
          'Hi {{name}}, I would like to add you to my network — we support buyers and suppliers in {{segment}} and I think {{company}} could be a strong fit.',
      },
      {
        type: 'linkedin_dm',
        delayDays: 3,
        label: 'First DM',
        defaultMessage:
          'Thanks for connecting, {{name}}. We help brands like {{company}} source and distribute across 42+ markets. Would a 15-minute intro make sense this week?',
      },
    ],
  },
  {
    id: 'connect_dm_followup',
    name: 'Connect → DM → Follow-up',
    description: 'Full 3-step LinkedIn sequence over 7 days.',
    steps: [
      {
        type: 'linkedin_connect',
        delayDays: 0,
        label: 'Connection request',
        defaultMessage:
          'Hi {{name}}, reaching out from Harvics — we run B2B trade corridors and I noticed {{company}} in {{segment}}.',
      },
      {
        type: 'linkedin_dm',
        delayDays: 3,
        label: 'Intro DM',
        defaultMessage:
          'Hi {{name}}, thanks for connecting. We match verified suppliers with distributors like {{company}} — catalog, logistics, and trade finance in one stack. Open to a quick call?',
      },
      {
        type: 'linkedin_dm',
        delayDays: 7,
        label: 'Follow-up DM',
        defaultMessage:
          'Hi {{name}}, circling back in case my last note got buried. Happy to share a one-pager relevant to {{company}} — no pressure if timing is off.',
      },
    ],
  },
];

export function fillTemplate(text: string, lead: { contactName?: string; company?: string; segment?: string }) {
  const name = (lead.contactName || 'there').split(/\s+/)[0];
  return text
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{company\}\}/g, lead.company || 'your company')
    .replace(/\{\{segment\}\}/g, lead.segment || 'your sector');
}
