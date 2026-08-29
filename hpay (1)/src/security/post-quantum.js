/**
 * NIST ML-KEM-1024 (Kyber-equivalent) lattice-based crypto stub.
 * Production: replace with audited ML-KEM implementation (e.g. liboqs / Cloudflare CIRCL).
 * All transaction payload signing and API key encryption MUST go through this module.
 */

const ALGORITHM = 'ML-KEM-1024';
const VERSION = 'pq-stub-1';

function SecurityError(code, message) {
  const err = new Error(message);
  err.name = 'PostQuantumSecurityError';
  err.code = code;
  return err;
}

function toBytes(input) {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  if (input instanceof Uint8Array) return input;
  return new TextEncoder().encode(JSON.stringify(input));
}

async function sha256Hex(bytes) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Node fallback for isomorphic use
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(Buffer.from(bytes)).digest('hex');
}

/**
 * @returns {{ algorithm: string, version: string, publicKey: string, encapsulated: boolean }}
 */
export async function generateKemKeyPair() {
  const seed = crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(32))
    : new Uint8Array(32).map(() => Math.floor(Math.random() * 256));
  const publicKey = await sha256Hex(seed);
  return {
    algorithm: ALGORITHM,
    version: VERSION,
    publicKey: `mlkem1024_pk_${publicKey.slice(0, 48)}`,
    encapsulated: false,
  };
}

/**
 * Sign (integrity-wrap) a transaction payload via PQ-derived MAC stub.
 * Does not expose raw keys.
 * @param {unknown} payload
 * @param {{ keyId?: string }} [opts]
 */
export async function signTransactionPayload(payload, opts = {}) {
  if (payload == null) {
    throw SecurityError('PQ_EMPTY_PAYLOAD', 'Cannot sign empty transaction payload');
  }
  const bytes = toBytes(payload);
  const digest = await sha256Hex(bytes);
  const keyId = opts.keyId || 'hpay-pq-root-v1';
  const signature = await sha256Hex(toBytes(`${ALGORITHM}:${keyId}:${digest}`));

  return {
    algorithm: ALGORITHM,
    version: VERSION,
    keyId,
    payloadDigest: digest,
    signature: `pq.${signature}`,
    signedAt: new Date().toISOString(),
  };
}

/**
 * Encrypt an API key under ML-KEM-1024 encapsulation stub.
 * Ciphertext is opaque; plaintext key never returned.
 * @param {string} apiKey
 * @param {{ recipientPublicKey?: string }} [opts]
 */
export async function encryptApiKey(apiKey, opts = {}) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw SecurityError('PQ_INVALID_KEY', 'API key must be a non-empty string');
  }
  const recipientPublicKey = opts.recipientPublicKey || (await generateKemKeyPair()).publicKey;
  const digest = await sha256Hex(toBytes(apiKey));
  const encapsulation = await sha256Hex(toBytes(`${recipientPublicKey}:${digest}`));

  return {
    algorithm: ALGORITHM,
    version: VERSION,
    recipientPublicKey,
    ciphertext: `kem1024.${encapsulation}`,
    // Intentionally no plaintext / no key material
    wrappedAt: new Date().toISOString(),
  };
}

export function getPostQuantumStatus() {
  return {
    id: 'post-quantum',
    name: 'NIST ML-KEM-1024',
    status: 'stub_ready',
    algorithm: ALGORITHM,
    version: VERSION,
    fipsAligned: false,
    notes: 'Lattice KEM stub — swap for production liboqs/CIRCL before mainnet',
  };
}

export const PostQuantum = {
  ALGORITHM,
  VERSION,
  generateKemKeyPair,
  signTransactionPayload,
  encryptApiKey,
  getStatus: getPostQuantumStatus,
};

export default PostQuantum;
