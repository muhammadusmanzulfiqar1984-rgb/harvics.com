/**
 * MIAN — manager bot. Routes chat to specialist bots and executes HARVYX tools.
 *
 * Specialist bots:
 *  OPS     — sales actions: send, batch, outreach cards, campaigns
 *  Analyst — pipeline data, stats, source status
 *  Social  — content drafting, message generation
 *  Scrape  — lead discovery, PhantomBuster, LinkedIn
 *
 * Every send goes through the approval gate before execution.
 */

import { checkApproval, SendBudget } from './approval';
import { HARVYX_TOOLS, findTool } from './tools';
import { runProspecting, executeSend, writebackResults } from './prospecting';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export type MianResponse = {
  reply: string;
  toolsUsed?: string[];
  cardId?: string;
  dataSource: 'mian' | 'ai' | 'error';
  latencyMs: number;
};

// ── Intent detection ────────────────────────────────────────────────────────

function isProspectingIntent(text: string) {
  return /\b(prospect|find.{0,20}leads?|find.{0,20}buyers?|run.{0,20}prosp|start.{0,20}campaign|outreach.{0,20}job)\b/i.test(text);
}

function isApproveIntent(text: string) {
  return /\b(approve|approved|send it|go ahead|yes send|confirm send|do it|proceed|confirmed)\b/i.test(text);
}

function isRejectIntent(text: string) {
  return /\b(reject|cancel|discard|no.{0,10}don.t send|stop)\b/i.test(text);
}

function isWritebackIntent(text: string) {
  return /\b(write.?back|writeback|update.{0,20}leads?|mark.{0,20}contacted)\b/i.test(text);
}

function isStatsIntent(text: string) {
  return /\b(stats?|usage|how many.{0,20}sent|sent.{0,20}today|pipeline)\b/i.test(text);
}

function isSourcesIntent(text: string) {
  return /\b(sources?|integrations?|linkedin.{0,15}status|apollo|phantombuster)\b/i.test(text);
}

// ── Pending card tracker (in-memory, per-process) ──────────────────────────

let pendingCardId: string | null = null;

export function getPendingCardId() { return pendingCardId; }
export function setPendingCardId(id: string | null) { pendingCardId = id; }

// ── Extract prospecting args from natural language ─────────────────────────

function extractProspectArgs(text: string) {
  const maxMatch = text.match(/\b(\d+)\s*leads?\b/i);
  const channelMatch = text.match(/\b(email|sms|whatsapp)\b/i);
  const queryMatch = text.match(/(?:for|about|targeting|in|from)\s+"?([^"]+?)"?\s*(?:leads?|buyers?|companies?|contacts?)?(?:\.|,|$)/i);

  return {
    maxLeads: maxMatch ? Math.min(50, parseInt(maxMatch[1], 10)) : 5,
    channel: (channelMatch?.[1]?.toLowerCase() || 'email') as 'email' | 'sms' | 'whatsapp',
    query: queryMatch?.[1]?.trim() || '',
    angle: (() => {
      if (/denim|textile|fabric/i.test(text)) return 'Denim & textile sourcing partnership';
      if (/fmcg|food|beverage/i.test(text)) return 'FMCG trade introduction';
      if (/retail|buyer/i.test(text)) return 'Retail buying enquiry';
      return 'Trade partnership introduction — Harvics Global';
    })(),
  };
}

// ── AI fallback ─────────────────────────────────────────────────────────────

