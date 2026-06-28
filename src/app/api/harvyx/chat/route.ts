import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are HarvyX — the Sovereign Growth OS for Harvics Global, a denim textile trade company.
You help discover buyers, qualify leads, draft outreach, and manage the sales pipeline.
You are direct, professional, and focused on B2B textile trade in Europe, GCC, and Asia.
When users ask to find buyers in a city, respond with a structured buyer discovery result.
Keep responses concise and actionable.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const start = Date.now();
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(messages || []),
        ],
        max_tokens: 512,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '(no reply)';
    return NextResponse.json({ reply, latencyMs: Date.now() - start });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
