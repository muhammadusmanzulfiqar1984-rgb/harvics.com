/**
 * HPay production API client
 * — JWT + refresh token in memory only (never localStorage)
 * — All money paths hit /api/v1 (ledger-derived balances only)
 */

const DEFAULT_BASE = import.meta.env.PROD ? '/api/v1' : 'http://localhost:3001/api/v1';
const DEFAULT_ORIGIN = import.meta.env.PROD ? '' : 'http://localhost:3001';

export class HPayApiError extends Error {
  status: number;
  code?: string;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'HPayApiError';
    this.status = status;
    this.body = body;
    if (body && typeof body === 'object' && body !== null && 'code' in body) {
      this.code = String((body as { code?: string }).code || '');
    }
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  hpay_id: string;
  phone?: string | null;
  status?: string;
  kyc_status?: string;
  kyc_tier?: number;
};

export type AccountRow = {
  id: string;
  user_id: string;
  type: string;
  currency: string;
  status: string;
  balance_cents: number;
  balance: string;
};

export type ApiTxRow = {
  id: string;
  transaction_id?: string;
  reference?: string;
  type?: string;
  description?: string;
  amount_cents: number;
  amount?: string;
  is_credit: boolean;
  currency: string;
  status?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type LedgerSummary = {
  total_entries: number;
  total_credits: string;
  total_debits: string;
  net: string;
  invariant_check: string;
};

export type PayoutRow = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  bank_name?: string;
  account_number?: string;
  description?: string;
  created_at: string;
  settled_at?: string;
  new_balance?: string;
};

export type PaymentRow = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  merchant_name?: string;
  description?: string;
  created_at: string;
  failure_code?: string;
};

type TransferResult = {
  transaction: {
    id: string;
    reference: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: { to_hpay_id?: string; from_hpay_id?: string; to_name?: string };
    created_at: string;
  };
  new_balance: string;
  recipient: { hpay_id: string; name: string };
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
let primaryAccountId: string | null = null;
let cachedUser: AuthUser | null = null;
let bootPromise: Promise<AuthUser | null> | null = null;

const SESSION_KEY = 'hpay_session_v1';

function persistSession() {
  try {
    if (!accessToken || !cachedUser) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        accessToken,
        refreshToken,
        user: cachedUser,
      })
    );
  } catch {
    /* ignore */
  }
}

function restoreSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as {
      accessToken?: string;
      refreshToken?: string | null;
      user?: AuthUser;
    };
    if (!data.accessToken || !data.user) return false;
    accessToken = data.accessToken;
    refreshToken = data.refreshToken || null;
    cachedUser = data.user;
    return true;
  } catch {
    return false;
  }
}

restoreSession();

function env(): Record<string, string | undefined> {
  return ((import.meta as ImportMeta & { env?: Record<string, string> }).env || {}) as Record<
    string,
    string | undefined
  >;
}

export function apiBase(): string {
  return (env().VITE_HPAY_API_BASE || DEFAULT_BASE).replace(/\/$/, '');
}

export function apiOrigin(): string {
  const base = apiBase();
  try {
    if (base.startsWith('/')) {
      if (typeof window !== 'undefined') return window.location.origin;
      return '';
    }
    return new URL(base).origin;
  } catch {
    if (typeof window !== 'undefined') return window.location.origin;
    return env().VITE_HPAY_ORIGIN || DEFAULT_ORIGIN || 'http://localhost:3001';
  }
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  if (extra) Object.assign(h, extra as Record<string, string>);
  return h;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    ...(authHeaders(init?.headers) as Record<string, string>),
  };
  // L5 — every money POST gets an idempotency key (caller may override)
  if (['POST', 'PUT', 'PATCH'].includes(method) && !headers['X-Idempotency-Key'] && !headers['x-idempotency-key']) {
    headers['X-Idempotency-Key'] =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });
  const data = await parseBody(res);

  if (res.status === 401 && !retried && path !== '/auth/login' && path !== '/auth/register' && path !== '/auth/signup') {
    clearSession();
  }

  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText || 'Request failed';
    throw new HPayApiError(msg, res.status, data);
  }

  return data as T;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getPrimaryAccountId(): string | null {
  return primaryAccountId;
}

export function getCachedUser(): AuthUser | null {
  return cachedUser;
}

