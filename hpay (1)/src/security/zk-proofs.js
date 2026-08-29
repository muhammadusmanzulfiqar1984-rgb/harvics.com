/**
 * ZK-SNARK solvency / compliance proof interface.
 * Proofs attest properties without revealing raw balances or counterparties.
 */

const PROOF_SYSTEM = 'groth16-stub';
const CURVE = 'bn254-stub';

function SecurityError(code, message) {
  const err = new Error(message);
  err.name = 'ZkProofSecurityError';
  err.code = code;
  return err;
}

async function commitmentHash(parts) {
  const raw = parts.join('|');
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Prove reserves ≥ liability threshold without exposing balances.
 * @param {{ accountCommitment: string, liabilityCommitment: string, thresholdCents: number, epoch?: string }} input
 * @returns {Promise<{ proofId: string, publicSignals: object, proof: object }>}
 */
export async function proveSolvency(input) {
  if (!input?.accountCommitment || !input?.liabilityCommitment) {
    throw SecurityError('ZK_SOLVENCY_INPUT', 'accountCommitment and liabilityCommitment required');
  }
  if (typeof input.thresholdCents !== 'number' || input.thresholdCents < 0) {
    throw SecurityError('ZK_SOLVENCY_THRESHOLD', 'thresholdCents must be a non-negative number');
  }

  const epoch = input.epoch || new Date().toISOString().slice(0, 10);
  const nullifier = await commitmentHash([
    input.accountCommitment,
    input.liabilityCommitment,
    String(input.thresholdCents),
    epoch,
  ]);

  return {
    proofId: `zksolv_${nullifier.slice(0, 24)}`,
    proofSystem: PROOF_SYSTEM,
    curve: CURVE,
    publicSignals: {
      // No raw balances — only boolean-capable public outputs
      reservesCoverLiabilities: true,
      thresholdBand: input.thresholdCents > 0 ? 'gte_threshold' : 'zero_threshold',
      epoch,
      nullifier: `0x${nullifier.slice(0, 32)}`,
    },
    proof: {
      a: [`0x${nullifier.slice(0, 16)}`],
      b: [[`0x${nullifier.slice(16, 32)}`], [`0x${nullifier.slice(32, 48)}`]],
      c: [`0x${nullifier.slice(48, 64)}`],
    },
    // Explicitly omit balances / account ids / counterparties
    revealedFields: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Prove policy/compliance attestation without exposing counterparties.
 * @param {{ policyId: string, attestationCommitment: string, jurisdiction?: string }} input
 */
export async function proveCompliance(input) {
  if (!input?.policyId || !input?.attestationCommitment) {
    throw SecurityError('ZK_COMPLIANCE_INPUT', 'policyId and attestationCommitment required');
  }

  const nullifier = await commitmentHash([
    input.policyId,
    input.attestationCommitment,
    input.jurisdiction || 'GLOBAL',
  ]);

  return {
    proofId: `zkcomp_${nullifier.slice(0, 24)}`,
    proofSystem: PROOF_SYSTEM,
    curve: CURVE,
    publicSignals: {
      policySatisfied: true,
      policyIdHash: `0x${nullifier.slice(0, 16)}`,
      jurisdictionClass: input.jurisdiction || 'GLOBAL',
      nullifier: `0x${nullifier.slice(16, 48)}`,
    },
    proof: {
      a: [`0x${nullifier.slice(0, 16)}`],
      b: [[`0x${nullifier.slice(16, 32)}`], [`0x${nullifier.slice(32, 48)}`]],
      c: [`0x${nullifier.slice(48, 64)}`],
    },
    revealedFields: [],
    createdAt: new Date().toISOString(),
  };
}

export function getZkProofsStatus() {
  return {
    id: 'zk-proofs',
    name: 'ZK-SNARK Solvency / Compliance',
    status: 'interface_ready',
    proofSystem: PROOF_SYSTEM,
    curve: CURVE,
    notes: 'Stub circuits — production requires trusted setup + audited groth16/plonk keys',
  };
}

export const ZkProofs = {
  proveSolvency,
  proveCompliance,
  getStatus: getZkProofsStatus,
};

export default ZkProofs;
