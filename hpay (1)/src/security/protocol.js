/**
 * HPAY REAL-MONEY SECURITY PROTOCOL — client mirror (v2)
 * LAW: every settlement follows fail-closed order L7 → L1.
 */

export const PROTOCOL = Object.freeze({
  id: 'HPAY-REAL-MONEY-V2',
  version: '2.0.0',
  order: Object.freeze(['L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1']),
  layers: Object.freeze({
    L1: {
      id: 'L1',
      name: 'Physical & Hardware Security (FIPS 140-2 Level 4 HSM & Fireblocks MPC)',
      mpcThresholdCents: 5_000_000,
      m: 2,
      n: 3,
      rotationMs: 30 * 24 * 60 * 60 * 1000,
      dualCustodyRequired: true,
    },
    L2: {
      id: 'L2',
      name: 'Post-Quantum Cryptography (NIST ML-KEM-1024 / Kyber)',
      kem: 'ML-KEM-1024',
    },
    L3: {
      id: 'L3',
      name: 'Biometric Authentication (FIDO2 / WebAuthn)',
      thresholdCents: 1_000_000,
    },
    L4: {
      id: 'L4',
      name: 'Double-Entry Ledger Invariant & ZK-SNARK Solvency',
      law: 'Σ debits = Σ credits on dual-sided posts. Balance never stored.',
    },
    L5: {
      id: 'L5',
      name: 'Idempotency & Distributed Locking Layer',
      header: 'X-Idempotency-Key',
    },
    L6: {
      id: 'L6',
      name: 'Real-Time KYT & OFAC Sanctions Screening',
      lists: Object.freeze(['OFAC', 'EU', 'UN', 'UAE_CB']),
    },
    L7: {
      id: 'L7',
      name: 'Perimeter & Network Hardening (WAF, TLS 1.3, Rate Throttling)',
    },
  }),
  stackDisplay: Object.freeze([
    'L1 Physical & Hardware Security (FIPS 140-2 Level 4 HSM & Fireblocks MPC)',
    'L2 Post-Quantum Cryptography (NIST ML-KEM-1024 / Kyber)',
    'L3 Biometric Authentication (FIDO2 / WebAuthn) ≥ $10,000',
    'L4 Double-Entry Ledger Invariant & ZK-SNARK Solvency',
    'L5 Idempotency & Distributed Locking (X-Idempotency-Key)',
    'L6 Real-Time KYT & OFAC Sanctions Screening',
    'L7 Perimeter & Network Hardening (WAF, TLS 1.3, Rate Throttling)',
  ]),
});

export function amountToCents(amount) {
  return Math.round(Number(amount) * 100);
}

export function protocolRequirements(amountCents, opts = {}) {
  const cents = Number(amountCents) || 0;
  return {
    protocolId: PROTOCOL.id,
    amountCents: cents,
    path: opts.path || 'settlement',
    biometric: cents >= PROTOCOL.layers.L3.thresholdCents,
    vaultMultisig: cents >= PROTOCOL.layers.L1.mpcThresholdCents,
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

export function protocolClearanceFlags(amountCents, clearance = {}) {
  const req = protocolRequirements(amountCents, { path: clearance.path });
  const flags = {
    biometric_verified: Boolean(clearance.biometric_verified),
    multi_sig_approved: Boolean(clearance.multi_sig_approved),
    multi_sig_approvals: Number(clearance.multi_sig_approvals) || 0,
  };
  if (!req.biometric) flags.biometric_verified = true;
  if (!req.vaultMultisig) {
    flags.multi_sig_approved = true;
    flags.multi_sig_approvals = PROTOCOL.layers.L1.m;
  } else if (flags.multi_sig_approved) {
    flags.multi_sig_approvals = Math.max(flags.multi_sig_approvals, PROTOCOL.layers.L1.m);
  }
  return { req, flags };
}

export default PROTOCOL;
