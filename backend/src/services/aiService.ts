/**
 * HARVICS AI Service — Groq (free tier) with graceful degrade.
 *
 * • Reads GROQ_API_KEY from env. If missing, every helper returns a
 *   safe fallback so CRM keeps working without AI.
 * • Centralised so we can swap to Gemini/Claude/GPT later by changing
 *   this file only.
 *
 * Provider: Groq (https://console.groq.com) — OpenAI-compatible API,
 * free tier covers ~14k requests/day on Llama 3.3 70B Versatile.
 */
import 'dotenv/config';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const getModel = () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const getKey = () => process.env.GROQ_API_KEY || '';

export const aiEnabled = (): boolean => {
  const k = getKey();
  return !!k && k.startsWith('gsk_');
};

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

interface ChatOpts {
  temperature?: number;
  maxTokens?: number;
  json?: boolean; // ask Groq for JSON output
}

export interface MarketContext {
  locale: string;
  country: string;
  currency: string;
  timezone: string;
}

const DEFAULT_MARKET_CONTEXT: MarketContext = {
  locale: 'en',
  country: 'US',
  currency: 'USD',
  timezone: 'UTC',
};

function withMarketContext(context?: Partial<MarketContext>): MarketContext {
  return { ...DEFAULT_MARKET_CONTEXT, ...(context || {}) };
}

/** Low-level call. Returns string content, or throws on hard failure. */
export async function groqChat(messages: ChatMsg[], opts: ChatOpts = {}): Promise<string> {
  if (!aiEnabled()) throw new Error('AI_DISABLED');
  const body: any = {
    model: getModel(),
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 800,
  };
  if (opts.json) body.response_format = { type: 'json_object' };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const j = await res.json();
  return j?.choices?.[0]?.message?.content ?? '';
}

/** Safe wrapper: never throws to the route; returns null on failure so routes can degrade. */
async function safeChat(messages: ChatMsg[], opts: ChatOpts = {}): Promise<string | null> {
  if (!aiEnabled()) return null;
  try {
    return await groqChat(messages, opts);
  } catch (e) {
    console.warn('[ai] groq failed:', (e as Error).message);
    return null;
  }
}

/** Try to parse JSON returned by the model; fall back to null on bad JSON. */
function safeJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  // Strip ``` fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

// ─── CRM-specific helpers ───────────────────────────────────────────────────

export interface LeadScoreResult {
  score: number;        // 0–100
  tier: 'Hot' | 'Warm' | 'Cool' | 'Cold';
  reasoning: string;    // 1-sentence explanation
  nextAction: string;   // suggested next step
  aiGenerated: boolean;
}

/** Rule-based fallback if Groq is unavailable. */
function fallbackScore(lead: { value?: number; stage?: string; source?: string; email?: string | null }): LeadScoreResult {
  let s = 30;
  if ((lead.value || 0) > 100_000) s += 30;
  else if ((lead.value || 0) > 25_000) s += 15;
  if (lead.stage && ['Qualified', 'Proposal', 'Negotiation'].includes(lead.stage)) s += 25;
  if (lead.email) s += 10;
  if (lead.source && ['Referral', 'Inbound', 'Demo'].includes(lead.source)) s += 10;
  s = Math.max(0, Math.min(100, s));
  const tier: LeadScoreResult['tier'] = s >= 75 ? 'Hot' : s >= 55 ? 'Warm' : s >= 35 ? 'Cool' : 'Cold';
  return {
    score: s,
    tier,
    reasoning: 'Heuristic score from value, stage, and source. Enable Groq for richer reasoning.',
    nextAction: tier === 'Hot' ? 'Book a demo this week' : tier === 'Warm' ? 'Send case study + follow up in 3 days' : 'Add to nurture sequence',
    aiGenerated: false,
  };
}

