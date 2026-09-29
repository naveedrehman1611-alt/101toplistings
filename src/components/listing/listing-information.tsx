import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import type { ListingDetail } from '@/lib/queries';

const pinIcon = <Icon name="location_on" size={18} />;
const phoneIcon = <Icon name="call" size={18} />;
const mailIcon = <Icon name="mail" size={18} />;
const globeIcon = <Icon name="language" size={18} />;
const shareIcon = <Icon name="hub" size={18} />;
const directionIcon = <Icon name="near_me" size={16} />;

const newTab = <span className="sr-only"> (opens in a new tab)</span>;

function Row({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="bg-surface-container text-primary-container flex size-8 shrink-0 items-center justify-center rounded-lg">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 flex-1 pt-1">{children}</dd>
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

const linkClass = 'text-primary-container hover:underline';

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
  // Without coordinates, route to the written address as shown above (street and
  // city, never the city twice) plus the country, so a bare street name is not
  // matched somewhere else.
  const place = address ? (/pakistan/i.test(address) ? address : `${address}, Pakistan`) : null;
  const directions = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : place
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`
      : null;
  const directionsLink = directions ? (
    <a
      href={directions}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-container inline-flex items-center gap-1 font-medium hover:underline"
    >
      {directionIcon}
      Get Direction
      {newTab}
    </a>
  ) : null;

  return (
    <section className="surface-card p-5">
      <h2 className="font-title-md text-title-md text-on-surface">Information</h2>

      {coords ? (
        <>
          <iframe
            title={`Map showing ${listing.name}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-border-subtle mt-4 aspect-[4/3] w-full rounded-lg border"
          />
          <div className="font-body-sm text-body-sm mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
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
        <dl className="font-body-md text-body-md text-on-surface mt-4 space-y-3">
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
                      className="border-border-subtle bg-surface-card text-on-surface hover:border-primary-container hover:text-primary-container font-label-sm text-label-sm inline-flex items-center rounded-full border px-3 py-1 transition-colors"
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
