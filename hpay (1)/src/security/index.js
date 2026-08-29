/**
 * Unified Defense-Grade Security Enclave.
 * Orchestrates PQ crypto, ZK proofs, HSM, biometric, and AML radar.
 * Every security event is audited to the ledger via injectable writer — no console.log.
 */

import PostQuantum, {
  signTransactionPayload,
  encryptApiKey,
  getPostQuantumStatus,
} from './post-quantum.js';
import ZkProofs, { proveSolvency, proveCompliance, getZkProofsStatus } from './zk-proofs.js';
import Hsm, {
  initializeRootKey,
  rotateRootKey,
  startKeyRotationScheduler,
  hsmSign,
  getHsmStatus,
} from './hsm.js';
import BiometricEnclave, {
  requiresBiometric,
  verifyPasskey,
  HIGH_VALUE_THRESHOLD_CENTS,
  getBiometricStatus,
} from './biometric-enclave.js';
import AmlRadar, { gateSettlement, getAmlRadarStatus } from './aml-radar.js';

export {
  PostQuantum,
  ZkProofs,
  Hsm,
  BiometricEnclave,
  AmlRadar,
  signTransactionPayload,
  encryptApiKey,
  proveSolvency,
  proveCompliance,
  requiresBiometric,
  verifyPasskey,
  gateSettlement,
  HIGH_VALUE_THRESHOLD_CENTS,
};

/** @typedef {{ type: string, severity: 'info' | 'warn' | 'critical', payload: object, at: string }} SecurityAuditEvent */

function SecurityEnclaveError(code, message, details) {
  const err = new Error(message);
  err.name = 'SecurityEnclaveError';
  err.code = code;
  err.details = details;
  return err;
}

/**
 * @param {(event: SecurityAuditEvent) => void | Promise<void>} [ledgerAuditWriter]
 */
export class SecurityEnclave {
  constructor(ledgerAuditWriter) {
    /** @type {SecurityAuditEvent[]} */
    this._localAudit = [];
    this._ledgerAuditWriter = ledgerAuditWriter || null;
    this._ready = false;
    this._initError = null;
  }

  /**
   * Boot HSM root + rotation scheduler. Safe to call once at app start.
   */
  async initialize(opts = {}) {
    try {
      initializeRootKey({ regions: opts.regions });
      startKeyRotationScheduler({
        intervalMs: opts.rotationIntervalMs ?? 60 * 60 * 1000,
        onRotate: (result) => {
          void this.audit('HSM_KEY_ROTATION', 'info', result);
        },
      });
      this._ready = true;
      await this.audit('ENCLAVE_INIT', 'info', { ready: true });
      return this.getStatus();
    } catch (e) {
      this._initError = e instanceof Error ? e.message : 'init_failed';
      this._ready = false;
      throw SecurityEnclaveError('ENCLAVE_INIT_FAILED', this._initError);
    }
  }

  /**
   * Append security event to in-memory ring and ledger writer.
   * @param {string} type
   * @param {'info' | 'warn' | 'critical'} severity
   * @param {object} payload
   */
  async audit(type, severity, payload = {}) {
    const event = {
      type,
      severity,
      payload: payload && typeof payload === 'object' ? { ...payload } : { value: payload },
      at: new Date().toISOString(),
    };

    this._localAudit.push(event);
    if (this._localAudit.length > 200) this._localAudit.shift();

    if (this._ledgerAuditWriter) {
      try {
        await this._ledgerAuditWriter(event);
      } catch {
        // Ledger write failure must not crash security path; retain local copy
        this._localAudit.push({
          type: 'AUDIT_LEDGER_WRITE_FAILED',
          severity: 'warn',
          payload: { failedType: type },
          at: new Date().toISOString(),
        });
      }
    }

    return event;
  }

  getAuditTrail(limit = 50) {
    return this._localAudit.slice(-limit);
  }

