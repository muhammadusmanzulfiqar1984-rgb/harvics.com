/**
 * HARVICS OS — Generic Module Factory (Session 39 · Wave 0)
 *
 * Builds a uniform CRUD router for any module defined in the canonical
 * registry. Backed by the single `GenericModuleRecord` Postgres table so we
 * don't need a Prisma model per module.
 *
 * Routes mounted per module at its `route` field:
 *   GET    {route}               → list (paginated)
 *   GET    {route}/:id           → fetch one
 *   POST   {route}               → create
 *   PATCH  {route}/:id           → partial update (data merge or status)
 *   DELETE {route}/:id           → remove
 *
 * Registry is parsed from `src/lib/modules/registry.ts` at boot via regex —
 * backend tsconfig restricts rootDir to `./src` so we can't import directly.
 */

import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../core/prisma';

export interface RegistryEntry {
  id: number;
  band: string;
  name: string;
  route: string;
  osPath?: string;
  status: 'live' | 'demo' | 'stub' | 'planned';
}

/** Parse src/lib/modules/registry.ts at boot. */
export function loadRegistry(): RegistryEntry[] {
  const registryPath = path.resolve(
    process.cwd(),
    'src/lib/modules/registry.ts',
  );
  const src = fs.readFileSync(registryPath, 'utf8');
  const re =
    /\{ id: (\d+), band: '([^']+)', name: '([^']+)', route: '([^']+)'(?:, osPath: '([^']+)')?[^}]*status: '(\w+)' \}/g;
  const out: RegistryEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    out.push({
      id: Number(m[1]),
      band: m[2],
      name: m[3],
      route: m[4],
      osPath: m[5] || undefined,
      status: m[6] as RegistryEntry['status'],
    });
  }
  return out;
}

/**
 * Build a CRUD router scoped to one moduleId. The router is stateless —
 * all reads/writes go through prisma.genericModuleRecord with moduleId filter.
 */
export function buildModuleCrudRouter(entry: RegistryEntry): Router {
  const router = Router();
  const moduleId = entry.id;

  // GET list
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
      const where: any = { moduleId };
      if (req.query.status) where.status = String(req.query.status);

      const [total, rows] = await Promise.all([
        prisma.genericModuleRecord.count({ where }),
        prisma.genericModuleRecord.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
      return res.json({
        success: true,
        module: { id: entry.id, name: entry.name, band: entry.band },
        data: rows.map(flatten),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, error: err?.message || 'list failed' });
    }
  });

  // GET one
  router.get('/:id', async (req: Request, res: Response) => {
    const row = await prisma.genericModuleRecord.findFirst({
      where: { id: req.params.id, moduleId },
    });
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: flatten(row) });
  });

  // POST create
  router.post('/', async (req: Request, res: Response) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const { status, ...data } = body;
      const row = await prisma.genericModuleRecord.create({
        data: {
          moduleId,
          status: typeof status === 'string' ? status : 'Active',
          data: data as any,
        },
      });
      return res.status(201).json({ success: true, data: flatten(row) });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, error: err?.message || 'create failed' });
    }
  });

  // PATCH update
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const existing = await prisma.genericModuleRecord.findFirst({
        where: { id: req.params.id, moduleId },
      });
      if (!existing)
        return res.status(404).json({ success: false, error: 'Not found' });
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const { status, ...patch } = body;
      const mergedData = {
        ...((existing.data as Record<string, any>) || {}),
        ...patch,
      };
      const row = await prisma.genericModuleRecord.update({
        where: { id: existing.id },
        data: {
          status: typeof status === 'string' ? status : existing.status,
          data: mergedData as any,
        },
      });
      return res.json({ success: true, data: flatten(row) });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, error: err?.message || 'update failed' });
    }
  });

  // DELETE
  router.delete('/:id', async (req: Request, res: Response) => {
    const existing = await prisma.genericModuleRecord.findFirst({
      where: { id: req.params.id, moduleId },
    });
    if (!existing)
      return res.status(404).json({ success: false, error: 'Not found' });
    await prisma.genericModuleRecord.delete({ where: { id: existing.id } });
    return res.json({ success: true, data: { id: existing.id, deleted: true } });
  });

  return router;
}

function flatten(row: {
  id: string;
  moduleId: number;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}) {
  const d = (row.data || {}) as Record<string, any>;
  return {
    id: row.id,
    moduleId: row.moduleId,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...d,
  };
}
