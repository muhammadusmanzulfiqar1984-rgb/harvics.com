import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { InferenceClient } from '@huggingface/inference';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
  if (!INTERNAL_API_KEY) return false;
  return apiKey === INTERNAL_API_KEY || bearerToken === INTERNAL_API_KEY;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hf = new InferenceClient(process.env.HF_API_KEY);
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = 'harvics-media-vault';
const CDN = process.env.NEXT_PUBLIC_CDN_URL || 'https://pub-f2496164b9544713bde9dd18d56e3663.r2.dev';

const MODEL_MAP: Record<string, string> = {
  FLUX: 'black-forest-labs/FLUX.1-schnell',
  SDXL: 'stabilityai/stable-diffusion-xl-base-1.0',
};

// --- Manifest helpers ---
const MANIFEST_KEY = 'manifest.json';

interface ManifestEntry {
  url: string;
  key: string;
  vertical: string;
  category: string;
  prompt: string;
  engine: string;
  generatedAt: number;
}

async function readManifest(): Promise<ManifestEntry[]> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: MANIFEST_KEY }));
    const body = await res.Body?.transformToString();
    return body ? JSON.parse(body) : [];
  } catch {
    // manifest doesn't exist yet — return empty
    return [];
  }
}

async function writeManifest(entries: ManifestEntry[]): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(entries, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}

// --- Route ---
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate required env vars upfront
  const missingEnv: string[] = [];
  if (!process.env.GROQ_API_KEY) missingEnv.push('GROQ_API_KEY');
  if (!process.env.HF_API_KEY) missingEnv.push('HF_API_KEY');
  if (!process.env.R2_ENDPOINT_URL) missingEnv.push('R2_ENDPOINT_URL');
  if (!process.env.R2_ACCESS_KEY_ID) missingEnv.push('R2_ACCESS_KEY_ID');
  if (!process.env.R2_SECRET_ACCESS_KEY) missingEnv.push('R2_SECRET_ACCESS_KEY');
  if (missingEnv.length > 0) {
    return NextResponse.json({ error: 'Server misconfigured', missing: missingEnv }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { vertical, category, rawPrompt, engineType = 'FLUX' } = body;

    if (!vertical || !category || !rawPrompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Groq prompt expansion
    const groqResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: HARVICS_PROMPT_ENGINEER_SYSTEM },
        {
          role: 'user',
          content: `Industry: ${vertical}, Category: ${category}. Core Concept: ${rawPrompt}`,
        },
      ],
      temperature: 0.7,
    });

    const optimizedPrompt = groqResponse.choices[0]?.message?.content || rawPrompt;
    const modelTarget = MODEL_MAP[engineType] || MODEL_MAP.FLUX;

    // 2. Generate image
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
    const webpBuffer = await sharp(rawBuffer).webp({ quality: 90 }).toBuffer();

    const timestamp = Math.floor(Date.now() / 1000);
    const storageKey = `assets/verticals/${vertical}/categories/${category}/img_${timestamp}.webp`;

    // 3. Upload image to R2
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
    }));

    const finalPublicUrl = `${CDN}/${storageKey}`;

    // 4. Update manifest
    const entries = await readManifest();
    entries.unshift({
      url: finalPublicUrl,
      key: storageKey,
      vertical,
      category,
      prompt: optimizedPrompt,
      engine: engineType,
      generatedAt: timestamp,
    });
    await writeManifest(entries);

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
    return NextResponse.json({ error: error.message || 'Pipeline processing failed' }, { status: 500 });
  }
}

// GET /api/generate — returns full manifest for FMCG page consumption
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const entries = await readManifest();
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