export async function scoreLead(lead: {
  company: string; contact?: string | null; email?: string | null;
  stage?: string; value?: number; source?: string | null; notes?: string | null;
}, context?: Partial<MarketContext>): Promise<LeadScoreResult> {
  const m = withMarketContext(context);
  if (!aiEnabled()) return fallbackScore(lead);

  const sys = `You are an enterprise B2B sales coach.
Respond in locale ${m.locale} and use culturally appropriate business language for country ${m.country}.
Monetary references must use currency ${m.currency}.
Score the lead 0-100 and respond ONLY with JSON: {"score":int,"tier":"Hot|Warm|Cool|Cold","reasoning":"1 sentence","nextAction":"1 actionable next step"}.`;
  const user = `Lead:\nCompany: ${lead.company}\nContact: ${lead.contact || '—'}\nEmail: ${lead.email || '—'}\nStage: ${lead.stage || 'Lead'}\nDeal value: ${m.currency} ${(lead.value || 0).toLocaleString(m.locale)}\nSource: ${lead.source || '—'}\nNotes: ${lead.notes || '—'}\nMarket context: locale=${m.locale}, country=${m.country}, currency=${m.currency}, timezone=${m.timezone}`;

  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.2, json: true });
  const parsed = safeJson<LeadScoreResult>(raw);
  if (!parsed || typeof parsed.score !== 'number') return fallbackScore(lead);
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    tier: parsed.tier || (parsed.score >= 75 ? 'Hot' : parsed.score >= 55 ? 'Warm' : parsed.score >= 35 ? 'Cool' : 'Cold'),
    reasoning: parsed.reasoning || '',
    nextAction: parsed.nextAction || '',
    aiGenerated: true,
  };
}

export async function draftEmail(input: {
  company: string; contact?: string | null; stage?: string; value?: number;
  purpose: 'follow_up' | 'demo_request' | 'objection_handle' | 'thank_you';
  context?: string;
}, marketContext?: Partial<MarketContext>): Promise<{ subject: string; body: string; aiGenerated: boolean }> {
  const m = withMarketContext(marketContext);
  if (!aiEnabled()) {
    return {
      subject: `Following up — ${input.company}`,
      body: `Hi ${input.contact || 'there'},\n\nWanted to circle back on our previous conversation about ${input.company}. Let me know if you have time this week for a quick chat.\n\nBest,\nHARVICS team`,
      aiGenerated: false,
    };
  }
  const sys = `You write concise B2B sales emails.
Language must be ${m.locale}. Tone must match business expectations in ${m.country}.
Use currency ${m.currency} when mentioning money.
Respond ONLY with JSON: {"subject":"...","body":"..."}.
Keep body under 120 words, no fluff, end with one clear CTA.`;
  const user = `Write a ${input.purpose.replace('_', ' ')} email.\nCompany: ${input.company}\nContact: ${input.contact || 'their team'}\nStage: ${input.stage || 'Lead'}\nDeal value: ${m.currency} ${(input.value || 0).toLocaleString(m.locale)}\nExtra context: ${input.context || 'none'}\nMarket context: locale=${m.locale}, country=${m.country}, currency=${m.currency}, timezone=${m.timezone}`;
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.5, json: true });
  const parsed = safeJson<{ subject: string; body: string }>(raw);
  if (!parsed?.subject || !parsed?.body) {
    return {
      subject: `Following up — ${input.company}`,
      body: `Hi ${input.contact || 'there'},\n\nWanted to circle back on ${input.company}. Available this week for a call?\n\nBest,\nHARVICS team`,
      aiGenerated: false,
    };
  }
  return { subject: parsed.subject, body: parsed.body, aiGenerated: true };
}

export async function summariseActivities(
  activities: Array<{ type: string; note: string; at: Date }>,
  marketContext?: Partial<MarketContext>
): Promise<{ summary: string; aiGenerated: boolean }> {
  const m = withMarketContext(marketContext);
  if (activities.length === 0) return { summary: 'No activities yet.', aiGenerated: false };
  if (!aiEnabled() || activities.length < 2) {
    return { summary: `${activities.length} touchpoint(s). Latest: ${activities[0].type} — ${activities[0].note.slice(0, 80)}`, aiGenerated: false };
  }
  const sys = `You summarise CRM activity timelines into 1-2 sentence executive briefs.
Use locale ${m.locale} language and phrasing for country ${m.country}.
Always factual, never invented.`;
  const user = `Market context: locale=${m.locale}, country=${m.country}, currency=${m.currency}, timezone=${m.timezone}\n` +
    'Activities (newest first):\n' + activities.slice(0, 20).map(a => `- [${a.type}] ${a.at.toISOString().slice(0, 10)}: ${a.note}`).join('\n');
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.3, maxTokens: 200 });
  if (!raw) return { summary: `${activities.length} touchpoints recorded.`, aiGenerated: false };
  return { summary: raw.trim(), aiGenerated: true };
}

