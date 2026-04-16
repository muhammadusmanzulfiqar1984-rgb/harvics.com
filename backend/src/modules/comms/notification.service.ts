/**
 * HARVICS OS — Notification Service
 * Domain 17 — Communication Layer
 *
 * Central service for all in-app notifications + approval routing.
 * Holds in-memory store (5000 notifications, 500 approvals).
 * Real-time push via Socket.IO is wired through notificationSocket.ts.
 */

import {
  Notification,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  ApprovalRequest,
  ApprovalComment,
  EscalationRule,
} from './notification.types';

// ── In-memory stores ───────────────────────────────────────────────────────
const NOTIFICATIONS: Notification[] = [];
const APPROVALS: ApprovalRequest[] = [];
const MAX_NOTIFICATIONS = 5000;
const MAX_APPROVALS = 500;

let _notifCounter = 1;
let _approvalCounter = 1;

function genNotifId(): string {
  return `notif_${Date.now()}_${(_notifCounter++).toString().padStart(5, '0')}`;
}
function genApprovalId(): string {
  return `appr_${Date.now()}_${(_approvalCounter++).toString().padStart(5, '0')}`;
}

// ── Escalation rules (production: load from DB) ─────────────────────────────
const ESCALATION_RULES: EscalationRule[] = [
  { entityType: 'PurchaseOrder', thresholdAmount: 10000,   approverRole: 'country_manager', escalateToRole: 'hq',      dueHours: 24 },
  { entityType: 'PurchaseOrder', thresholdAmount: 100000,  approverRole: 'hq',              escalateToRole: 'company',  dueHours: 12 },
  { entityType: 'Invoice',       thresholdAmount: 50000,   approverRole: 'hq',              escalateToRole: 'company',  dueHours: 48 },
  { entityType: 'JournalEntry',  thresholdAmount: 500000,  approverRole: 'company',         escalateToRole: undefined,  dueHours: 8  },
  { entityType: 'Employee',                                approverRole: 'country_manager', escalateToRole: 'hq',      dueHours: 72 },
];

// ── Socket.IO push function (injected at boot) ──────────────────────────────
type PushFn = (recipientId: string, notification: Notification) => void;
let _pushFn: PushFn | null = null;

export function setNotificationPushFn(fn: PushFn) {
  _pushFn = fn;
}

