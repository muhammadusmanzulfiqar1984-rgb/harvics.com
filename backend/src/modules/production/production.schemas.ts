/**
 * Zod schemas for /api/v2/* (production.controller.ts).
 *
 * All POST/PATCH bodies pass through `validateBody(schema)` before reaching
 * the Prisma layer. PATCH schemas use `.partial()` so only provided fields
 * are validated.
 *
 * Conventions:
 *  - Strings used as identifiers/codes: `.min(1).max(120)`.
 *  - Numeric fields accept number or numeric string (coerced).
 *  - Dates accept ISO string or Date (coerced to Date).
 *  - Unknown fields are stripped (default zod behavior).
 */

import { z } from 'zod';

const nonEmptyString = (max = 500) => z.string().trim().min(1).max(max);
const optionalString = (max = 1000) => z.string().trim().max(max).optional().nullable();
const coercedNumber = z.coerce.number().finite();
const coercedNonNegative = z.coerce.number().finite().nonnegative();
const coercedDate = z.coerce.date();
const isoCurrency = z.string().trim().length(3).regex(/^[A-Z]{3}$/, 'Must be a 3-letter ISO currency code');

// ── MANUFACTURING ────────────────────────────────────────────────────
export const WorkOrderCreateSchema = z.object({
  workOrderNo: nonEmptyString(120),
  productSku: nonEmptyString(120),
  qty: coercedNonNegative.default(0),
  status: nonEmptyString(40).default('Planned'),
  priority: nonEmptyString(40).default('Normal'),
  notes: optionalString(2000),
  startDate: coercedDate.optional().nullable(),
  completionDate: coercedDate.optional().nullable(),
});
export const WorkOrderUpdateSchema = WorkOrderCreateSchema.partial();

// ── QUALITY ──────────────────────────────────────────────────────────
export const QualityCheckCreateSchema = z.object({
  checkNo: nonEmptyString(120),
  productSku: nonEmptyString(120),
  inspector: optionalString(200),
  status: nonEmptyString(40).default('Pending'),
  defectsFound: coercedNonNegative.default(0),
  notes: optionalString(2000),
  workOrderId: optionalString(120),
});
export const QualityCheckUpdateSchema = QualityCheckCreateSchema.partial();

export const NCRCreateSchema = z.object({
  ncrNo: nonEmptyString(120),
  severity: nonEmptyString(40).default('Minor'),
  description: nonEmptyString(2000),
  rootCause: optionalString(2000),
  correctiveAction: optionalString(2000),
  status: nonEmptyString(40).default('Open'),
  assignedTo: optionalString(200),
  qualityCheckId: optionalString(120),
});
export const NCRUpdateSchema = NCRCreateSchema.partial();

// ── PROJECTS ─────────────────────────────────────────────────────────
export const ProjectCreateSchema = z.object({
  code: nonEmptyString(60),
  name: nonEmptyString(200),
  description: optionalString(4000),
  status: nonEmptyString(40).default('Active'),
  priority: nonEmptyString(40).default('Normal'),
  startDate: coercedDate.optional().nullable(),
  endDate: coercedDate.optional().nullable(),
  ownerId: optionalString(120),
  budget: coercedNonNegative.default(0),
  currency: isoCurrency.default('USD'),
});
export const ProjectUpdateSchema = ProjectCreateSchema.partial();

export const TaskCreateSchema = z.object({
  title: nonEmptyString(300),
  status: nonEmptyString(40).default('Todo'),
  priority: nonEmptyString(40).default('Normal'),
  assigneeId: optionalString(120),
  dueDate: coercedDate.optional().nullable(),
});
export const TaskUpdateSchema = TaskCreateSchema.partial();

// ── TREASURY ─────────────────────────────────────────────────────────
export const BankAccountCreateSchema = z.object({
  accountNo: nonEmptyString(60),
  bankName: nonEmptyString(200),
  currency: isoCurrency.default('USD'),
  balance: coercedNumber.default(0),
  accountType: nonEmptyString(40).default('Operating'),
  country: optionalString(60),
  status: nonEmptyString(40).default('Active'),
});

