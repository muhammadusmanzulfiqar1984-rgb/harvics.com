/**
 * HARVYX bot tools — every HARVYX API capability as a typed, callable tool.
 * Tools that send messages are tagged isSend:true and go through the approval gate.
 */

export type ToolResult = { ok: boolean; data?: unknown; error?: string };

export type HarvyxTool = {
  name: string;
  description: string;
  isSend: boolean;
  call: (args: Record<string, unknown>, origin: string, apiKey: string) => Promise<ToolResult>;
};

function headers(apiKey: string) {
  return { 'Content-Type': 'application/json', 'x-api-key': apiKey };
}

async function hx(
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body: unknown,
  origin: string,
  apiKey: string,
): Promise<ToolResult> {
  try {
    const res = await fetch(`${origin}${path}`, {
      method,
      headers: headers(apiKey),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ raw: res.status }));
    return { ok: res.ok, data, error: res.ok ? undefined : String((data as any)?.error || res.status) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export const HARVYX_TOOLS: HarvyxTool[] = [
  // ── LEADS & SEARCH ───────────────────────────────────────────────────────
  {
    name: 'search_leads',
    description: 'Search HarvyX lead database. Args: q (query string), limit (default 10)',
    isSend: false,
    call: async (args, origin, key) =>
      hx('GET', `/api/harvyx/leads?q=${encodeURIComponent(String(args.q || ''))}&limit=${args.limit ?? 10}&page=1`, undefined, origin, key),
  },
  {
    name: 'discover_leads',
    description: 'Discover new leads from live sources. Args: query, filters (optional)',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/discover', { query: args.query, filters: args.filters }, origin, key),
  },

  // ── ENRICH ───────────────────────────────────────────────────────────────
  {
    name: 'enrich_lead',
    description: 'Enrich a lead email/contact via Hunter.io. Args: company, website, domain, contactName',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/enrich', args, origin, key),
  },

  // ── GENERATE ─────────────────────────────────────────────────────────────
  {
    name: 'generate_message',
    description: 'Generate personalised email/SMS/WhatsApp copy for a lead. Args: type (email|sms|whatsapp), lead (object), topic, tone',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/generate', args, origin, key),
  },

  // ── SEND (approval-gated) ─────────────────────────────────────────────
  {
    name: 'send_email',
    description: 'Send a single email to one lead. Args: to, subject, content, leadId (optional)',
    isSend: true,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/send-email', args, origin, key),
  },
  {
    name: 'batch_send',
    description:
      'Send emails (or SMS) to multiple leads in one job. Args: channel (email|sms|whatsapp), status (lead status filter, default "new"), maxLeads (default 5), angle (topic), tone, dryRun (bool)',
    isSend: true,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/batch-send', args, origin, key),
  },

  // ── OUTREACH CARDS ───────────────────────────────────────────────────────
  {
    name: 'list_outreach',
    description: 'List all outreach cards (draft, pending_approval, approved, sent)',
    isSend: false,
    call: async (_args, origin, key) =>
      hx('GET', '/api/harvyx/outreach', undefined, origin, key),
  },
  {
    name: 'create_outreach_card',
    description:
      'Create an approval card for a planned send. Args: type, channel, target, message, results (array), pipelineCount',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/outreach', { status: 'pending_approval', ...args }, origin, key),
  },
  {
    name: 'update_outreach_status',
    description: 'Update the status of an outreach card. Args: id (required), status (draft|pending_approval|approved|sent|failed)',
    isSend: false,
    call: async (args, origin, key) => {
      const { id, ...body } = args;
      return hx('POST', `/api/harvyx/outreach/${id}/status`, body, origin, key);
    },
  },

  // ── CAMPAIGNS ────────────────────────────────────────────────────────────
  {
    name: 'list_campaigns',
    description: 'List all HarvyX LinkedIn campaigns',
    isSend: false,
    call: async (_args, origin, key) =>
      hx('GET', '/api/harvyx/campaigns', undefined, origin, key),
  },
  {
    name: 'get_campaign',
    description: 'Get details of one campaign. Args: id',
    isSend: false,
    call: async (args, origin, key) =>
      hx('GET', `/api/harvyx/campaigns/${args.id}`, undefined, origin, key),
  },
  {
    name: 'update_campaign',
    description: 'Update a campaign status or name. Args: id, status (draft|active|paused|completed), name',
    isSend: false,
    call: async (args, origin, key) => {
      const { id, ...body } = args;
      return hx('PATCH', `/api/harvyx/campaigns/${id}`, body, origin, key);
    },
  },

  // ── IMPORT ───────────────────────────────────────────────────────────────
  {
    name: 'import_leads',
    description: 'Import leads from a CSV/JSON payload. Args: leads (array of lead objects)',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/import', args, origin, key),
  },

  // ── SOURCES ──────────────────────────────────────────────────────────────
  {
    name: 'list_sources',
    description: 'List all configured data sources (LinkedIn, Apollo, PhantomBuster, etc.) and their status',
    isSend: false,
    call: async (_args, origin, key) =>
      hx('GET', '/api/harvyx/sources', undefined, origin, key),
  },

  // ── WRITEBACK ────────────────────────────────────────────────────────────
  {
    name: 'writeback',
    description:
      'Write enriched/updated lead data back to HarvyX. Args: leads (array of {id, ...patchFields})',
    isSend: false,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/writeback', args, origin, key),
  },

  // ── LINKEDIN / PHANTOMBUSTER ──────────────────────────────────────────
  {
    name: 'linkedin_status',
    description: 'Check LinkedIn automation (PhantomBuster) connection status',
    isSend: false,
    call: async (_args, origin, key) =>
      hx('GET', '/api/harvyx/linkedin', undefined, origin, key),
  },
  {
    name: 'phantombuster_launch',
    description:
      'Launch a PhantomBuster agent. Args: agentId, argument (LinkedIn URL or search URL), notification (bool)',
    isSend: true,
    call: async (args, origin, key) =>
      hx('POST', '/api/harvyx/phantombuster', args, origin, key),
  },

  // ── STATS ─────────────────────────────────────────────────────────────
  {
    name: 'get_stats',
    description: 'Get HarvyX usage stats (sends, enrichments, replies)',
    isSend: false,
    call: async (_args, origin, key) =>
      hx('GET', '/api/harvyx/stats', undefined, origin, key),
  },
];

export function findTool(name: string): HarvyxTool | undefined {
  return HARVYX_TOOLS.find((t) => t.name === name);
}
