/**
 * Order → Delivery → Billing (O2C) — Oracle AR cross parity.
 * Sales order fulfillment spine: confirm → ship → deliver → bill on delivery.
 */
import { prisma } from '../core/prisma';
import { invoicesDb } from '../core/db';
import { getCustomerMaster, billToFromCustomer } from './arMasterData.service';
import { getDefaultInvoicingEntity, getLegalEntity, resolveEntityForCountry } from './entityMaster.service';
import { packMeta } from './dunning.service';

export type O2CStage = {
  key: string;
  label: string;
  order: number;
  description: string;
};

export const O2C_STAGES: O2CStage[] = [
  { key: 'CONFIRMED', label: 'Order confirmed', order: 1, description: 'Commercial commitment — credit checked' },
  { key: 'IN_FULFILLMENT', label: 'Pick & pack', order: 2, description: 'Warehouse allocation / fulfillment started' },
  { key: 'SHIPPED', label: 'Shipped', order: 3, description: 'Goods dispatched — delivery slot booked' },
  { key: 'DELIVERED', label: 'Delivered', order: 4, description: 'Proof of delivery — ready to bill' },
  { key: 'INVOICED', label: 'Billed', order: 5, description: 'AR invoice posted from delivery' },
];

/** Oracle-style O2C transitions (bill on delivery, not on order). */
export const O2C_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_FULFILLMENT', 'SHIPPED', 'CANCELLED'],
  CREDIT_HOLD: ['CONFIRMED', 'CANCELLED'],
  IN_FULFILLMENT: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['INVOICED'],
  INVOICED: [],
  COMPLETED: [],
  CANCELLED: [],
};

function canTransition(from: string, to: string): boolean {
  return (O2C_TRANSITIONS[from] || []).includes(to);
}

function packInvoiceMeta(meta: Record<string, any>, notes?: string): string | undefined {
  return packMeta(meta, notes);
}

function termsToDays(terms?: string | null): number {
  if (!terms) return 30;
  const m = String(terms).match(/(\d+)/);
  return m ? Math.min(365, Math.max(1, Number(m[1]))) : 30;
}

export async function listO2CPipeline(limit = 100) {
  let orders: any[] = [];
  try {
    orders = await prisma.salesOrder.findMany({
      where: { status: { notIn: ['CANCELLED'] } },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return { orders: [], tableMissing: true };
    }
    throw err;
  }

  const orderIds = orders.map((o) => o.id);
  let slots: any[] = [];
  try {
    slots = orderIds.length
      ? await prisma.deliverySlot.findMany({ where: { orderId: { in: orderIds } }, orderBy: { scheduledFor: 'desc' } })
      : [];
  } catch {
    slots = [];
  }

  const slotByOrder = new Map<string, any>();
  for (const s of slots) {
    if (s.orderId && !slotByOrder.has(s.orderId)) slotByOrder.set(s.orderId, s);
  }

  const invoiceIds = orders.map((o) => o.invoiceId).filter(Boolean) as string[];
  const invoiceMap = new Map<string, any>();
  if (invoiceIds.length) {
    const invList = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
    for (const inv of invList) {
      if (invoiceIds.includes(inv.id)) invoiceMap.set(inv.id, inv);
    }
  }

  const pipeline = orders.map((o) => {
    const slot = slotByOrder.get(o.id);
    const inv = o.invoiceId ? invoiceMap.get(o.invoiceId) : null;
    const stageIdx = O2C_STAGES.findIndex((s) => s.key === o.status);
    const nextActions: string[] = [];
    if (o.status === 'CONFIRMED' || o.status === 'IN_FULFILLMENT') nextActions.push('ship');
    if (o.status === 'SHIPPED') nextActions.push('deliver');
    if (o.status === 'DELIVERED' && !o.invoiceId) nextActions.push('bill');
    if (o.status === 'CREDIT_HOLD') nextActions.push('release_credit');

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      status: o.status,
      stageLabel: O2C_STAGES.find((s) => s.key === o.status)?.label || o.status,
      stageOrder: stageIdx >= 0 ? stageIdx + 1 : 0,
      totalAmount: o.totalAmount,
      currency: o.currency,
      orderDate: o.orderDate,
      lineCount: o.lines?.length || 0,
      delivery: slot
        ? {
            id: slot.id,
            status: slot.status,
            scheduledFor: slot.scheduledFor,
            driver: slot.driver,
            vehicle: slot.vehicle,
          }
        : null,
      invoice: inv
        ? { id: inv.id, invoiceNo: inv.invoiceNo, status: inv.status, amount: inv.amount }
        : o.invoiceId
          ? { id: o.invoiceId, invoiceNo: '—', status: 'Linked' }
          : null,
      nextActions,
      quoteId: o.quoteId,
    };
  });

  const summary = {
    confirmed: pipeline.filter((p) => p.status === 'CONFIRMED').length,
    inFulfillment: pipeline.filter((p) => p.status === 'IN_FULFILLMENT').length,
    shipped: pipeline.filter((p) => p.status === 'SHIPPED').length,
    deliveredUnbilled: pipeline.filter((p) => p.status === 'DELIVERED' && !p.invoice).length,
    invoiced: pipeline.filter((p) => p.status === 'INVOICED' || p.invoice).length,
    creditHold: pipeline.filter((p) => p.status === 'CREDIT_HOLD').length,
  };

  return { orders: pipeline, summary, tableMissing: false };
}

