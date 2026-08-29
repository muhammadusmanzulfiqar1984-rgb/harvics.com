/**
 * HPay local backend — JWT auth · double-entry ledger · payment state machine
 * In-memory store (swap for Postgres later). No Gemini / cloud LLM.
 */

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Express, NextFunction, Request, Response } from "express";

export const JWT_SECRET =
  process.env.JWT_SECRET || "hpay-prototype-2026-secret";

export type JwtUser = { id: string; email: string; hpay_id: string };

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

type User = {
  id: string;
  hpay_id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  status: string;
  kyc_status: string;
  kyc_tier: number;
  mfa_enabled: boolean;
  created_at: string;
};

type Account = {
  id: string;
  user_id: string;
  type: string;
  currency: string;
  status: string;
  created_at: string;
};

type LedgerEntry = {
  id: string;
  transaction_id: string;
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  currency: string;
  description: string;
  created_at: string;
};

type Tx = {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  from_account_id: string | null;
  to_account_id: string | null;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  settled_at?: string;
};

type Payment = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  merchant_name: string;
  description: string;
  user_id: string;
  account_id: string;
  capture_method: string;
  risk_score: number;
  events: { status: string; timestamp: string }[];
  created_at: string;
  updated_at: string;
  transaction_id?: string;
  settled_at?: string;
  cancelled_at?: string;
  refund_transaction_id?: string;
  refunded_at?: string;
  failure_code?: string;
};

const db = {
  users: new Map<string, User>(),
  usersByEmail: new Map<string, User>(),
  usersByHPayId: new Map<string, User>(),
  accounts: new Map<string, Account>(),
  ledgerEntries: [] as LedgerEntry[],
  transactions: new Map<string, Tx>(),
  payments: new Map<string, Payment>(),
  refreshTokens: new Set<string>(),
};

