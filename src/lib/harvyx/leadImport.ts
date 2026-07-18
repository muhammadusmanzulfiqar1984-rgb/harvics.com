import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

export type LeadRecord = Record<string, any>;

const FIELD_ALIASES: Record<string, string[]> = {
  company: ['company', 'company name', 'organization', 'organisation', 'account', 'employer', 'business'],
  contactName: ['name', 'full name', 'contact', 'contact name', 'person', 'lead name'],
  firstName: ['first name', 'firstname', 'given name'],
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  title: ['title', 'job title', 'position', 'role', 'designation'],
  email: ['email', 'email address', 'work email', 'e-mail', 'business email'],
  phone: ['phone', 'phone number', 'mobile', 'direct dial', 'telephone', 'tel', 'cell'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile', 'profile url', 'li url'],
  website: ['website', 'company website', 'domain', 'url', 'web'],
  country: ['country', 'country/region'],
  city: ['city', 'town', 'location'],
  segment: ['segment', 'industry', 'sector', 'vertical', 'category'],
};

export const SUPPORTED_IMPORT_EXT = ['.csv', '.tsv', '.txt', '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods'];

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

export function readSheetsFromBuffer(fileName: string, buffer: Buffer): { name: string; rows: string[][] }[] | null {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (ext === '.csv') {
    return [{ name: 'csv', rows: parseDelimited(buffer.toString('utf8'), ',') }];
  }
  if (ext === '.tsv' || ext === '.txt') {
    return [{ name: 'tsv', rows: parseDelimited(buffer.toString('utf8'), '\t') }];
  }
  if (SUPPORTED_IMPORT_EXT.includes(ext) && ext !== '.csv' && ext !== '.tsv' && ext !== '.txt') {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    return wb.SheetNames.map((name) => {
      const rows = XLSX.utils
        .sheet_to_json(wb.Sheets[name], {
          header: 1,
          blankrows: false,
          defval: '',
          raw: false,
        })
        .map((r: any) => (r as string[]).map((v) => String(v ?? '').trim()));
      return { name, rows: rows.filter((r) => r.some((v) => v !== '')) };
    });
  }
  return null;
}

function buildHeaderMap(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, idx) => {
    const norm = String(h).trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(norm)) {
        map[field] = idx;
        break;
      }
    }
  });
  return map;
}

function cell(row: string[], map: Record<string, number>, field: string) {
  const idx = map[field];
  if (idx === undefined) return '';
  return String(row[idx] ?? '').trim();
}

function makeId(rec: LeadRecord) {
  const basis = (rec.email || rec.linkedin || `${rec.contactName}|${rec.company}`).toLowerCase();
  return `lead_csv_${createHash('sha1').update(basis).digest('hex').slice(0, 16)}`;
}

function scoreLead(rec: LeadRecord) {
  let s = 40;
  if (rec.email) s += 20;
  if (rec.phone) s += 15;
  if (rec.linkedin) s += 10;
  if (rec.title) s += 10;
  if (rec.company) s += 5;
  return Math.min(s, 99);
}

export function mergeLeadsFromFile(
  existing: LeadRecord[],
  fileName: string,
  buffer: Buffer,
): { merged: LeadRecord[]; added: number; skipped: number; mappedFields: string[] } {
  const sheets = readSheetsFromBuffer(fileName, buffer);
  if (!sheets?.length) {
    throw new Error(`Unsupported file type: ${fileName}`);
  }

  const byId = new Map(existing.map((l) => [l.id, l]));
  const seenKeys = new Set(
    existing.map((l) => (l.email || l.linkedin || `${l.contactName}|${l.company}`).toLowerCase()),
  );

  let added = 0;
  let skipped = 0;
  const mappedFieldsSet = new Set<string>();
  const now = new Date().toISOString();

  for (const sheet of sheets) {
    const label = sheets.length > 1 ? `${fileName} [${sheet.name}]` : fileName;
    const rows = sheet.rows;
    if (rows.length < 2) continue;

    const headerMap = buildHeaderMap(rows[0]);
    const mappedFields = Object.keys(headerMap);
    if (!mappedFields.length) {
      throw new Error(`No recognizable columns in ${fileName}. Headers: ${rows[0].join(', ')}`);
    }
    mappedFields.forEach((f) => mappedFieldsSet.add(f));

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let contactName = cell(row, headerMap, 'contactName');
      if (!contactName) {
        const fn = cell(row, headerMap, 'firstName');
        const ln = cell(row, headerMap, 'lastName');
        contactName = [fn, ln].filter(Boolean).join(' ').trim();
      }
      const rec = {
        company: cell(row, headerMap, 'company'),
        contactName,
        title: cell(row, headerMap, 'title'),
        email: cell(row, headerMap, 'email'),
        phone: cell(row, headerMap, 'phone'),
        linkedin: cell(row, headerMap, 'linkedin'),
        website: cell(row, headerMap, 'website'),
        country: cell(row, headerMap, 'country'),
        city: cell(row, headerMap, 'city'),
        segment: cell(row, headerMap, 'segment'),
      };
      if (!rec.company && !rec.contactName && !rec.email) {
        skipped++;
        continue;
      }

      const key = (rec.email || rec.linkedin || `${rec.contactName}|${rec.company}`).toLowerCase();
      if (seenKeys.has(key)) {
        skipped++;
        continue;
      }
      seenKeys.add(key);

      const lead: LeadRecord = {
        id: makeId(rec),
        source: 'upload',
        sourceFile: label,
        ...rec,
        tags: [],
        status: 'new',
        score: scoreLead(rec),
        createdAt: now,
        updatedAt: now,
      };
      byId.set(lead.id, lead);
      added++;
    }
  }

  return {
    merged: Array.from(byId.values()),
    added,
    skipped,
    mappedFields: Array.from(mappedFieldsSet),
  };
}

export function buildSearchText(lead: LeadRecord): string {
  return [
    lead.company,
    lead.contactName,
    lead.title,
    lead.email,
    lead.phone,
    lead.linkedin,
    lead.website,
    lead.country,
    lead.city,
    lead.segment,
    lead.sourceFile,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
