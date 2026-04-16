/**
 * HARVICS OS — RBAC Middleware
 * Domain 16 — Admin & Security
 *
 * Usage:
 *   router.get('/invoices', requireAuthScope, requirePermission('finance', 'read'), handler)
 *   router.post('/invoices', requireAuthScope, requirePermission('finance', 'create'), handler)
 *   router.delete('/invoices/:id', requireAuthScope, requirePermission('finance', 'delete'), handler)
 *
 * Every blocked attempt is written to the Audit Log automatically.
 */

import { Request, Response, NextFunction } from 'express';
import { RBACAction, RBACResource, hasPermission } from '../modules/auth/rbac.permissions';
import { auditLogService } from '../services/auditLog.service';

/**
 * Returns a middleware that enforces a specific permission.
 * Must be used AFTER requireAuthScope (needs req.user populated).
 */
export function requirePermission(resource: RBACResource, action: RBACAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    const role: string = user.role || '';
    const allowed = hasPermission(role, resource, action);

    // Write to audit log regardless of outcome
    auditLogService.write({
      userId: user.id || 'unknown',
      userRole: role,
      action: `${action}:${resource}`,
      resource,
      method: req.method,
      path: req.originalUrl,
      statusCode: allowed ? 0 : 403, // 0 = pending (will be set by response)
      allowed,
      reason: allowed
        ? undefined
        : `Role '${role}' does not have '${action}' permission on '${resource}'`,
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        detail: `Your role '${role}' does not have '${action}' access to '${resource}'`,
      });
    }

    next();
  };
}
