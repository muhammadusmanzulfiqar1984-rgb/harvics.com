/**
 * Prospecting job — Step 2.
 * find leads → enrich → generate personal messages → create HARVYX approval card
 * → (after user approves) batch-send → track replies → follow up → writeback
 */

import { addOutreachItem } from '@/lib/harvyx/outreachStore';

export type ProspectArgs = {
  query?: string;
  status?: string;
  maxLeads?: number;
  angle?: string;
  tone?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
};

export type ProspectResult = {
  phase: string;
  cardId?: string;
  leads?: unknown[];
  enriched?: number;
  messages?: unknown[];
  summary: string;
  nextStep: string;
};

async function hxFetch(
  method: 'GET' | 'POST',
  path: string,
  body: unknown,
  origin: string,
  apiKey: string,
) {
  const res = await fetch(`${origin}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  return res.json().catch(() => ({}));
}

export async function runProspecting(
  args: ProspectArgs,
  origin: string,
  apiKey: string,
): Promise<ProspectResult> {
  const {
    query = '',
    status = 'new',
    maxLeads = 5,
    angle = 'Denim & textile sourcing partnership',
    tone = 'professional, warm, concise',
    channel = 'email',
  } = args;

  // ─── Phase 1: Find leads ────────────────────────────────────────────────
  const leadsUrl = query
    ? `/api/harvyx/leads?q=${encodeURIComponent(query)}&limit=${maxLeads * 3}&page=1`
    : `/api/harvyx/leads?status=${status}&limit=${maxLeads * 3}&page=1`;

  const leadsData = await hxFetch('GET', leadsUrl, undefined, origin, apiKey);
  const rawLeads: Array<Record<string, unknown>> = Array.isArray(leadsData.leads)
    ? leadsData.leads.slice(0, maxLeads * 3)
    : [];

  if (!rawLeads.length) {
    return {
      phase: 'find',
      summary: `No leads found${query ? ` for "${query}"` : ` with status="${status}"`}.`,
      nextStep: 'Try a different query or import new leads first.',
    };
  }

  // ─── Phase 2: Enrich (fill missing emails where possible) ──────────────
  const enriched: Array<Record<string, unknown>> = [];
  for (const lead of rawLeads.slice(0, maxLeads)) {
    const email = String(lead.email || lead.workEmail || '').trim();
    if (email) {
      enriched.push({ ...lead });
      continue;
    }
    if (lead.website || lead.domain) {
      try {
        const eData = await hxFetch(
          'POST',
          '/api/harvyx/enrich',
          {
            domain: lead.domain || undefined,
            website: lead.website || undefined,
            contactName: lead.contactName || lead.name || undefined,
          },
          origin,
          apiKey,
        );
        if (eData.ok && eData.email) {
          enriched.push({ ...lead, email: eData.email, enriched: true });
          continue;
        }
      } catch {
        // non-fatal
      }
    }
    // keep un-enriched leads that have no email but have phone for SMS
    if (channel !== 'email') enriched.push({ ...lead });
  }

  const withContact = enriched.filter((l) =>
    channel === 'email'
      ? String(l.email || l.workEmail || '').includes('@')
      : String(l.phone || l.mobile || '').trim(),
  );

  if (!withContact.length) {
    return {
      phase: 'enrich',
      leads: rawLeads.slice(0, maxLeads),
      enriched: 0,
      summary: `Found ${rawLeads.length} leads but none had a reachable ${channel} address after enrichment.`,
      nextStep: 'Check lead data quality or enable Hunter.io (set HUNTER_API_KEY).',
    };
  }

  // ─── Phase 3: Generate personalised messages ────────────────────────────
  const messages: Array<{
    leadId: string;
    to: string;
    name: string;
    company: string;
    subject?: string;
    content: string;
    engine: string;
  }> = [];

  for (const lead of withContact) {
    try {
      const genData = await hxFetch(
        'POST',
        '/api/harvyx/generate',
        {
          type: channel,
          lead,
          topic: angle,
          tone,
        },
        origin,
        apiKey,
      );
      if (genData.content || genData.body) {
        messages.push({
          leadId: String(lead.id || ''),
          to:
            channel === 'email'
              ? String(lead.email || lead.workEmail || '')
              : String(lead.phone || lead.mobile || ''),
          name: String(lead.contactName || lead.name || 'there'),
          company: String(lead.company || ''),
          subject: String(genData.subject || `Partnership enquiry — Harvics Global`),
          content: String(genData.content || genData.body || ''),
          engine: String(genData.engine || 'ai'),
        });
      }
    } catch {
      // non-fatal — skip lead
    }
  }

  if (!messages.length) {
    return {
      phase: 'generate',
      leads: withContact,
      enriched: withContact.filter((l) => l.enriched).length,
      summary: 'Message generation failed for all leads. AI provider may be unreachable.',
      nextStep: 'Check GROQ_API_KEY / NVIDIA_API_KEY env vars and network access.',
    };
  }

  // ─── Phase 4: Create HARVYX approval card ──────────────────────────────
  const cardId = `prosp_${Date.now()}`;
  const card = addOutreachItem({
    id: cardId,
    createdAt: new Date().toISOString(),
    status: 'pending_approval',
    type: 'prospecting',
    channel,
    target: query || status,
    angle,
    message: `${messages.length} personalised ${channel}s ready. Topic: ${angle}`,
    results: messages.map((m) => ({
      leadId: m.leadId,
      to: m.to,
      name: m.name,
      company: m.company,
      subject: m.subject,
      preview: m.content.slice(0, 200),
      engine: m.engine,
    })),
    pipelineCount: messages.length,
    _messages: messages,
  });

  const preview = messages
    .slice(0, 3)
    .map(
      (m, i) =>
        `**${i + 1}. ${m.name} (${m.company})**\n` +
        (m.subject ? `Subject: ${m.subject}\n` : '') +
        m.content.slice(0, 300),
    )
    .join('\n\n---\n\n');

  return {
    phase: 'approval_pending',
    cardId,
    leads: withContact,
    enriched: withContact.filter((l) => l.enriched).length,
    messages,
    summary:
      `✅ Prospecting job ready. ${messages.length} personalised ${channel}(s) drafted for:\n` +
      messages.slice(0, 5).map((m) => `• ${m.name} — ${m.company}`).join('\n') +
      (messages.length > 5 ? `\n…and ${messages.length - 5} more` : '') +
      `\n\n**Preview (first ${Math.min(3, messages.length)}):**\n\n${preview}`,
    nextStep:
      `Approval card **${cardId}** is pending. ` +
      `Reply "approve" or "send it" to trigger batch-send, or "reject" to discard.`,
  };
}

/**
 * Execute the send phase — called after user approves.
 * Runs batch-send via the existing approval-gated route.
 */
export async function executeSend(
  cardId: string,
  origin: string,
  apiKey: string,
): Promise<{ ok: boolean; summary: string }> {
  // Look up the card from the in-memory store
  const { findOutreachItem, updateOutreachItem } = await import('@/lib/harvyx/outreachStore');
  const card = findOutreachItem(cardId);
  if (!card) {
    return { ok: false, summary: `Card ${cardId} not found.` };
  }
  if (card.status !== 'pending_approval') {
    return { ok: false, summary: `Card ${cardId} is in status "${card.status}" — cannot send.` };
  }

  const messages = (card._messages as Array<Record<string, unknown>>) || [];
  const channel = String(card.channel || 'email') as 'email' | 'sms' | 'whatsapp';

  // Send via batch-send for efficiency
  const res = await fetch(`${origin}/api/harvyx/batch-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({
      channel,
      maxLeads: messages.length,
      angle: card.angle,
      tone: 'professional, warm, concise',
      dryRun: false,
    }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  const sent = Number(data.sent ?? 0);
  const failed = Number(data.failed ?? 0);

  updateOutreachItem(cardId, { status: 'sent', sentAt: new Date().toISOString(), batchResult: data });

  return {
    ok: res.ok,
    summary: res.ok
      ? `✅ Sent ${sent} message(s)${failed > 0 ? `, ${failed} failed` : ''}. Card ${cardId} marked sent.`
      : `Batch-send failed: ${(data as any)?.error || res.status}`,
  };
}

/**
 * Write back final results to HarvyX after a send cycle.
 */
export async function writebackResults(
  cardId: string,
  origin: string,
  apiKey: string,
): Promise<{ ok: boolean; summary: string }> {
  const { findOutreachItem } = await import('@/lib/harvyx/outreachStore');
  const card = findOutreachItem(cardId);
  if (!card) return { ok: false, summary: `Card ${cardId} not found.` };

  const messages = ((card._messages || card.results) as Array<Record<string, unknown>>) || [];
  const patches = messages
    .filter((m) => m.leadId)
    .map((m) => ({ id: m.leadId, status: 'contacted', lastContacted: new Date().toISOString() }));

  if (!patches.length) return { ok: false, summary: 'No leadIds to write back.' };

  const res = await fetch(`${origin}/api/harvyx/writeback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ leads: patches }),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    summary: res.ok
      ? `✅ Wrote back ${patches.length} lead status updates to HarvyX.`
      : `Writeback failed: ${(data as any)?.error || res.status}`,
  };
}
