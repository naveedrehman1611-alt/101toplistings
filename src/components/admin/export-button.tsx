'use client';

import { btn } from './kit';
import { toast } from './toaster';

/** Downloads rows already on the page as a CSV file. */
export function ExportCsvButton({
  filename,
  header,
  rows,
  label = 'Export CSV',
  primary = false,
}: {
  filename: string;
  header: string[];
  rows: (string | number | null)[][];
  label?: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={primary ? btn.primary : btn.secondary}
      onClick={() => {
        const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const text = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        toast(`Exported ${rows.length} rows to ${filename}`);
      }}
    >
      {label}
    </button>
  );
}