export async function classifyIntent(transcript: string): Promise<{
  intent: 'search' | 'create' | 'update' | 'navigate' | 'report' | 'unknown';
  entities: Record<string, any> | null;
  confidence: number;
  aiGenerated: boolean;
}> {
  if (!aiEnabled()) {
    // Falls back to existing regex
    return { intent: 'unknown', entities: null, confidence: 0.3, aiGenerated: false };
  }
  const sys = 'Classify the user command into one of: search, create, update, navigate, report, unknown. Extract entities (object names, IDs, filters). Respond ONLY with JSON: {"intent":"...","entities":{...},"confidence":0-1}.';
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: transcript }], { temperature: 0.1, json: true });
  const parsed = safeJson<any>(raw);
  if (!parsed?.intent) return { intent: 'unknown', entities: null, confidence: 0.3, aiGenerated: false };
  return {
    intent: parsed.intent,
    entities: parsed.entities || null,
    confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.7)),
    aiGenerated: true,
  };
}

// ─── SAP+ ERP intelligence (better-than-SAP because of AI) ─────────────────

export interface SapAiAdvice {
  headline: string;
  narrative: string;
  actions: string[];
  risks: string[];
  confidence: number;
  aiGenerated: boolean;
}

function fallbackAdvice(headline: string, narrative: string, actions: string[], risks: string[] = []): SapAiAdvice {
  return { headline, narrative, actions, risks, confidence: 0.45, aiGenerated: false };
}

/** CFO-grade variance narrative for Controlling / FP&A. */
export async function explainVariance(input: {
  period: string;
  rows: Array<{ code?: string; account?: string; name?: string; plan: number; actual: number; variance: number; variancePct?: number | null }>;
}): Promise<SapAiAdvice> {
  const material = input.rows
    .filter((r) => Math.abs(r.variance) >= 1)
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 12);
  if (!material.length) {
    return fallbackAdvice('On plan', `Period ${input.period}: no material variances.`, ['Continue monitoring'], []);
  }
  if (!aiEnabled()) {
    const top = material[0];
    const label = top.code || top.account || top.name || 'line';
    return fallbackAdvice(
      `${label} drives variance`,
      `Largest variance ${top.variance.toLocaleString()} on ${label}. Enable Groq for CFO narrative.`,
      ['Review drivers with cost-center owner', 'Re-forecast next period'],
      ['Heuristic only — not LLM'],
    );
  }
  const sys = `You are a SAP Controlling (CO) + FP&A CFO advisor for HARVICS trading house.
Respond ONLY with JSON: {"headline":"≤12 words","narrative":"2-4 sentences","actions":["3 concrete next steps"],"risks":["1-2 risks"],"confidence":0-1}.
Be factual from the numbers. Never invent accounts. Prefer volume/price/mix/timing language.`;
  const user = `Period ${input.period}\nVariances (plan vs actual):\n` +
    material.map((r) => `- ${r.code || r.account || r.name}: plan ${r.plan}, actual ${r.actual}, var ${r.variance}${r.variancePct != null ? ` (${r.variancePct}%)` : ''}`).join('\n');
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.25, json: true, maxTokens: 700 });
  const parsed = safeJson<SapAiAdvice>(raw);
  if (!parsed?.headline || !parsed?.narrative) {
    return fallbackAdvice('Variance review needed', `Period ${input.period}: ${material.length} material lines.`, ['Open Controlling report'], []);
  }
  return {
    headline: parsed.headline,
    narrative: parsed.narrative,
    actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 3) : [],
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
    aiGenerated: true,
  };
}

/** AR collections coach — prioritise who to call and scripts. */
export async function arCollectionsCoach(input: {
  items: Array<{ invoiceNo: string; customerName?: string; outstanding: number; daysOverdue: number; bucket?: string }>;
}): Promise<SapAiAdvice & { priority: Array<{ invoiceNo: string; why: string; script: string }> }> {
  const open = [...input.items].sort((a, b) => b.daysOverdue - a.daysOverdue || b.outstanding - a.outstanding).slice(0, 15);
  if (!open.length) {
    return { ...fallbackAdvice('AR clean', 'No open receivables in the collections queue.', ['Maintain dunning cadence'], []), priority: [] };
  }
  if (!aiEnabled()) {
    const priority = open.slice(0, 5).map((i) => ({
      invoiceNo: i.invoiceNo,
      why: `${i.daysOverdue}d overdue · ${i.outstanding}`,
      script: `Hi ${i.customerName || 'team'}, following up on ${i.invoiceNo} outstanding ${i.outstanding}. Can we confirm payment date this week?`,
    }));
    return {
      ...fallbackAdvice('Collect oldest first', 'Heuristic priority by days overdue × amount.', ['Call top 5 today', 'Offer payment plan >60d'], ['Heuristic']),
      priority,
    };
  }
  const sys = `You are an SAP FI-AR collections AI that beats classic dunning lists.
Respond ONLY with JSON: {"headline":"...","narrative":"2-3 sentences","actions":["..."],"risks":["..."],"confidence":0-1,"priority":[{"invoiceNo":"...","why":"≤20 words","script":"≤40 word call/email opener"}]}.
Prioritise expected recovery, not only oldest. Max 5 priority rows.`;
  const user = open.map((i) => `${i.invoiceNo}|${i.customerName || '?'}|out=${i.outstanding}|od=${i.daysOverdue}|${i.bucket || ''}`).join('\n');
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.3, json: true, maxTokens: 900 });
  const parsed = safeJson<SapAiAdvice & { priority?: Array<{ invoiceNo: string; why: string; script: string }> }>(raw);
  if (!parsed?.headline) {
    return { ...fallbackAdvice('Collections focus', `${open.length} open items.`, ['Work oldest first'], []), priority: [] };
  }
  return {
    headline: parsed.headline,
    narrative: parsed.narrative,
    actions: parsed.actions || [],
    risks: parsed.risks || [],
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
    aiGenerated: true,
    priority: Array.isArray(parsed.priority) ? parsed.priority.slice(0, 5) : [],
  };
}

