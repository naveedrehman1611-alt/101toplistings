import { Icon, type IconName } from '@/components/icon';

/**
 * Category header on the hub: icon tile, h2 and a count pill, over a grey rule
 * with a short green bar on its left end.
 */
export function HubSectionHeader({
  id,
  icon,
  title,
  count,
}: {
  /** Id of the h2, for the section's aria-labelledby. */
  id: string;
  icon: IconName;
  title: string;
  count: string;
}) {
  return (
    <div className="border-border-subtle after:bg-primary-container relative mb-7 flex items-center gap-4 border-b-2 pb-4 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-12">
      <span className="bg-brand-50 border-brand-200 text-primary-container flex size-12 shrink-0 items-center justify-center rounded-xl border">
        <Icon name={icon} size={24} />
      </span>
      <h2 id={id} className="font-display text-on-surface text-[22px] leading-tight font-extrabold">
        {title}
      </h2>
      <span className="text-primary-container bg-brand-50 border-brand-200 ml-auto shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap">
        {count}
      </span>
    </div>
  );
}
