import { NextResponse } from 'next/server';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';

export const runtime = 'nodejs';

const CF_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function isAuthorized(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
  if (!INTERNAL_API_KEY) return false;
  return apiKey === INTERNAL_API_KEY || bearerToken === INTERNAL_API_KEY;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing from .env.local' }, { status: 500 });
    }
    if (!CLOUDFLARE_API_TOKEN) {
      return NextResponse.json({ error: 'CLOUDFLARE_API_TOKEN is missing from .env.local' }, { status: 500 });
    }
    if (!CLOUDFLARE_ACCOUNT_ID) {
      return NextResponse.json({ error: 'CLOUDFLARE_ACCOUNT_ID is missing from .env.local' }, { status: 500 });
    }

    // Step 1: Groq enhances the prompt
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: HARVICS_PROMPT_ENGINEER_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text();
      return NextResponse.json({ error: 'Groq failed', detail }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const enhancedPrompt: string = groqData?.choices?.[0]?.message?.content?.trim() || prompt;

    // Step 2: Cloudflare Workers AI generates the image
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
    const cfRes = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: JSON.stringify({ prompt: enhancedPrompt }),
    });

    if (!cfRes.ok) {
      const detail = await cfRes.text();
      return NextResponse.json({ error: 'Cloudflare AI failed', detail }, { status: 502 });
    }

    const cfData = await cfRes.json();
    const base64: string | undefined = cfData?.result?.image;

    if (!base64) {
      return NextResponse.json(
        { error: 'Cloudflare AI returned no image', detail: cfData },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt,
      image: `data:image/jpeg;base64,${base64}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}