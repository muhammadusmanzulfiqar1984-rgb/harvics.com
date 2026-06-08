import { NextResponse } from 'next/server';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';
import fs from 'fs/promises';
import path from 'path';

// Utility: slugify a description for safe folder/file names
const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Utility: exponential back-off delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const runtime = 'nodejs';

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

  // Validate required env vars upfront
  const missing: string[] = [];
  if (!process.env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  if (!process.env.CLOUDFLARE_API_TOKEN) missing.push('CLOUDFLARE_API_TOKEN');
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (missing.length > 0) {
    return NextResponse.json({ error: 'Server misconfigured', missing }, { status: 500 });
  }

  try {
    const { items, variations = 5, location = 'studio' } = await req.json();

    // ---- Payload validation ----
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: 'items' array required" },
        { status: 400 }
      );
    }

    const batchSummary: any[] = [];

    // ---- Process each catalog item ----
    for (const item of items) {
      const { category, description } = item;
      if (!category || !description) continue;

      const slug = slugify(description);
      const images: string[] = [];
      let expandedPrompt = description; // fallback

      // ---- 1. Prompt expansion via Groq (with retries) ----
      try {
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts && !success) {
          try {
            const groqRes = await fetch(
              'https://api.groq.com/openai/v1/chat/completions',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    {
                      role: 'system',
                      content: HARVICS_PROMPT_ENGINEER_SYSTEM,
                    },
                    {
                      role: 'user',
                      content: `Product: ${description}. Styling hint: ${location}.`,
                    },
                  ],
                  temperature: 0.2,
                }),
              }
            );

            if (groqRes.status === 429) throw new Error('GROQ_RATE_LIMIT');

            const groqData = await groqRes.json();
            expandedPrompt = groqData.choices[0].message.content.trim();
            success = true;
          } catch (err: any) {
            attempts++;
            if (attempts >= maxAttempts) throw err;
            await delay(Math.pow(2, attempts) * 1000); // 2s, 4s, 8s
          }
        }
      } catch (promptErr: any) {
        batchSummary.push({
          description,
          slug,
          status: 'failed',
          error:
            promptErr.message === 'GROQ_RATE_LIMIT'
              ? 'Groq rate-limit exceeded'
              : promptErr.message,
        });
        continue; // skip to next item
      }

      // ---- 2. Image generation loop (Flux-1-Schnell) ----
      for (let i = 1; i <= Math.min(variations, 50); i++) {
        const seed = Math.floor(Math.random() * 1_000_000_000);
        try {
          const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: expandedPrompt, seed }),
            }
          );

          if (cfRes.status === 429) {
            console.warn(
              `[Batch] Cloudflare AI rate-limit hit at variation ${i}/${variations} for "${description}". Stopping further variations.`
            );
            break; // stop further variations for this item
          }

          const cfData = await cfRes.json();
          if (!cfData?.result?.image) throw new Error('EMPTY_IMAGE');

          const imgBuffer = Buffer.from(cfData.result.image, 'base64');

          // Save image to disk under /public/generated/<category>/<slug>/
          const outDir = path.join(process.cwd(), 'public', 'generated', category, slug);
          await fs.mkdir(outDir, { recursive: true });
          const filename = `${slug}-${i}-${seed}.jpg`;
          const filePath = path.join(outDir, filename);
          await fs.writeFile(filePath, imgBuffer);
          images.push(`/generated/${category}/${slug}/${filename}`);
        } catch (imgErr: any) {
          console.error(
            `[Batch] Image generation failed for "${description}" variation ${i}:`,
            imgErr.message
          );
        }
      }

      batchSummary.push({
        description,
        slug,
        category,
        expandedPrompt,
        imagesGenerated: images.length,
        images,
        status: images.length > 0 ? 'success' : 'no_images',
      });
    }

    return NextResponse.json({
      success: true,
      processed: batchSummary.length,
      results: batchSummary,
    });
  } catch (error: any) {
    console.error('[Batch] Unhandled exception:', error);
    return NextResponse.json(
      { error: error.message || 'Batch generation failed' },
      { status: 500 }
    );
  }
}
