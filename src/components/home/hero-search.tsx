'use client';

import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SvgIcon } from '@/components/svg-icon';
import { searchIcon } from '@/components/icon-nodes';
import type { CategoryOption, CityOption, HeroVM } from '@/lib/home-types';
import { Combobox, fold, type ComboboxHandle, type ComboboxItem } from './combobox';

/**
 * The hero's What / Where search: one white pill from md up, a stacked card
 * below. Choosing a category or city submits its slug; What text that was not
 * chosen from the list is a keyword. A plain GET to /search underneath, so it
 * also works before hydration (the What text then submits as q).
 */

type Field = { text: string; value: string | null };

const EMPTY: Field = { text: '', value: null };
const CITY_ERROR = 'Choose a city from the list';

// Each field is a labelled segment: a row in the card, a rounded half of the pill.
const SEGMENT =
  'relative rounded-xl ring-inset has-[input:focus]:ring-2 has-[input:focus]:ring-brand-500 md:rounded-full';
const ROW = 'flex h-14 items-center gap-3 pr-1 pl-4 md:h-[50px] md:pr-2 md:pl-5';
const LABEL = 'shrink-0 cursor-pointer text-sm font-bold text-ink-900';

export function HeroSearch({
  labels,
  categories,
  cities,
}: {
  labels: HeroVM['labels'];
  categories: CategoryOption[];
  cities: CityOption[];
}) {
  const router = useRouter();
  const uid = useId();
  const [what, setWhat] = useState<Field>(EMPTY);
  const [where, setWhere] = useState<Field>(EMPTY);
  // Counts failed submits, so a repeated error re-mounts and is announced again.
  const [whereError, setWhereError] = useState(0);
  const whereRef = useRef<ComboboxHandle>(null);

  const categoryItems = useMemo<ComboboxItem[]>(
    () => categories.map((c) => ({ value: c.slug, label: c.name, depth: c.depth })),
    [categories],
  );
  const cityItems = useMemo<ComboboxItem[]>(
    () => cities.map((c) => ({ value: c.slug, label: c.name })),
    [cities],
  );

  const ids = {
    what: `${uid}-what`,
    whatLabel: `${uid}-what-label`,
    where: `${uid}-where`,
    whereLabel: `${uid}-where-label`,
    whereError: `${uid}-where-error`,
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    const keyword = what.text.trim().slice(0, 100);
    if (what.value) params.set('category', what.value);
    else if (keyword) params.set('q', keyword);

    // A city typed out in full counts as chosen; anything else must come from the list.
    const place = where.text.trim();
    const city =
      where.value ?? (place ? cities.find((c) => fold(c.name) === fold(place))?.slug : undefined);
    if (place && !city) {
      setWhereError((n) => n + 1);
      whereRef.current?.focus();
      return;
    }
    if (city) params.set('city', city);

    const query = params.toString();
    router.push(query ? `/search?${query}` : '/business-directory');
  }

  return (
    <form
      role="search"
      action="/search"
      method="get"
      noValidate
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-[720px] text-left"
    >
      <div className="rounded-2xl bg-white p-2 shadow-[var(--shadow-raised)] md:flex md:h-[66px] md:items-center md:rounded-full">
        <div className={`${SEGMENT} md:flex-[1.55]`}>
          <div className={ROW}>
            <label id={ids.whatLabel} htmlFor={ids.what} className={LABEL}>
              {labels.what}
            </label>
            <Combobox
              id={ids.what}
              labelId={ids.whatLabel}
              label={labels.what}
              name="category"
              textName="q"
              items={categoryItems}
              placeholder={labels.whatPlaceholder}
              text={what.text}
              value={what.value}
              onChange={(text, value) => setWhat({ text, value })}
              allowFreeText
            />
          </div>
        </div>

        <span
          aria-hidden="true"
          className="mx-4 block h-px bg-[var(--border)] md:mx-0 md:h-8 md:w-px md:shrink-0"
        />

        <div className={`${SEGMENT} md:flex-1`}>
          <div className={ROW}>
            <label id={ids.whereLabel} htmlFor={ids.where} className={LABEL}>
              {labels.where}
            </label>
            <Combobox
              ref={whereRef}
              id={ids.where}
              labelId={ids.whereLabel}
              label={labels.where}
              name="city"
              items={cityItems}
              placeholder={labels.wherePlaceholder}
              text={where.text}
              value={where.value}
              onChange={(text, value) => {
                setWhere({ text, value });
                setWhereError(0);
              }}
              errorId={whereError ? ids.whereError : undefined}
            />
          </div>
          {whereError ? (
            <p
              key={whereError}
              id={ids.whereError}
              role="alert"
              className="px-4 pb-2 text-[0.8125rem] font-medium text-red-700 md:absolute md:top-full md:left-2 md:mt-4 md:rounded-lg md:bg-white md:px-3 md:py-2 md:whitespace-nowrap md:shadow-[var(--shadow-raised)]"
            >
              {CITY_ERROR}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          aria-label={labels.submit}
          className="bg-brand-700 hover:bg-brand-800 mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-medium text-white transition-colors md:mt-0 md:ml-2 md:size-12 md:shrink-0 md:rounded-full"
        >
          <SvgIcon node={searchIcon} size={20} strokeWidth={2} />
          <span className="md:sr-only">{labels.submit}</span>
        </button>
      </div>
    </form>
  );
}
