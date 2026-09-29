/**
 * Serialize structured data for a <script type="application/ld+json"> tag.
 * Values can come from editable settings or user content, so "<" is escaped
 * and a "</script>" inside a string cannot close the tag.
 */
export function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
