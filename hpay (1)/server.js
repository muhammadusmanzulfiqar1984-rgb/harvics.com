/**
 * HPay Prototype — Complete Backend
 * Double-entry ledger · Payment state machine · JWT auth · Full API
 * In-memory store (swap for PostgreSQL in production)
 *
 * Run: node server.js
 * Demo: http://localhost:3001
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'hpay-prototype-2026-secret';

// ─────────────────────────────────────────────────────────────
// IN-MEMORY DATABASE
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
  payouts: new Map(),
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const generateId = () => uuidv4();
const generateRef = () => `HP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,9).toUpperCase()}`;

const generateHPayId = (name) =>
  `@${name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}${Math.floor(Math.random()*999)}`;

// ── Double-entry ledger ──────────────────────────────────────
// Balance is NEVER stored. Always derived from ledger entries.

const getBalance = (accountId) => {
  const entries = db.ledgerEntries.filter(e => e.account_id === accountId);
  const credits = entries.filter(e => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0);
  const debits  = entries.filter(e => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0);
  return credits - debits; // in cents
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

// ── Account helpers ──────────────────────────────────────────

const createAccount = (userId, type = 'consumer_wallet', currency = 'USD') => {
  const account = { id: generateId(), user_id: userId, type, currency, status: 'active', created_at: new Date().toISOString() };
  db.accounts.set(account.id, account);
  return account;
};

const getUserAccounts = (userId) => Array.from(db.accounts.values()).filter(a => a.user_id === userId);

const getPrimaryAccount = (userId) => {
  const accounts = getUserAccounts(userId);
  return accounts.find(a => a.type === 'consumer_wallet') || accounts[0];
};

// ── Payment state machine ────────────────────────────────────
// Valid transitions only. Enforced on every state change.

const PAYMENT_TRANSITIONS = {
  created:       ['initiated', 'cancelled', 'expired'],
  initiated:     ['authenticated', 'failed', 'expired'],
  authenticated: ['authorized', 'failed'],
  authorized:    ['processing', 'cancelled'],
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

  // Create accounts
  const a1 = createAccount(u1.id, 'consumer_wallet', 'USD');
  const a2 = createAccount(u2.id, 'consumer_wallet', 'USD');
  const a3 = createAccount(u3.id, 'consumer_wallet', 'USD');

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
    account_id: null, status: 'active', created_at: new Date().toISOString() };
  db.merchants.set(merchant.id, merchant);

  console.log('\n✅ HPay demo data seeded');
  console.log('─────────────────────────────────────');
  console.log('👤 Demo User 1:');
  console.log('   Email:    demo@hpay.com');
  console.log('   Password: demo1234');
  console.log('   HPay ID:  @mian');
  console.log('👤 Demo User 2:  ahmed@hpay.com / demo1234 / @ahmed');
  console.log('👤 Demo User 3:  sara@hpay.com  / demo1234 / @sara');
  console.log('─────────────────────────────────────\n');
};

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (db.usersByEmail.has(email)) return res.status(409).json({ error: 'Email already registered' });

    const user = {
      id: generateId(), hpay_id: generateHPayId(name), name, email,
      phone: phone || null, password_hash: await bcrypt.hash(password, 10),
      status: 'active', kyc_status: 'not_started', kyc_tier: 0, mfa_enabled: false,
      created_at: new Date().toISOString(),
    };
    db.users.set(user.id, user);
    db.usersByEmail.set(email, user);
    db.usersByHPayId.set(user.hpay_id, user);
    createAccount(user.id, 'consumer_wallet', 'USD');

    const access_token = jwt.sign({ id: user.id, email, hpay_id: user.hpay_id }, JWT_SECRET, { expiresIn: '24h' });
    const refresh_token = generateId();
    db.refreshTokens.add(refresh_token);

    const { password_hash, ...safe } = user;
    res.status(201).json({ access_token, refresh_token, user: safe });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed', detail: e.message });
  }
});

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.usersByEmail.get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const access_token = jwt.sign({ id: user.id, email: user.email, hpay_id: user.hpay_id }, JWT_SECRET, { expiresIn: '24h' });
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
app.post('/api/v1/payments/:id/confirm', auth, (req, res) => {
  try {
    const payment = db.payments.get(req.params.id);
    if (!payment || payment.user_id !== req.user.id) return res.status(404).json({ error: 'Payment not found' });

    // State machine: created → initiated → authenticated → authorized → processing → settled
    transitionPayment(payment, 'initiated');
    transitionPayment(payment, 'authenticated');
    transitionPayment(payment, 'authorized');
    transitionPayment(payment, 'processing');

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
      metadata: { payment_id: payment.id },
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
app.post('/api/v1/transfers', auth, async (req, res) => {
  try {
    const { to_hpay_id, amount, description } = req.body;
    if (!to_hpay_id || !amount) return res.status(400).json({ error: 'Recipient HPay ID and amount required' });

    const amountCents = Math.round(amount * 100);
    if (amountCents <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    const senderAccount = getPrimaryAccount(req.user.id);
    const balance = getBalance(senderAccount.id);
    if (balance < amountCents) return res.status(400).json({ error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' });

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
      metadata: { to_hpay_id, from_hpay_id: sender.hpay_id, to_name: recipient.name },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, senderAccount.id, recipientAccount.id, amountCents, senderAccount.currency, tx.description);

    const newBalance = getBalance(senderAccount.id);
    res.status(201).json({
      transaction: tx,
      new_balance: (newBalance / 100).toFixed(2),
      recipient: { hpay_id: recipient.hpay_id, name: recipient.name },
    });
  } catch (e) {
    res.status(500).json({ error: 'Transfer failed', detail: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PAYOUT ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/payouts — initiate bank payout
app.post('/api/v1/payouts', auth, (req, res) => {
  try {
    const { amount, bank_name, account_number, description } = req.body;
    if (!amount || !bank_name || !account_number) return res.status(400).json({ error: 'Amount, bank and account number required' });

    const amountCents = Math.round(amount * 100);
    const account = getPrimaryAccount(req.user.id);
    const balance = getBalance(account.id);
    if (balance < amountCents) return res.status(400).json({ error: 'Insufficient balance' });

    const txId = generateId();
    const tx = {
      id: txId, reference: generateRef(), type: 'payout', status: 'processing',
      amount: amountCents, currency: account.currency,
      from_account_id: account.id, to_account_id: null,
      description: description || `Payout to ${bank_name}`,
      metadata: { bank_name, account_number: account_number.slice(-4).padStart(account_number.length, '*') },
      created_at: new Date().toISOString(),
    };
    db.transactions.set(txId, tx);
    createLedgerEntries(txId, account.id, null, amountCents, account.currency, tx.description);

    // Simulate async bank confirmation after 2 seconds
    setTimeout(() => {
      tx.status = 'settled';
      tx.settled_at = new Date().toISOString();
    }, 2000);

    const newBalance = getBalance(account.id);
    res.status(201).json({ transaction: tx, new_balance: (newBalance / 100).toFixed(2), estimated_arrival: '1-3 business days' });
  } catch (e) {
    res.status(500).json({ error: 'Payout failed', detail: e.message });
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
      invariant_check: totalCredits >= totalDebits ? 'PASS' : 'FAIL',
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
    timestamp: new Date().toISOString(),
    db: {
      users: db.users.size,
      accounts: db.accounts.size,
      transactions: db.transactions.size,
      ledger_entries: db.ledgerEntries.length,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// SERVE FRONTEND
// ─────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

(async () => {
  await seed();
  app.listen(PORT, () => {
    console.log(`🚀 HPay Backend running → http://localhost:${PORT}`);
    console.log(`🏥 Health check      → http://localhost:${PORT}/api/health`);
    console.log(`📱 Wallet UI         → http://localhost:${PORT}\n`);
  });
})();
