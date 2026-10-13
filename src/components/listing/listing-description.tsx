import { ExpandableText } from './expandable-text';
import type { ListingContent } from '@/lib/content/pages/directory';

/** Descriptions longer than this start clamped. Decided from the text, never measured. */
const COLLAPSE_AFTER_CHARS = 600;

export function ListingDescription({
  text,
  labels,
}: {
  text: string | null;
  labels: ListingContent['description'];
}) {
  const body = text?.trim();
  if (!body) return null;

  return (
    <section className="mt-10">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{labels.heading}</h2>
      <div className="mt-3">
        <ExpandableText
          text={body}
          collapsible={body.length > COLLAPSE_AFTER_CHARS}
          showMore={labels.show_more}
          showLess={labels.show_less}
        />
      </div>
    </section>
  );
}
