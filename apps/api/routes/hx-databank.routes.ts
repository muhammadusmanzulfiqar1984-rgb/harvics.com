/**
 * hx-databank.routes.ts — HarvyX Data Bank reporting API
 * Source: HARVYX_REPORTING_WIRE.md § 6
 *
 * Base path: /api/v1/databank
 * Auth:      JWT Bearer on every route (HS256, secret: HX_JWT_SECRET)
 * Audit:     All operator mutations written to hx_audit_log
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Queue } from 'bullmq';

import * as repo from '../repositories/hx-databank.repository';
import type {
  HxApiResponse,
  HxPaginatedResponse,
  HxEnrichmentJobType,
  HxSource,
} from '../../../packages/types/hx.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

// ── Config ────────────────────────────────────────────────────────────────────

const JWT_SECRET  = process.env.HX_JWT_SECRET  ?? '';
const REDIS_URL   = process.env.HX_REDIS_URL   ?? 'redis://localhost:6379';
const MODULE      = 'hx-databank.routes';

const VALID_SOURCES: HxSource[] = [
  'companies_house', 'krs', 'ares', 'handelsregister', 'bluezone',
  'innatex', 'source_fashion', 'supreme_dus', 'ciff',
  'linkedin_public', 'manual',
];

// ── Queues (for manual trigger endpoints) ─────────────────────────────────────

const apolloEnrichQueue = new Queue('hx-apollo-enrich', { connection: { url: REDIS_URL } });
const scrapeQueue       = new Queue('hx-scrape',        { connection: { url: REDIS_URL } });

// ── JWT middleware ────────────────────────────────────────────────────────────

interface JwtPayload {
  sub:        string;   // operator ID
  email?:     string;
  role?:      string;
  iat:        number;
  exp:        number;
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
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.operator  = payload;
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

function paged<T>(result: repo.PaginatedResult<T>): HxPaginatedResponse<T> {
  return {
    success:  true,
    data:     result.data,
    total:    result.total,
    page:     result.page,
    per_page: result.per_page,
    ts:       new Date().toISOString(),
  };
}

function parsePagination(query: Record<string, unknown>): repo.PaginationInput {
  const rawLimit = query['limit'] ?? query['per_page'] ?? '20';
  return {
    page:     Math.max(parseInt(String(query['page'] ?? '1'), 10) || 1, 1),
    per_page: Math.min(Math.max(parseInt(String(rawLimit), 10) || 20, 1), 100),
  };
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

// Apply JWT auth to all routes in this router
router.use(requireAuth);

// ── GET /api/v1/databank/summary ─────────────────────────────────────────────

router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await repo.getSummary();
    res.json(ok(summary));
  } catch (err) {
    hxLogger.error(MODULE, '/summary error', err);
    res.status(500).json(fail('Failed to load summary'));
  }
});

// ── GET /api/v1/databank/contacts ────────────────────────────────────────────
// Query params: page, per_page|limit (default 20), country, vertical, source,
//   email_verified, enriched_apollo, enriched_lusha, in_nurture_pool,
//   icp_min, icp_max, q|search

router.get('/contacts', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query as Record<string, string | undefined>;

    const filter: repo.ContactsFilter = {
      country:         q['country'],
      vertical:        q['vertical'],
      source:          q['source'],
      q:               q['q'] ?? q['search'],
      email_verified:  q['email_verified']  !== undefined ? q['email_verified']  === 'true' : undefined,
      enriched_apollo: q['enriched_apollo'] !== undefined ? q['enriched_apollo'] === 'true' : undefined,
      enriched_lusha:  q['enriched_lusha']  !== undefined ? q['enriched_lusha']  === 'true' : undefined,
      in_nurture_pool: q['in_nurture_pool'] !== undefined ? q['in_nurture_pool'] === 'true' : undefined,
      icp_min: q['icp_min'] ? parseInt(q['icp_min'], 10) : undefined,
      icp_max: q['icp_max'] ? parseInt(q['icp_max'], 10) : undefined,
    };

    const result = await repo.getContacts(filter, parsePagination(q));
    res.json(paged(result));
  } catch (err) {
    hxLogger.error(MODULE, '/contacts error', err);
    res.status(500).json(fail('Failed to load contacts'));
  }
});

// ── GET /api/v1/databank/contacts/:id ───────────────────────────────────────

router.get('/contacts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await repo.getContactById(req.params['id']);
    if (!contact) {
      res.status(404).json(fail('Contact not found'));
      return;
    }
    res.json(ok(contact));
  } catch (err) {
    hxLogger.error(MODULE, '/contacts/:id error', err);
    res.status(500).json(fail('Failed to load contact'));
  }
});

// ── GET /api/v1/databank/runs ────────────────────────────────────────────────

router.get('/runs', async (req: Request, res: Response): Promise<void> => {
  try {
    const q      = req.query as Record<string, string | undefined>;
    const result = await repo.getScrapeRuns(parsePagination(q), q['source']);
    res.json(paged(result));
  } catch (err) {
    hxLogger.error(MODULE, '/runs error', err);
    res.status(500).json(fail('Failed to load scrape runs'));
  }
});

// ── GET /api/v1/databank/runs/:id ────────────────────────────────────────────

router.get('/runs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const run = await repo.getScrapeRunById(req.params['id']);
    if (!run) {
      res.status(404).json(fail('Scrape run not found'));
      return;
    }
    res.json(ok(run));
  } catch (err) {
    hxLogger.error(MODULE, '/runs/:id error', err);
    res.status(500).json(fail('Failed to load scrape run'));
  }
});

// ── GET /api/v1/databank/bronze ──────────────────────────────────────────────
// Query params: page, per_page, event_type, source_module, entity_id

router.get('/bronze', async (req: Request, res: Response): Promise<void> => {
  try {
    const q      = req.query as Record<string, string | undefined>;
    const filter: repo.BronzeFilter = {
      event_type:    q['event_type'],
      source_module: q['source_module'],
      entity_id:     q['entity_id'],
    };
    const result = await repo.getBronzeEvents(filter, parsePagination(q));
    res.json(paged(result));
  } catch (err) {
    hxLogger.error(MODULE, '/bronze error', err);
    res.status(500).json(fail('Failed to load bronze events'));
  }
});

// ── GET /api/v1/databank/enrichment-queue ────────────────────────────────────

router.get('/enrichment-queue', async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await repo.getEnrichmentQueueStatus();
    res.json(ok(summary));
  } catch (err) {
    hxLogger.error(MODULE, '/enrichment-queue error', err);
    res.status(500).json(fail('Failed to load enrichment queue status'));
  }
});

// ── GET /api/v1/databank/credits ─────────────────────────────────────────────

router.get('/credits', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await repo.getCreditStats();
    res.json(ok(stats));
  } catch (err) {
    hxLogger.error(MODULE, '/credits error', err);
    res.status(500).json(fail('Failed to load credit stats'));
  }
});

// ── POST /api/v1/databank/enrich/:id ────────────────────────────────────────
// Body: { job_type: 'apollo_enrich' | 'lusha_reveal' | 'email_verify' }

router.post('/enrich/:id', async (req: Request, res: Response): Promise<void> => {
  const contactId  = req.params['id'];
  const operatorId = req.operator?.sub ?? 'unknown';
  const jobType    = req.body?.job_type as HxEnrichmentJobType | undefined;

  const VALID_JOB_TYPES: HxEnrichmentJobType[] = [
    'apollo_enrich', 'lusha_reveal', 'email_verify', 'icp_score',
  ];

  if (!jobType || !VALID_JOB_TYPES.includes(jobType)) {
    res.status(400).json(fail(`job_type must be one of: ${VALID_JOB_TYPES.join(', ')}`));
    return;
  }

  try {
    // Confirm contact exists
    const contact = await repo.getContactById(contactId);
    if (!contact) {
      res.status(404).json(fail('Contact not found'));
      return;
    }

    // Create enrichment job in DB
    const jobId = await repo.createEnrichmentJob(contactId, jobType);

    // Push to BullMQ queue
    if (jobType === 'apollo_enrich') {
      await apolloEnrichQueue.add('apollo_enrich', {
        job_id:        jobId,
        job_type:      'apollo_enrich',
        source_module: MODULE,
        attempts:      0,
        created_at:    new Date().toISOString(),
        payload:       { contact_id: contactId, priority: false, icp_score: contact.icp_score },
      });
    }

    // Audit log
    await repo.writeAuditLog({
      operatorId,
      action:      'manual_enrich',
      entityType:  'hx_contact',
      entityId:    contactId,
      afterState:  { job_id: jobId, job_type: jobType },
      ipAddress:   clientIp(req),
    });

    hxLogger.info(MODULE, 'manual enrich queued', { contactId, jobType, jobId, operatorId });
    res.status(202).json(ok({ job_id: jobId, job_type: jobType, contact_id: contactId }));
  } catch (err) {
    hxLogger.error(MODULE, '/enrich/:id error', err);
    res.status(500).json(fail('Failed to queue enrichment job'));
  }
});

// ── POST /api/v1/databank/scrape/:source ─────────────────────────────────────
// Manually triggers a scrape run for a given source.

router.post('/scrape/:source', async (req: Request, res: Response): Promise<void> => {
  const source     = req.params['source'] as HxSource;
  const operatorId = req.operator?.sub ?? 'unknown';

  if (!VALID_SOURCES.includes(source)) {
    res.status(400).json(fail(`source must be one of: ${VALID_SOURCES.join(', ')}`));
    return;
  }

  try {
    const runId = crypto.randomUUID();

    await scrapeQueue.add(
      `${source}_trigger`,
      {
        job_id:        runId,
        job_type:      `${source}_trigger`,
        source_module: MODULE,
        attempts:      0,
        created_at:    new Date().toISOString(),
        payload: {
          scraper:      source,
          run_id:       runId,
          triggered_at: new Date().toISOString(),
          manual:       true,
          operator_id:  operatorId,
        },
      },
      {
        priority: 5,
        attempts: 1,
        removeOnComplete: { count: 100 },
        removeOnFail:     { count: 50 },
      },
    );

    // Audit log
    await repo.writeAuditLog({
      operatorId,
      action:     'manual_scrape_trigger',
      entityType: 'hx_scrape_run',
      entityId:   runId,
      afterState: { source, run_id: runId },
      ipAddress:  clientIp(req),
    });

    hxLogger.info(MODULE, 'manual scrape triggered', { source, runId, operatorId });
    res.status(202).json(ok({ run_id: runId, source }));
  } catch (err) {
    hxLogger.error(MODULE, '/scrape/:source error', err);
    res.status(500).json(fail('Failed to trigger scrape run'));
  }
});

// ── Export ────────────────────────────────────────────────────────────────────

export { router as dataBankRouter };
