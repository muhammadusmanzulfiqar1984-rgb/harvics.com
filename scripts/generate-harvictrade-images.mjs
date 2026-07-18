#!/usr/bin/env node
/**
 * Generates LOTS of super high-quality images for HarvicTrade (B2B Marketplace).
 * - Category heroes
 * - Product shots (for inside cards / detail)
 * - Mobile device mockups
 *
 * Usage: node scripts/generate-harvictrade-images.mjs [filter]
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

const SYSTEM = `You are a top-tier commercial photographer and art director for a premium global B2B trade platform called HarvicTrade.
Write an extremely detailed, photorealistic prompt (90-110 words max) for a full-width or product hero image.
Must feel like real professional photography: specify camera, lens, lighting, composition.
No text, no logos, no fake CGI, no illustrations. Pure photoreal.
For mobile mockups: show a real physical iPhone or device with a clean realistic screen showing a marketplace UI (product grid or detail), lifestyle setting.
Output ONLY the prompt.`;

const TASKS = [
  // === CATEGORY HEROES (for top of category pages) ===
  { out: 'public/assets/harvictrade/heroes/textiles-hero.jpg', label: 'HarvicTrade Textiles Category Hero',
    prompt: 'Cinematic wide commercial photograph of a massive modern textile factory floor filled with rolls of premium fabrics and workwear garments on racks, natural light from high windows, dramatic scale, shot on Phase One with 40mm lens, f/8, soft industrial daylight, photorealistic B2B trade aesthetic.' },
  { out: 'public/assets/harvictrade/heroes/fmcg-hero.jpg', label: 'HarvicTrade FMCG Category Hero',
    prompt: 'High-end wide photograph of a bright modern FMCG wholesale warehouse with perfectly organized pallets of packaged food, snacks, olive oil bottles and beverages, golden hour light through skylights, cinematic depth, shot on Sony A7R V 24mm, f/11, photorealistic commercial logistics photography.' },
  { out: 'public/assets/harvictrade/heroes/commodities-hero.jpg', label: 'HarvicTrade Commodities Category Hero',
    prompt: 'Stunning aerial drone photograph of a huge grain terminal and commodity port at sunrise — mountains of rice, sugar, and oil tanks, cargo ships, warm golden light, ultra wide cinematic, shot on DJI Inspire with Hasselblad camera, photorealistic global trade landscape.' },
  { out: 'public/assets/harvictrade/heroes/industrial-hero.jpg', label: 'HarvicTrade Industrial & PPE Category Hero',
    prompt: 'Realistic wide interior photograph of an industrial PPE and safety equipment warehouse — rows of hard hats, gloves, safety boots and vests neatly arranged on metal shelving, strong overhead lighting, clean modern industrial feel, photorealistic, shot on Canon R5 24mm tilt-shift.' },
  { out: 'public/assets/harvictrade/heroes/minerals-hero.jpg', label: 'HarvicTrade Minerals & Metals Category Hero',
    prompt: 'Dramatic aerial photograph of a large copper and metal ingot storage yard at a port, stacks of shiny copper cathodes and zinc ingots, industrial cranes, sunset light, cinematic scale, photorealistic documentary photography, shot with 35mm lens on medium format.' },
  { out: 'public/assets/harvictrade/heroes/energy-hero.jpg', label: 'HarvicTrade Energy Category Hero',
    prompt: 'Photorealistic photograph of a large refined oil products terminal at blue hour — white storage tanks, pipelines, a tanker ship at the jetty, dramatic lighting, ultra sharp, wide angle, professional industrial energy photography.' },
  { out: 'public/assets/harvictrade/heroes/electronics-hero.jpg', label: 'HarvicTrade Electronics Category Hero',
    prompt: 'Clean premium product photography of the latest Apple and Samsung flagship devices (iPhone, MacBook, Galaxy) arranged on a dark minimalist surface with subtle reflections, soft studio lighting, ultra sharp macro detail, luxury B2B electronics trade aesthetic, Hasselblad.' },

  // === FEATURED PRODUCT SHOTS ===
  { out: 'public/assets/harvictrade/products/basmati-rice.jpg', label: 'Premium Basmati Rice',
    prompt: 'Beautiful commercial still life of premium long grain Basmati rice in a large open sack and small glass bowls, warm natural side light on a dark wooden table, ultra sharp texture, photorealistic food commodity photography, Hasselblad 90mm.' },
  { out: 'public/assets/harvictrade/products/olive-oil.jpg', label: 'Extra Virgin Olive Oil',
    prompt: 'Elegant product photograph of premium extra virgin olive oil in glass bottles, some with cork, on a light marble surface with fresh olives and leaves, soft diffused window light, luxury food photography, shot on Canon 5D 85mm f/2.8.' },
  { out: 'public/assets/harvictrade/products/safety-jacket.jpg', label: 'Hi-Vis Safety Jacket',
    prompt: 'Realistic product photography of bright yellow hi-vis safety jacket with reflective strips hanging on industrial rack inside a modern warehouse, strong directional light, sharp fabric texture, commercial workwear photography.' },
  { out: 'public/assets/harvictrade/products/denim-fabric.jpg', label: 'Denim Fabric',
    prompt: 'Close-up macro photograph of rich indigo 10oz denim fabric rolls and swatches with beautiful texture and selvedge edge, dramatic raking light, ultra detailed textile photography for B2B trade, shot on macro lens.' },
  { out: 'public/assets/harvictrade/products/copper-cathode.jpg', label: 'Copper Cathode',
    prompt: 'Dramatic industrial photograph of stacked shiny LME registered copper cathodes in a warehouse, strong side lighting creating beautiful metallic reflections, photorealistic metals commodity shot, wide but detailed.' },
  { out: 'public/assets/harvictrade/products/iphone.jpg', label: 'iPhone Bulk',
    prompt: 'Premium lifestyle product photography of multiple sealed iPhone 17 Pro boxes arranged neatly on dark background with one open showing the device, soft studio lighting, luxury electronics B2B trade photography, ultra sharp.' },
  { out: 'public/assets/harvictrade/products/cement.jpg', label: 'Portland Cement',
    prompt: 'Realistic photograph of stacked Portland cement bags in a clean industrial warehouse, strong natural light from side, dust in air, construction materials B2B trade photography, wide angle documentary style.' },
  { out: 'public/assets/harvictrade/products/chocolate.jpg', label: 'Premium Chocolate',
    prompt: 'Luxury commercial photography of premium Belgian chocolate gift boxes beautifully arranged with cocoa beans and dark chocolate pieces on dark slate, soft dramatic lighting, high-end confectionery product shot.' },

  // === MORE PRODUCT VARIETY (to fill the inside) ===
  { out: 'public/assets/harvictrade/products/hard-hat.jpg', label: 'Hard Hat PPE',
    prompt: 'Clean product shot of multiple yellow and white HDPE hard hats stacked, professional industrial safety photography, bright clean studio with subtle shadow, sharp detail.' },
  { out: 'public/assets/harvictrade/products/nitrile-gloves.jpg', label: 'Nitrile Gloves',
    prompt: 'Close-up of boxes of blue nitrile gloves stacked, realistic medical/industrial supply photography, clean white background with soft shadows, sharp packaging detail.' },
  { out: 'public/assets/harvictrade/products/macbook.jpg', label: 'MacBook Pro Bulk',
    prompt: 'Premium shot of several MacBook Pro M4 laptops in retail boxes and one open on a dark surface, elegant electronics B2B photography, soft directional light, reflections, luxury tech.' },
  { out: 'public/assets/harvictrade/products/sugar.jpg', label: 'Refined Sugar',
    prompt: 'Large scale commodity photograph of white refined sugar in big industrial sacks inside a clean warehouse, dramatic light beams, photorealistic bulk commodity trade image.' },
  { out: 'public/assets/harvictrade/products/diesel.jpg', label: 'Diesel Fuel',
    prompt: 'Industrial photograph of fuel tanker truck loading diesel at a modern terminal at golden hour, cinematic energy trade photography, wide angle, photorealistic.' },
  { out: 'public/assets/harvictrade/products/towel.jpg', label: 'Egyptian Cotton Towels',
    prompt: 'Beautiful stack of premium 600 GSM Egyptian cotton bath towels in white and cream, soft natural light on marble, luxury home textiles product photography, ultra soft texture detail.' },
  { out: 'public/assets/harvictrade/products/rebar.jpg', label: 'Rebar Steel',
    prompt: 'Realistic photograph of large bundles of steel rebar in a construction materials yard, dramatic industrial lighting, strong textures, B2B metals trade photography.' },
  { out: 'public/assets/harvictrade/products/samsung.jpg', label: 'Samsung Galaxy Bulk',
    prompt: 'High-end product photography of Samsung Galaxy S25 Ultra phones and boxes arranged on dark premium surface, clean reflections, luxury mobile device B2B trade shot.' },

  // === MOBILE / DEVICE MOCKUPS ===
  { out: 'public/assets/harvictrade/mobile/mobile-marketplace.jpg', label: 'Mobile — Marketplace on iPhone',
    prompt: 'Photorealistic lifestyle shot of a modern iPhone 16 Pro standing on a dark marble desk showing a clean realistic HarvicTrade mobile app interface on screen — product grid with Basmati rice, safety jackets and olive oil listings, soft natural window light, premium business photography.' },
  { out: 'public/assets/harvictrade/mobile/mobile-rfq.jpg', label: 'Mobile — RFQ Form on Phone',
    prompt: 'Close realistic photograph of an iPhone in hand or on desk displaying a professional RFQ submission form for HarvicTrade, with fields for product quantity and origin, clean modern UI visible on screen, elegant business lifestyle, soft lighting.' },
  { out: 'public/assets/harvictrade/mobile/mobile-electronics.jpg', label: 'Mobile — Electronics Category on Phone',
    prompt: 'Photorealistic image of latest iPhone showing HarvicTrade app open on the Consumer Electronics category page with iPhones, MacBooks and Galaxy devices listed, device resting on a leather desk with another phone in background, premium tech photography.' },
  { out: 'public/assets/harvictrade/mobile/mobile-dashboard.jpg', label: 'Mobile — Trade Dashboard',
    prompt: 'Realistic photo of an iPhone displaying a clean B2B trade dashboard on HarvicTrade mobile — active RFQs, verified suppliers count, recent quotes — placed next to a cup of coffee on a wooden executive desk, warm natural light, professional mobile app mockup photography.' },
];

async function enhancePrompt(base) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: base },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content.trim();
}

async function generateImage(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CF_API_TOKEN}` },
    body: JSON.stringify({ prompt, num_steps: 8 }),
  });
  if (!res.ok) throw new Error(`Cloudflare AI ${res.status}`);
  const data = await res.json();
  const b64 = data?.result?.image;
  if (!b64) throw new Error('No image returned');
  return Buffer.from(b64, 'base64');
}

async function run() {
  const filter = process.argv[2] || '';
  let done = 0;

  for (const task of TASKS) {
    if (filter && !task.out.includes(filter)) continue;

    const fullPath = path.join(ROOT, task.out);
    if (fs.existsSync(fullPath)) {
      console.log(`⏭  Exists: ${task.label}`);
      continue;
    }

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    console.log(`\n📸 ${task.label}`);
    try {
      const prompt = await enhancePrompt(task.prompt);
      console.log(`   ${prompt.slice(0, 115)}...`);
      const buf = await generateImage(prompt);
      fs.writeFileSync(fullPath, buf);
      console.log(`   ✅ ${task.out}  (${Math.round(buf.length / 1024)} KB)`);
      done++;
      await new Promise(r => setTimeout(r, 1400));
    } catch (e) {
      console.error(`   ❌ ${e.message}`);
    }
  }

  console.log(`\n🏁 Finished. New images generated: ${done}`);
}

run();
