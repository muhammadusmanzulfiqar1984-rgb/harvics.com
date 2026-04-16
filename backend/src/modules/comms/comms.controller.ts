/**
 * HARVICS OS — Notifications + Approvals Controller
 * Domain 17 — Communication Layer
 *
 * Notifications:
 *   GET  /api/comms/notifications          — get my notifications
 *   PATCH /api/comms/notifications/:id     — mark read/archived/actioned
 *   POST  /api/comms/notifications/read-all — mark all read
 *
 * Approvals:
 *   GET  /api/comms/approvals              — get pending approvals for my role
 *   GET  /api/comms/approvals/all          — all approvals (hq/company only)
 *   GET  /api/comms/approvals/:id          — single approval detail
 *   POST /api/comms/approvals              — create approval request
 *   POST /api/comms/approvals/:id/decide   — approve or reject
 *   POST /api/comms/approvals/:id/comment  — add comment
 *
 * System:
 *   POST /api/comms/system-alert           — broadcast alert to a role (hq/company only)
 */

import { Router, Request, Response } from 'express';
import { requireAuthScope } from '../../middleware/authScope';
import { requirePermission } from '../../middleware/rbac.middleware';
import { notificationService } from './notification.service';
import { NotificationStatus, NotificationPriority, NotificationCategory } from './notification.types';

const commsRouter = Router();

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

// GET /api/comms/notifications
commsRouter.get(
  '/notifications',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const { status, category, limit, offset } = req.query;

    const result = notificationService.getForUser(user.id, userScope?.role ?? user.role, {
      status: status as NotificationStatus | undefined,
      category: category as NotificationCategory | undefined,
      limit: limit ? Math.min(Number(limit), 100) : 50,
      offset: offset ? Number(offset) : 0,
    });

    return res.json({ success: true, data: result });
  }
);

// PATCH /api/comms/notifications/:id
commsRouter.patch(
  '/notifications/:id',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const { status } = req.body;

    const VALID_STATUSES: NotificationStatus[] = ['read', 'archived', 'actioned'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const updated = notificationService.updateStatus(
      req.params.id,
      user.id,
      userScope?.role ?? user.role,
      status
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notification not found or not yours' });
    }

    return res.json({ success: true, data: updated });
  }
);

// POST /api/comms/notifications/read-all
commsRouter.post(
  '/notifications/read-all',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const count = notificationService.markAllRead(user.id, userScope?.role ?? user.role);
    return res.json({ success: true, data: { marked: count } });
  }
);

// ── APPROVALS ─────────────────────────────────────────────────────────────────

// GET /api/comms/approvals/all — full list (hq/company only)
commsRouter.get(
  '/approvals/all',
  requireAuthScope,
  requirePermission('domains', 'admin'),
  (req: Request, res: Response) => {
    const { status, entityType, limit, offset } = req.query;
    const result = notificationService.getAllApprovals({
      status: status as ApprovalRequest_status | undefined,
      entityType: entityType as string | undefined,
      limit: limit ? Math.min(Number(limit), 100) : 50,
      offset: offset ? Number(offset) : 0,
    });
    return res.json({ success: true, data: result });
  }
);

// GET /api/comms/approvals — pending for my role
commsRouter.get(
  '/approvals',
  requireAuthScope,
  (req: Request, res: Response) => {
    const userScope = (req as any).userScope;
    const { limit, offset } = req.query;
    const role = userScope?.role ?? (req as any).user?.role ?? 'hq';
    const result = notificationService.getPendingApprovals(role, {
      limit: limit ? Math.min(Number(limit), 100) : 50,
      offset: offset ? Number(offset) : 0,
    });
    return res.json({ success: true, data: result });
  }
);

// GET /api/comms/approvals/:id
commsRouter.get(
  '/approvals/:id',
  requireAuthScope,
  (req: Request, res: Response) => {
    const approval = notificationService.getApprovalById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, error: 'Approval not found' });
    return res.json({ success: true, data: approval });
  }
);

// POST /api/comms/approvals — create approval request
commsRouter.post(
  '/approvals',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const { entityType, entityId, entitySummary, amount, priority, dueBy } = req.body;

    if (!entityType || !entityId || !entitySummary) {
      return res.status(400).json({ success: false, error: 'entityType, entityId and entitySummary are required' });
    }

    const approval = notificationService.requestApproval({
      requesterId: user.id,
      requesterRole: userScope?.role ?? user.role,
      entityType,
      entityId,
      entitySummary,
      amount: amount ? Number(amount) : undefined,
      priority: priority as NotificationPriority | undefined,
      dueBy,
    });

    return res.status(201).json({ success: true, data: approval });
  }
);

// POST /api/comms/approvals/:id/decide
commsRouter.post(
  '/approvals/:id/decide',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const { decision, note } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'decision must be "approved" or "rejected"' });
    }

    const result = notificationService.decideApproval({
      approvalId: req.params.id,
      deciderId: user.id,
      deciderRole: userScope?.role ?? user.role,
      decision,
      note,
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Approval not found or already decided' });
    }

    return res.json({ success: true, data: result });
  }
);

// POST /api/comms/approvals/:id/comment
commsRouter.post(
  '/approvals/:id/comment',
  requireAuthScope,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const userScope = (req as any).userScope;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: 'comment text is required' });
    }

    const comment = notificationService.addComment(
      req.params.id,
      user.id,
      userScope?.role ?? user.role,
      text.trim()
    );

    if (!comment) return res.status(404).json({ success: false, error: 'Approval not found' });
    return res.status(201).json({ success: true, data: comment });
  }
);

// ── SYSTEM ALERT (hq/company broadcast) ──────────────────────────────────────

// POST /api/comms/system-alert
commsRouter.post(
  '/system-alert',
  requireAuthScope,
  requirePermission('domains', 'admin'),
  (req: Request, res: Response) => {
    const { toRole, category, priority, title, body, actionUrl } = req.body;

    if (!toRole || !title || !body) {
      return res.status(400).json({ success: false, error: 'toRole, title and body are required' });
    }

    const notif = notificationService.systemAlert({
      toRole,
      category: (category as NotificationCategory) ?? 'announcement',
      priority: (priority as NotificationPriority) ?? 'normal',
      title,
      body,
      actionUrl,
    });

    return res.status(201).json({ success: true, data: notif });
  }
);

// Local type alias (avoid importing from service layer)
type ApprovalRequest_status = 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';

export { commsRouter };