/** AP payment advisor — which bills to pay with limited cash. */
export async function apPaymentAdvisor(input: {
  cashAvailable?: number;
  items: Array<{ invoiceNo: string; vendorName?: string; outstanding: number; daysOverdue: number; dueDate?: string }>;
}): Promise<SapAiAdvice & { payNow: string[]; defer: string[] }> {
  const items = [...input.items].sort((a, b) => b.daysOverdue - a.daysOverdue || b.outstanding - a.outstanding).slice(0, 20);
  if (!items.length) {
    return { ...fallbackAdvice('Nothing to pay', 'AP queue empty.', [], []), payNow: [], defer: [] };
  }
  if (!aiEnabled()) {
    const payNow = items.filter((i) => i.daysOverdue > 0).slice(0, 5).map((i) => i.invoiceNo);
    const defer = items.filter((i) => !payNow.includes(i.invoiceNo)).slice(0, 5).map((i) => i.invoiceNo);
    return {
      ...fallbackAdvice('Pay overdue first', 'Heuristic: overdue → pay; current → defer.', ['Build HPay run from payNow'], ['Heuristic']),
      payNow,
      defer,
    };
  }
  const sys = `You are an SAP FI-AP treasury AI. Optimise payment sequence under cash constraints.
Respond ONLY with JSON: {"headline":"...","narrative":"...","actions":["..."],"risks":["..."],"confidence":0-1,"payNow":["invoiceNos"],"defer":["invoiceNos"]}.
Prefer: avoid supplier blocks, early-pay discounts if implied, overdue critical vendors first.`;
  const user = `Cash available: ${input.cashAvailable ?? 'unknown'}\nBills:\n` +
    items.map((i) => `${i.invoiceNo}|${i.vendorName || '?'}|${i.outstanding}|od=${i.daysOverdue}|due=${i.dueDate || ''}`).join('\n');
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.25, json: true, maxTokens: 800 });
  const parsed = safeJson<SapAiAdvice & { payNow?: string[]; defer?: string[] }>(raw);
  if (!parsed?.headline) {
    return { ...fallbackAdvice('AP sequencing', `${items.length} open bills.`, ['Create payment run'], []), payNow: [], defer: [] };
  }
  return {
    headline: parsed.headline,
    narrative: parsed.narrative,
    actions: parsed.actions || [],
    risks: parsed.risks || [],
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
    aiGenerated: true,
    payNow: Array.isArray(parsed.payNow) ? parsed.payNow.slice(0, 10) : [],
    defer: Array.isArray(parsed.defer) ? parsed.defer.slice(0, 10) : [],
  };
}

