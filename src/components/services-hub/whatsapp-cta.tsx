import { Icon } from '@/components/icon';
import { HUB_BUTTON } from '@/components/services-hub/hub-cta-band';

/**
 * A hub-style button that opens a WhatsApp chat in a new tab, in WhatsApp's
 * green. The text is navy rather than white: white on #25D366 is under 2:1,
 * navy is 7.9:1. Clicks are counted by the site-wide contact_click listener,
 * which matches wa.me links.
 */
export function WhatsAppCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${HUB_BUTTON} text-on-surface bg-[#25D366] hover:bg-[#1fb855]`}
    >
      <Icon name="chat" size={18} />
      {label}
    </a>
  );
}
