'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { runBulk, type BulkOp } from '@/lib/admin-bulk-actions';
import { Dialog } from './dialog';
import { btn } from './kit';
import { toast } from './toaster';

export type Column = {
  key: string;
  label: string;
  /** A grid track, such as "120px" or "minmax(220px,2.2fr)". Default minmax(110px,1fr). */
  width?: string;
  sortable?: boolean;
};

export type TableRow = {
  id: string;
  /** One node per column, rendered on the server. */
  cells: ReactNode[];
  /** Values the column headers sort by, keyed by column key. */
  sort?: Record<string, string | number | null | undefined>;
  /** Text the search box matches. */
  search?: string;
  /** The value client-side filters compare with. */
  filter?: string;
  /** Row buttons, usually server-action forms. */
  actions?: ReactNode;
  /** False keeps the row out of bulk selection. */
  selectable?: boolean;
  /** Values for "Export selected". */
  csv?: (string | number | null)[];
  /** Highlights the row, e.g. an unread message. */
  emphasis?: boolean;
};

export type Filter = {
  value: string;
  label: string;
  count?: number;
  /** A link filters on the server; without one the table filters loaded rows. */
  href?: string;
};

export type BulkAction = {
  label: string;
  tone?: 'ok' | 'bad';
  op?: BulkOp;
  /** Extra form value the op needs, such as a status. */
  arg?: string;
  confirm?: { title: string; body?: string; ok: string; danger?: boolean };
  /** Downloads the selected rows' `csv` values instead of calling the server. */
  exportCsv?: { filename: string; header: string[] };
  /** A client-only action, for preview screens with no server write yet. */
  run?: (ids: string[]) => void;
};

export type Tab = { label: string; href: string; active: boolean };

function cmp(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function downloadCsv(filename: string, header: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const text = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`Exported ${rows.length} rows to ${filename}`);
}

