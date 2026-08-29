/**
 * HPAY REAL-MONEY SECURITY PROTOCOL — LAW (v2)
 * ============================================
 * The 7 Security Layers Required for Real Money.
 * Every settlement MUST pass FAIL-CLOSED in order L7 → L1.
 *
 * Balance is NEVER stored — only Σ(credits) − Σ(debits) from ledger.
 * (Customer wallets = LIABILITY: Σ credit − Σ debit.)
 */

const PROTOCOL = Object.freeze({
  id: 'HPAY-REAL-MONEY-V2',
  version: '2.0.0',

  /** Fail-closed evaluation order (outer perimeter → inner custody) */
  order: Object.freeze(['L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1']),

  layers: Object.freeze({
    L1: {
      id: 'L1',
      name: 'Physical & Hardware Security (FIPS 140-2 Level 4 HSM & Fireblocks MPC)',
      fips: 'FIPS 140-2 Level 4',
      custody: Object.freeze(['Fireblocks MPC', 'HSM Enclave']),
      exportKeyMaterial: false,
      dualCustodyRequired: true,
      rotationMs: 30 * 24 * 60 * 60 * 1000,
      /** Large settlements still require M-of-N MPC co-sign */
      mpcThresholdCents: 5_000_000, // $50,000
      m: 2,
      n: 3,
    },
    L2: {
      id: 'L2',
      name: 'Post-Quantum Cryptography (NIST ML-KEM-1024 / Kyber)',
      kem: 'ML-KEM-1024',
      aka: 'Kyber',
      dsa: 'ML-DSA',
    },
    L3: {
      id: 'L3',
      name: 'Biometric Authentication (FIDO2 / WebAuthn)',
      thresholdCents: 1_000_000, // $10,000
      authenticators: Object.freeze(['TouchID', 'Windows Hello', 'YubiKey']),
    },
    L4: {
      id: 'L4',
      name: 'Double-Entry Ledger Invariant & ZK-SNARK Solvency',
      law: 'Dual-sided posts: Σ debits = Σ credits. Balance never stored. ZK proves solvency without revealing accounts.',
    },
    L5: {
      id: 'L5',
      name: 'Idempotency & Distributed Locking Layer',
      header: 'X-Idempotency-Key',
      lock: 'SELECT FOR UPDATE / in-process advisory lock',
    },
    L6: {
      id: 'L6',
      name: 'Real-Time KYT & OFAC Sanctions Screening',
      providers: Object.freeze(['Chainalysis', 'Elliptic']),
      lists: Object.freeze(['OFAC', 'EU', 'UN', 'UAE_CB']),
    },
    L7: {
      id: 'L7',
      name: 'Perimeter & Network Hardening (WAF, TLS 1.3, Rate Throttling)',
      tls: 'TLS 1.3',
      controls: Object.freeze(['WAF', 'HSTS', 'CSP', 'rate_limit', 'mTLS_internal']),
    },
  }),

  stackDisplay: Object.freeze([
    'L1 Physical & Hardware Security (FIPS 140-2 Level 4 HSM & Fireblocks MPC)',
    'L2 Post-Quantum Cryptography (NIST ML-KEM-1024 / Kyber)',
    'L3 Biometric Authentication (FIDO2 / WebAuthn) ≥ $10,000',
    'L4 Double-Entry Ledger Invariant & ZK-SNARK Solvency',
    'L5 Idempotency & Distributed Locking (X-Idempotency-Key)',
    'L6 Real-Time KYT & OFAC Sanctions Screening (Chainalysis / Elliptic)',
    'L7 Perimeter & Network Hardening (WAF, TLS 1.3, Rate Throttling)',
  ]),

  /** Production SDK adapters required for live settlement */
  productionAdapters: Object.freeze([
    { id: 'fireblocks', purpose: 'MPC Vaults & Custody', endpoints: ['/v1/vault/accounts', '/v1/transactions'] },
    { id: 'circle', purpose: 'Commercial USDC & Fiat Rails', endpoints: ['/v1/transfers', '/v1/wire/deposits', '/v1/payouts'] },
    { id: 'swift_cbuae', purpose: 'ISO 20022 Interbank Clearance', endpoints: ['pacs.008', 'camt.053'] },
    { id: 'chainalysis', purpose: 'AML & OFAC Compliance', endpoints: ['/api/kyt/v2/users', '/api/kyt/v2/transfers'] },
    { id: 'gemini', purpose: 'Harvey AI Engine', endpoints: ['@google/genai gemini-flash'] },
  ]),
});

function amountToCents(amount) {
  return Math.round(Number(amount) * 100);
}

function protocolRequirements(amountCents, opts = {}) {
  const cents = Number(amountCents) || 0;
  const biometric = cents >= PROTOCOL.layers.L3.thresholdCents;
  const vaultMultisig = cents >= PROTOCOL.layers.L1.mpcThresholdCents;
  return {
    protocolId: PROTOCOL.id,
    amountCents: cents,
    path: opts.path || 'settlement',
    biometric,
    vaultMultisig,
    vaultPolicy: {
      m: PROTOCOL.layers.L1.m,
      n: PROTOCOL.layers.L1.n,
      thresholdCents: PROTOCOL.layers.L1.mpcThresholdCents,
    },
    biometricThresholdCents: PROTOCOL.layers.L3.thresholdCents,
    idempotencyHeader: PROTOCOL.layers.L5.header,
    order: PROTOCOL.order,
  };
}

function protocolClearanceFlags(amountCents, clearance = {}) {
  const req = protocolRequirements(amountCents, { path: clearance.path });
  const flags = {
    biometric_verified: Boolean(clearance.biometric_verified) || !req.biometric,
    multi_sig_approved: Boolean(clearance.multi_sig_approved) || !req.vaultMultisig,
    multi_sig_approvals: Number(clearance.multi_sig_approvals) || 0,
  };
  if (req.vaultMultisig && clearance.multi_sig_approved) {
    flags.multi_sig_approvals = Math.max(flags.multi_sig_approvals, PROTOCOL.layers.L1.m);
  }
  if (!req.biometric) flags.biometric_verified = true;
  if (!req.vaultMultisig) {
    flags.multi_sig_approved = true;
    flags.multi_sig_approvals = PROTOCOL.layers.L1.m;
  }
  return { req, flags };
}

module.exports = {
  PROTOCOL,
  amountToCents,
  protocolRequirements,
  protocolClearanceFlags,
};
