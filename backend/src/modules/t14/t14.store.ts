/**
 * HARVICS OS — T14 Store
 *
 * Prisma-backed accessors for the 5 models added in T14 schema lock:
 *   DealDesk, Commission, SalesForecast, OKR, Incident.
 *
 * On first import, seeds each empty table from the demo SEED constants so
 * existing demo UIs continue to render. Idempotent: any subsequent boot
 * with rows present is a no-op.
 *
 * All accessors return shapes identical to the prior `DemoXxx` interfaces so
 * the existing route handlers and front-end consumers do not need changes
 * beyond the route call site.
 */

import { prisma } from '../../core/prisma';
import { BATCH_2_SEED } from '../../batch2-commercial';
import { BATCH_5_SEED } from '../../batch5-ops-grc';
import { BATCH_67_SEED } from '../../batch67-analytics-universe';

let seeded = false;

async function seedOnce() {
  if (seeded) return;
  seeded = true;

  try {
    const [dealCount, commCount, fcstCount, okrCount, incCount] = await Promise.all([
      prisma.dealDesk.count(),
      prisma.commission.count(),
      prisma.salesForecast.count(),
      prisma.oKR.count(),
      prisma.incident.count(),
    ]);

    if (dealCount === 0) {
      await prisma.dealDesk.createMany({
        data: BATCH_2_SEED.dealDesk.map(d => ({
          id: d.id,
          dealName: d.dealName,
          customerId: d.customerId,
          opportunityValue: d.opportunityValue,
          requestedDiscount: d.requestedDiscount,
          requiredMargin: d.requiredMargin,
          approvedDiscount: d.approvedDiscount ?? null,
          currency: d.currency,
          submittedBy: d.submittedBy,
          status: d.status,
          decisionDate: d.decisionDate ? new Date(d.decisionDate) : null,
        })),
      });
    }

    if (commCount === 0) {
      await prisma.commission.createMany({
        data: BATCH_2_SEED.commissions.map(c => ({
          id: c.id,
          employeeId: c.employeeId,
          employeeName: c.employeeName,
          period: c.period,
          baseRevenue: c.baseRevenue,
          commissionRate: c.commissionRate,
          commissionAmount: c.commissionAmount,
          currency: c.currency,
          status: c.status,
          paidDate: c.paidDate ? new Date(c.paidDate) : null,
        })),
      });
    }

    if (fcstCount === 0) {
      await prisma.salesForecast.createMany({
        data: BATCH_2_SEED.forecasts.map(f => ({
          id: f.id,
          forecastPeriod: f.forecastPeriod,
          ownerId: f.ownerId,
          ownerTerritory: f.ownerTerritory,
          bestCase: f.bestCase,
          baseCase: f.baseCase,
          worstCase: f.worstCase,
          currency: f.currency,
          confidence: f.confidence,
          notes: f.notes,
        })),
      });
    }

    if (okrCount === 0) {
      await prisma.oKR.createMany({
        data: BATCH_67_SEED.okr.map(o => ({
          id: o.id,
          objective: o.objective,
          owner: o.owner,
          progress: o.progress,
          keyResults: o.keyResults,
          completed: o.completed,
          period: o.period,
          status: o.status,
        })),
      });
    }

    if (incCount === 0) {
      await prisma.incident.createMany({
        data: BATCH_5_SEED.incidents.map(i => ({
          id: i.id,
          title: i.title,
          severity: i.severity,
          reportedDate: new Date(i.reportedDate),
          status: i.status,
          resolution: i.resolution,
          resolvedDate: i.resolvedDate ? new Date(i.resolvedDate) : null,
        })),
      });
    }
  } catch (err) {
    // Seeding must never crash the backend. Log and continue.
    // eslint-disable-next-line no-console
    console.error('[t14.store] seed failed:', err);
  }
}

// Fire-and-forget seed on module import.
void seedOnce();

// ── Accessors ─────────────────────────────────────────────────────────────

export const t14 = {
  // DealDesk
  listDeals: () => prisma.dealDesk.findMany({ orderBy: { createdAt: 'desc' } }),
  approveDeal: (id: string, approvedDiscount?: number) =>
    prisma.dealDesk.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedDiscount: approvedDiscount,
        decisionDate: new Date(),
      },
    }),
  // Commission
  listCommissions: () => prisma.commission.findMany({ orderBy: { createdAt: 'desc' } }),
  // SalesForecast
  listForecasts: () => prisma.salesForecast.findMany({ orderBy: { createdAt: 'desc' } }),
  // OKR
  listOkr: () => prisma.oKR.findMany({ orderBy: { createdAt: 'desc' } }),
  // Incident
  listIncidents: () => prisma.incident.findMany({ orderBy: { reportedDate: 'desc' } }),
};
