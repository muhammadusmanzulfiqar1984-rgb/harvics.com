/**
 * Real FIDO2 / WebAuthn via @simplewebauthn/server (PROTOCOL L3 — payouts ≥ $10,000)
 */
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { createHash, randomBytes } = require('node:crypto');

function rpConfig() {
  return {
    rpName: process.env.WEBAUTHN_RP_NAME || 'HPay Security Enclave',
    rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
    origin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3001',
  };
}

/**
 * @param {{ db: any, generateId: Function }} deps
 */
function createWebAuthnService(deps) {
  const { db, generateId } = deps;
  const { rpName, rpID, origin } = rpConfig();

  function userCredentials(userId) {
    return Array.from(db.passkeys.values()).filter((p) => p.userId === userId);
  }

  async function registrationOptions(user) {
    const existing = userCredentials(user.id);
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      userDisplayName: user.name,
      userID: new TextEncoder().encode(user.id.replace(/-/g, '').slice(0, 32)),
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      excludeCredentials: existing.map((c) => ({
        id: c.credentialId,
        transports: c.transports || ['internal'],
      })),
    });

    const challengeId = generateId();
    db.passkeyChallenges.set(challengeId, {
      id: challengeId,
      userId: user.id,
      challenge: options.challenge,
      type: 'registration',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    return { challengeId, options, rpID, origin };
  }

  async function verifyRegistration(user, { challengeId, response }) {
    const ch = db.passkeyChallenges.get(challengeId);
    if (!ch || ch.userId !== user.id || ch.type !== 'registration') {
      throw Object.assign(new Error('Invalid registration challenge'), { code: 'CHALLENGE_INVALID' });
    }
    if (new Date(ch.expiresAt).getTime() < Date.now()) {
      throw Object.assign(new Error('Challenge expired'), { code: 'CHALLENGE_EXPIRED' });
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: ch.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw Object.assign(new Error('WebAuthn registration failed'), { code: 'WEBAUTHN_VERIFY_FAILED' });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const credentialId = credential.id;
    const record = {
      userId: user.id,
      credentialId,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter || 0,
      transports: response?.response?.transports || ['internal'],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      createdAt: new Date().toISOString(),
    };
    db.passkeys.set(credentialId, record);
    db.passkeyChallenges.delete(challengeId);
    user.passkey_registered = true;
    db.users.set(user.id, user);
    return { verified: true, credentialId, record };
  }

  async function authenticationOptions(user, { amountCents } = {}) {
    const existing = userCredentials(user.id);
    if (!existing.length) {
      throw Object.assign(new Error('No passkey registered'), { code: 'NO_PASSKEY' });
    }
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      allowCredentials: existing.map((c) => ({
        id: c.credentialId,
        transports: c.transports || ['internal'],
      })),
    });
    const challengeId = generateId();
    db.passkeyChallenges.set(challengeId, {
      id: challengeId,
      userId: user.id,
      challenge: options.challenge,
      type: 'authentication',
      amountCents: amountCents || null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    return { challengeId, options, rpID, origin };
  }

  async function verifyAuthentication(user, { challengeId, response, amountCents }) {
    const ch = db.passkeyChallenges.get(challengeId);
    if (!ch || ch.userId !== user.id) {
      throw Object.assign(new Error('Invalid authentication challenge'), { code: 'CHALLENGE_INVALID' });
    }
    if (new Date(ch.expiresAt).getTime() < Date.now()) {
      throw Object.assign(new Error('Challenge expired'), { code: 'CHALLENGE_EXPIRED' });
    }

    const credId = response?.id || response?.rawId;
    const stored = db.passkeys.get(credId);
    if (!stored || stored.userId !== user.id) {
      throw Object.assign(new Error('Unknown credential'), { code: 'CREDENTIAL_UNKNOWN' });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: ch.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: stored.credentialId,
        publicKey: Buffer.from(stored.publicKey, 'base64url'),
        counter: stored.counter || 0,
        transports: stored.transports,
      },
    });

    if (!verification.verified) {
      throw Object.assign(new Error('WebAuthn authentication failed'), { code: 'WEBAUTHN_VERIFY_FAILED' });
    }

    stored.counter = verification.authenticationInfo.newCounter;
    stored.lastUsedAt = new Date().toISOString();
    db.passkeys.set(stored.credentialId, stored);
    db.passkeyChallenges.delete(challengeId);

    const assertionId = generateId();
    const clearance = {
      id: assertionId,
      userId: user.id,
      credentialId: stored.credentialId,
      amountCents: amountCents || ch.amountCents || null,
      verified: true,
      at: new Date().toISOString(),
      digest: createHash('sha256').update(`${assertionId}|${stored.credentialId}`).digest('hex'),
    };
    db.passkeyAssertions.set(assertionId, clearance);
    return { verified: true, assertionId, clearance };
  }

  return {
    registrationOptions,
    verifyRegistration,
    authenticationOptions,
    verifyAuthentication,
    rpConfig: () => ({ rpName, rpID, origin }),
  };
}

module.exports = { createWebAuthnService, rpConfig };
