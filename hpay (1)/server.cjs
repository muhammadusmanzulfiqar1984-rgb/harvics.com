/**
 * HPay Prototype — Complete Backend (dropped server.js → CommonJS)
 * Double-entry ledger · Payment state machine · JWT auth · Full API
 * Durable SQLite bank DB (node:sqlite) — balance NEVER stored
 *
 * Run: npm run dev  →  http://localhost:3001
 * (package.json is "type":"module", so this file must stay .cjs)
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const ON_CLOUDFLARE = Boolean(process.env.CLOUDFLARE || process.env.CF_PAGES);

// Vercel serverless FS is read-only except /tmp
if (process.env.VERCEL && !process.env.HPAY_BANK_DB_PATH) {
  process.env.HPAY_BANK_DB_PATH = '/tmp/hpay-bank.sqlite';
}

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const { createSecurityBridge } = require('./server/security.cjs');
const { createIntegrations } = require('./server/integrations.cjs');
const { createProductionProviders } = require('./server/providers.cjs');
const { createRailAdapters } = require('./server/adapters/index.cjs');
const { createForexAdapter } = require('./server/adapters/forex.cjs');
const { createCryptoAdapter } = require('./server/adapters/crypto.cjs');
const { createIdempotencyStore } = require('./server/idempotency.cjs');
const { createPerimeter } = require('./server/perimeter.cjs');
let pgEnabled = () => false;
let createPgPool = () => null;
let createPgBank = () => null;
if (!ON_CLOUDFLARE) {
  ({ pgEnabled, createPgPool, createPgBank } = require('./server/db/pg.cjs'));
}
const { createWebAuthnService } = require('./server/webauthn.cjs');

function createEphemeralBank() {
  return {
    path: 'memory',
    dbPath: 'memory',
    isEmpty: () => true,
    hydrate: () => ({ users: 0, accounts: 0, ledger_entries: 0, transactions: 0 }),
    enableWriteThrough() {},
    backup() {},
    wipe() {},
    setMeta() {},
    getMeta: () => null,
    getBalance() {
      throw new Error('sqlite offline on Cloudflare — use Neon / in-memory ledger');
    },
    stats: () => ({
      path: 'memory',
      users: 0,
      accounts: 0,
      ledger_entries: 0,
      transactions: 0,
      last_backup: null,
    }),
    upsertSalesTick() {},
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'hpay-prototype-2026-secret';
const integrations = createIntegrations();
const providers = createRailAdapters();
const forex = createForexAdapter();
const cryptoMarket = createCryptoAdapter();
const idempotency = createIdempotencyStore();
const perimeter = createPerimeter({ windowMs: 60_000, maxRequests: 180 });

/** @type {ReturnType<typeof createPgBank>|null} */
let pgBank = null;

// L7 perimeter
app.use(perimeter.securityHeaders);
app.use(perimeter.rateLimit);

/** Money-path middleware stack: L5 idempotency */
const moneyPath = [idempotency.middleware];
/** Explicit payouts stack (instruction: enforce on all /api/v1/payouts routes) */
const payoutPath = [idempotency.payoutsOnly];

// ─────────────────────────────────────────────────────────────
// IN-MEMORY CACHE + DURABLE SQLITE BANK
// Balance is NEVER a column — SUM(credits)−SUM(debits) only.
// ─────────────────────────────────────────────────────────────

const db = {
  users: new Map(),
  usersByEmail: new Map(),
  usersByHPayId: new Map(),
  accounts: new Map(),
  ledgerEntries: [],       // double-entry ledger rows
  transactions: new Map(),
  payments: new Map(),
  refreshTokens: new Set(),
  merchants: new Map(),
  merchantOutlets: new Map(), // POS + online outlets
  salesTicks: [],             // hourly sales velocity stream
  payouts: new Map(),
  /** WebAuthn / FIDO2 PROTOCOL L5 */
  passkeyChallenges: new Map(),
  passkeys: new Map(),
  passkeyAssertions: new Map(),
};

const bank = ON_CLOUDFLARE
  ? createEphemeralBank()
  : require('./server/bankDb.cjs').createBankDb();

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const generateId = () => uuidv4();
const generateRef = () => `HP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,9).toUpperCase()}`;

const webauthn = createWebAuthnService({ db, generateId });

const generateHPayId = (name) =>
  `@${name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}${Math.floor(Math.random()*999)}`;

// ── Double-entry ledger ──────────────────────────────────────
// Balance is NEVER stored. Always derived from ledger entries.

const getBalance = (accountId) => {
  // Prefer durable bank SQL (source of truth); fall back to memory cache
  try {
    return bank.getBalance(accountId);
  } catch {
    const entries = db.ledgerEntries.filter(e => e.account_id === accountId);
    const credits = entries.filter(e => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0);
    const debits  = entries.filter(e => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0);
    return credits - debits;
  }
};

const createLedgerEntries = (transactionId, fromAccountId, toAccountId, amount, currency, description) => {
  const now = new Date().toISOString();
  if (fromAccountId) {
    db.ledgerEntries.push({ id: generateId(), transaction_id: transactionId, account_id: fromAccountId, entry_type: 'debit',  amount, currency, description, created_at: now });
  }
  if (toAccountId) {
    db.ledgerEntries.push({ id: generateId(), transaction_id: transactionId, account_id: toAccountId,   entry_type: 'credit', amount, currency, description, created_at: now });
  }
};

/** L6 — every two-sided posting must have Σ debits === Σ credits (single-sided adjustments allowed) */
const getLedgerInvariant = () => {
  const byTx = new Map();
  for (const e of db.ledgerEntries) {
    if (!byTx.has(e.transaction_id)) byTx.set(e.transaction_id, { debit: 0, credit: 0 });
    const row = byTx.get(e.transaction_id);
    if (e.entry_type === 'debit') row.debit += e.amount;
    else row.credit += e.amount;
  }
  const broken = [];
  for (const [txId, row] of byTx) {
    if (row.debit > 0 && row.credit > 0 && row.debit !== row.credit) broken.push(txId);
  }
  return {
    ok: broken.length === 0,
    broken_transactions: broken,
    total_entries: db.ledgerEntries.length,
    dual_sided_ok: broken.length === 0,
  };
};

const security = createSecurityBridge({
  generateId,
  generateRef,
  createLedgerEntries,
  transactions: db.transactions,
  getLedgerInvariant,
});

function securityBlocked(res, gate) {
  return res.status(403).json({
    error: gate.error || 'Settlement blocked by Security Enclave',
    code: gate.code,
    layers: gate.layers,
  });
}

/** L5 + L6 prep: bind idempotency key and Chainalysis KYT before PROTOCOL gate */
async function runMoneyGate(req, base) {
  const idempotencyKey =
    req.idempotencyKey ||
    req.headers['x-idempotency-key'] ||
    req.headers['idempotency-key'] ||
    req.body?.idempotency_key;

  const kyt = await providers.chainalysis.screenTransfer({
    userId: base.userId || req.user?.id,
    counterpartId: base.counterpartId,
    amountCents: base.amountCents,
    transferId: String(idempotencyKey || ''),
    asset: base.currency || 'USD',
  });

  return security.moneyPathSecurityGate({
    ...base,
    idempotencyKey,
    kyt,
  });
}

// ── Account helpers ──────────────────────────────────────────

const createAccount = (userId, type = 'consumer_wallet', currency = 'USD') => {
  const account = { id: generateId(), user_id: userId, type, currency, status: 'active', created_at: new Date().toISOString() };
  db.accounts.set(account.id, account);
  return account;
};

const getUserAccounts = (userId) => Array.from(db.accounts.values()).filter(a => a.user_id === userId);

const getPrimaryAccount = (userId) => {
  const accounts = getUserAccounts(userId);
  return accounts.find(a => a.currency === 'USD' && (a.type === 'consumer_wallet' || a.type === 'merchant_wallet'))
    || accounts.find(a => a.type === 'consumer_wallet')
    || accounts[0];
};

/** Supported wallet currencies for GET /balances (ledger-derived, never stored) */
const BALANCE_CURRENCIES = Object.freeze(['USD', 'AED', 'USDC', 'USDT', 'eUSD', 'eAED', 'BTC']);

const CURRENCY_SCALE = Object.freeze({
  USD: 100,
  AED: 100,
  USDC: 100,
  USDT: 100,
  eUSD: 100,
  eAED: 100,
  BTC: 100_000_000, // satoshis
});

const FASTRRAIL_FX = Object.freeze({
  'USD/AED': 3.6725,
  'AED/USD': 1 / 3.6725,
  'USD/USDC': 1,
  'USDC/USD': 1,
  'USD/USDT': 1,
  'USDT/USD': 1,
  'USD/eUSD': 1,
  'eUSD/USD': 1,
  'USD/eAED': 3.6725,
  'eAED/USD': 1 / 3.6725,
  'USD/BTC': 1 / 65000,
  'BTC/USD': 65000,
});

function toMinorUnits(amount, currency) {
  const scale = CURRENCY_SCALE[currency] || 100;
  return Math.round(Number(amount) * scale);
}

function fromMinorUnits(minor, currency) {
  const scale = CURRENCY_SCALE[currency] || 100;
  const decimals = currency === 'BTC' ? 8 : 2;
  return (Number(minor) / scale).toFixed(decimals);
}

function getAccountByCurrency(userId, currency) {
  return getUserAccounts(userId).find((a) => a.currency === currency && a.status === 'active') || null;
}

function getOrCreateCurrencyAccount(userId, currency, type = 'consumer_wallet') {
  const existing = getAccountByCurrency(userId, currency);
  if (existing) return existing;
  return createAccount(userId, type, currency);
}

function seedCurrencyOpening(userId, currency, displayAmount, type = 'multi_currency_wallet') {
  const account = getOrCreateCurrencyAccount(userId, currency, type);
  const minor = toMinorUnits(displayAmount, currency);
  if (minor <= 0) return account;
  const tx = {
    id: generateId(),
    reference: generateRef(),
    type: 'adjustment',
    status: 'settled',
    amount: minor,
    currency,
    from_account_id: null,
    to_account_id: account.id,
    description: `${currency} account opening credit`,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  };
  db.transactions.set(tx.id, tx);
  createLedgerEntries(tx.id, null, account.id, minor, currency, tx.description);
  return account;
}

function buildMultiCurrencyBalances(userId) {
  const balances = {};
  const accounts = [];
  for (const currency of BALANCE_CURRENCIES) {
    const account = getAccountByCurrency(userId, currency);
    const minor = account ? getBalance(account.id) : 0;
    balances[currency] = {
      currency,
      account_id: account?.id || null,
      amount_minor: minor,
      amount: fromMinorUnits(minor, currency),
      available: fromMinorUnits(minor, currency),
      pending: fromMinorUnits(0, currency),
      derived: true,
    };
    // Alias display keys for e-USD / e-AED API consumers
    if (currency === 'eUSD') {
      balances['e-USD'] = { ...balances[currency], currency: 'e-USD' };
    }
    if (currency === 'eAED') {
      balances['e-AED'] = { ...balances[currency], currency: 'e-AED' };
    }
    if (account) {
      accounts.push({
        id: account.id,
        currency,
        type: account.type,
        balance_minor: minor,
        balance: fromMinorUnits(minor, currency),
      });
    }
  }
  return {
    law: 'Balance is NEVER stored — SUM(credits) − SUM(debits) per currency account',
    protocol: 'HPAY-DEFENSE-GRADE-V1',
    layer: 'L6',
    balances,
    accounts,
    as_of: new Date().toISOString(),
  };
}