export function clearSession(): void {
  accessToken = null;
  refreshToken = null;
  primaryAccountId = null;
  cachedUser = null;
  bootPromise = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: AuthUser; access_token: string; refresh_token?: string }> {
  const data = await request<{
    access_token: string;
    refresh_token?: string;
    user: AuthUser;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  accessToken = data.access_token;
  refreshToken = data.refresh_token || null;
  cachedUser = data.user;
  persistSession();
  return data;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  handle?: string;
}): Promise<{ user: AuthUser; access_token: string }> {
  const data = await request<{ access_token: string; refresh_token?: string; user: AuthUser }>(
    '/auth/signup',
    { method: 'POST', body: JSON.stringify(input) }
  );
  accessToken = data.access_token;
  refreshToken = data.refresh_token || null;
  cachedUser = data.user;
  persistSession();
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const user = await request<AuthUser>('/auth/me');
  cachedUser = user;
  persistSession();
  return user;
}

export async function logout(): Promise<void> {
  try {
    if (accessToken) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } finally {
    clearSession();
  }
}

/** Restore existing JWT session only — never auto-login as demo. */
export async function ensureSession(): Promise<AuthUser | null> {
  if (!accessToken) restoreSession();
  if (accessToken && cachedUser) {
    try {
      return await fetchMe();
    } catch {
      clearSession();
      return null;
    }
  }
  return null;
}

export async function fetchAccounts(): Promise<AccountRow[]> {
  const data = await request<{ accounts: AccountRow[] }>('/accounts');
  const accounts = data.accounts || [];
  const primary = accounts.find((a) => a.type === 'consumer_wallet') || accounts[0] || null;
  primaryAccountId = primary?.id || null;
  return accounts;
}

export async function fetchBalances(): Promise<{
  account_id: string;
  currency: string;
  balance_cents: number;
  balance: string;
  USD: number;
}> {
  return request('/accounts/balances');
}

/** Multi-currency ledger balances (USD, AED, USDC, USDT, e-USD, e-AED, BTC) */
export async function fetchMultiCurrencyBalances() {
  return request<{
    law: string;
    balances: Record<
      string,
      {
        currency: string;
        account_id: string | null;
        amount_minor: number;
        amount: string;
        available: string;
        pending: string;
        derived: boolean;
      }
    >;
    accounts: Array<{
      id: string;
      currency: string;
      type: string;
      balance_minor: number;
      balance: string;
    }>;
    as_of: string;
  }>('/balances');
}

export async function fetchLedgerReconciliation() {
  return request<{
    invariant_check: string;
    trial_balance: unknown[];
    global: unknown;
    metrics: unknown;
  }>('/ledger/reconciliation');
}

export async function createFastRailTransfer(input: {
  to_hpay_id: string;
  amount: number;
  currency?: string;
  rail?: 'internal' | 'cross_border';
  corridor?: string;
  description?: string;
  biometric_verified?: boolean;
  multi_sig_approved?: boolean;
  multi_sig_approvals?: number;
}) {
  const to = input.to_hpay_id.startsWith('@') ? input.to_hpay_id : `@${input.to_hpay_id}`;
  return request('/transfers/fastrail', {
    method: 'POST',
    body: JSON.stringify({ ...input, to_hpay_id: to }),
  });
}

export async function fetchAccountBalance(accountId: string) {
  return request<{
    account_id: string;
    balance_cents: number;
    balance: string;
    currency: string;
  }>(`/accounts/${accountId}/balance`);
}

export async function fetchAccountTransactions(
  accountId: string,
  opts?: { limit?: number; offset?: number; type?: string }
): Promise<ApiTxRow[]> {
  const q = new URLSearchParams();
  if (opts?.limit != null) q.set('limit', String(opts.limit));
  if (opts?.offset != null) q.set('offset', String(opts.offset));
  if (opts?.type) q.set('type', opts.type);
  const qs = q.toString() ? `?${q}` : '';
  const data = await request<{ transactions: ApiTxRow[] }>(
    `/accounts/${accountId}/transactions${qs}`
  );
  return data.transactions || [];
}

export async function fetchLedger(): Promise<{
  entries: unknown[];
  summary: LedgerSummary;
}> {
  return request('/ledger');
}

