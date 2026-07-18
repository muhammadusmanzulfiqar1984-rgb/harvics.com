#!/usr/bin/env node
/**
 * Generates super-quality hero images for Business Portal / Trade Hub pages.
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

const SYSTEM = `You are a world-class photography art director for a premium global B2B trade platform.
Write a precise, ultra-detailed image generation prompt (max 100 words) for a full-width cinematic hero banner.
Rules:
- Photorealistic, award-winning commercial photography — NOT digital art, NOT illustration, NOT CGI
- Specify exact camera model, lens mm, aperture, lighting setup
- Cinematic wide composition, dramatic professional lighting
- Premium, aspirational, global trade aesthetic
- NO text overlays, NO logos, NO close-up faces
- Output ONLY the prompt, nothing else.`;

const IMAGES = [
  {
    out: 'public/assets/shared/heroes/harvictrade-hero.jpg',
    label: 'HarvicTrade — Global B2B Marketplace Hero',
    prompt: `Cinematic ultra-wide aerial photograph of the world's largest international trade port at golden hour — massive container ships docking, thousands of colorful shipping containers arranged in geometric patterns, enormous loading cranes, the ocean reflecting orange and gold sunlight. Scale and global commerce. Shot on Phase One XF IQ4 150MP with 35mm tilt-shift lens, f/8, golden hour natural light, ultra-sharp, wide angle, photorealistic.`,
  },
  {
    out: 'public/assets/shared/heroes/portals-hub-hero.jpg',
    label: 'Portals Access Hub Hero',
    prompt: `Photorealistic architectural photograph of a grand modern international business headquarters at dusk — sweeping glass facade reflecting city lights, monumental entrance with warm amber interior glow visible through floor-to-ceiling windows, polished granite forecourt, luxury corporate architecture. Shot on Canon EOS R5 with 24mm tilt-shift lens, f/5.6, blue hour ambient light with warm interior contrast, photorealistic architectural photography.`,
  },
  {
    out: 'public/assets/shared/heroes/distributor-portal-hero.jpg',
    label: 'Distributor Portal Hero',
    prompt: `Photorealistic wide-angle photograph inside a state-of-the-art global distribution center — vast automated warehouse with robots and conveyor systems, rows of products perfectly organised on high-bay racking, dramatic overhead industrial LED lighting, polished floor reflecting machinery. Shot on Sony A7R V with 16mm lens, f/11, bright clean industrial interior lighting, ultra-sharp, commercial photography.`,
  },
  {
    out: 'public/assets/shared/heroes/supplier-portal-hero.jpg',
    label: 'Supplier Portal Hero',
    prompt: `Photorealistic cinematic photograph of a premium modern manufacturing facility — pristine production floor with advanced machinery, workers in clean uniforms at precision workstations, warm factory lighting with clean organised layout, global supplier B2B aesthetic. Shot on Nikon Z9 with 24-70mm at 35mm, f/8, balanced industrial natural and overhead light, professional commercial photography.`,
  },
  {
    out: 'public/assets/shared/heroes/harvictrade-marketplace.jpg',
    label: 'HarvicTrade Marketplace — Product Grid Hero',
    prompt: `Photorealistic overhead flat lay commercial photography of global trade commodities arranged elegantly — premium textiles, spices in wooden bowls, coffee beans, small copper ingots, denim fabric swatches, olive oil bottle, all arranged on dark slate with beautiful directional light. Shot on Hasselblad X2D with 90mm lens, f/5.6, soft directional studio light, ultra-sharp macro detail, luxury B2B editorial photography.`,
  },
  {
    out: 'public/assets/shared/heroes/trade-finance-hero.jpg',
    label: 'Trade Finance / HPay Hero',
    prompt: `Photorealistic photograph of an ultra-modern global financial trading floor — rows of professional traders at multiple screens showing real charts and data, panoramic floor-to-ceiling windows overlooking a major city skyline at dusk, dramatic ambient lighting, cinematic wide angle. Shot on Sony A1 with 20mm lens, f/4, available low light, ISO 3200, professional documentary photography.`,
  },
];

async function enhancePrompt(base) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: base },
      ],
      max_tokens: 200,
      temperature: 0.4,
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
  for (const img of IMAGES) {
    const file = path.join(ROOT, img.out);
    fs.mkdirSync(path.dirname(file), { recursive: true });

    console.log(`\n🎨 ${img.label}`);
    try {
      const enhanced = await enhancePrompt(img.prompt);
      console.log(`   → ${enhanced.slice(0, 110)}...`);
      const buf = await generateImage(enhanced);
      fs.writeFileSync(file, buf);
      console.log(`   ✅ Saved ${img.out} (${Math.round(buf.length/1024)}KB)`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`   ❌ ${e.message}`);
    }
  }
  console.log('\n🏁 Done.');
}

run();
