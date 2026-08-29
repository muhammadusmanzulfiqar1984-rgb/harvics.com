HARVYX_BACKEND_RULES.md
Master backend instruction set — HarvyX Data Bank Module
Version 1.0 — Canonical. Never modify without owner sign-off.
Owner: Mian Muhammad Usman, Founder & CEO, Harvics Global Ventures s.r.o.
________________


0. Non-negotiable rules
* Never hardcode hex colors, API keys, secrets, or connection strings anywhere in source.
* Never replace or refactor an existing file without explicit instruction. Extend only.
* Never use console.log in production paths. Use the hxLogger utility only.
* Never create a new npm dependency without checking the free-tier constraint.
* Never use any type in TypeScript. All types must be explicit.
* Never write a function longer than 60 lines. Split it.
* Never commit without the hx- prefix on branch names.
* All database writes must go through the repository layer. No raw SQL in route handlers.
* All queue jobs must be idempotent. Every job must be safe to retry.
* Every public function must have a JSDoc block.
* Every external API call must have a timeout, retry, and error boundary.


________________


1. Project structure
/harvyx
  /apps
    /web                  → Next.js frontend (localhost:3000)
    /api                  → Node.js API server (localhost:4000)
    /workers              → BullMQ worker processes
    /cron                 → Cloudflare Workers (cron scrapers)
  /packages
    /db                   → Postgres client, migrations, repositories
    /queue                → BullMQ queue definitions and job types
    /lib                  → Shared utilities (logger, validator, scorer)
    /types                → Shared TypeScript types
  /docs
    HARVYX_BACKEND_RULES.md     ← this file
    HARVYX_DATABANK_ARCH.md     ← data bank architecture
    HARVYX_REPORTING_WIRE.md    ← reporting wire spec

________________


2. Naming conventions — absolute
Files
kebab-case for all files
hx-[module]-[action].ts          → worker files
hx-[module].repository.ts        → database repository
hx-[module].service.ts           → business logic
hx-[module].types.ts             → TypeScript types
hx-[module].schema.ts            → Zod validation schemas
hx-[module].test.ts              → tests
Database tables — ALL prefixed hx_
hx_contacts                      → enriched contact records
hx_companies                     → company records
hx_scrape_runs                   → scraper execution log
hx_email_verifications           → SMTP verification results
hx_enrichment_jobs               → Apollo/Lusha job tracking
hx_events_bronze                 → Bronze layer raw event log
hx_pipeline_deals                → CRM deal records
hx_sequences                     → outreach sequence definitions
hx_sequence_steps                → individual sequence steps
hx_outreach_log                  → all outreach actions sent
hx_replies                       → all inbound replies
hx_notifications                 → operator notification log
hx_audit_log                     → immutable audit trail
Queue names — ALL prefixed hx:
hx:scrape              → raw scraper output ingestion
hx:parse               → HTML/JSON parsing jobs
hx:email-verify        → SMTP verification jobs
hx:icp-score           → ICP scoring jobs
hx:apollo-enrich       → Apollo top-up enrichment
hx:lusha-reveal        → Lusha mobile reveal (ICP >= 85 only)
hx:outreach-dispatch   → outreach send jobs
hx:reply-classify      → NLP intent classification on inbound replies
hx:notify              → operator notification dispatch
hx:bronze-write        → Bronze layer event writes
hx:reporting           → reporting aggregation jobs
Environment variables — ALL prefixed HX_
HX_DATABASE_URL
HX_REDIS_URL
HX_APOLLO_API_KEY
HX_LUSHA_API_KEY
HX_COMPANIES_HOUSE_API_KEY
HX_GROQ_API_KEY
HX_OPENROUTER_API_KEY
HX_TWILIO_ACCOUNT_SID
HX_TWILIO_AUTH_TOKEN
HX_TWILIO_WHATSAPP_FROM
HX_CLOUDFLARE_ACCOUNT_ID
HX_CLOUDFLARE_R2_BUCKET
HX_CLOUDFLARE_KV_NAMESPACE
HX_RESEND_API_KEY
HX_OPERATOR_WHATSAPP
HX_SLACK_WEBHOOK_URL
HX_SMTP_VERIFY_FROM
HX_ICP_SCORE_THRESHOLD_APOLLO=70
HX_ICP_SCORE_THRESHOLD_LUSHA=85
HX_SCRAPE_CRON_INTERVAL=6h
TypeScript types — ALL prefixed Hx
HxContact
HxCompany
HxScrapeRun
HxEnrichmentJob
HxBronzeEvent
HxQueueJob<T>
HxIcpScore
HxReplyIntent
HxNotificationPayload
HxApiResponse<T>
HxPaginatedResponse<T>

