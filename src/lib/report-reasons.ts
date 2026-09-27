// Kept out of public-actions.ts: a 'use server' module may only export async
// functions, and the report form and admin inbox both need these labels.
export const REPORT_REASONS = {
  closed: 'Permanently closed',
  wrong_info: 'Wrong phone, address or hours',
  fake: 'Fake or spam listing',
  duplicate: 'Duplicate of another listing',
  offensive: 'Offensive or inappropriate content',
  other: 'Something else',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;