/** Period-close / journal anomaly advisor for FI-GL. */
export async function glCloseAdvisor(input: {
  trialBalanced: boolean;
  openPeriod?: string | null;
  draftCount: number;
  totalDebits?: number;
  totalCredits?: number;
  anomalies?: string[];
}): Promise<SapAiAdvice> {
  if (!aiEnabled()) {
    const actions = [
      input.draftCount > 0 ? `Post or reverse ${input.draftCount} parked journals` : 'No parked journals',
      input.trialBalanced ? 'Trial balance balanced' : 'Investigate TB imbalance before close',
      input.openPeriod ? `Review period ${input.openPeriod}` : 'Open a fiscal period',
    ];
    return fallbackAdvice(
      input.trialBalanced && input.draftCount === 0 ? 'Ready to close' : 'Close blockers remain',
      'Heuristic close checklist from TB + drafts.',
      actions,
      input.anomalies || [],
    );
  }
  const sys = `You are an SAP FI-GL period-close AI. Respond ONLY with JSON: {"headline":"...","narrative":"...","actions":["ordered checklist"],"risks":["..."],"confidence":0-1}.`;
  const user = JSON.stringify(input);
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temperature: 0.2, json: true, maxTokens: 600 });
  const parsed = safeJson<SapAiAdvice>(raw);
  if (!parsed?.headline) return fallbackAdvice('Close review', 'Unable to generate AI checklist.', ['Run trial balance'], []);
  return { ...parsed, actions: parsed.actions || [], risks: parsed.risks || [], confidence: Number(parsed.confidence) || 0.7, aiGenerated: true };
}

/** Deal risk / next-best-action for CRM opportunity. */
export async function dealRiskCoach(input: {
  name: string;
  stage?: string;
  value?: number;
  probability?: number;
  customerName?: string;
  daysInStage?: number;
}): Promise<SapAiAdvice> {
  if (!aiEnabled()) {
    const risk = (input.probability || 0) < 40 || (input.daysInStage || 0) > 21;
    return fallbackAdvice(
      risk ? 'At-risk opportunity' : 'Healthy progression',
      `${input.name} · ${input.stage || 'n/a'} · win prob ${input.probability ?? '—'}%.`,
      risk ? ['Executive sponsor call', 'Refresh commercial proposal'] : ['Advance stage with clear next meeting'],
      risk ? ['Stalled stage or low probability'] : [],
    );
  }
  const sys = `You are an SAP CRM / opportunity AI. Respond ONLY with JSON: {"headline":"...","narrative":"...","actions":["next-best-actions"],"risks":["..."],"confidence":0-1}.`;
  const raw = await safeChat(
    [{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(input) }],
    { temperature: 0.3, json: true, maxTokens: 500 },
  );
  const parsed = safeJson<SapAiAdvice>(raw);
  if (!parsed?.headline) return fallbackAdvice('Deal review', input.name, ['Update stage'], []);
  return { ...parsed, actions: parsed.actions || [], risks: parsed.risks || [], confidence: Number(parsed.confidence) || 0.7, aiGenerated: true };
}

/** Generic domain copilot with live facts injected. Returns SapAiAdvice + `response` for chat callers. */
export async function domainCopilot(input: {
  domain: string;
  message: string;
  facts: string;
}): Promise<SapAiAdvice & { response: string }> {
  const facts = (input.facts || '').slice(0, 4000);
  const offlineNarrative = facts
    ? `${facts}\n\n(AI offline — answered from live facts only. Ask about ${input.domain}.)`
    : `(AI offline — no facts provided for ${input.domain}.)`;
  if (!aiEnabled()) {
    const fb = fallbackAdvice(
      `${input.domain} brief`,
      offlineNarrative,
      [`Open ${input.domain} workspace and refresh live data`],
      ['Heuristic only — enable Groq for LLM'],
    );
    return { ...fb, response: fb.narrative };
  }
  const sys = `You are HARVICS OS domain copilot for "${input.domain}" — an AI layer that makes this ERP smarter than classic SAP.
Use ONLY the provided live facts. If facts are insufficient, say what data is missing.
Respond ONLY with JSON: {"headline":"≤12 words","narrative":"2-4 sentences","actions":["2-4 concrete next steps in the OS"],"risks":["0-2 risks"],"confidence":0-1}.`;
  const user = `User: ${input.message}\n\nLive facts:\n${facts || '(none)'}`;
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], {
    temperature: 0.35,
    json: true,
    maxTokens: 600,
  });
  const parsed = safeJson<SapAiAdvice>(raw);
  if (!parsed?.headline || !parsed?.narrative) {
    const text = (raw || facts || offlineNarrative).trim().slice(0, 600);
    const fb = fallbackAdvice(`${input.domain} brief`, text, [`Review ${input.domain} KPIs`], []);
    return { ...fb, response: fb.narrative };
  }
  const advice: SapAiAdvice = {
    headline: parsed.headline,
    narrative: parsed.narrative,
    actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 3) : [],
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
    aiGenerated: true,
  };
  return { ...advice, response: advice.narrative };
}

/**
 * Structured SAP+ advisor for OsSapAiPanel (modules #9–#72).
 * Returns headline / narrative / actions / risks JSON — not free-form chat.
 * Thin wrapper over domainCopilot with a default ERP-operator prompt.
 */
