/**
 * HARVICS OS — Generic Module Seed + Auto-Mount (Session 39 · Wave 0+1)
 *
 * On boot: for every module in the registry with status === 'demo' or 'live'
 * (i.e. anything routable), seed initial rows from STUB_CATALOG if its
 * GenericModuleRecord bucket is empty, then mount the generic CRUD router at
 * the module's canonical route.
 *
 * Skips a module if its route is already explicitly mounted in routes.ts
 * (e.g. /api/v2/*, /api/crm, /api/orders) — those keep their bespoke logic.
 */

import { Router } from 'express';
import { prisma } from '../../core/prisma';
import { STUB_CATALOG } from '../stub-catalog/stub.catalog';
import {
  buildModuleCrudRouter,
  loadRegistry,
  type RegistryEntry,
} from './factory';

// Routes that already have bespoke controllers. Generic mount must NOT
// overwrite these — they have richer logic, validation, auth, audit.
const RESERVED_ROUTE_PREFIXES = [
  '/api/v2',
  '/api/crm',
  '/api/orders',
  '/api/inventory',
  '/api/finance',
  '/api/payments',
  '/api/hr',
  '/api/logistics',
  '/api/procurement-crud',
  '/api/manufacturing',
  '/api/quality',
  '/api/projects',
  '/api/bi',
  '/api/treasury',
  '/api/digital-finance',
  '/api/marketing',
  '/api/shipping-trade',
  '/api/distributor',
  '/api/ai/models',
  '/api/audit-log',
  '/api/governance',
  '/api/wave5',
  '/api/wave6',
  '/api/wave7',
  '/api/t14',
  '/api/platform',
];

function isReserved(route: string): boolean {
  return RESERVED_ROUTE_PREFIXES.some((p) => route === p || route.startsWith(p + '/'));
}

async function seedModuleIfEmpty(entry: RegistryEntry): Promise<void> {
  const count = await prisma.genericModuleRecord.count({
    where: { moduleId: entry.id },
  });
  if (count > 0) return;

  const catalog = STUB_CATALOG[entry.id];
  if (!catalog) {
    // Module isn't in the stub-catalog (it's a real demo with its own data).
    // Drop a single placeholder so list calls aren't empty.
    await prisma.genericModuleRecord.create({
      data: {
        moduleId: entry.id,
        status: 'Active',
        data: {
          note: `${entry.name} — placeholder. Real implementation pending.`,
          band: entry.band,
        },
      },
    });
    return;
  }

  // Seed the catalog records as individual GenericModuleRecord rows.
  await prisma.genericModuleRecord.createMany({
    data: catalog.records.map((r) => ({
      moduleId: entry.id,
      status: 'Active',
      data: r as any,
    })),
  });
}

/**
 * Mount generic CRUD for every routable module that doesn't have a
 * bespoke controller. Returns a single router that the caller mounts at
 * a base path (we use '/' so the registry routes line up with /api/*).
 *
 * Also mounts a uniform fallback at `/m/:moduleId/*` that ALWAYS works,
 * regardless of route conflicts. Frontend universal renderer uses this.
 */
export function buildGenericRouter(): { router: Router; mounted: number; reserved: number; uniformMounted: number } {
  const registry = loadRegistry();
  const router = Router();
  let mounted = 0;
  let reserved = 0;
  let uniformMounted = 0;

  // 1. Uniform fallback: /api/m/:moduleId — always available, never conflicts.
  for (const entry of registry) {
    if (entry.status === 'planned' || entry.status === 'stub') continue;
    router.use(`/m/${entry.id}`, buildModuleCrudRouter(entry));
    uniformMounted++;
  }

  // 2. Best-effort canonical mount at the registry route (skips bespoke prefixes).
  for (const entry of registry) {
    if (entry.status === 'planned' || entry.status === 'stub') continue;
    if (isReserved(entry.route)) {
      reserved++;
      continue;
    }
    const mountPath = entry.route.replace(/^\/api/, '');
    router.use(mountPath, buildModuleCrudRouter(entry));
    mounted++;
  }

  return { router, mounted, reserved, uniformMounted };
}

/**
 * Seed all routable modules in parallel batches.
 * Idempotent: re-running is a no-op.
 *
 * NOTE: reserved modules are seeded too — the uniform `/api/m/:id` endpoint
 * needs data even for modules whose canonical route belongs to a bespoke
 * controller. The bespoke routes continue serving their own data
 * independently; this is just the universal-renderer fallback.
 */
export async function seedAllModules(): Promise<{ seeded: number; skipped: number }> {
  const registry = loadRegistry();
  let seeded = 0;
  let skipped = 0;

  // Neon often lacks GenericModuleRecord until an additive SQL is applied.
  // Probe once — do not spam 70× P2021 stack traces on every boot.
  try {
    await prisma.genericModuleRecord.findFirst({ select: { id: true } });
  } catch (err: any) {
    const msg = String(err?.message || '');
    const unreachable =
      err?.code === 'P1001' || msg.includes("Can't reach database server");
    const missing =
      err?.code === 'P2021' ||
      msg.includes('GenericModuleRecord') ||
      msg.includes('does not exist');
    if (unreachable) {
      // eslint-disable-next-line no-console
      console.warn('[generic-factory] Neon unreachable — skipping stub seed');
      return { seeded: 0, skipped: registry.length };
    }
    if (missing) {
      // eslint-disable-next-line no-console
      console.warn(
        '[generic-factory] GenericModuleRecord table missing — skipping stub seed (OS Finance/CRM unaffected). Optional: apply prisma/manual/generic_module_record_additive.sql',
      );
      return { seeded: 0, skipped: registry.length };
    }
    throw err;
  }

  for (const entry of registry) {
    if (entry.status === 'planned' || entry.status === 'stub') {
      skipped++;
      continue;
    }
    try {
      await seedModuleIfEmpty(entry);
      seeded++;
    } catch (err: any) {
      const missing =
        err?.code === 'P2021' || String(err?.message || '').includes('does not exist');
      if (missing) {
        // eslint-disable-next-line no-console
        console.warn('[generic-factory] GenericModuleRecord missing mid-seed — aborting remaining seeds');
        return { seeded, skipped: skipped + (registry.length - seeded - skipped) };
      }
      // eslint-disable-next-line no-console
      console.error(`[generic.seed] module ${entry.id} (${entry.name}) failed:`, err);
    }
  }
  return { seeded, skipped };
}
