/**
 * Optional fire-and-forget writeback from Hx workers → HarvyX D1 API.
 * Set HX_D1_WRITEBACK_URL=https://www.harvics.com/api/harvyx/writeback
 * and HARVYX_API_KEY (or HX_D1_WRITEBACK_KEY).
 */

import { hxLogger } from './hx-logger';

const MODULE = 'hx-d1-writeback';

export type HxWritebackContact = {
  source?: string | null;
  source_id?: string | null;
  email_pattern?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  title?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  company_domain?: string | null;
  icp_score?: number | null;
  enriched_apollo?: boolean | null;
  enriched_lusha?: boolean | null;
  email_verified?: boolean | null;
  raw_json?: Record<string, unknown> | null;
};

export async function writebackContactsToD1(
  contacts: HxWritebackContact[],
): Promise<{ ok: boolean; skipped?: string; status?: number }> {
  const url = (process.env.HX_D1_WRITEBACK_URL || '').trim();
  if (!url) return { ok: false, skipped: 'HX_D1_WRITEBACK_URL unset' };
  if (!contacts.length) return { ok: true, skipped: 'empty' };

  const key =
    (process.env.HX_D1_WRITEBACK_KEY || process.env.HARVYX_API_KEY || '').trim();

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (key) headers['x-api-key'] = key;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contacts }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      hxLogger.warn(MODULE, `writeback HTTP ${res.status}`, { body: text.slice(0, 200) });
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    hxLogger.warn(MODULE, 'writeback failed', err);
    return { ok: false };
  }
}
