import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { InferenceClient } from '@huggingface/inference';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Initialize SDK clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hf = new InferenceClient(process.env.HF_API_KEY); // FIX 2: aligned to .env.local key name
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = 'harvics-media-vault';

// FIX 2: Use FLUX.1-schnell (free tier compatible) instead of FLUX.1-dev (Pro only)
const MODEL_MAP: Record<string, string> = {
  FLUX: 'black-forest-labs/FLUX.1-schnell',
  SDXL: 'stabilityai/stable-diffusion-xl-base-1.0',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vertical, category, rawPrompt, engineType = 'FLUX' } = body;

    if (!vertical || !category || !rawPrompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Groq prompt expansion
    const groqResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // FIX 1: specdec deprecated, versatile is current
      messages: [
        {
          role: 'system',
          content:
            'You are an expert commercial photography prompt engineer. Expand the user input into a highly descriptive, cinematic, photorealistic prompt tailored for global B2B logistics, corporate trade, and industrial manufacturing. Output ONLY the final prompt string, no conversational filler.',
        },
        {
          role: 'user',
          content: `Industry: ${vertical}, Category: ${category}. Core Concept: ${rawPrompt}`,
        },
      ],
      temperature: 0.7,
    });

    const optimizedPrompt = groqResponse.choices[0]?.message?.content || rawPrompt;
    const modelTarget = MODEL_MAP[engineType] || MODEL_MAP.FLUX;

    console.log(`🚀 Executing generation using model: ${modelTarget}`);

    // 2. Generate image — FIX 3: only pass num_inference_steps for SDXL
    const imageBlob = await hf.textToImage(
      {
        model: modelTarget,
        inputs: optimizedPrompt,
        parameters: {
          width: 1024,
          height: 768,
          ...(engineType === 'SDXL' && { num_inference_steps: 30 }),
        },
      },
      { outputType: 'blob' },
    );
    const rawBuffer = Buffer.from(await imageBlob.arrayBuffer());

    // FIX 1: Convert raw HF output (JPEG/PNG) → WebP using sharp
    const webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 90 })
      .toBuffer();

    const timestamp = Math.floor(Date.now() / 1000);
    const storageKey = `assets/verticals/${vertical}/categories/${category}/img_${timestamp}.webp`;

    // 3. Upload to R2
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      })
    );

    const finalPublicUrl = `${
      process.env.NEXT_PUBLIC_CDN_URL || 'https://media.harvics.com'
    }/${storageKey}`;

    return NextResponse.json({
      success: true,
      engineUsed: engineType,
      model: modelTarget,
      url: finalPublicUrl,
      promptUsed: optimizedPrompt,
      key: storageKey,
    });
  } catch (error: any) {
    console.error('Pipeline Engine Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Pipeline processing failed' },
      { status: 500 }
    );
  }
}
