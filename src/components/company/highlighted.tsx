/**
 * A heading whose middle words are coloured, from the three editable parts
 * ("before", "coloured", "after"). Empty parts drop out along with the space
 * that would have separated them.
 */
export function Highlighted({
  before,
  highlight,
  after,
  className,
}: {
  before: string;
  highlight: string;
  after: string;
  className: string;
}) {
  return (
    <>
      {before}
      {before && (highlight || after) ? ' ' : null}
      {highlight ? <span className={className}>{highlight}</span> : null}
      {highlight && after ? ' ' : null}
      {after}
    </>
  );
}

/** The heading fields every company page uses for a part-coloured heading. */
export type HighlightedParts = {
  heading: string;
  heading_highlight: string;
  heading_after: string;
};

export function HighlightedHeading({ c, className }: { c: HighlightedParts; className: string }) {
  return (
    <Highlighted
      before={c.heading}
      highlight={c.heading_highlight}
      after={c.heading_after}
      className={className}
    />
  );
}
