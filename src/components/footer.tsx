import type { ReactNode } from 'react';
// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import type { ChromeVM, SocialNetwork } from '@/lib/home-types';
import { Icon } from '@/components/icons';
import { Logo } from '@/components/logo';
import { NewsletterForm } from '@/components/newsletter-form';

const NETWORK_NAMES: Record<SocialNetwork, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

// Text links get a 44px row on phones, where they are tapped, and sit at their
// natural height from `sm` up; the lists' smaller top margin on phones makes up
// for the row's own padding.
const linkCls = 'inline-flex min-h-11 items-center transition-colors hover:text-white sm:min-h-0';

/** Menu links are site paths as a rule; anything else is left as a plain link. */
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return href.startsWith('/') && !href.startsWith('//') ? (
    <Link href={href} className={linkCls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={linkCls}>
      {children}
    </a>
  );
}

/** `tel:` wants digits only; a leading + (international format) is kept. */
function telHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}` : null;
}

export function Footer({ chrome }: { chrome: ChromeVM }) {
  const { brand, footer } = chrome;
  const { contact, newsletter } = footer;
  const tel = telHref(contact.phone);
  const hasContact = Boolean(contact.email || contact.phone || contact.address);

  return (
    // The global focus ring is brand blue, faint on navy. That rule is unlayered
    // CSS, which beats any Tailwind utility, hence the important modifier.
    <footer className="bg-navy-900 relative overflow-hidden text-white/70 [&_:focus-visible]:outline-white!">
      <div className="container-page relative grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-flex rounded-md">
            <Logo brand={brand} tone="dark" />
          </Link>
          {footer.tagline ? (
            <p className="mt-5 text-lg leading-snug font-medium text-white">{footer.tagline}</p>
          ) : null}
          {footer.social.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {footer.social.map(({ network, href }) => (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${brand.name} on ${NETWORK_NAMES[network]}`}
                    className="hover:bg-brand-700 hover:ring-brand-700 grid size-11 place-items-center rounded-full text-white ring-1 ring-white/20 transition-colors sm:size-10"
                  >
                    <Icon name={network === 'x' ? 'x-logo' : network} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {footer.columns.map((column, i) => (
          <div key={`${i}:${column.title}`} className="lg:col-span-2">
            <h2 className="text-base font-medium text-white">{column.title}</h2>
            <ul className="mt-2 text-sm sm:mt-4 sm:space-y-3">
              {column.links.map((link, j) => (
                <li key={`${j}:${link.href}`}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-4">
          {newsletter.heading ? (
            <h2 className="text-base font-medium text-white">{newsletter.heading}</h2>
          ) : null}
          {newsletter.text ? <p className="mt-3 text-sm">{newsletter.text}</p> : null}
          <NewsletterForm placeholder={newsletter.placeholder} buttonLabel={newsletter.button} />

          {hasContact ? (
            <address className="mt-3 not-italic sm:mt-6">
              <ul className="text-sm sm:space-y-3">
                {contact.email ? (
                  <li>
                    <a href={`mailto:${contact.email}`} className={`${linkCls} gap-3 break-all`}>
                      <Icon name="mail" size={18} className="shrink-0 text-white/50" />
                      {contact.email}
                    </a>
                  </li>
                ) : null}
                {contact.phone ? (
                  <li>
                    {tel ? (
                      <a href={tel} className={`${linkCls} gap-3`}>
                        <Icon name="phone" size={18} className="shrink-0 text-white/50" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="flex gap-3">
                        <Icon name="phone" size={18} className="shrink-0 text-white/50" />
                        {contact.phone}
                      </span>
                    )}
                  </li>
                ) : null}
                {contact.address ? (
                  <li className="flex gap-3 py-3 sm:py-0">
                    <Icon name="map-pin" size={18} className="mt-px shrink-0 text-white/50" />
                    <span className="whitespace-pre-line">{contact.address}</span>
                  </li>
                ) : null}
              </ul>
            </address>
          ) : null}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <p className="container-page py-6 text-sm text-white/60">
          Copyright © {new Date().getFullYear()} {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