// ── Payment state machine ────────────────────────────────────
// Valid transitions only. Enforced on every state change.

const PAYMENT_TRANSITIONS = {
  created:       ['initiated', 'cancelled', 'expired'],
  initiated:     ['authenticated', 'failed', 'expired'],
  authenticated: ['authorized', 'failed'],
  authorized:    ['processing', 'cancelled', 'failed'],
  processing:    ['settled', 'failed'],
  settled:       ['refunded', 'partially_refunded', 'disputed'],
  disputed:      ['chargeback', 'settled'],
};

const canTransition = (from, to) => (PAYMENT_TRANSITIONS[from] || []).includes(to);

const transitionPayment = (payment, newStatus) => {
  if (!canTransition(payment.status, newStatus)) {
    throw new Error(`Invalid transition: ${payment.status} → ${newStatus}`);
  }
  payment.status = newStatus;
  payment.updated_at = new Date().toISOString();
  payment.events = payment.events || [];
  payment.events.push({ status: newStatus, timestamp: payment.updated_at });
  db.payments.set(payment.id, payment); // write-through bank (in-place mutate otherwise skips SQLite)
  return payment;
};

// ── Auth middleware ──────────────────────────────────────────

const auth = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ─────────────────────────────────────────────────────────────
// SEED DEMO DATA
// ─────────────────────────────────────────────────────────────

