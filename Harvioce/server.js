require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5050;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const HISTORY_TURNS = Number(process.env.HISTORY_TURNS || 2);
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');
const OUTREACH_FILE = path.join(__dirname, 'data', 'outreach.json');
const CSV_SEARCH_ROOT = path.join(__dirname, 'HarvyX-ALL-MERGED');
const PYTHON_SEARCH_SCRIPT = path.join(__dirname, 'scripts', 'python_source_search.py');
const SOURCE_LIBRARY_FILE = path.join(__dirname, 'data', 'source-library.json');
const EVENT_LIBRARY_FILE = path.join(__dirname, 'data', 'event-library.json');
const execFileAsync = promisify(execFile);

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY || '';
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || '';
const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'outreach@harvics.com';
const FROM_NAME = process.env.FROM_NAME || 'Harvics Trade Intelligence';

const SOURCE_CATALOG = [
  'Google Places', 'Apollo', 'RocketReach', 'Lusha', 'Waalaxy', 'Python Web Scraper', 'LinkedIn Public Web',
  'Eventseye', '10Times', 'FHA Exhibitors', 'NEC Exhibitors',
  'Seafood Expo', 'IFE UK', 'OpenCorporates', 'Company House UK',
  'YellowPages', 'Europages', 'Kompass', 'TradeIndia',
  'Alibaba Directory', 'GlobalSources', 'ThomasNet', 'Crunchbase Public',
  'ImportYeti', 'Panjiva Public', 'Retailer Directory', 'Distributor Portals',
  'Chamber of Commerce Directories', 'Country Trade Associations', 'Exporter Associations', 'Importer Associations'
];

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── Elastic Email sender ────────────────────────────────────────────── */
function elasticEmailRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.elasticemail.com',
      path: '/v4/emails/transactional',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-ElasticEmail-ApiKey': ELASTIC_EMAIL_API_KEY,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendEmail({ to, toName, subject, htmlBody, replyTo }) {
  if (!ELASTIC_EMAIL_API_KEY) throw new Error('ELASTIC_EMAIL_API_KEY not configured');
  if (!to || !/@/.test(to)) throw new Error(`Invalid recipient email: "${to}"`);
  const payload = {
    Recipients: { To: [toName ? `${toName} <${to}>` : to] },
    Content: {
      Subject: subject || 'Message from Harvics Trade',
      Body: [{ ContentType: 'HTML', Content: htmlBody }],
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      ...(replyTo ? { ReplyTo: replyTo } : {}),
    },
  };
  const result = await elasticEmailRequest(payload);
  if (result.status >= 300) {
    throw new Error(`Elastic Email error ${result.status}: ${JSON.stringify(result.body)}`);
  }
  return result;
}