export function DataTable({
  columns,
  rows,
  filters,
  activeFilter = 'all',
  tabs,
  searchPlaceholder = 'Search…',
  searchParam,
  initialQuery = '',
  bulk,
  actionsWidth,
  pageSize = 20,
  emptyText = 'Nothing matches these filters.',
  footnote,
}: {
  columns: Column[];
  rows: TableRow[];
  filters?: Filter[];
  activeFilter?: string;
  tabs?: Tab[];
  searchPlaceholder?: string;
  /** When set, Enter in the search box searches on the server with ?{searchParam}=. */
  searchParam?: string;
  initialQuery?: string;
  bulk?: BulkAction[];
  /** Width of the Actions column; omit for a table without row actions. */
  actionsWidth?: string;
  pageSize?: number;
  emptyText?: string;
  footnote?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [clientFilter, setClientFilter] = useState('all');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<BulkAction | null>(null);
  const [busy, startBusy] = useTransition();

  const serverFilters = !!filters?.some((f) => f.href);
  const current = serverFilters ? activeFilter : clientFilter;

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter(
      (r) =>
        (serverFilters || clientFilter === 'all' || r.filter === clientFilter) &&
        (!needle || (r.search ?? '').toLowerCase().includes(needle)),
    );
    if (sort)
      list = [...list].sort((a, b) => cmp(a.sort?.[sort.key], b.sort?.[sort.key]) * sort.dir);
    return list;
  }, [rows, q, clientFilter, serverFilters, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pg = Math.min(page, pages - 1);
  const view = visible.slice(pg * pageSize, pg * pageSize + pageSize);
  const hasCheck = !!bulk?.length;
  const pageIds = view.filter((r) => r.selectable !== false).map((r) => r.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => sel.includes(id));

  const grid = [
    hasCheck && '44px',
    ...columns.map((c) => c.width ?? 'minmax(110px,1fr)'),
    actionsWidth,
  ]
    .filter(Boolean)
    .join(' ');

  const runAction = (a: BulkAction) => {
    if (a.exportCsv) {
      const chosen = rows.filter((r) => sel.includes(r.id)).map((r) => r.csv ?? []);
      downloadCsv(a.exportCsv.filename, a.exportCsv.header, chosen);
      return;
    }
    if (a.run) {
      a.run(sel);
      setSel([]);
      return;
    }
    if (!a.op) return;
    const ids = sel;
    startBusy(async () => {
      const res = await runBulk(a.op!, ids, a.arg);
      if (res.failed === 0) toast(`${res.done} ${res.done === 1 ? 'item' : 'items'} updated`);
      else
        toast(`${res.done} updated, ${res.failed} failed${res.error ? `: ${res.error}` : ''}`, {
          tone: 'error',
        });
      setSel([]);
      router.refresh();
    });
  };

  const onBulk = (a: BulkAction) => (a.confirm ? setConfirm(a) : runAction(a));

  const submitSearch = () => {
    if (!searchParam) return;
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set(searchParam, q.trim());
    else next.delete(searchParam);
    router.push(`${pathname}?${next.toString()}`);
  };

  // Page buttons: all of them when few, else a window around the current one.
  const pageNums: (number | '…')[] = [];
  for (let i = 0; i < pages; i++) {
    if (pages <= 7 || i === 0 || i === pages - 1 || Math.abs(i - pg) <= 1) pageNums.push(i);
    else if (pageNums[pageNums.length - 1] !== '…') pageNums.push('…');
  }

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white">
      {tabs?.length ? (
        <div className="flex gap-5 overflow-x-auto border-b border-[#E2E8F0] px-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.active ? 'page' : undefined}
              className="shrink-0 border-b-2 px-0.5 pt-3.5 pb-3 text-[13.5px] font-semibold whitespace-nowrap hover:no-underline"
              style={{
                color: t.active ? '#062347' : '#64748B',
                borderColor: t.active ? '#0C8226' : 'transparent',
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {filters?.map((f) => {
            const on = current === f.value;
            const count =
              f.count ??
              (f.value === 'all' ? rows.length : rows.filter((r) => r.filter === f.value).length);
            const cls =
              'flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold whitespace-nowrap hover:no-underline';
            const style = {
              background: on ? '#062347' : '#fff',
              color: on ? '#fff' : '#334155',
              borderColor: on ? '#062347' : '#E2E8F0',
            };
            const body = (
              <>
                {f.label}
                <span className="text-[11.5px] opacity-70">{count}</span>
              </>
            );
            return f.href ? (
              <Link key={f.value} href={f.href} className={cls} style={style}>
                {body}
              </Link>
            ) : (
              <button
                key={f.value}
                type="button"
                className={cls}
                style={style}
                onClick={() => {
                  setClientFilter(f.value);
                  setPage(0);
                  setSel([]);
                }}
              >
                {body}
              </button>
            );
          })}
        </div>
        <form
          role="search"
          className="relative ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 w-[260px] max-w-full rounded-lg border border-[#E2E8F0] pr-2.5 pl-[30px] text-[13px] outline-none focus:border-[#1884E7]"
          />
          <svg
            aria-hidden
            className="absolute top-[9px] left-2.5 text-[#94A3B8]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </form>
      </div>

      {hasCheck && sel.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 bg-[#062347] px-4 py-2 text-[13px] text-white">
          <b className="mr-2 font-semibold">{sel.length} selected</b>
          {bulk!.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={busy}
              onClick={() => onBulk(a)}
              className="h-7 cursor-pointer rounded-md border border-white/25 bg-transparent px-2.5 text-[12.5px] font-semibold hover:bg-white/10 disabled:opacity-50"
              style={{ color: a.tone === 'bad' ? '#FCA5A5' : a.tone === 'ok' ? '#86EFAC' : '#fff' }}
            >
              {a.label}
            </button>
          ))}
          {busy ? <span className="text-[#CBD5E1]">Working…</span> : null}
          <button
            type="button"
            onClick={() => setSel([])}
            className="ml-auto cursor-pointer border-0 bg-transparent text-[12.5px] text-[#CBD5E1]"
          >
            Clear selection
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <div role="table" className="min-w-fit">
          <div
            role="row"
            className="grid border-b border-[#E2E8F0] bg-[#F8FAFC]"
            style={{ gridTemplateColumns: grid }}
          >
            {hasCheck ? (
              <div className="flex items-center py-2.5 pl-4">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={allChecked}
                  onChange={() =>
                    setSel(
                      allChecked
                        ? sel.filter((i) => !pageIds.includes(i))
                        : [...new Set([...sel, ...pageIds])],
                    )
                  }
                  className="size-[15px] accent-[#0C8226]"
                />
              </div>
            ) : null}
            {columns.map((c) => {
              const on = sort?.key === c.key;
              return (
                <div key={c.key} role="columnheader" className="px-3 py-2.5">
                  {c.sortable === false ? (
                    <span className="text-xs font-semibold tracking-[.04em] whitespace-nowrap text-[#64748B] uppercase">
                      {c.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSort({ key: c.key, dir: on && sort!.dir === 1 ? -1 : 1 })}
                      className="inline-flex cursor-pointer gap-1 border-0 bg-transparent p-0 text-xs font-semibold tracking-[.04em] whitespace-nowrap uppercase"
                      style={{ color: on ? '#062347' : '#64748B' }}
                    >
                      {c.label}
                      <span aria-hidden>{on ? (sort!.dir === 1 ? '↑' : '↓') : ''}</span>
                    </button>
                  )}
                </div>
              );
            })}
            {actionsWidth ? (
              <div className="px-4 py-2.5 text-right text-xs font-semibold tracking-[.04em] text-[#64748B] uppercase">
                Actions
              </div>
            ) : null}
          </div>

          {view.map((r) => {
            const checked = sel.includes(r.id);
            return (
              <div
                key={r.id}
                role="row"
                className="grid border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                style={{
                  gridTemplateColumns: grid,
                  background: checked ? '#F0FDF4' : undefined,
                }}
              >
                {hasCheck ? (
                  <div className="flex items-center pl-4">
                    {r.selectable !== false ? (
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={checked}
                        onChange={() =>
                          setSel(checked ? sel.filter((i) => i !== r.id) : [...sel, r.id])
                        }
                        className="size-[15px] accent-[#0C8226]"
                      />
                    ) : null}
                  </div>
                ) : null}
                {r.cells.map((cell, i) => (
                  <div
                    key={columns[i]?.key ?? i}
                    role="cell"
                    className={`flex min-w-0 flex-col items-start justify-center gap-[3px] px-3 py-3 text-[13.5px] text-[#062347] ${
                      r.emphasis && i <= 1 ? 'font-semibold' : ''
                    }`}
                  >
                    {cell}
                  </div>
                ))}
                {actionsWidth ? (
                  <div className="flex flex-wrap items-center justify-end gap-0.5 px-3 py-2">
                    {r.actions}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-[#64748B]">{emptyText}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 text-[13px] text-[#64748B]">
        <span className="flex-1">
          {visible.length
            ? `Showing ${pg * pageSize + 1}–${Math.min(visible.length, pg * pageSize + pageSize)} of ${visible.length}`
            : '0 results'}
          {footnote ? <span className="ml-2">· {footnote}</span> : null}
        </span>
        <button
          type="button"
          disabled={pg === 0}
          onClick={() => setPage(pg - 1)}
          className="h-[30px] cursor-pointer rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[13px] text-[#062347] disabled:cursor-default disabled:opacity-50"
        >
          ‹ Prev
        </button>
        {pageNums.map((n, i) =>
          n === '…' ? (
            <span key={`gap${i}`} className="px-1">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              aria-current={n === pg ? 'page' : undefined}
              onClick={() => setPage(n)}
              className="size-[30px] cursor-pointer rounded-md border text-[13px] font-semibold"
              style={{
                background: n === pg ? '#062347' : '#fff',
                color: n === pg ? '#fff' : '#062347',
                borderColor: n === pg ? '#062347' : '#E2E8F0',
              }}
            >
              {n + 1}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={pg >= pages - 1}
          onClick={() => setPage(pg + 1)}
          className="h-[30px] cursor-pointer rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[13px] text-[#062347] disabled:cursor-default disabled:opacity-50"
        >
          Next ›
        </button>
      </div>

      {confirm ? (
        <Dialog
          title={confirm.confirm!.title.replace('{n}', String(sel.length))}
          body={confirm.confirm!.body}
          onCancel={() => setConfirm(null)}
          footer={
            <>
              <button type="button" className={btn.secondary} onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                className={confirm.confirm!.danger ? btn.danger : btn.primary}
                onClick={() => {
                  const a = confirm;
                  setConfirm(null);
                  runAction(a);
                }}
              >
                {confirm.confirm!.ok}
              </button>
            </>
          }
        />
      ) : null}
    </div>
  );
}
