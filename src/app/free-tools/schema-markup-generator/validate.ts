/**
 * Pure validator for the Schema Markup Generator. Generic checks come from the
 * field config (required, recommended, formats, ranges); type-specific rules
 * cover what Google's rich result docs add on top.
 */

import { filledRows } from './build';
import { getSchemaType } from './schema-types';
import type { Draft, FieldDef, SchemaTypeId, Values } from './schema-types';

export type IssueLevel = 'error' | 'warning' | 'info';

export interface Issue {
  level: IssueLevel;
  message: string;
}

const t = (s: string | undefined) => (s ?? '').trim();

export function isAbsoluteUrl(s: string): boolean {
  if (/\s/.test(s)) return false;
  try {
    const u = new URL(s);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

export function isDateTime(s: string): boolean {
  const m = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(Z|[+-]\d{2}:\d{2})?$/.exec(s);
  return !!m && isDate(m[1]);
}

export const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(s);

export const isDuration = (s: string) =>
  /^P(?=\d|T\d)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/i.test(s);

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const isNumber = (s: string) => s !== '' && Number.isFinite(Number(s));

/** Format problem with a filled-in value, or null when it is fine. */
function formatProblem(f: FieldDef, value: string): string | null {
  switch (f.kind) {
    case 'url':
      return isAbsoluteUrl(value) ? null : 'must be a full URL starting with https://';
    case 'email':
      return isEmail(value) ? null : 'is not a valid email address';
    case 'date':
      return isDate(value) ? null : 'must be a date in YYYY-MM-DD format';
    case 'datetime':
      return isDateTime(value) ? null : 'must be a date and time like 2026-11-21T10:00';
    case 'time':
      return isTime(value) ? null : 'must be a 24-hour time like 09:00';
    case 'duration':
      return isDuration(value) ? null : 'must be an ISO 8601 duration like PT30M';
    case 'number': {
      if (!isNumber(value)) {
        return /[,\s]/.test(value)
          ? 'must be a plain number (remove commas and spaces)'
          : 'must be a number';
      }
      const n = Number(value);
      if (f.min !== undefined && n < f.min) return `must be at least ${f.min}`;
      if (f.max !== undefined && n > f.max) return `must be at most ${f.max}`;
      return null;
    }
    default:
      return null;
  }
}

function genericIssues(type: SchemaTypeId, draft: Draft): Issue[] {
  const issues: Issue[] = [];
  const v = draft.values;
  for (const section of getSchemaType(type).sections) {
    for (const f of section.fields) {
      if (f.kind === 'repeatable') {
        const rows = filledRows(draft.lists[f.key]);
        if (!rows.length) {
          if (f.level === 'required')
            issues.push({ level: 'error', message: `${f.label}: add at least one item.` });
          else if (f.level === 'recommended')
            issues.push({ level: 'warning', message: `${f.label} is recommended.` });
          continue;
        }
        rows.forEach((row, i) => {
          for (const sub of f.fields) {
            const value = t(row[sub.key]);
            const where = `${f.itemLabel} ${i + 1}: ${sub.label}`;
            if (!value) {
              if (sub.level === 'required')
                issues.push({ level: 'error', message: `${where} is required.` });
              continue;
            }
            const problem = formatProblem(sub, value);
            if (problem) issues.push({ level: 'error', message: `${where} ${problem}.` });
          }
        });
        continue;
      }
      if (f.showIf && !f.showIf(v)) continue;
      const value = t(v[f.key]);
      if (!value) {
        if (f.level === 'required')
          issues.push({ level: 'error', message: `${f.label} is required.` });
        else if (f.level === 'recommended')
          issues.push({ level: 'warning', message: `${f.label} is recommended.` });
        continue;
      }
      const problem = formatProblem(f, value);
      if (problem) issues.push({ level: 'error', message: `${f.label} ${problem}.` });
    }
  }
  return issues;
}

/** Checks the AggregateRating fields shared by LocalBusiness and Product. */
export function ratingIssues(v: Values): Issue[] {
  const issues: Issue[] = [];
  const value = t(v.ratingValue);
  const count = t(v.reviewCount);
  if (!value) {
    if (count || t(v.bestRating) || t(v.worstRating))
      issues.push({
        level: 'warning',
        message:
          'Rating details are filled in but Average rating is empty, so no rating is output.',
      });
    return issues;
  }
  if (!count)
    issues.push({
      level: 'error',
      message: 'Number of reviews is required when you add an average rating.',
    });
  else if (isNumber(count) && (Number(count) < 1 || !Number.isInteger(Number(count))))
    issues.push({
      level: 'error',
      message: 'Number of reviews must be a whole number of 1 or more.',
    });
  if (!isNumber(value)) return issues;
  const best = isNumber(t(v.bestRating)) ? Number(t(v.bestRating)) : 5;
  const worst = isNumber(t(v.worstRating)) ? Number(t(v.worstRating)) : 1;
  const n = Number(value);
  if (worst >= best)
    issues.push({ level: 'error', message: 'Worst possible rating must be lower than best.' });
  else if (n < worst || n > best)
    issues.push({
      level: 'error',
      message: `Average rating ${n} is outside the ${worst}–${best} scale.`,
    });
  return issues;
}

function typeIssues(type: SchemaTypeId, draft: Draft): Issue[] {
  const v = draft.values;
  const issues: Issue[] = [];
  switch (type) {
    case 'LocalBusiness': {
      issues.push(...ratingIssues(v));
      if (!!t(v.latitude) !== !!t(v.longitude))
        issues.push({
          level: 'error',
          message: 'Enter both latitude and longitude, or neither.',
        });
      if (t(v.priceRange).length > 100)
        issues.push({ level: 'warning', message: 'Price range should be under 100 characters.' });
      const country = t(v.addressCountry);
      if (country && !/^[A-Za-z]{2}$/.test(country))
        issues.push({ level: 'warning', message: 'Country should be a two-letter code like PK.' });
      filledRows(draft.lists.hours).forEach((r, i) => {
        if (isTime(t(r.opens)) && t(r.opens) === t(r.closes))
          issues.push({
            level: 'warning',
            message: `Hours ${i + 1}: opens and closes are the same time. Use 00:00–23:59 for 24 hours.`,
          });
      });
      if (t(v.ratingValue))
        issues.push({
          level: 'info',
          message:
            'Google does not show review stars for ratings a business publishes about itself (self-serving reviews) on LocalBusiness or Organization. The rating is still valid markup.',
        });
      break;
    }
    case 'Organization': {
      const country = t(v.addressCountry);
      if (t(v.streetAddress) && country && !/^[A-Za-z]{2}$/.test(country))
        issues.push({ level: 'warning', message: 'Country should be a two-letter code like PK.' });
      break;
    }
    case 'Article':
      if (t(v.headline).length > 110)
        issues.push({
          level: 'warning',
          message: 'Headline is over 110 characters; Google may truncate it.',
        });
      if (
        isDateTime(t(v.datePublished)) &&
        isDateTime(t(v.dateModified)) &&
        t(v.dateModified) < t(v.datePublished)
      )
        issues.push({ level: 'error', message: 'Date modified is before date published.' });
      break;
    case 'Product':
      issues.push(...ratingIssues(v));
      if (!t(v.price) && !t(v.ratingValue))
        issues.push({
          level: 'error',
          message:
            'Google needs at least one of: an offer (price), a review or an aggregate rating for product rich results.',
        });
      if (t(v.price) && !/^[A-Za-z]{3}$/.test(t(v.priceCurrency)))
        issues.push({
          level: 'error',
          message: 'Currency must be a three-letter ISO 4217 code such as PKR or USD.',
        });
      if (t(v.gtin) && !/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(t(v.gtin)))
        issues.push({ level: 'error', message: 'GTIN must be 8, 12, 13 or 14 digits.' });
      break;
    case 'FAQPage':
      (draft.lists.faqs ?? []).forEach((r, i) => {
        const q = t(r.q);
        const a = t(r.a);
        if ((q && !a) || (!q && a)) return; // already reported by the generic check
        if (!q && !a && (draft.lists.faqs ?? []).length > 1)
          issues.push({
            level: 'warning',
            message: `Question ${i + 1} is empty and is left out. Remove the row or fill it in.`,
          });
      });
      issues.push({
        level: 'info',
        message:
          'Since 2023 Google shows FAQ rich results only for well-known, authoritative government and health sites. The markup is still valid and helps search engines and AI answers understand the page.',
      });
      break;
    case 'HowTo':
      issues.push({
        level: 'info',
        message:
          'Google retired HowTo rich results in 2023, so no special search display. The markup is still valid schema.org and can help other search engines and AI tools read your steps.',
      });
      break;
    case 'Event': {
      const s = t(v.startDate);
      const e = t(v.endDate);
      if (isDateTime(s) && isDateTime(e) && e < s)
        issues.push({ level: 'error', message: 'End is before start.' });
      if (t(v.price) && !/^[A-Za-z]{3}$/.test(t(v.priceCurrency)))
        issues.push({
          level: 'error',
          message: 'Currency must be a three-letter ISO 4217 code such as PKR or USD.',
        });
      break;
    }
    case 'BreadcrumbList': {
      const rows = filledRows(draft.lists.crumbs);
      rows.forEach((r, i) => {
        if (i < rows.length - 1 && !t(r.url))
          issues.push({
            level: 'error',
            message: `Level ${i + 1}: URL is required on every item except the last.`,
          });
      });
      if (rows.length === 1)
        issues.push({
          level: 'warning',
          message: 'A breadcrumb trail usually has at least two levels.',
        });
      break;
    }
  }
  return issues;
}

const ORDER: Record<IssueLevel, number> = { error: 0, warning: 1, info: 2 };

/** All issues for a draft, errors first. */
export function validateSchema(type: SchemaTypeId, draft: Draft): Issue[] {
  return [...genericIssues(type, draft), ...typeIssues(type, draft)]
    .map((issue, i) => ({ issue, i }))
    .sort((a, b) => ORDER[a.issue.level] - ORDER[b.issue.level] || a.i - b.i)
    .map(({ issue }) => issue);
}
