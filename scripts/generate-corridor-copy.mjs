#!/usr/bin/env node
/**
 * Generate polished homepage-trial copy via Groq.
 * Writes scripts/.cache/corridor-copy.json
 *
 *   node --env-file=.env.local scripts/generate-corridor-copy.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  console.error('Missing GROQ_API_KEY');
  process.exit(1);
}

const SYSTEM = `You are the senior brand copywriter for Harvics Global Ventures — a Prague-based institutional B2B trade house.
Voice: sovereign, precise, calm, never hypey, never startup-y, never emoji.
Theme: "The Corridor" — verified supply + protected settlement across 10 verticals and 42+ markets.
Return ONLY valid JSON matching the schema. No markdown fences.`;

const USER = `Write homepage copy for The Corridor trial page. Keep lines short enough for premium layout.
Schema:
{
  "metaDescription": "string ≤160 chars",
  "heroTag": "string ≤6 words",
  "heroLine": "string ≤6 words",
  "heroSupport": "string 1–2 sentences, ≤220 chars",
  "ctaPrimary": "string ≤3 words",
  "ctaSecondary": "string ≤3 words",
  "manifestoTitle": "string two short sentences or one strong line ≤12 words",
  "manifestoBody": "string 2–3 sentences ≤280 chars",
  "campaignEye": "string like 03 · …",
  "campaignTitleLine1": "string ≤4 words",
  "campaignTitleLine2": "string ≤4 words",
  "campaignCta": "string ≤3 words",
  "industriesTitle": "string ≤8 words",
  "marquee": "string uppercase phrases joined by · ",
  "opEyebrow": "string like 06 · …",
  "opTitle": "string with second clause for gold emphasis — use | to split primary|gold",
  "opLead": "string ≤160 chars",
  "wheelEyebrow": "string like 07 · …",
  "wheelTitle": "string with | split for gold part",
  "wheelLead": "string ≤160 chars",
  "marketEyebrow": "string like 08 · …",
  "marketTitle": "string ≤3 words",
  "marketLead": "string ≤180 chars",
  "productsEyebrow": "string like 09 · …",
  "productsTitle": "string ≤8 words",
  "closeEyebrow": "string like 10 · …",
  "closeTitle": "string ≤5 words",
  "closeLead": "string ≤180 chars",
  "closeCtaPrimary": "string ≤4 words",
  "closeCtaSecondary": "string ≤4 words",
  "verticalCards": [
    {"name":"Textiles & Apparel","line":"≤6 words"},
    {"name":"FMCG & Food","line":"≤6 words"},
    {"name":"Commodities","line":"≤6 words"},
    {"name":"Industrial & PPE","line":"≤6 words"},
    {"name":"Minerals & Metals","line":"≤6 words"},
    {"name":"Oil, Gas & Energy","line":"≤6 words"},
    {"name":"Electronics","line":"≤6 words"}
  ],
  "productCards": [
    {"title":"string","meta":"Origin · Incoterm · MOQ"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"},
    {"title":"string","meta":"…"}
  ]
}

Product card order must match: basmati rice, hi-vis jacket, copper cathode, iPhone, olive oil, diesel, cement, Galaxy phone.
Keep institutional B2B naming — no slang.`;

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: USER },
    ],
    temperature: 0.4,
    max_tokens: 2200,
    response_format: { type: 'json_object' },
  }),
});

if (!res.ok) {
  console.error('Groq failed', res.status, await res.text());
  process.exit(1);
}

const raw = (await res.json()).choices[0].message.content.trim();
const data = JSON.parse(raw);
const outDir = path.join(ROOT, 'scripts/.cache');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'corridor-copy.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log('✅ Wrote', outPath);
console.log(JSON.stringify(data, null, 2).slice(0, 1200));
