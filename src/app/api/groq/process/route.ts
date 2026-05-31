// Pipeline: Groq (prompt enhancement) -> HuggingFace (image generation)
// App Router route handler.
//
// POST /api/groq/process
// Body: { "prompt": "a red car" }
// Returns: { success, originalPrompt, enhancedPrompt, image (data URL) }

import { NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';

export const runtime = 'nodejs';

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

    // Step 2: HuggingFace generates the image (via official SDK)
    const hf = new InferenceClient(HF_API_KEY);
    let imageBlob: Blob;
    try {
      imageBlob = await hf.textToImage(
        {
          model: HF_MODEL,
          inputs: enhancedPrompt,
          parameters: { width: 1024, height: 1024, num_inference_steps: 30 },
        },
        { outputType: 'blob' },
      );
    } catch (e: any) {
      return NextResponse.json({ error: 'HuggingFace failed', detail: e?.message || String(e) }, { status: 502 });
    }

    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64 = imageBuffer.toString('base64');
    const contentType = imageBlob.type || 'image/jpeg';

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
