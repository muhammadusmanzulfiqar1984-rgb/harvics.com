/**
 * HARVICS OS — Prisma Client Singleton
 * Neon-pooler aware: idle Closed connections are normal; reconnect quietly.
 * Loads .env before reading DATABASE_URL (tsx hoists imports ahead of index dotenv).
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';

const envCandidates = [
  resolve(__dirname, `../../../.env.${process.env.NODE_ENV || 'development'}`),
  resolve(__dirname, '../../../.env.local'),
  resolve(__dirname, '../../../.env'),
];
for (const envPath of envCandidates) {
  if (existsSync(envPath)) loadEnv({ path: envPath, override: false });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Neon -pooler hosts need pgbouncer + bounded connection_limit for Prisma. */
function neonAwareDatabaseUrl(raw?: string): string | undefined {
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    const isPooler = u.hostname.includes('-pooler') || u.hostname.includes('pooler');
    if (isPooler) {
      if (!u.searchParams.has('pgbouncer')) u.searchParams.set('pgbouncer', 'true');
      if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
      if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '15');
      if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '15');
    }
    if (!u.searchParams.has('sslmode')) u.searchParams.set('sslmode', 'require');
    return u.toString();
  } catch {
    return raw;
  }
}

function createClient(): PrismaClient {
  const url = neonAwareDatabaseUrl(process.env.DATABASE_URL);
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** Soft reconnect after Neon/PgBouncer closes idle sockets. */
export async function ensurePrismaConnected(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
  }
}

void prisma.$connect().catch(() => {
  // eslint-disable-next-line no-console
  console.warn('[prisma] initial connect deferred — Neon may be waking');
});

export default prisma;
