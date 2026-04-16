/**
 * HARVICS OS — Audit Log Service
 * Domain 16 — Admin & Security
 *
 * Every write, every user, every field, every timestamp.
 * In-memory store (capped at 5000 entries) with full structured entries.
 * In production: flush to DB table AuditLog via Prisma.
 */

export interface AuditLogEntry {
  id: string;
  ts: string;               // ISO timestamp
  userId: string;
  userRole: string;
  action: string;           // e.g. "create:finance", "delete:crm"
  resource: string;
  method: string;           // HTTP method
  path: string;
  statusCode: number;       // final HTTP response code (0 = unknown/pre-check)
  allowed: boolean;
  reason?: string;          // why blocked (if denied)
  body?: Record<string, unknown>; // sanitized request body
  changes?: Record<string, { before: unknown; after: unknown }>; // field-level diff
  ip: string;
  userAgent: string;
  correlationId?: string;   // for tracing across services
}

const AUDIT_LOG: AuditLogEntry[] = [];
const MAX_ENTRIES = 5000;

let _idCounter = 1;

function generateId(): string {
  return `audit_${Date.now()}_${(_idCounter++).toString().padStart(6, '0')}`;
}

// Fields to strip from body before logging (security)
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'pin', 'cvv', 'ssn', 'nationalId'];

function sanitizeBody(body: unknown): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    sanitized[key] = SENSITIVE_FIELDS.includes(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return sanitized;
}

const auditLogService = {
  /**
   * Write a new audit log entry.
   */
  write(entry: Omit<AuditLogEntry, 'id' | 'ts'>): AuditLogEntry {
    const record: AuditLogEntry = {
      id: generateId(),
      ts: new Date().toISOString(),
      ...entry,
    };

    AUDIT_LOG.unshift(record);

    // Cap at MAX_ENTRIES — oldest entries dropped
    if (AUDIT_LOG.length > MAX_ENTRIES) {
      AUDIT_LOG.splice(MAX_ENTRIES);
    }

    return record;
  },

  /**
   * Write a write-operation audit entry with body capture.
   */
  writeRequest(params: {
    userId: string;
    userRole: string;
    method: string;
    path: string;
    resource: string;
    body?: unknown;
    statusCode: number;
    ip: string;
    userAgent: string;
    changes?: Record<string, { before: unknown; after: unknown }>;
    correlationId?: string;
  }): AuditLogEntry {
    return auditLogService.write({
      userId: params.userId,
      userRole: params.userRole,
      action: `${params.method.toLowerCase()}:${params.resource}`,
      resource: params.resource,
      method: params.method,
      path: params.path,
      statusCode: params.statusCode,
      allowed: params.statusCode < 400,
      body: sanitizeBody(params.body),
      changes: params.changes,
      ip: params.ip,
      userAgent: params.userAgent,
      correlationId: params.correlationId,
    });
  },

  /**
   * Query audit log with filters.
   */
  query(filters: {
    userId?: string;
    resource?: string;
    action?: string;
    allowed?: boolean;
    from?: string;  // ISO date string
    to?: string;    // ISO date string
    limit?: number;
    offset?: number;
  }): { entries: AuditLogEntry[]; total: number } {
    let results = [...AUDIT_LOG];

    if (filters.userId) {
      results = results.filter(e => e.userId === filters.userId);
    }
    if (filters.resource) {
      results = results.filter(e => e.resource === filters.resource);
    }
    if (filters.action) {
      results = results.filter(e => e.action.includes(filters.action!));
    }
    if (filters.allowed !== undefined) {
      results = results.filter(e => e.allowed === filters.allowed);
    }
    if (filters.from) {
      const from = new Date(filters.from).getTime();
      results = results.filter(e => new Date(e.ts).getTime() >= from);
    }
    if (filters.to) {
      const to = new Date(filters.to).getTime();
      results = results.filter(e => new Date(e.ts).getTime() <= to);
    }

    const total = results.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 50;

    return {
      entries: results.slice(offset, offset + limit),
      total,
    };
  },

  /**
   * Get summary stats for dashboard.
   */
  getSummary() {
    const total = AUDIT_LOG.length;
    const blocked = AUDIT_LOG.filter(e => !e.allowed).length;
    const last24h = AUDIT_LOG.filter(
      e => new Date(e.ts).getTime() > Date.now() - 86400000
    ).length;

    // Top blocked resources
    const blockedByResource: Record<string, number> = {};
    AUDIT_LOG.filter(e => !e.allowed).forEach(e => {
      blockedByResource[e.resource] = (blockedByResource[e.resource] || 0) + 1;
    });

    // Top active users
    const byUser: Record<string, number> = {};
    AUDIT_LOG.forEach(e => {
      byUser[e.userId] = (byUser[e.userId] || 0) + 1;
    });

    return {
      total,
      blocked,
      allowed: total - blocked,
      last24h,
      blockRate: total > 0 ? ((blocked / total) * 100).toFixed(1) + '%' : '0%',
      topBlockedResources: Object.entries(blockedByResource)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([resource, count]) => ({ resource, count })),
      topActiveUsers: Object.entries(byUser)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, count })),
    };
  },

  /**
   * Get raw log (for admin only).
   */
  getAll(limit = 100, offset = 0): AuditLogEntry[] {
    return AUDIT_LOG.slice(offset, offset + limit);
  },

  count(): number {
    return AUDIT_LOG.length;
  },
};

export { auditLogService };
