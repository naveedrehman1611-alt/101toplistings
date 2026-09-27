import 'server-only';
import { cache } from 'react';
import { getMediaByIds, getMenu, getSettings, settingText, type MenuItem } from './queries';
import { mediaUrl } from './media';
import { fillBrand } from './sections';
import type { ChromeVM, Img, LinkVM, SocialNetwork } from './home-types';

/**
 * Header and footer data for every route, from settings and menus. Rendered in
 * the root layout, so it reads nothing per user and no cookies: every public
 * route stays statically cacheable. Each read is a tag-cached GET, and React's
 * cache() shares them with generateMetadata and the page in the same render.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SOCIAL: SocialNetwork[] = ['facebook', 'instagram', 'x', 'linkedin', 'youtube'];

function links(items: MenuItem[]): LinkVM[] {
  return items.map((i) => ({ label: i.label, href: i.url }));
}

/** Only absolute http(s) URLs render as social links; anything else is ignored. */
function safeExternal(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

/** A setting that holds a same-site path; falls back when blank or unsafe. */
function sitePath(value: string, fallback: string): string {
  return value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export const getChrome = cache(async function getChrome(): Promise<ChromeVM> {
  const [settings, nav, mobileNav, locations, useful] = await Promise.all([
    getSettings(),
    getMenu('header', 'Primary'),
    getMenu('mobile', 'Mobile'),
    getMenu('footer', 'Locations'),
    getMenu('footer', 'Useful Links'),
  ]);
  const s = (key: string, fallback = '') => settingText(settings, key, fallback).trim();
  const brand = s('brand.name', 'RankYouSite') || 'RankYouSite';

  const lightId = s('brand.logo_light_media_id');
  const darkId = s('brand.logo_dark_media_id');
  const logoIds = [lightId, darkId].filter((id) => UUID.test(id));
  const media = logoIds.length ? await getMediaByIds([...new Set(logoIds)]) : [];
  const logo = (id: string): Img | null => {
    const m = media.find((row) => row.id === id);
    return m
      ? { url: mediaUrl(m.path), alt: m.alt?.trim() || brand, width: m.width, height: m.height }
      : null;
  };

  const accent = s('brand.name_accent');

  return {
    brand: {
      name: brand,
      accent: accent && brand.endsWith(accent) && accent !== brand ? accent : '',
      logoOnLight: logo(lightId),
      logoOnDark: logo(darkId) ?? logo(lightId),
    },
    nav: links(nav),
    mobileNav: links(mobileNav.length ? mobileNav : nav),
    login: {
      label: s('header.login_label', 'Login') || 'Login',
      href: sitePath(s('header.login_url'), '/login'),
    },
    register: {
      label: s('header.register_label', 'Sign Up') || 'Sign Up',
      href: sitePath(s('header.register_url'), '/register'),
    },
    addListing: {
      label: s('header.cta_label', 'Add Listing') || 'Add Listing',
      href: sitePath(s('header.cta_url'), '/dashboard/listings/new'),
    },
    footer: {
      tagline: fillBrand(s('footer.tagline'), brand),
      social: SOCIAL.flatMap((network) => {
        const href = safeExternal(s(`social.${network}`));
        return href ? [{ network, href }] : [];
      }),
      columns: [
        { title: s('footer.locations_heading', 'Locations'), links: links(locations) },
        { title: s('footer.links_heading', 'Useful Links'), links: links(useful) },
      ].filter((c) => c.links.length > 0),
      contact: {
        email: s('contact.email'),
        phone: s('contact.phone'),
        address: s('contact.address'),
      },
      newsletter: {
        heading: s('footer.newsletter_heading', 'Newsletter'),
        text: fillBrand(s('footer.newsletter_text'), brand),
        placeholder: s('footer.newsletter_placeholder', 'Email') || 'Email',
        button: s('footer.newsletter_button', 'Subscribe') || 'Subscribe',
      },
      copyright: fillBrand(s('footer.copyright', brand), brand),
    },
  };
});
