import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  numeric,
  jsonb,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const accountTypeEnum = pgEnum('account_type', [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
  'ESCROW',
]);

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  hpayId: varchar('hpay_id', { length: 32 }).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  countryCode: varchar('country_code', { length: 3 }).notNull().default('UAE'),
  tier: varchar('tier', { length: 32 }).notNull().default('ENTERPRISE'),
  status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 64 }).notNull().unique(),
  passwordHash: text('password_hash'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(true),
  role: varchar('role', { length: 32 }).notNull().default('ADMIN'),
  kycStatus: varchar('kyc_status', { length: 32 }).notNull().default('not_started'),
  kycTier: integer('kyc_tier').notNull().default(0),
  status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  accountNumber: varchar('account_number', { length: 64 }).notNull().unique(),
  type: accountTypeEnum('type').notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  label: varchar('label', { length: 128 }),
  status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id),
  idempotencyKey: varchar('idempotency_key', { length: 128 }).notNull().unique(),
  referenceType: varchar('reference_type', { length: 64 }).notNull(),
  referenceId: varchar('reference_id', { length: 128 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('POSTED'),
  postedAt: timestamp('posted_at', { withTimezone: true }).notNull().defaultNow(),
  merkleTreeHash: varchar('merkle_tree_hash', { length: 128 }),
  metadata: jsonb('metadata').notNull().default({}),
});

export const ledgerLines = pgTable('ledger_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  debit: numeric('debit', { precision: 28, scale: 8 }).notNull().default('0'),
  credit: numeric('credit', { precision: 28, scale: 8 }).notNull().default('0'),
  currency: varchar('currency', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 128 }).primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  requestPath: varchar('request_path', { length: 255 }).notNull(),
  requestHash: varchar('request_hash', { length: 64 }).notNull(),
  responseStatus: integer('response_status'),
  responseBody: jsonb('response_body'),
  status: varchar('status', { length: 32 }).notNull().default('PROCESSING'),
  lockedUntil: timestamp('locked_until', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const securityAuditLogs = pgTable('security_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  eventType: varchar('event_type', { length: 64 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  signature: varchar('signature', { length: 256 }).notNull(),
  payload: jsonb('payload').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});

export const webauthnCredentials = pgTable(
  'webauthn_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    credentialId: text('credential_id').notNull(),
    publicKey: text('public_key').notNull(),
    counter: bigint('counter', { mode: 'number' }).notNull().default(0),
    transports: text('transports').array(),
    deviceType: varchar('device_type', { length: 64 }),
    backedUp: boolean('backed_up').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('webauthn_credential_id_uidx').on(t.credentialId)]
);
