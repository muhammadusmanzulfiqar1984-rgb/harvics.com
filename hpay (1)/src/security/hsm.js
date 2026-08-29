/**
 * FIPS 140-2 Level 4 HSM simulation.
 * Air-gapped root key management with multi-region rotation scheduler.
 * Raw root material never leaves the simulated enclave boundary.
 */

const FIPS_LEVEL = '140-2 Level 4 (simulated)';
const REGIONS = Object.freeze(['us-east-1', 'eu-west-1', 'me-central-1']);

/** @type {{ keyId: string, version: number, createdAt: string, regions: string[], nextRotationAt: string } | null} */
let activeRootMeta = null;

/** @type {ReturnType<typeof setInterval> | null} */
let rotationTimer = null;

/** @type {Array<{ at: string, fromKeyId: string, toKeyId: string, regions: string[] }>} */
const rotationHistory = [];

function SecurityError(code, message) {
  const err = new Error(message);
  err.name = 'HsmSecurityError';
  err.code = code;
  return err;
}

function randomKeyId() {
  const bytes =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(16))
      : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  return `hsm_root_${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Initialize air-gapped root key metadata (no export of key bytes).
 * @param {{ regions?: string[], rotationIntervalMs?: number }} [opts]
 */
export function initializeRootKey(opts = {}) {
  const regions = opts.regions?.length ? opts.regions : [...REGIONS];
  const rotationIntervalMs = opts.rotationIntervalMs ?? 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  activeRootMeta = {
    keyId: randomKeyId(),
    version: 1,
    createdAt: new Date(now).toISOString(),
    regions,
    nextRotationAt: new Date(now + rotationIntervalMs).toISOString(),
  };

  return getPublicRootMetadata();
}

/**
 * Rotate root key across regions. Previous key id retired; material never returned.
 * @param {{ regions?: string[] }} [opts]
 */
export function rotateRootKey(opts = {}) {
  if (!activeRootMeta) {
    initializeRootKey({ regions: opts.regions });
  }

  const fromKeyId = activeRootMeta.keyId;
  const regions = opts.regions?.length ? opts.regions : activeRootMeta.regions;
  const intervalMs =
    new Date(activeRootMeta.nextRotationAt).getTime() - new Date(activeRootMeta.createdAt).getTime() ||
    24 * 60 * 60 * 1000;

  activeRootMeta = {
    keyId: randomKeyId(),
    version: activeRootMeta.version + 1,
    createdAt: new Date().toISOString(),
    regions,
    nextRotationAt: new Date(Date.now() + Math.max(intervalMs, 60_000)).toISOString(),
  };

  rotationHistory.push({
    at: activeRootMeta.createdAt,
    fromKeyId,
    toKeyId: activeRootMeta.keyId,
    regions: [...regions],
  });

  if (rotationHistory.length > 50) rotationHistory.shift();

  return {
    rotated: true,
    fromKeyId,
    toKeyId: activeRootMeta.keyId,
    version: activeRootMeta.version,
    regions: [...regions],
    nextRotationAt: activeRootMeta.nextRotationAt,
  };
}

/**
 * Multi-region aware rotation scheduler (in-process simulation).
 * @param {{ intervalMs?: number, onRotate?: (result: object) => void }} [opts]
 */
export function startKeyRotationScheduler(opts = {}) {
  const intervalMs = opts.intervalMs ?? 60 * 60 * 1000;
  if (!activeRootMeta) initializeRootKey({ rotationIntervalMs: intervalMs });

  stopKeyRotationScheduler();
  rotationTimer = setInterval(() => {
    try {
      const result = rotateRootKey();
      if (typeof opts.onRotate === 'function') opts.onRotate(result);
    } catch {
      // Swallow in scheduler path — callers audit via onRotate / getStatus
    }
  }, intervalMs);

  if (typeof rotationTimer.unref === 'function') rotationTimer.unref();

  return { scheduling: true, intervalMs, regions: [...(activeRootMeta?.regions || REGIONS)] };
}

export function stopKeyRotationScheduler() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}

/**
 * Sign with HSM-bound key reference only (no key export).
 * @param {string} payloadDigest
 */
export function hsmSign(payloadDigest) {
  if (!activeRootMeta) initializeRootKey();
  if (!payloadDigest) throw SecurityError('HSM_EMPTY_DIGEST', 'payloadDigest required');

  return {
    keyId: activeRootMeta.keyId,
    version: activeRootMeta.version,
    fips: FIPS_LEVEL,
    signature: `hsm.${activeRootMeta.version}.${payloadDigest.slice(0, 48)}`,
    airGapped: true,
    signedAt: new Date().toISOString(),
  };
}

export function getPublicRootMetadata() {
  if (!activeRootMeta) return null;
  return {
    keyId: activeRootMeta.keyId,
    version: activeRootMeta.version,
    createdAt: activeRootMeta.createdAt,
    regions: [...activeRootMeta.regions],
    nextRotationAt: activeRootMeta.nextRotationAt,
    exportable: false,
  };
}

export function getHsmStatus() {
  if (!activeRootMeta) initializeRootKey();
  return {
    id: 'hsm',
    name: 'FIPS 140-2 Level 4 HSM',
    status: 'simulated_active',
    fips: FIPS_LEVEL,
    airGapped: true,
    schedulerActive: Boolean(rotationTimer),
    root: getPublicRootMetadata(),
    recentRotations: rotationHistory.slice(-5),
    notes: 'Simulation only — bind to CloudHSM / AWS Nitro / on-prem FIPS module for production',
  };
}

export const Hsm = {
  REGIONS,
  initializeRootKey,
  rotateRootKey,
  startKeyRotationScheduler,
  stopKeyRotationScheduler,
  hsmSign,
  getPublicRootMetadata,
  getStatus: getHsmStatus,
};

export default Hsm;
