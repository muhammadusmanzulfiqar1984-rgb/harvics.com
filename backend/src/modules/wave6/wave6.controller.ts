/**
 * HARVICS OS — Wave 6 Controller (Bucket C, 15 modules)
 *   #56 Wallet, #58 Feed, #59 Communities, #60 Market, #61 JobBoard,
 *   #62 Events, #63 Knowledge, #64 Mentorship, #65 Polls, #66 Kudos,
 *   #67 Referrals, #68/69/70 Portals (Customer/Supplier/Partner),
 *   #71 Mobile API Gateway
 */
import { Request, Response, Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../core/prisma';

export const wave6Router = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}
async function uniqueCatch<T>(fn: () => Promise<T>, res: Response): Promise<T | Response> {
  try { return await fn(); } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Unique constraint violated', target: err?.meta?.target });
    throw err;
  }
}

// ─── #56 WALLET ─────────────────────────────────────────────────────────────
wave6Router.get('/wallets', async (req, res) => {
  const where: any = {};
  if (req.query.ownerType) where.ownerType = String(req.query.ownerType);
  if (req.query.ownerId) where.ownerId = String(req.query.ownerId);
  const rows = await prisma.wallet.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/wallets', async (req, res) => {
  const Body = z.object({ ownerType: z.enum(['user', 'tenant', 'customer', 'supplier']), ownerId: z.string().min(1), currency: z.string().default('USD') });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.wallet.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/wallets/:id/topup', async (req, res) => {
  const Body = z.object({ amount: z.number().positive(), reference: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const w = await prisma.wallet.findUnique({ where: { id: req.params.id } });
    if (!w) return res.status(404).json({ success: false, error: 'Wallet not found' });
    if (w.status !== 'Active') return res.status(409).json({ success: false, error: `Wallet ${w.status}` });
    const newBal = +(w.balance + b.amount).toFixed(2);
    const [, txn] = await prisma.$transaction([
      prisma.wallet.update({ where: { id: w.id }, data: { balance: newBal } }),
      prisma.walletTxn.create({ data: { walletId: w.id, type: 'topup', amount: b.amount, currency: w.currency, balanceAfter: newBal, reference: b.reference ?? null } }),
    ]);
    res.status(201).json({ success: true, data: txn, balance: newBal });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'topup failed' }); }
});
wave6Router.post('/wallets/:id/transfer', async (req, res) => {
  const Body = z.object({ toWalletId: z.string(), amount: z.number().positive(), reference: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    if (req.params.id === b.toWalletId) return res.status(400).json({ success: false, error: 'Cannot transfer to same wallet' });
    const [from, to] = await Promise.all([
      prisma.wallet.findUnique({ where: { id: req.params.id } }),
      prisma.wallet.findUnique({ where: { id: b.toWalletId } }),
    ]);
    if (!from || !to) return res.status(404).json({ success: false, error: 'Wallet not found' });
    if (from.currency !== to.currency) return res.status(400).json({ success: false, error: 'Currency mismatch' });
    if (from.balance < b.amount) return res.status(409).json({ success: false, error: 'Insufficient funds', balance: from.balance });
    const fromBal = +(from.balance - b.amount).toFixed(2);
    const toBal = +(to.balance + b.amount).toFixed(2);
    await prisma.$transaction([
      prisma.wallet.update({ where: { id: from.id }, data: { balance: fromBal } }),
      prisma.wallet.update({ where: { id: to.id }, data: { balance: toBal } }),
      prisma.walletTxn.create({ data: { walletId: from.id, type: 'transfer_out', amount: -b.amount, currency: from.currency, balanceAfter: fromBal, counterparty: to.id, reference: b.reference ?? null } }),
      prisma.walletTxn.create({ data: { walletId: to.id, type: 'transfer_in', amount: b.amount, currency: to.currency, balanceAfter: toBal, counterparty: from.id, reference: b.reference ?? null } }),
    ]);
    res.status(201).json({ success: true, fromBalance: fromBal, toBalance: toBal });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'transfer failed' }); }
});
wave6Router.get('/wallets/:id/txns', async (req, res) => {
  const rows = await prisma.walletTxn.findMany({ where: { walletId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});

// ─── #58 SOCIAL FEED ────────────────────────────────────────────────────────
wave6Router.get('/feed', async (req, res) => {
  const where: any = {};
  if (req.query.groupId) where.groupId = String(req.query.groupId);
  if (req.query.authorId) where.authorId = String(req.query.authorId);
  const rows = await prisma.feedPost.findMany({ where, include: { comments: { orderBy: { createdAt: 'asc' }, take: 5 } }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/feed', async (req, res) => {
  const Body = z.object({ authorId: z.string(), authorName: z.string(), body: z.string().min(1), imageUrl: z.string().optional().nullable(), visibility: z.enum(['public', 'tenant', 'group']).default('public'), groupId: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.feedPost.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/feed/:id/like', async (req, res) => {
  const Body = z.object({ userId: z.string() });
  try {
    const b = Body.parse(req.body);
    try {
      await prisma.feedLike.create({ data: { postId: req.params.id, userId: b.userId } });
      const updated = await prisma.feedPost.update({ where: { id: req.params.id }, data: { likeCount: { increment: 1 } } });
      return res.status(201).json({ success: true, liked: true, likeCount: updated.likeCount });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        await prisma.feedLike.delete({ where: { postId_userId: { postId: req.params.id, userId: b.userId } } });
        const updated = await prisma.feedPost.update({ where: { id: req.params.id }, data: { likeCount: { decrement: 1 } } });
        return res.json({ success: true, liked: false, likeCount: updated.likeCount });
      }
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'like failed' }); }
});
wave6Router.post('/feed/:id/comment', async (req, res) => {
  const Body = z.object({ authorId: z.string(), authorName: z.string(), body: z.string().min(1) });
  try {
    const b = Body.parse(req.body);
    const [comment] = await prisma.$transaction([
      prisma.feedComment.create({ data: { postId: req.params.id, ...b } }),
      prisma.feedPost.update({ where: { id: req.params.id }, data: { commentCount: { increment: 1 } } }),
    ]);
    res.status(201).json({ success: true, data: comment });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'comment failed' }); }
});

// ─── #59 COMMUNITIES ────────────────────────────────────────────────────────
wave6Router.get('/communities', async (_req, res) => {
  const rows = await prisma.community.findMany({ include: { members: { take: 5 } }, orderBy: { memberCount: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/communities', async (req, res) => {
  const Body = z.object({ slug: z.string().min(2).regex(/^[a-z0-9-]+$/), name: z.string().min(2), description: z.string().optional().nullable(), visibility: z.enum(['public', 'private']).default('public') });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.community.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/communities/:id/join', async (req, res) => {
  const Body = z.object({ userId: z.string(), role: z.enum(['owner', 'admin', 'member']).default('member') });
  try {
    const b = Body.parse(req.body);
    try {
      const [m] = await prisma.$transaction([
        prisma.communityMember.create({ data: { communityId: req.params.id, ...b } }),
        prisma.community.update({ where: { id: req.params.id }, data: { memberCount: { increment: 1 } } }),
      ]);
      res.status(201).json({ success: true, data: m });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Already a member' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'join failed' }); }
});

// ─── #60 MARKETPLACE ────────────────────────────────────────────────────────
wave6Router.get('/listings', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.sellerId) where.sellerId = String(req.query.sellerId);
  const rows = await prisma.marketListing.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/listings', async (req, res) => {
  const Body = z.object({ sellerId: z.string(), sellerName: z.string(), title: z.string().min(2), description: z.string().optional().nullable(), category: z.string().optional().nullable(), price: z.number().positive(), currency: z.string().default('USD'), qtyAvailable: z.number().int().positive().default(1), imageUrl: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.marketListing.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/listings/:id/purchase', async (req, res) => {
  const Body = z.object({ qty: z.number().int().positive().default(1), buyerId: z.string() });
  try {
    const b = Body.parse(req.body);
    const lst = await prisma.marketListing.findUnique({ where: { id: req.params.id } });
    if (!lst) return res.status(404).json({ success: false, error: 'Not found' });
    if (lst.status !== 'Active') return res.status(409).json({ success: false, error: `Listing ${lst.status}` });
    if (lst.qtyAvailable < b.qty) return res.status(409).json({ success: false, error: 'Insufficient quantity', available: lst.qtyAvailable });
    const newQty = lst.qtyAvailable - b.qty;
    const row = await prisma.marketListing.update({ where: { id: lst.id }, data: { qtyAvailable: newQty, status: newQty === 0 ? 'Sold' : 'Active' } });
    res.json({ success: true, data: row, purchasedQty: b.qty, totalCharged: +(lst.price * b.qty).toFixed(2), buyerId: b.buyerId });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'purchase failed' }); }
});

// ─── #61 EXTERNAL JOB BOARD ─────────────────────────────────────────────────
wave6Router.get('/job-board', async (_req, res) => {
  const saved = await prisma.savedJobPost.findMany({ orderBy: { publishedAt: 'desc' } });
  const postings = await prisma.jobPosting.findMany({ where: { id: { in: saved.map(s => s.postingId) }, status: 'Open' } });
  const map = new Map(postings.map(p => [p.id, p]));
  const data = saved.map(s => ({ ...s, posting: map.get(s.postingId) || null })).filter(s => s.posting);
  res.json({ success: true, data, total: data.length });
});
wave6Router.post('/job-board/publish', async (req, res) => {
  const Body = z.object({ postingId: z.string(), externalUrl: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const p = await prisma.jobPosting.findUnique({ where: { id: b.postingId } });
    if (!p) return res.status(404).json({ success: false, error: 'Posting not found' });
    const row = await prisma.savedJobPost.upsert({ where: { postingId: b.postingId }, create: b, update: { externalUrl: b.externalUrl ?? null } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'publish failed' }); }
});
wave6Router.post('/job-board/:id/apply', async (req, res) => {
  const Body = z.object({ name: z.string(), email: z.string().email().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const saved = await prisma.savedJobPost.findUnique({ where: { id: req.params.id } });
    if (!saved) return res.status(404).json({ success: false, error: 'Not found' });
    const [, cand] = await prisma.$transaction([
      prisma.savedJobPost.update({ where: { id: saved.id }, data: { applies: { increment: 1 } } }),
      prisma.candidate.create({ data: { postingId: saved.postingId, name: b.name, email: b.email ?? null } }),
    ]);
    res.status(201).json({ success: true, data: cand });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'apply failed' }); }
});

// ─── #62 EVENTS ─────────────────────────────────────────────────────────────
wave6Router.get('/events', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.event.findMany({ where, include: { _count: { select: { registrations: true } } }, orderBy: { startsAt: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/events', async (req, res) => {
  const Body = z.object({ slug: z.string().min(2).regex(/^[a-z0-9-]+$/), title: z.string().min(2), description: z.string().optional().nullable(), type: z.enum(['Webinar', 'InPerson', 'Hybrid']).default('Webinar'), startsAt: z.coerce.date(), endsAt: z.coerce.date(), capacity: z.number().int().positive().default(100), location: z.string().optional().nullable(), meetingUrl: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    if (b.endsAt <= b.startsAt) return res.status(400).json({ success: false, error: 'endsAt must be after startsAt' });
    const row = await uniqueCatch(() => prisma.event.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/events/:id/register', async (req, res) => {
  const Body = z.object({ userId: z.string(), userName: z.string() });
  try {
    const b = Body.parse(req.body);
    const ev = await prisma.event.findUnique({ where: { id: req.params.id }, include: { _count: { select: { registrations: true } } } });
    if (!ev) return res.status(404).json({ success: false, error: 'Event not found' });
    if (ev._count.registrations >= ev.capacity) return res.status(409).json({ success: false, error: 'Event full', capacity: ev.capacity });
    try {
      const row = await prisma.eventRegistration.create({ data: { eventId: ev.id, ...b } });
      res.status(201).json({ success: true, data: row, seatsLeft: ev.capacity - ev._count.registrations - 1 });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Already registered' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'register failed' }); }
});

// ─── #63 KNOWLEDGE HUB ──────────────────────────────────────────────────────
wave6Router.get('/articles', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.category) where.category = String(req.query.category);
  const rows = await prisma.knowledgeArticle.findMany({ where, orderBy: { publishedAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.get('/articles/:slug', async (req, res) => {
  const row = await prisma.knowledgeArticle.findUnique({ where: { slug: req.params.slug } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  await prisma.knowledgeArticle.update({ where: { id: row.id }, data: { views: { increment: 1 } } });
  res.json({ success: true, data: { ...row, views: row.views + 1 } });
});
wave6Router.post('/articles', async (req, res) => {
  const Body = z.object({ slug: z.string().min(2).regex(/^[a-z0-9-]+$/), title: z.string().min(2), category: z.string().optional().nullable(), body: z.string().min(2), tags: z.string().optional().nullable(), authorId: z.string().optional().nullable(), authorName: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.knowledgeArticle.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/articles/:id/publish', async (req, res) => {
  const ex = await prisma.knowledgeArticle.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  const row = await prisma.knowledgeArticle.update({ where: { id: ex.id }, data: { status: 'Published', publishedAt: new Date() } });
  res.json({ success: true, data: row });
});

// ─── #64 MENTORSHIP ─────────────────────────────────────────────────────────
wave6Router.get('/mentors', async (req, res) => {
  const where: any = { acceptingMentees: true };
  if (req.query.expertise) where.expertise = { contains: String(req.query.expertise) };
  const rows = await prisma.mentorProfile.findMany({ where, orderBy: { rating: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/mentors', async (req, res) => {
  const Body = z.object({ userId: z.string(), name: z.string(), bio: z.string().optional().nullable(), expertise: z.string().optional().nullable(), yearsExp: z.number().int().nonnegative().default(0) });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.mentorProfile.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/mentors/:id/request', async (req, res) => {
  const Body = z.object({ menteeId: z.string(), topic: z.string().min(2), scheduledAt: z.coerce.date(), durationMins: z.number().int().positive().default(30) });
  try {
    const b = Body.parse(req.body);
    const m = await prisma.mentorProfile.findUnique({ where: { id: req.params.id } });
    if (!m) return res.status(404).json({ success: false, error: 'Mentor not found' });
    const row = await prisma.mentorshipSession.create({ data: { mentorId: m.id, ...b } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'request failed' }); }
});
wave6Router.post('/mentorship-sessions/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Confirmed', 'Completed', 'Cancelled']), rating: z.number().int().min(1).max(5).optional(), notes: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.mentorshipSession.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const row = await prisma.mentorshipSession.update({ where: { id: ex.id }, data: { status: b.status, rating: b.rating ?? null, notes: b.notes ?? null } });
    // If completed with rating, refresh mentor avg rating
    if (b.status === 'Completed' && b.rating) {
      const rated = await prisma.mentorshipSession.findMany({ where: { mentorId: ex.mentorId, rating: { not: null } }, select: { rating: true } });
      const avg = rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length;
      await prisma.mentorProfile.update({ where: { id: ex.mentorId }, data: { rating: +avg.toFixed(2) } });
    }
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #65 POLLS ──────────────────────────────────────────────────────────────
wave6Router.get('/polls', async (_req, res) => {
  const rows = await prisma.poll.findMany({ include: { _count: { select: { responses: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/polls', async (req, res) => {
  const Body = z.object({ question: z.string().min(2), options: z.array(z.string()).min(2), multiSelect: z.boolean().default(false), closesAt: z.coerce.date().optional().nullable(), createdBy: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.poll.create({ data: { ...b, closesAt: b.closesAt ?? null } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/polls/:id/vote', async (req, res) => {
  const Body = z.object({ userId: z.string(), choices: z.array(z.string()).min(1) });
  try {
    const b = Body.parse(req.body);
    const p = await prisma.poll.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ success: false, error: 'Poll not found' });
    if (p.status === 'Closed') return res.status(409).json({ success: false, error: 'Poll closed' });
    const opts = p.options as string[];
    const bad = b.choices.filter(c => !opts.includes(c));
    if (bad.length) return res.status(400).json({ success: false, error: 'Invalid choice', invalid: bad });
    if (!p.multiSelect && b.choices.length > 1) return res.status(400).json({ success: false, error: 'Single-select poll' });
    try {
      const row = await prisma.pollResponse.create({ data: { pollId: p.id, userId: b.userId, choices: b.choices } });
      res.status(201).json({ success: true, data: row });
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ success: false, error: 'Already voted' });
      throw e;
    }
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'vote failed' }); }
});
wave6Router.get('/polls/:id/results', async (req, res) => {
  const p = await prisma.poll.findUnique({ where: { id: req.params.id } });
  if (!p) return res.status(404).json({ success: false, error: 'Not found' });
  const responses = await prisma.pollResponse.findMany({ where: { pollId: p.id } });
  const opts = p.options as string[];
  const tally: Record<string, number> = {};
  opts.forEach(o => { tally[o] = 0; });
  responses.forEach(r => { (r.choices as string[]).forEach(c => { tally[c] = (tally[c] || 0) + 1; }); });
  const total = responses.length;
  const results = opts.map(o => ({ option: o, votes: tally[o], pct: total ? +((tally[o] / total) * 100).toFixed(1) : 0 }));
  res.json({ success: true, data: results, totalResponses: total, question: p.question });
});

// ─── #66 KUDOS ──────────────────────────────────────────────────────────────
wave6Router.get('/kudos', async (req, res) => {
  const where: any = {};
  if (req.query.toUserId) where.toUserId = String(req.query.toUserId);
  if (req.query.fromUserId) where.fromUserId = String(req.query.fromUserId);
  const rows = await prisma.kudos.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/kudos', async (req, res) => {
  const Body = z.object({ fromUserId: z.string(), fromName: z.string(), toUserId: z.string(), toName: z.string(), category: z.enum(['Teamwork', 'Innovation', 'Customer', 'Excellence', 'Leadership']).default('Teamwork'), message: z.string().min(2), points: z.number().int().min(1).max(100).default(10) });
  try {
    const b = Body.parse(req.body);
    if (b.fromUserId === b.toUserId) return res.status(400).json({ success: false, error: 'Cannot give kudos to yourself' });
    const row = await prisma.kudos.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.get('/kudos/leaderboard', async (_req, res) => {
  const all = await prisma.kudos.findMany({ select: { toUserId: true, toName: true, points: true } });
  const map = new Map<string, { userId: string; name: string; total: number; count: number }>();
  all.forEach(k => {
    const e = map.get(k.toUserId) || { userId: k.toUserId, name: k.toName, total: 0, count: 0 };
    e.total += k.points; e.count += 1;
    map.set(k.toUserId, e);
  });
  const board = [...map.values()].sort((a, b) => b.total - a.total).slice(0, 20);
  res.json({ success: true, data: board, total: board.length });
});

// ─── #67 REFERRALS ──────────────────────────────────────────────────────────
wave6Router.get('/referrals', async (req, res) => {
  const where: any = {};
  if (req.query.referrerId) where.referrerId = String(req.query.referrerId);
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.referral.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/referrals', async (req, res) => {
  const Body = z.object({ referrerId: z.string(), referrerName: z.string(), refereeEmail: z.string().email(), refereeName: z.string().optional().nullable(), rewardAmount: z.number().nonnegative().default(50), rewardCurrency: z.string().default('USD') });
  try {
    const b = Body.parse(req.body);
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const row = await prisma.referral.create({ data: { ...b, referralCode } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/referrals/:code/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Signed', 'Qualified', 'Paid', 'Expired']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.referral.findUnique({ where: { referralCode: req.params.code } });
    if (!ex) return res.status(404).json({ success: false, error: 'Code not found' });
    const data: any = { status: b.status };
    if (b.status === 'Signed') data.signedAt = new Date();
    if (b.status === 'Qualified') data.qualifiedAt = new Date();
    if (b.status === 'Paid') data.paidAt = new Date();
    const row = await prisma.referral.update({ where: { id: ex.id }, data });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #68/#69/#70 PORTAL SESSIONS (Customer / Supplier / Partner) ────────────
wave6Router.post('/portal-sessions', async (req, res) => {
  const Body = z.object({ portalType: z.enum(['customer', 'supplier', 'partner']), externalId: z.string(), externalName: z.string(), ipAddress: z.string().optional().nullable(), userAgent: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.portalSession.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave6Router.post('/portal-sessions/:id/action', async (req, res) => {
  const Body = z.object({ action: z.string().min(2), payload: z.any().optional() });
  try {
    const b = Body.parse(req.body);
    const sess = await prisma.portalSession.findUnique({ where: { id: req.params.id } });
    if (!sess) return res.status(404).json({ success: false, error: 'Session not found' });
    const [, , act] = await prisma.$transaction([
      prisma.portalSession.update({ where: { id: sess.id }, data: { actionsCount: { increment: 1 }, lastActionAt: new Date() } }),
      prisma.portalAction.create({ data: { sessionId: sess.id, portalType: sess.portalType, externalId: sess.externalId, action: b.action, payload: b.payload ?? null } }),
      prisma.portalAction.findFirst({ where: { sessionId: sess.id }, orderBy: { createdAt: 'desc' } }),
    ]);
    res.status(201).json({ success: true, data: act });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'action failed' }); }
});
wave6Router.get('/portal-sessions', async (req, res) => {
  const where: any = {};
  if (req.query.portalType) where.portalType = String(req.query.portalType);
  if (req.query.externalId) where.externalId = String(req.query.externalId);
  const rows = await prisma.portalSession.findMany({ where, orderBy: { loginAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.get('/portal-actions', async (req, res) => {
  const where: any = {};
  if (req.query.portalType) where.portalType = String(req.query.portalType);
  if (req.query.externalId) where.externalId = String(req.query.externalId);
  const rows = await prisma.portalAction.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

// ─── #71 MOBILE API GATEWAY ─────────────────────────────────────────────────
wave6Router.get('/mobile-tokens', async (req, res) => {
  const where: any = {};
  if (req.query.userId) where.userId = String(req.query.userId);
  const rows = await prisma.mobileApiToken.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave6Router.post('/mobile-tokens', async (req, res) => {
  const Body = z.object({ userId: z.string(), deviceId: z.string().optional().nullable(), platform: z.enum(['ios', 'android', 'web']).optional(), scopes: z.string().default('read'), expiresInDays: z.number().int().positive().default(90) });
  try {
    const b = Body.parse(req.body);
    const token = `mh_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + b.expiresInDays * 86400000);
    const row = await prisma.mobileApiToken.create({ data: { token, userId: b.userId, deviceId: b.deviceId ?? null, platform: b.platform ?? null, scopes: b.scopes, expiresAt } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'issue failed' }); }
});
wave6Router.post('/mobile-tokens/:id/revoke', async (req, res) => {
  const ex = await prisma.mobileApiToken.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  const row = await prisma.mobileApiToken.update({ where: { id: ex.id }, data: { active: false } });
  res.json({ success: true, data: row });
});
wave6Router.post('/mobile-api/log', async (req, res) => {
  const Body = z.object({ token: z.string().optional().nullable(), endpoint: z.string(), method: z.string(), statusCode: z.number().int(), latencyMs: z.number().int().nonnegative().default(0) });
  try {
    const b = Body.parse(req.body);
    let tokenId: string | null = null;
    if (b.token) {
      const tok = await prisma.mobileApiToken.findUnique({ where: { token: b.token } });
      if (tok) {
        tokenId = tok.id;
        await prisma.mobileApiToken.update({ where: { id: tok.id }, data: { lastUsedAt: new Date() } });
      }
    }
    const row = await prisma.mobileApiCall.create({ data: { tokenId, endpoint: b.endpoint, method: b.method, statusCode: b.statusCode, latencyMs: b.latencyMs } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'log failed' }); }
});
wave6Router.get('/mobile-api/stats', async (_req, res) => {
  const [totalCalls, byEndpoint, byStatus, avgLatency] = await Promise.all([
    prisma.mobileApiCall.count(),
    prisma.mobileApiCall.groupBy({ by: ['endpoint'], _count: { _all: true } }),
    prisma.mobileApiCall.groupBy({ by: ['statusCode'], _count: { _all: true } }),
    prisma.mobileApiCall.aggregate({ _avg: { latencyMs: true } }),
  ]);
  res.json({
    success: true,
    data: {
      totalCalls,
      avgLatencyMs: +(avgLatency._avg.latencyMs || 0).toFixed(1),
      byEndpoint: byEndpoint.map(e => ({ endpoint: e.endpoint, calls: e._count._all })),
      byStatus: byStatus.map(s => ({ statusCode: s.statusCode, calls: s._count._all })),
    },
  });
});