________________


3. Database rules
Postgres conventions
* All tables use UUID primary keys via gen_random_uuid().
* All tables have created_at TIMESTAMPTZ DEFAULT NOW().
* Mutable tables have updated_at TIMESTAMPTZ DEFAULT NOW() + trigger.
* All foreign keys have explicit ON DELETE behaviour defined.
* All JSONB columns storing raw external data are named raw_json.
* hx_events_bronze is append-only. No updates. No deletes. Ever.
* hx_audit_log is append-only. No updates. No deletes. Ever.
* All upserts use ON CONFLICT (source, source_id) DO UPDATE.
Migration rules
* All migrations live in /packages/db/migrations/.
* Migration files named: YYYYMMDD_HHMMSS_description.sql.
* Never alter a column that has production data. Add new column, migrate, drop old.
* Every migration must have a rollback block commented at the bottom.
Repository pattern
// Every table has exactly one repository file.
// No business logic in repositories. Query only.


// hx-contacts.repository.ts
export const contactsRepository = {
  upsert: async (contact: HxContactInsert): Promise<HxContact> => {},
  findById: async (id: string): Promise<HxContact | null> => {},
  findByIcpScore: async (min: number): Promise<HxContact[]> => {},
  findPendingApolloEnrich: async (limit: number): Promise<HxContact[]> => {},
  findPendingLushaReveal: async (limit: number): Promise<HxContact[]> => {},
  markApolloEnriched: async (id: string): Promise<void> => {},
  markLushaEnriched: async (id: string): Promise<void> => {},
  updateEmailVerified: async (id: string, email: string): Promise<void> => {},
};

________________


4. Queue rules
BullMQ job structure — every job must follow this shape
interface HxQueueJob<T> {
  job_id: string;          // UUID, generated at dispatch
  job_type: string;        // matches queue name
  payload: T;              // typed payload
  attempts: number;        // current attempt count
  created_at: string;      // ISO timestamp
  source_module: string;   // which module created this job
}
Retry policy — ALL queues
const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 500,
};
Concurrency limits
hx:scrape              → concurrency: 5
hx:parse               → concurrency: 20
hx:email-verify        → concurrency: 10  (SMTP rate limit respect)
hx:icp-score           → concurrency: 50
hx:apollo-enrich       → concurrency: 5   (Apollo rate limit: 10/batch)
hx:lusha-reveal        → concurrency: 3   (credit conservation)
hx:outreach-dispatch   → concurrency: 3
hx:reply-classify      → concurrency: 20
hx:notify              → concurrency: 10
hx:bronze-write        → concurrency: 50
Worker failure handling
worker.on('failed', async (job, err) => {
  await hxLogger.error({
    queue: job.queueName,
    job_id: job.id,
    payload: job.data,
    error: err.message,
    attempts: job.attemptsMade,
  });


  if (job.attemptsMade >= job.opts.attempts) {
    await bronzeWrite({
      event_type: 'job.failed.terminal',
      source_module: job.queueName,
      payload: { job_id: job.id, error: err.message },
    });
  }
});

________________


5. External API rules
Every external call must follow this pattern
async function callExternalApi<T>(
  fn: () => Promise<T>,
  context: string,
  timeout = 10000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);


  try {
    const result = await fn();
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    await hxLogger.warn({ context, error: err.message });
    throw err;
  }
}
Rate limit rules per source
Companies House API   → 600 req/5min → add 600ms delay between calls
KRS Poland            → no official limit → 1s delay between calls
ARES Czech            → no official limit → 500ms delay between calls
Apollo MCP            → batch max 10 contacts → never exceed
Lusha                 → check credit balance before every reveal call
Groq                  → 14,400 req/day → monitor daily counter in KV
SMTP verify           → max 50 concurrent sockets → enforced in worker

________________


