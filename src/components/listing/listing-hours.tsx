import type { OpeningHour } from '@/lib/queries';
import { DAYS, hoursLabel, mondayFirst } from '@/lib/hours';
import { OpenStatusBadge } from './open-status-badge';

/**
 * The week as the listing stored it, Monday first. Days without a row are left
 * out rather than guessed. The live Open/Closed badge is worked out in the
 * browser (see OpenStatusBadge), so this stays safe to cache.
 */
export function ListingHours({ hours }: { hours: OpeningHour[] }) {
  const rows = mondayFirst(
    hours.filter(
      (h) => Number.isInteger(h.day_of_week) && h.day_of_week >= 0 && h.day_of_week <= 6,
    ),
  );
  if (rows.length === 0) return null;

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-title-md text-title-md text-on-surface">Hours</h2>
        <OpenStatusBadge hours={rows} showDetail />
      </div>
      <table className="font-body-md text-body-md text-on-surface mt-4 w-full">
        <caption className="sr-only">Opening hours</caption>
        <tbody>
          {rows.map((h) => (
            <tr
              key={h.day_of_week}
              className={`border-border-subtle border-b last:border-0 ${h.is_closed ? 'text-secondary' : ''}`}
            >
              <th scope="row" className="font-label-md text-label-md py-2 pr-4 text-left">
                {DAYS[h.day_of_week]}
              </th>
              <td className="py-2 text-right">{hoursLabel(h)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-body-sm text-body-sm text-secondary mt-3">
        Times are local (Pakistan time).
      </p>
    </section>
  );
}
