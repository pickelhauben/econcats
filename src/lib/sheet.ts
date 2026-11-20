// Load site content from published Google Sheets CSVs at build time.
//
// Each collection (events, projects, board, …) has a CSV URL in src/data/sources.json.
// If the URL is empty, the fetch fails, or the sheet has no rows, we fall back to the
// matching JSON file in src/data and log a warning. The build never fails because of the sheet.

export type Row = Record<string, string | boolean | string[]>;

export interface LoadOptions {
  /** Columns holding comma-separated lists, e.g. photos or org. */
  listFields?: string[];
  /** Columns the pages rely on; missing ones are reported as a warning. */
  expectedColumns?: string[];
  /** Fetch timeout in milliseconds (default 10 s). */
  timeoutMs?: number;
}

/**
 * Parse CSV text into rows of cells. Handles quoted fields, commas and line breaks
 * inside quotes, escaped quotes (""), CRLF line endings and a leading BOM.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row);
      row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  // Last cell / row (file may not end with a newline)
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

/** Turn a single cell into its typed value. */
function coerce(value: string, isList: boolean): string | boolean | string[] {
  const v = value.trim();
  if (isList) return v === '' ? [] : v.split(',').map((x) => x.trim()).filter(Boolean);
  if (/^true$/i.test(v)) return true;
  if (/^false$/i.test(v)) return false;
  return v;
}

/** Convert parsed CSV (first row = column names) into typed objects. Blank rows are dropped. */
export function rowsToObjects(rows: string[][], listFields: string[] = []): Row[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => {
      const obj: Row = {};
      headers.forEach((h, i) => {
        if (!h) return; // ignore unnamed helper columns in the sheet
        obj[h] = coerce(r[i] ?? '', listFields.includes(h));
      });
      return obj;
    });
}

/**
 * Load one collection. Returns sheet rows when available, otherwise the JSON fallback.
 * Never throws.
 */
export async function loadCollection<T>(
  name: string,
  url: string | undefined,
  fallback: T[],
  opts: LoadOptions = {},
): Promise<T[]> {
  const { listFields = [], expectedColumns = [], timeoutMs = 10_000 } = opts;

  if (!url || !url.trim()) {
    console.warn(`[sheet] ${name}: no CSV URL in src/data/sources.json, using src/data/${name}.json`);
    return fallback;
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) {
      throw new Error('got a web page instead of CSV (is the tab published as CSV?)');
    }

    const rows = parseCsv(text);
    const headers = (rows[0] ?? []).map((h) => h.trim());
    const missing = expectedColumns.filter((c) => !headers.includes(c));
    if (missing.length) {
      console.warn(`[sheet] ${name}: sheet is missing column(s) ${missing.join(', ')}`);
    }

    const data = rowsToObjects(rows, listFields) as T[];
    console.log(`[sheet] ${name}: ${data.length} row(s) from Google Sheets`);
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[sheet] ${name}: could not load the sheet (${msg}), using src/data/${name}.json`);
    return fallback;
  }
}
