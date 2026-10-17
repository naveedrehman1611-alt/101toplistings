'use client';

import { useEffect, useRef } from 'react';
import { contactMethod, sendEvent } from '@/lib/analytics';

/**
 * Site-wide contact_click: one listener for every WhatsApp, phone and email
 * link, wherever it is rendered (footer, floating button, listing pages).
 */
export function ContactClickTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const method = contactMethod(href);
      if (method) sendEvent('contact_click', { method, page_path: window.location.pathname });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}

/** Sends one GA4 event when it mounts, e.g. on the "message sent" state of a form. */
export function TrackEvent({ name, params }: { name: string; params?: Record<string, unknown> }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    sendEvent(name, params);
  }, [name, params]);
  return null;
}
