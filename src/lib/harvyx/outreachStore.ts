import outreachRaw from '@/data/harvyx/outreach.json';

export type OutreachItem = Record<string, unknown> & {
  id: string;
  status?: string;
  channel?: string;
  linkedin?: string;
  message?: string;
  target?: string;
};

/** Shared in-memory outreach queue (dev). All HarvyX outreach routes use this singleton. */
const items: OutreachItem[] = [...(Array.isArray(outreachRaw) ? outreachRaw : [])] as OutreachItem[];

export function getOutreachItems(): OutreachItem[] {
  return items;
}

export function findOutreachItem(id: string): OutreachItem | undefined {
  return items.find((item) => item.id === id);
}

export function addOutreachItem(item: OutreachItem) {
  items.unshift(item);
  return item;
}

export function updateOutreachItem(id: string, patch: Partial<OutreachItem>) {
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  return items[idx];
}
