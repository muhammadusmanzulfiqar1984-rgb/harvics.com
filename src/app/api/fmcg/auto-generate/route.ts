// FMCG Auto-Generation Pipeline
// Walks the FMCG folder structure (categories/subcategories) and, for each
// target, runs Groq prompt expansion -> HuggingFace image generation ->
// Cloudflare R2 upload, then appends to the shared manifest used by
// /api/generate (GET) and the public FMCG pages.
//
// POST /api/fmcg/auto-generate
//   body: {
//     categories?: string[]      // filter by category key (e.g. ['snacks'])
//     subcategories?: string[]   // filter by subcategory slug
//     engineType?: 'FLUX'|'SDXL' // default 'SDXL'
//     perTarget?: number          // images per (category|subcategory), default 1
//     onlyMissing?: boolean       // skip targets already in manifest, default true
//     dryRun?: boolean            // return the plan without generating
//   }
//
// GET /api/fmcg/auto-generate
//   returns the plan: every FMCG category/subcategory + whether the manifest
//   already has a generated image for it.

import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { InferenceClient } from '@huggingface/inference';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { getAllCategories } from '@/utils/folderScanner';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
const CDN = process.env.NEXT_PUBLIC_CDN_URL || 'https://media.harvics.com';
const MANIFEST_KEY = 'manifest.json';
const VERTICAL = 'fmcg';

const MODEL_MAP: Record<string, string> = {
  FLUX: 'black-forest-labs/FLUX.1-schnell',
  SDXL: 'stabilityai/stable-diffusion-xl-base-1.0',
};

type EngineType = keyof typeof MODEL_MAP;

interface ManifestEntry {
  url: string;
  key: string;
  vertical: string;
  category: string;
  subcategory?: string;
  prompt: string;
  engine: string;
  generatedAt: number;
}

interface Target {
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  seedDescription: string;
}

interface GenerationResult {
  category: string;
  subcategory: string;
  url?: string;
  key?: string;
  engine?: string;
  promptUsed?: string;
  error?: string;
}

async function readManifest(): Promise<ManifestEntry[]> {
  try {
    const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: MANIFEST_KEY }));
    const body = await res.Body?.transformToString();
    return body ? JSON.parse(body) : [];
  } catch {
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

function buildTargets(filters: { categories?: string[]; subcategories?: string[] }): Target[] {
  const all = getAllCategories();
  const catFilter = filters.categories?.length ? new Set(filters.categories) : null;
  const subFilter = filters.subcategories?.length ? new Set(filters.subcategories) : null;

  const targets: Target[] = [];
  for (const cat of all) {
    if (catFilter && !catFilter.has(cat.key)) continue;
    for (const sub of cat.subcategories) {
      if (subFilter && !subFilter.has(sub.slug)) continue;
      targets.push({
        category: cat.key,
        categoryName: cat.name,
        subcategory: sub.slug,
        subcategoryName: sub.name,
        seedDescription: sub.description || cat.description || cat.name,
      });
    }
  }
  return targets;
}

async function expandPrompt(target: Target): Promise<string> {
  const userInput = `Industry: FMCG (${target.categoryName}), Subcategory: ${target.subcategoryName}. Core concept: ${target.seedDescription}`;
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: HARVICS_PROMPT_ENGINEER_SYSTEM },
      { role: 'user', content: userInput },
    ],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() || userInput;
}

async function renderImage(prompt: string, engineType: EngineType): Promise<Buffer> {
  const model = MODEL_MAP[engineType];
  const blob = await hf.textToImage(
    {
      model,
      inputs: prompt,
      parameters: {
        width: 1024,
        height: 768,
        ...(engineType === 'SDXL' && { num_inference_steps: 30 }),
      },
    },
    { outputType: 'blob' },
  );
  const raw = Buffer.from(await blob.arrayBuffer());
  return sharp(raw).webp({ quality: 90 }).toBuffer();
}

async function generateOne(target: Target, engineType: EngineType): Promise<{ entry: ManifestEntry; promptUsed: string }> {
  const promptUsed = await expandPrompt(target);
  const webp = await renderImage(promptUsed, engineType);
  const timestamp = Math.floor(Date.now() / 1000);
  const storageKey = `assets/verticals/${VERTICAL}/categories/${target.category}/${target.subcategory}/img_${timestamp}.webp`;

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
    Body: webp,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000',
  }));

  return {
    promptUsed,
    entry: {
      url: `${CDN}/${storageKey}`,
      key: storageKey,
      vertical: VERTICAL,
      category: target.category,
      subcategory: target.subcategory,
      prompt: promptUsed,
      engine: MODEL_MAP[engineType],
      generatedAt: timestamp,
    },
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing' }, { status: 500 });
    }
    if (!process.env.HF_API_KEY) {
      return NextResponse.json({ error: 'HF_API_KEY is missing' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      categories,
      subcategories,
      engineType = 'SDXL',
      perTarget = 1,
      onlyMissing = true,
      dryRun = false,
    } = body as {
      categories?: string[];
      subcategories?: string[];
      engineType?: EngineType;
      perTarget?: number;
      onlyMissing?: boolean;
      dryRun?: boolean;
    };

    if (!MODEL_MAP[engineType]) {
      return NextResponse.json({ error: `Unsupported engineType: ${engineType}` }, { status: 400 });
    }

    const allTargets = buildTargets({ categories, subcategories });
    const manifest = await readManifest();

    const has = (t: Target) => manifest.some(
      (m) => m.vertical === VERTICAL && m.category === t.category && m.subcategory === t.subcategory,
    );

    const queue = onlyMissing ? allTargets.filter((t) => !has(t)) : allTargets;

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        engineType,
        perTarget,
        onlyMissing,
        plannedCount: queue.length * Math.max(1, perTarget),
        targets: queue,
      });
    }

    const results: GenerationResult[] = [];
    const newEntries: ManifestEntry[] = [];

    for (const target of queue) {
      for (let i = 0; i < Math.max(1, perTarget); i++) {
        try {
          const { entry, promptUsed } = await generateOne(target, engineType);
          newEntries.push(entry);
          results.push({
            category: target.category,
            subcategory: target.subcategory,
            url: entry.url,
            key: entry.key,
            engine: entry.engine,
            promptUsed,
          });
        } catch (err: any) {
          results.push({
            category: target.category,
            subcategory: target.subcategory,
            error: err?.message || 'generation failed',
          });
        }
      }
    }

    if (newEntries.length) {
      const merged = [...newEntries.reverse(), ...manifest];
      await writeManifest(merged);
    }

    return NextResponse.json({
      success: true,
      engineType,
      requested: queue.length,
      generated: newEntries.length,
      failed: results.filter((r) => r.error).length,
      results,
    });
  } catch (error: any) {
    console.error('FMCG auto-generate exception:', error);
    return NextResponse.json({ error: error?.message || 'auto-generation failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const targets = buildTargets({});
    const manifest = await readManifest();
    const plan = targets.map((t) => ({
      ...t,
      hasGenerated: manifest.some(
        (m) => m.vertical === VERTICAL && m.category === t.category && m.subcategory === t.subcategory,
      ),
    }));
    return NextResponse.json({
      success: true,
      vertical: VERTICAL,
      total: plan.length,
      missing: plan.filter((p) => !p.hasGenerated).length,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'plan failed' }, { status: 500 });
  }
}
