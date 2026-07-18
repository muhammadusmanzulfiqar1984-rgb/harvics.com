/**
 * hx-tradeshows.routes.ts — trade show scrape triggers + VCF export
 * Source: HARVYX_REPORTING_WIRE.md § 6, HARVYX_DATABANK_ARCH.md § 3.4–3.6
 *
 * Routes (mount at /api/v1/databank):
 *   POST /scrape/tradeshows      — trigger all trade show scrapers
 *   POST /scrape/handelsregister — trigger Handelsregister scraper
 *   POST /scrape/linkedin        — trigger LinkedIn public scraper { slug }
 *   GET  /export/vcf             — download VCF of filtered contacts
 *
 * JWT auth on all routes. All mutations logged to hx_audit_log.
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import * as repo from '../repositories/hx-databank.repository';
import { generateVCF } from '../../../packages/lib/hx-vcf-generator';
import { hxLogger } from '../../../packages/lib/hx-logger';
import { runTradeShowsScraper } from '../../cron/scrapers/hx-tradeshows.scraper';
import { runHandelsregisterScraper } from '../../cron/scrapers/hx-handelsregister.scraper';
import { runLinkedInPublicScraper } from '../../cron/scrapers/hx-linkedin-public.scraper';
import { runKrsScraper } from '../../cron/scrapers/hx-krs.scraper';
import type { HxApiResponse } from '../../../packages/types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';
const MODULE     = 'hx-tradeshows.routes';
const VCF_EXPORT_CAP = 5_000;

// ── JWT middleware ────────────────────────────────────────────────────────────

interface JwtPayload {
  sub:    string;
  email?: string;
  role?:  string;
  iat:    number;
  exp:    number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      operator?: JwtPayload;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json(fail('Missing Bearer token'));
    return;
  }

  if (!JWT_SECRET) {
    hxLogger.error(MODULE, 'HX_JWT_SECRET is not set');
    res.status(500).json(fail('Server misconfiguration'));
    return;
  }

  try {
    req.operator = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch (err) {
    res.status(401).json(fail(
      err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token',
    ));
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

function ok<T>(data: T): HxApiResponse<T> {
  return { success: true, data, error: null, ts: new Date().toISOString() };
}

function fail(error: string): HxApiResponse<null> {
  return { success: false, data: null, error, ts: new Date().toISOString() };
}

function clientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    ''
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

const router = Router();
router.use(requireAuth);

// ── POST /scrape/tradeshows ───────────────────────────────────────────────────

router.post('/scrape/tradeshows', async (req: Request, res: Response): Promise<void> => {
  const operatorId = req.operator?.sub ?? 'unknown';
  const runId      = crypto.randomUUID();

  try {
    void runTradeShowsScraper({ manual: true }).catch((err) => {
      hxLogger.error(MODULE, 'tradeshows scrape background error', {
        err: err instanceof Error ? err.message : String(err),
      });
    });

    await repo.writeAuditLog({
      operatorId,
      action:     'scrape_tradeshows',
      entityType: 'hx_scrape_run',
      entityId:   runId,
      afterState: { source: 'tradeshows', manual: true },
      ipAddress:  clientIp(req),
    });

    hxLogger.info(MODULE, 'tradeshows scrape triggered', { runId, operatorId });
    res.status(202).json(ok({ run_id: runId, source: 'tradeshows', status: 'queued' }));
  } catch (err) {
    hxLogger.error(MODULE, '/scrape/tradeshows error', err);
    res.status(500).json(fail('Failed to trigger trade show scrapers'));
  }
});

// ── POST /scrape/handelsregister ──────────────────────────────────────────────

router.post('/scrape/handelsregister', async (req: Request, res: Response): Promise<void> => {
  const operatorId = req.operator?.sub ?? 'unknown';
  const runId      = crypto.randomUUID();

  try {
    void runHandelsregisterScraper().catch((err) => {
      hxLogger.error(MODULE, 'handelsregister scrape background error', {
        err: err instanceof Error ? err.message : String(err),
      });
    });

    await repo.writeAuditLog({
      operatorId,
      action:     'scrape_handelsregister',
      entityType: 'hx_scrape_run',
      entityId:   runId,
      afterState: { source: 'handelsregister', manual: true },
      ipAddress:  clientIp(req),
    });

    hxLogger.info(MODULE, 'handelsregister scrape triggered', { runId, operatorId });
    res.status(202).json(ok({ run_id: runId, source: 'handelsregister', status: 'queued' }));
  } catch (err) {
    hxLogger.error(MODULE, '/scrape/handelsregister error', err);
    res.status(500).json(fail('Failed to trigger Handelsregister scraper'));
  }
});

// ── POST /scrape/krs ──────────────────────────────────────────────────────────

router.post('/scrape/krs', async (req: Request, res: Response): Promise<void> => {
  const operatorId = req.operator?.sub ?? 'unknown';
  const runId      = crypto.randomUUID();

  try {
    void runKrsScraper().catch((err) => {
      hxLogger.error(MODULE, 'krs scrape background error', {
        err: err instanceof Error ? err.message : String(err),
      });
    });

    await repo.writeAuditLog({
      operatorId,
      action:     'scrape_krs',
      entityType: 'hx_scrape_run',
      entityId:   runId,
      afterState: { source: 'krs', manual: true },
      ipAddress:  clientIp(req),
    });

    hxLogger.info(MODULE, 'krs scrape triggered', { runId, operatorId });
    res.status(202).json(ok({ run_id: runId, source: 'krs', status: 'queued' }));
  } catch (err) {
    hxLogger.error(MODULE, '/scrape/krs error', err);
    res.status(500).json(fail('Failed to trigger KRS scraper'));
  }
});

// ── POST /scrape/linkedin ─────────────────────────────────────────────────────

router.post('/scrape/linkedin', async (req: Request, res: Response): Promise<void> => {
  const operatorId = req.operator?.sub ?? 'unknown';
  const slug       = String(req.body?.slug ?? '').trim();

  if (!slug) {
    res.status(400).json(fail('slug is required in request body'));
    return;
  }

  const runId = crypto.randomUUID();

  try {
    void runLinkedInPublicScraper(slug).catch((err) => {
      hxLogger.error(MODULE, 'linkedin scrape background error', {
        slug,
        err: err instanceof Error ? err.message : String(err),
      });
    });

    await repo.writeAuditLog({
      operatorId,
      action:     'scrape_linkedin_public',
      entityType: 'hx_scrape_run',
      entityId:   runId,
      afterState: { source: 'linkedin_public', slug, manual: true },
      ipAddress:  clientIp(req),
    });

    hxLogger.info(MODULE, 'linkedin scrape triggered', { runId, slug, operatorId });
    res.status(202).json(ok({ run_id: runId, source: 'linkedin_public', slug, status: 'queued' }));
  } catch (err) {
    hxLogger.error(MODULE, '/scrape/linkedin error', err);
    res.status(500).json(fail('Failed to trigger LinkedIn scraper'));
  }
});

// ── GET /export/vcf ───────────────────────────────────────────────────────────
// Query: source, country, icp_min, verified_only

router.get('/export/vcf', async (req: Request, res: Response): Promise<void> => {
  const operatorId = req.operator?.sub ?? 'unknown';
  const q = req.query as Record<string, string | undefined>;

  const filter: repo.ContactsFilter = {
    source:   q['source'],
    country:  q['country'],
    icp_min:  q['icp_min'] ? parseInt(q['icp_min'], 10) : undefined,
    email_verified: q['verified_only'] === 'true' ? true : undefined,
  };

  try {
    const contacts = [];
    let page = 1;
    const perPage = 100;

    while (contacts.length < VCF_EXPORT_CAP) {
      const batch = await repo.getContacts(filter, { page, per_page: perPage });
      contacts.push(...batch.data);
      if (contacts.length >= batch.total || batch.data.length < perPage) break;
      page++;
    }

    if (!contacts.length) {
      res.status(404).json(fail('No contacts match the export filters'));
      return;
    }

    const { vcf, filename } = generateVCF(contacts, {
      source:  filter.source,
      country: filter.country,
    });

    await repo.writeAuditLog({
      operatorId,
      action:     'export_vcf',
      entityType: 'hx_contact',
      afterState: {
        count: contacts.length,
        filters: filter,
        filename,
      },
      ipAddress: clientIp(req),
    });

    hxLogger.info(MODULE, 'VCF export', {
      operatorId,
      count: contacts.length,
      filename,
    });

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(vcf);
  } catch (err) {
    hxLogger.error(MODULE, '/export/vcf error', err);
    res.status(500).json(fail('Failed to generate VCF export'));
  }
});

export { router as tradeShowsRouter };
