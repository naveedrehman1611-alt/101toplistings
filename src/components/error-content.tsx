'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ErrorsContent } from '@/lib/content/pages/global';

export type ErrorPageContent = ErrorsContent['error'];

/**
 * The "Something went wrong" copy from Admin → Content. app/error.tsx is a
 * client component and cannot read content itself, so the root layout (which
 * always wraps it) hands the copy down here.
 */
const ErrorContext = createContext<ErrorPageContent | null>(null);

/** Only for a render outside the root layout, which should not happen: the shipped copy. */
const FALLBACK: ErrorPageContent = {
  visible: true,
  edited: false,
  icon: 'error',
  eyebrow: 'Error',
  heading: "This page didn't load",
  text: 'Something went wrong on our side. It is usually temporary, so try again in a moment.',
  retry: 'Try again',
  home: { label: 'Home', href: '/' },
  reference: 'Reference:',
};

export function ErrorContentProvider({
  value,
  children,
}: {
  value: ErrorPageContent;
  children: ReactNode;
}) {
  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useErrorContent(): ErrorPageContent {
  return useContext(ErrorContext) ?? FALLBACK;
}
