import type { ReactNode } from 'react';
import type { ListingDetail } from '@/lib/queries';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      {children}
    </svg>
  );
}

const pinIcon = (
  <Icon>
    <path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);
const phoneIcon = (
  <Icon>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Icon>
);
const mailIcon = (
  <Icon>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7" />
  </Icon>
);
const globeIcon = (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </Icon>
);
const shareIcon = (
  <Icon>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </Icon>
);
const directionIcon = (
  <Icon>
    <path d="M3 11 22 2l-9 19-2-8z" />
  </Icon>
);

const newTab = <span className="sr-only"> (opens in a new tab)</span>;

function Row({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="text-brand-700 mt-0.5 shrink-0">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}

/** Real coordinates only: both present and on the globe. */
function coordinates(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
    return null;
  }
  return { lat: la, lng: lo };
}

/** The street address, with the city added unless the address already names it. */
function fullAddress(address: string | null, city: string | null): string | null {
  const a = address?.trim();
  if (!a) return null;
  const c = city?.trim();
  return c && !a.toLowerCase().includes(c.toLowerCase()) ? `${a}, ${c}` : a;
}

/** A link target plus a short label: the hostname without "www.", or the raw value. */
function externalLink(raw: string): { href: string; host: string } {
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return { href, host: new URL(href).hostname.replace(/^www\./i, '') };
  } catch {
    return { href, host: raw };
  }
}

const linkClass = 'text-brand-700 hover:underline';

export function ListingInformation({
  listing,
  cityName,
}: {
  listing: ListingDetail;
  cityName: string | null;
}) {
  const coords = coordinates(listing.latitude, listing.longitude);
  const address = fullAddress(listing.address, cityName);
  const phones = [
    ...new Set(
      [listing.phone_primary, listing.phone_secondary]
        .map((p) => p?.trim())
        .filter((p): p is string => Boolean(p)),
    ),
  ];
  const email = listing.email?.trim().toLowerCase() || null;
  const website = listing.website?.trim() ? externalLink(listing.website.trim()) : null;
  // social_links is jsonb: keep only entries that really carry a URL.
  const socials = (Array.isArray(listing.social_links) ? listing.social_links : []).flatMap((s) => {
    const url = typeof s?.url === 'string' ? s.url.trim() : '';
    if (!url) return [];
    const link = externalLink(url);
    const label = typeof s.label === 'string' ? s.label.trim() : '';
    return [{ href: link.href, label: label || link.host }];
  });

  const hasRows = Boolean(address || phones.length || email || website || socials.length);
  if (!coords && !hasRows) return null;

  const lat = coords?.lat.toFixed(6);
  const lng = coords?.lng.toFixed(6);
  const bbox = coords
    ? [coords.lng - 0.006, coords.lat - 0.004, coords.lng + 0.006, coords.lat + 0.004]
        .map((n) => n.toFixed(6))
        .join(',')
    : '';
  const directions = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : null;
  const directionsLink = directions ? (
    <a
      href={directions}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-700 inline-flex items-center gap-1 font-medium hover:underline"
    >
      {directionIcon}
      Get Direction
      {newTab}
    </a>
  ) : null;

  return (
    <section className="surface-card p-5">
      <h2 className="font-display text-lg font-semibold">Information</h2>

      {coords ? (
        <>
          <iframe
            title={`Map showing ${listing.name}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-4 aspect-[4/3] w-full rounded-lg border border-[var(--border)]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              View larger map
              {newTab}
            </a>
            {/* Without an address row, directions sit with the map instead. */}
            {address ? null : directionsLink}
          </div>
        </>
      ) : null}

      {hasRows ? (
        <dl className="mt-4 space-y-3 text-sm">
          {address ? (
            <Row label="Address" icon={pinIcon}>
              <p>{address}</p>
              {directionsLink ? <p className="mt-1">{directionsLink}</p> : null}
            </Row>
          ) : null}
          {phones.length > 0 ? (
            <Row label={phones.length > 1 ? 'Phone numbers' : 'Phone'} icon={phoneIcon}>
              {phones.map((p) => (
                <a
                  key={p}
                  href={`tel:${p.replace(/\s+/g, '')}`}
                  className={`${linkClass} block w-fit`}
                >
                  {p}
                </a>
              ))}
            </Row>
          ) : null}
          {email ? (
            <Row label="Email" icon={mailIcon}>
              <a href={`mailto:${email}`} className={`${linkClass} break-all`}>
                {email}
              </a>
            </Row>
          ) : null}
          {website ? (
            <Row label="Website" icon={globeIcon}>
              <a
                href={website.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`${linkClass} break-all`}
              >
                {website.host}
                {newTab}
              </a>
            </Row>
          ) : null}
          {socials.length > 0 ? (
            <Row label="Social profiles" icon={shareIcon}>
              <ul className="flex flex-wrap gap-2">
                {socials.map((s, i) => (
                  <li key={`${i}-${s.href}`}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--surface-2)]"
                    >
                      {s.label}
                      {newTab}
                    </a>
                  </li>
                ))}
              </ul>
            </Row>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
