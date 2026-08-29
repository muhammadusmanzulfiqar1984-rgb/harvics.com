/**
 * HPay Bank DB — durable SQLite double-entry ledger
 *
 * LAW: Balance is NEVER stored. Only ledger_entries (debit/credit) rows.
 * Balance = SUM(credits) − SUM(debits) per account_id.
 *
 * Storage: data/hpay-bank.sqlite (override via HPAY_BANK_DB_PATH)
 * Backups: data/backups/hpay-bank-<timestamp>.sqlite
 */

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function resolveDbPath() {
  const raw = process.env.HPAY_BANK_DB_PATH || path.join(__dirname, '..', 'data', 'hpay-bank.sqlite');
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function createBankDb(options = {}) {
  const dbPath = options.path || resolveDbPath();
  ensureDir(dbPath);

  const sql = new DatabaseSync(dbPath);
  sql.exec('PRAGMA journal_mode = WAL;');
  sql.exec('PRAGMA foreign_keys = ON;');
  sql.exec('PRAGMA synchronous = NORMAL;');

  sql.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      hpay_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      status TEXT,
      kyc_status TEXT,
      kyc_tier INTEGER DEFAULT 0,
      mfa_enabled INTEGER DEFAULT 0,
      created_at TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL,
      status TEXT,
      created_at TEXT,
      payload_json TEXT NOT NULL
      -- NO balance column (ledger-derived only)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      reference TEXT,
      type TEXT,
      status TEXT,
      amount INTEGER,
      currency TEXT,
      from_account_id TEXT,
      to_account_id TEXT,
      description TEXT,
      created_at TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_entries(account_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_tx ON ledger_entries(transaction_id);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT,
      created_at TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT,
      created_at TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS merchant_outlets (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      status TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales_ticks (
      id TEXT PRIMARY KEY,
      hour TEXT,
      timestamp TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS passkeys (
      credential_id TEXT PRIMARY KEY,
      user_id TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS passkey_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      expires_at TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS passkey_assertions (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const stmts = {
    upsertUser: sql.prepare(`
      INSERT INTO users (id, hpay_id, email, name, phone, password_hash, status, kyc_status, kyc_tier, mfa_enabled, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        hpay_id=excluded.hpay_id, email=excluded.email, name=excluded.name, phone=excluded.phone,
        password_hash=excluded.password_hash, status=excluded.status, kyc_status=excluded.kyc_status,
        kyc_tier=excluded.kyc_tier, mfa_enabled=excluded.mfa_enabled, created_at=excluded.created_at,
        payload_json=excluded.payload_json
    `),
    upsertAccount: sql.prepare(`
      INSERT INTO accounts (id, user_id, type, currency, status, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id=excluded.user_id, type=excluded.type, currency=excluded.currency,
        status=excluded.status, created_at=excluded.created_at, payload_json=excluded.payload_json
    `),
    upsertTransaction: sql.prepare(`
      INSERT INTO transactions (id, reference, type, status, amount, currency, from_account_id, to_account_id, description, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        reference=excluded.reference, type=excluded.type, status=excluded.status, amount=excluded.amount,
        currency=excluded.currency, from_account_id=excluded.from_account_id, to_account_id=excluded.to_account_id,
        description=excluded.description, created_at=excluded.created_at, payload_json=excluded.payload_json
    `),
    insertLedger: sql.prepare(`
      INSERT OR REPLACE INTO ledger_entries
      (id, transaction_id, account_id, entry_type, amount, currency, description, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    upsertPayment: sql.prepare(`
      INSERT INTO payments (id, user_id, status, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, status=excluded.status,
        created_at=excluded.created_at, payload_json=excluded.payload_json
    `),
    upsertPayout: sql.prepare(`
      INSERT INTO payouts (id, user_id, status, created_at, payload_json)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, status=excluded.status,
        created_at=excluded.created_at, payload_json=excluded.payload_json
    `),
    upsertMerchant: sql.prepare(`
      INSERT INTO merchants (id, payload_json) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json
    `),
    upsertOutlet: sql.prepare(`
      INSERT INTO merchant_outlets (id, merchant_id, status, payload_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET merchant_id=excluded.merchant_id, status=excluded.status,
        payload_json=excluded.payload_json
    `),
    upsertSalesTick: sql.prepare(`
      INSERT INTO sales_ticks (id, hour, timestamp, payload_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET hour=excluded.hour, timestamp=excluded.timestamp,
        payload_json=excluded.payload_json
    `),
    upsertPasskey: sql.prepare(`
      INSERT INTO passkeys (credential_id, user_id, payload_json) VALUES (?, ?, ?)
      ON CONFLICT(credential_id) DO UPDATE SET user_id=excluded.user_id, payload_json=excluded.payload_json
    `),
    upsertChallenge: sql.prepare(`
      INSERT INTO passkey_challenges (id, user_id, expires_at, payload_json) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id, expires_at=excluded.expires_at,
        payload_json=excluded.payload_json
    `),
    upsertAssertion: sql.prepare(`
      INSERT INTO passkey_assertions (id, payload_json) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json
    `),
    insertRefresh: sql.prepare(`INSERT OR IGNORE INTO refresh_tokens (token) VALUES (?)`),
    deleteRefresh: sql.prepare(`DELETE FROM refresh_tokens WHERE token = ?`),
    setMeta: sql.prepare(`INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`),
    getMeta: sql.prepare(`SELECT value FROM meta WHERE key = ?`),
    balance: sql.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) AS balance
      FROM ledger_entries
      WHERE account_id = ?
    `),
    countUsers: sql.prepare(`SELECT COUNT(*) AS c FROM users`),
  };

  function j(obj) {
    return JSON.stringify(obj);
  }

  function parseRow(row) {
    if (!row) return null;
    try {
      return JSON.parse(row.payload_json);
    } catch {
      return null;
    }
  }

  const api = {
    path: dbPath,
    sql,

    isEmpty() {
      return Number(stmts.countUsers.get()?.c || 0) === 0;
    },

    /** Ledger-derived balance — never a stored column */
    getBalance(accountId) {
      const row = stmts.balance.get(accountId);
      return Number(row?.balance || 0);
    },

    upsertUser(user) {
      stmts.upsertUser.run(
        user.id,
        user.hpay_id,
        user.email,
        user.name,
        user.phone || null,
        user.password_hash,
        user.status || 'active',
        user.kyc_status || null,
        user.kyc_tier || 0,
        user.mfa_enabled ? 1 : 0,
        user.created_at || null,
        j(user)
      );
    },

    upsertAccount(account) {
      stmts.upsertAccount.run(
        account.id,
        account.user_id,
        account.type,
        account.currency,
        account.status || 'active',
        account.created_at || null,
        j(account)
      );
    },

    upsertTransaction(tx) {
      stmts.upsertTransaction.run(
        tx.id,
        tx.reference || null,
        tx.type || null,
        tx.status || null,
        tx.amount ?? null,
        tx.currency || null,
        tx.from_account_id || null,
        tx.to_account_id || null,
        tx.description || null,
        tx.created_at || null,
        j(tx)
      );
    },

    insertLedgerEntry(entry) {
      stmts.insertLedger.run(
        entry.id,
        entry.transaction_id,
        entry.account_id,
        entry.entry_type,
        entry.amount,
        entry.currency,
        entry.description || null,
        entry.created_at,
        j(entry)
      );
    },

    upsertPayment(p) {
      stmts.upsertPayment.run(p.id, p.user_id || null, p.status || null, p.created_at || null, j(p));
    },

    upsertPayout(p) {
      stmts.upsertPayout.run(p.id, p.user_id || null, p.status || null, p.created_at || null, j(p));
    },

    upsertMerchant(m) {
      stmts.upsertMerchant.run(m.id, j(m));
    },

    upsertOutlet(o) {
      stmts.upsertOutlet.run(o.id, o.merchant_id || null, o.status || null, j(o));
    },

    upsertSalesTick(t) {
      stmts.upsertSalesTick.run(t.id, t.hour || null, t.timestamp || null, j(t));
    },

    upsertPasskey(p) {
      const cid = p.credentialId || p.credential_id;
      stmts.upsertPasskey.run(cid, p.userId || p.user_id || null, j(p));
    },

    upsertChallenge(c) {
      stmts.upsertChallenge.run(c.id || c.challengeId, c.userId || c.user_id || null, c.expiresAt || c.expires_at || null, j(c));
    },

    deleteChallenge(id) {
      sql.prepare('DELETE FROM passkey_challenges WHERE id = ?').run(id);
    },

    upsertAssertion(a) {
      stmts.upsertAssertion.run(a.id || a.assertionId, j(a));
    },

    addRefreshToken(token) {
      stmts.insertRefresh.run(token);
    },

    removeRefreshToken(token) {
      stmts.deleteRefresh.run(token);
    },

    setMeta(key, value) {
      stmts.setMeta.run(key, String(value));
    },

    getMeta(key) {
      return stmts.getMeta.get(key)?.value ?? null;
    },

    /**
     * Copy DB file to data/backups/ for disaster recovery.
     */
    backup(reason = 'manual') {
      const backupDir = path.join(path.dirname(dbPath), 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dest = path.join(backupDir, `hpay-bank-${stamp}-${reason}.sqlite`);
      // Checkpoint WAL so backup is consistent
      try {
        sql.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      } catch {
        /* ignore */
      }
      fs.copyFileSync(dbPath, dest);
      // Keep last 10 backups
      const files = fs
        .readdirSync(backupDir)
        .filter((f) => f.startsWith('hpay-bank-') && f.endsWith('.sqlite'))
        .map((f) => ({ f, m: fs.statSync(path.join(backupDir, f)).mtimeMs }))
        .sort((a, b) => b.m - a.m);
      for (const old of files.slice(10)) {
        try {
          fs.unlinkSync(path.join(backupDir, old.f));
        } catch {
          /* ignore */
        }
      }
      api.setMeta('last_backup', dest);
      return dest;
    },

    wipe() {
      sql.exec(`
        DELETE FROM ledger_entries;
        DELETE FROM transactions;
        DELETE FROM payments;
        DELETE FROM payouts;
        DELETE FROM accounts;
        DELETE FROM users;
        DELETE FROM merchants;
        DELETE FROM merchant_outlets;
        DELETE FROM sales_ticks;
        DELETE FROM passkeys;
        DELETE FROM passkey_challenges;
        DELETE FROM passkey_assertions;
        DELETE FROM refresh_tokens;
      `);
    },

    /**
     * Load SQLite → in-memory Maps/arrays used by server.cjs
     */
    hydrate(memory) {
      memory.users.clear();
      memory.usersByEmail.clear();
      memory.usersByHPayId.clear();
      memory.accounts.clear();
      memory.transactions.clear();
      memory.payments.clear();
      memory.payouts.clear();
      memory.merchants.clear();
      memory.merchantOutlets.clear();
      memory.passkeys.clear();
      memory.passkeyChallenges.clear();
      memory.passkeyAssertions.clear();
      memory.refreshTokens.clear();
      memory.ledgerEntries.length = 0;
      memory.salesTicks.length = 0;

      for (const row of sql.prepare('SELECT payload_json FROM users').all()) {
        const u = parseRow(row);
        if (!u) continue;
        memory.users.set(u.id, u);
        memory.usersByEmail.set(u.email, u);
        memory.usersByHPayId.set(u.hpay_id, u);
      }
      for (const row of sql.prepare('SELECT payload_json FROM accounts').all()) {
        const a = parseRow(row);
        if (a) memory.accounts.set(a.id, a);
      }
      for (const row of sql.prepare('SELECT payload_json FROM transactions').all()) {
        const t = parseRow(row);
        if (t) memory.transactions.set(t.id, t);
      }
      for (const row of sql.prepare(
        'SELECT payload_json FROM ledger_entries ORDER BY created_at ASC, id ASC'
      ).all()) {
        const e = parseRow(row);
        if (e) memory.ledgerEntries.push(e);
      }
      for (const row of sql.prepare('SELECT payload_json FROM payments').all()) {
        const p = parseRow(row);
        if (p) memory.payments.set(p.id, p);
      }
      for (const row of sql.prepare('SELECT payload_json FROM payouts').all()) {
        const p = parseRow(row);
        if (p) memory.payouts.set(p.id, p);
      }
      for (const row of sql.prepare('SELECT payload_json FROM merchants').all()) {
        const m = parseRow(row);
        if (m) memory.merchants.set(m.id, m);
      }
      for (const row of sql.prepare('SELECT payload_json FROM merchant_outlets').all()) {
        const o = parseRow(row);
        if (o) memory.merchantOutlets.set(o.id, o);
      }
      for (const row of sql.prepare(
        'SELECT payload_json FROM sales_ticks ORDER BY timestamp ASC'
      ).all()) {
        const t = parseRow(row);
        if (t) memory.salesTicks.push(t);
      }
      for (const row of sql.prepare('SELECT credential_id, payload_json FROM passkeys').all()) {
        const p = parseRow(row);
        if (p) memory.passkeys.set(row.credential_id, p);
      }
      for (const row of sql.prepare('SELECT id, payload_json FROM passkey_challenges').all()) {
        const c = parseRow(row);
        if (c) memory.passkeyChallenges.set(row.id, c);
      }
      for (const row of sql.prepare('SELECT id, payload_json FROM passkey_assertions').all()) {
        const a = parseRow(row);
        if (a) memory.passkeyAssertions.set(row.id, a);
      }
      for (const row of sql.prepare('SELECT token FROM refresh_tokens').all()) {
        memory.refreshTokens.add(row.token);
      }

      return {
        users: memory.users.size,
        accounts: memory.accounts.size,
        ledger_entries: memory.ledgerEntries.length,
        transactions: memory.transactions.size,
      };
    },

    /**
     * Patch memory Maps/arrays so every mutation write-through to SQLite.
     */
    enableWriteThrough(memory) {
      wrapMapSet(memory.users, (user) => api.upsertUser(user));
      wrapMapSet(memory.accounts, (account) => api.upsertAccount(account));
      wrapMapSet(memory.transactions, (tx) => api.upsertTransaction(tx));
      wrapMapSet(memory.payments, (p) => api.upsertPayment(p));
      wrapMapSet(memory.payouts, (p) => api.upsertPayout(p));
      wrapMapSet(memory.merchants, (m) => api.upsertMerchant(m));
      wrapMapSet(memory.merchantOutlets, (o) => api.upsertOutlet(o));
      wrapMapSet(memory.passkeys, (p) => api.upsertPasskey(p));
      wrapMapSet(memory.passkeyChallenges, (c, key) => {
        api.upsertChallenge({ ...c, id: c.id || key });
      });
      wrapMapSet(memory.passkeyAssertions, (a) => api.upsertAssertion(a));

      wrapMapDelete(memory.passkeyChallenges, (id) => api.deleteChallenge(id));

      const origPushLedger = memory.ledgerEntries.push.bind(memory.ledgerEntries);
      memory.ledgerEntries.push = (...items) => {
        const n = origPushLedger(...items);
        for (const item of items) api.insertLedgerEntry(item);
        return n;
      };

      const origPushSales = memory.salesTicks.push.bind(memory.salesTicks);
      memory.salesTicks.push = (...items) => {
        const n = origPushSales(...items);
        for (const item of items) api.upsertSalesTick(item);
        return n;
      };

      const origAdd = memory.refreshTokens.add.bind(memory.refreshTokens);
      memory.refreshTokens.add = (token) => {
        const r = origAdd(token);
        api.addRefreshToken(token);
        return r;
      };
      const origDelete = memory.refreshTokens.delete.bind(memory.refreshTokens);
      memory.refreshTokens.delete = (token) => {
        const r = origDelete(token);
        api.removeRefreshToken(token);
        return r;
      };
    },

    stats() {
      return {
        path: dbPath,
        users: Number(stmts.countUsers.get()?.c || 0),
        accounts: Number(sql.prepare('SELECT COUNT(*) AS c FROM accounts').get()?.c || 0),
        ledger_entries: Number(sql.prepare('SELECT COUNT(*) AS c FROM ledger_entries').get()?.c || 0),
        transactions: Number(sql.prepare('SELECT COUNT(*) AS c FROM transactions').get()?.c || 0),
        last_backup: api.getMeta('last_backup'),
      };
    },

    close() {
      sql.close();
    },
  };

  return api;
}

function wrapMapSet(map, onSet) {
  const orig = map.set.bind(map);
  map.set = (key, value) => {
    const r = orig(key, value);
    try {
      onSet(value, key);
    } catch (e) {
      console.error('[bankDb] write-through failed:', e.message);
    }
    return r;
  };
}

function wrapMapDelete(map, onDelete) {
  const orig = map.delete.bind(map);
  map.delete = (key) => {
    const r = orig(key);
    try {
      onDelete(key);
    } catch (e) {
      console.error('[bankDb] delete-through failed:', e.message);
    }
    return r;
  };
}

module.exports = { createBankDb, resolveDbPath };
