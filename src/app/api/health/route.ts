import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  // Basic health status
  const status = { ok: true, timestamp: new Date().toISOString() };

  // Count assets per top‑level folder
  const assetBase = path.resolve(process.cwd(), 'public/assets');
  const categories = ['brand', 'corporate', 'geo', 'media', 'shared', 'verticals'];
  const assetCounts: Record<string, number> = {};

  categories.forEach(cat => {
    const dir = path.join(assetBase, cat);
    try {
      const files = fs.readdirSync(dir);
      assetCounts[cat] = files.length;
    } catch {
      assetCounts[cat] = 0;
    }
  });

  return NextResponse.json({ ...status, assetCounts });
}