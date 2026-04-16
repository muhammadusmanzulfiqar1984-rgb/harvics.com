/**
 * HARVICS OS — Communication Layer Types
 * Domain 17 — Communication Layer
 */

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'webhook';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export type NotificationCategory =
  | 'approval_request'
  | 'approval_decision'
  | 'system_alert'
  | 'finance_alert'
  | 'inventory_alert'
  | 'procurement_alert'
  | 'crm_alert'
  | 'hr_alert'
  | 'logistics_alert'
  | 'security_alert'
  | 'ai_insight'
  | 'task_assigned'
  | 'mention'
  | 'announcement';

export type NotificationStatus = 'unread' | 'read' | 'archived' | 'actioned';

export interface Notification {
  id: string;
  ts: string;                       // ISO timestamp
  recipientId: string;              // userId
  recipientRole?: string;           // optional — for role-broadcast notifications
  senderId: string;                 // userId or 'system'
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  actionUrl?: string;               // deep link to relevant record
  relatedEntityId?: string;         // e.g. PO ID, Invoice ID
  relatedEntityType?: string;       // e.g. 'PurchaseOrder', 'Invoice'
  expiresAt?: string;               // ISO — auto-archive after
  metadata?: Record<string, unknown>;
}

export interface ApprovalRequest {
  id: string;
  ts: string;
  requesterId: string;
  requesterRole: string;
  approverId: string;               // userId of designated approver
  approverRole: string;
  entityType: string;               // e.g. 'PurchaseOrder'
  entityId: string;
  entitySummary: string;            // human-readable e.g. "PO-0042 — $12,500 — Supplier: MegaFoods"
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  priority: NotificationPriority;
  dueBy?: string;                   // ISO — when approval must happen by
  comments?: ApprovalComment[];
  decisionTs?: string;
  decisionBy?: string;
  decisionNote?: string;
  notificationId?: string;          // linked notification
}

export interface ApprovalComment {
  id: string;
  ts: string;
  userId: string;
  userRole: string;
  text: string;
}

export interface EscalationRule {
  entityType: string;
  thresholdAmount?: number;
  approverRole: string;             // role that must approve
  escalateToRole?: string;          // if not actioned within dueHours
  dueHours: number;
}