6. Bronze layer rules
The Bronze layer is the immutable event log. Everything writes here.
Every system event that must write to Bronze
contact.ingested         → new contact from any source
contact.email_verified   → SMTP verification result
contact.icp_scored       → ICP score assigned or updated
contact.apollo_enriched  → Apollo enrichment completed
contact.lusha_revealed   → Lusha mobile/email revealed
outreach.sent            → any channel — email, LinkedIn, WhatsApp, SMS
outreach.bounced         → email bounce received
reply.received           → any inbound reply, any channel
reply.classified         → NLP intent classification result
deal.stage_changed       → CRM pipeline stage update
deal.closed              → deal won or lost
payment.initiated        → HPay invoice sent
payment.received         → payment confirmed
sanctions.checked        → sanctions screen result (pass or block)
aml.checked              → AML/KYC result
notification.sent        → operator notification dispatched
job.failed.terminal      → queue job failed all retries
scrape.run.completed     → scraper execution summary
Bronze write function — single utility, used everywhere
// packages/lib/hx-bronze.ts
export async function bronzeWrite(event: HxBronzeEvent): Promise<void> {
  await pool.query(`
    INSERT INTO hx_events_bronze (
      event_id, event_type, source_module,
      entity_id, entity_type, payload, created_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, NOW()
    )
  `, [
    event.event_type,
    event.source_module,
    event.entity_id || null,
    event.entity_type || null,
    JSON.stringify(event.payload),
  ]);
}

________________


7. ICP scoring rules
Score thresholds — hard rules
0–49    → discard. Do not store. Do not enrich.
50–69   → store in hx_contacts. No enrichment. Nurture pool only.
70–84   → Apollo top-up enrichment triggered.
85–100  → Apollo + Lusha reveal triggered. Priority sequence enrollment.
Score factors — locked. Do not change without owner sign-off.
Geography (max 30pts)
  GB, DE, FR, NL, SE, NO → 28-30
  PL, CZ, SK, HU, RO     → 22-25
  AE, SA, QA, KW         → 22-26
  TR, IN, VN, BD         → 16-20
  RU                      → 10 (sanctions flag raised automatically)
  All other               → 8


Title seniority (max 30pts)
  CEO, Founder, Owner, President, Partner → 30
  COO, CFO, CMO, CTO, Director, VP, Head → 24
  Manager, Buyer, Procurement, Senior     → 16
  Coordinator, Executive, Officer         → 8
  No title                                → 0


Vertical fit (max 20pts)
  Denim, Apparel, Textile, Fashion, Fabric → 20
  Food, Beverage, FMCG                     → 16
  Retail, Distribution                     → 14
  Other trade                              → 8
  Unrelated                                → 0


Data quality (max 20pts)
  Email verified via SMTP                  → +12
  LinkedIn URL present                     → +4
  Phone present                            → +4
  Company domain confirmed                 → +2
  From registry source (CH, KRS, ARES)    → +3
  From trade show directory               → +2

________________


8. Notification rules
Trigger thresholds
ICP score >= 85 AND email verified        → WhatsApp + in-app
ICP score 70-84 AND email verified        → in-app only
Positive reply classified (any channel)   → WhatsApp + in-app
Meeting booked                            → WhatsApp + in-app
Deal stage changed to Negotiation         → WhatsApp + in-app
Sanctions block triggered                 → WhatsApp + in-app + Slack
Payment received                          → WhatsApp + in-app
Scrape run completed (daily summary)      → in-app only
Job terminal failure                      → Slack only
WhatsApp notification payload — locked format
interface HxWhatsAppNotification {
  to: string;                  // HX_OPERATOR_WHATSAPP
  type: 'alert' | 'info' | 'action_required';
  module: string;              // e.g. "data_bank" | "outreach" | "pipeline"
  headline: string;            // max 60 chars, plain text
  body: string;                // max 200 chars
  entity_name?: string;        // contact or company name
  entity_id?: string;          // UUID
  action_url?: string;         // deep link into HarvyX UI
  timestamp: string;           // ISO
}
Example payloads
// High-ICP contact ingested
{
  type: "info",
  module: "data_bank",
  headline: "New high-ICP contact — Alexei Kovalev",
  body: "CPO at Melon Fashion Group, Moscow. Score: 87. Email verified. Apollo enrich queued.",
  entity_name: "Alexei Kovalev",
  action_url: "https://harvyx.com/contacts/{id}"
}