export async function getO2COrder(orderId: string) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { lines: true },
  });
  if (!order) return null;

  let delivery = null;
  try {
    delivery = await prisma.deliverySlot.findFirst({
      where: { orderId: order.id },
      orderBy: { scheduledFor: 'desc' },
    });
  } catch {
    delivery = null;
  }

  let invoice = null;
  if (order.invoiceId) {
    invoice = await invoicesDb.get(order.invoiceId);
  }

  const allowed = O2C_TRANSITIONS[order.status] || [];
  return { order, delivery, invoice, allowed, stages: O2C_STAGES };
}

export async function shipSalesOrder(
  orderId: string,
  opts?: { channelCode?: string; scheduledFor?: string; driver?: string; vehicle?: string; notes?: string },
) {
  const order = await prisma.salesOrder.findUnique({ where: { id: orderId }, include: { lines: true } });
  if (!order) return { ok: false, error: 'Sales order not found' };
  if (order.status === 'CREDIT_HOLD') {
    return { ok: false, error: 'Order on credit hold — release before shipping' };
  }
  if (!['CONFIRMED', 'IN_FULFILLMENT'].includes(order.status)) {
    return {
      ok: false,
      error: `Cannot ship from status '${order.status}'`,
      allowed: O2C_TRANSITIONS[order.status] || [],
    };
  }

  const scheduledFor = opts?.scheduledFor ? new Date(opts.scheduledFor) : new Date(Date.now() + 2 * 86400000);
  let delivery = null;
  try {
    delivery = await prisma.deliverySlot.create({
      data: {
        orderId: order.id,
        channelCode: opts?.channelCode || 'DIRECT',
        scheduledFor,
        windowStart: '09:00',
        windowEnd: '17:00',
        status: 'InTransit',
        driver: opts?.driver || null,
        vehicle: opts?.vehicle || null,
        notes: opts?.notes || `Shipped for ${order.orderNumber}`,
      },
    });
  } catch {
    // DeliverySlot table may be missing — still advance order status
  }

  const updated = await prisma.salesOrder.update({
    where: { id: order.id },
    data: { status: 'SHIPPED' },
    include: { lines: true },
  });

  return { ok: true, order: updated, delivery, message: `Order ${order.orderNumber} shipped` };
}

export async function deliverSalesOrder(orderId: string, opts?: { notes?: string }) {
  const order = await prisma.salesOrder.findUnique({ where: { id: orderId }, include: { lines: true } });
  if (!order) return { ok: false, error: 'Sales order not found' };
  if (order.status !== 'SHIPPED') {
    return {
      ok: false,
      error: `Cannot deliver from status '${order.status}' — must be SHIPPED`,
      allowed: O2C_TRANSITIONS[order.status] || [],
    };
  }

  let delivery = null;
  try {
    delivery = await prisma.deliverySlot.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: 'desc' } });
    if (delivery) {
      delivery = await prisma.deliverySlot.update({
        where: { id: delivery.id },
        data: { status: 'Delivered', notes: opts?.notes || delivery.notes },
      });
    }
  } catch {
    delivery = null;
  }

  const updated = await prisma.salesOrder.update({
    where: { id: order.id },
    data: { status: 'DELIVERED' },
    include: { lines: true },
  });

  return { ok: true, order: updated, delivery, message: `Order ${order.orderNumber} delivered — ready to bill` };
}

