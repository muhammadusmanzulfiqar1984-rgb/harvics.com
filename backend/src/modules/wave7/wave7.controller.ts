/**
 * HARVICS OS — Wave 7 Controller (FINAL 6 modules)
 *   #2 Controlling · #54 Integration Bus · #55 Data Ocean ·
 *   #57 Harvoice · #61 Trade Floor · #65 Crypto Lite
 */
import { Request, Response, Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../core/prisma';

export const wave7Router = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}

// ─── #2 CONTROLLING ─────────────────────────────────────────────────────────
wave7Router.post('/cost-postings', async (req, res) => {
  const Body = z.object({ costCenterCode: z.string(), period: z.string().regex(/^\d{4}-\d{2}$/), account: z.string(), amount: z.number(), description: z.string().optional().nullable(), type: z.enum(['Actual', 'Plan']).default('Actual') });
  try {
    const b = Body.parse(req.body);
    const cc = await prisma.costCenter.findUnique({ where: { code: b.costCenterCode } });
    if (!cc) return res.status(404).json({ success: false, error: 'Cost center not found' });
    const row = await prisma.costPosting.create({ data: { costCenterId: cc.id, period: b.period, account: b.account, amount: b.amount, description: b.description ?? null, type: b.type } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'post failed' }); }
});
wave7Router.get('/controlling/report', async (req, res) => {
  const period = String(req.query.period || new Date().toISOString().slice(0, 7));
  const ccs = await prisma.costCenter.findMany({ where: { active: true }, include: { postings: { where: { period } } } });
  const rows = ccs.map(cc => {
    const actual = cc.postings.filter(p => p.type === 'Actual').reduce((s, p) => s + p.amount, 0);
    const plan = cc.postings.filter(p => p.type === 'Plan').reduce((s, p) => s + p.amount, 0);
    const variance = +(actual - plan).toFixed(2);
    const variancePct = plan !== 0 ? +((variance / plan) * 100).toFixed(1) : 0;
    return { code: cc.code, name: cc.name, manager: cc.manager, actual: +actual.toFixed(2), plan: +plan.toFixed(2), variance, variancePct, status: variance > 0 ? 'Over' : variance < 0 ? 'Under' : 'OnTrack' };
  });
  const totals = rows.reduce((t, r) => ({ actual: t.actual + r.actual, plan: t.plan + r.plan }), { actual: 0, plan: 0 });
  res.json({ success: true, data: rows, period, totals: { actual: +totals.actual.toFixed(2), plan: +totals.plan.toFixed(2), variance: +(totals.actual - totals.plan).toFixed(2) } });
});