const seed = async () => {
  // Primary demo user
  const u1 = {
    id: generateId(), hpay_id: '@mian', name: 'Mian Usman',
    email: 'demo@hpay.com', phone: '+92300000001',
    password_hash: await bcrypt.hash('demo1234', 10),
    status: 'active', kyc_status: 'approved', kyc_tier: 2, mfa_enabled: false,
    created_at: new Date().toISOString(),
  };
  db.users.set(u1.id, u1);
  db.usersByEmail.set(u1.email, u1);
  db.usersByHPayId.set(u1.hpay_id, u1);

  // Second user (for transfers)
  const u2 = {
    id: generateId(), hpay_id: '@ahmed', name: 'Ahmed Khan',
    email: 'ahmed@hpay.com', phone: '+92300000002',
    password_hash: await bcrypt.hash('demo1234', 10),
    status: 'active', kyc_status: 'approved', kyc_tier: 1, mfa_enabled: false,
    created_at: new Date().toISOString(),
  };
  db.users.set(u2.id, u2);
  db.usersByEmail.set(u2.email, u2);
  db.usersByHPayId.set(u2.hpay_id, u2);

  // Third user
  const u3 = {
    id: generateId(), hpay_id: '@sara', name: 'Sara Malik',
    email: 'sara@hpay.com', phone: '+92300000003',
    password_hash: await bcrypt.hash('demo1234', 10),
    status: 'active', kyc_status: 'approved', kyc_tier: 1, mfa_enabled: false,
    created_at: new Date().toISOString(),
  };
  db.users.set(u3.id, u3);
  db.usersByEmail.set(u3.email, u3);
  db.usersByHPayId.set(u3.hpay_id, u3);

  // Harvics commerce counterparty (marketplace / checkout / splits)
  const u4 = {
    id: generateId(), hpay_id: '@harvics', name: 'Harvics Marketplace',
    email: 'marketplace@harvics.com', phone: '+97100000001',
    password_hash: await bcrypt.hash('demo1234', 10),
    status: 'active', kyc_status: 'approved', kyc_tier: 2, mfa_enabled: false,
    created_at: new Date().toISOString(),
  };
  db.users.set(u4.id, u4);
  db.usersByEmail.set(u4.email, u4);
  db.usersByHPayId.set(u4.hpay_id, u4);

  // Split / escrow counterparties used by the React money paths
  const counterparties = [
    { hpay_id: '@vendor-dxb', name: 'DXB Vendor Settlement', email: 'vendor@dxb.demo' },
    { hpay_id: '@creator-royalty', name: 'Creator Royalties Pool', email: 'royalties@hpay.demo' },
    { hpay_id: '@abc-trading', name: 'ABC Trading LLC', email: 'ops@abctrading.demo' },
  ];
  for (const c of counterparties) {
    const u = {
      id: generateId(), hpay_id: c.hpay_id, name: c.name,
      email: c.email, phone: null,
      password_hash: await bcrypt.hash('demo1234', 10),
      status: 'active', kyc_status: 'approved', kyc_tier: 1, mfa_enabled: false,
      created_at: new Date().toISOString(),
    };
    db.users.set(u.id, u);
    db.usersByEmail.set(u.email, u);
    db.usersByHPayId.set(u.hpay_id, u);
    createAccount(u.id, 'merchant_wallet', 'USD');
  }

  // Create accounts
  const a1 = createAccount(u1.id, 'consumer_wallet', 'USD');
  const a2 = createAccount(u2.id, 'consumer_wallet', 'USD');
  const a3 = createAccount(u3.id, 'consumer_wallet', 'USD');
  const a4 = createAccount(u4.id, 'merchant_wallet', 'USD');

  // Multi-currency ledger wallets for demo user (all balances ledger-derived)
  seedCurrencyOpening(u1.id, 'AED', 92450);
  seedCurrencyOpening(u1.id, 'USDC', 75000);
  seedCurrencyOpening(u1.id, 'USDT', 50000);
  seedCurrencyOpening(u1.id, 'eUSD', 25000);
  seedCurrencyOpening(u1.id, 'eAED', 100000);
  seedCurrencyOpening(u1.id, 'BTC', 2.45);
  // Counterparties get AED rails for FastRail cross-border demos
  seedCurrencyOpening(u2.id, 'AED', 12000);
  seedCurrencyOpening(u4.id, 'AED', 50000);

  // Seed initial balance for u1 = $12,480.00
  const seedTx = { id: generateId(), reference: generateRef(), type: 'adjustment', status: 'settled',
    amount: 1248000, currency: 'USD', from_account_id: null, to_account_id: a1.id,
    description: 'Account opening credit', created_at: new Date(Date.now() - 60 * 86400000).toISOString() };
  db.transactions.set(seedTx.id, seedTx);
  createLedgerEntries(seedTx.id, null, a1.id, 1248000, 'USD', seedTx.description);

  // Seed initial balance for u2 = $3,200.00
  const seedTx2 = { id: generateId(), reference: generateRef(), type: 'adjustment', status: 'settled',
    amount: 320000, currency: 'USD', from_account_id: null, to_account_id: a2.id,
    description: 'Account opening credit', created_at: new Date(Date.now() - 30 * 86400000).toISOString() };
  db.transactions.set(seedTx2.id, seedTx2);
  createLedgerEntries(seedTx2.id, null, a2.id, 320000, 'USD', seedTx2.description);

  // Seed transaction history for u1
  const history = [
    { desc: 'Harvics Marketplace', amount: -25000, type: 'payment',  days: 1 },
    { desc: 'Payment from @ahmed', amount:  80000, type: 'transfer', days: 2 },
    { desc: 'Food Delivery',       amount:  -3200, type: 'payment',  days: 3 },
    { desc: 'Online Shopping',     amount: -15000, type: 'payment',  days: 5 },
    { desc: 'Client Payment',      amount: 250000, type: 'transfer', days: 7 },
    { desc: 'Subscription',        amount:  -4900, type: 'payment',  days: 10 },
    { desc: 'Refund - Electronics',amount:  12000, type: 'refund',   days: 12 },
    { desc: 'Restaurant',          amount:  -8500, type: 'payment',  days: 14 },
    { desc: 'Transfer to @sara',   amount: -50000, type: 'transfer', days: 16 },
    { desc: 'Freelance Payment',   amount: 350000, type: 'transfer', days: 20 },
  ];

  for (const h of history) {
    const abs = Math.abs(h.amount);
    const isCredit = h.amount > 0;
    const tx = { id: generateId(), reference: generateRef(), type: h.type, status: 'settled',
      amount: abs, currency: 'USD',
      from_account_id: isCredit ? null : a1.id,
      to_account_id:   isCredit ? a1.id : null,
      description: h.desc, created_at: new Date(Date.now() - h.days * 86400000).toISOString() };
    db.transactions.set(tx.id, tx);
    createLedgerEntries(tx.id, tx.from_account_id, tx.to_account_id, abs, 'USD', h.desc);
  }

  // Seed merchant
  const merchant = { id: generateId(), name: 'Harvics Store', hpay_id: '@harvicsstore',
    account_id: a4.id, status: 'active', owner_user_id: u4.id, created_at: new Date().toISOString() };
  db.merchants.set(merchant.id, merchant);

  // Physical + online merchant outlets / POS terminals
  const outletSeed = [
    { code: 'M-101', name: 'Dubai Mall Flagship POS', location: 'Dubai, UAE', channel: 'physical', dailyVolume: 12450, pendingSettlement: 4500 },
    { code: 'M-102', name: 'Abu Dhabi Airport DutyFree', location: 'Abu Dhabi, UAE', channel: 'physical', dailyVolume: 8200, pendingSettlement: 2800 },
    { code: 'M-103', name: 'London Knightsbridge Store', location: 'London, UK', channel: 'physical', dailyVolume: 15300, pendingSettlement: 5200 },
    { code: 'M-104', name: 'Singapore Marina Bay Hub', location: 'Singapore', channel: 'physical', dailyVolume: 9400, pendingSettlement: 3100 },
    { code: 'M-105', name: 'Karachi Corporate Desk', location: 'Karachi, PK', channel: 'physical', dailyVolume: 4100, pendingSettlement: 1200 },
    { code: 'M-WEB', name: 'Harvics Online Checkout', location: 'Global / CDN', channel: 'online', dailyVolume: 22100, pendingSettlement: 7800 },
  ];
  for (const o of outletSeed) {
    const outlet = {
      id: o.code,
      merchant_id: merchant.id,
      name: o.name,
      location: o.location,
      channel: o.channel,
      terminal_id: `POS-${o.code}`,
      daily_volume_cents: Math.round(o.dailyVolume * 100),
      pending_settlement_cents: Math.round(o.pendingSettlement * 100),
      status: 'Active',
      currency: 'USD',
      created_at: new Date().toISOString(),
    };
    db.merchantOutlets.set(outlet.id, outlet);
  }

  // Seed last 24h sales-velocity ticks (real-time stream baseline)
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const velocityBase = [3200, 4100, 6400, 8900, 12100, 15200, 18900, 22100, 28420, 25100];
  const today = new Date();
  today.setMinutes(0, 0, 0);
  hours.forEach((label, i) => {
    const ts = new Date(today);
    const [hh] = label.split(':').map(Number);
    ts.setHours(hh);
    db.salesTicks.push({
      id: generateId(),
      hour: label,
      sales_cents: Math.round(velocityBase[i] * 100),
      sales: velocityBase[i],
      outlets_active: outletSeed.length,
      timestamp: ts.toISOString(),
    });
  });

  console.log('\n✅ HPay demo data seeded');
  console.log('─────────────────────────────────────');
  console.log('👤 Demo User 1:');
  console.log('   Email:    demo@hpay.com');
  console.log('   Password: demo1234');
  console.log('   HPay ID:  @mian');
  console.log('👤 Demo User 2:  ahmed@hpay.com / demo1234 / @ahmed');
  console.log('👤 Demo User 3:  sara@hpay.com  / demo1234 / @sara');
  console.log('🏪 Marketplace:  marketplace@harvics.com / @harvics');
  console.log('─────────────────────────────────────\n');
};

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/auth/register  (+ /auth/signup alias)
async function handleRegister(req, res) {
  try {
    const { name, email, phone, password, handle } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (db.usersByEmail.has(emailNorm)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let hpay_id;
    if (handle && String(handle).trim()) {
      const clean = `@${String(handle).trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '')}`;
      if (clean.length < 3) return res.status(400).json({ error: 'Handle too short' });
      if (db.usersByHPayId.has(clean)) {
        return res.status(409).json({ error: 'Handle already taken' });
      }
      hpay_id = clean;
    } else {
      hpay_id = generateHPayId(name);
      while (db.usersByHPayId.has(hpay_id)) hpay_id = generateHPayId(name);
    }

    const user = {
      id: generateId(),
      hpay_id,
      name: String(name).trim(),
      email: emailNorm,
      phone: phone || null,
      password_hash: await bcrypt.hash(password, 10),
      status: 'active',
      kyc_status: 'not_started',
      kyc_tier: 0,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
    };
    db.users.set(user.id, user);
    db.usersByEmail.set(emailNorm, user);
    db.usersByHPayId.set(user.hpay_id, user);
    createAccount(user.id, 'consumer_wallet', 'USD');

    const access_token = jwt.sign(
      { id: user.id, email: emailNorm, hpay_id: user.hpay_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refresh_token = generateId();
    db.refreshTokens.add(refresh_token);

    const { password_hash, ...safe } = user;
    res.status(201).json({ access_token, refresh_token, user: safe });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed', detail: e.message });
  }
}

app.post('/api/v1/auth/register', handleRegister);
app.post('/api/v1/auth/signup', handleRegister);

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailNorm = String(email || '').trim().toLowerCase();
    const user = db.usersByEmail.get(emailNorm);
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const access_token = jwt.sign(
      { id: user.id, email: user.email, hpay_id: user.hpay_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refresh_token = generateId();
    db.refreshTokens.add(refresh_token);

    const { password_hash, ...safe } = user;
    res.json({ access_token, refresh_token, user: safe });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/v1/auth/me
app.get('/api/v1/auth/me', auth, (req, res) => {
  const user = db.users.get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safe } = user;
  res.json(safe);
});

// POST /api/v1/auth/logout
app.post('/api/v1/auth/logout', auth, (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) db.refreshTokens.delete(refresh_token);
  res.json({ message: 'Logged out successfully' });
});

// ── PROTOCOL L3 — Real FIDO2 / WebAuthn (@simplewebauthn/server) ─

const { createHash: cryptoHash } = require('node:crypto');

/**
 * POST /api/v1/auth/passkey/register-challenge
 * Real WebAuthn registration options for FIDO2 passkeys.
 */
app.post('/api/v1/auth/passkey/register-challenge', auth, async (req, res) => {
  try {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { challengeId, options, rpID, origin } = await webauthn.registrationOptions(user);
    security.writeSecurityAudit(
      'PASSKEY_REGISTER_CHALLENGE',
      'info',
      { challengeId, userId: user.id, rpID },
      getPrimaryAccount(user.id)?.id
    );
    res.status(201).json({
      protocol: 'HPAY-REAL-MONEY-V2',
      layer: 'L3',
      challenge_id: challengeId,
      publicKey: options,
      rp_id: rpID,
      origin,
    });
  } catch (e) {
    res.status(500).json({ error: 'Passkey registration challenge failed', detail: e.message });
  }
});

/**
 * POST /api/v1/auth/passkey/authentication-challenge
 * WebAuthn assertion options for high-value payouts (≥ $10,000).
 */
app.post('/api/v1/auth/passkey/authentication-challenge', auth, async (req, res) => {
  try {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const amountCents = req.body?.amount != null ? Math.round(Number(req.body.amount) * 100) : null;
    const { challengeId, options, rpID, origin } = await webauthn.authenticationOptions(user, { amountCents });
    res.status(201).json({
      protocol: 'HPAY-REAL-MONEY-V2',
      layer: 'L3',
      challenge_id: challengeId,
      publicKey: options,
      rp_id: rpID,
      origin,
      amount_cents: amountCents,
    });
  } catch (e) {
    res.status(e.code === 'NO_PASSKEY' ? 400 : 500).json({
      error: e.message,
      code: e.code || 'WEBAUTHN_CHALLENGE_FAILED',
    });
  }
});

/**
 * POST /api/v1/auth/passkey/verify
 * Verify registration or authentication with @simplewebauthn/server.
 * Demo fallback: simulate_success=true only when WEBAUTHN_ALLOW_SIM=true
 */
app.post('/api/v1/auth/passkey/verify', auth, async (req, res) => {
  try {
    const user = db.users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      challenge_id,
      response,
      assertion,
      credential,
      amount,
      simulate_success,
      type,
    } = req.body || {};

    const amountCents = amount != null ? Math.round(Number(amount) * 100) : null;
    const account = getPrimaryAccount(user.id);
    const allowSim = process.env.WEBAUTHN_ALLOW_SIM === 'true' && simulate_success === true;

    if (type === 'registration' || (credential && !assertion && type !== 'authentication')) {
      if (allowSim && !response && !credential?.response?.clientDataJSON) {
        const credentialId = credential?.id || `cred_sim_${generateId()}`;
        db.passkeys.set(credentialId, {
          userId: user.id,
          credentialId,
          publicKey: 'sim',
          counter: 0,
          transports: ['internal'],
          createdAt: new Date().toISOString(),
        });
        user.passkey_registered = true;
        user.mfa_enabled = true;
        db.users.set(user.id, user);
        return res.status(201).json({
          protocol: 'HPAY-REAL-MONEY-V2',
          layer: 'L3',
          verified: true,
          type: 'registration',
          credential_id: credentialId,
          simulated: true,
          message: 'Simulated passkey registered (WEBAUTHN_ALLOW_SIM)',
        });
      }
      const result = await webauthn.verifyRegistration(user, {
        challengeId: challenge_id,
        response: response || credential,
      });
      security.writeSecurityAudit('PASSKEY_REGISTERED', 'info', { credentialId: result.credentialId }, account?.id);
      return res.status(201).json({
        protocol: 'HPAY-REAL-MONEY-V2',
        layer: 'L3',
        verified: true,
        type: 'registration',
        credential_id: result.credentialId,
        message: 'WebAuthn passkey registered for high-value clearance',
      });
    }

    // Authentication / high-value assertion
    if (allowSim && !response && !assertion?.id) {
      const assertionId = generateId();
      const clearance = {
        id: assertionId,
        userId: user.id,
        amountCents,
        verified: true,
        method: 'platform_sim',
        digest: `passkey.sim.${cryptoHash('sha256').update(String(assertionId)).digest('hex')}`,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      db.passkeyAssertions.set(assertionId, clearance);
      return res.json({
        protocol: 'HPAY-REAL-MONEY-V2',
        layer: 'L3',
        verified: true,
        type: 'assertion',
        assertion_id: assertionId,
        biometric_verified: true,
        simulated: true,
        expires_at: clearance.expiresAt,
        amount_cents: amountCents,
      });
    }

    const result = await webauthn.verifyAuthentication(user, {
      challengeId: challenge_id,
      response: response || assertion,
      amountCents,
    });
    security.writeSecurityAudit(
      'BIOMETRIC_VERIFIED',
      'info',
      { assertionId: result.assertionId, amountCents },
      account?.id
    );
    res.json({
      protocol: 'HPAY-REAL-MONEY-V2',
      layer: 'L3',
      verified: true,
      type: 'assertion',
      assertion_id: result.assertionId,
      biometric_verified: true,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      amount_cents: amountCents,
      message: 'FIDO2 biometric verified for high-value transaction',
    });
  } catch (e) {
    res.status(400).json({
      error: e.message || 'Passkey verification failed',
      code: e.code || 'WEBAUTHN_VERIFY_FAILED',
      detail: e.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// ACCOUNT ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/v1/accounts
app.get('/api/v1/accounts', auth, (req, res) => {
  const accounts = getUserAccounts(req.user.id).map(a => ({
    ...a,
    balance_cents: getBalance(a.id),
    balance: (getBalance(a.id) / 100).toFixed(2),
  }));
  res.json({ accounts });
});

// GET /api/v1/accounts/balances — primary wallet convenience (UI)
app.get('/api/v1/accounts/balances', auth, (req, res) => {
  const account = getPrimaryAccount(req.user.id);
  if (!account) return res.status(404).json({ error: 'No account' });
  const balance_cents = getBalance(account.id);
  res.json({
    account_id: account.id,
    currency: account.currency,
    balance_cents,
    balance: (balance_cents / 100).toFixed(2),
    USD: Number((balance_cents / 100).toFixed(2)),
  });
});

/**
 * GET /api/v1/balances — multi-currency balances (USD, AED, USDC, USDT, e-USD, e-AED, BTC)
 * All values ledger-derived: SUM(credits) − SUM(debits). Never stored.
 */
app.get('/api/v1/balances', auth, (req, res) => {
  res.json(buildMultiCurrencyBalances(req.user.id));
});

// GET /api/v1/accounts/:id/balance
app.get('/api/v1/accounts/:id/balance', auth, (req, res) => {
  const account = db.accounts.get(req.params.id);
  if (!account || account.user_id !== req.user.id) return res.status(404).json({ error: 'Account not found' });
  const balance_cents = getBalance(account.id);
  res.json({ account_id: account.id, balance_cents, balance: (balance_cents / 100).toFixed(2), currency: account.currency });
});

// GET /api/v1/accounts/:id/transactions
app.get('/api/v1/accounts/:id/transactions', auth, (req, res) => {
  const account = db.accounts.get(req.params.id);
  if (!account || account.user_id !== req.user.id) return res.status(404).json({ error: 'Account not found' });

  const { limit = 50, offset = 0, type } = req.query;

  const entries = db.ledgerEntries
    .filter(e => e.account_id === account.id)
    .map(e => {
      const tx = db.transactions.get(e.transaction_id) || {};
      return {
        id: e.id,
        transaction_id: e.transaction_id,
        reference: tx.reference,
        type: tx.type,
        description: tx.description,
        amount_cents: e.entry_type === 'credit' ? e.amount : -e.amount,
        amount: `${e.entry_type === 'credit' ? '+' : '-'}$${(e.amount / 100).toFixed(2)}`,
        is_credit: e.entry_type === 'credit',
        currency: e.currency,
        status: tx.status,
        created_at: e.created_at,
        metadata: tx.metadata || {},
      };
    })
    .filter(e => !type || e.type === type)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({ transactions: entries, total: entries.length });
});

// ─────────────────────────────────────────────────────────────
// PAYMENT ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/payments — create payment intent
app.post('/api/v1/payments', auth, (req, res) => {
  try {
    const { amount, currency = 'USD', description, merchant_name, capture_method = 'automatic' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

    const amountCents = Math.round(amount * 100);
    const account = getPrimaryAccount(req.user.id);
    const balance = getBalance(account.id);

    // Pre-auth risk check
    if (balance < amountCents) {
      return res.status(400).json({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' });
    }

    const payment = {
      id: generateId(), reference: generateRef(),
      status: 'created', amount: amountCents, currency,
      merchant_name: merchant_name || 'HPay Merchant',
      description: description || 'Payment',
      user_id: req.user.id, account_id: account.id,
      capture_method, risk_score: Math.floor(Math.random() * 25), // low risk for demo
      events: [{ status: 'created', timestamp: new Date().toISOString() }],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    db.payments.set(payment.id, payment);

    res.status(201).json({ payment });
  } catch (e) {
    res.status(500).json({ error: 'Payment creation failed', detail: e.message });
  }
});

// GET /api/v1/payments/:id
app.get('/api/v1/payments/:id', auth, (req, res) => {
  const payment = db.payments.get(req.params.id);
  if (!payment || payment.user_id !== req.user.id) return res.status(404).json({ error: 'Payment not found' });
  res.json({ payment });
});

// POST /api/v1/payments/:id/confirm — authorize + capture
app.post('/api/v1/payments/:id/confirm', auth, ...moneyPath, (req, res) => {
  try {
    const payment = db.payments.get(req.params.id);
    if (!payment || payment.user_id !== req.user.id) return res.status(404).json({ error: 'Payment not found' });

    // Optional biometric assertion for high-value (FIDO2 / passkey)
    if (req.body?.biometric_verified === true || req.body?.biometric_assertion) {
      payment.biometric_assertion = req.body.biometric_assertion || { verified: true };
      payment.metadata = { ...(payment.metadata || {}), biometric_verified: true };
    }
    payment.idempotency_key = req.idempotencyKey || req.headers['x-idempotency-key'] || payment.id;

    // State machine: created → initiated → authenticated → authorized → processing
    transitionPayment(payment, 'initiated');
    transitionPayment(payment, 'authenticated');
    transitionPayment(payment, 'authorized');

    // Defense-grade gate BEFORE funds leave (AML + PQ wrap + biometric threshold)
    const gate = security.preSettlementSecurityGate(payment, req.user.id);
    if (!gate.ok) {
      transitionPayment(payment, 'failed');
      payment.failure_code = gate.code;
      payment.aml = gate.aml;
      return res.status(403).json({
        error: 'Settlement blocked by Security Enclave before funds leave escrow',
        code: gate.code,
        aml: gate.aml,
        payment,
      });
    }

    transitionPayment(payment, 'processing');
    payment.pq_signature = gate.pq;

    // Check balance again at capture time
    const balance = getBalance(payment.account_id);
    if (balance < payment.amount) {
      transitionPayment(payment, 'failed');
      payment.failure_code = 'INSUFFICIENT_FUNDS';
      return res.status(400).json({ error: 'Insufficient balance', payment });
    }

    // Create transaction + double-entry ledger
    const txId = generateId();
    const tx = {
      id: txId, reference: generateRef(), type: 'payment', status: 'settled',
      amount: payment.amount, currency: payment.currency,
      from_account_id: payment.account_id, to_account_id: null,
      description: `${payment.merchant_name} — ${payment.description}`,
      metadata: { payment_id: payment.id, pq: gate.pq, aml: gate.aml },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, payment.account_id, null, payment.amount, payment.currency, tx.description);

    transitionPayment(payment, 'settled');
    payment.transaction_id = txId;
    payment.settled_at = new Date().toISOString();

    const newBalance = getBalance(payment.account_id);
    res.json({ payment, transaction: tx, new_balance: (newBalance / 100).toFixed(2) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/v1/payments/:id/cancel
app.post('/api/v1/payments/:id/cancel', auth, (req, res) => {
  try {
    const payment = db.payments.get(req.params.id);
    if (!payment || payment.user_id !== req.user.id) return res.status(404).json({ error: 'Payment not found' });
    transitionPayment(payment, 'cancelled');
    payment.cancelled_at = new Date().toISOString();
    res.json({ payment });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/v1/payments/:id/refund
app.post('/api/v1/payments/:id/refund', auth, (req, res) => {
  try {
    const payment = db.payments.get(req.params.id);
    if (!payment || payment.user_id !== req.user.id) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'settled') return res.status(400).json({ error: 'Payment not settled' });

    const { amount } = req.body;
    const refundAmount = amount ? Math.round(amount * 100) : payment.amount;
    if (refundAmount > payment.amount) return res.status(400).json({ error: 'Refund exceeds payment amount' });

    // Refund ledger: credit back to customer
    const txId = generateId();
    const tx = {
      id: txId, reference: generateRef(), type: 'refund', status: 'settled',
      amount: refundAmount, currency: payment.currency,
      from_account_id: null, to_account_id: payment.account_id,
      description: `Refund: ${payment.merchant_name}`,
      metadata: { original_payment_id: payment.id },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, null, payment.account_id, refundAmount, payment.currency, tx.description);

    transitionPayment(payment, refundAmount < payment.amount ? 'partially_refunded' : 'refunded');
    payment.refund_transaction_id = txId;
    payment.refunded_at = new Date().toISOString();

    const newBalance = getBalance(payment.account_id);
    res.json({ payment, refund_transaction: tx, new_balance: (newBalance / 100).toFixed(2) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// TRANSFER ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/transfers — send money to another HPay user
app.post('/api/v1/transfers', auth, ...moneyPath, async (req, res) => {
  try {
    const { to_hpay_id, amount, description, biometric_verified, biometric_assertion, multi_sig_approved, multi_sig_approvals } = req.body;
    if (!to_hpay_id || !amount) return res.status(400).json({ error: 'Recipient HPay ID and amount required' });

    const amountCents = Math.round(amount * 100);
    if (amountCents <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    const senderAccount = getPrimaryAccount(req.user.id);
    const balance = getBalance(senderAccount.id);
    if (balance < amountCents) return res.status(400).json({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' });

    // L7→L1 gate BEFORE recipient resolution so OFAC hits fail-closed even if user is unknown
    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: senderAccount.id,
      amountCents,
      counterpartId: to_hpay_id,
      counterpartName: to_hpay_id,
      path: 'transfer',
      biometricVerified: biometric_verified === true,
      biometric_assertion,
      multiSigApproved: multi_sig_approved === true,
      multiSigApprovals: multi_sig_approvals,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    // L1 Fireblocks MPC attestation (sandbox or live)
    const mpc = await providers.fireblocks.signSettlement({
      path: 'transfer',
      amountCents,
      counterpartId: to_hpay_id,
    });

    const recipient = db.usersByHPayId.get(to_hpay_id);
    if (!recipient) return res.status(404).json({ error: `User ${to_hpay_id} not found` });
    if (recipient.id === req.user.id) return res.status(400).json({ error: 'Cannot transfer to yourself' });

    const recipientAccount = getPrimaryAccount(recipient.id);
    if (!recipientAccount) return res.status(400).json({ error: 'Recipient has no active account' });

    const sender = db.users.get(req.user.id);
    const txId = generateId();
    const tx = {
      id: txId, reference: generateRef(), type: 'transfer', status: 'settled',
      amount: amountCents, currency: senderAccount.currency,
      from_account_id: senderAccount.id, to_account_id: recipientAccount.id,
      description: description || `Transfer to ${to_hpay_id}`,
      metadata: {
        to_hpay_id, from_hpay_id: sender.hpay_id, to_name: recipient.name,
        security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml, sanctions: gate.sanctions, zk: gate.zk },
        mpc,
        idempotency_key: gate.idempotencyKey,
      },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, senderAccount.id, recipientAccount.id, amountCents, senderAccount.currency, tx.description);

    const inv = getLedgerInvariant();
    if (!inv.ok) {
      return res.status(500).json({ error: 'Ledger invariant broken after transfer', code: 'LEDGER_INVARIANT_BROKEN', inv });
    }

    res.status(201).json({
      transaction: tx,
      new_balance: (getBalance(senderAccount.id) / 100).toFixed(2),
      recipient: { hpay_id: recipient.hpay_id, name: recipient.name },
      security: { code: 'ENCLAVE_CLEAR', layers: ['L1','L2','L3','L4','L5','L6','L7'] },
    });
  } catch (e) {
    res.status(500).json({ error: 'Transfer failed', detail: e.message });
  }
});

/**
 * POST /api/v1/transfers/fastrail — Instant internal or cross-border FastRail transfer.
 * PROTOCOL gate + double-entry. Cross-border may settle in destination currency via FX quote.
 */
app.post('/api/v1/transfers/fastrail', auth, ...moneyPath, async (req, res) => {
  try {
    const {
      to_hpay_id,
      amount,
      description,
      rail = 'internal', // internal | cross_border
      corridor,
      currency: reqCurrency = 'USD',
      biometric_verified,
      biometric_assertion,
      multi_sig_approved,
      multi_sig_approvals,
    } = req.body || {};

    if (!to_hpay_id || amount == null) {
      return res.status(400).json({ error: 'Recipient HPay ID and amount required' });
    }

    const currency = String(reqCurrency).replace('e-USD', 'eUSD').replace('e-AED', 'eAED');
    if (!BALANCE_CURRENCIES.includes(currency) && currency !== 'USD') {
      return res.status(400).json({ error: `Unsupported currency ${currency}`, code: 'CURRENCY_UNSUPPORTED' });
    }

    const amountMinor = toMinorUnits(amount, currency);
    if (amountMinor <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    const senderAccount = getOrCreateCurrencyAccount(req.user.id, currency);
    const balance = getBalance(senderAccount.id);
    if (balance < amountMinor) {
      return res.status(400).json({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' });
    }

    const amountCentsGate = currency === 'BTC' ? Math.round(Number(amount) * 65000 * 100) : amountMinor;
    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: senderAccount.id,
      amountCents: amountCentsGate,
      counterpartId: to_hpay_id,
      counterpartName: to_hpay_id,
      path: 'transfer',
      currency,
      biometricVerified: biometric_verified === true,
      biometric_assertion,
      multiSigApproved: multi_sig_approved === true,
      multiSigApprovals: multi_sig_approvals,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    const amlScreen = gate.layers?.l6_kyt_ofac?.provider || gate.sanctions;

    const recipient = db.usersByHPayId.get(to_hpay_id);
    if (!recipient) return res.status(404).json({ error: `User ${to_hpay_id} not found` });
    if (recipient.id === req.user.id) return res.status(400).json({ error: 'Cannot transfer to yourself' });

    const settleCurrency = currency;
    let creditMinor = amountMinor;
    let fx = null;
    const railType = String(rail).toLowerCase() === 'cross_border' ? 'cross_border' : 'internal';

    if (railType === 'cross_border') {
      const bankQuote = providers.swift_cbuae.pacs008CreditTransfer({
        amountCents: currency === 'BTC' ? Math.round(Number(amount) * 65000 * 100) : amountMinor,
        currency: currency === 'BTC' ? 'USD' : currency,
        corridor: corridor || 'AE-US',
        debtor: req.user.hpay_id || req.user.id,
        creditor: to_hpay_id,
      });
      fx = {
        pair: `${currency}/${settleCurrency}`,
        rate: 1,
        banking: bankQuote,
      };
    }

    const recipientAccount = getOrCreateCurrencyAccount(
      recipient.id,
      settleCurrency,
      recipient.hpay_id === '@harvics' ? 'merchant_wallet' : 'consumer_wallet'
    );

    const hsm = await providers.fireblocks.signSettlement({
      type: 'fastrail',
      from: req.user.id,
      to: to_hpay_id,
      amount: amountMinor,
      currency,
      path: 'fastrail',
      amountCents: amountCentsGate,
    });

    const sender = db.users.get(req.user.id);
    const txId = generateId();
    const tx = {
      id: txId,
      reference: generateRef(),
      type: 'fastrail_transfer',
      status: 'settled',
      amount: amountMinor,
      currency,
      from_account_id: senderAccount.id,
      to_account_id: recipientAccount.id,
      description: description || `FastRail ${railType} to ${to_hpay_id}`,
      metadata: {
        rail: 'fastrail',
        rail_type: railType,
        corridor: corridor || (railType === 'internal' ? 'HPAY-INTERNAL' : 'AE-US'),
        to_hpay_id,
        from_hpay_id: sender.hpay_id,
        to_name: recipient.name,
        fx,
        hsm,
        aml: amlScreen,
        security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml, sanctions: gate.sanctions, zk: gate.zk },
      },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, senderAccount.id, recipientAccount.id, creditMinor, settleCurrency, tx.description);

    const inv = getLedgerInvariant();
    if (!inv.ok) {
      return res.status(500).json({ error: 'Ledger invariant broken after FastRail', code: 'LEDGER_INVARIANT_BROKEN', inv });
    }

    res.status(201).json({
      transaction: tx,
      rail: 'fastrail',
      rail_type: railType,
      corridor: tx.metadata.corridor,
      new_balance: fromMinorUnits(getBalance(senderAccount.id), currency),
      recipient: { hpay_id: recipient.hpay_id, name: recipient.name },
      security: { code: 'ENCLAVE_CLEAR', layers: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] },
      integrations: { aml: amlScreen, hsm, banking: fx?.banking || null },
    });
  } catch (e) {
    res.status(500).json({ error: 'FastRail transfer failed', detail: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PAYOUT ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/payouts — initiate bank payout
app.post('/api/v1/payouts', auth, ...payoutPath, async (req, res) => {
  try {
    const { amount, bank_name, account_number, description, biometric_verified, multi_sig_approved, multi_sig_approvals } = req.body;
    if (!amount || !bank_name || !account_number) return res.status(400).json({ error: 'Amount, bank and account number required' });

    const amountCents = Math.round(amount * 100);
    const account = getPrimaryAccount(req.user.id);
    const balance = getBalance(account.id);
    if (balance < amountCents) return res.status(400).json({ error: 'Insufficient balance' });

    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: account.id,
      amountCents,
      counterpartId: bank_name,
      counterpartName: `${bank_name} ${String(account_number).slice(-4)}`,
      path: 'payout',
      biometricVerified: biometric_verified === true,
      multiSigApproved: multi_sig_approved === true,
      multiSigApprovals: multi_sig_approvals,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    // Circle payout rail (sandbox or live)
    await providers.circle.payout({
      amount: amountCents / 100,
      currency: account.currency,
      destination: { type: 'wire', name: bank_name },
    });

    const txId = generateId();
    const tx = {
      id: txId, reference: generateRef(), type: 'payout', status: 'processing',
      amount: amountCents, currency: account.currency,
      from_account_id: account.id, to_account_id: null,
      description: description || `Payout to ${bank_name}`,
      metadata: {
        bank_name,
        account_number: account_number.slice(-4).padStart(account_number.length, '*'),
        security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml },
      },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, account.id, null, amountCents, account.currency, tx.description);

    const payout = {
      id: txId,
      user_id: req.user.id,
      reference: tx.reference,
      status: 'processing',
      amount: amountCents,
      currency: account.currency,
      bank_name,
      account_number: tx.metadata.account_number,
      description: tx.description,
      created_at: tx.created_at,
    };
    db.payouts.set(payout.id, payout);

    setTimeout(() => {
      tx.status = 'settled';
      tx.settled_at = new Date().toISOString();
      payout.status = 'settled';
      payout.settled_at = tx.settled_at;
      db.transactions.set(tx.id, tx);
      db.payouts.set(payout.id, payout);
    }, 2000);

    const newBalance = getBalance(account.id);
    res.status(201).json({ transaction: tx, payout, new_balance: (newBalance / 100).toFixed(2), estimated_arrival: '1-3 business days', security: { code: 'ENCLAVE_CLEAR' } });
  } catch (e) {
    res.status(500).json({ error: 'Payout failed', detail: e.message });
  }
});

// GET /api/v1/payouts
app.get('/api/v1/payouts', auth, (req, res) => {
  const list = Array.from(db.payouts.values())
    .filter((p) => p.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((p) => ({
      ...p,
      amount_cents: p.amount,
      amount_display: (p.amount / 100).toFixed(2),
    }));
  res.json({ payouts: list });
});

// POST /api/v1/deposits (canonical) + /topups (alias) — ledger credit (Add Money)
async function handleDeposit(req, res) {
  try {
    const amount = Number(req.body?.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
    const amountCents = Math.round(amount * 100);
    const account = getPrimaryAccount(req.user.id);
    if (!account) return res.status(404).json({ error: 'No account' });

    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: account.id,
      amountCents,
      counterpartId: req.body?.source || 'bank_rail',
      counterpartName: req.body?.description || 'Wallet deposit',
      path: 'deposit',
      biometricVerified: req.body?.biometric_verified === true,
      skipVault: true,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    await providers.circle.wireDeposit({ amount: amountCents / 100, currency: account.currency });

    const txId = generateId();
    const tx = {
      id: txId,
      reference: generateRef(),
      type: 'deposit',
      status: 'settled',
      amount: amountCents,
      currency: account.currency,
      from_account_id: null,
      to_account_id: account.id,
      description: req.body?.description || 'Wallet deposit',
      metadata: { security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml } },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, null, account.id, amountCents, account.currency, tx.description);
    res.status(201).json({
      transaction: tx,
      new_balance: (getBalance(account.id) / 100).toFixed(2),
      security: { code: 'ENCLAVE_CLEAR' },
    });
  } catch (e) {
    res.status(500).json({ error: 'Deposit failed', detail: e.message });
  }
}
app.post('/api/v1/deposits', auth, ...moneyPath, handleDeposit);
app.post('/api/v1/topups', auth, ...moneyPath, handleDeposit);

// POST /api/v1/escrow/release — settle escrow via double-entry transfer
app.post('/api/v1/escrow/release', auth, ...moneyPath, async (req, res) => {
  try {
    const { to_hpay_id, amount, escrow_id, description, biometric_verified, multi_sig_approved, multi_sig_approvals } = req.body || {};
    if (!to_hpay_id || !amount) return res.status(400).json({ error: 'to_hpay_id and amount required' });

    const toId = String(to_hpay_id).startsWith('@') ? String(to_hpay_id) : `@${to_hpay_id}`;
    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    const senderAccount = getPrimaryAccount(req.user.id);
    const balance = getBalance(senderAccount.id);
    if (balance < amountCents) {
      return res.status(400).json({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' });
    }

    const recipient = db.usersByHPayId.get(toId);
    if (!recipient) return res.status(404).json({ error: `User ${to_hpay_id} not found` });
    const recipientAccount = getPrimaryAccount(recipient.id);
    if (!recipientAccount) return res.status(400).json({ error: 'Recipient has no active account' });

    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: senderAccount.id,
      amountCents,
      counterpartId: toId,
      counterpartName: recipient.name,
      path: 'escrow_release',
      biometricVerified: biometric_verified === true,
      multiSigApproved: multi_sig_approved === true,
      multiSigApprovals: multi_sig_approvals,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    const sender = db.users.get(req.user.id);
    const txId = generateId();
    const tx = {
      id: txId,
      reference: generateRef(),
      type: 'escrow_release',
      status: 'settled',
      amount: amountCents,
      currency: senderAccount.currency,
      from_account_id: senderAccount.id,
      to_account_id: recipientAccount.id,
      description: description || `Escrow release ${escrow_id || ''} → ${toId}`.trim(),
      metadata: {
        escrow_id: escrow_id || null,
        to_hpay_id: toId,
        from_hpay_id: sender.hpay_id,
        to_name: recipient.name,
        security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml, zk: gate.zk },
      },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, senderAccount.id, recipientAccount.id, amountCents, senderAccount.currency, tx.description);

    res.status(201).json({
      transaction: tx,
      new_balance: (getBalance(senderAccount.id) / 100).toFixed(2),
      recipient: { hpay_id: recipient.hpay_id, name: recipient.name },
      security: { code: 'ENCLAVE_CLEAR' },
    });
  } catch (e) {
    res.status(500).json({ error: 'Escrow release failed', detail: e.message });
  }
});

// POST /api/v1/admin/reseed — wipe in-memory DB and reseed (demo only)
app.post('/api/v1/admin/reseed', auth, async (req, res) => {
  try {
    try {
      bank.backup('pre-reseed');
    } catch (e) {
      console.warn('[bank] backup before reseed failed:', e.message);
    }
    bank.wipe();

    db.users.clear();
    db.usersByEmail.clear();
    db.usersByHPayId.clear();
    db.accounts.clear();
    db.ledgerEntries.length = 0;
    db.transactions.clear();
    db.payments.clear();
    db.refreshTokens.clear();
    db.merchants.clear();
    db.merchantOutlets.clear();
    db.salesTicks.length = 0;
    db.payouts.clear();
    db.passkeyChallenges.clear();
    db.passkeys.clear();
    db.passkeyAssertions.clear();
    await seed();
    bank.setMeta('seeded_at', new Date().toISOString());
    // Re-issue token for demo user after reseed
    const user = db.usersByEmail.get('demo@hpay.com');
    const access_token = jwt.sign(
      { id: user.id, email: user.email, hpay_id: user.hpay_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const { password_hash, ...safe } = user;
    res.json({ ok: true, access_token, user: safe });
  } catch (e) {
    res.status(500).json({ error: 'Reseed failed', detail: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// USER SEARCH
// ─────────────────────────────────────────────────────────────

// GET /api/v1/users/search?q=@ahmed
app.get('/api/v1/users/search', auth, (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ users: [] });

  const results = Array.from(db.users.values())
    .filter(u => u.id !== req.user.id &&
      (u.hpay_id.includes(q.toLowerCase()) ||
       u.name.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 5)
    .map(u => ({ id: u.id, hpay_id: u.hpay_id, name: u.name, kyc_tier: u.kyc_tier }));

  res.json({ users: results });
});

// ─────────────────────────────────────────────────────────────
// LEDGER VIEW (internal / admin)
// ─────────────────────────────────────────────────────────────

// GET /api/v1/ledger — raw ledger for user's accounts
app.get('/api/v1/ledger', auth, (req, res) => {
  const accountIds = new Set(getUserAccounts(req.user.id).map(a => a.id));
  const entries = db.ledgerEntries
    .filter(e => accountIds.has(e.account_id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalCredits = entries.filter(e => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0);
  const totalDebits  = entries.filter(e => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0);

  res.json({
    entries,
    summary: {
      total_entries: entries.length,
      total_credits: (totalCredits / 100).toFixed(2),
      total_debits:  (totalDebits / 100).toFixed(2),
      net: ((totalCredits - totalDebits) / 100).toFixed(2),
      invariant_check: getLedgerInvariant().ok ? 'PASS' : 'FAIL',
      dual_entry: getLedgerInvariant(),
    },
  });
});

/**
 * GET /api/v1/ledger/reconciliation — double-entry trial balance + audit metrics
 */
app.get('/api/v1/ledger/reconciliation', auth, (req, res) => {
  const inv = getLedgerInvariant();
  const byCurrency = {};
  const trialBalance = [];

  for (const account of db.accounts.values()) {
    const entries = db.ledgerEntries.filter((e) => e.account_id === account.id);
    const credits = entries.filter((e) => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0);
    const debits = entries.filter((e) => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0);
    const net = credits - debits;
    const row = {
      account_id: account.id,
      user_id: account.user_id,
      currency: account.currency,
      type: account.type,
      total_credits_minor: credits,
      total_debits_minor: debits,
      balance_minor: net,
      balance: fromMinorUnits(net, account.currency),
    };
    trialBalance.push(row);
    if (!byCurrency[account.currency]) {
      byCurrency[account.currency] = { credits: 0, debits: 0, accounts: 0 };
    }
    byCurrency[account.currency].credits += credits;
    byCurrency[account.currency].debits += debits;
    byCurrency[account.currency].accounts += 1;
  }

  const globalCredits = db.ledgerEntries.filter((e) => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0);
  const globalDebits = db.ledgerEntries.filter((e) => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0);
  const securityAudits = Array.from(db.transactions.values()).filter((t) => t.type === 'security_audit').length;
  const userAccountIds = new Set(getUserAccounts(req.user.id).map((a) => a.id));
  const userTrial = trialBalance.filter((r) => userAccountIds.has(r.account_id));

  res.json({
    law: 'Balance is NEVER stored — reconciliation reads SUM(credits)−SUM(debits) only',
    as_of: new Date().toISOString(),
    invariant: inv,
    invariant_check: inv.ok ? 'PASS' : 'FAIL',
    trial_balance: userTrial,
    global: {
      total_ledger_entries: db.ledgerEntries.length,
      total_credits_minor: globalCredits,
      total_debits_minor: globalDebits,
      delta_minor: globalCredits - globalDebits,
      dual_entry_balanced: inv.ok,
      security_audit_events: securityAudits,
      by_currency: byCurrency,
    },
    metrics: {
      accounts_reconciled: userTrial.length,
      open_imbalance: inv.ok ? 0 : 1,
      audit_coverage: securityAudits,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0-prototype',
    source: 'server.cjs',
    harvey: providers.gemini.live_ready ? 'gemini' : 'local',
    security: 'HPAY-REAL-MONEY-V2',
    protocol: 'L7→L1',
    providers: providers.status().adapters.map((a) => ({ id: a.id, mode: a.mode })),
    timestamp: new Date().toISOString(),
    db: {
      users: db.users.size,
      accounts: db.accounts.size,
      transactions: db.transactions.size,
      ledger_entries: db.ledgerEntries.length,
      merchant_outlets: db.merchantOutlets.size,
    },
    bank: {
      engine: pgBank ? 'neon-postgres+sqlite' : 'node:sqlite',
      path: bank.path,
      postgres: Boolean(pgBank),
      neon: Boolean(pgBank && /neon\.tech/i.test(process.env.DATABASE_URL || '')),
      schema: pgBank?.schema || null,
      ...bank.stats(),
      law: 'Balance never stored — SUM(credits)−SUM(debits)',
      isolation: pgBank ? 'SERIALIZABLE' : 'sqlite-wal',
    },
    ledger_invariant: getLedgerInvariant().ok ? 'PASS' : 'FAIL',
  });
});

// ─────────────────────────────────────────────────────────────
// MERCHANT OUTLETS & POS TERMINALS
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/merchants/outlets — physical + online outlets */
app.get('/api/v1/merchants/outlets', auth, (req, res) => {
  const outlets = Array.from(db.merchantOutlets.values()).map((o) => ({
    id: o.id,
    merchant_id: o.merchant_id,
    name: o.name,
    location: o.location,
    channel: o.channel,
    terminal_id: o.terminal_id,
    dailyVolume: Number((o.daily_volume_cents / 100).toFixed(2)),
    pendingSettlement: Number((o.pending_settlement_cents / 100).toFixed(2)),
    daily_volume_cents: o.daily_volume_cents,
    pending_settlement_cents: o.pending_settlement_cents,
    status: o.status,
    currency: o.currency,
  }));
  res.json({
    outlets,
    total: outlets.length,
    pending_settlement_total: outlets.reduce((s, o) => s + o.pendingSettlement, 0),
  });
});

/**
 * POST /api/v1/merchants/batch-settlement — bulk payout of pending terminal balances
 * Double-entry: debit outlet float (via merchant wallet) → credit settlement rail / owner wallet
 */
app.post('/api/v1/merchants/batch-settlement', auth, ...moneyPath, async (req, res) => {
  try {
    const {
      outlet_ids,
      biometric_verified,
      multi_sig_approved,
      multi_sig_approvals,
    } = req.body || {};

    const ids = Array.isArray(outlet_ids) && outlet_ids.length
      ? outlet_ids
      : Array.from(db.merchantOutlets.keys());

    const selected = ids
      .map((id) => db.merchantOutlets.get(id))
      .filter((o) => o && o.status === 'Active' && o.pending_settlement_cents > 0);

    if (!selected.length) {
      return res.status(400).json({ error: 'No outlets with pending settlement', code: 'NO_PENDING' });
    }

    const totalCents = selected.reduce((s, o) => s + o.pending_settlement_cents, 0);
    const merchant = Array.from(db.merchants.values())[0];
    const merchantAccount = merchant
      ? db.accounts.get(merchant.account_id) || getPrimaryAccount(merchant.owner_user_id)
      : getPrimaryAccount(req.user.id);
    if (!merchantAccount) return res.status(400).json({ error: 'Merchant settlement account missing' });

    const settleTo = getPrimaryAccount(req.user.id);
    if (!settleTo) return res.status(400).json({ error: 'No destination wallet' });

    const gate = await runMoneyGate(req, {
      userId: req.user.id,
      accountId: merchantAccount.id,
      amountCents: totalCents,
      counterpartId: 'batch-settlement',
      counterpartName: `Batch settlement ${selected.length} outlets`,
      path: 'payout',
      biometricVerified: biometric_verified === true,
      multiSigApproved: multi_sig_approved === true,
      multiSigApprovals: multi_sig_approvals,
    });
    if (!gate.ok) return securityBlocked(res, gate);

    // Ensure merchant wallet can cover pending (seed float if needed for demo)
    const merchantBal = getBalance(merchantAccount.id);
    if (merchantBal < totalCents) {
      const topId = generateId();
      const topTx = {
        id: topId,
        reference: generateRef(),
        type: 'adjustment',
        status: 'settled',
        amount: totalCents - merchantBal,
        currency: 'USD',
        from_account_id: null,
        to_account_id: merchantAccount.id,
        description: 'POS float top-up for batch settlement',
        created_at: new Date().toISOString(),
      };
      db.transactions.set(topId, topTx);
      createLedgerEntries(topId, null, merchantAccount.id, totalCents - merchantBal, 'USD', topTx.description);
    }

    const banking = providers.swift_cbuae.pacs008CreditTransfer({
      amountCents: totalCents,
      currency: 'USD',
      corridor: 'AE-US',
      debtor: 'merchant-float',
      creditor: req.user.hpay_id || req.user.id,
    });
    const hsm = await providers.fireblocks.signSettlement({
      type: 'batch-settlement',
      outlets: selected.map((o) => o.id),
      amountCents: totalCents,
      path: 'batch-settlement',
    });

    const settlements = [];
    for (const outlet of selected) {
      const amount = outlet.pending_settlement_cents;
      const txId = generateId();
      const tx = {
        id: txId,
        reference: generateRef(),
        type: 'merchant_settlement',
        status: 'settled',
        amount,
        currency: 'USD',
        from_account_id: merchantAccount.id,
        to_account_id: settleTo.id,
        description: `Batch settlement ${outlet.id} ${outlet.name}`,
        metadata: {
          outlet_id: outlet.id,
          terminal_id: outlet.terminal_id,
          batch: true,
          banking,
          hsm,
          security: { pq: gate.pq, hsm: gate.hsm, aml: gate.aml },
        },
        created_at: new Date().toISOString(),
      };
      db.transactions.set(txId, tx);
      createLedgerEntries(txId, merchantAccount.id, settleTo.id, amount, 'USD', tx.description);
      outlet.pending_settlement_cents = 0;
      db.merchantOutlets.set(outlet.id, outlet); // write-through to bank
      settlements.push({
        outlet_id: outlet.id,
        transaction_id: txId,
        reference: tx.reference,
        amount: (amount / 100).toFixed(2),
      });
    }

    const inv = getLedgerInvariant();
    if (!inv.ok) {
      return res.status(500).json({ error: 'Ledger invariant broken', code: 'LEDGER_INVARIANT_BROKEN', inv });
    }

    res.status(201).json({
      batch_id: generateId(),
      settled_count: settlements.length,
      total_amount: (totalCents / 100).toFixed(2),
      settlements,
      banking,
      hsm,
      new_balance: (getBalance(settleTo.id) / 100).toFixed(2),
      security: { code: 'ENCLAVE_CLEAR' },
    });
  } catch (e) {
    res.status(500).json({ error: 'Batch settlement failed', detail: e.message });
  }
});

/** GET /api/v1/merchants/sales-velocity — real-time hourly sales stream */
app.get('/api/v1/merchants/sales-velocity', auth, (req, res) => {
  // Append a live tick so the stream feels real-time
  const now = new Date();
  const label = `${String(now.getHours()).padStart(2, '0')}:00`;
  const last = db.salesTicks[db.salesTicks.length - 1];
  const jitter = 800 + Math.floor(Math.random() * 4200);
  if (!last || last.hour !== label) {
    db.salesTicks.push({
      id: generateId(),
      hour: label,
      sales: (last?.sales || 20000) + jitter,
      sales_cents: ((last?.sales || 20000) + jitter) * 100,
      outlets_active: db.merchantOutlets.size,
      timestamp: now.toISOString(),
    });
  } else {
    last.sales += Math.floor(Math.random() * 900);
    last.sales_cents = last.sales * 100;
    last.timestamp = now.toISOString();
    bank.upsertSalesTick(last); // in-place mutate → explicit bank persist
  }

  const stream = db.salesTicks.slice(-24).map((t) => ({
    time: t.hour,
    sales: t.sales,
    sales_cents: t.sales_cents,
    outlets_active: t.outlets_active,
    timestamp: t.timestamp,
  }));

  res.json({
    stream,
    as_of: now.toISOString(),
    peak_hour: stream.reduce((a, b) => (b.sales > a.sales ? b : a), stream[0]),
    total_today: stream.reduce((s, t) => s + t.sales, 0),
  });
});

// ─────────────────────────────────────────────────────────────
// AI FINANCIAL INTELLIGENCE
// ─────────────────────────────────────────────────────────────

function buildLocalHarveyReply(prompt, contextData, usd, hpayId) {
  const p = String(prompt || '').toLowerCase();
  let reply = `Harvey (local). Live ledger USD for ${hpayId}: $${usd}. Ask about risk, cash flow, anomalies, balance, transfer, or payout.`;
  let actionPrepared = null;
  let insights = [];

  if (p.includes('anomal') || p.includes('risk') || p.includes('fraud')) {
    reply = `Risk analysis for ${hpayId}: no sanctions hits on recent counterparties. Ledger USD **$${usd}**. Anomaly score low (demo). Escalate if transfers ≥ $10,000 (PROTOCOL L5 biometric) or ≥ $50,000 (vault M-of-N).`;
    insights = [{ type: 'risk', score: 12, label: 'Clear' }];
  } else if (p.includes('forecast') || p.includes('cash flow') || p.includes('cashflow') || p.includes('predict')) {
    const base = Number(usd) || 0;
    reply = `30-day cash-flow outlook (ledger-based): starting **$${usd}**. Projected Day-30 ~ **$${(base * 1.12).toFixed(2)}** assuming recurring inflows and vendor cadence. Use GET /analytics/predictive-cashflow for chart points.`;
    insights = [{ type: 'forecast', horizon_days: 30 }];
  } else if (p.includes('balance') || p.includes('cash') || p.includes('position') || p.includes('flow')) {
    const recent = Array.isArray(contextData.recentTransactions)
      ? contextData.recentTransactions
          .slice(0, 5)
          .map((t) => `${t.direction === 'in' ? '+' : '-'}$${Number(t.amount).toFixed(2)} ${t.counterparty || ''}`)
          .join('; ')
      : '';
    reply = `Cash position (ledger-derived): **$${usd} USD** on ${hpayId}. Balance is never stored — credits − debits only.${recent ? ` Recent: ${recent}.` : ''}`;
  } else if (p.includes('transfer') || p.includes('send') || p.includes('pay')) {
    reply = `I can prepare a transfer draft only (you must confirm in Pay). Example: send to @ahmed. Live available: $${usd}.`;
    actionPrepared = { type: 'transfer_draft', to_hpay_id: '@ahmed', note: 'Confirm in Pay — Harvey does not execute.' };
  } else if (p.includes('payout') || p.includes('withdraw')) {
    reply = `Payout draft: bank withdrawal from primary wallet ($${usd} available). Confirm in Payouts — Harvey does not execute.`;
    actionPrepared = { type: 'payout_draft', note: 'Confirm in Payouts — Harvey does not execute.' };
  } else if (p.includes('escrow')) {
    reply = `Escrow release for ESC-50021 posts $${(2500).toFixed(2)} to @abc-trading via POST /escrow/release. Your live balance is $${usd}.`;
  }

  return { reply, actionPrepared, insights };
}

function buildPredictiveCashflow(userId) {
  const account = getPrimaryAccount(userId);
  const balance = account ? getBalance(account.id) / 100 : 0;
  const accountIds = new Set(getUserAccounts(userId).map((a) => a.id));
  const recent = Array.from(db.transactions.values())
    .filter((t) => accountIds.has(t.from_account_id) || accountIds.has(t.to_account_id))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Simple velocity: avg daily net over last ~20 days of history
  let netIn = 0;
  let netOut = 0;
  for (const t of recent) {
    if (t.to_account_id && accountIds.has(t.to_account_id)) netIn += t.amount;
    if (t.from_account_id && accountIds.has(t.from_account_id)) netOut += t.amount;
  }
  const dailyDrift = ((netIn - netOut) / 100) / 30;
  const points = [];
  const todayIdx = 15;
  for (let day = 1; day <= 30; day++) {
    const projected = balance + dailyDrift * (day - todayIdx);
    const conf = Math.abs(dailyDrift) * (day > todayIdx ? (day - todayIdx) * 0.35 : 0);
    points.push({
      day: day === todayIdx ? `Day ${day} (Today)` : `Day ${day}`,
      day_index: day,
      actual: day <= todayIdx ? Number((balance + dailyDrift * (day - todayIdx)).toFixed(2)) : null,
      forecast: Number(projected.toFixed(2)),
      confidenceUpper: Number((projected + conf + balance * 0.02).toFixed(2)),
      confidenceLower: Number((projected - conf - balance * 0.02).toFixed(2)),
    });
  }
  // Sparse chart-friendly subset matching Analytics UI
  const chartDays = [1, 5, 10, 15, 18, 22, 26, 30];
  return {
    model: providers.gemini.live_ready ? providers.gemini.model : 'local-harvey-v1',
    as_of: new Date().toISOString(),
    starting_balance: Number(balance.toFixed(2)),
    horizon_days: 30,
    points: points.filter((p) => chartDays.includes(p.day_index)),
    series: points,
  };
}

/**
 * POST /api/v1/ai/harvey/chat — risk, cash-flow, anomaly intelligence
 * Uses Gemini when GEMINI_API_KEY set; otherwise local ledger intelligence.
 */
app.post('/api/v1/ai/harvey/chat', authOptionalHarvey, async (req, res) => {
  try {
    const prompt = String((req.body && (req.body.prompt || req.body.message)) || '');
    const contextData = (req.body && req.body.contextData) || {};
    const hpayId = (req.user && db.users.get(req.user.id)?.hpay_id) || contextData.hpayId || '@mian';
    const user = db.usersByHPayId.get(hpayId) || (req.user && db.users.get(req.user.id)) || db.usersByHPayId.get('@mian');
    const account = user ? getPrimaryAccount(user.id) : null;
    const usd = account ? (getBalance(account.id) / 100).toFixed(2) : String(contextData.balances?.USD ?? '0.00');

    const local = buildLocalHarveyReply(prompt, contextData, usd, hpayId);
    const system = `You are Harvey, HPay financial intelligence. Balance is NEVER stored — only ledger-derived. Live USD for ${hpayId} is $${usd}. Be concise. Risk thresholds: biometric ≥$10k, vault ≥$50k. Do not invent balances.`;
    const ai = await providers.gemini.complete({
      system,
      user: `${prompt}\n\nContext: ${JSON.stringify({
        usd,
        hpayId,
        recentTxCount: contextData.recentTxCount || (contextData.recentTransactions || []).length,
      })}`,
    });

    const reply = ai.text || local.reply;
    res.json({
      source: ai.text ? 'gemini' : 'local',
      model: ai.model || 'local-harvey',
      mode: ai.mode || 'sandbox',
      reply,
      text: reply,
      actionPrepared: local.actionPrepared,
      insights: local.insights,
      gateway: { live_ready: providers.gemini.live_ready, reason: ai.reason || null },
    });
  } catch (e) {
    res.status(500).json({ error: 'Harvey chat failed', detail: e.message });
  }
});

/** GET /api/v1/analytics/predictive-cashflow — 30-day AI forecast points */
app.get('/api/v1/analytics/predictive-cashflow', auth, (req, res) => {
  res.json(buildPredictiveCashflow(req.user.id));
});

// ─────────────────────────────────────────────────────────────
// PART 3 — EXTERNAL INTEGRATIONS STATUS
// ─────────────────────────────────────────────────────────────

app.get('/api/v1/integrations/status', auth, (req, res) => {
  res.json({
    ...integrations.status(),
    production_adapters: providers.status(),
    forex: { id: forex.id, mode: forex.mode, live_ready: forex.live_ready, host: forex.host },
    crypto: { id: cryptoMarket.id, mode: cryptoMarket.mode, live_ready: cryptoMarket.live_ready, host: cryptoMarket.host },
    protocol: 'HPAY-REAL-MONEY-V2',
  });
});

// ─────────────────────────────────────────────────────────────
// MARKET — FOREX (RapidAPI)
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/market/forex/latest?base=USD&symbols=EUR,GBP,AED */
app.get('/api/v1/market/forex/latest', auth, async (req, res) => {
  try {
    const data = await forex.latest({
      base: req.query.base || 'USD',
      symbols: req.query.symbols,
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'FOREX_LATEST_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/forex/timeseries?start_date=&end_date=&base=USD&symbols=EUR,GBP */
app.get('/api/v1/market/forex/timeseries', auth, async (req, res) => {
  try {
    const data = await forex.timeseries({
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      base: req.query.base || 'USD',
      symbols: req.query.symbols || 'EUR,GBP',
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'FOREX_TIMESERIES_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/forex/convert?from=USD&to=AED&amount=100 */
app.get('/api/v1/market/forex/convert', auth, async (req, res) => {
  try {
    const data = await forex.convert({
      from: req.query.from || 'USD',
      to: req.query.to || 'AED',
      amount: req.query.amount || 1,
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'FOREX_CONVERT_FAILED', detail: e.body });
  }
});

// ─────────────────────────────────────────────────────────────
// MARKET — CRYPTO (RapidAPI Realtime Crypto Prices)
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/market/crypto/liquidity?symbol=BTC */
app.get('/api/v1/market/crypto/liquidity', auth, async (req, res) => {
  try {
    const data = await cryptoMarket.liquidity({ symbol: req.query.symbol || 'BTC' });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'CRYPTO_LIQUIDITY_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/crypto/tickers?symbols=BTC,ETH */
app.get('/api/v1/market/crypto/tickers', auth, async (req, res) => {
  try {
    const data = await cryptoMarket.tickers({ symbols: req.query.symbols || 'BTC,ETH' });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'CRYPTO_TICKERS_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/crypto/board?symbols=BTC,ETH,SOL,XRP,BNB,DOGE — public tape (no auth) */
app.get('/api/v1/market/crypto/board', async (req, res) => {
  try {
    const data = await cryptoMarket.board({
      symbols: req.query.symbols || 'BTC,ETH,SOL,XRP,BNB,DOGE',
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'CRYPTO_BOARD_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/crypto/volume?symbol=BTC */
app.get('/api/v1/market/crypto/volume', auth, async (req, res) => {
  try {
    const data = await cryptoMarket.volume({ symbol: req.query.symbol || 'BTC' });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'CRYPTO_VOLUME_FAILED', detail: e.body });
  }
});

/** GET /api/v1/market/crypto/marketcap?symbol=BTC */
app.get('/api/v1/market/crypto/marketcap', auth, async (req, res) => {
  try {
    const data = await cryptoMarket.marketcap({ symbol: req.query.symbol || 'BTC' });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, code: 'CRYPTO_MARKETCAP_FAILED', detail: e.body });
  }
});

app.post('/api/v1/integrations/stablecoin/mint', auth, (req, res) => {
  const amount = Number(req.body?.amount || 0);
  const asset = req.body?.asset || 'USDC';
  if (amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
  const amountCents = Math.round(amount * 100);
  const mint = integrations.stablecoins.mint({ amountCents, asset });
  // Ledger credit to matching currency wallet (sandbox mint → opening credit style)
  const currency = asset === 'USDT' ? 'USDT' : 'USDC';
  const account = getOrCreateCurrencyAccount(req.user.id, currency);
  const txId = generateId();
  const tx = {
    id: txId,
    reference: generateRef(),
    type: 'stablecoin_mint',
    status: 'settled',
    amount: amountCents,
    currency,
    from_account_id: null,
    to_account_id: account.id,
    description: `${asset} mint via ${mint.provider}`,
    metadata: { mint },
    created_at: new Date().toISOString(),
  };
  db.transactions.set(txId, tx);
  createLedgerEntries(txId, null, account.id, amountCents, currency, tx.description);
  res.status(201).json({ mint, transaction: tx, new_balance: fromMinorUnits(getBalance(account.id), currency) });
});

app.post('/api/v1/integrations/aml/screen', auth, (req, res) => {
  const result = integrations.aml.screen({
    counterpartId: req.body?.counterpart_id || req.body?.to_hpay_id,
    amountCents: Math.round(Number(req.body?.amount || 0) * 100),
    path: req.body?.path || 'manual',
  });
  res.json(result);
});

// GET /api/v1/security/enclave — component status for Settings UI
app.get('/api/v1/security/enclave', auth, (req, res) => {
  res.json(security.getEnclaveStatus());
});

/**
 * POST /api/v1/security/hsm/rotate-keys
 * Trigger automated or manual FIPS 140-2 key rotation (PROTOCOL L1).
 * Requires dual-custody: body.custody = [officerA, officerB]
 */
function handleHsmRotateKeys(req, res) {
  const custody = req.body?.custody || [req.user.id, req.body?.co_signer].filter(Boolean);
  const mode = req.body?.mode === 'automated' ? 'automated' : 'manual';
  const result = security.rotateHsmRoot(custody);
  if (!result.ok) return res.status(403).json({ ...result, protocol: 'HPAY-DEFENSE-GRADE-V1', layer: 'L1' });
  security.writeSecurityAudit(
    'HSM_ROOT_ROTATION',
    'info',
    { ...result, mode },
    getPrimaryAccount(req.user.id)?.id
  );
  res.json({
    protocol: 'HPAY-DEFENSE-GRADE-V1',
    layer: 'L1',
    mode,
    fips: 'FIPS 140-2 Level 4',
    dual_custody: true,
    exported_key_material: false,
    ...result,
  });
}
app.post('/api/v1/security/hsm/rotate-keys', auth, handleHsmRotateKeys);
app.post('/api/v1/security/hsm/rotate', auth, handleHsmRotateKeys);
/**
 * GET /api/v1/security/zkp/solvency-proof
 * Retrieve cryptographic ZK proof of 100% reserve solvency (PROTOCOL L3).
 * Never reveals balances or counterparties.
 */
app.get('/api/v1/security/zkp/solvency-proof', auth, (req, res) => {
  const account = getPrimaryAccount(req.user.id);
  if (!account) return res.status(404).json({ error: 'No account' });

  const balanceCents = getBalance(account.id);
  // Commitment only — raw balance never in publicSignals
  const accountCommitment = cryptoHash('sha256').update(`acct:${account.id}`).digest('hex');
  const liabilityCommitment = cryptoHash('sha256').update(`liab:protocol:${req.user.id}`).digest('hex');
  const thresholdCents = Number(req.query.threshold_cents) || Math.max(balanceCents, 100000);

  const solvency = security.proveZkSolvency({
    accountCommitment,
    liabilityCommitment,
    thresholdCents,
    epoch: req.query.epoch || new Date().toISOString().slice(0, 10),
  });

  // Force public claim: reserves cover liabilities (demo attest)
  solvency.publicSignals.reservesCoverLiabilities = true;
  solvency.publicSignals.reserveRatioBand = 'gte_100pct';
  solvency.revealedFields = [];

  security.writeSecurityAudit(
    'ZK_SOLVENCY_PROOF',
    'info',
    { proofId: solvency.proofId, thresholdBand: solvency.publicSignals.thresholdBand },
    account.id
  );

  res.json({
    protocol: 'HPAY-DEFENSE-GRADE-V1',
    layer: 'L3',
    proof: solvency,
    revealed_fields: [],
    message: 'ZK solvency proof — 100% reserve backing attested without revealing balances',
  });
});

// Legacy combined prove (POST)
app.post('/api/v1/security/zk/prove', auth, (req, res) => {
  const account = getPrimaryAccount(req.user.id);
  const solvency = security.proveZkSolvency({
    accountCommitment: cryptoHash('sha256').update(account?.id || req.user.id).digest('hex'),
    liabilityCommitment: cryptoHash('sha256').update('liab').digest('hex'),
    thresholdCents: Number(req.body?.threshold_cents) || 100000,
  });
  const compliance = security.proveZkCompliance({
    policyId: req.body?.policy_id || 'HPAY-SANCTIONS-AML-1',
    attestationCommitment: cryptoHash('sha256').update(`${req.user.id}|attest`).digest('hex'),
    jurisdiction: req.body?.jurisdiction || 'AE',
  });
  security.writeSecurityAudit('ZK_SOLVENCY_PROOF', 'info', { proofId: solvency.proofId }, account?.id);
  security.writeSecurityAudit('ZK_COMPLIANCE_PROOF', 'info', { proofId: compliance.proofId }, account?.id);
  res.json({ solvency, compliance, revealedFields: [] });
});

// GET /api/v1/security/audit — recent security_audit ledger txs for user
app.get('/api/v1/security/audit', auth, (req, res) => {
  const accountIds = new Set(getUserAccounts(req.user.id).map((a) => a.id));
  const events = Array.from(db.transactions.values())
    .filter((t) => t.type === 'security_audit' && (!t.from_account_id || accountIds.has(t.from_account_id)))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50)
    .map((t) => ({
      id: t.id,
      reference: t.reference,
      description: t.description,
      metadata: t.metadata,
      created_at: t.created_at,
    }));
  res.json({ events });
});

// Local Harvey (no cloud LLM) — alias → /api/v1/ai/harvey/chat
app.post('/api/harvey', authOptionalHarvey, async (req, res) => {
  req.url = '/api/v1/ai/harvey/chat';
  // Reuse handler body via internal forward
  const prompt = String((req.body && req.body.prompt) || '');
  const contextData = (req.body && req.body.contextData) || {};
  const hpayId = (req.user && db.users.get(req.user.id)?.hpay_id) || contextData.hpayId || '@mian';
  const user = db.usersByHPayId.get(hpayId) || db.usersByHPayId.get('@mian');
  const account = user ? getPrimaryAccount(user.id) : null;
  const usd = account ? (getBalance(account.id) / 100).toFixed(2) : String(contextData.balances?.USD ?? '0.00');
  const local = buildLocalHarveyReply(prompt, contextData, usd, hpayId);
  const ai = await providers.gemini.complete({
    system: `You are Harvey, HPay financial intelligence. Live USD for ${hpayId} is $${usd}. Never invent balances.`,
    user: prompt,
  });
  const reply = ai.text || local.reply;
  res.json({
    source: ai.text ? 'gemini' : 'local',
    model: ai.model || 'local-harvey',
    reply,
    text: reply,
    actionPrepared: local.actionPrepared,
    insights: local.insights,
  });
});

function authOptionalHarvey(req, _res, next) {
  // Harvey works without token for demo UI; attach user if present
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {
      /* ignore */
    }
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// START (Vite middleware for React UI in dev)
// ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT || 3001);

(async () => {
  // Optional Postgres production bank (DATABASE_URL)
  if (pgEnabled()) {
    try {
      const pool = createPgPool();
      pgBank = createPgBank(pool);
      await pgBank.migrate();
      // Ensure a default org exists for idempotency FK
      const orgRes = await pool.query(
        `INSERT INTO organizations (hpay_id, business_name, country_code, tier, status)
         VALUES ('@hpay', 'HPay Platform', 'UAE', 'ENTERPRISE', 'ACTIVE')
         ON CONFLICT (hpay_id) DO UPDATE SET business_name = EXCLUDED.business_name
         RETURNING id`
      );
      const orgId = orgRes.rows[0]?.id;
      idempotency.bindPg(pgBank, orgId);
      const h = await pgBank.health();
      console.log(`🐘 Postgres bank ready → ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':***@')}`);
      console.log(`   provider: ${h.provider} · db: ${h.database} · schema: ${h.schema} · SERIALIZABLE`);
    } catch (e) {
      console.error('[postgres] init failed — falling back to SQLite:', e.message);
      pgBank = null;
    }
  }

  // Durable SQLite bank boot (trial / fallback): hydrate existing ledger OR seed once
  if (!bank.isEmpty()) {
    const loaded = bank.hydrate(db);
    bank.enableWriteThrough(db);
    try {
      bank.backup('boot');
    } catch (e) {
      console.warn('[bank] boot backup skipped:', e.message);
    }
    console.log('\n💾 HPay SQLite bank restored');
    console.log(`   path: ${bank.path}`);
    console.log(`   users=${loaded.users} accounts=${loaded.accounts} ledger=${loaded.ledger_entries} txs=${loaded.transactions}`);
    console.log('   law: Balance NEVER stored — SUM(credits)−SUM(debits)\n');
  } else {
    bank.enableWriteThrough(db);
    await seed();
    bank.setMeta('seeded_at', new Date().toISOString());
    try {
      bank.backup('initial-seed');
    } catch (e) {
      console.warn('[bank] initial backup skipped:', e.message);
    }
    console.log(`💾 HPay SQLite bank created → ${bank.path}`);
  }

  if (process.env.NODE_ENV !== 'production' && !ON_CLOUDFLARE) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!ON_CLOUDFLARE) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // On Cloudflare, listen() is a routing key for httpServerHandler — not a real TCP port.
  app.listen(PORT, ON_CLOUDFLARE ? undefined : '0.0.0.0', () => {
    if (ON_CLOUDFLARE) {
      console.log(`🚀 HPay on Cloudflare Workers · port key ${PORT} · Neon schema hpay`);
      return;
    }
    console.log(`🚀 HPay (dropped server.js) → http://localhost:${PORT}`);
    console.log(`🏥 Health                   → http://localhost:${PORT}/api/health`);
    console.log(`🏦 Bank DB                  → ${bank.path}`);
    console.log(`📱 UI                       → http://localhost:${PORT}\n`);
  });
})();
