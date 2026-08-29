/**
 * LLM inference with Groq primary → Gemini fallback on rate-limit / failure.
 * Node-side helper (Hx API / workers / scripts).
 */

import { hxLogger } from '../hx-logger';

const MODULE = 'llm.fallback';

export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type LlmResult = {
  text: string;
  engine: 'groq' | 'gemini';
  model: string;
};

function isRateLimited(status: number, body: string): boolean {
  if (status === 429) return true;
  const b = body.toLowerCase();
  return b.includes('rate limit') || b.includes('quota') || b.includes('resource_exhausted');
}

async function callGroq(
  messages: LlmMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number; json?: boolean },
): Promise<LlmResult> {
  const apiKey = process.env.GROQ_API_KEY || process.env.HX_GROQ_API_KEY || '';
  if (!apiKey) throw new Error('GROQ_API_KEY missing');

  const model = opts.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 2048,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    const err = new Error(`Groq ${res.status}: ${raw.slice(0, 300)}`);
    (err as Error & { status?: number; rateLimited?: boolean }).status = res.status;
    (err as Error & { rateLimited?: boolean }).rateLimited = isRateLimited(res.status, raw);
    throw err;
  }

  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new Error('Groq empty response');
  return { text, engine: 'groq', model };
}

async function callGemini(
  system: string,
  user: string,
  opts: { model?: string; temperature?: number; json?: boolean },
): Promise<LlmResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  const model = opts.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.4,
        maxOutputTokens: 4096,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    const err = new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
    (err as Error & { status?: number; rateLimited?: boolean }).status = res.status;
    (err as Error & { rateLimited?: boolean }).rateLimited = isRateLimited(res.status, raw);
    throw err;
  }

  const data = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')?.trim() || '';
  if (!text) throw new Error('Gemini empty response');
  return { text, engine: 'gemini', model };
}

/**
 * Prefer Groq (fast). On rate-limit or hard failure, fall back to Gemini 2.5.
 */
export async function completeWithFallback(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  groqModel?: string;
  geminiModel?: string;
}): Promise<LlmResult> {
  const messages: LlmMessage[] = [
    { role: 'system', content: opts.system },
    { role: 'user', content: opts.user },
  ];

  try {
    return await callGroq(messages, {
      model: opts.groqModel,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      json: opts.json,
    });
  } catch (err) {
    const rateLimited = Boolean((err as { rateLimited?: boolean })?.rateLimited);
    hxLogger.warn(MODULE, 'Groq failed — trying Gemini', {
      rateLimited,
      err: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    return await callGemini(opts.system, opts.user, {
      model: opts.geminiModel,
      temperature: opts.temperature,
      json: opts.json,
    });
  } catch (err) {
    hxLogger.error(MODULE, 'Gemini fallback failed', err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}
