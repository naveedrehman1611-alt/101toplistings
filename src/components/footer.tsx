import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icon';
import { SiteLogo } from '@/components/site-logo';
import { BackToTopLink } from '@/components/back-to-top';
import { servicePage } from '@/lib/service-pages';
import { WHATSAPP_NUMBER, whatsappHref } from '@/lib/whatsapp';

type FooterLink = { label: string; href: string; external?: boolean; highlight?: boolean };

const WHATSAPP_LINK: FooterLink = {
  label: 'WhatsApp Us',
  href: whatsappHref(),
  external: true,
  highlight: true,
};

const QUICK_LINKS: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'All SEO Services', href: '/seo-services' },
  { label: 'Business Directory', href: '/business-directory' },
  { label: 'SEO Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Free SEO Audit', href: '/seo-audit' },
  { label: 'SEO Consulting', href: '/seo-services/seo-consulting' },
  { label: 'Free SEO Tools', href: '/free-tools' },
  WHATSAPP_LINK,
];

/** [service slug, footer label]: hrefs come from the service catalogue, so they never go stale. */
const CORE_SERVICES: [string, string][] = [
  ['local-seo', 'Local SEO Services'],
  ['technical-seo', 'Technical SEO'],
  ['ecommerce-seo', 'Ecommerce SEO'],
  ['national-seo', 'National SEO'],
  ['international-seo', 'International SEO'],
  ['enterprise-seo', 'Enterprise SEO'],
  ['on-page-seo', 'On-Page SEO'],
  ['off-page-seo', 'Off-Page SEO'],
  ['link-building', 'Link Building'],
  ['lead-generation-seo', 'Lead Generation SEO'],
];

const AI_PLATFORM_SERVICES: [string, string][] = [
  ['aeo-services', 'AEO Services'],
  ['geo-services', 'GEO Services'],
  ['ai-seo', 'AI SEO Services'],
  ['wordpress-seo', 'WordPress SEO'],
  ['shopify-seo', 'Shopify SEO'],
  ['woocommerce-seo', 'WooCommerce SEO'],
  ['white-label-seo', 'White Label SEO'],
  ['google-business-profile', 'GBP / GMB Services'],
  ['seo-migration', 'SEO Migration'],
  ['seo-penalty-removal', 'Penalty Removal'],
];

function serviceLinks(entries: [string, string][]): FooterLink[] {
  return entries.flatMap(([slug, label]) => {
    const page = servicePage(slug);
    return page ? [{ label, href: page.path }] : [];
  });
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: 'Quick Links', links: QUICK_LINKS },
  { title: 'Core SEO Services', links: serviceLinks(CORE_SERVICES) },
  { title: 'AI & Platform SEO', links: serviceLinks(AI_PLATFORM_SERVICES) },
];

export type FooterSocial = {
  network: 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube';
  href: string;
};

const SOCIAL_LABELS: Record<FooterSocial['network'], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  youtube: 'YouTube',
};

function SocialGlyph({ network }: { network: FooterSocial['network'] }) {
  const common = { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': true } as const;
  switch (network) {
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.55.45-1 1-1Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common} fill="currentColor">
          <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common} fill="currentColor">
          <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15.1V8.9l5.8 3.1-5.8 3.1Z" />
        </svg>
      );
  }
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400';
const textLink = `rounded-sm ${focusRing}`;

/** "+92 307 7139528" from the WhatsApp number, for when no phone is set. */
function formatPakistanNumber(digits: string): string {
  return digits.startsWith('92') && digits.length === 12
    ? `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`
    : `+${digits}`;
}

