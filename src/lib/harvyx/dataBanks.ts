import sourceLibrary from '@/data/harvyx/source-library.json';
import eventLibrary from '@/data/harvyx/event-library.json';

export type LibraryEntry = {
  kind: 'source' | 'fair' | 'event_edition';
  title: string;
  category: string;
  tags: string[];
  sourceUrl: string | null;
};

export function friendlySourceLabel(sourceFile: string): string {
  if (!sourceFile) return 'Unknown import';
  if (sourceFile === 'live') return 'Live discover';

  let name = String(sourceFile).replace(/\\/g, '/');
  const dataIdx = name.indexOf('/DATA/');
  if (dataIdx >= 0) name = name.slice(dataIdx + 6);
  else {
    const slash = name.lastIndexOf('/');
    if (slash >= 0) name = name.slice(slash + 1);
  }
  name = name.replace(/\.(csv|xlsx|xls|tsv)$/i, '').trim();
  if (name.length > 72) name = `${name.slice(0, 69)}…`;
  return name || 'Import file';
}

export function buildLibraryEntries(): LibraryEntry[] {
  const entries: LibraryEntry[] = [];
  const lib = eventLibrary as Record<string, any>;

  for (const source of sourceLibrary as Array<Record<string, any>>) {
    entries.push({
      kind: 'source',
      title: source.name || 'Unknown Source',
      category: source.category || 'lead_source',
      tags: [source.mode, source.enabled ? 'enabled' : 'disabled'].filter(Boolean),
      sourceUrl: null,
    });
  }

  for (const fair of lib.fairsIntel || []) {
    entries.push({
      kind: 'fair',
      title: fair.event || 'Unknown Fair',
      category: 'fairs_intel',
      tags: [fair.city, fair.country, fair.editionYear, fair.exhibitors, fair.visitors].filter(Boolean),
      sourceUrl: fair.sourceUrl || null,
    });
  }

  for (const fair of lib.easternEuropeFairs || []) {
    entries.push({
      kind: 'fair',
      title: fair.event || 'Unknown Eastern Europe Fair',
      category: 'eastern_europe',
      tags: [fair.city, fair.country, fair.edition, fair.exhibitors, fair.visitors].filter(Boolean),
      sourceUrl: fair.sourceUrl || null,
    });
  }

  for (const y of lib.years || []) {
    for (const ed of y.editions || []) {
      entries.push({
        kind: 'event_edition',
        title: `${lib.event || 'Event'} ${y.year || ''} ${ed.season || ''}`.trim(),
        category: 'event_editions',
        tags: [ed.city, ed.country, ed.month, ed.status].filter(Boolean),
        sourceUrl: null,
      });
    }
  }

  return entries;
}

export function searchLibraryCatalog(query: string, limit = 12): LibraryEntry[] {
  const q = String(query || '').trim().toLowerCase();
  const entries = buildLibraryEntries();
  if (!q) return entries.slice(0, limit);

  return entries
    .filter((entry) => {
      const blob = [entry.kind, entry.title, entry.category, ...(entry.tags || []), entry.sourceUrl || '']
        .join(' ')
        .toLowerCase();
      return q.split(/\s+/).some((t) => t.length > 1 && blob.includes(t));
    })
    .slice(0, limit);
}

export function getEventLibrarySnapshot() {
  const lib = eventLibrary as Record<string, any>;
  return {
    event: lib.event,
    fairsIntel: lib.fairsIntel || [],
    easternEuropeFairs: lib.easternEuropeFairs || [],
    years: lib.years || [],
  };
}

export function countCatalogSources(): number {
  return (sourceLibrary as unknown[]).length;
}
