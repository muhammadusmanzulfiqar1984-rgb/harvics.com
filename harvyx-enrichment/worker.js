/**
 * HarvyX enrichment Worker — Hunter.io (+ optional People Data Labs) → D1 leads.
 *
 * Auth:  Authorization: Bearer <HARVYX_API_KEY>  or  x-api-key: <HARVYX_API_KEY>
 *
 * Routes:
 *   GET  /health
 *   POST /enrich           { leadId } | { domain, firstName?, lastName?, contactName?, website?, email? }
 *   POST /enrich/batch     { limit?: number, orgId?: string }  — fill empty emails from D1
 */

/** @typedef {{ HARVYX_LEADS_DB: D1Database, HARVYX_API_KEY?: string, HUNTER_API_KEY?: string, PDL_API_KEY?: string }} Env */

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    if (path === '/health' || path === '/') {
      return cors(
        json({
          ok: true,
          service: 'harvyx-enrichment',
          hunter: Boolean(env.HUNTER_API_KEY),
          pdl: Boolean(env.PDL_API_KEY),
          d1: Boolean(env.HARVYX_LEADS_DB),
        }),
      );
    }

    const denied = unauthorized(request, env);
    if (denied) return cors(denied);

    try {
      if (request.method === 'POST' && path === '/enrich') {
        const body = await request.json().catch(() => ({}));
        const result = await enrichOne(env, body);
        return cors(json(result, result.ok ? 200 : result.status || 400));
      }

      if (request.method === 'POST' && path === '/enrich/batch') {
        const body = await request.json().catch(() => ({}));
        const result = await enrichBatch(env, body);
        return cors(json(result));
      }

      return cors(json({ error: 'Not found', paths: ['/health', '/enrich', '/enrich/batch'] }, 404));
    } catch (e) {
      return cors(json({ error: e instanceof Error ? e.message : String(e) }, 500));
    }
  },
};

/**
 * @param {Request} request
 * @param {Env} env
 */
