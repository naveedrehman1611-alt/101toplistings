'use client';

import { useState } from 'react';
import { DataTable, type TableRow } from './data-table';
import { Dialog, useDialog } from './dialog';
import { FormField, btn, inputCls, rowAct, selectCls } from './kit';
import { toast } from './toaster';

export type CatalogItem = { id: string; name: string; group: string; count: number; slug: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Areas and Amenities: real rows from the database, with Add and Delete that
 * only change this screen for now (no save actions exist for these tables
 * yet). Every such change says so in its toast.
 */
export function CatalogPreview({
  noun,
  nameLabel,
  groupLabel,
  groups,
  items: initial,
  countNoun,
}: {
  noun: string;
  nameLabel: string;
  /** Column and select label for the grouping, such as City; omit for none. */
  groupLabel?: string;
  groups: string[];
  items: CatalogItem[];
  /** What the count counts, singular, such as "listing". */
  countNoun: string;
}) {
  const countLabel = (n: number) => `${n} ${countNoun}${n === 1 ? '' : 's'}`;
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [group, setGroup] = useState(groups[0] ?? '');
  const { ask, node } = useDialog();

  const remove = (ids: string[]) => {
    const before = items;
    setItems(items.filter((i) => !ids.includes(i.id)));
    toast(
      `${ids.length > 1 ? `${ids.length} ${noun}s` : `1 ${noun}`} removed (preview — not saved)`,
      {
        undo: () => setItems(before),
      },
    );
  };

  const rows: TableRow[] = items.map((x) => ({
    id: x.id,
    filter: x.group,
    search: `${x.name} ${x.group} ${x.slug}`,
    sort: { name: x.name, group: x.group, count: x.count, slug: x.slug },
    cells: [
      <div key="n" className="max-w-full truncate font-semibold">
        {x.name}
      </div>,
      ...(groupLabel
        ? [
            <div key="g" className="max-w-full truncate">
              {x.group || '—'}
            </div>,
          ]
        : []),
      <div key="c">{countLabel(x.count)}</div>,
      <code
        key="s"
        className="max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]"
      >
        {x.slug}
      </code>,
    ],
    actions: (
      <button
        type="button"
        className={rowAct.bad}
        onClick={() =>
          ask({
            title: `Delete ${x.name}?`,
            body: x.count
              ? `It is used by ${countLabel(x.count)}. Preview only: nothing is deleted yet.`
              : 'Preview only: nothing is deleted yet.',
            ok: 'Delete',
            danger: true,
            onOk: () => remove([x.id]),
          })
        }
      >
        Delete
      </button>
    ),
  }));

  return (
    <>
      <div className="-mt-1 flex justify-end">
        <button type="button" className={btn.primary} onClick={() => setAdding(true)}>
          Add {noun}
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: nameLabel, width: 'minmax(200px,1.4fr)' },
          ...(groupLabel ? [{ key: 'group', label: groupLabel }] : []),
          { key: 'count', label: 'Used by', width: '130px' },
          { key: 'slug', label: 'Slug', width: 'minmax(200px,1.4fr)' },
        ]}
        rows={rows}
        filters={
          groups.length
            ? [{ value: 'all', label: 'All' }, ...groups.map((g) => ({ value: g, label: g }))]
            : undefined
        }
        searchPlaceholder={`Search ${noun === 'amenity' ? 'amenities' : `${noun}s`}…`}
        actionsWidth="120px"
        emptyText={`No ${noun === 'amenity' ? 'amenities' : `${noun}s`} yet.`}
        bulk={[
          {
            label: 'Delete',
            tone: 'bad',
            run: (ids) =>
              ask({
                title: `Delete ${ids.length} ${noun === 'amenity' ? 'amenities' : `${noun}s`}?`,
                body: 'Preview only: nothing is deleted yet.',
                ok: 'Delete',
                danger: true,
                onOk: () => remove(ids),
              }),
          },
        ]}
      />
      {node}
      {adding ? (
        <Dialog
          title={`Add ${noun}`}
          body="Preview only: the new row appears here but is not saved yet."
          onCancel={() => setAdding(false)}
          footer={
            <>
              <button type="button" className={btn.secondary} onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={btn.primary}
                disabled={!name.trim()}
                onClick={() => {
                  const n = name.trim();
                  setItems([
                    { id: `new-${Date.now()}`, name: n, group, count: 0, slug: slugify(n) },
                    ...items,
                  ]);
                  setAdding(false);
                  setName('');
                  toast(`${n} added (preview — not saved)`);
                }}
              >
                Add {noun}
              </button>
            </>
          }
        >
          <FormField label={nameLabel} htmlFor="cat-name" required>
            <input
              id="cat-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </FormField>
          {groupLabel && groups.length ? (
            <FormField label={groupLabel} htmlFor="cat-group">
              <select
                id="cat-group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className={selectCls}
              >
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}
        </Dialog>
      ) : null}
    </>
  );
}
