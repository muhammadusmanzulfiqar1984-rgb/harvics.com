// Pipeline: Groq (prompt enhancement) -> HuggingFace (image generation)
// App Router route handler.
//
// POST /api/groq/process
// Body: { "prompt": "a red car" }
// Returns: { success, originalPrompt, enhancedPrompt, image (data URL) }

import { NextResponse } from 'next/server';

export const runtime = 'edge';

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const HF_API_KEY = process.env.HF_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing from .env.local' }, { status: 500 });
    }
    if (!HF_API_KEY) {
      return NextResponse.json({ error: 'HF_API_KEY is missing from .env.local' }, { status: 500 });
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
          {
            role: 'system',
            content:
              "You are an expert image prompt engineer. Take the user's input and rewrite it as a highly detailed, photorealistic image generation prompt. Return ONLY the enhanced prompt, nothing else.",
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text();
      return NextResponse.json({ error: 'Groq failed', detail }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const enhancedPrompt: string = groqData?.choices?.[0]?.message?.content?.trim() || prompt;

    // Step 2: HuggingFace generates the image
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: enhancedPrompt }),
    });

    if (!hfRes.ok) {
      const detail = await hfRes.text();
      return NextResponse.json({ error: 'HuggingFace failed', detail }, { status: 502 });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach(byte => { binary += String.fromCharCode(byte); });
    const base64 = btoa(binary);
    const contentType = hfRes.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt,
      image: `data:${contentType};base64,${base64}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
