#!/usr/bin/env node
/**
 * Generates premium hero images for every vertical category page.
 * Pipeline: Groq LLM (prompt enhancement) → Cloudflare Workers AI Flux-1-schnell
 * Images saved to: public/assets/verticals/XX-vertical/categories/SLUG/hero.jpg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const GROQ_API_KEY  = process.env.GROQ_API_KEY;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN;
const CF_MODEL      = '@cf/black-forest-labs/flux-1-schnell';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY || !CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('❌ Missing env vars'); process.exit(1);
}

// ─── HIGH QUALITY category definitions ───────────────────────────────────────
// Each prompt is already highly specific — Groq will refine further.
const VERTICALS = [
  {
    folder: '01-apparels', label: 'Textiles & Apparels',
    cats: [
      { slug: 'apparel',       label: 'Apparel',       prompt: 'Photorealistic editorial photography of a luxury fashion trade showroom, premium suits and dresses on racks bathed in soft natural window light, clean minimal interior, warm tones, shallow depth of field, shot on Canon 5D' },
      { slug: 'home-textiles', label: 'Home Textiles',  prompt: 'High-end product photography of premium hotel-grade bed linen, folded white and cream towels and pillows arranged on a marble surface, golden hour natural side lighting, ultra-sharp texture detail, editorial style' },
      { slug: 'fabrics',       label: 'Fabrics',        prompt: 'Close-up macro photography of tightly woven premium denim and cotton fabric texture, rich indigo blue and natural cotton white, dramatic raking light revealing thread structure, ultra-sharp textile detail, commercial photography' },
      { slug: 'accessories',   label: 'Accessories',    prompt: 'Editorial flat lay photography of premium leather handbags, silk scarves and belts on a clean white marble surface, soft diffused studio lighting, luxury B2B fashion trade show aesthetic, shot on Hasselblad' },
    ],
  },
  {
    folder: '02-fmcg', label: 'FMCG',
    cats: [
      { slug: 'food',          label: 'Food',           prompt: 'Wide photorealistic aerial view of a modern food wholesale warehouse at golden hour, organized rows of palletized goods, warm light streaming through high skylights, cinematic depth, shot on Phase One camera' },
      { slug: 'personal-care', label: 'Personal Care',  prompt: 'Clean editorial product photography of a curated row of premium skincare and personal care bottles on a light grey concrete surface, soft diffused overhead studio light, minimalist luxury B2B wholesale aesthetic' },
      { slug: 'home-care',     label: 'Home Care',      prompt: 'Real photograph of a large bright modern distribution warehouse interior with cleaning and household product pallets organized on high industrial shelves, natural light from skylights, wide angle lens' },
      { slug: 'distribution',  label: 'Distribution',   prompt: 'Cinematic wide-angle photograph of a modern logistics hub at dusk, articulated trucks lined at loading docks, warm amber facility lights, photorealistic, aerial slight perspective' },
    ],
  },
  {
    folder: '03-commodities', label: 'Commodities',
    cats: [
      { slug: 'agri',   label: 'Agri',    prompt: 'Stunning aerial drone photograph of vast golden wheat fields at sunset, grain silos in the distance, dramatic sky with warm orange clouds, photorealistic landscape photography, ultra-wide angle' },
      { slug: 'energy', label: 'Energy',  prompt: 'Real photograph of a massive crude oil pipeline crossing an open plain at sunset, dramatic purple and orange sky, industrial scale, photorealistic, shot on Sony A7R with wide lens' },
      { slug: 'softs',  label: 'Softs',   prompt: 'Close-up photorealistic photograph of freshly harvested coffee beans and cocoa pods, rich deep browns and reds, dramatic natural light, macro detail, commodity trade editorial photography' },
      { slug: 'metals', label: 'Metals',  prompt: 'Real photograph of a modern steel mill production floor, molten steel glowing orange being poured into molds, dramatic industrial lighting, smoke and steam, cinematic wide angle, photorealistic' },
    ],
  },
  {
    folder: '04-industrial', label: 'Industrial',
    cats: [
      { slug: 'chemicals', label: 'Chemicals', prompt: 'Real photograph of a modern chemical processing plant exterior at blue hour, illuminated stainless steel tanks and pipes, clean industrial architecture, photorealistic, wide angle cinematic' },
      { slug: 'machinery', label: 'Machinery',  prompt: 'Photorealistic photograph of a state-of-the-art CNC machining facility, rows of precision machines with blue indicator lights, polished concrete floor, dramatic overhead industrial lighting, clean and modern' },
      { slug: 'safety',    label: 'Safety',     prompt: 'Professional photograph of industrial safety equipment laid out on a clean surface, hard hats gloves goggles high-visibility vest, product photography style, clean white background, soft studio light' },
      { slug: 'mro',       label: 'MRO',        prompt: 'Real photograph of a well-organized industrial MRO parts warehouse, labelled bins of bearings tools and spare parts on metal shelving, bright fluorescent lighting, photorealistic wide angle' },
    ],
  },
  {
    folder: '05-minerals', label: 'Minerals',
    cats: [
      { slug: 'metals',     label: 'Metals',    prompt: 'Aerial drone photograph of a large open-pit copper mine at dawn, terracotta colored rock walls, haul trucks looking tiny below, dramatic morning light, photorealistic landscape, cinematic' },
      { slug: 'energy',     label: 'Energy',    prompt: 'Real photograph of an industrial coal processing facility with conveyor belts and stockpiles, dramatic overcast sky, wide angle, photorealistic heavy industry documentary photography' },
      { slug: 'precious',   label: 'Precious',  prompt: 'Macro photograph of raw natural gold ore specimens and silver crystals on dark rock surface, dramatic directional lighting revealing mineral texture, geological photography, ultra-sharp detail' },
      { slug: 'industrial', label: 'Industrial', prompt: 'Real photograph of a limestone quarry with large excavators at work, white rock terraces, dust in the air, dramatic wide angle landscape, photorealistic documentary photography' },
    ],
  },
  {
    folder: '06-oil-gas', label: 'Oil & Gas',
    cats: [
      { slug: 'upstream',   label: 'Upstream',   prompt: 'Photorealistic photograph of an offshore oil drilling platform at golden sunset, calm sea reflecting warm light, dramatic sky, wide angle cinematic, shot on professional camera' },
      { slug: 'midstream',  label: 'Midstream',  prompt: 'Real aerial photograph of a massive oil and gas storage terminal at dusk, white cylindrical tanks illuminated by facility lights, vast industrial scale, cinematic aerial perspective' },
      { slug: 'downstream', label: 'Downstream', prompt: 'Real photograph of a large oil refinery at night, illuminated distillation towers and pipes, dramatic reflections in wet ground, industrial cinematic photography, wide angle' },
      { slug: 'services',   label: 'Services',   prompt: 'Photorealistic photograph of oil and gas engineers in hard hats reviewing plans on an industrial site, natural outdoor lighting, documentary photojournalism style, shallow depth of field' },
    ],
  },
  {
    folder: '07-real-estate', label: 'Real Estate',
    cats: [
      { slug: 'commercial',  label: 'Commercial',  prompt: 'Architectural photograph of a modern glass office tower at golden hour, reflections of sky in the facade, clean urban setting, shot on tilt-shift lens, photorealistic professional real estate photography' },
      { slug: 'residential', label: 'Residential', prompt: 'Architectural photograph of a luxury villa exterior at dusk, warm interior lights glowing through floor-to-ceiling windows, infinity pool, manicured garden, photorealistic real estate photography' },
      { slug: 'industrial',  label: 'Industrial',  prompt: 'Aerial drone photograph of a modern industrial logistics park, clean warehouse units with skylights, organised truck bays, aerial real estate photography style, photorealistic' },
      { slug: 'services',    label: 'Services',    prompt: 'Photorealistic photograph of a professional real estate meeting inside a modern glass office, architects reviewing blueprints, natural light, editorial business photography, shallow depth of field' },
    ],
  },
  {
    folder: '08-sourcing', label: 'Global Sourcing',
    cats: [
      { slug: 'global-sourcing', label: 'Global Sourcing',  prompt: 'Aerial photograph of a major international container port with massive cargo ships and cranes, hundreds of colorful containers, golden hour light, photorealistic drone photography' },
      { slug: 'quality-control', label: 'Quality Control',  prompt: 'Real photograph of a quality control inspector in white coat examining textile products on a production line, clean factory interior, documentary photography style, shallow depth of field' },
      { slug: 'logistics',       label: 'Logistics',        prompt: 'Cinematic aerial photograph of a busy international airport cargo terminal, planes and freight vehicles, night lighting with city in background, photorealistic drone photography' },
      { slug: 'consulting',      label: 'Consulting',       prompt: 'Professional photograph of a business strategy meeting in a modern high-floor boardroom, city skyline visible through large windows, natural light, editorial corporate photography' },
    ],
  },
  {
    folder: '09-finance', label: 'Trade Finance',
    cats: [
      { slug: 'trade-finance', label: 'Trade Finance',  prompt: 'Photorealistic photograph of a modern global banking headquarters exterior, sleek glass architecture reflecting sky, financial district, professional architectural photography' },
      { slug: 'hpay',          label: 'HPay',           prompt: 'Clean product photography of a modern smartphone showing a fintech payment app interface, placed on a premium leather desk, shallow depth of field, soft studio light, editorial tech photography' },
      { slug: 'invoicing',     label: 'Invoicing',      prompt: 'Photorealistic photograph of a business professional reviewing financial documents on a glass desk in a modern office, clean natural light from large windows, editorial corporate photography' },
      { slug: 'risk',          label: 'Risk',           prompt: 'Real photograph of financial risk analysts at workstations with multiple monitors showing data charts, modern trading floor environment, documentary photography, cinematic lighting' },
    ],
  },
  {
    folder: '10-ai-tech', label: 'AI & Technology',
    cats: [
      { slug: 'ai-solutions', label: 'AI Solutions',  prompt: 'Real photograph of a modern technology campus building exterior with glass facade, surrounded by greenery, clean architecture, golden hour light, professional architectural photography' },
      { slug: 'data',         label: 'Data',          prompt: 'Real photograph of a hyperscale data center interior, rows of black server racks with blue LED indicators, cold aisle containment, ultra-clean environment, commercial photography' },
      { slug: 'integration',  label: 'Integration',   prompt: 'Photorealistic photograph of software developers collaborating around large screens in a modern open-plan tech office, warm ambient light, creative workspace, editorial photography' },
      { slug: 'support',      label: 'Support',       prompt: 'Real photograph of a professional B2B technology support team in a clean modern office, headsets, multiple screens, bright and positive workspace, documentary editorial photography' },
    ],
  },
];

const SYSTEM_PROMPT = `You are an expert photography art director for a premium B2B global trade platform.
Your task: take the provided image concept and write a precise, professional image generation prompt (max 90 words).
Rules:
- Photorealistic, high-end commercial/editorial photography style
- Specify camera, lens, lighting as if directing a real photoshoot
- No text, no logos, no people faces close-up, no fake-looking CGI
- Wide cinematic composition suitable for a full-width hero banner
- Output ONLY the final prompt, no explanation`;

async function enhancePrompt(base) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: base },
      ],
      max_tokens: 180,
      temperature: 0.5,
    }),
  });
  if (!res.ok) throw new Error(`Groq: ${res.status} ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content.trim();
}

async function generateImage(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CF_API_TOKEN}` },
    body: JSON.stringify({ prompt, num_steps: 8 }),
  });
  if (!res.ok) throw new Error(`CF AI: ${res.status} ${await res.text()}`);
  const d = await res.json();
  const b64 = d?.result?.image;
  if (!b64) throw new Error(`No image: ${JSON.stringify(d)}`);
  return Buffer.from(b64, 'base64');
}

async function run() {
  const filter = process.argv[2];

  for (const v of VERTICALS) {
    for (const c of v.cats) {
      const key = `${v.folder}/${c.slug}`;
      if (filter && !key.includes(filter)) continue;

      const dir  = path.join(ROOT, 'public', 'assets', 'verticals', v.folder, 'categories', c.slug);
      const file = path.join(dir, 'hero.jpg');

      if (fs.existsSync(file)) { console.log(`⏭  Skip: ${key}`); continue; }
      fs.mkdirSync(dir, { recursive: true });

      try {
        console.log(`\n🎨 ${v.label} › ${c.label}`);
        const enhanced = await enhancePrompt(c.prompt);
        console.log(`   → ${enhanced.slice(0, 100)}...`);
        const buf = await generateImage(enhanced);
        fs.writeFileSync(file, buf);
        console.log(`   ✅ Saved (${Math.round(buf.length/1024)}KB)`);
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        console.error(`   ❌ ${e.message}`);
      }
    }
  }
  console.log('\n🏁 Done.');
}

run();
