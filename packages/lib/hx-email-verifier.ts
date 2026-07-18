/**
 * hx-email-verifier — SMTP handshake verification (no email sent)
 * Source: HARVYX_BACKEND_RULES.md § 8
 * Rules:
 *   - Never send email. RCPT TO handshake only.
 *   - 5-second socket timeout on every TCP operation.
 *   - FROM address from HX_SMTP_VERIFY_FROM env var.
 *   - Max 50 concurrent sockets enforced by internal semaphore.
 *   - Handles DNS failure, socket timeout, connection refused gracefully.
 *   - Returns first verified email or null.
 */

import * as dns  from 'dns/promises';
import * as net  from 'net';
import { hxLogger } from './hx-logger';

const MODULE = 'hx-email-verifier';
const SOCKET_TIMEOUT_MS = 5_000;
const MAX_CONCURRENT    = 50;
const VERIFY_FROM       = process.env.HX_SMTP_VERIFY_FROM ?? 'verify@harvics.com';

// ── Semaphore ─────────────────────────────────────────────────────────────────

let _active = 0;
const _queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    if (_active < MAX_CONCURRENT) {
      _active++;
      resolve();
    } else {
      _queue.push(() => { _active++; resolve(); });
    }
  });
}

function releaseSlot(): void {
  _active--;
  const next = _queue.shift();
  if (next) next();
}

// ── Email pattern generation ──────────────────────────────────────────────────

/**
 * inferEmailPatterns
 * Returns up to 5 candidate email addresses from first name, last name, domain.
 * Always returns exactly 5 entries; silently deduplicates.
 */
export function inferEmailPatterns(
  firstName: string,
  lastName: string,
  domain: string,
): string[] {
  const f  = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const l  = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const d  = domain.trim().toLowerCase();
  const fi = f.charAt(0);

  const candidates = [
    `${f}.${l}@${d}`,       // john.smith@domain.com
    `${fi}.${l}@${d}`,      // j.smith@domain.com
    `${f}@${d}`,            // john@domain.com
    `${f}${l}@${d}`,        // johnsmith@domain.com
    `${fi}${l}@${d}`,       // jsmith@domain.com
  ];

  // Deduplicate while preserving order
  return [...new Set(candidates)].slice(0, 5);
}

// ── MX lookup ─────────────────────────────────────────────────────────────────

async function getMxHost(domain: string): Promise<string | null> {
  try {
    const records = await dns.resolveMx(domain);
    if (!records.length) return null;
    records.sort((a, b) => a.priority - b.priority);
    return records[0].exchange;
  } catch {
    hxLogger.debug(MODULE, 'MX lookup failed', { domain });
    return null;
  }
}

// ── Raw SMTP handshake ────────────────────────────────────────────────────────

function smtpHandshake(
  mxHost: string,
  emailAddress: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const lines: string[] = [];

    function settle(result: boolean): void {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch { /* ignore */ }
      resolve(result);
    }

    const socket = net.createConnection({ host: mxHost, port: 25 });
    socket.setTimeout(SOCKET_TIMEOUT_MS);

    let step: 'greeting' | 'ehlo' | 'from' | 'rcpt' | 'quit' = 'greeting';

    function send(cmd: string): void {
      socket.write(cmd + '\r\n');
    }

    function onLine(line: string): void {
      const code = parseInt(line.slice(0, 3), 10);
      const isFinal = line.charAt(3) === ' ';
      if (!isFinal) return; // multi-line response, wait for last segment

      hxLogger.debug(MODULE, `smtp ← ${line}`, { step, emailAddress });

      switch (step) {
        case 'greeting':
          if (code === 220) { step = 'ehlo'; send(`EHLO harvics.com`); }
          else settle(false);
          break;

        case 'ehlo':
          if (code === 250) { step = 'from'; send(`MAIL FROM:<${VERIFY_FROM}>`); }
          else settle(false);
          break;

        case 'from':
          if (code === 250) { step = 'rcpt'; send(`RCPT TO:<${emailAddress}>`); }
          else settle(false);
          break;

        case 'rcpt':
          step = 'quit';
          send('QUIT');
          // 250 or 251 → address accepted
          settle(code === 250 || code === 251);
          break;

        default:
          settle(false);
      }
    }

    let buf = '';
    socket.on('data', (chunk: Buffer) => {
      buf += chunk.toString('utf8');
      const parts = buf.split('\r\n');
      buf = parts.pop() ?? '';
      for (const part of parts) {
        if (part) {
          lines.push(part);
          onLine(part);
        }
      }
    });

    socket.on('timeout', () => {
      hxLogger.debug(MODULE, 'socket timeout', { mxHost, emailAddress });
      settle(false);
    });

    socket.on('error', (err: NodeJS.ErrnoException) => {
      hxLogger.debug(MODULE, 'socket error', {
        mxHost,
        emailAddress,
        code: err.code,
      });
      settle(false);
    });

    socket.on('close', () => settle(false));
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * smtpVerify
 * Tries each candidate email in order.
 * Returns the first address that passes an SMTP RCPT TO handshake, or null.
 */
export async function smtpVerify(candidates: string[]): Promise<string | null> {
  if (!candidates.length) return null;

  for (const email of candidates) {
    const domain = email.split('@')[1];
    if (!domain) continue;

    await acquireSlot();
    try {
      const mxHost = await getMxHost(domain);
      if (!mxHost) {
        hxLogger.debug(MODULE, 'no MX record', { domain });
        continue;
      }

      const verified = await smtpHandshake(mxHost, email);
      if (verified) {
        hxLogger.info(MODULE, 'email verified', { email });
        return email;
      }
    } catch (err) {
      hxLogger.warn(MODULE, 'smtpVerify error', err instanceof Error ? err : { err });
    } finally {
      releaseSlot();
    }
  }

  return null;
}