const id = () => randomUUID();
const ref = () =>
  `HP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

export const getBalance = (accountId: string) => {
  let c = 0;
  let d = 0;
  for (const e of db.ledgerEntries) {
    if (e.account_id !== accountId) continue;
    if (e.entry_type === "credit") c += e.amount;
    else d += e.amount;
  }
  return c - d;
};

const postLedger = (
  txId: string,
  fromId: string | null,
  toId: string | null,
  amount: number,
  currency: string,
  description: string
) => {
  const now = new Date().toISOString();
  if (fromId) {
    db.ledgerEntries.push({
      id: id(),
      transaction_id: txId,
      account_id: fromId,
      entry_type: "debit",
      amount,
      currency,
      description,
      created_at: now,
    });
  }
  if (toId) {
    db.ledgerEntries.push({
      id: id(),
      transaction_id: txId,
      account_id: toId,
      entry_type: "credit",
      amount,
      currency,
      description,
      created_at: now,
    });
  }
};

const createAccount = (userId: string, type = "consumer_wallet", currency = "USD") => {
  const a: Account = {
    id: id(),
    user_id: userId,
    type,
    currency,
    status: "active",
    created_at: new Date().toISOString(),
  };
  db.accounts.set(a.id, a);
  return a;
};

const accountsOf = (userId: string) =>
  Array.from(db.accounts.values()).filter((a) => a.user_id === userId);

const primary = (userId: string) => {
  const list = accountsOf(userId);
  return list.find((a) => a.type === "consumer_wallet") || list[0];
};

const TRANSITIONS: Record<string, string[]> = {
  created: ["initiated", "cancelled", "expired"],
  initiated: ["authenticated", "failed", "expired"],
  authenticated: ["authorized", "failed"],
  authorized: ["processing", "cancelled"],
  processing: ["settled", "failed"],
  settled: ["refunded", "partially_refunded", "disputed"],
  disputed: ["chargeback", "settled"],
};

const transition = (p: Payment, to: string) => {
  if (!(TRANSITIONS[p.status] || []).includes(to)) {
    throw new Error(`Invalid transition: ${p.status} → ${to}`);
  }
  p.status = to;
  p.updated_at = new Date().toISOString();
  p.events.push({ status: to, timestamp: p.updated_at });
};

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user || typeof user === "string") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user as JwtUser;
    next();
  });
};

async function addUser(
  hpay_id: string,
  name: string,
  email: string,
  password: string,
  kyc_tier: number
) {
  const user: User = {
    id: id(),
    hpay_id,
    name,
    email,
    phone: null,
    password_hash: await bcrypt.hash(password, 10),
    status: "active",
    kyc_status: "approved",
    kyc_tier,
    mfa_enabled: false,
    created_at: new Date().toISOString(),
  };
  db.users.set(user.id, user);
  db.usersByEmail.set(email, user);
  db.usersByHPayId.set(hpay_id, user);
  return user;
}

export async function seedHPayDb() {
  db.users.clear();
  db.usersByEmail.clear();
  db.usersByHPayId.clear();
  db.accounts.clear();
  db.ledgerEntries.length = 0;
  db.transactions.clear();
  db.payments.clear();
  db.refreshTokens.clear();

  const u1 = await addUser("@mian", "Mian Usman", "demo@hpay.com", "demo1234", 2);
  const u2 = await addUser("@ahmed", "Ahmed Khan", "ahmed@hpay.com", "demo1234", 1);
  await addUser("@sara", "Sara Malik", "sara@hpay.com", "demo1234", 1);
  const uH = await addUser(
    "@harvics",
    "Harvics Marketplace",
    "marketplace@harvics.com",
    "demo1234",
    2
  );

  const a1 = createAccount(u1.id);
  const a2 = createAccount(u2.id);
  createAccount((await db.usersByHPayId.get("@sara")!).id);
  createAccount(uH.id, "merchant_payable");

  const open = (accountId: string, cents: number, daysAgo: number) => {
    const txId = id();
    const tx: Tx = {
      id: txId,
      reference: ref(),
      type: "adjustment",
      status: "settled",
      amount: cents,
      currency: "USD",
      from_account_id: null,
      to_account_id: accountId,
      description: "Account opening credit",
      created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    };
    db.transactions.set(txId, tx);
    postLedger(txId, null, accountId, cents, "USD", tx.description);
  };
  open(a1.id, 1248000, 60);
  open(a2.id, 320000, 30);

  const history = [
    { desc: "Harvics Marketplace", amount: -25000, type: "payment", days: 1 },
    { desc: "Payment from @ahmed", amount: 80000, type: "transfer", days: 2 },
    { desc: "Food Delivery", amount: -3200, type: "payment", days: 3 },
    { desc: "Client Payment", amount: 250000, type: "transfer", days: 7 },
    { desc: "Transfer to @sara", amount: -50000, type: "transfer", days: 16 },
  ];
  for (const h of history) {
    const abs = Math.abs(h.amount);
    const credit = h.amount > 0;
    const txId = id();
    const tx: Tx = {
      id: txId,
      reference: ref(),
      type: h.type,
      status: "settled",
      amount: abs,
      currency: "USD",
      from_account_id: credit ? null : a1.id,
      to_account_id: credit ? a1.id : null,
      description: h.desc,
      created_at: new Date(Date.now() - h.days * 86400000).toISOString(),
    };
    db.transactions.set(txId, tx);
    postLedger(txId, tx.from_account_id, tx.to_account_id, abs, "USD", h.desc);
  }

  console.log("✅ HPay seeded — demo@hpay.com / demo1234 (@mian)");
}

export function harveyFromLedger(prompt: string) {
  const mian = db.usersByHPayId.get("@mian");
  const account = mian ? primary(mian.id) : null;
  const bal = account ? getBalance(account.id) / 100 : 0;
  const q = (prompt || "").toLowerCase();

  if (/\b(pay|send|transfer)\b/.test(q) && /\$|\d/.test(q)) {
    const m = q.match(/(?:pay|send)\s+.*?\$?\s*([\d,]+(?:\.\d+)?)/i);
    const amount = m ? Number(String(m[1]).replace(/,/g, "")) : 18000;
    return {
      reply:
        "I've prepared the payment for review. Harvey cannot execute transfers — confirm in Pay.",
      actionPrepared: {
        recipient: "Ahmed Khan (@ahmed)",
        amount,
        currency: "USD",
        fee: 0,
        total: amount,
      },
    };
  }

  if (q.includes("escrow")) {
    return {
      reply:
        "Escrow is on the Trade Escrow screen (V2). Wallet ledger transfers are live now.",
      actionPrepared: null as null,
    };
  }

  return {
    reply: `Cash position for @mian (ledger-derived): USD **$${bal.toLocaleString()}**. Ask about transfers, or prepare a payment for review.`,
    actionPrepared: null as null,
  };
}

export function mountHPayApi(app: Express) {
  app.post("/api/v1/auth/register", async (req, res) => {
    try {
      const { name, email, phone, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password required" });
      }
      if (db.usersByEmail.has(email)) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const hpay_id = `@${String(name)
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")}${Math.floor(Math.random() * 999)}`;
      const user = await addUser(hpay_id, name, email, password, 0);
      user.kyc_status = "not_started";
      user.phone = phone || null;
      createAccount(user.id);
      const access_token = jwt.sign(
        { id: user.id, email, hpay_id: user.hpay_id },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      const refresh_token = id();
      db.refreshTokens.add(refresh_token);
      const { password_hash: _, ...safe } = user;
      res.status(201).json({ access_token, refresh_token, user: safe });
    } catch (e) {
      res.status(500).json({
        error: "Registration failed",
        detail: e instanceof Error ? e.message : "unknown",
      });
    }
  });

  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const user = db.usersByEmail.get(email);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const access_token = jwt.sign(
        { id: user.id, email: user.email, hpay_id: user.hpay_id },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      const refresh_token = id();
      db.refreshTokens.add(refresh_token);
      const { password_hash: _, ...safe } = user;
      res.json({ access_token, refresh_token, user: safe });
    } catch {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/v1/auth/me", auth, (req, res) => {
    const user = db.users.get(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash: _, ...safe } = user;
    res.json(safe);
  });

  app.post("/api/v1/auth/logout", auth, (req, res) => {
    const { refresh_token } = req.body || {};
    if (refresh_token) db.refreshTokens.delete(refresh_token);
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/v1/accounts", auth, (req, res) => {
    res.json({
      accounts: accountsOf(req.user!.id).map((a) => ({
        ...a,
        balance_cents: getBalance(a.id),
        balance: (getBalance(a.id) / 100).toFixed(2),
      })),
    });
  });

  app.get("/api/v1/accounts/balances", auth, (req, res) => {
    const balances: Record<string, number> = { USD: 0, AED: 0, PKR: 0, EUR: 0 };
    for (const a of accountsOf(req.user!.id)) {
      balances[a.currency] = getBalance(a.id) / 100;
    }
    res.json({ hpayId: req.user!.hpay_id, balances, unit: "major" });
  });

  app.get("/api/v1/transactions", auth, (req, res) => {
    const account = primary(req.user!.id);
    if (!account) return res.json({ data: [] });
    const limit = Math.min(Number(req.query.limit || 50), 100);
    const data = db.ledgerEntries
      .filter((e) => e.account_id === account.id)
      .map((e) => {
        const tx = db.transactions.get(e.transaction_id);
        return {
          id: tx?.id || e.transaction_id,
          reference: tx?.reference || e.id,
          type: tx?.type || "adjustment",
          status: (tx?.status || "settled").toUpperCase(),
          amount: e.amount / 100,
          currency: e.currency,
          fee: 0,
          settlementAmount: e.amount / 100,
          fromHPayId:
            e.entry_type === "debit" ? req.user!.hpay_id : "EXTERNAL",
          toHPayId:
            e.entry_type === "credit" ? req.user!.hpay_id : tx?.description || "EXTERNAL",
          memo: tx?.description || e.description,
          createdAt: e.created_at,
          updatedAt: e.created_at,
          ledgerEntries: [
            {
              id: e.id,
              accountId: e.account_id,
              entryType: e.entry_type,
              amount: e.amount / 100,
              currency: e.currency,
              description: e.description,
              createdAt: e.created_at,
            },
          ],
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
    res.json({ data });
  });

  app.post("/api/v1/transfers", auth, (req, res) => {
    try {
      const body = req.body || {};
      const to_hpay_id = body.to_hpay_id || body.toHPayId;
      const amount = body.amount;
      const description = body.description || body.memo;
      if (!to_hpay_id || amount == null) {
        return res.status(400).json({ error: "Recipient and amount required" });
      }
      const cents = Math.round(Number(amount) * 100);
      if (cents <= 0) return res.status(400).json({ error: "Amount must be positive" });

      const senderAcc = primary(req.user!.id);
      if (!senderAcc) return res.status(400).json({ error: "No account" });
      if (getBalance(senderAcc.id) < cents) {
        return res.status(400).json({ error: "Insufficient balance", code: "INSUFFICIENT_FUNDS" });
      }
      const recipient = db.usersByHPayId.get(String(to_hpay_id));
      if (!recipient) return res.status(404).json({ error: `User ${to_hpay_id} not found` });
      if (recipient.id === req.user!.id) {
        return res.status(400).json({ error: "Cannot transfer to yourself" });
      }
      const recipientAcc = primary(recipient.id);
      if (!recipientAcc) return res.status(400).json({ error: "Recipient has no account" });

      const sender = db.users.get(req.user!.id)!;
      const txId = id();
      const tx: Tx = {
        id: txId,
        reference: ref(),
        type: "transfer",
        status: "settled",
        amount: cents,
        currency: senderAcc.currency,
        from_account_id: senderAcc.id,
        to_account_id: recipientAcc.id,
        description: description || `Transfer to ${to_hpay_id}`,
        metadata: {
          to_hpay_id,
          from_hpay_id: sender.hpay_id,
          to_name: recipient.name,
        },
        created_at: new Date().toISOString(),
      };
      db.transactions.set(txId, tx);
      postLedger(txId, senderAcc.id, recipientAcc.id, cents, senderAcc.currency, tx.description);

      res.status(201).json({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        status: "SETTLED",
        amount: cents / 100,
        currency: tx.currency,
        fee: 0,
        settlementAmount: cents / 100,
        fromHPayId: sender.hpay_id,
        toHPayId: recipient.hpay_id,
        memo: tx.description,
        createdAt: tx.created_at,
        updatedAt: tx.created_at,
        new_balance: (getBalance(senderAcc.id) / 100).toFixed(2),
        recipient: { hpay_id: recipient.hpay_id, name: recipient.name },
        ledgerEntries: db.ledgerEntries
          .filter((e) => e.transaction_id === txId)
          .map((e) => ({
            id: e.id,
            accountId: e.account_id,
            entryType: e.entry_type,
            amount: e.amount / 100,
            currency: e.currency,
            description: e.description,
            createdAt: e.created_at,
          })),
      });
    } catch (e) {
      res.status(500).json({
        error: "Transfer failed",
        detail: e instanceof Error ? e.message : "unknown",
      });
    }
  });

  app.post("/api/v1/payments", auth, (req, res) => {
    try {
      const {
        amount,
        currency = "USD",
        description,
        merchant_name,
        capture_method = "automatic",
      } = req.body || {};
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount required" });
      }
      const cents = Math.round(Number(amount) * 100);
      const account = primary(req.user!.id);
      if (!account) return res.status(400).json({ error: "No account" });
      if (getBalance(account.id) < cents) {
        return res.status(400).json({ error: "Insufficient balance", code: "INSUFFICIENT_FUNDS" });
      }
      const payment: Payment = {
        id: id(),
        reference: ref(),
        status: "created",
        amount: cents,
        currency,
        merchant_name: merchant_name || "HPay Merchant",
        description: description || "Payment",
        user_id: req.user!.id,
        account_id: account.id,
        capture_method,
        risk_score: Math.floor(Math.random() * 25),
        events: [{ status: "created", timestamp: new Date().toISOString() }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.payments.set(payment.id, payment);
      res.status(201).json({ payment });
    } catch (e) {
      res.status(500).json({
        error: "Payment creation failed",
        detail: e instanceof Error ? e.message : "unknown",
      });
    }
  });

  app.post("/api/v1/payments/:id/confirm", auth, (req, res) => {
    try {
      const payment = db.payments.get(req.params.id);
      if (!payment || payment.user_id !== req.user!.id) {
        return res.status(404).json({ error: "Payment not found" });
      }
      transition(payment, "initiated");
      transition(payment, "authenticated");
      transition(payment, "authorized");
      transition(payment, "processing");
      if (getBalance(payment.account_id) < payment.amount) {
        transition(payment, "failed");
        payment.failure_code = "INSUFFICIENT_FUNDS";
        return res.status(400).json({ error: "Insufficient balance", payment });
      }
      const txId = id();
      const tx: Tx = {
        id: txId,
        reference: ref(),
        type: "payment",
        status: "settled",
        amount: payment.amount,
        currency: payment.currency,
        from_account_id: payment.account_id,
        to_account_id: null,
        description: `${payment.merchant_name} — ${payment.description}`,
        metadata: { payment_id: payment.id },
        created_at: new Date().toISOString(),
      };
      db.transactions.set(txId, tx);
      postLedger(
        txId,
        payment.account_id,
        null,
        payment.amount,
        payment.currency,
        tx.description
      );
      transition(payment, "settled");
      payment.transaction_id = txId;
      payment.settled_at = new Date().toISOString();
      res.json({
        payment,
        transaction: tx,
        new_balance: (getBalance(payment.account_id) / 100).toFixed(2),
      });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "failed" });
    }
  });

  app.post("/api/v1/topups", auth, (req, res) => {
    try {
      const { amount, currency = "USD", memo } = req.body || {};
      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: "Valid amount required" });
      }
      const cents = Math.round(Number(amount) * 100);
      const account = primary(req.user!.id);
      if (!account) return res.status(400).json({ error: "No account" });
      const txId = id();
      const tx: Tx = {
        id: txId,
        reference: ref(),
        type: "topup",
        status: "settled",
        amount: cents,
        currency,
        from_account_id: null,
        to_account_id: account.id,
        description: memo || "Add money via licensed partner (simulated)",
        metadata: { partner: "local_psp_sim" },
        created_at: new Date().toISOString(),
      };
      db.transactions.set(txId, tx);
      postLedger(txId, null, account.id, cents, currency, tx.description);
      res.status(201).json({
        id: tx.id,
        reference: tx.reference,
        status: "SETTLED",
        amount: cents / 100,
        currency,
        fromHPayId: "PARTNER_RAIL",
        toHPayId: req.user!.hpay_id,
        memo: tx.description,
        createdAt: tx.created_at,
        updatedAt: tx.created_at,
        fee: 0,
        settlementAmount: cents / 100,
        ledgerEntries: [],
      });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "topup failed" });
    }
  });

  app.get("/api/v1/users/search", auth, (req, res) => {
    const q = String(req.query.q || "");
    if (q.length < 2) return res.json({ users: [] });
    res.json({
      users: Array.from(db.users.values())
        .filter(
          (u) =>
            u.id !== req.user!.id &&
            (u.hpay_id.includes(q.toLowerCase()) ||
              u.name.toLowerCase().includes(q.toLowerCase()))
        )
        .slice(0, 5)
        .map((u) => ({
          id: u.id,
          hpay_id: u.hpay_id,
          name: u.name,
          kyc_tier: u.kyc_tier,
        })),
    });
  });

  app.get("/api/v1/ledger", auth, (req, res) => {
    const ids = new Set(accountsOf(req.user!.id).map((a) => a.id));
    const entries = db.ledgerEntries
      .filter((e) => ids.has(e.account_id))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    res.json({ entries, total: entries.length });
  });

  app.post("/api/v1/admin/reset-ledger", async (_req, res) => {
    await seedHPayDb();
    res.json({
      ok: true,
      users: db.users.size,
      accounts: db.accounts.size,
      transactions: db.transactions.size,
      ledger_entries: db.ledgerEntries.length,
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      version: "1.0.0-prototype",
      harvey: "local",
      timestamp: new Date().toISOString(),
      db: {
        users: db.users.size,
        accounts: db.accounts.size,
        transactions: db.transactions.size,
        ledger_entries: db.ledgerEntries.length,
      },
    });
  });
}