  /**
   * Wrap transaction: PQ sign + HSM countersign. Required for all settlement payloads.
   * @param {object} payload
   */
  async protectTransaction(payload) {
    try {
      const pq = await signTransactionPayload(payload);
      const hsm = hsmSign(pq.payloadDigest);
      await this.audit('TX_PAYLOAD_SIGNED', 'info', {
        keyId: pq.keyId,
        hsmKeyId: hsm.keyId,
        payloadDigest: pq.payloadDigest,
      });
      return { pq, hsm, protected: true };
    } catch (e) {
      await this.audit('TX_PAYLOAD_SIGN_FAILED', 'critical', {
        code: e?.code || 'SIGN_FAILED',
      });
      throw e;
    }
  }

  /**
   * Encrypt API keys exclusively via PQ module.
   * @param {string} apiKey
   */
  async wrapApiKey(apiKey) {
    try {
      const wrapped = await encryptApiKey(apiKey);
      await this.audit('API_KEY_ENCRYPTED', 'info', {
        algorithm: wrapped.algorithm,
        recipientPublicKey: wrapped.recipientPublicKey,
      });
      return wrapped;
    } catch (e) {
      await this.audit('API_KEY_ENCRYPT_FAILED', 'critical', { code: e?.code });
      throw e;
    }
  }

  async proveSolvency(input) {
    const proof = await proveSolvency(input);
    await this.audit('ZK_SOLVENCY_PROOF', 'info', { proofId: proof.proofId });
    return proof;
  }

  async proveCompliance(input) {
    const proof = await proveCompliance(input);
    await this.audit('ZK_COMPLIANCE_PROOF', 'info', { proofId: proof.proofId });
    return proof;
  }

  /**
   * High-value transfer gate (biometric).
   */
  async authorizeHighValueTransfer(input) {
    try {
      const result = await verifyPasskey(input);
      await this.audit(
        result.verified ? 'BIOMETRIC_VERIFIED' : 'BIOMETRIC_PENDING',
        result.verified ? 'info' : 'warn',
        {
          required: result.required,
          amountCents: input.amountCents,
          userId: input.userId,
        }
      );
      if (result.required && !result.verified) {
        throw SecurityEnclaveError('BIOMETRIC_REQUIRED', 'Passkey verification required', result);
      }
      return result;
    } catch (e) {
      await this.audit('BIOMETRIC_DENIED', 'critical', { code: e?.code || 'BIO_FAIL' });
      throw e;
    }
  }

  /**
   * AML pre-settlement gate — call before funds leave escrow / payment settles.
   */
  async preSettlementGate(input) {
    const verdict = gateSettlement(input);
    await this.audit(
      verdict.allow ? 'AML_CLEAR' : 'AML_FLAG',
      verdict.action === 'block' ? 'critical' : verdict.action === 'hold' ? 'warn' : 'info',
      {
        action: verdict.action,
        riskScore: verdict.riskScore,
        flags: verdict.flags,
        paymentId: input.paymentId,
        escrowId: input.escrowId,
      }
    );

    if (!verdict.allow) {
      throw SecurityEnclaveError(
        verdict.action === 'block' ? 'AML_BLOCK' : 'AML_HOLD',
        'Settlement blocked by AML radar before funds leave escrow',
        verdict
      );
    }
    return verdict;
  }

  rotateKeys(opts) {
    const result = rotateRootKey(opts);
    void this.audit('HSM_MANUAL_ROTATION', 'info', result);
    return result;
  }

  getStatus() {
    return {
      ready: this._ready,
      initError: this._initError,
      components: [
        getPostQuantumStatus(),
        getZkProofsStatus(),
        getHsmStatus(),
        getBiometricStatus(),
        getAmlRadarStatus(),
      ],
      auditEvents: this._localAudit.length,
      architecture: 'Defense-Grade Security Enclave',
    };
  }
}

/** Singleton for UI + shared client paths */
let sharedEnclave = null;

/**
 * @param {(event: SecurityAuditEvent) => void | Promise<void>} [ledgerAuditWriter]
 */
export function getSecurityEnclave(ledgerAuditWriter) {
  if (!sharedEnclave) {
    sharedEnclave = new SecurityEnclave(ledgerAuditWriter);
  } else if (ledgerAuditWriter) {
    sharedEnclave._ledgerAuditWriter = ledgerAuditWriter;
  }
  return sharedEnclave;
}

export default SecurityEnclave;