export async function domainAdvise(input: {
  domain: string;
  prompt?: string;
  facts: string;
}): Promise<SapAiAdvice> {
  const domain = String(input.domain || 'general').trim() || 'general';
  const facts = String(input.facts || '').trim();
  const prompt =
    String(input.prompt || '').trim() ||
    `Advise on current ${domain} priorities for a trading-house ERP operator. Focus on risk, variance, and next actions.`;

  const result = await domainCopilot({ domain, message: prompt, facts });
  return {
    headline: result.headline,
    narrative: result.narrative,
    actions: result.actions,
    risks: result.risks,
    confidence: result.confidence,
    aiGenerated: result.aiGenerated,
  };
}

/** Single-line AI commentary for a variance row (Module #44). */
export async function varianceLineCommentary(input: {
  account: string;
  costCenter?: string | null;
  variance: number;
  variancePct: number | null;
  classification: string;
  period: string;
}): Promise<{ commentary: string; aiGenerated: boolean }> {
  const fallback = `Account ${input.account} is ${input.variance > 0 ? 'over' : 'under'} by ${Math.abs(input.variancePct || 0).toFixed(1)}% (${input.classification}).`;
  if (!aiEnabled()) return { commentary: fallback, aiGenerated: false };
  const sys = 'Write one CFO sentence explaining this variance. No fluff. Max 35 words.';
  const raw = await safeChat(
    [{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(input) }],
    { temperature: 0.3, maxTokens: 80 },
  );
  return { commentary: (raw || fallback).trim(), aiGenerated: Boolean(raw) };
}

/** AI-native commercial invoice draft — NL brief → full document SAP FB70 cannot do. */
export type InvoiceDraftLine = {
  sku?: string;
  hsCode?: string;
  description: string;
  qty: number;
  uom?: string;
  unitPrice: number;
  taxPercent: number;
};

export type InvoiceDraft = {
  customer: string;
  billTo?: string;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  poNumber?: string;
  incoterms?: string;
  bankDetails?: string;
  notes?: string;
  lines: InvoiceDraftLine[];
  risks: string[];
  narrative: string;
  collectionsOpener?: string;
  aiGenerated: boolean;
};

