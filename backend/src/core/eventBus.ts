/**
 * HARVICS OS — Cross-Domain Event Bus
 * 
 * When one domain acts, others react. One order creation ripples across
 * inventory, finance, logistics, CRM, and AI — automatically.
 * 
 * Usage:
 *   eventBus.emit('order.created', { orderId, items, customer, ... })
 *   eventBus.on('order.created', (data) => inventory.deductStock(data.items))
 */

import { EventEmitter } from 'events';

export type DomainEvent =
  // Orders
  | 'order.created' | 'order.updated' | 'order.cancelled' | 'order.completed'
  // Inventory
  | 'inventory.adjusted' | 'inventory.low-stock' | 'inventory.transfer'
  // Finance
  | 'finance.invoice.created' | 'finance.payment.received' | 'finance.journal.posted'
  // CRM
  | 'crm.customer.created' | 'crm.lead.created' | 'crm.campaign.launched'
  // HR
  | 'hr.employee.created' | 'hr.payroll.run' | 'hr.review.submitted'
  // Logistics
  | 'logistics.route.created' | 'logistics.delivery.completed' | 'logistics.delivery.delayed'
  // Procurement
  | 'procurement.po.created' | 'procurement.grn.received' | 'procurement.rfq.issued'
  // AI
  | 'ai.anomaly.detected' | 'ai.forecast.generated' | 'ai.recommendation.ready'
  // Approval
  | 'approval.requested' | 'approval.approved' | 'approval.rejected';

interface EventLog {
  event: DomainEvent;
  data: any;
  timestamp: string;
  source: string;
}

class HarvicsEventBus extends EventEmitter {
  private log: EventLog[] = [];
  private maxLog = 500;

  emitDomain(event: DomainEvent, data: any, source: string = 'system') {
    const entry: EventLog = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source
    };
    this.log.push(entry);
    if (this.log.length > this.maxLog) this.log.shift();

    console.log(`[EventBus] ${event} from ${source}`);
    this.emit(event, data);
  }

  getLog(limit = 50): EventLog[] {
    return this.log.slice(-limit);
  }

  getLogByEvent(event: DomainEvent, limit = 20): EventLog[] {
    return this.log.filter(e => e.event === event).slice(-limit);
  }
}

export const eventBus = new HarvicsEventBus();

// ── CROSS-DOMAIN LISTENERS ──────────────────────────────────────────

// When an order is created → deduct inventory, create AR entry, plan delivery
eventBus.on('order.created', (data) => {
  console.log(`[CrossDomain] order.created → triggering inventory, finance, logistics`);
  // These will be picked up by their respective domain stores
  eventBus.emitDomain('inventory.adjusted', {
    reason: 'order_fulfillment',
    orderId: data.id,
    items: data.items
  }, 'orders');

  eventBus.emitDomain('finance.invoice.created', {
    orderId: data.id,
    customerId: data.customerId,
    amount: data.total,
    currency: data.currency || 'USD'
  }, 'orders');

  eventBus.emitDomain('logistics.route.created', {
    orderId: data.id,
    destination: data.shippingAddress || data.city,
    priority: data.total > 50000 ? 'high' : 'normal'
  }, 'orders');
});

// When payment received → update order status
eventBus.on('finance.payment.received', (data) => {
  console.log(`[CrossDomain] payment.received → updating order ${data.orderId}`);
});

// When delivery completed → update order, notify CRM
eventBus.on('logistics.delivery.completed', (data) => {
  console.log(`[CrossDomain] delivery.completed → updating order + CRM`);
  eventBus.emitDomain('crm.lead.created', {
    reason: 'post_delivery_followup',
    orderId: data.orderId,
    customerId: data.customerId
  }, 'logistics');
});

// When inventory low → trigger procurement
eventBus.on('inventory.low-stock', (data) => {
  console.log(`[CrossDomain] low-stock → triggering procurement RFQ`);
  eventBus.emitDomain('procurement.rfq.issued', {
    sku: data.sku,
    quantity: data.reorderQuantity,
    reason: 'auto_replenishment'
  }, 'inventory');
});

// When GRN received → update inventory
eventBus.on('procurement.grn.received', (data) => {
  console.log(`[CrossDomain] grn.received → updating inventory`);
  eventBus.emitDomain('inventory.adjusted', {
    reason: 'grn_receipt',
    items: data.items,
    poId: data.poId
  }, 'procurement');
});

export default eventBus;
