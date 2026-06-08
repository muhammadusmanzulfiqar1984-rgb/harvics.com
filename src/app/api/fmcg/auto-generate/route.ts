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
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { getAllCategories } from '@/utils/folderScanner';
import { HARVICS_PROMPT_ENGINEER_SYSTEM } from '@/lib/promptTemplates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function isAuthorized(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
  if (!INTERNAL_API_KEY) return false;
  return apiKey === INTERNAL_API_KEY || bearerToken === INTERNAL_API_KEY;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
const MANIFEST_KEY = 'manifest.json';
const DEFAULT_VERTICAL = 'fmcg';

// Cloudflare Workers AI — flux-1-schnell (free under WAI free tier).
const CF_FLUX_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const CF_SDXL_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';

const MODEL_MAP: Record<string, string> = {
  FLUX: CF_FLUX_MODEL,
  SDXL: CF_SDXL_MODEL,
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
  vertical: string;            // e.g. 'fmcg', 'apparels', 'commodities'
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  seedDescription: string;
}

// Strip leading '02-' / '01-' etc. from folder names
function verticalSlug(verticalDir?: string): string {
  if (!verticalDir) return DEFAULT_VERTICAL;
  return verticalDir.replace(/^\d+-/, '');
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

function buildTargets(filters: { categories?: string[]; subcategories?: string[]; verticals?: string[] }): Target[] {
  const all = getAllCategories();
  const catFilter = filters.categories?.length ? new Set(filters.categories) : null;
  const subFilter = filters.subcategories?.length ? new Set(filters.subcategories) : null;
  const vertFilter = filters.verticals?.length ? new Set(filters.verticals) : null;

  const targets: Target[] = [];
  for (const cat of all) {
    const vSlug = verticalSlug(cat.vertical);
    if (vertFilter && !vertFilter.has(vSlug)) continue;
    if (catFilter && !catFilter.has(cat.key)) continue;
    for (const sub of cat.subcategories) {
      if (subFilter && !subFilter.has(sub.slug)) continue;
      targets.push({
        vertical: vSlug,
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
  const userInput = `Industry: ${target.vertical.toUpperCase()} (${target.categoryName}), Subcategory: ${target.subcategoryName}. Core concept: ${target.seedDescription}`;
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
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN missing');
  }
  const model = MODEL_MAP[engineType];
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Cloudflare AI HTTP ${res.status}: ${detail.slice(0, 200)}`);
  }

  // flux-1-schnell returns JSON { result: { image: <base64 jpeg> } }.
  // SDXL returns raw PNG bytes.
  const contentType = res.headers.get('content-type') || '';
  let raw: Buffer;
  if (contentType.includes('application/json')) {
    const data = await res.json();
    const b64: string | undefined = data?.result?.image;
    if (!b64) throw new Error('Cloudflare AI returned no image (json)');
    raw = Buffer.from(b64, 'base64');
  } else {
    raw = Buffer.from(await res.arrayBuffer());
  }
  return sharp(raw).webp({ quality: 90 }).toBuffer();
}

async function generateOne(target: Target, engineType: EngineType): Promise<{ entry: ManifestEntry; promptUsed: string }> {
  const promptUsed = await expandPrompt(target);
  const webp = await renderImage(promptUsed, engineType);
  const timestamp = Math.floor(Date.now() / 1000);
  const storageKey = `assets/verticals/${target.vertical}/categories/${target.category}/${target.subcategory}/img_${timestamp}.webp`;

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
      vertical: target.vertical,
      category: target.category,
      subcategory: target.subcategory,
      prompt: promptUsed,
      engine: MODEL_MAP[engineType],
      generatedAt: timestamp,
    },
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing' }, { status: 500 });
    }
    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
      return NextResponse.json({ error: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      verticals,
      categories,
      subcategories,
      engineType = 'FLUX',
      perTarget = 1,
      onlyMissing = true,
      dryRun = false,
    } = body as {
      verticals?: string[];
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

    const allTargets = buildTargets({ verticals, categories, subcategories });
    const manifest = await readManifest();

    const has = (t: Target) => manifest.some(
      (m) => m.vertical === t.vertical && m.category === t.category && m.subcategory === t.subcategory,
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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const targets = buildTargets({});
    const manifest = await readManifest();
    const plan = targets.map((t) => ({
      ...t,
      hasGenerated: manifest.some(
        (m) => m.vertical === t.vertical && m.category === t.category && m.subcategory === t.subcategory,
      ),
    }));
    return NextResponse.json({
      success: true,
      total: plan.length,
      missing: plan.filter((p) => !p.hasGenerated).length,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'plan failed' }, { status: 500 });
  }
}