function buildOutreachEmailHtml({ target, message, company }) {
  const safeTarget = target || 'Valued Partner';
  const safeCompany = company || '';
  const safeMsg = (message || '').replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f5f0e8;margin:0;padding:0}
  .wrap{max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
  .header{background:#1A0505;padding:28px 32px;text-align:center}
  .logo{color:#C3A35E;font-size:22px;font-weight:700;letter-spacing:0.06em}
  .sub{color:rgba(195,163,94,0.65);font-size:11px;letter-spacing:0.12em;margin-top:4px;text-transform:uppercase}
  .body{padding:32px}
  .greeting{font-size:17px;color:#1A0505;font-weight:600;margin-bottom:16px}
  .msg{font-size:15px;color:#3d2020;line-height:1.7}
  .divider{height:1px;background:#f0e8d8;margin:24px 0}
  .footer{background:#faf6f0;padding:16px 32px;text-align:center;font-size:12px;color:#9a7c5a}
  .footer a{color:#C3A35E;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">HARVICS TRADE</div>
    <div class="sub">B2B Intelligence Platform</div>
  </div>
  <div class="body">
    <div class="greeting">Dear ${safeTarget}${safeCompany ? ` — ${safeCompany}` : ''},</div>
    <div class="msg">${safeMsg}</div>
    <div class="divider"></div>
    <div class="msg" style="font-size:13px;color:#7a5c3c">
      This message was sent via <strong>Harvoice Outreach Intelligence</strong>.<br>
      To unsubscribe or manage preferences, reply to this email.
    </div>
  </div>
  <div class="footer">
    <a href="https://harvics.com">harvics.com</a> · Trade Intelligence · B2B Sourcing
  </div>
</div>
</body></html>`;
}
/* ──────────────────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are Harvoice, a smart, natural conversational voice assistant.
- Sound like an adult human talking casually in real life.
- Use contractions and natural phrasing (like "you're", "that's", "kinda", "let's").
- Keep answers short and direct by default: 1-2 sentences.
- Be friendly, confident, and helpful, never robotic or overly formal.
- For factual queries (city/country/time), prioritize correctness over style and never guess.
- If the user seems like a potential customer from social media, qualify the lead naturally by asking for name, contact, platform, service needed, and timeline.
- If enough lead details are present, extract them and save them locally.
- Do not use markdown, lists, code formatting, or emojis.
- If user asks for detail, expand clearly but still in spoken style.
- If you do not know something, say it honestly and suggest a next step.`;

const SOCIAL_LEAD_KEYWORDS = [
  'lead', 'client', 'customer', 'inquiry', 'quote', 'price', 'pricing', 'hire', 'service',
  'instagram', 'facebook', 'meta', 'whatsapp', 'dm', 'social media', 'ad', 'ads', 'marketing',
  'website', 'bot', 'booking', 'appointment', 'contact me', 'call me', 'text me'
];

const ACTION_INTENT_PROMPT = `You classify operator intent from user chat.
Return ONLY JSON with keys:
- type: one of [none, buyer_search, generate_image_send, outreach_send]
- city: string|null
- recipient: string|null
- channel: string|null (whatsapp, instagram, linkedin, email, social)
- prompt: string|null (for image prompt)
- message: string|null (for outreach message)
- confidence: number 0..1

Rules:
- buyer_search: user asks to find/search/discover buyers/importers/distributors in a city/country.
- generate_image_send: user asks to generate/create an image and send/share to someone.
- outreach_send: user asks to send/message/reach out to someone on a channel.
- If unclear, set type to none.
- Output valid JSON only.`;

function looksLikeLeadRequest(text) {
  const lower = text.toLowerCase();
  return SOCIAL_LEAD_KEYWORDS.some(keyword => lower.includes(keyword))
    || /(?:my name is|name[:\s]|phone[:\s]|email[:\s]|budget[:\s]|company[:\s])/i.test(text);
}

async function ensureLeadsFile() {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, '[]\n', 'utf8');
  }
}

async function ensureOutreachFile() {
  await fs.mkdir(path.dirname(OUTREACH_FILE), { recursive: true });
  try {
    await fs.access(OUTREACH_FILE);
  } catch {
    await fs.writeFile(OUTREACH_FILE, '[]\n', 'utf8');
  }
}

const SOURCE_LIBRARY_SEED = SOURCE_CATALOG.map((name) => ({
  name,
  enabled: ['Google Places', 'Apollo', 'Python Web Scraper', 'RocketReach', 'Lusha', 'Waalaxy'].includes(name),
  mode: ['Google Places', 'Apollo', 'Python Web Scraper'].includes(name) ? 'wired' : 'library',
  category: /chamber|association/i.test(name)
    ? 'directory'
    : (/event|expo|ife|fha|nec/i.test(name) ? 'event' : 'lead_source')
}));

const PREMIER_VISION_PARIS_TRIAL = {
  event: 'Premier Vision Paris',
  vertical: 'Apparel / Textile',
  trialSeed: true,
  note: 'Trial library seed for the last 3 years. Use Python scraper or manual import to enrich exhibitor lists.',
  fairsIntel: [
    {
      event: 'ITMA',
      editionYear: 2023,
      city: 'Milan',
      country: 'Italy',
      exhibitors: '1700+',
      visitors: '111000',
      sourceUrl: 'https://www.itma.com/',
      sourceType: 'official',
      confidence: 'high'
    },
    {
      event: 'Intertextile Shanghai Apparel Fabrics (Spring)',
      editionYear: 2026,
      city: 'Shanghai',
      country: 'China',
      exhibitors: '3000+',
      visitors: '96000+',
      sourceUrl: 'https://intertextile-shanghai-apparel-fabrics-spring.hk.messefrankfurt.com/shanghai/en/facts-figures.html',
      sourceType: 'official_messe_frankfurt',
      confidence: 'high'
    },
    {
      event: 'Intertextile Shanghai Apparel Fabrics (Autumn)',
      editionYear: 2025,
      city: 'Shanghai',
      country: 'China',
      exhibitors: '3700+',
      visitors: '100000+',
      sourceUrl: 'https://intertextile-shanghai-apparel-fabrics-autumn.hk.messefrankfurt.com/shanghai/en/facts-figures.html',
      sourceType: 'official_messe_frankfurt',
      confidence: 'high'
    },
    {
      event: 'Heimtextil',
      editionYear: 2026,
      city: 'Frankfurt',
      country: 'Germany',
      exhibitors: null,
      visitors: '48000',
      sourceUrl: 'https://heimtextil.messefrankfurt.com/frankfurt/en/facts-figures.html',
      sourceType: 'official_messe_frankfurt',
      confidence: 'medium'
    },
    {
      event: 'Munich Fabric Start',
      editionYear: 2026,
      city: 'Munich',
      country: 'Germany',
      exhibitors: '1100 suppliers (site-stated)',
      visitors: '15000 (site-stated)',
      sourceUrl: 'https://www.munichfabricstart.com/en/',
      sourceType: 'official',
      confidence: 'medium'
    }
  ],
  years: [
    { year: 2026, editions: [
      { season: 'Spring-Summer', month: 'February', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' },
      { season: 'Autumn-Winter', month: 'July', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' }
    ]},
    { year: 2025, editions: [
      { season: 'Spring-Summer', month: 'February', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' },
      { season: 'Autumn-Winter', month: 'July', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' }
    ]},
    { year: 2024, editions: [
      { season: 'Spring-Summer', month: 'February', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' },
      { season: 'Autumn-Winter', month: 'July', city: 'Paris', country: 'France', source: 'Event/association directories', status: 'seed' }
    ]}
  ]
};

async function ensureSourceLibraryFile() {
  await fs.mkdir(path.dirname(SOURCE_LIBRARY_FILE), { recursive: true });
  try {
    await fs.access(SOURCE_LIBRARY_FILE);
  } catch {
    await fs.writeFile(SOURCE_LIBRARY_FILE, `${JSON.stringify(SOURCE_LIBRARY_SEED, null, 2)}\n`, 'utf8');
  }
}

async function ensureEventLibraryFile() {
  await fs.mkdir(path.dirname(EVENT_LIBRARY_FILE), { recursive: true });
  try {
    await fs.access(EVENT_LIBRARY_FILE);
  } catch {
    await fs.writeFile(EVENT_LIBRARY_FILE, `${JSON.stringify(PREMIER_VISION_PARIS_TRIAL, null, 2)}\n`, 'utf8');
  }
}

async function loadSourceLibrary() {
  await ensureSourceLibraryFile();
  const raw = await fs.readFile(SOURCE_LIBRARY_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SOURCE_LIBRARY_SEED;
  } catch {
    return SOURCE_LIBRARY_SEED;
  }
}

async function loadEventLibrary() {
  await ensureEventLibraryFile();
  const raw = await fs.readFile(EVENT_LIBRARY_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return PREMIER_VISION_PARIS_TRIAL;
  }
}

function buildLibraryEntries(sourceLibrary = [], eventLibrary = {}) {
  const entries = [];

  for (const source of sourceLibrary) {
    entries.push({
      kind: 'source',
      title: source.name || 'Unknown Source',
      category: source.category || 'lead_source',
      tags: [source.mode, source.enabled ? 'enabled' : 'disabled'].filter(Boolean),
      sourceUrl: null
    });
  }

  for (const fair of eventLibrary.fairsIntel || []) {
    entries.push({
      kind: 'fair',
      title: fair.event || 'Unknown Fair',
      category: 'fairs_intel',
      tags: [fair.city, fair.country, fair.editionYear, fair.exhibitors, fair.visitors].filter(Boolean),
      sourceUrl: fair.sourceUrl || null
    });
  }

  for (const fair of eventLibrary.easternEuropeFairs || []) {
    entries.push({
      kind: 'fair',
      title: fair.event || 'Unknown Eastern Europe Fair',
      category: 'eastern_europe',
      tags: [fair.city, fair.country, fair.edition, fair.exhibitors, fair.visitors].filter(Boolean),
      sourceUrl: fair.sourceUrl || null
    });
  }

  const years = Array.isArray(eventLibrary.years) ? eventLibrary.years : [];
  for (const y of years) {
    for (const ed of y.editions || []) {
      entries.push({
        kind: 'event_edition',
        title: `${eventLibrary.event || 'Event'} ${y.year || ''} ${ed.season || ''}`.trim(),
        category: 'event_editions',
        tags: [ed.city, ed.country, ed.month, ed.status].filter(Boolean),
        sourceUrl: null
      });
    }
  }

  return entries;
}

function searchLibraryEntries(entries, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return entries.slice(0, 80);

  const matched = entries.filter((entry) => {
    const blob = [
      entry.kind,
      entry.title,
      entry.category,
      ...(entry.tags || []),
      entry.sourceUrl || ''
    ].join(' ').toLowerCase();
    return blob.includes(q);
  });

  return matched.slice(0, 120);
}

async function loadOutreach() {
  await ensureOutreachFile();
  const raw = await fs.readFile(OUTREACH_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveOutreachItem(item) {
  const items = await loadOutreach();
  items.unshift({
    id: `outreach_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'draft',
    ...item
  });
  await fs.writeFile(OUTREACH_FILE, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  return items[0];
}

async function updateOutreachItem(id, updates) {
  const items = await loadOutreach();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(OUTREACH_FILE, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  return items[index];
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

async function collectCsvFiles(rootDir, maxFiles = 80) {
  const results = [];
  const stack = [rootDir];
  const skipDirs = new Set(['node_modules', '.git', '.next', '.qodo']);

  while (stack.length && results.length < maxFiles) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (results.length >= maxFiles) break;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) stack.push(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
        results.push(full);
      }
    }
  }
  return results;
}

async function searchBuyersInCsv(location, maxResults = 12) {
  const needle = String(location || '').trim().toLowerCase();
  if (!needle) return [];

  const files = await collectCsvFiles(CSV_SEARCH_ROOT, 90);
  const matches = [];
  const seen = new Set();

  for (const file of files) {
    if (matches.length >= maxResults) break;
    let raw;
    try {
      raw = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }

    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (!lines.length) continue;
    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

    for (let i = 1; i < Math.min(lines.length, 2000); i += 1) {
      if (matches.length >= maxResults) break;
      const line = lines[i];
      if (!line || !line.toLowerCase().includes(needle)) continue;

      const cols = parseCsvLine(line);
      const getCol = (...keys) => {
        for (const key of keys) {
          const idx = header.findIndex((h) => h.includes(key));
          if (idx >= 0 && cols[idx]) return cols[idx];
        }
        return null;
      };

      const company = (getCol('company', 'organization', 'business', 'account') || cols[0] || 'Unknown Company').trim();
      const contact = (getCol('name', 'contact', 'decision maker', 'person') || '').trim() || null;
      const email = (getCol('email', 'mail') || '').trim() || null;
      const city = (getCol('city', 'location') || '').trim() || null;
      const country = (getCol('country', 'nation') || '').trim() || null;
      const industry = (getCol('industry', 'segment', 'category', 'business type') || '').trim() || null;

      const hasEmail = !!email && /@/.test(email);
      const companyTooLong = company.length > 90;
      const noisyCompany = /https?:\/\//i.test(company) || company.split(',').length > 2;
      const tooWordyCompany = company.split(/\s+/).length > 9;
      const noisyPrefix = /^(with its roots|informaci[oó]n sobre|y eso)/i.test(company);
      const weakContact = !!contact && contact.length > 50;
      const lowSignal = !hasEmail && !contact;
      if (companyTooLong || noisyCompany || lowSignal || tooWordyCompany || noisyPrefix || weakContact) continue;

      const key = `${company.toLowerCase()}|${(email || '').toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      matches.push({
        company,
        contact: contact || null,
        email: email || null,
        city,
        country: normalizeCountry(city, country),
        segment: normalizeSegment(industry, company),
        source: path.relative(__dirname, file)
      });
    }
  }

  return matches;
}

function parseActionCommand(text) {
  const directBuyerMatch = text.match(/find\s+me\s+buyers\s+in\s+([a-zA-Z\s.-]{2,})/i);
  if (directBuyerMatch) {
    return { type: 'buyer_search', city: directBuyerMatch[1].trim() };
  }

  // Natural phrasing support: "buyers of textile in africa", "need distributors in spain".
  const naturalBuyer = text.match(/(?:buyers?|importers?|distributors?|wholesalers?)\b[\s\S]{0,40}?\b(?:in|from)\s+([a-zA-Z\s.-]{2,})/i);
  if (naturalBuyer) {
    return { type: 'buyer_search', city: naturalBuyer[1].trim() };
  }

  // Fallback: questions like "who are buyers in barcelona".
  const questionBuyer = text.match(/(?:who|which|show|search|find).{0,24}\bbuyers?\b.{0,30}\b(?:in|from)\s+([a-zA-Z\s.-]{2,})/i);
  if (questionBuyer) {
    return { type: 'buyer_search', city: questionBuyer[1].trim() };
  }

  const supplierMatch = text.match(/(?:denim|textile|fabric|apparel)?\s*suppliers?(?:\s+in\s+([a-zA-Z\s.-]{2,}))?/i);
  if (supplierMatch && /supplier/i.test(text)) {
    return { type: 'buyer_search', city: supplierMatch[1]?.trim() || null };
  }

  const imageSendMatch = text.match(/generate\s+image\s+(?:of\s+)?(.+?)\s+and\s+send\s+to\s+([a-zA-Z\s.-]{2,})$/i);
  if (imageSendMatch) {
    return {
      type: 'generate_image_send',
      prompt: imageSendMatch[1].trim(),
      recipient: imageSendMatch[2].trim()
    };
  }

  return null;
}

function normalizeChannel(channel) {
  const value = String(channel || '').toLowerCase();
  if (!value) return null;
  if (value.includes('whats')) return 'whatsapp';
  if (value.includes('insta')) return 'instagram';
  if (value.includes('linked')) return 'linkedin';
  if (value.includes('email') || value.includes('mail')) return 'email';
  if (value.includes('social')) return 'social';
  return value;
}

function normalizeLocationPhrase(text) {
  return String(text || '')
    .replace(/\b(from|using|in)\s+(your|the)?\s*(csv|data|database|sheet|sheets).*$/i, '')
    .replace(/\b(please|for me|now|quickly)\b/gi, '')
    .replace(/[?.!,]+$/g, '')
    .trim();
}

function normalizeSegment(...parts) {
  const raw = parts.filter(Boolean).join(' ').toLowerCase();
  if (!raw) return 'general';
  if (/(retail|supermarket|grocery|wholesale)/.test(raw)) return 'retail_wholesale';
  if (/(import|export|distributor|distribution|trading)/.test(raw)) return 'import_export';
  if (/(food|beverage|drink|fmcg)/.test(raw)) return 'food_beverage';
  if (/(textile|fabric|fashion|apparel)/.test(raw)) return 'textile_fashion';
  if (/(logistics|supply chain|shipping|freight)/.test(raw)) return 'logistics';
  return 'general';
}

function normalizeCountry(city, country) {
  const c = String(country || '').trim();
  if (c) return c;
  const cityText = String(city || '').toLowerCase();
  if (cityText.includes('barcelona') || cityText.includes('madrid')) return 'Spain';
  if (cityText.includes('lahore') || cityText.includes('karachi')) return 'Pakistan';
  return 'unknown';
}

function groupBuyersByCountrySegment(rows) {
  const grouped = {};
  for (const row of rows) {
    const country = row.country || 'unknown';
    const segment = row.segment || 'general';
    if (!grouped[country]) grouped[country] = {};
    if (!grouped[country][segment]) grouped[country][segment] = 0;
    grouped[country][segment] += 1;
  }
  return grouped;
}

function inferSearchRegion(text) {
  const t = String(text || '').toLowerCase();
  if (t.includes('eastern europe')) return 'eastern_europe';
  if (t.includes('africa')) return 'africa';
  if (t.includes('asia')) return 'asia';
  if (t.includes('europe')) return 'europe';
  return '';
}

function eventToBuyerRows(eventRows = [], sourceLabel = 'Event Library') {
  return eventRows.map((event) => ({
    company: event.event || 'Textile Fair Lead Source',
    contact: null,
    email: null,
    city: event.city || null,
    country: event.country || 'unknown',
    segment: normalizeSegment(event.sector, event.event),
    source: sourceLabel
  }));
}

function matchFairsFromLibrary(eventLibrary, queryText, regionHint) {
  const text = String(queryText || '').toLowerCase();
  const fairsIntel = Array.isArray(eventLibrary?.fairsIntel) ? eventLibrary.fairsIntel : [];
  const eastern = Array.isArray(eventLibrary?.easternEuropeFairs) ? eventLibrary.easternEuropeFairs : [];

  const keywordMatch = (row) => {
    const blob = `${row.event || ''} ${row.sector || ''} ${row.city || ''} ${row.country || ''}`.toLowerCase();
    if (text.includes('denim')) return blob.includes('denim') || blob.includes('textile') || blob.includes('fabric');
    if (text.includes('textile') || text.includes('apparel') || text.includes('fabric')) return blob.includes('textile') || blob.includes('apparel') || blob.includes('fabric');
    return true;
  };

  const fairRows = [];
  if (regionHint === 'eastern_europe' || text.includes('eastern europe')) {
    fairRows.push(...eastern.filter(keywordMatch));
  }

  const cityHint = normalizeLocationPhrase(text);
  if (cityHint && cityHint.length > 2) {
    const cityLower = cityHint.toLowerCase();
    fairRows.push(...fairsIntel.filter((row) => keywordMatch(row) && `${row.city || ''} ${row.country || ''}`.toLowerCase().includes(cityLower)));
  }

  if (!fairRows.length) {
    fairRows.push(...fairsIntel.filter(keywordMatch));
  }

  return eventToBuyerRows(fairRows.slice(0, 12));
}

function getSourceStatus() {
  return SOURCE_CATALOG.map((name) => {
    if (name === 'Google Places') return { name, enabled: !!GOOGLE_PLACES_API_KEY };
    if (name === 'Apollo') return { name, enabled: !!APOLLO_API_KEY };
    if (name === 'Python Web Scraper') return { name, enabled: true };
    return { name, enabled: true, mode: 'planned' };
  });
}

function normalizeBuyerRow(row, source) {
  const company = String(row.company || row.name || row.title || '').trim();
  if (!company) return null;
  const email = String(row.email || '').trim() || null;
  const contact = String(row.contact || row.person || '').trim() || null;
  const city = String(row.city || '').trim() || null;
  const country = normalizeCountry(city, row.country || null);
  const segment = normalizeSegment(row.segment, row.industry, company);
  return {
    company,
    contact,
    email,
    city,
    country,
    segment,
    source
  };
}

async function searchGooglePlacesExternal(queryText, locationText, limit = 10) {
  if (!GOOGLE_PLACES_API_KEY) return [];
  const q = encodeURIComponent(`${queryText} ${locationText}`.trim());
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${GOOGLE_PLACES_API_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  const rows = Array.isArray(data.results) ? data.results.slice(0, limit) : [];
  return rows.map((place) => normalizeBuyerRow({
    company: place.name,
    city: place.formatted_address,
    country: place.formatted_address,
    segment: place.types?.join(' ')
  }, 'Google Places')).filter(Boolean);
}

async function searchApolloExternal(queryText, locationText, limit = 10) {
  if (!APOLLO_API_KEY) return [];
  const r = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': APOLLO_API_KEY,
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({
      q_organization_name: queryText,
      organization_locations: [locationText],
      page: 1,
      per_page: Math.min(limit, 25)
    })
  });

  if (!r.ok) return [];
  const data = await r.json();
  const rows = Array.isArray(data.organizations) ? data.organizations.slice(0, limit) : [];
  return rows.map((org) => normalizeBuyerRow({
    company: org.name,
    city: org.city,
    country: org.country,
    segment: org.industry,
    contact: org.primary_contact?.name,
    email: org.primary_contact?.email
  }, 'Apollo')).filter(Boolean);
}

async function searchPythonExternal(queryText, locationText, limit = 10) {
  try {
    const { stdout } = await execFileAsync('python3', [
      PYTHON_SEARCH_SCRIPT,
      '--query', queryText,
      '--location', locationText,
      '--limit', String(limit)
    ], { timeout: 20000, maxBuffer: 1024 * 1024 });
    const parsed = JSON.parse(stdout || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeBuyerRow(row, 'Python Web Scraper')).filter(Boolean);
  } catch {
    return [];
  }
}

function dedupeBuyerResults(rows, limit = 20) {
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.company.toLowerCase()}|${(row.email || '').toLowerCase()}|${(row.source || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

async function searchBuyersExternal(queryText, locationText) {
  const [googleRows, apolloRows, pythonRows] = await Promise.all([
    searchGooglePlacesExternal(queryText, locationText, 12),
    searchApolloExternal(queryText, locationText, 12),
    searchPythonExternal(queryText, locationText, 12)
  ]);

  const merged = dedupeBuyerResults([...googleRows, ...apolloRows, ...pythonRows], 24);
  const sourceBreakdown = {
    google_places: googleRows.length,
    apollo: apolloRows.length,
    python_scraper: pythonRows.length
  };

  return {
    buyers: merged,
    sourceBreakdown
  };
}

async function inferActionIntent(text, history = []) {
  const fallback = parseActionCommand(text);
  if (fallback) {
    return { ...fallback, confidence: 0.7 };
  }

  const prompt = [
    { role: 'system', content: ACTION_INTENT_PROMPT },
    ...history.slice(-4),
    { role: 'user', content: text }
  ];

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: prompt,
      temperature: 0,
      max_tokens: 180,
      response_format: { type: 'json_object' }
    })
  });

  const data = await r.json();
  if (!r.ok) {
    return { type: 'none', confidence: 0 };
  }

  const content = data.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      type: parsed.type || 'none',
      city: parsed.city || null,
      recipient: parsed.recipient || null,
      channel: normalizeChannel(parsed.channel),
      prompt: parsed.prompt || null,
      message: parsed.message || null,
      confidence: Number(parsed.confidence || 0)
    };
  } catch {
    return { type: 'none', confidence: 0 };
  }
}

async function loadLeads() {
  await ensureLeadsFile();
  const raw = await fs.readFile(LEADS_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLead(lead) {
  const leads = await loadLeads();
  leads.unshift({
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...lead
  });
  await fs.writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
  return leads[0];
}

function leadFollowUpQuestions(lead) {
  const questions = [];
  if (!lead.name) questions.push('name');
  if (!lead.contact && !lead.email && !lead.phone) questions.push('contact');
  if (!lead.platform) questions.push('platform');
  if (!lead.service) questions.push('service');
  if (!lead.timeline) questions.push('timeline');
  return questions;
}

async function extractLeadWithGroq(text, history = []) {
  const prompt = [
    { role: 'system', content: `Extract a social-media lead from the conversation. Return ONLY valid JSON with these keys: name, contact, email, phone, platform, company, service, budget, timeline, location, notes, confidence. Use null for unknown values. Keep notes short. confidence is a number from 0 to 1. If it's not a lead, still return JSON with confidence near 0.` },
    ...history.slice(-4),
    { role: 'user', content: text }
  ];

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: prompt,
      temperature: 0,
      max_tokens: 220,
      response_format: { type: 'json_object' }
    })
  });

  const data = await r.json();
  if (!r.ok) {
    throw new Error(data.error?.message || 'Lead extraction failed');
  }

  const content = data.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function lookupCity(cityName) {
  const q = encodeURIComponent(cityName.trim());
  if (!q) return null;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`;
  const r = await fetch(url);
  if (!r.ok) return null;

  const data = await r.json();
  const city = data?.results?.[0];
  if (!city) return null;

  return {
    name: city.name,
    admin1: city.admin1,
    country: city.country,
    timezone: city.timezone
  };
}

function formatCity(city) {
  const region = city.admin1 ? `${city.admin1}, ` : '';
  return `${city.name}, ${region}${city.country}`;
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function leadsToCsv(leads) {
  const headers = [
    'id', 'createdAt', 'name', 'contact', 'email', 'phone', 'platform', 'company',
    'service', 'budget', 'timeline', 'location', 'status', 'notes', 'sourceText'
  ];

  const rows = [headers.join(',')];
  for (const lead of leads) {
    rows.push(headers.map((key) => csvEscape(lead?.[key] ?? '')).join(','));
  }
  return rows.join('\n');
}

app.post('/api/chat', async (req, res) => {
  try {
    const startedAt = Date.now();
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-key-here') {
      return res.status(500).json({
        error: 'GROQ_API_KEY is not set. Add it to your .env file and restart the server.'
      });
    }

    const userMessages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const trimmedMessages = userMessages.slice(-HISTORY_TURNS * 2);

    const lastUser = [...trimmedMessages].reverse().find(m => m?.role === 'user' && typeof m.content === 'string');
    const text = (lastUser?.content || '').trim();

    if (!text) {
      return res.json({ reply: 'Tell me what you need and I’ll handle it.', latencyMs: Date.now() - startedAt });
    }

    const premierVisionQuery = /premier\s*vision\s*paris|last\s*3\s*years\s*events?.*apparel/i.test(text);
    if (premierVisionQuery) {
      const eventLibrary = await loadEventLibrary();
      const totalEditions = (eventLibrary.years || []).reduce((acc, y) => acc + (y.editions?.length || 0), 0);
      const savedAction = await saveOutreachItem({
        type: 'event_library_fetch',
        channel: 'research',
        target: 'premier vision paris',
        message: `Loaded Premier Vision Paris trial library for last 3 years (${totalEditions} editions).`,
        results: eventLibrary.years || []
      });

      return res.json({
        reply: `I loaded Premier Vision Paris trial data for the last 3 years in apparel/textile. I found ${totalEditions} event editions and added them to your research queue.`,
        action: savedAction,
        eventLibrary,
        latencyMs: Date.now() - startedAt
      });
    }

    const action = await inferActionIntent(text, trimmedMessages);
    if (action?.type === 'buyer_search' && action.confidence >= 0.45) {
      const rawCity = action.city || '';
      const city = normalizeLocationPhrase(rawCity).toLowerCase();
      const regionHint = inferSearchRegion(text);
      const locationHint = city || regionHint || 'global';
      const leads = await loadLeads();
      const cityLeads = city
        ? leads.filter((lead) => (lead.location || '').toLowerCase().includes(city))
        : [];

      const external = await searchBuyersExternal(text, locationHint);
      const eventLibrary = await loadEventLibrary();
      const fairMatches = matchFairsFromLibrary(eventLibrary, text, regionHint);
      const buyerCandidates = dedupeBuyerResults([...(external.buyers || []), ...fairMatches], 24);
      const grouped = groupBuyersByCountrySegment(buyerCandidates);
      const savedAction = await saveOutreachItem({
        type: 'buyer_search',
        channel: 'research',
        target: locationHint,
        message: `Buyer search requested for ${locationHint}. Found ${cityLeads.length} pipeline lead(s), ${(external.buyers || []).length} external match(es), and ${fairMatches.length} fair-intel match(es).`,
        results: buyerCandidates,
        grouped,
        sourceBreakdown: {
          ...(external.sourceBreakdown || {}),
          fair_intel: fairMatches.length
        }
      });

      const names = cityLeads.slice(0, 4).map((l) => l.name || 'Unknown').filter(Boolean);
      const supplierNames = [...new Set(buyerCandidates.map((m) => m.company).filter(Boolean))].slice(0, 4);
      const localSummary = names.length ? ` Pipeline matches: ${names.join(', ')}.` : '';
      const supplierSummary = supplierNames.length ? ` Top sources: ${supplierNames.join(', ')}.` : ' No supplier matches yet from active sources.';
      const topCountry = Object.keys(grouped)[0];
      const topCountrySegments = topCountry ? Object.keys(grouped[topCountry]).join(', ') : '';
      const groupSummary = topCountry ? ` Top country: ${topCountry}. Segments: ${topCountrySegments}.` : '';

      return res.json({
        reply: `I started buyer discovery for ${locationHint}. I found ${cityLeads.length} lead(s) in your pipeline, ${(external.buyers || []).length} from external engines, and ${fairMatches.length} from fair intelligence.${localSummary} ${supplierSummary}${groupSummary}`,
        action: savedAction,
        buyers: buyerCandidates,
        grouped,
        sourceBreakdown: {
          ...(external.sourceBreakdown || {}),
          fair_intel: fairMatches.length
        },
        latencyMs: Date.now() - startedAt
      });
    }

    if (action?.type === 'generate_image_send' && action.confidence >= 0.45) {
      const imagePrompt = action.prompt || text;
      const recipient = action.recipient || 'recipient';
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;
      const savedAction = await saveOutreachItem({
        type: 'image_send',
        channel: action.channel || 'social',
        target: recipient,
        imageUrl,
        message: `Image generated for prompt "${imagePrompt}" and prepared to send to ${recipient}.`
      });

      return res.json({
        reply: `Done. I generated the image and prepared it for ${recipient}. I added it to your outreach console for final send approval.`,
        action: savedAction,
        latencyMs: Date.now() - startedAt
      });
    }

    if (action?.type === 'outreach_send' && action.confidence >= 0.45) {
      const recipient = action.recipient || 'recipient';
      const channel = action.channel || 'social';
      const message = action.message || `Hi ${recipient}, quick follow-up from Harvoice.`;
      const savedAction = await saveOutreachItem({
        type: 'outreach_send',
        channel,
        target: recipient,
        message
      });

      return res.json({
        reply: `Got it. I prepared a ${channel} outreach draft for ${recipient} and added it to your outreach console for send approval.`,
        action: savedAction,
        latencyMs: Date.now() - startedAt
      });
    }

    // Deterministic handling for city/location/time questions to avoid hallucinations.
    const whereMatch = text.match(/(?:where\s+is|which\s+country\s+is|location\s+of)\s+([a-zA-Z\s.-]{2,})\??$/i);
    const timeMatch = text.match(/(?:time\s+in|what(?:'s|\s+is)\s+the\s+time\s+in)\s+([a-zA-Z\s.-]{2,})\??$/i);

    if (whereMatch || timeMatch) {
      const cityQuery = (whereMatch?.[1] || timeMatch?.[1] || '').trim();
      const city = await lookupCity(cityQuery);

      if (city) {
        if (timeMatch && city.timezone) {
          const localTime = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: city.timezone
          }).format(new Date());

          return res.json({
            reply: `In ${formatCity(city)}, the current local time is ${localTime}.`,
            latencyMs: Date.now() - startedAt
          });
        }

        return res.json({
          reply: `${city.name} is in ${city.country}${city.admin1 ? `, ${city.admin1}` : ''}.`,
          latencyMs: Date.now() - startedAt
        });
      }
    }

    if (looksLikeLeadRequest(text)) {
      const lead = await extractLeadWithGroq(text, trimmedMessages);
      const confidence = Number(lead.confidence || 0);
      const leadData = {
        name: lead.name || null,
        contact: lead.contact || null,
        email: lead.email || null,
        phone: lead.phone || null,
        platform: lead.platform || null,
        company: lead.company || null,
        service: lead.service || null,
        budget: lead.budget || null,
        timeline: lead.timeline || null,
        location: lead.location || null,
        notes: lead.notes || null,
        sourceText: text
      };

      const missing = leadFollowUpQuestions(leadData);

      if (confidence >= 0.55 || missing.length <= 2) {
        const saved = await saveLead(leadData);
        return res.json({
          reply: `Nice, I’ve got this lead saved${saved.name ? ` for ${saved.name}` : ''}. ${missing.length ? `I still need ${missing.join(' and ')} to finish qualifying it.` : 'It’s fully qualified.'}`,
          lead: saved,
          latencyMs: Date.now() - startedAt
        });
      }

      return res.json({
        reply: `Cool, I can take this lead. What’s the person’s name, best contact, platform they came from, and what service do they need?`,
        lead: leadData,
        latencyMs: Date.now() - startedAt
      });
    }

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmedMessages],
        temperature: 0.6,
        max_tokens: 140
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Groq error:', data);
      return res.status(r.status).json({ error: data.error?.message || 'Groq request failed.' });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || '';
    res.json({ reply, latencyMs: Date.now() - startedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    const leads = await loadLeads();
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/outreach', async (req, res) => {
  try {
    const items = await loadOutreach();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sources', async (req, res) => {
  try {
    const library = await loadSourceLibrary();
    res.json({
      sources: library,
      status: getSourceStatus(),
      count: library.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/premier-vision-paris', async (req, res) => {
  try {
    const eventLibrary = await loadEventLibrary();
    res.json({ eventLibrary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/eastern-europe', async (req, res) => {
  try {
    const eventLibrary = await loadEventLibrary();
    res.json({
      easternEuropeFairs: eventLibrary.easternEuropeFairs || [],
      count: Array.isArray(eventLibrary.easternEuropeFairs) ? eventLibrary.easternEuropeFairs.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/library/search', async (req, res) => {
  try {
    const q = String(req.query?.q || '').trim();
    const sourceLibrary = await loadSourceLibrary();
    const eventLibrary = await loadEventLibrary();
    const entries = buildLibraryEntries(sourceLibrary, eventLibrary);
    const matches = searchLibraryEntries(entries, q);
    res.json({
      query: q,
      total: entries.length,
      count: matches.length,
      items: matches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outreach/draft', async (req, res) => {
  try {
    const body = req.body || {};
    const item = await saveOutreachItem({
      type: body.type || 'outreach_send',
      channel: body.channel || 'social',
      target: body.target || null,
      message: body.message || 'Draft created from operator panel.',
      imageUrl: body.imageUrl || null
    });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outreach/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || '').trim();
    if (!status) return res.status(400).json({ error: 'status is required' });
    const updated = await updateOutreachItem(id, { status });
    if (!updated) return res.status(404).json({ error: 'outreach item not found' });
    res.json({ item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outreach/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const items = await loadOutreach();
    const item = items.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'outreach item not found' });

    // Resolve recipient email — from item directly or from first result with email
    const recipientEmail = item.email ||
      (Array.isArray(item.results) && item.results.find(r => r.email && /@/.test(r.email))?.email) ||
      null;

    const recipientName = item.target || item.name ||
      (Array.isArray(item.results) && item.results[0]?.contact) || null;
    const recipientCompany = (Array.isArray(item.results) && item.results[0]?.company) || null;

    if (!recipientEmail) {
      // No email available — mark as needs-email
      const updated = await updateOutreachItem(id, { status: 'no-email' });
      return res.status(422).json({
        error: 'No email address found for this outreach item. Add an email to the lead first.',
        item: updated,
      });
    }

    const htmlBody = buildOutreachEmailHtml({
      target: recipientName,
      message: item.message,
      company: recipientCompany,
    });

    await sendEmail({
      to: recipientEmail,
      toName: recipientName || undefined,
      subject: `Trade Inquiry — ${FROM_NAME}`,
      htmlBody,
    });

    const updated = await updateOutreachItem(id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentTo: recipientEmail,
    });
    res.json({ item: updated, sentTo: recipientEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outreach/spam-test', async (req, res) => {
  try {
    const { testAddress, subject, message, target } = req.body || {};
    if (!testAddress || !/@/.test(testAddress)) {
      return res.status(400).json({ error: 'Provide a valid mail-tester.com test address' });
    }
    const htmlBody = buildOutreachEmailHtml({
      target: target || 'Test Recipient',
      message: message || 'This is a spam-test email sent from Harvoice Outreach.',
      company: null,
    });
    await sendEmail({
      to: testAddress,
      subject: subject || `Trade Inquiry — ${FROM_NAME}`,
      htmlBody,
    });
    // Derive result URL: test-xyz@srv1.mail-tester.com → https://www.mail-tester.com/test-xyz
    const localPart = testAddress.split('@')[0];
    const resultUrl = `https://www.mail-tester.com/${localPart}`;
    res.json({ sent: true, testAddress, resultUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads.csv', async (req, res) => {
  try {
    const leads = await loadLeads();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="harvoice-leads.csv"');
    res.send(leadsToCsv(leads));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const nextStatus = String(status || '').trim();
    if (!nextStatus) {
      return res.status(400).json({ error: 'status is required' });
    }

    const leads = await loadLeads();
    const index = leads.findIndex((lead) => lead.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'lead not found' });
    }

    leads[index] = {
      ...leads[index],
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
    res.json({ lead: leads[index] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard', async (req, res) => {
  try {
    const leads = await loadLeads();
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Harvoice Leads Dashboard</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}
    .wrap{max-width:1200px;margin:0 auto}
    h1{margin:0 0 8px}
    .top{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0 20px}
    .btn{display:inline-block;padding:10px 14px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;border:none;cursor:pointer}
    .btn.secondary{background:#334155}
    .stats{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0 20px}
    .card{background:#111827;border:1px solid #1f2937;border-radius:16px;padding:14px 16px;min-width:150px}
    table{width:100%;border-collapse:collapse;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden}
    th,td{padding:10px 12px;border-bottom:1px solid #1f2937;vertical-align:top;text-align:left;font-size:14px}
    th{color:#93c5fd;background:#0b1220;position:sticky;top:0}
    tr:hover td{background:#0b1220}
    select,input{background:#0b1220;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px}
    .muted{color:#94a3b8}
    .grid{overflow:auto;border-radius:16px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Harvoice Leads Dashboard</h1>
    <div class="muted">Local lead inbox for social DMs, quotes, and enquiries.</div>
    <div class="top">
      <a class="btn" href="/api/leads.csv">Export CSV</a>
      <button class="btn secondary" onclick="location.reload()">Refresh</button>
      <a class="btn secondary" href="/">Open App</a>
    </div>
    <div class="stats" id="stats"></div>
    <div class="grid">
      <table>
        <thead>
          <tr>
            <th>Created</th><th>Name</th><th>Contact</th><th>Platform</th><th>Service</th><th>Timeline</th><th>Status</th><th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map((lead) => `
            <tr>
              <td>${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}</td>
              <td>${lead.name || ''}<div class="muted">${lead.company || ''}</div></td>
              <td>${lead.contact || lead.email || lead.phone || ''}</td>
              <td>${lead.platform || ''}<div class="muted">${lead.location || ''}</div></td>
              <td>${lead.service || ''}<div class="muted">${lead.budget || ''}</div></td>
              <td>${lead.timeline || ''}</td>
              <td>
                <select data-lead-id="${lead.id}" class="status-select">
                  ${['new','contacted','qualified','won','lost'].map((status) => `<option value="${status}" ${String(lead.status || 'new') === status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </td>
              <td>${lead.notes || ''}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <script>
    const total = ${leads.length};
    const statusCounts = ${JSON.stringify(leads.reduce((acc, lead) => {
      const s = String(lead.status || 'new');
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}))};
    const statsEl = document.getElementById('stats');
    const statCards = [
      '<div class="card"><div class="muted">Total Leads</div><strong>' + total + '</strong></div>'
    ].concat(Object.entries(statusCounts).map(([k, v]) => {
      return '<div class="card"><div class="muted">' + k + '</div><strong>' + v + '</strong></div>';
    }));
    statsEl.innerHTML = statCards.join('');
    document.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', async () => {
        const id = select.dataset.leadId;
        await fetch('/api/leads/' + id + '/status', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ status: select.value })
        });
      });
    });
  </script>
</body>
</html>`;
    res.type('html').send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', model: MODEL, hasKey: !!GROQ_API_KEY });
});

app.get('/api/vapi-config', (req, res) => {
  res.json({
    enabled: !!VAPI_PUBLIC_KEY && !!VAPI_ASSISTANT_ID,
    publicKey: VAPI_PUBLIC_KEY || null,
    assistantId: VAPI_ASSISTANT_ID || null
  });
});

// ---- OpenAI TTS ----
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';

app.get('/api/tts-config', (req, res) => {
  res.json({ enabled: !!OPENAI_API_KEY, voice: OPENAI_TTS_VOICE, model: OPENAI_TTS_MODEL });
});

// ---- Phase 1: CSV ingest ----
app.post('/api/ingest', async (req, res) => {
  try {
    delete require.cache[require.resolve('./scripts/ingest_csv.js')];
    const { main } = require('./scripts/ingest_csv.js');
    const summary = main();
    res.json({ ok: true, ...summary });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/tts', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'OPENAI_API_KEY not configured' });
  const { text, voice } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice: voice || OPENAI_TTS_VOICE,
        input: text.slice(0, 4000),
        response_format: 'mp3'
      })
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: errText });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Harvoice running at http://localhost:${PORT}`);
  if (!GROQ_API_KEY) console.log('⚠️  Set GROQ_API_KEY in .env to enable chat.');
  if (!OPENAI_API_KEY) console.log('⚠️  Set OPENAI_API_KEY in .env to enable natural voice.');
});
