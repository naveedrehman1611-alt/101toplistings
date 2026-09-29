import { ExpandableText } from './expandable-text';

/** Descriptions longer than this start clamped. Decided from the text, never measured. */
const COLLAPSE_AFTER_CHARS = 600;

export function ListingDescription({ text }: { text: string | null }) {
  const body = text?.trim();
  if (!body) return null;

  return (
    <section className="mt-10">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">Description</h2>
      <div className="mt-3">
        <ExpandableText text={body} collapsible={body.length > COLLAPSE_AFTER_CHARS} />
      </div>
    </section>
  );
}
