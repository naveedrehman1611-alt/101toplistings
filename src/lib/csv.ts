/**
 * Minimal RFC 4180 CSV reading and writing, for the listings import/export.
 * Handles quoted fields, doubled quotes, commas and line breaks inside quotes,
 * CRLF or LF line ends, and the byte-order mark Excel puts on UTF-8 files.
 */

export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"' && field === '') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Blank lines (often at the end of a file) are not rows.
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/**
 * One CSV field, always quoted. A leading = + - @ (or tab/CR) would make a
 * spreadsheet evaluate the cell as a formula, so such values get an
 * apostrophe in front; unFormula() takes it off again on import.
 */
export function csvField(value: string | number | boolean | null | undefined): string {
  const v = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function csvRow(values: (string | number | boolean | null | undefined)[]): string {
  return `${values.map(csvField).join(',')}\r\n`;
}

/** Reverses csvField's formula guard: "'+92 300" -> "+92 300". */
export function unFormula(v: string): string {
  return /^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v;
}
