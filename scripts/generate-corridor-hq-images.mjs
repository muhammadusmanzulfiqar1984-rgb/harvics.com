#!/usr/bin/env node
/**
 * High-quality corridor / new-web image pack.
 * Pipeline: Groq (prompt art-direction) → Cloudflare FLUX.2 klein 9B
 * Overwrites existing files so the trial + landing get fresh assets.
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-corridor-hq-images.mjs
 *   node --env-file=.env.local scripts/generate-corridor-hq-images.mjs products
 *   node --env-file=.env.local scripts/generate-corridor-hq-images.mjs verticals
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const CF_MODEL = '@cf/black-forest-labs/flux-2-klein-9b';
const CF_FALLBACK = '@cf/black-forest-labs/flux-1-schnell';

if (!GROQ_API_KEY || !CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('❌ Missing GROQ_API_KEY / CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const SYSTEM = `You are the lead photography art director for Harvics Global Ventures — a premium B2B trade corridor brand.
Visual language: cinematic global commerce, warm cream (#F5F0E8) and deep burgundy (#1A0505) atmosphere, soft gold (#C9A84C) light accents, editorial serif-era luxury without any text or logos.
Write ONE photorealistic image-generation prompt (85–110 words). Specify camera, lens, aperture, lighting, composition.
Rules: pure photography only — no CGI, illustration, UI chrome, watermarks, text, logos, or readable screens.
Output ONLY the prompt.`;

/** @type {Array<{out:string,label:string,group:string,w:number,h:number,prompt:string}>} */
const TASKS = [
  // ── Vertical category heroes (trial horizontal scroll + landing) ──
  {
    group: 'verticals',
    out: 'public/assets/verticals/01-apparels/categories/apparel/hero.jpg',
    label: 'Textiles & Apparel',
    w: 1920, h: 1080,
    prompt: 'Cinematic wide photograph inside a premium apparel trade showroom — tailored garments and fabric rolls in warm cream and burgundy tones, soft gold rim light from tall windows, polished concrete floor, Phase One 40mm, f/5.6, editorial B2B fashion commerce.',
  },
  {
    group: 'verticals',
    out: 'public/assets/verticals/02-fmcg/categories/food/hero.jpg',
    label: 'FMCG & Food',
    w: 1920, h: 1080,
    prompt: 'Wide cinematic photograph of a pristine food wholesale warehouse at golden hour — palletized olive oil, grains and packaged goods in neat rows, warm skylight beams, cream and amber palette, Sony A7R V 24mm, f/8, photoreal logistics.',
  },
  {
    group: 'verticals',
    out: 'public/assets/verticals/03-commodities/categories/agri/hero.jpg',
    label: 'Commodities / Agri',
    w: 1920, h: 1080,
    prompt: 'Aerial drone photograph of a vast grain terminal and agri commodity port at sunrise — silos, golden wheat mountains, cargo ships, warm gold light over deep shadows, DJI Hasselblad, ultra-wide cinematic global trade landscape.',
  },
  {
    group: 'verticals',
    out: 'public/assets/verticals/04-industrial/categories/machinery/hero.jpg',
    label: 'Industrial & PPE',
    w: 1920, h: 1080,
    prompt: 'Photorealistic wide interior of a modern CNC and industrial machinery hall — precision machines, polished floor reflections, cool overhead LEDs with warm accent light, clean B2B industrial aesthetic, Canon R5 24mm tilt-shift, f/8.',
  },
  {
    group: 'verticals',
    out: 'public/assets/verticals/05-minerals/categories/metals/hero.jpg',
    label: 'Minerals & Metals',
    w: 1920, h: 1080,
    prompt: 'Dramatic photograph of stacked copper cathodes and metal ingots in a port warehouse at sunset — metallic reflections, industrial cranes beyond, deep burgundy shadows and gold highlights, medium-format 35mm, cinematic metals trade.',
  },
  {
    group: 'verticals',
    out: 'public/assets/verticals/06-oil-gas/categories/downstream/hero.jpg',
    label: 'Oil, Gas & Energy',
    w: 1920, h: 1080,
    prompt: 'Cinematic blue-hour photograph of a refined fuels terminal — white storage tanks, pipelines, tanker at jetty, amber facility lights against deep sky, ultra-sharp industrial energy photography, wide angle, photoreal.',
  },

  // ── HarvicTrade category heroes ──
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/electronics-hero.jpg',
    label: 'Electronics category',
    w: 1920, h: 1080,
    prompt: 'Premium dark-studio product photograph of flagship smartphones and sealed device boxes arranged on matte black stone with subtle gold edge light and soft reflections, luxury B2B electronics trade, Hasselblad 90mm, f/4.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/commodities-hero.jpg',
    label: 'Commodities hero / video poster',
    w: 1920, h: 1080,
    prompt: 'Ultra-wide cinematic aerial of an international commodity port corridor at golden hour — containers, grain elevators, tankers, warm cream sky fading to deep burgundy shadows, Phase One 35mm, photoreal global trade.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/textiles-hero.jpg',
    label: 'Textiles hero',
    w: 1920, h: 1080,
    prompt: 'Wide commercial photograph of a modern textile mill floor with premium fabric rolls and garment racks, soft natural window light, warm cream industrial interior, Phase One 40mm, f/8, photoreal B2B textiles.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/fmcg-hero.jpg',
    label: 'FMCG hero',
    w: 1920, h: 1080,
    prompt: 'High-end warehouse photograph of organized FMCG pallets — packaged foods, oils, beverages — golden hour skylight, cream and gold palette, Sony 24mm, f/11, photoreal wholesale logistics.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/industrial-hero.jpg',
    label: 'Industrial hero',
    w: 1920, h: 1080,
    prompt: 'Realistic PPE and industrial safety warehouse — hard hats, gloves, hi-vis vests on metal shelving, strong overhead light with warm accents, Canon R5 24mm, clean modern industrial feel.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/minerals-hero.jpg',
    label: 'Minerals hero',
    w: 1920, h: 1080,
    prompt: 'Aerial of a copper and metal storage yard at a port — shiny cathodes, zinc stacks, cranes, sunset gold light, cinematic scale, photoreal documentary metals trade.',
  },
  {
    group: 'heroes',
    out: 'public/assets/harvictrade/heroes/energy-hero.jpg',
    label: 'Energy hero',
    w: 1920, h: 1080,
    prompt: 'Photoreal refined oil products terminal at blue hour — tanks, pipelines, tanker ship, dramatic lighting, wide angle professional energy photography.',
  },

  // ── Shared corridor / portal heroes ──
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/harvictrade-hero.jpg',
    label: 'Campaign — HarvicTrade gate',
    w: 1920, h: 1080,
    prompt: 'Cinematic ultra-wide aerial of the world’s busiest trade port at golden hour — container ships, geometric container stacks, loading cranes, ocean reflecting gold light, Phase One 35mm tilt-shift, f/8, aspirational global commerce.',
  },
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/portals-hub-hero.jpg',
    label: 'Market gate — portals hub',
    w: 1920, h: 1080,
    prompt: 'Architectural dusk photograph of a grand modern trade headquarters — glass facade, warm amber interior glow, polished granite forecourt, cream and burgundy evening light, Canon R5 24mm tilt-shift, photoreal.',
  },
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/harvictrade-marketplace.jpg',
    label: 'Process — marketplace',
    w: 1920, h: 1080,
    prompt: 'Overhead editorial flat lay of global trade goods on dark slate — textiles, spices, coffee, copper samples, olive oil, denim — soft gold directional light, Hasselblad 90mm, luxury B2B still life.',
  },
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/distributor-portal-hero.jpg',
    label: 'Process — distributor',
    w: 1920, h: 1080,
    prompt: 'Wide interior of a state-of-the-art distribution center — high-bay racking, conveyors, polished floor reflections, clean industrial LEDs with warm accents, Sony 16mm, f/11, photoreal logistics.',
  },
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/supplier-portal-hero.jpg',
    label: 'Process — supplier',
    w: 1920, h: 1080,
    prompt: 'Cinematic photograph of a premium manufacturing floor — precision workstations, clean uniforms, organised layout, warm factory light, Nikon Z9 35mm, f/8, global supplier aesthetic.',
  },
  {
    group: 'shared',
    out: 'public/assets/shared/heroes/trade-finance-hero.jpg',
    label: 'Process — trade finance',
    w: 1920, h: 1080,
    prompt: 'Modern global trading floor at dusk — multiple monitors with soft bokeh charts, panoramic city skyline windows, deep burgundy shadows and gold ambient light, Sony 20mm, cinematic finance photography.',
  },

  // ── Featured products (trial cargo grid) ──
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/basmati-rice.jpg',
    label: 'Basmati rice',
    w: 1280, h: 1280,
    prompt: 'Commercial still life of premium long-grain Basmati rice in an open sack and glass bowls on dark wood, warm side light, ultra-sharp grain texture, Hasselblad 90mm, cream and gold food commodity photography.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/safety-jacket.jpg',
    label: 'Hi-vis safety jacket',
    w: 1280, h: 1280,
    prompt: 'Product photograph of a bright yellow hi-vis safety jacket with reflective strips on an industrial rack, strong directional light, sharp fabric texture, commercial workwear, clean warehouse backdrop.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/copper-cathode.jpg',
    label: 'Copper cathode',
    w: 1280, h: 1280,
    prompt: 'Dramatic industrial still of stacked shiny LME copper cathodes, strong side light, metallic reflections, deep shadows, photoreal metals commodity, medium format.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/iphone.jpg',
    label: 'iPhone bulk',
    w: 1280, h: 1280,
    prompt: 'Premium product photography of sealed flagship smartphone boxes with one open device on matte black surface, soft studio light, subtle gold rim, luxury electronics B2B, ultra sharp.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/olive-oil.jpg',
    label: 'Olive oil',
    w: 1280, h: 1280,
    prompt: 'Elegant product shot of premium extra virgin olive oil bottles on light marble with olives and leaves, soft window light, cream luxury food photography, Canon 85mm f/2.8.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/diesel-tanker.jpg',
    label: 'Diesel tanker',
    w: 1280, h: 1280,
    prompt: 'Industrial photograph of a fuel tanker loading diesel at a modern terminal at golden hour, cinematic energy trade, wide but detailed, photoreal.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/cement.jpg',
    label: 'Portland cement',
    w: 1280, h: 1280,
    prompt: 'Realistic photograph of stacked Portland cement bags in a clean industrial warehouse, strong side natural light, construction materials B2B, documentary style.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/galaxy-phone.jpg',
    label: 'Galaxy phone',
    w: 1280, h: 1280,
    prompt: 'High-end product photography of flagship Android smartphones and retail boxes on dark premium surface, clean reflections, soft directional light, luxury mobile B2B trade shot.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/chocolate.jpg',
    label: 'Chocolate',
    w: 1280, h: 1280,
    prompt: 'Luxury still life of premium chocolate gift boxes with cocoa beans on dark slate, soft dramatic light, high-end confectionery product photography.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/denim-fabric.jpg',
    label: 'Denim fabric',
    w: 1280, h: 1280,
    prompt: 'Macro photograph of rich indigo denim rolls and swatches with selvedge edge, raking light, ultra-detailed textile photography for B2B trade.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/hard-hat.jpg',
    label: 'Hard hat',
    w: 1280, h: 1280,
    prompt: 'Clean product shot of yellow and white hard hats stacked, bright studio with soft shadow, industrial safety photography, sharp detail.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/nitrile-gloves.jpg',
    label: 'Nitrile gloves',
    w: 1280, h: 1280,
    prompt: 'Close-up of stacked blue nitrile glove boxes, clean white background, soft shadows, medical/industrial supply photography.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/refined-sugar.jpg',
    label: 'Refined sugar',
    w: 1280, h: 1280,
    prompt: 'Large-scale commodity photograph of white refined sugar in industrial sacks inside a clean warehouse, dramatic light beams, photoreal bulk trade.',
  },
  {
    group: 'products',
    out: 'public/assets/harvictrade/products/cotton-tshirt.jpg',
    label: 'Cotton t-shirt',
    w: 1280, h: 1280,
    prompt: 'Editorial product photograph of folded premium cotton t-shirts in cream and burgundy tones on marble, soft natural light, apparel wholesale aesthetic.',
  },
];

