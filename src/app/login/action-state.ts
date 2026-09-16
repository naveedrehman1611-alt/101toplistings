/**
 * Outside actions.ts because a 'use server' module may export only async
 * functions — exporting this object from there builds fine under tsc and
 * eslint, then fails at page-data collection.
 */
export type LoginState = { error: string | null };

export const initialLoginState: LoginState = { error: null };