export async function createTransfer(input: {
  to_hpay_id: string;
  amount: number;
  description?: string;
  biometric_verified?: boolean;
  multi_sig_approved?: boolean;
  multi_sig_approvals?: number;
}): Promise<TransferResult> {
  const to = input.to_hpay_id.startsWith('@') ? input.to_hpay_id : `@${input.to_hpay_id}`;
  return request('/transfers', {
    method: 'POST',
    body: JSON.stringify({ ...input, to_hpay_id: to }),
  });
}

/** Canonical Add Money path — credits ledger via POST /deposits */
export async function createDeposit(
  amount: number,
  description?: string,
  clearance?: { biometric_verified?: boolean; multi_sig_approved?: boolean; multi_sig_approvals?: number }
) {
  return request<{
    transaction: { id: string; reference: string; amount: number; type?: string; created_at: string };
    new_balance: string;
  }>('/deposits', {
    method: 'POST',
    body: JSON.stringify({ amount, description, ...clearance }),
  });
}

/** @deprecated use createDeposit — kept as alias */
export async function createTopup(amount: number, description?: string) {
  return createDeposit(amount, description);
}

export async function createPayment(input: {
  amount: number;
  currency?: string;
  description?: string;
  merchant_name?: string;
}) {
  return request<{ payment: PaymentRow }>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getPayment(id: string) {
  return request<{ payment: PaymentRow }>(`/payments/${id}`);
}

export async function confirmPayment(
  id: string,
  body?: { biometric_verified?: boolean; biometric_assertion?: unknown }
) {
  return request<{ payment: PaymentRow; transaction?: unknown; new_balance?: string }>(
    `/payments/${id}/confirm`,
    { method: 'POST', body: JSON.stringify(body || {}) }
  );
}

export async function cancelPayment(id: string) {
  return request<{ payment: PaymentRow }>(`/payments/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function refundPayment(id: string, amount?: number) {
  return request<{ payment: PaymentRow; refund_transaction?: unknown; new_balance?: string }>(
    `/payments/${id}/refund`,
    { method: 'POST', body: JSON.stringify(amount != null ? { amount } : {}) }
  );
}

export async function createPayoutApi(input: {
  amount: number;
  bank_name: string;
  account_number: string;
  description?: string;
  biometric_verified?: boolean;
  multi_sig_approved?: boolean;
  multi_sig_approvals?: number;
}) {
  return request<{
    transaction: {
      id: string;
      reference: string;
      status: string;
      amount: number;
      currency: string;
      description: string;
      metadata?: { bank_name?: string; account_number?: string };
      created_at: string;
    };
    new_balance: string;
    estimated_arrival?: string;
  }>('/payouts', { method: 'POST', body: JSON.stringify(input) });
}

export async function fetchPayouts(): Promise<PayoutRow[]> {
  const data = await request<{ payouts: PayoutRow[] }>('/payouts');
  return data.payouts || [];
}

export async function searchUsers(q: string): Promise<
  Array<{ id: string; hpay_id: string; name: string; kyc_tier?: number }>
> {
  if (!q || q.trim().length < 2) return [];
  const data = await request<{ users: Array<{ id: string; hpay_id: string; name: string; kyc_tier?: number }> }>(
    `/users/search?q=${encodeURIComponent(q.trim())}`
  );
  return data.users || [];
}

export async function releaseEscrowApi(input: {
  escrow_id: string;
  to_hpay_id: string;
  amount: number;
  description?: string;
  biometric_verified?: boolean;
  multi_sig_approved?: boolean;
  multi_sig_approvals?: number;
}) {
  return request<TransferResult>('/escrow/release', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function reseedDemo(): Promise<{ ok: boolean; access_token?: string; user?: AuthUser }> {
  const data = await request<{ ok: boolean; access_token?: string; user?: AuthUser }>('/admin/reseed', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (data.access_token) {
    accessToken = data.access_token;
    cachedUser = data.user || cachedUser;
  }
  return data;
}

export async function fetchHealth() {
  const res = await fetch(`${apiOrigin()}/api/health`);
  return parseBody(res);
}

export async function askHarvey(prompt: string, contextData?: unknown) {
  try {
    return await request<{
      source: string;
      reply: string;
      text?: string;
      model?: string;
      actionPrepared?: unknown;
      insights?: unknown;
    }>('/ai/harvey/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, contextData }),
    });
  } catch {
    // Legacy alias fallback
    const res = await fetch(`${apiOrigin()}/api/harvey`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ prompt, contextData }),
    });
    const data = await parseBody(res);
    if (!res.ok) {
      throw new HPayApiError(
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: string }).error)
          : 'Harvey failed',
        res.status,
        data
      );
    }
    return data as { source: string; reply: string; text?: string; actionPrepared?: unknown };
  }
}

export async function fetchPredictiveCashflow() {
  return request<{
    model: string;
    starting_balance: number;
    horizon_days: number;
    points: Array<{
      day: string;
      actual: number | null;
      forecast: number;
      confidenceUpper: number;
      confidenceLower: number;
    }>;
  }>('/analytics/predictive-cashflow');
}

export async function fetchMerchantOutlets() {
  return request<{
    outlets: Array<{
      id: string;
      name: string;
      location: string;
      channel: string;
      dailyVolume: number;
      pendingSettlement: number;
      status: string;
    }>;
    pending_settlement_total: number;
  }>('/merchants/outlets');
}

export async function batchSettleMerchants(
  outletIds: string[],
  clearance?: {
    biometric_verified?: boolean;
    multi_sig_approved?: boolean;
    multi_sig_approvals?: number;
  }
) {
  return request<{
    batch_id: string;
    settled_count: number;
    total_amount: string;
    settlements: unknown[];
    new_balance: string;
  }>('/merchants/batch-settlement', {
    method: 'POST',
    body: JSON.stringify({ outlet_ids: outletIds, ...clearance }),
  });
}

export async function fetchSalesVelocity() {
  return request<{
    stream: Array<{ time: string; sales: number; timestamp: string }>;
    total_today: number;
    peak_hour: { time: string; sales: number };
  }>('/merchants/sales-velocity');
}

export async function fetchIntegrationsStatus() {
  return request<{
    integrations_mode: string;
    providers: Array<{
      domain: string;
      provider: string;
      mode: string;
      live_ready: boolean;
      purpose: string;
    }>;
    forex?: { id: string; mode: string; live_ready: boolean; host: string };
    crypto?: { id: string; mode: string; live_ready: boolean; host: string };
  }>('/integrations/status');
}

/** Live forex rates (RapidAPI via HPay proxy) */
export async function fetchForexLatest(opts?: { base?: string; symbols?: string }) {
  const q = new URLSearchParams();
  if (opts?.base) q.set('base', opts.base);
  if (opts?.symbols) q.set('symbols', opts.symbols);
  const qs = q.toString() ? `?${q}` : '';
  return request<{
    mode: string;
    base: string;
    date?: string;
    rates: Record<string, number>;
    source?: string;
  }>(`/market/forex/latest${qs}`);
}

export async function fetchForexTimeseries(input: {
  start_date: string;
  end_date: string;
  base?: string;
  symbols?: string;
}) {
  const q = new URLSearchParams({
    start_date: input.start_date,
    end_date: input.end_date,
    base: input.base || 'USD',
    symbols: input.symbols || 'EUR,GBP',
  });
  return request(`/market/forex/timeseries?${q}`);
}

export async function convertForex(input: { from: string; to: string; amount: number }) {
  const q = new URLSearchParams({
    from: input.from,
    to: input.to,
    amount: String(input.amount),
  });
  return request<{
    mode: string;
    from: string;
    to: string;
    amount: number;
    rate: number;
    result: number;
  }>(`/market/forex/convert?${q}`);
}

/** Live crypto liquidity (RapidAPI via HPay proxy) */
export async function fetchCryptoLiquidity(symbol = 'BTC') {
  const q = new URLSearchParams({ symbol });
  return request<{
    mode: string;
    symbol: string;
    price: number | null;
    bid?: number | null;
    ask?: number | null;
    source?: string;
    as_of?: string;
  }>(`/market/crypto/liquidity?${q}`);
}

export async function fetchCryptoTickers(symbols = 'BTC,ETH') {
  const q = new URLSearchParams({ symbols });
  return request<{
    mode: string;
    source?: string;
    as_of?: string;
    tickers: Record<
      string,
      {
        mode: string;
        symbol: string;
        price: number | null;
        rate?: number | null;
        change24h?: number;
        bid?: number | null;
        ask?: number | null;
        error?: string;
      }
    >;
  }>(`/market/crypto/tickers?${q}`);
}

export type CryptoBoardRow = {
  symbol: string;
  name?: string;
  price: number | null;
  change24h: number;
  liquidity?: number | null;
  readable_liquidity?: string | null;
  volume?: number | null;
  readable_volume?: string | null;
  marketcap?: number | null;
  readable_marketcap?: string | null;
};

export async function fetchCryptoBoard(symbols = 'BTC,ETH,SOL,XRP,BNB,DOGE') {
  const q = new URLSearchParams({ symbols });
  // Public market tape — no JWT required
  const res = await fetch(`${apiBase()}/market/crypto/board?${q}`, {
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    throw new HPayApiError(
      (body as { error?: string })?.error || `HTTP ${res.status}`,
      res.status,
      body
    );
  }
  return body as {
    mode: string;
    source?: string;
    rapidapi_live?: boolean;
    as_of?: string;
    rows: CryptoBoardRow[];
  };
}

export async function fetchSecurityAudit() {
  return request<{ events: unknown[] }>('/security/audit');
}

export async function fetchSecurityEnclave() {
  return request('/security/enclave');
}

/** PROTOCOL L5 — WebAuthn registration challenge */
export async function passkeyRegisterChallenge(input?: { rp_id?: string }) {
  return request<{
    protocol: string;
    layer: string;
    challenge_id: string;
    expires_at: string;
    publicKey: Record<string, unknown>;
  }>('/auth/passkey/register-challenge', {
    method: 'POST',
    body: JSON.stringify(input || {}),
  });
}

/** PROTOCOL L5 — verify registration or high-value assertion */
export async function passkeyVerify(input: {
  challenge_id?: string;
  type?: 'registration' | 'assertion';
  credential?: unknown;
  assertion?: unknown;
  amount?: number;
  simulate_success?: boolean;
}) {
  return request<{
    protocol: string;
    layer: string;
    verified: boolean;
    type: string;
    assertion_id?: string;
    credential_id?: string;
    biometric_verified?: boolean;
    expires_at?: string;
    message?: string;
  }>('/auth/passkey/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** PROTOCOL L1 — FIPS HSM dual-custody key rotation */
export async function rotateHsmKeys(input?: {
  custody?: string[];
  co_signer?: string;
  mode?: 'manual' | 'automated';
}) {
  return request<{
    protocol: string;
    layer: string;
    ok?: boolean;
    toKeyId?: string;
    fromKeyId?: string;
    mode?: string;
    nextRotationAt?: string;
  }>('/security/hsm/rotate-keys', {
    method: 'POST',
    body: JSON.stringify(input || { custody: ['officer_a', 'officer_b'], mode: 'manual' }),
  });
}

/** PROTOCOL L3 — ZK solvency proof (no balances revealed) */
export async function fetchSolvencyProof(opts?: { threshold_cents?: number; epoch?: string }) {
  const q = new URLSearchParams();
  if (opts?.threshold_cents != null) q.set('threshold_cents', String(opts.threshold_cents));
  if (opts?.epoch) q.set('epoch', opts.epoch);
  const qs = q.toString() ? `?${q}` : '';
  return request<{
    protocol: string;
    layer: string;
    proof: {
      proofId: string;
      publicSignals: Record<string, unknown>;
      revealedFields: unknown[];
    };
    revealed_fields: unknown[];
    message: string;
  }>(`/security/zkp/solvency-proof${qs}`);
}

/** Full ledger sync payload for the React shell. */
export async function syncLedgerState() {
  await ensureSession();
  const [accounts, primaryBalances, multi, ledger] = await Promise.all([
    fetchAccounts(),
    fetchBalances(),
    fetchMultiCurrencyBalances().catch(() => null),
    fetchLedger().catch(() => null),
  ]);
  const accountId = primaryAccountId || accounts[0]?.id;
  const balances = {
    ...primaryBalances,
    ...(multi?.balances
      ? Object.fromEntries(
          Object.entries(multi.balances)
            .filter(([k]) => !k.includes('-'))
            .map(([k, v]) => [k === 'eUSD' ? 'eUSD' : k === 'eAED' ? 'eAED' : k, Number(v.amount)])
        )
      : {}),
    USD: primaryBalances.USD,
  };
  if (!accountId) {
    return {
      accounts,
      balances,
      multiBalances: multi,
      transactions: [] as ApiTxRow[],
      payouts: [] as PayoutRow[],
      ledger,
      user: cachedUser,
    };
  }
  const [transactions, payouts] = await Promise.all([
    fetchAccountTransactions(accountId, { limit: 100 }),
    fetchPayouts().catch(() => [] as PayoutRow[]),
  ]);
  return {
    accounts,
    balances,
    multiBalances: multi,
    transactions,
    payouts,
    ledger,
    user: cachedUser,
  };
}

export function mapApiTxToUi(row: ApiTxRow) {
  const amount = Math.abs(row.amount_cents) / 100;
  const statusRaw = (row.status || 'settled').toLowerCase();
  const status =
    statusRaw === 'settled' || statusRaw === 'completed'
      ? ('Completed' as const)
      : statusRaw === 'failed'
        ? ('Failed' as const)
        : statusRaw === 'refunded'
          ? ('Refunded' as const)
          : ('Pending' as const);

  const meta = row.metadata || {};
  const counterparty =
    (typeof meta.to_name === 'string' && meta.to_name) ||
    (typeof meta.to_hpay_id === 'string' && meta.to_hpay_id) ||
    row.description ||
    'Ledger entry';

  return {
    id: row.transaction_id || row.id,
    amount,
    currency: (row.currency || 'USD') as import('../types').CurrencyCode,
    status,
    merchantOrPerson: String(counterparty),
    recipientHPayId: typeof meta.to_hpay_id === 'string' ? meta.to_hpay_id : undefined,
    senderHPayId: typeof meta.from_hpay_id === 'string' ? meta.from_hpay_id : undefined,
    category: row.type || 'transfer',
    direction: (row.is_credit ? 'in' : 'out') as 'in' | 'out',
    paymentMethod: 'HPay Wallet',
    paymentRail: 'HPay Double-Entry Ledger',
    timestamp: row.created_at ? new Date(row.created_at).toLocaleString() : new Date().toLocaleString(),
    reference: row.reference || row.id,
    riskStatus: 'Clear',
    riskScore: 5,
    fee: 0,
    settlementAmount: amount,
    ledgerEntries: [
      {
        accountName: row.is_credit ? 'Wallet (credit)' : 'Wallet (debit)',
        debit: row.is_credit ? 0 : amount,
        credit: row.is_credit ? amount : 0,
        description: row.description || '',
      },
    ],
    note: row.description,
  };
}

export function mapPayoutToUi(row: PayoutRow) {
  const statusRaw = (row.status || '').toLowerCase();
  const cents = typeof row.amount === 'number' ? row.amount : 0;
  return {
    id: row.id,
    reference: row.reference,
    beneficiaryName: row.bank_name || 'Beneficiary',
    bankName: row.bank_name || 'Bank',
    accountNumber: row.account_number || '••••',
    amount: cents / 100,
    currency: (row.currency || 'USD') as import('../types').CurrencyCode,
    status:
      statusRaw === 'settled' || statusRaw === 'completed'
        ? ('Completed' as const)
        : ('Processing' as const),
    date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Today',
  };
}

export const hpayApi = {
  login,
  register,
  fetchMe,
  logout,
  ensureSession,
  fetchAccounts,
  fetchBalances,
  fetchMultiCurrencyBalances,
  fetchLedgerReconciliation,
  createFastRailTransfer,
  fetchAccountBalance,
  fetchAccountTransactions,
  fetchLedger,
  createTransfer,
  createDeposit,
  createTopup,
  createPayment,
  getPayment,
  confirmPayment,
  cancelPayment,
  refundPayment,
  createPayoutApi,
  fetchPayouts,
  searchUsers,
  releaseEscrowApi,
  reseedDemo,
  fetchHealth,
  askHarvey,
  fetchPredictiveCashflow,
  fetchMerchantOutlets,
  batchSettleMerchants,
  fetchSalesVelocity,
  fetchIntegrationsStatus,
  fetchForexLatest,
  fetchForexTimeseries,
  convertForex,
  fetchCryptoLiquidity,
  fetchCryptoTickers,
  fetchCryptoBoard,
  fetchSecurityAudit,
  fetchSecurityEnclave,
  passkeyRegisterChallenge,
  passkeyVerify,
  rotateHsmKeys,
  fetchSolvencyProof,
  syncLedgerState,
  mapApiTxToUi,
  mapPayoutToUi,
  getAccessToken,
  getPrimaryAccountId,
  getCachedUser,
  clearSession,
  apiBase,
  apiOrigin,
  HPayApiError,
};

export default hpayApi;