// ─── #54 INTEGRATION BUS ────────────────────────────────────────────────────
wave7Router.get('/endpoints', async (_req, res) => {
  const rows = await prisma.integrationEndpoint.findMany({ include: { _count: { select: { deliveries: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave7Router.post('/endpoints', async (req, res) => {
  const Body = z.object({ code: z.string().min(2), name: z.string().min(2), url: z.string().url(), method: z.string().default('POST'), authType: z.enum(['none', 'bearer', 'basic', 'hmac']).default('none'), authValue: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    try {
      const row = await prisma.integrationEndpoint.create({ data: b });
      res.status(201).json({ success: true, data: row });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code already exists' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave7Router.post('/dispatch', async (req, res) => {
  const Body = z.object({ event: z.string(), payload: z.any(), endpointCode: z.string().optional() });
  try {
    const b = Body.parse(req.body);
    const where: any = { active: true };
    if (b.endpointCode) where.code = b.endpointCode;
    const targets = await prisma.integrationEndpoint.findMany({ where });
    if (targets.length === 0) return res.status(404).json({ success: false, error: 'No active endpoints' });
    const deliveries = await Promise.all(targets.map(t => {
      const ok = Math.random() > 0.15;
      return prisma.integrationDelivery.create({ data: { endpointId: t.id, event: b.event, payload: b.payload ?? {}, status: ok ? 'Delivered' : 'Failed', attempts: 1, responseCode: ok ? 200 : 500, responseBody: ok ? 'OK' : 'Simulated failure', deliveredAt: ok ? new Date() : null, nextRetryAt: ok ? null : new Date(Date.now() + 60_000) } });
    }));
    res.status(201).json({ success: true, dispatched: deliveries.length, delivered: deliveries.filter(d => d.status === 'Delivered').length, failed: deliveries.filter(d => d.status === 'Failed').length, data: deliveries });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'dispatch failed' }); }
});
wave7Router.post('/deliveries/:id/retry', async (req, res) => {
  const d = await prisma.integrationDelivery.findUnique({ where: { id: req.params.id } });
  if (!d) return res.status(404).json({ success: false, error: 'Not found' });
  if (d.status === 'Delivered') return res.status(409).json({ success: false, error: 'Already delivered' });
  if (d.attempts >= 3) {
    const dlq = await prisma.integrationDelivery.update({ where: { id: d.id }, data: { status: 'DLQ' } });
    return res.json({ success: true, data: dlq, message: 'Moved to dead-letter queue (3 attempts exhausted)' });
  }
  const ok = Math.random() > 0.3;
  const row = await prisma.integrationDelivery.update({ where: { id: d.id }, data: { attempts: d.attempts + 1, status: ok ? 'Delivered' : 'Failed', responseCode: ok ? 200 : 500, responseBody: ok ? 'OK' : 'Retry failed', deliveredAt: ok ? new Date() : null, nextRetryAt: ok ? null : new Date(Date.now() + 60_000) } });
  res.json({ success: true, data: row });
});
wave7Router.get('/deliveries', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.integrationDelivery.findMany({ where, include: { endpoint: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

// ─── #55 DATA OCEAN ─────────────────────────────────────────────────────────
const SNAPSHOTTABLE = ['Customer', 'Order', 'Invoice', 'Lead', 'Product', 'Supplier', 'Employee'];
wave7Router.get('/snapshots', async (req, res) => {
  const where: any = {};
  if (req.query.tableName) where.tableName = String(req.query.tableName);
  const rows = await prisma.dataSnapshot.findMany({ where, orderBy: { capturedAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length, snapshottableTables: SNAPSHOTTABLE });
});
wave7Router.post('/snapshots', async (req, res) => {
  const Body = z.object({ tableName: z.string(), capturedBy: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    if (!SNAPSHOTTABLE.includes(b.tableName)) return res.status(400).json({ success: false, error: `Unsupported table. Use: ${SNAPSHOTTABLE.join(', ')}` });
    const model = (prisma as any)[b.tableName.charAt(0).toLowerCase() + b.tableName.slice(1)];
    const count = await model.count();
    const sample = await model.findMany({ take: 5 });
    const sizeBytes = Buffer.byteLength(JSON.stringify(sample) || '', 'utf8') * Math.max(count, 1) / Math.max(sample.length, 1);
    const row = await prisma.dataSnapshot.create({ data: { tableName: b.tableName, recordCount: count, sizeBytes: Math.floor(sizeBytes), format: 'json', storageRef: `dataocean://snapshots/${b.tableName}/${Date.now()}.json`, capturedBy: b.capturedBy ?? null, metadata: { sampleSize: sample.length, takenAt: new Date().toISOString() } } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'snapshot failed' }); }
});
wave7Router.get('/lake-stats', async (_req, res) => {
  const grouped = await prisma.dataSnapshot.groupBy({ by: ['tableName'], _count: { _all: true }, _sum: { sizeBytes: true, recordCount: true } });
  const totalSnapshots = await prisma.dataSnapshot.count();
  const totalBytes = grouped.reduce((s, g) => s + (g._sum.sizeBytes || 0), 0);
  res.json({ success: true, data: { totalSnapshots, totalBytes, totalMB: +(totalBytes / 1_048_576).toFixed(2), byTable: grouped.map(g => ({ table: g.tableName, snapshots: g._count._all, totalRecords: g._sum.recordCount || 0, totalBytes: g._sum.sizeBytes || 0 })) } });
});

// ─── #57 HARVOICE ──────────────────────────────────────────────────────────
const INTENT_PATTERNS: Array<{ re: RegExp; intent: string; entityFn?: (m: RegExpMatchArray) => any }> = [
  { re: /^(search|find|look for|show me)\s+(.+)/i, intent: 'search', entityFn: m => ({ query: m[2] }) },
  { re: /^(create|add|new)\s+(.+)/i, intent: 'create', entityFn: m => ({ object: m[2] }) },
  { re: /^(update|edit|change)\s+(.+)/i, intent: 'update', entityFn: m => ({ target: m[2] }) },
  { re: /^(go to|open|navigate to)\s+(.+)/i, intent: 'navigate', entityFn: m => ({ destination: m[2] }) },
  { re: /^(report|generate report|show report)\s*(.*)/i, intent: 'report', entityFn: m => ({ topic: m[2] || 'default' }) },
];
wave7Router.post('/voice/transcribe', async (req, res) => {
  const Body = z.object({ transcript: z.string().min(1), userId: z.string().optional().nullable() });
  try {
    const start = Date.now();
    const b = Body.parse(req.body);
    let intent = 'unknown'; let entities: any = null; let confidence = 0.4;
    for (const p of INTENT_PATTERNS) {
      const m = b.transcript.match(p.re);
      if (m) { intent = p.intent; entities = p.entityFn?.(m) || null; confidence = 0.85 + Math.random() * 0.1; break; }
    }
    const responseText = intent === 'unknown' ? 'Sorry, I did not understand that command.' : `Routing ${intent}${entities ? ' for ' + JSON.stringify(entities) : ''}…`;
    const row = await prisma.voiceCommand.create({ data: { userId: b.userId ?? null, transcript: b.transcript, intent, entities, confidence: +confidence.toFixed(2), responseText, durationMs: Date.now() - start, status: 'Processed' } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'transcribe failed' }); }
});
wave7Router.get('/voice/commands', async (_req, res) => {
  const rows = await prisma.voiceCommand.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave7Router.get('/voice/stats', async (_req, res) => {
  const [total, byIntent, avgConfidence] = await Promise.all([
    prisma.voiceCommand.count(),
    prisma.voiceCommand.groupBy({ by: ['intent'], _count: { _all: true } }),
    prisma.voiceCommand.aggregate({ _avg: { confidence: true, durationMs: true } }),
  ]);
  res.json({ success: true, data: { total, avgConfidence: +(avgConfidence._avg.confidence || 0).toFixed(2), avgDurationMs: +(avgConfidence._avg.durationMs || 0).toFixed(1), byIntent: byIntent.map(b => ({ intent: b.intent, count: b._count._all })) } });
});

// ─── #61 TRADE FLOOR ────────────────────────────────────────────────────────
wave7Router.get('/instruments', async (_req, res) => {
  const rows = await prisma.tradeInstrument.findMany({ where: { active: true }, include: { _count: { select: { orders: true, trades: true } } } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave7Router.post('/instruments', async (req, res) => {
  const Body = z.object({ symbol: z.string().min(1).max(10), name: z.string(), category: z.enum(['Commodity', 'Equity', 'FX', 'Crypto']).default('Commodity'), unit: z.string().default('unit'), baseCurrency: z.string().default('USD'), lastPrice: z.number().nonnegative().default(0) });
  try {
    const b = Body.parse(req.body);
    try {
      const row = await prisma.tradeInstrument.create({ data: { ...b, symbol: b.symbol.toUpperCase() } });
      res.status(201).json({ success: true, data: row });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Symbol exists' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave7Router.get('/instruments/:symbol/orderbook', async (req, res) => {
  const inst = await prisma.tradeInstrument.findUnique({ where: { symbol: req.params.symbol.toUpperCase() } });
  if (!inst) return res.status(404).json({ success: false, error: 'Instrument not found' });
  const open = await prisma.tradeOrder.findMany({ where: { instrumentId: inst.id, status: { in: ['Open', 'PartiallyFilled'] } }, orderBy: { price: 'desc' } });
  const bids = open.filter(o => o.side === 'buy').sort((a, b) => b.price - a.price);
  const asks = open.filter(o => o.side === 'sell').sort((a, b) => a.price - b.price);
  res.json({ success: true, instrument: inst, bids: bids.map(o => ({ id: o.id, price: o.price, qty: o.qty - o.filledQty, trader: o.traderId })), asks: asks.map(o => ({ id: o.id, price: o.price, qty: o.qty - o.filledQty, trader: o.traderId })), spread: asks[0] && bids[0] ? +(asks[0].price - bids[0].price).toFixed(2) : null });
});
wave7Router.post('/orders', async (req, res) => {
  const Body = z.object({ symbol: z.string(), traderId: z.string(), side: z.enum(['buy', 'sell']), price: z.number().positive(), qty: z.number().positive(), orderType: z.enum(['limit', 'market']).default('limit') });
  try {
    const b = Body.parse(req.body);
    const inst = await prisma.tradeInstrument.findUnique({ where: { symbol: b.symbol.toUpperCase() } });
    if (!inst) return res.status(404).json({ success: false, error: 'Instrument not found' });
    // Create order
    const order = await prisma.tradeOrder.create({ data: { instrumentId: inst.id, traderId: b.traderId, side: b.side, orderType: b.orderType, price: b.price, qty: b.qty } });
    // Naïve matching engine: match against opposite side at same/better price
    const oppositeSide = b.side === 'buy' ? 'sell' : 'buy';
    const candidates = await prisma.tradeOrder.findMany({
      where: { instrumentId: inst.id, side: oppositeSide, status: { in: ['Open', 'PartiallyFilled'] }, ...(b.side === 'buy' ? { price: { lte: b.price } } : { price: { gte: b.price } }) },
      orderBy: b.side === 'buy' ? { price: 'asc' } : { price: 'desc' },
    });
    const trades: any[] = [];
    let remaining = b.qty;
    for (const c of candidates) {
      if (remaining <= 0) break;
      const cRemaining = c.qty - c.filledQty;
      const tradedQty = Math.min(remaining, cRemaining);
      const tradePrice = c.price; // resting order's price
      const trade = await prisma.trade.create({ data: { instrumentId: inst.id, buyOrderId: b.side === 'buy' ? order.id : c.id, sellOrderId: b.side === 'sell' ? order.id : c.id, price: tradePrice, qty: tradedQty, buyerId: b.side === 'buy' ? b.traderId : c.traderId, sellerId: b.side === 'sell' ? b.traderId : c.traderId } });
      await prisma.tradeOrder.update({ where: { id: c.id }, data: { filledQty: c.filledQty + tradedQty, status: c.filledQty + tradedQty >= c.qty ? 'Filled' : 'PartiallyFilled' } });
      trades.push(trade);
      remaining -= tradedQty;
    }
    const filled = b.qty - remaining;
    const final = await prisma.tradeOrder.update({ where: { id: order.id }, data: { filledQty: filled, status: filled === 0 ? 'Open' : filled >= b.qty ? 'Filled' : 'PartiallyFilled' } });
    if (trades.length > 0) await prisma.tradeInstrument.update({ where: { id: inst.id }, data: { lastPrice: trades[trades.length - 1].price } });
    res.status(201).json({ success: true, data: final, trades, message: trades.length > 0 ? `Matched ${trades.length} trade(s), filled ${filled}/${b.qty}` : 'Order resting in book' });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'order failed' }); }
});
wave7Router.get('/trades', async (req, res) => {
  const where: any = {};
  if (req.query.symbol) {
    const inst = await prisma.tradeInstrument.findUnique({ where: { symbol: String(req.query.symbol).toUpperCase() } });
    if (inst) where.instrumentId = inst.id;
  }
  const rows = await prisma.trade.findMany({ where, include: { instrument: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});

// ─── #65 CRYPTO LITE ────────────────────────────────────────────────────────
wave7Router.get('/crypto/assets', async (_req, res) => {
  const rows = await prisma.cryptoAsset.findMany({ where: { active: true }, orderBy: { priceUsd: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave7Router.post('/crypto/assets', async (req, res) => {
  const Body = z.object({ symbol: z.string().min(1).max(10), name: z.string(), priceUsd: z.number().positive(), change24h: z.number().default(0) });
  try {
    const b = Body.parse(req.body);
    try {
      const row = await prisma.cryptoAsset.create({ data: { ...b, symbol: b.symbol.toUpperCase() } });
      res.status(201).json({ success: true, data: row });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Asset exists' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave7Router.post('/crypto/trade', async (req, res) => {
  const Body = z.object({ userId: z.string(), symbol: z.string(), side: z.enum(['buy', 'sell']), qty: z.number().positive() });
  try {
    const b = Body.parse(req.body);
    const asset = await prisma.cryptoAsset.findUnique({ where: { symbol: b.symbol.toUpperCase() } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    const priceUsd = asset.priceUsd;
    const totalUsd = +(priceUsd * b.qty).toFixed(2);
    const existing = await prisma.cryptoHolding.findUnique({ where: { userId_assetId: { userId: b.userId, assetId: asset.id } } });
    if (b.side === 'sell' && (!existing || existing.qty < b.qty)) {
      return res.status(409).json({ success: false, error: 'Insufficient holdings', have: existing?.qty || 0, want: b.qty });
    }
    const trade = await prisma.cryptoTrade.create({ data: { userId: b.userId, assetId: asset.id, side: b.side, qty: b.qty, priceUsd, totalUsd } });
    // Update holding with running average cost
    let newQty: number, newAvgCost: number;
    if (b.side === 'buy') {
      const prevQty = existing?.qty || 0;
      const prevCost = (existing?.qty || 0) * (existing?.avgCostUsd || 0);
      newQty = prevQty + b.qty;
      newAvgCost = +((prevCost + totalUsd) / newQty).toFixed(4);
    } else {
      newQty = (existing?.qty || 0) - b.qty;
      newAvgCost = existing?.avgCostUsd || 0; // avg cost unchanged on sell
    }
    await prisma.cryptoHolding.upsert({
      where: { userId_assetId: { userId: b.userId, assetId: asset.id } },
      create: { userId: b.userId, assetId: asset.id, qty: newQty, avgCostUsd: newAvgCost },
      update: { qty: newQty, avgCostUsd: newAvgCost },
    });
    const pnl = b.side === 'sell' ? +((priceUsd - (existing?.avgCostUsd || 0)) * b.qty).toFixed(2) : null;
    res.status(201).json({ success: true, data: trade, holding: { qty: newQty, avgCostUsd: newAvgCost }, realisedPnl: pnl });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'trade failed' }); }
});
wave7Router.get('/crypto/portfolio/:userId', async (req, res) => {
  const holdings = await prisma.cryptoHolding.findMany({ where: { userId: req.params.userId, qty: { gt: 0 } }, include: { asset: true } });
  const rows = holdings.map(h => {
    const value = +(h.qty * h.asset.priceUsd).toFixed(2);
    const cost = +(h.qty * h.avgCostUsd).toFixed(2);
    const unrealisedPnl = +(value - cost).toFixed(2);
    return { symbol: h.asset.symbol, name: h.asset.name, qty: h.qty, avgCostUsd: h.avgCostUsd, currentPriceUsd: h.asset.priceUsd, value, cost, unrealisedPnl, change24h: h.asset.change24h };
  });
  const totalValue = +rows.reduce((s, r) => s + r.value, 0).toFixed(2);
  const totalCost = +rows.reduce((s, r) => s + r.cost, 0).toFixed(2);
  res.json({ success: true, data: rows, totalValue, totalCost, totalPnl: +(totalValue - totalCost).toFixed(2) });
});