// Positive reply classified
{
  type: "action_required",
  module: "outreach",
  headline: "Positive reply — Elena Trinh, GENVIET",
  body: "Intent: positive (0.94). Harvey drafted follow-up. Approve to send via WhatsApp.",
  entity_name: "Elena Trinh",
  action_url: "https://harvyx.com/replies/{id}"
}


// Sanctions block
{
  type: "alert",
  module: "governance",
  headline: "SANCTIONS BLOCK — payment held",
  body: "LPP S.A. payment €180K blocked. OFAC match flagged. Human review required.",
  action_url: "https://harvyx.com/governance/sanctions/{id}"
}

________________


9. Logging rules
// packages/lib/hx-logger.ts
// Single logger. Used everywhere. No console.log in production.


export const hxLogger = {
  info:  (data: object) => log('INFO',  data),
  warn:  (data: object) => log('WARN',  data),
  error: (data: object) => log('ERROR', data),
  debug: (data: object) => process.env.NODE_ENV !== 'production' && log('DEBUG', data),
};


function log(level: string, data: object) {
  process.stdout.write(JSON.stringify({
    level,
    ts: new Date().toISOString(),
    service: process.env.HX_SERVICE_NAME || 'harvyx',
    ...data,
  }) + '\n');
}

________________


10. Free tier constraints — hard ceiling
Cloudflare Workers     → 100K req/day free. Never exceed.
Cloudflare R2          → 10GB free. Raw scrape HTML only. Delete after parse.
Cloudflare KV          → 100K reads/day. Cache ICP scores and rate counters here.
Cloudflare Cron        → 5 cron triggers free. Use wisely.
Groq API               → 14,400 req/day. Never use for bulk. NLP classify only.
OpenRouter             → Monitor spend. Use Gemini Flash for bulk NLP.
Apollo                 → 50 free credits/month baseline. Top-up only ICP >= 70.
Lusha                  → Credits only. Reveal only ICP >= 85.
Resend                 → 3,000 emails/month. Operator alerts only. Not outreach.
Companies House API    → Free. Unlimited for basic search.
KRS Poland             → Free. No official rate limit.
ARES Czech             → Free. No official rate limit.
Redis (Upstash)        → 10K commands/day free tier. BullMQ only.
Postgres (Supabase)    → 500MB free. Purge raw_json after Silver processing.

________________


11. Security rules
* All API routes require JWT authentication. No public endpoints except health check.
* All operator actions (send, approve, enrich) are logged to hx_audit_log.
* Sanctions screen runs before ANY payment-related action. Hard block, not advisory.
* No PII is logged in plaintext. Contact emails and phones are masked in logs.
* SMTP verification FROM address must be verify@harvics.com. Never operator email.
* R2 raw scrape files are deleted within 24h of successful parse.
* No API keys in .env.example. Use placeholder strings only.
* Rate limit all inbound API routes: 100 req/min per IP via Cloudflare.


________________


12. What Claude Code must never do
* Never create a file outside the defined project structure.
* Never rename an existing table, queue, or env var.
* Never remove an existing index.
* Never add a paid dependency.
* Never skip the Bronze write on any system event.
* Never bypass the ICP threshold gates for Apollo or Lusha.
* Never send an outreach action without operator confirmation.
* Never write directly to hx_audit_log or hx_events_bronze except via bronzeWrite().
* Never use DROP TABLE, TRUNCATE, or DELETE FROM hx_events_bronze.
* Never expose raw API keys or secrets in any response or log.

________________


## 13. Module build order — locked

Module 1B — Data Bank completion (4 missing workers)
Module 1C — Trade show pipeline (scrapers + LinkedIn + VCF)
Module 2  — Harvey AI (command layer)
Module 3  — Content & Creative Engine
Module 4  — Outreach engine (email, LinkedIn, WhatsApp, SMS)
Module 5  — Reply Detection AI + intent classification
Module 6  — CRM pipeline
Module 7  — Meeting booking + Vapi (Harvo)
Module 8  — CPQ + contract vault + e-signature
Module 9  — Sanctions + AML/KYC gates
Module 10 — HPay + GL posting
Module 11 — Governance layer
Module 12 — Silver + Gold processing
Module 13 — Lead Score refinement + nurture automation
Module 14 — Board pack + AI reporting
Module 15 — HarvyX Command Center full UI

Rules:
- Never build a module before the one above it is complete and tested
- Every session starts by reading all three Google Docs
- Module 1B must be complete before Module 2 starts
