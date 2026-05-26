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
const getModel = () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
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
}): Promise<LeadScoreResult> {
  if (!aiEnabled()) return fallbackScore(lead);

  const sys = 'You are an enterprise B2B sales coach. Score the lead 0-100 and respond ONLY with JSON: {"score":int,"tier":"Hot|Warm|Cool|Cold","reasoning":"1 sentence","nextAction":"1 actionable next step"}.';
  const user = `Lead:\nCompany: ${lead.company}\nContact: ${lead.contact || '—'}\nEmail: ${lead.email || '—'}\nStage: ${lead.stage || 'Lead'}\nDeal value: $${(lead.value || 0).toLocaleString()}\nSource: ${lead.source || '—'}\nNotes: ${lead.notes || '—'}`;

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
}): Promise<{ subject: string; body: string; aiGenerated: boolean }> {
  if (!aiEnabled()) {
    return {
      subject: `Following up — ${input.company}`,
      body: `Hi ${input.contact || 'there'},\n\nWanted to circle back on our previous conversation about ${input.company}. Let me know if you have time this week for a quick chat.\n\nBest,\nHARVICS team`,
      aiGenerated: false,
    };
  }
  const sys = 'You write concise B2B sales emails. Respond ONLY with JSON: {"subject":"...","body":"..."}. Keep body under 120 words, no fluff, end with one clear CTA.';
  const user = `Write a ${input.purpose.replace('_', ' ')} email.\nCompany: ${input.company}\nContact: ${input.contact || 'their team'}\nStage: ${input.stage || 'Lead'}\nDeal value: $${(input.value || 0).toLocaleString()}\nExtra context: ${input.context || 'none'}`;
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

export async function summariseActivities(activities: Array<{ type: string; note: string; at: Date }>): Promise<{ summary: string; aiGenerated: boolean }> {
  if (activities.length === 0) return { summary: 'No activities yet.', aiGenerated: false };
  if (!aiEnabled() || activities.length < 2) {
    return { summary: `${activities.length} touchpoint(s). Latest: ${activities[0].type} — ${activities[0].note.slice(0, 80)}`, aiGenerated: false };
  }
  const sys = 'You summarise CRM activity timelines into 1-2 sentence executive briefs. Mention sentiment if clear. Always factual, never invented.';
  const user = 'Activities (newest first):\n' + activities.slice(0, 20).map(a => `- [${a.type}] ${a.at.toISOString().slice(0, 10)}: ${a.note}`).join('\n');
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