function FooterAnchor({
  link,
  className,
  children,
}: {
  link: Pick<FooterLink, 'href' | 'external'>;
  className: string;
  children: ReactNode;
}) {
  if (link.external || !link.href.startsWith('/')) {
    return (
      <a
        href={link.href}
        className={className}
        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  );
}

function ContactRow({
  icon,
  href,
  external,
  children,
}: {
  icon: IconName;
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <FooterAnchor
        link={{ href, external }}
        className={`group flex items-center gap-3 text-[15px] font-medium text-slate-200 transition-colors hover:text-white ${textLink}`}
      >
        <span className="text-brand-400 grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 transition-colors group-hover:border-white/20">
          <Icon name={icon} size={18} />
        </span>
        <span className="min-w-0 break-words">{children}</span>
      </FooterAnchor>
    </li>
  );
}

export function Footer({
  brand,
  about,
  trustLine,
  copyright,
  email,
  phone,
  address,
  social,
}: {
  brand: string;
  about: string;
  /** Rating / clients line in the pill under the blurb; blank hides the pill. */
  trustLine: string;
  copyright: string;
  email: string;
  /** Falls back to the WhatsApp number when blank. */
  phone: string;
  address: string;
  social: FooterSocial[];
}) {
  const phoneLabel = phone || formatPakistanNumber(WHATSAPP_NUMBER);
  const phoneHref = `tel:${phone ? phone.replace(/[^\d+]/g, '') : `+${WHATSAPP_NUMBER}`}`;

  return (
    <footer className="bg-navy-950 w-full text-slate-300">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-12 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1 lg:pr-6">
            <Link href="/" aria-label={`${brand} home`} className={`inline-block ${textLink}`}>
              <SiteLogo alt={brand} variant="dark" className="h-auto w-full max-w-64" />
            </Link>
            {about ? (
              <p className="mt-6 max-w-md text-[16px] leading-[1.85] text-slate-300">{about}</p>
            ) : null}

            {trustLine ? (
              <p className="mt-8 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-slate-300">
                <span aria-hidden className="tracking-[0.1em] text-amber-400">
                  ★★★★★
                </span>
                <span className="font-medium text-slate-100">{trustLine}</span>
              </p>
            ) : null}

            <ul className="mt-8 space-y-3">
              <ContactRow icon="call" href={phoneHref}>
                {phoneLabel}
              </ContactRow>
              {email ? (
                <ContactRow icon="mail" href={`mailto:${email}`}>
                  {email}
                </ContactRow>
              ) : null}
              {address ? (
                <ContactRow
                  icon="location_on"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  external
                >
                  {address}
                </ContactRow>
              ) : null}
              <ContactRow icon="chat" href={WHATSAPP_LINK.href} external>
                WhatsApp Us
              </ContactRow>
            </ul>

            {social.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-3">
                {social.map((s) => (
                  <li key={s.network}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${brand} on ${SOCIAL_LABELS[s.network]}`}
                      className="hover:border-brand-400 hover:text-brand-400 focus-visible:outline-brand-400 grid size-11 place-items-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <SocialGlyph network={s.network} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display relative border-b border-white/10 pb-4 text-[15px] font-bold tracking-[0.08em] text-white uppercase">
                {column.title}
                <span
                  aria-hidden
                  className="bg-brand-400 absolute -bottom-px left-0 h-[3px] w-9 rounded-full"
                />
              </h2>
              <ul className="mt-6 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href} className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden
                      className={`size-1.5 shrink-0 -translate-y-0.5 rounded-full ${
                        link.highlight ? 'bg-brand-400' : 'bg-slate-500'
                      }`}
                    />
                    <FooterAnchor
                      link={link}
                      className={`text-[15px] font-medium transition-colors ${textLink} ${
                        link.highlight
                          ? 'text-brand-400 hover:text-brand-300'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:gap-8">
          <p className="text-[14px] text-slate-400">
            © {new Date().getFullYear()}{' '}
            <Link href="/" className={`font-semibold text-slate-200 hover:text-white ${textLink}`}>
              {copyright.replace(/\.+$/, '')}
            </Link>
            . All rights reserved.{' '}
            <Link href="/privacy" className={`hover:text-white ${textLink}`}>
              Privacy Policy
            </Link>{' '}
            ·{' '}
            <Link href="/terms" className={`hover:text-white ${textLink}`}>
              Terms of Service
            </Link>
          </p>
          <BackToTopLink
            className={`shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-[14px] font-semibold text-slate-300 transition-colors hover:border-white/30 hover:text-white ${focusRing}`}
          />
        </div>
      </div>
    </footer>
  );
}