function heuristicInvoiceDraft(brief: string, historyHint?: string): InvoiceDraft {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const lower = brief.toLowerCase();
  const custMatch = brief.match(/(?:invoice|bill)\s+([A-Za-z0-9 &.'-]{3,40})/i);
  const customer = (custMatch?.[1] || 'Trading Counterparty').trim();
  const qtyMatch = brief.match(/(\d+(?:\.\d+)?)\s*(bags?|mt|tons?|kg|pcs?|units?|ctns?|containers?)?/i);
  const priceMatch = brief.match(/(?:at|@|usd|\$)\s*(\d+(?:\.\d+)?)/i);
  const qty = qtyMatch ? Number(qtyMatch[1]) : 1;
  const unitPrice = priceMatch ? Number(priceMatch[1]) : 1000;
  const taxPercent = /\b(vat|gst|5%)\b/i.test(brief) ? 5 : 0;
  const desc =
    brief.replace(/^invoice\s+/i, '').slice(0, 120).trim() ||
    'Commercial goods / services per buyer brief';
  return {
    customer,
    billTo: customer,
    currency: /\baed\b/i.test(lower) ? 'AED' : /\beur\b/i.test(lower) ? 'EUR' : /\bpkr\b/i.test(lower) ? 'PKR' : 'USD',
    invoiceDate: today,
    dueDate: due,
    paymentTerms: /\bnet\s*(\d+)/i.test(brief) ? `Net ${brief.match(/\bnet\s*(\d+)/i)?.[1]}` : 'Net 30',
    poNumber: brief.match(/PO[#:\s-]*([A-Z0-9-]+)/i)?.[1],
    incoterms: /\bfob\b/i.test(lower) ? 'FOB' : /\bcif\b/i.test(lower) ? 'CIF' : /\bcfr\b/i.test(lower) ? 'CFR' : 'FOB',
    bankDetails: 'HARVICS TRADE · IBAN AE00 0000 0000 0000 0000 000 · SWIFT HARVAEAD',
    notes: historyHint || 'AI-drafted commercial invoice — review before post.',
    lines: [
      {
        sku: 'TRD-001',
        hsCode: '1006.30',
        description: desc,
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
        uom: qtyMatch?.[2] || 'EA',
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 1000,
        taxPercent,
      },
    ],
    risks: ['Heuristic draft — enable Groq for richer multi-line parsing', 'Confirm qty/price before GL post'],
    narrative: 'Parsed your brief into a commercial invoice skeleton. Confirm lines, then post — SAP needs 12 screens for this.',
    collectionsOpener: `Hi ${customer}, invoice ready for confirmation — please advise preferred settlement date.`,
    aiGenerated: false,
  };
}

export async function draftInvoiceFromBrief(input: {
  brief: string;
  customers?: string[];
  recentLines?: string[];
}): Promise<InvoiceDraft> {
  const brief = String(input.brief || '').trim();
  if (!brief) {
    return heuristicInvoiceDraft('Invoice Trading Counterparty 1 unit at 1000');
  }
  if (!aiEnabled()) {
    return heuristicInvoiceDraft(brief, input.recentLines?.slice(0, 3).join(' · '));
  }
  const sys = `You are Harvics Invoice Intelligence — an AI that builds commercial tax invoices for a global trading house.
SAP FB70 cannot do this from natural language. Respond ONLY with JSON:
{
  "customer":"...",
  "billTo":"name + city/country",
  "currency":"USD|EUR|AED|PKR",
  "invoiceDate":"YYYY-MM-DD",
  "dueDate":"YYYY-MM-DD",
  "paymentTerms":"Net 30|...",
  "poNumber":"..." or null,
  "incoterms":"FOB|CIF|CFR|EXW|DAP",
  "bankDetails":"one-line bank remittance",
  "notes":"≤20 words",
  "lines":[{"sku":"...","hsCode":"HS code","description":"...","qty":n,"uom":"EA|BAG|MT","unitPrice":n,"taxPercent":n}],
  "risks":["≤3 short risks"],
  "narrative":"2 sentences why this draft is strong",
  "collectionsOpener":"≤35 word first chase line"
}
Rules: invent plausible trading lines if brief is thin; use realistic HS codes for agri/FMCG/textiles; tax 0 or 5; 1-5 lines; never empty lines.`;
  const user = `Brief:\n${brief}\n\nKnown customers:\n${(input.customers || []).slice(0, 20).join(', ') || 'none'}\n\nRecent line patterns:\n${(input.recentLines || []).slice(0, 12).join('\n') || 'none'}`;
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], {
    temperature: 0.25,
    json: true,
    maxTokens: 1200,
  });
  const parsed = safeJson<Partial<InvoiceDraft>>(raw);
  if (!parsed?.customer || !Array.isArray(parsed.lines) || !parsed.lines.length) {
    return heuristicInvoiceDraft(brief);
  }
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return {
    customer: String(parsed.customer),
    billTo: parsed.billTo ? String(parsed.billTo) : String(parsed.customer),
    currency: String(parsed.currency || 'USD').slice(0, 3).toUpperCase(),
    invoiceDate: parsed.invoiceDate || today,
    dueDate: parsed.dueDate || due,
    paymentTerms: String(parsed.paymentTerms || 'Net 30'),
    poNumber: parsed.poNumber ? String(parsed.poNumber) : undefined,
    incoterms: parsed.incoterms ? String(parsed.incoterms) : 'FOB',
    bankDetails: parsed.bankDetails ? String(parsed.bankDetails) : 'HARVICS TRADE · Remit per advice',
    notes: parsed.notes ? String(parsed.notes) : undefined,
    lines: parsed.lines.slice(0, 12).map((l) => ({
      sku: l.sku ? String(l.sku) : undefined,
      hsCode: l.hsCode ? String(l.hsCode) : undefined,
      description: String(l.description || 'Line'),
      qty: Number(l.qty) > 0 ? Number(l.qty) : 1,
      uom: l.uom ? String(l.uom) : 'EA',
      unitPrice: Math.max(0, Number(l.unitPrice) || 0),
      taxPercent: Math.max(0, Number(l.taxPercent) || 0),
    })),
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).slice(0, 5) : [],
    narrative: String(parsed.narrative || 'AI commercial draft ready to post.'),
    collectionsOpener: parsed.collectionsOpener ? String(parsed.collectionsOpener) : undefined,
    aiGenerated: true,
  };
}

/** Beat Oracle NetSuite — credit exposure, duplicate risk, FX, leapfrog narrative. */
export async function oracleCrossCheck(input: {
  customer: string;
  amount: number;
  currency?: string;
  lineCount?: number;
  openExposure?: number;
  openInvoiceCount?: number;
  duplicateCandidates?: Array<{ invoiceNo: string; amount: number; dueDate?: string }>;
}): Promise<{
  headline: string;
  narrative: string;
  beatOracle: string[];
  risks: string[];
  actions: string[];
  creditSignal: 'ok' | 'watch' | 'block';
  duplicateRisk: 'low' | 'medium' | 'high';
  fxNote: string;
  confidence: number;
  aiGenerated: boolean;
}> {
  const exposure = Number(input.openExposure) || 0;
  const amount = Number(input.amount) || 0;
  const dups = input.duplicateCandidates || [];
  const heuristicCredit: 'ok' | 'watch' | 'block' =
    exposure + amount > 100000 ? 'block' : exposure + amount > 25000 ? 'watch' : 'ok';
  const heuristicDup: 'low' | 'medium' | 'high' =
    dups.some((d) => Math.abs(d.amount - amount) < 1) ? 'high' : dups.length ? 'medium' : 'low';
  const fxNote =
    (input.currency || 'USD') === 'USD'
      ? 'Base USD — no FX revaluation required on post.'
      : `${input.currency} invoice — lock spot rate at post; NetSuite needs currency + reval setup for this.`;

  const fallback = {
    headline: heuristicCredit === 'block' ? 'Hold — exposure spike' : 'Clear to cross Oracle',
    narrative:
      'Harvics runs credit + duplicate + FX in one AI pass before post. NetSuite spreads this across customer credit, saved searches, and SuiteTax/currency setups.',
    beatOracle: [
      'Natural-language draft → commercial tax invoice (NetSuite has no native brief→invoice)',
      'One-shot GL + printable letterhead (Suite flow is create → PDF → email as separate clicks)',
      'Trading HS / Incoterms first-class without SuiteApp consulting',
      'Collections opener born with the invoice — not a separate dunning config',
    ],
    risks: [
      heuristicCredit !== 'ok' ? `Open AR exposure ${exposure} + this ${amount}` : 'Exposure within soft band',
      heuristicDup !== 'low' ? `${dups.length} similar open invoice(s)` : 'No near-duplicate amount found',
    ],
    actions: [
      heuristicCredit === 'block' ? 'Park as Draft — require approve' : 'Post & print',
      heuristicDup === 'high' ? 'Open candidate invoices before posting' : 'Send tax invoice to buyer',
    ],
    creditSignal: heuristicCredit,
    duplicateRisk: heuristicDup,
    fxNote,
    confidence: 0.72,
    aiGenerated: false,
  };

  if (!aiEnabled()) return fallback;

  const sys = `You are Harvics Oracle-Cross — an AI that proves why Harvics Invoice Intelligence beats Oracle NetSuite AR for a trading house.
Respond ONLY with JSON:
{"headline":"...","narrative":"2 sentences","beatOracle":["4 short punches vs NetSuite"],"risks":["..."],"actions":["..."],"creditSignal":"ok|watch|block","duplicateRisk":"low|medium|high","fxNote":"...","confidence":0-1}
Be sharp, commercial, not apologetic. Prefer watch/block only when exposure or duplicates justify it.`;
  const user = JSON.stringify({
    customer: input.customer,
    amount,
    currency: input.currency || 'USD',
    lineCount: input.lineCount || 0,
    openExposure: exposure,
    openInvoiceCount: input.openInvoiceCount || 0,
    duplicates: dups.slice(0, 5),
  });
  const raw = await safeChat([{ role: 'system', content: sys }, { role: 'user', content: user }], {
    temperature: 0.25,
    json: true,
    maxTokens: 900,
  });
  const parsed = safeJson<Partial<typeof fallback>>(raw);
  if (!parsed?.headline) return fallback;
  const creditSignal = ['ok', 'watch', 'block'].includes(String(parsed.creditSignal))
    ? (parsed.creditSignal as 'ok' | 'watch' | 'block')
    : heuristicCredit;
  const duplicateRisk = ['low', 'medium', 'high'].includes(String(parsed.duplicateRisk))
    ? (parsed.duplicateRisk as 'low' | 'medium' | 'high')
    : heuristicDup;
  return {
    headline: String(parsed.headline),
    narrative: String(parsed.narrative || fallback.narrative),
    beatOracle: Array.isArray(parsed.beatOracle) ? parsed.beatOracle.map(String).slice(0, 6) : fallback.beatOracle,
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).slice(0, 5) : fallback.risks,
    actions: Array.isArray(parsed.actions) ? parsed.actions.map(String).slice(0, 5) : fallback.actions,
    creditSignal,
    duplicateRisk,
    fxNote: String(parsed.fxNote || fxNote),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.75)),
    aiGenerated: true,
  };
}