function unauthorized(request, env) {
  const expected = (env.HARVYX_API_KEY || '').trim();
  if (!expected) {
    return json({ error: 'Server misconfigured: HARVYX_API_KEY secret missing' }, 500);
  }
  const header =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';
  if (header !== expected) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

/**
 * @param {Env} env
 * @param {Record<string, any>} body
 */
async function enrichOne(env, body) {
  let lead = null;
  const leadId = String(body.leadId || body.id || '').trim();

  if (leadId) {
    lead = await env.HARVYX_LEADS_DB.prepare('SELECT * FROM leads WHERE id = ? LIMIT 1')
      .bind(leadId)
      .first();
    if (!lead) {
      return { ok: false, status: 404, error: 'Lead not found', leadId };
    }
  }

  const domain = (
    body.domain ||
    domainFrom(body.website || lead?.website, body.email || lead?.email)
  ).trim();

  let firstName = String(body.firstName || '').trim();
  let lastName = String(body.lastName || '').trim();
  const contactName = String(body.contactName || lead?.contact_name || lead?.name || '').trim();
  if (!firstName && contactName) {
    const parts = contactName.split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  if (!domain && !contactName) {
    return {
      ok: false,
      status: 400,
      error: 'Need domain/website or a leadId with website/email',
    };
  }

  const hunter = await enrichHunter(env, { domain, firstName, lastName });
  let pdl = null;
  if ((!hunter.email || (hunter.confidence || 0) < 70) && env.PDL_API_KEY) {
    pdl = await enrichPdl(env, {
      domain,
      firstName,
      lastName,
      company: body.company || lead?.company || '',
    });
  }

  const best = pickBest(hunter, pdl);
  if (domain) best.domain = best.domain || domain;
  if (!best.email && !best.phone && !best.linkedin) {
    return {
      ok: false,
      status: 200,
      leadId: leadId || null,
      domain: domain || null,
      message: 'No enrichment found',
      hunter,
      pdl,
    };
  }

  let writeback = null;
  if (leadId && lead) {
    writeback = await writeLead(env, lead, best);
  }

  return {
    ok: true,
    leadId: leadId || null,
    domain: domain || null,
    ...best,
    hunter: hunter.ok ? hunter : undefined,
    pdl: pdl?.ok ? pdl : undefined,
    writeback,
  };
}

/**
 * @param {Env} env
 * @param {{ limit?: number, orgId?: string }} body
 */
async function enrichBatch(env, body) {
  const limit = Math.min(Math.max(Number(body.limit) || 5, 1), 25);
  const orgId = String(body.orgId || 'harvics').trim() || 'harvics';

  const rows = await env.HARVYX_LEADS_DB.prepare(
    `SELECT * FROM leads
     WHERE (org_id = ? OR org_id IS NULL OR org_id = '')
       AND (email IS NULL OR trim(email) = '')
       AND (
         (website IS NOT NULL AND trim(website) <> '')
         OR (contact_name IS NOT NULL AND trim(contact_name) <> '')
       )
     ORDER BY score DESC
     LIMIT ?`,
  )
    .bind(orgId, limit)
    .all();

  const leads = rows?.results || [];
  const results = [];
  for (const lead of leads) {
    const r = await enrichOne(env, { leadId: lead.id });
    results.push({
      leadId: lead.id,
      company: lead.company,
      ok: r.ok,
      email: r.email || null,
      method: r.method || null,
      writeback: r.writeback || null,
      error: r.error || r.message || null,
    });
    // soft rate limit for free Hunter tiers
    await sleep(350);
  }

  return {
    ok: true,
    orgId,
    selected: leads.length,
    enriched: results.filter((r) => r.ok && r.email).length,
    results,
  };
}

/**
 * @param {Env} env
 * @param {{ domain: string, firstName: string, lastName: string }} p
 */
async function enrichHunter(env, p) {
  const key = (env.HUNTER_API_KEY || '').trim();
  if (!key) return { ok: false, provider: 'hunter', error: 'HUNTER_API_KEY not set' };
  if (!p.domain) return { ok: false, provider: 'hunter', error: 'no domain' };

  if (p.firstName && p.lastName) {
    const url =
      `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(p.domain)}` +
      `&first_name=${encodeURIComponent(p.firstName)}` +
      `&last_name=${encodeURIComponent(p.lastName)}` +
      `&api_key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const jsonBody = await res.json().catch(() => ({}));
    if (res.ok && jsonBody?.data?.email) {
      return {
        ok: true,
        provider: 'hunter',
        method: 'email-finder',
        email: jsonBody.data.email,
        confidence: jsonBody.data.score ?? null,
        phone: jsonBody.data.phone_number || '',
        title: jsonBody.data.position || '',
        linkedin: jsonBody.data.linkedin_url || '',
        contactName: [jsonBody.data.first_name, jsonBody.data.last_name].filter(Boolean).join(' '),
      };
    }
  }

  const dsUrl =
    `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(p.domain)}` +
    `&limit=5&api_key=${encodeURIComponent(key)}`;
  const dsRes = await fetch(dsUrl);
  const dsJson = await dsRes.json().catch(() => ({}));
  if (!dsRes.ok) {
    return {
      ok: false,
      provider: 'hunter',
      error: dsJson?.errors?.[0]?.details || `Hunter ${dsRes.status}`,
    };
  }

  const emails = (dsJson.data?.emails || []).map((e) => ({
    email: e.value,
    confidence: e.confidence,
    phone: e.phone_number || '',
    title: e.position || '',
    linkedin: e.linkedin || '',
    contactName: [e.first_name, e.last_name].filter(Boolean).join(' '),
  }));
  if (!emails.length) {
    return { ok: false, provider: 'hunter', method: 'domain-search', error: 'no emails' };
  }
  emails.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  const best = emails[0];
  return {
    ok: true,
    provider: 'hunter',
    method: 'domain-search',
    email: best.email,
    confidence: best.confidence ?? null,
    phone: best.phone,
    title: best.title,
    linkedin: best.linkedin,
    contactName: best.contactName,
    emails,
  };
}

/**
 * @param {Env} env
 * @param {{ domain: string, firstName: string, lastName: string, company: string }} p
 */
async function enrichPdl(env, p) {
  const key = (env.PDL_API_KEY || '').trim();
  if (!key) return { ok: false, provider: 'pdl', error: 'PDL_API_KEY not set' };

  const params = new URLSearchParams({
    api_key: key,
    pretty: 'false',
    min_likelihood: '5',
  });
  if (p.firstName) params.set('first_name', p.firstName);
  if (p.lastName) params.set('last_name', p.lastName);
  if (p.company) params.set('company', p.company);
  if (p.domain) params.set('website', p.domain.startsWith('http') ? p.domain : `https://${p.domain}`);

  const res = await fetch(`https://api.peopledatalabs.com/v5/person/enrich?${params}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.data) {
    return {
      ok: false,
      provider: 'pdl',
      error: data?.error?.message || `PDL ${res.status}`,
    };
  }
  const d = data.data;
  const email =
    (Array.isArray(d.emails) && d.emails[0]?.address) ||
    d.work_email ||
    d.recommended_personal_email ||
    '';
  const phone =
    (Array.isArray(d.phone_numbers) && (d.phone_numbers[0]?.number || d.phone_numbers[0])) || '';
  return {
    ok: Boolean(email || phone || d.linkedin_url),
    provider: 'pdl',
    method: 'person-enrich',
    email: email || '',
    confidence: data.likelihood != null ? Number(data.likelihood) * 10 : null,
    phone: typeof phone === 'string' ? phone : '',
    title: d.job_title || '',
    linkedin: d.linkedin_url || '',
    contactName: [d.first_name, d.last_name].filter(Boolean).join(' '),
  };
}

function pickBest(hunter, pdl) {
  const candidates = [hunter, pdl].filter((x) => x && x.ok && (x.email || x.phone || x.linkedin));
  candidates.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  const best = candidates[0] || {};
  const signals = [];
  if (best.provider) signals.push(`source:${best.provider}`);
  if (best.method) signals.push(`method:${best.method}`);
  if (best.confidence != null) signals.push(`confidence:${best.confidence}`);
  return {
    method: best.method || null,
    provider: best.provider || null,
    email: best.email || '',
    confidence: best.confidence ?? null,
    phone: best.phone || '',
    title: best.title || '',
    linkedin: best.linkedin || '',
    contactName: best.contactName || '',
    domain: best.domain || '',
    location: best.location || '',
    tech_stack: best.tech_stack || [],
    signals,
  };
}

/**
 * Fill-empty writeback onto D1 lead (same policy as HarvyX leadWriteback).
 * @param {Env} env
 * @param {Record<string, any>} existing
 * @param {Record<string, any>} best
 */
async function writeLead(env, existing, best) {
  const sets = [];
  const binds = [];
  const applied = [];

  const map = [
    ['email', best.email],
    ['phone', best.phone],
    ['linkedin', best.linkedin],
    ['title', best.title],
    ['contact_name', best.contactName],
    ['domain', best.domain],
    ['location', best.location],
  ];

  for (const [col, next] of map) {
    if (!next || String(next).trim() === '') continue;
    const prev = existing[col];
    const empty = prev == null || String(prev).trim() === '';
    // title / enrichment meta may refresh; identity fields only fill empty
    if (col === 'title' || col === 'domain' || col === 'location' || empty) {
      sets.push(`${col} = ?`);
      binds.push(String(next).trim());
      applied.push(col);
    }
  }

  if (Array.isArray(best.tech_stack) || typeof best.tech_stack === 'string') {
    const raw = Array.isArray(best.tech_stack) ? JSON.stringify(best.tech_stack) : String(best.tech_stack);
    if (raw && raw !== '[]') {
      sets.push('tech_stack = ?');
      binds.push(raw);
      applied.push('tech_stack');
    }
  }
  if (Array.isArray(best.signals) || typeof best.signals === 'string') {
    const raw = Array.isArray(best.signals) ? JSON.stringify(best.signals) : String(best.signals);
    if (raw && raw !== '[]') {
      sets.push('signals = ?');
      binds.push(raw);
      applied.push('signals');
    }
  }

  if (!applied.length) {
    return { action: 'skipped', fields: [] };
  }

  const now = new Date().toISOString();
  sets.push('enriched_at = ?');
  binds.push(now);
  applied.push('enriched_at');
  sets.push('updated_at = ?');
  binds.push(now);
  binds.push(existing.id);

  await env.HARVYX_LEADS_DB.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...binds)
    .run();

  return { action: 'updated', fields: applied };
}

function domainFrom(website, email) {
  if (website) {
    try {
      const u = new URL(String(website).startsWith('http') ? website : `https://${website}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return String(website).replace(/^www\./, '').split('/')[0];
    }
  }
  if (email && String(email).includes('@')) return String(email).split('@')[1];
  return '';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 0), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function cors(res) {
  const headers = new Headers(res.headers);
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-headers', 'content-type, x-api-key, authorization');
  headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  return new Response(res.body, { status: res.status, headers });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
