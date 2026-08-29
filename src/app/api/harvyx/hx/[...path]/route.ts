/**
 * Proxy: /api/harvyx/hx/* → Hx Data Bank API /api/v1/*
 * Mints a short-lived operator JWT so the browser never needs the secret.
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type HxEnv = {
  HX_API_BASE_URL?: string;
  HX_JWT_SECRET?: string;
};

async function resolveHxEnv(): Promise<HxEnv> {
  const fromProcess: HxEnv = {
    HX_API_BASE_URL: process.env.HX_API_BASE_URL,
    HX_JWT_SECRET: process.env.HX_JWT_SECRET,
  };
  try {
    const mod: { getCloudflareContext?: (opts?: { async?: boolean }) => Promise<{ env?: HxEnv }> } =
      await import('@opennextjs/cloudflare');
    if (typeof mod.getCloudflareContext === 'function') {
      const ctx = await mod.getCloudflareContext({ async: true });
      return {
        HX_API_BASE_URL: ctx?.env?.HX_API_BASE_URL || fromProcess.HX_API_BASE_URL,
        HX_JWT_SECRET: ctx?.env?.HX_JWT_SECRET || fromProcess.HX_JWT_SECRET,
      };
    }
  } catch {
    /* local Node — process.env only */
  }
  return fromProcess;
}

function mintToken(secret: string): string {
  if (!secret) {
    throw new Error('HX_JWT_SECRET is not set');
  }
  return jwt.sign({ sub: 'operator', role: 'admin' }, secret, { expiresIn: '1h' });
}

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  try {
    const env = await resolveHxEnv();
    const base = (env.HX_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
    const secret = env.HX_JWT_SECRET || '';

    const resolved = await Promise.resolve(context.params);
    const parts = resolved.path ?? [];
    const path = parts.map(encodeURIComponent).join('/');
    const incoming = new URL(req.url);
    const target = `${base}/api/v1/${path}${incoming.search}`;

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${mintToken(secret)}`);
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);

    const init: RequestInit = {
      method: req.method,
      headers,
      cache: 'no-store',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) init.body = body;
    }

    const upstream = await fetch(target, init);
    const buf = await upstream.arrayBuffer();
    const outHeaders = new Headers();
    const upstreamType = upstream.headers.get('content-type');
    if (upstreamType) outHeaders.set('content-type', upstreamType);

    return new NextResponse(buf, {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, data: null, error: message, ts: new Date().toISOString() },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  return proxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  return proxy(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  return proxy(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  return proxy(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } },
) {
  return proxy(req, context);
}
