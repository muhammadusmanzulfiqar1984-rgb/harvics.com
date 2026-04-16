/**
 * HARVICS OS — Audit Log Controller
 * Domain 16 — Admin & Security
 *
 * GET  /api/audit-log          — paginated log (company/hq only)
 * GET  /api/audit-log/summary  — dashboard stats
 * GET  /api/audit-log/user/:userId — log for a specific user
 */

import { Router, Request, Response } from 'express';
import { requireAuthScope } from '../../middleware/authScope';
import { requirePermission } from '../../middleware/rbac.middleware';
import { auditLogService } from '../../services/auditLog.service';

const auditLogRouter = Router();

// GET /api/audit-log/summary — stats for security dashboard
auditLogRouter.get(
  '/summary',
  requireAuthScope,
  requirePermission('auditLog', 'read'),
  (_req: Request, res: Response) => {
    const summary = auditLogService.getSummary();
    return res.json({ success: true, data: summary });
  }
);

// GET /api/audit-log/user/:userId — entries for a specific user
auditLogRouter.get(
  '/user/:userId',
  requireAuthScope,
  requirePermission('auditLog', 'read'),
  (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const result = auditLogService.query({
      userId: req.params.userId,
      limit,
      offset,
    });

    return res.json({ success: true, data: result });
  }
);

// GET /api/audit-log — full paginated log
auditLogRouter.get(
  '/',
  requireAuthScope,
  requirePermission('auditLog', 'read'),
  (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const { userId, resource, action, allowed, from, to } = req.query;

    const result = auditLogService.query({
      userId: userId as string | undefined,
      resource: resource as string | undefined,
      action: action as string | undefined,
      allowed: allowed !== undefined ? allowed === 'true' : undefined,
      from: from as string | undefined,
      to: to as string | undefined,
      limit,
      offset,
    });

    return res.json({ success: true, data: result });
  }
);

export { auditLogRouter };
