'use client';

import { useId, useState } from 'react';

const BASE = 'leading-relaxed whitespace-pre-line text-[var(--text-muted)]';

/**
 * Long text that starts clamped to six lines. The full text is always in the
 * DOM (the clamp is CSS only), so crawlers and screen readers get all of it.
 * Whether it is collapsible is decided by the caller from the text itself,
 * never by measuring, so server and client render identical markup.
 */
export function ExpandableText({ text, collapsible }: { text: string; collapsible: boolean }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const clamped = collapsible && !expanded;

  return (
    <>
      <p id={id} className={clamped ? `${BASE} line-clamp-6` : BASE}>
        {text}
      </p>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
          className="text-brand-700 mt-2 text-sm font-medium hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </>
  );
}
