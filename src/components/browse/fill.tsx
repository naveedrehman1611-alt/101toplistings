import { Fragment, type ReactNode } from 'react';

const SLOT = /\{([a-z_]+)\}/g;

/**
 * Fills {placeholders} in editable copy ("Businesses in {city}") with values.
 * An unknown placeholder is left as written, so a typo shows rather than vanishes.
 */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(SLOT, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole,
  );
}

/** Like fill(), but a placeholder can become markup, such as a link or a highlighted name. */
export function fillNodes(text: string, slots: Record<string, ReactNode>): ReactNode {
  return text
    .split(/(\{[a-z_]+\})/)
    .filter(Boolean)
    .map((part, i) => {
      const key = /^\{([a-z_]+)\}$/.exec(part)?.[1];
      if (key && Object.prototype.hasOwnProperty.call(slots, key)) {
        return <Fragment key={i}>{slots[key]}</Fragment>;
      }
      return part;
    });
}
