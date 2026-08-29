/**
 * Real-time behavioral velocity tracker (AML Radar).
 * Flags suspicious settlement attempts before funds leave escrow.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_TX_PER_WINDOW = 8;
const MAX_VOLUME_CENTS_PER_WINDOW = 5_000_000; // $50,000
const BURST_GAP_MS = 8_000;

/** @type {Map<string, Array<{ at: number, amountCents: number, counterpartHash: string, escrowId?: string }>>} */
const velocityByUser = new Map();

function SecurityError(code, message) {
  const err = new Error(message);
  err.name = 'AmlRadarError';
  err.code = code;
  return err;
}

function prune(events, now) {
  return events.filter((e) => now - e.at <= WINDOW_MS);
}

/**
 * Record a behavioral event for velocity scoring.
 * @param {string} userId
 * @param {{ amountCents: number, counterpartHash: string, escrowId?: string }} event
 */
export function trackVelocity(userId, event) {
  if (!userId) throw SecurityError('AML_USER', 'userId required');
  if (typeof event?.amountCents !== 'number') {
    throw SecurityError('AML_AMOUNT', 'amountCents required');
  }

  const now = Date.now();
  const prev = prune(velocityByUser.get(userId) || [], now);
  prev.push({
    at: now,
    amountCents: event.amountCents,
    counterpartHash: event.counterpartHash || 'unknown',
    escrowId: event.escrowId,
  });
  velocityByUser.set(userId, prev);
  return { tracked: true, windowEvents: prev.length };
}

/**
 * Evaluate settlement before funds leave escrow / payment capture.
 * @param {{ userId: string, amountCents: number, counterpartHash?: string, escrowId?: string, paymentId?: string }} input
 * @returns {{ allow: boolean, riskScore: number, flags: string[], action: 'clear' | 'hold' | 'block' }}
 */
export function evaluateSettlement(input) {
  if (!input?.userId) throw SecurityError('AML_USER', 'userId required');
  if (typeof input.amountCents !== 'number' || input.amountCents < 0) {
    throw SecurityError('AML_AMOUNT', 'amountCents must be a non-negative number');
  }

  const now = Date.now();
  const events = prune(velocityByUser.get(input.userId) || [], now);
  const volume = events.reduce((s, e) => s + e.amountCents, 0) + input.amountCents;
  const count = events.length + 1;

  const flags = [];
  let riskScore = 5;

  if (count > MAX_TX_PER_WINDOW) {
    flags.push('VELOCITY_TX_COUNT');
    riskScore += 35;
  }
  if (volume > MAX_VOLUME_CENTS_PER_WINDOW) {
    flags.push('VELOCITY_VOLUME');
    riskScore += 40;
  }

  const last = events[events.length - 1];
  if (last && now - last.at < BURST_GAP_MS) {
    flags.push('BURST_INTERVAL');
    riskScore += 20;
  }

  const counterpart = input.counterpartHash || 'unknown';
  const sameCounterparty = events.filter((e) => e.counterpartHash === counterpart).length;
  if (sameCounterparty >= 4) {
    flags.push('COUNTERPARTY_CHURN');
    riskScore += 15;
  }

  if (input.escrowId && events.some((e) => e.escrowId === input.escrowId && e.amountCents === input.amountCents)) {
    flags.push('DUPLICATE_ESCROW_SETTLEMENT');
    riskScore += 50;
  }

  riskScore = Math.min(99, riskScore);

  let action = 'clear';
  if (riskScore >= 70) action = 'block';
  else if (riskScore >= 45) action = 'hold';

  return {
    allow: action === 'clear',
    riskScore,
    flags,
    action,
    window: {
      ms: WINDOW_MS,
      txCount: count,
      volumeCents: volume,
    },
    paymentId: input.paymentId || null,
    escrowId: input.escrowId || null,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Gate used by payment state machine — call before transition to settled.
 * Tracks velocity then evaluates.
 */
export function gateSettlement(input) {
  trackVelocity(input.userId, {
    amountCents: input.amountCents,
    counterpartHash: input.counterpartHash || 'merchant',
    escrowId: input.escrowId,
  });
  return evaluateSettlement(input);
}

export function resetAmlRadar(userId) {
  if (userId) velocityByUser.delete(userId);
  else velocityByUser.clear();
}

export function getAmlRadarStatus() {
  return {
    id: 'aml-radar',
    name: 'AML Behavioral Velocity Radar',
    status: 'active',
    windowMs: WINDOW_MS,
    maxTxPerWindow: MAX_TX_PER_WINDOW,
    maxVolumeCentsPerWindow: MAX_VOLUME_CENTS_PER_WINDOW,
    trackedSubjects: velocityByUser.size,
    notes: 'Flags suspicious settlements before escrow release / payment capture',
  };
}

export const AmlRadar = {
  WINDOW_MS,
  trackVelocity,
  evaluateSettlement,
  gateSettlement,
  resetAmlRadar,
  getStatus: getAmlRadarStatus,
};

export default AmlRadar;
