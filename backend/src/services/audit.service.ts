/**
 * Central audit emitter — Module #50 Audit Log
 * All module writes should call emitAudit so /api/platform/audit/search has data.
 */

import { Request } from 'express';
import { prisma } from '../core/prisma';

export async function emitAudit(
  req: Request,
  action: string,
  entity: string,
  entityId: string | undefined,
  options?: {
    module?: string;
    payload?: unknown;
    result?: string;
  },
) {
  try {
    const user = (req as any).user as { id?: string; role?: string } | undefined;
    await prisma.auditEvent.create({
      data: {
        actorId: user?.id ?? null,
        actorRole: user?.role ?? null,
        action,
        module: options?.module ?? 'platform',
        entity,
        entityId: entityId ?? null,
        ipAddress: req.ip ?? null,
        userAgent: req.get('user-agent') ?? null,
        payload: (options?.payload as any) ?? undefined,
        result: options?.result ?? 'success',
      },
    });
  } catch {
    // Audit must never break the request.
  }
}
