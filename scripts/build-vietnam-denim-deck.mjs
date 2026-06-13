/**
 * Build Vietnam Denim presentation from MAFI template (downloaded from R2).
 * Run: node scripts/build-vietnam-denim-deck.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public/vietnam-denim-presentation');
const SRC = path.join(ROOT, '_mafi-source.html');
const OUT = path.join(ROOT, 'index.html');

const CDN = 'https://pub-f2496164b9544713bde9dd18d56e3663.r2.dev';

const BACKDROPS = [
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291072.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291084.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291095.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291108.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291120.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291142.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291158.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291171.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291182.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291195.webp`,
];

const PRODUCT_IMAGES = [
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291142.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291158.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291171.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291182.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291195.webp`,
  `${CDN}/assets/verticals/textiles/categories/denim/img_1781291072.webp`,
];

if (!fs.existsSync(SRC)) {
  console.error('Missing _mafi-source.html — download MAFI index from R2 first.');
  process.exit(1);
}

let html = fs.readFileSync(SRC, 'utf8');

const replacements = [
  [/Brand & Sourcing Presentation/g, 'Denim & Textile Sourcing Programme'],
  [/Textile &amp; FMCG Global Sourcing/g, 'Vietnam Denim · Global Sourcing'],
  [/Textile & FMCG Global Sourcing/g, 'Vietnam Denim · Global Sourcing'],
  [/\/mafi-presentation\//g, '/vietnam-denim-presentation/'],
  [/mafi-presentation\//g, 'vietnam-denim-presentation/'],
  [/Harvics × MAFI/g, 'Harvics × Vietnam Denim'],
  [/Harvics × Mafi/g, 'Harvics × Vietnam Denim'],
  [/Harvics Global Ventures × Mafi/g, 'Harvics Global Ventures × Vietnam Denim'],
  [/mafi@harvics\.com/g, 'denim@harvics.com'],
  [/Harvics2026/g, 'Denim2026'],
  [/final-mafi\.html/g, 'index.html'],
  [/id="mafi"/g, 'id="client"'],
  [/#mafi/g, '#client'],
  [/href="#mafi"/g, 'href="#client"'],
  [/\bMAFI\b/g, 'Vietnam Denim'],
  [/\bMafi\b/g, 'Vietnam Denim'],
  [/\bmafi\b/g, 'vietnam-denim'],
  [/FMCG Categories &amp; Product Ranges/g, 'Denim Categories & Product Ranges'],
  [/FMCG Categories & Product Ranges/g, 'Denim Categories & Product Ranges'],
  [/Brand-Led Global Sourcing Intelligence/g, 'Vietnam Denim · Global Sourcing Intelligence'],
  [/Brand-Led FMCG Sourcing\. Global Reach\./g, 'Premium Denim Sourcing. Global Reach.'],
  [/London &nbsp;·&nbsp; Milan &nbsp;·&nbsp; New York/g, 'Ho Chi Minh City &nbsp;·&nbsp; Hanoi &nbsp;·&nbsp; Da Nang'],
  [/London · Milan · New York/g, 'Ho Chi Minh City · Hanoi · Da Nang'],
  [/FMCG food &amp; drink, textiles, apparel/g, 'denim, apparel, and textile programmes'],
  [/FMCG food & drink, textiles, apparel/g, 'denim, apparel, and textile programmes'],
  [/citrus concentrates, tomato concentrates, IQF frozen fruits &amp; vegetables, and freeze-dried products/g, 'raw denim, selvedge programmes, washed finishes, workwear lines, and sustainable indigo collections'],
  [/citrus concentrates, tomato concentrates, IQF frozen fruits & vegetables, and freeze-dried products/g, 'raw denim, selvedge programmes, washed finishes, workwear lines, and sustainable indigo collections'],
  [/\$300M facility — 157,000 sqm, 100,000 tons annual capacity — launches in 2026/g, 'integrated Vietnam denim platform — mill, wash house, and export-ready finishing under one programme'],
  [/Egypt/g, 'Vietnam'],
  [/egyptian/gi, 'Vietnamese'],
  [/Sadat/g, 'Ho Chi Minh'],
  [/mafi_welcome_arabic\.mp3/g, 'music_light.mp3'],
  [/Mafi Partnership/g, 'Vietnam Denim Partnership'],
  [/FMCG Platform/g, 'Denim Platform'],
  [/FMCG buying house/g, 'denim and apparel sourcing house'],
  [/FMCG categories/g, 'denim categories'],
  [/FMCG market access/g, 'global denim market access'],
  [/FMCG trade corridors/g, 'textile trade corridors'],
  [/FMCG Platform/g, 'Denim Platform'],
  [/FMCG portfolios for retail, wholesale, private label, and industrial buyers\. Our range spans branded essentials, ingredient systems, and export-ready food lines built for global channels\./g,
   'denim programmes for retail, wholesale, private label, and brand partners. Our range spans raw and finished denim, sustainable indigo, workwear, and export-ready collections built for global channels.'],
  [/from textile and FMCG sourcing to product development/g, 'from denim and textile sourcing to product development'],
  [/The strongest FMCG models combine/g, 'The strongest denim sourcing models combine'],
  [/across key FMCG channels, wholesale programs, and industrial food categories/g, 'across key apparel channels, wholesale programmes, and industrial denim categories'],
  [/FMCG live node pulse/g, 'Denim live node pulse'],
  [/Beverage category/g, 'Raw & Selvedge Denim'],
  [/Culinary category/g, 'Washed & Finished Denim'],
  [/Frozen foods category/g, 'Workwear & Uniform Denim'],
  [/Freeze dried and specialty category/g, 'Sustainable Indigo Programmes'],
  [/Fruit puree and culinary blends category/g, 'Stretch & Performance Denim'],
  [/Private label FMCG category/g, 'Private Label Denim'],
];

for (const [from, to] of replacements) {
  html = html.replace(from, to);
}

// Replace cinema backdrop layers
const bgBlock = BACKDROPS.map((url, i) =>
  `    <div class="bg-layer${i === 0 ? ' active' : ''}" style="background-image:url('${url}')"></div>`
).join('\n');

html = html.replace(
  /<div id="cinema-bg">[\s\S]*?<\/div>\s*\n\s*<!-- ─── NAV/,
  `<div id="cinema-bg">\n${bgBlock}\n  </div>\n\n  <!-- ─── NAV`
);

// Replace product grid images (first 6 product-image src)
let pi = 0;
html = html.replace(/<img class="product-image" src="[^"]*"([^>]*)>/g, (match, rest) => {
  if (pi >= PRODUCT_IMAGES.length) return match;
  const url = PRODUCT_IMAGES[pi++];
  return `<img class="product-image" src="${url}"${rest}>`;
});

// Update product card titles
const productTitles = [
  ['Raw & Selvedge Denim', 'Premium loom-state denim programmes for brand partners and export buyers.'],
  ['Washed & Finished Denim', 'Stone wash, enzyme, laser, and eco-finishing capability across Vietnam mills.'],
  ['Workwear & Uniform Denim', 'Industrial-weight programmes with consistent shade, durability, and compliance.'],
  ['Sustainable Indigo', 'Low-water indigo, organic cotton blends, and traceable supply chain reporting.'],
  ['Stretch & Performance', 'Comfort stretch, recovery, and technical denim for contemporary retail lines.'],
  ['Private Label Denim', 'End-to-end development for retailers seeking Vietnam-origin denim collections.'],
];

let ti = 0;
html = html.replace(/<h3>[^<]*<\/h3>\s*<p>[^<]*<\/p>/g, (block) => {
  if (ti >= productTitles.length) return block;
  const [title, desc] = productTitles[ti++];
  return `<h3>${title}</h3>\n        <p>${desc}</p>`;
});

fs.writeFileSync(OUT, html);
console.log(`Wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB)`);
