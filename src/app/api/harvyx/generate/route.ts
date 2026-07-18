import { NextResponse } from 'next/server';
import { callOpenAI, callNvidia } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

type GenType = 'email' | 'linkedin_post' | 'linkedin_dm' | 'linkedin_connect' | 'social_post' | 'whatsapp';

const BRAND = `Harvics Global — a B2B denim & textile trade company sourcing and supplying premium denim, fabrics and apparel across Europe, the GCC and Asia.`;

function leadLine(lead: any): string {
  if (!lead) return '';
  const bits = [
    lead.contactName && `Name: ${lead.contactName}`,
    lead.title && `Title: ${lead.title}`,
    lead.company && `Company: ${lead.company}`,
    (lead.city || lead.country) && `Location: ${[lead.city, lead.country].filter(Boolean).join(', ')}`,
    lead.segment && `Segment: ${lead.segment}`,
    lead.website && `Website: ${lead.website}`,
  ].filter(Boolean);
  return bits.length ? `Recipient details:\n${bits.join('\n')}` : '';
}

function buildPrompt(type: GenType, opts: any): { system: string; user: string; json?: boolean } {
  const tone = opts.tone || 'professional, warm, concise';
  const topic = opts.topic || '';
  const lead = opts.lead;
  const extra = opts.notes ? `\nExtra context / instructions: ${opts.notes}` : '';

  switch (type) {
    case 'email':
      return {
        json: true,
        system: `You write high-converting B2B cold outreach emails for ${BRAND} You avoid spammy language, keep it to 90-140 words, one clear CTA (a short call or samples). Return STRICT JSON: {"subject": "...", "body": "..."} with no markdown.`,
        user: `Write a personalized cold email.\nTone: ${tone}.\n${leadLine(lead)}\n${topic ? `Angle/offer: ${topic}` : 'Offer: introduce Harvics denim sourcing & supply.'}${extra}`,
      };
    case 'linkedin_post':
      return {
        system: `You are a B2B social copywriter for ${BRAND} Write an engaging LinkedIn post: strong first-line hook, 120-200 words, short paragraphs, 1 clear takeaway, end with a question, add 3-5 relevant hashtags on the last line. No emojis unless they add value.`,
        user: `Topic: ${topic || 'why sourcing denim from vetted mills matters in 2026'}.\nTone: ${tone}.${extra}`,
      };
    case 'linkedin_connect':
      return {
        system: `You write LinkedIn connection request notes for ${BRAND} STRICT limit: under 300 characters. Personal, no hard selling, reference their role/company.`,
        user: `Write a connection note.\n${leadLine(lead)}\n${topic ? `Reason: ${topic}` : ''}${extra}`,
      };
    case 'linkedin_dm':
      return {
        system: `You write LinkedIn direct messages (first touch after connecting) for ${BRAND} 40-80 words, friendly, one soft CTA. No links.`,
        user: `Write a first LinkedIn DM.\n${leadLine(lead)}\n${topic ? `Angle: ${topic}` : ''}${extra}`,
      };
    case 'social_post':
      return {
        system: `You write short social media captions for ${BRAND} for platforms like Instagram/X. Punchy, 1-3 sentences, 3-6 hashtags. Return plain text.`,
        user: `Topic: ${topic || 'premium denim sourcing'}.\nTone: ${tone}.${extra}`,
      };
    case 'whatsapp':
      return {
        system: `You write short WhatsApp business outreach messages for ${BRAND} Very concise (30-60 words), friendly, no links, one soft CTA. Plain text.`,
        user: `Write a WhatsApp first-touch message.\n${leadLine(lead)}\n${topic ? `Angle: ${topic}` : ''}${extra}`,
      };
    default:
      return { system: 'You are a helpful assistant.', user: topic };
  }
}

async function callGemini(system: string, user: string, json: boolean): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 700,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callGroq(system: string, user: string): Promise<string | null> {
  if (!GROQ_API_KEY) return null;
  // Try configured model, then fall back if the model string is rejected.
  const models = [GROQ_MODEL, 'llama-3.1-8b-instant', 'llama3-70b-8192'].filter(
    (m, i, arr) => m && arr.indexOf(m) === i,
  );
  let lastError = '';
  for (const model of models) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 700,
        temperature: 0.8,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? null;
    }
    lastError = await res.text().catch(() => `HTTP ${res.status}`);
    if (!/model|not found|decommission|does not exist/i.test(lastError)) break;
  }
  throw new Error(`Groq error: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = (body.type || 'email') as GenType;
    const { system, user, json } = buildPrompt(type, body);

    const start = Date.now();
    let raw: string | null = null;
    let engine = 'openai';

    const msgs = [{ role: 'system' as const, content: system }, { role: 'user' as const, content: user }];

    // 1. Groq — primary (fastest, free, reliable)
    engine = 'groq';
    raw = await callGroq(system, user);

    // 2. OpenAI fallback
    if (!raw) {
      engine = 'openai';
      raw = await callOpenAI(msgs, { temperature: 0.8, maxTokens: 700, jsonMode: !!json });
    }

    // 3. NVIDIA fallback
    if (!raw) {
      engine = 'nvidia';
      raw = await callNvidia(msgs, { temperature: 0.8, maxTokens: 700 });
    }

    // 4. Gemini fallback
    if (!raw) {
      engine = 'gemini';
      try { raw = await callGemini(system, user, !!json); } catch { raw = null; }
    }

    if (!raw) {
      return NextResponse.json(
        { error: 'No AI provider configured (set OPENAI_API_KEY, NVIDIA_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY).' },
        { status: 500 },
      );
    }

    // Email returns JSON {subject, body}; others return plain text.
    if (type === 'email') {
      let subject = '';
      let content = raw.trim();
      try {
        const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim());
        subject = parsed.subject || '';
        content = parsed.body || content;
      } catch {
        // model didn't return clean JSON — keep raw as body
      }
      return NextResponse.json({ type, engine, subject, content, latencyMs: Date.now() - start });
    }

    return NextResponse.json({ type, engine, content: raw.trim(), latencyMs: Date.now() - start });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