export async function billSalesOrderFromDelivery(
  orderId: string,
  opts?: { postToGl?: boolean; asDraft?: boolean; dueDate?: string },
) {
  const order = await prisma.salesOrder.findUnique({ where: { id: orderId }, include: { lines: true } });
  if (!order) return { ok: false, error: 'Sales order not found' };

  if (order.invoiceId) {
    const existing = await invoicesDb.get(order.invoiceId);
    return {
      ok: true,
      invoice: existing,
      order,
      alreadyBilled: true,
      message: `Already billed — ${existing?.invoiceNo || order.invoiceId}`,
    };
  }

  if (order.status !== 'DELIVERED' && order.status !== 'SHIPPED') {
    return {
      ok: false,
      error: `Bill on delivery requires DELIVERED status (current: ${order.status})`,
      hint: 'Ship → Deliver → Bill (Oracle O2C)',
    };
  }

  const master = await getCustomerMaster(order.customerName);
  const entity =
    ((opts as any)?.legalEntityCode && (await getLegalEntity(String((opts as any).legalEntityCode)))) ||
    (master?.country ? await resolveEntityForCountry(master.country) : await getDefaultInvoicingEntity());
  const termsDays = termsToDays(order.paymentTerms || master?.paymentTerms);
  const dueDate =
    opts?.dueDate || new Date(Date.now() + termsDays * 86400000).toISOString().slice(0, 10);

  const linePayload = (order.lines || []).map((l: any, i: number) => ({
    lineNumber: l.lineNumber || i + 1,
    sku: l.sku,
    description: l.description || l.sku,
    quantity: l.quantity,
    uom: l.uom || 'EA',
    unitPrice: l.unitPrice,
    discount: l.discount || 0,
    taxCode: null,
    lineTotal: l.lineTotal,
  }));

  const meta: Record<string, any> = {
    salesOrderId: order.id,
    salesOrderNo: order.orderNumber,
    o2c: { billedAt: new Date().toISOString(), billTrigger: 'delivery' },
    legalEntity: {
      id: entity!.id,
      code: entity!.code,
      name: entity!.name,
      legalName: entity!.legalName,
      country: entity!.country,
    },
  };
  if (order.paymentTerms) meta.paymentTerms = order.paymentTerms;
  if (master) {
    const billTo = billToFromCustomer(master);
    if (billTo) meta.billTo = billTo;
    if (master.vatNumber) meta.vatNumber = master.vatNumber;
    if (master.contactEmail) meta.contactEmail = master.contactEmail;
  }
  if (order.quoteId) meta.quoteId = order.quoteId;

  const count = await invoicesDb.count();
  const invoiceNo = `INV-SO-${order.orderNumber.replace(/[^A-Za-z0-9-]/g, '').slice(-16)}`;

  let inv: any;
  try {
    inv = await invoicesDb.create(
      {
        invoiceNo: invoiceNo.length > 8 ? invoiceNo : `INV-2026-${String(count + 1).padStart(3, '0')}`,
        customerName: order.customerName,
        amount: order.totalAmount,
        currency: order.currency || 'USD',
        dueDate,
        type: 'AR',
        status: opts?.asDraft ? 'Draft' : 'Unpaid',
        subtotal: order.subtotal,
        taxAmount: order.taxAmount || 0,
        lines: linePayload.length ? linePayload : undefined,
        notes: packInvoiceMeta(meta, order.notes || undefined),
      },
      'finance.o2c.invoice',
    );
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Invoice create failed' };
  }

  const updated = await prisma.salesOrder.update({
    where: { id: order.id },
    data: { invoiceId: inv.id, status: 'INVOICED' },
    include: { lines: true },
  });

  return {
    ok: true,
    invoice: inv,
    order: updated,
    postToGl: opts?.postToGl !== false,
    message: `AR invoice ${inv.invoiceNo} created from delivery`,
  };
}

export async function releaseCreditHold(orderId: string) {
  const order = await prisma.salesOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: 'Sales order not found' };
  if (order.status !== 'CREDIT_HOLD') {
    return { ok: false, error: `Order is not on credit hold (status: ${order.status})` };
  }
  if (!canTransition('CREDIT_HOLD', 'CONFIRMED')) {
    return { ok: false, error: 'Transition not allowed' };
  }
  const updated = await prisma.salesOrder.update({
    where: { id: order.id },
    data: { status: 'CONFIRMED' },
    include: { lines: true },
  });
  return { ok: true, order: updated, message: `Credit hold released — ${order.orderNumber} confirmed` };
}

export async function runO2CBillingBatch(limit = 20) {
  const { orders } = await listO2CPipeline(200);
  const toBill = orders.filter((o) => o.status === 'DELIVERED' && !o.invoice && o.nextActions.includes('bill')).slice(0, limit);
  const results: any[] = [];
  for (const row of toBill) {
    const result = await billSalesOrderFromDelivery(row.id, { postToGl: true });
    results.push({
      orderNumber: row.orderNumber,
      ok: result.ok,
      invoiceNo: result.invoice?.invoiceNo,
      error: result.error,
    });
  }
  return {
    processed: results.length,
    billed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    data: results,
  };
}
