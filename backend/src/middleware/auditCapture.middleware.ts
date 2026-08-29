/**
 * Module #50 — capture mutating API requests into AuditEvent (fire-and-forget).
 * Complements explicit emitAudit() calls on high-value writes.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../core/prisma';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SKIP_PREFIXES = [
  '/api/auth',
  '/api/platform/audit',
  '/api/health',
  '/api/modules/demo',
  '/api/m/',
];

function inferModule(path: string): string {
  const parts = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return 'platform';
  const head = parts[0];
  if (head.startsWith('wave')) return head;
  return head;
}

function inferEntity(path: string): string {
  const parts = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  if (parts.length >= 2) {
    const segment = parts[1].replace(/-/g, ' ');
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  return 'Resource';
}

function inferEntityId(path: string): string | null {
  const parts = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const idPart = parts.find((p) => /^c[a-z0-9]{20,}$/i.test(p) || /^[0-9a-f-]{36}$/i.test(p));
  return idPart ?? null;
}

async function writeAudit(req: Request, statusCode: number) {
  try {
    const path = req.originalUrl.split('?')[0];
    const user = (req as any).user as { id?: string; role?: string } | undefined;
    await prisma.auditEvent.create({
      data: {
        actorId: user?.id ?? null,
        actorRole: user?.role ?? null,
        action: `${req.method} ${path}`,
        module: inferModule(path),
        entity: inferEntity(path),
        entityId: inferEntityId(path),
        ipAddress: req.ip ?? null,
        userAgent: req.get('user-agent') ?? null,
        payload: req.body && Object.keys(req.body).length ? (req.body as object) : undefined,
        result: statusCode >= 200 && statusCode < 300 ? 'success' : 'failure',
      },
    });
  } catch {
    // Audit must never break the request path.
  }
}

export function auditCaptureMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING.has(req.method)) return next();
  const path = req.originalUrl.split('?')[0];
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return next();

  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 400) return;
    void writeAudit(req, res.statusCode);
  });

  next();
}
