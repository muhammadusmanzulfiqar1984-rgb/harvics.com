/**
 * D1 accessor for HarvyX (OpenNext Cloudflare + local null).
 */

export async function getLeadsDb(): Promise<any | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.LEADS_DB || null;
  } catch {
    return null;
  }
}