async function enhancePrompt(base) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Art-direct this Harvics corridor image:\n${base}` },
      ],
      max_tokens: 240,
      temperature: 0.35,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content.trim().replace(/^["']|["']$/g, '');
}

async function generateFlux2(prompt, width, height) {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', String(width));
  form.append('height', String(height));
  form.append('guidance', '4.5');

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`FLUX.2 ${res.status}: ${errText.slice(0, 240)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('image/')) {
    return Buffer.from(await res.arrayBuffer());
  }

  const data = await res.json();
  const b64 = data?.result?.image || data?.image;
  if (!b64) throw new Error(`No image in FLUX.2 response: ${JSON.stringify(data).slice(0, 200)}`);
  return Buffer.from(b64, 'base64');
}

async function generateFlux1Fallback(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_FALLBACK}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CF_API_TOKEN}`,
    },
    body: JSON.stringify({ prompt, num_steps: 8 }),
  });
  if (!res.ok) throw new Error(`FLUX.1 fallback ${res.status}`);
  const data = await res.json();
  const b64 = data?.result?.image;
  if (!b64) throw new Error('No image from FLUX.1 fallback');
  return Buffer.from(b64, 'base64');
}

async function generateImage(prompt, width, height) {
  try {
    return await generateFlux2(prompt, width, height);
  } catch (e) {
    console.warn(`   ⚠ FLUX.2 failed (${e.message}) — falling back to FLUX.1 schnell`);
    return generateFlux1Fallback(prompt);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const filter = (process.argv[2] || '').toLowerCase();
  const tasks = TASKS.filter((t) => {
    if (!filter) return true;
    return t.group === filter || t.out.includes(filter) || t.label.toLowerCase().includes(filter);
  });

  console.log(`\n🎨 Harvics corridor HQ generation`);
  console.log(`   Model: Groq ${GROQ_MODEL} → ${CF_MODEL}`);
  console.log(`   Tasks: ${tasks.length}${filter ? ` (filter: ${filter})` : ''}\n`);

  let ok = 0;
  let fail = 0;

  for (const task of tasks) {
    const fullPath = path.join(ROOT, task.out);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    console.log(`📸 ${task.label}`);
    console.log(`   → ${task.out} (${task.w}×${task.h})`);

    try {
      const prompt = await enhancePrompt(task.prompt);
      console.log(`   ${prompt.slice(0, 110)}…`);
      const buf = await generateImage(prompt, task.w, task.h);
      fs.writeFileSync(fullPath, buf);
      console.log(`   ✅ ${Math.round(buf.length / 1024)} KB\n`);
      ok++;
      await sleep(1200);
    } catch (e) {
      console.error(`   ❌ ${e.message}\n`);
      fail++;
      await sleep(2000);
    }
  }

  console.log(`🏁 Done. Generated: ${ok} · Failed: ${fail}`);
}

run();
