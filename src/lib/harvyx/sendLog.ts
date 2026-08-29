/**
 * Local send archive for HarvyX outreach (Phase 1).
 * Append-only JSONL under data/harvyx — not for multi-tenant SaaS.
 */

import { promises as fs } from 'fs';
import path from 'path';

export type SendLogEntry = {
  id: string;
  at: string;
  to: string;
  subject: string;
  body: string;
  leadId?: string | null;
  provider: 'resend' | 'sendgrid' | 'twilio';
  channel?: 'email' | 'sms' | 'whatsapp';
  messageId?: string | null;
  status: 'sent' | 'failed';
  error?: string;
};

const LOG_DIR = path.join(process.cwd(), 'src', 'data', 'harvyx');
const LOG_FILE = path.join(LOG_DIR, 'send-log.jsonl');

export async function appendSendLog(entry: Omit<SendLogEntry, 'id' | 'at'> & { id?: string; at?: string }) {
  const row: SendLogEntry = {
    id: entry.id || `send_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at || new Date().toISOString(),
    to: entry.to,
    subject: entry.subject,
    body: entry.body,
    leadId: entry.leadId ?? null,
    provider: entry.provider || 'resend',
    channel: entry.channel,
    messageId: entry.messageId ?? null,
    status: entry.status,
    error: entry.error,
  };
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(LOG_FILE, `${JSON.stringify(row)}\n`, 'utf8');
  return row;
}

export async function recentSendLogs(limit = 20): Promise<SendLogEntry[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    const lines = raw.trim().split('\n').filter(Boolean);
    return lines
      .slice(-Math.max(1, limit))
      .map((l) => JSON.parse(l) as SendLogEntry)
      .reverse();
  } catch {
    return [];
  }
}