async function callAI(messages: ChatMessage[], toolContext: string): Promise<string | null> {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

  const systemMsg: ChatMessage = {
    role: 'system',
    content:
      `You are MIAN — the AI manager for HarvyX, Harvics Global's sales & marketing platform.\n` +
      `You coordinate OPS (sales), Analyst (data), Social (content) and Scrape (research) bots.\n` +
      `All send actions require explicit user approval. Never invent data.\n` +
      (toolContext ? `\nHARVYX context:\n${toolContext}` : ''),
  };

  const body = { model: 'llama-3.3-70b-versatile', messages: [systemMsg, ...messages], max_tokens: 600, temperature: 0.4 };

  if (GROQ_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || null;
      }
    } catch { /* fall through */ }
  }

  if (NVIDIA_KEY) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${NVIDIA_KEY}` },
        body: JSON.stringify({ ...body, model: 'meta/llama-3.3-70b-instruct' }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || null;
      }
    } catch { /* fall through */ }
  }

  return null;
}

// ── Main MIAN handler ────────────────────────────────────────────────────────

export async function mian(
  history: ChatMessage[],
  origin: string,
  apiKey: string,
): Promise<MianResponse> {
  const start = Date.now();
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const userText = String(lastUser?.content || '').trim();
  const budget = new SendBudget();
  const toolsUsed: string[] = [];

  // ── Approval / reject for pending prospecting card ──────────────────────
  if (pendingCardId) {
    if (isApproveIntent(userText)) {
      const approval = checkApproval(userText);
      if (!approval.ok) {
        return { reply: approval.reason, dataSource: 'mian', latencyMs: Date.now() - start };
      }
      const sendBudget = budget.consume();
      if (!sendBudget.ok) {
        return { reply: sendBudget.reason, dataSource: 'mian', latencyMs: Date.now() - start };
      }

      const sendResult = await executeSend(pendingCardId, origin, apiKey);
      toolsUsed.push('batch_send');

      if (sendResult.ok) {
        const wbResult = await writebackResults(pendingCardId, origin, apiKey);
        toolsUsed.push('writeback');
        setPendingCardId(null);
        return {
          reply: sendResult.summary + '\n\n' + wbResult.summary,
          toolsUsed,
          dataSource: 'mian',
          latencyMs: Date.now() - start,
        };
      }

      return { reply: sendResult.summary, toolsUsed, dataSource: 'mian', latencyMs: Date.now() - start };
    }

    if (isRejectIntent(userText)) {
      const { updateOutreachItem } = await import('@/lib/harvyx/outreachStore');
      updateOutreachItem(pendingCardId, { status: 'rejected' });
      const cid = pendingCardId;
      setPendingCardId(null);
      return {
        reply: `Prospecting job ${cid} cancelled. No messages sent.`,
        dataSource: 'mian',
        latencyMs: Date.now() - start,
      };
    }
  }

  // ── Prospecting intent ────────────────────────────────────────────────────
  if (isProspectingIntent(userText)) {
    const args = extractProspectArgs(userText);
    const result = await runProspecting(args, origin, apiKey);
    toolsUsed.push('search_leads', 'enrich_lead', 'generate_message', 'create_outreach_card');

    if (result.cardId) setPendingCardId(result.cardId);

    return {
      reply: result.summary + '\n\n' + result.nextStep,
      toolsUsed,
      cardId: result.cardId,
      dataSource: 'mian',
      latencyMs: Date.now() - start,
    };
  }

  // ── Stats intent ──────────────────────────────────────────────────────────
  if (isStatsIntent(userText)) {
    const tool = findTool('get_stats')!;
    const r = await tool.call({}, origin, apiKey);
    toolsUsed.push('get_stats');
    const stats = r.data as any;
    const reply =
      r.ok
        ? `📊 **HarvyX Usage Today**\n` +
          `• Sends: ${stats?.usage?.sends ?? 0} / ${stats?.org?.dailySendCap ?? '?'}\n` +
          `• Enrichments: ${stats?.usage?.enrich ?? 0} / ${stats?.org?.dailyEnrichCap ?? '?'}\n` +
          `• Total leads: ${stats?.checks?.leads?.total ?? '?'}\n` +
          `• Email provider: ${stats?.checks?.email?.provider ?? '?'}`
        : `Stats unavailable: ${r.error}`;
    return { reply, toolsUsed, dataSource: 'mian', latencyMs: Date.now() - start };
  }

  // ── Sources intent ────────────────────────────────────────────────────────
  if (isSourcesIntent(userText)) {
    const tool = findTool('list_sources')!;
    const r = await tool.call({}, origin, apiKey);
    toolsUsed.push('list_sources');
    const sources = (r.data as any)?.sources || [];
    const reply =
      r.ok && sources.length
        ? `🔌 **Connected Sources**\n` +
          sources
            .map((s: any) => `• ${s.name}: ${s.enabled ? '✅' : '❌'}${s.configured === false ? ' (key missing)' : ''}`)
            .join('\n')
        : `Sources: ${JSON.stringify(r.data).slice(0, 300)}`;
    return { reply, toolsUsed, dataSource: 'mian', latencyMs: Date.now() - start };
  }

  // ── Writeback intent (manual) ─────────────────────────────────────────────
  if (isWritebackIntent(userText) && pendingCardId) {
    const wbResult = await writebackResults(pendingCardId, origin, apiKey);
    toolsUsed.push('writeback');
    return { reply: wbResult.summary, toolsUsed, dataSource: 'mian', latencyMs: Date.now() - start };
  }

  // ── AI fallback with HARVYX context ──────────────────────────────────────
  let toolContext = '';
  const statsR = await findTool('get_stats')!.call({}, origin, apiKey);
  if (statsR.ok) {
    const s = statsR.data as any;
    toolContext =
      `Org: ${s?.org?.name}, Plan: ${s?.org?.plan}, Sends today: ${s?.usage?.sends}/${s?.org?.dailySendCap}, ` +
      `Total leads: ${s?.checks?.leads?.total}, AI: groq=${s?.checks?.ai?.groq}, resend=${s?.checks?.resend?.ok}`;
  }

  const aiReply = await callAI(history, toolContext);
  if (aiReply) {
    return { reply: aiReply, toolsUsed, dataSource: 'ai', latencyMs: Date.now() - start };
  }

  return {
    reply:
      `I'm MIAN, your HarvyX teammate. I can:\n` +
      `• **Run prospecting** — "find 10 leads for denim buyers"\n` +
      `• **Check stats** — "show me today's usage"\n` +
      `• **Check sources** — "what sources are connected?"\n` +
      `\nAI provider is offline right now. All HARVYX tools are available.`,
    toolsUsed,
    dataSource: 'mian',
    latencyMs: Date.now() - start,
  };
}