export const BankTransactionCreateSchema = z.object({
  type: z.enum(['Credit', 'Debit']),
  amount: coercedNonNegative,
  currency: isoCurrency.default('USD'),
  reference: optionalString(200),
  description: optionalString(2000),
});

export const FxRateCreateSchema = z.object({
  fromCcy: isoCurrency,
  toCcy: isoCurrency,
  rate: z.coerce.number().finite().positive(),
  effectiveDate: coercedDate,
  source: optionalString(120),
});

// ── MARKETING ────────────────────────────────────────────────────────
export const EmailCampaignCreateSchema = z.object({
  name: nonEmptyString(200),
  subject: nonEmptyString(300),
  segment: optionalString(200),
  status: nonEmptyString(40).default('Draft'),
  scheduledAt: coercedDate.optional().nullable(),
});
export const EmailCampaignUpdateSchema = EmailCampaignCreateSchema.partial();

export const SocialPostCreateSchema = z.object({
  platform: nonEmptyString(40),
  content: nonEmptyString(4000),
  mediaUrl: optionalString(1000),
  status: nonEmptyString(40).default('Draft'),
  scheduledAt: coercedDate.optional().nullable(),
});
export const SocialPostUpdateSchema = SocialPostCreateSchema.partial();

// ── DOCUMENTS ────────────────────────────────────────────────────────
export const DocumentCreateSchema = z.object({
  title: nonEmptyString(300),
  type: nonEmptyString(80),
  category: optionalString(120),
  url: optionalString(1500),
  ownerId: optionalString(120),
  partyId: optionalString(120),
  status: nonEmptyString(40).default('Draft'),
  effectiveDate: coercedDate.optional().nullable(),
  expiryDate: coercedDate.optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});
export const DocumentUpdateSchema = DocumentCreateSchema.partial();

// ── NOTIFICATIONS ────────────────────────────────────────────────────
export const NotificationCreateSchema = z.object({
  userId: optionalString(120),
  channel: nonEmptyString(40).default('in-app'),
  category: optionalString(80),
  title: nonEmptyString(300),
  message: nonEmptyString(4000),
  actionUrl: optionalString(1500),
  severity: z.enum(['info', 'success', 'warning', 'error']).default('info'),
});
export const NotificationUpdateSchema = z.object({
  read: z.boolean().optional(),
  title: nonEmptyString(300).optional(),
  message: nonEmptyString(4000).optional(),
  severity: z.enum(['info', 'success', 'warning', 'error']).optional(),
});

// ── AUDIT EVENTS ─────────────────────────────────────────────────────
export const AuditEventCreateSchema = z.object({
  actorId: optionalString(120),
  actorRole: optionalString(80),
  action: nonEmptyString(120),
  module: optionalString(80),
  entity: optionalString(120),
  entityId: optionalString(120),
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
  result: nonEmptyString(40).default('success'),
});

// ── ASSETS ───────────────────────────────────────────────────────────
export const AssetCreateSchema = z.object({
  assetCode: nonEmptyString(80),
  name: nonEmptyString(200),
  category: optionalString(80),
  location: optionalString(200),
  status: nonEmptyString(40).default('Active'),
  purchaseDate: coercedDate.optional().nullable(),
  purchasePrice: coercedNonNegative.default(0),
  currency: isoCurrency.default('USD'),
  warrantyExpiry: coercedDate.optional().nullable(),
  ownerId: optionalString(120),
});
export const AssetUpdateSchema = AssetCreateSchema.partial();

export const MaintenanceLogCreateSchema = z.object({
  type: nonEmptyString(40),
  description: nonEmptyString(2000),
  cost: coercedNonNegative.default(0),
  currency: isoCurrency.default('USD'),
  technician: optionalString(200),
  nextDueAt: coercedDate.optional().nullable(),
});