// ── Core service ─────────────────────────────────────────────────────────────
export const notificationService = {

  /**
   * Create and store a notification. Pushes real-time via Socket.IO if connected.
   */
  send(params: {
    recipientId: string;
    recipientRole?: string;
    senderId: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    body: string;
    channel?: NotificationChannel;
    actionUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    expiresAt?: string;
    metadata?: Record<string, unknown>;
  }): Notification {
    const notif: Notification = {
      id: genNotifId(),
      ts: new Date().toISOString(),
      status: 'unread',
      channel: params.channel ?? 'in_app',
      ...params,
    };

    NOTIFICATIONS.unshift(notif);
    if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) NOTIFICATIONS.splice(MAX_NOTIFICATIONS);

    // Real-time push
    if (_pushFn) _pushFn(notif.recipientId, notif);

    return notif;
  },

  /**
   * Broadcast a notification to every user with a specific role.
   */
  broadcast(params: {
    toRole: string;
    senderId: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    body: string;
    actionUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Notification {
    const notif: Notification = {
      id: genNotifId(),
      ts: new Date().toISOString(),
      recipientId: `role:${params.toRole}`,
      recipientRole: params.toRole,
      senderId: params.senderId,
      category: params.category,
      priority: params.priority,
      title: params.title,
      body: params.body,
      status: 'unread',
      channel: 'in_app',
      actionUrl: params.actionUrl,
      relatedEntityId: params.relatedEntityId,
      relatedEntityType: params.relatedEntityType,
    };

    NOTIFICATIONS.unshift(notif);
    if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) NOTIFICATIONS.splice(MAX_NOTIFICATIONS);

    // Push to role room
    if (_pushFn) _pushFn(`role:${params.toRole}`, notif);

    return notif;
  },

  /**
   * Get notifications for a specific user (includes role broadcasts).
   */
  getForUser(userId: string, userRole: string, params?: {
    status?: Notification['status'];
    category?: NotificationCategory;
    limit?: number;
    offset?: number;
  }): { notifications: Notification[]; total: number; unread: number } {
    let results = NOTIFICATIONS.filter(
      n => n.recipientId === userId || n.recipientId === `role:${userRole}`
    );

    if (params?.status) results = results.filter(n => n.status === params.status);
    if (params?.category) results = results.filter(n => n.category === params.category);

    const total = results.length;
    const unread = results.filter(n => n.status === 'unread').length;
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;

    return { notifications: results.slice(offset, offset + limit), total, unread };
  },

  /**
   * Mark a notification as read / archived / actioned.
   */
  updateStatus(notifId: string, userId: string, userRole: string, status: Notification['status']): Notification | null {
    const notif = NOTIFICATIONS.find(
      n => n.id === notifId &&
        (n.recipientId === userId || n.recipientId === `role:${userRole}`)
    );
    if (!notif) return null;
    notif.status = status;
    return notif;
  },

  /**
   * Mark all unread notifications as read for a user.
   */
  markAllRead(userId: string, userRole: string): number {
    let count = 0;
    NOTIFICATIONS
      .filter(n => n.status === 'unread' &&
        (n.recipientId === userId || n.recipientId === `role:${userRole}`))
      .forEach(n => { n.status = 'read'; count++; });
    return count;
  },

  // ── Approval Routing ──────────────────────────────────────────────────────

  /**
   * Create an approval request + send notification to approver.
   */
  requestApproval(params: {
    requesterId: string;
    requesterRole: string;
    entityType: string;
    entityId: string;
    entitySummary: string;
    amount?: number;
    priority?: NotificationPriority;
    dueBy?: string;
  }): ApprovalRequest {
    // Find matching escalation rule
    const rule = ESCALATION_RULES.find(r =>
      r.entityType === params.entityType &&
      (r.thresholdAmount === undefined || (params.amount ?? 0) >= r.thresholdAmount)
    );

    const approverRole = rule?.approverRole ?? 'hq';
    const dueHours = rule?.dueHours ?? 24;
    const dueBy = params.dueBy ??
      new Date(Date.now() + dueHours * 3600000).toISOString();

    const approval: ApprovalRequest = {
      id: genApprovalId(),
      ts: new Date().toISOString(),
      requesterId: params.requesterId,
      requesterRole: params.requesterRole,
      approverId: `role:${approverRole}`,
      approverRole,
      entityType: params.entityType,
      entityId: params.entityId,
      entitySummary: params.entitySummary,
      status: 'pending',
      priority: params.priority ?? 'normal',
      dueBy,
      comments: [],
    };

    APPROVALS.unshift(approval);
    if (APPROVALS.length > MAX_APPROVALS) APPROVALS.splice(MAX_APPROVALS);

    // Send notification to approver role
    const notif = notificationService.broadcast({
      toRole: approverRole,
      senderId: params.requesterId,
      category: 'approval_request',
      priority: params.priority ?? 'normal',
      title: `Approval Required: ${params.entityType}`,
      body: params.entitySummary,
      actionUrl: `/os/approvals/${approval.id}`,
      relatedEntityId: params.entityId,
      relatedEntityType: params.entityType,
    });

    approval.notificationId = notif.id;
    return approval;
  },

  /**
   * Approve or reject a request.
   */
  decideApproval(params: {
    approvalId: string;
    deciderId: string;
    deciderRole: string;
    decision: 'approved' | 'rejected';
    note?: string;
  }): ApprovalRequest | null {
    const approval = APPROVALS.find(a => a.id === params.approvalId);
    if (!approval || approval.status !== 'pending') return null;

    approval.status = params.decision;
    approval.decisionTs = new Date().toISOString();
    approval.decisionBy = params.deciderId;
    approval.decisionNote = params.note;

    // Notify requester
    notificationService.send({
      recipientId: approval.requesterId,
      senderId: params.deciderId,
      category: 'approval_decision',
      priority: 'high',
      title: `${approval.entityType} ${params.decision === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `${approval.entitySummary} has been ${params.decision} by ${params.deciderId}${params.note ? ': ' + params.note : '.'}`,
      actionUrl: `/os/approvals/${approval.id}`,
      relatedEntityId: approval.entityId,
      relatedEntityType: approval.entityType,
    });

    return approval;
  },

  /**
   * Add a comment to an approval request.
   */
  addComment(approvalId: string, userId: string, userRole: string, text: string): ApprovalComment | null {
    const approval = APPROVALS.find(a => a.id === approvalId);
    if (!approval) return null;

    const comment: ApprovalComment = {
      id: `comment_${Date.now()}`,
      ts: new Date().toISOString(),
      userId,
      userRole,
      text,
    };
    approval.comments = approval.comments ?? [];
    approval.comments.push(comment);
    return comment;
  },

  /**
   * Get pending approvals for a given role.
   */
  getPendingApprovals(role: string, params?: { limit?: number; offset?: number }) {
    const results = APPROVALS.filter(
      a => a.status === 'pending' &&
        (a.approverId === `role:${role}` || a.approverRole === role)
    );
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    return { approvals: results.slice(offset, offset + limit), total: results.length };
  },

  /**
   * Get all approvals (admin view).
   */
  getAllApprovals(params?: {
    status?: ApprovalRequest['status'];
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    let results = [...APPROVALS];
    if (params?.status) results = results.filter(a => a.status === params.status);
    if (params?.entityType) results = results.filter(a => a.entityType === params.entityType);
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    return { approvals: results.slice(offset, offset + limit), total: results.length };
  },

  getApprovalById(id: string): ApprovalRequest | undefined {
    return APPROVALS.find(a => a.id === id);
  },

  /**
   * System alert helpers (called by other domain services).
   */
  systemAlert(params: {
    toRole: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    body: string;
    actionUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Notification {
    const { toRole, ...rest } = params;
    return notificationService.broadcast({
      toRole,
      senderId: 'system',
      ...rest,
    });
  },
};
