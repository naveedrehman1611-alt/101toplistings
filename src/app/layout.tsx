import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer, type FooterSocial } from '@/components/footer';
import { BackToTop } from '@/components/back-to-top';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { getMenu, getSettings, settingText } from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE, xHandle } from '@/lib/seo';
import { jsonLdHtml } from '@/lib/json-ld';
import { serviceNavItems } from '@/lib/service-pages';
import { getPageContent } from '@/lib/content/get';
import { ErrorContentProvider } from '@/components/error-content';
import { toolsWithCopy } from '@/components/tools/tool-page';
import GoogleAnalytics from './google-analytics';

// Criterion 36: critical fonts preloaded.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
});

/** A SITE_URL without a scheme (e.g. "example.com") would make new URL throw on every page. */
function safeUrl(value: string): URL | undefined {
  try {
    return new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const brand = settingText(s, 'brand.name', 'RankYouSite');
  const title = settingText(s, 'seo.default_title', brand);
  const description = settingText(s, 'seo.default_description', '');
  // The X account from Settings, for pages that set no twitter of their own
  // (pages that do get it from pageMetadata in src/lib/seo.ts).
  const handle = xHandle(settingText(s, 'social.x'));
  return {
    metadataBase: safeUrl(SITE_URL),
    title: { default: title, template: `%s | ${brand}` },
    description,
    // No images here: the root opengraph-image file fills og:image.
    openGraph: { title, description, siteName: brand, type: 'website', url: SITE_URL },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SHARE_IMAGE],
      ...(handle ? { site: handle, creator: handle } : {}),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Content reads go through the cached anon client, like settings and menus,
  // so every public route stays statically cacheable.
  const [settings, nav, mobileNav, site, errors, toolsHub] = await Promise.all([
    getSettings(),
    getMenu('header', 'Primary'),
    getMenu('mobile', 'Mobile'),
    getPageContent('site'),
    getPageContent('errors'),
    getPageContent('free_tools'),
  ]);

  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const email = settingText(settings, 'contact.email');
  // Social profiles from Settings, so the Organization entity links to them.
  const social: FooterSocial[] = (['facebook', 'instagram', 'linkedin', 'x', 'youtube'] as const)
    .map((network) => ({ network, href: settingText(settings, `social.${network}`).trim() }))
    .filter((s) => /^https?:\/\//.test(s.href));
  const sameAs = social.map((s) => s.href);
  // The phone in Settings, else the WhatsApp number the site already shows.
  const telephone = settingText(settings, 'contact.phone').trim() || `+${WHATSAPP_NUMBER}`;
  // Only a real stored address: the footer's fallback city is not one.
  const address = settingText(settings, 'contact.address').trim();
  // The site's default meta description also describes the brand entity.
  const description = settingText(settings, 'seo.default_description').trim();

  // Site-wide Organization + WebSite schema. The logo is a square PNG (Google
  // wants at least 112px, in a raster format) so the brand can show in results;
  // the SearchAction lets Google offer a search box that lands on /search.
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: brand,
        url: SITE_URL,
        ...(description ? { description } : {}),
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo-512.png`,
          width: 512,
          height: 512,
        },
        ...(email ? { email } : {}),
        telephone,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone,
          ...(email ? { email } : {}),
        },
        ...(address ? { address } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: brand,
        url: SITE_URL,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(siteJsonLd)} />
        <a
          href="#main"
          className="focus:bg-brand-700 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header
          nav={nav}
          mobileNav={mobileNav}
          services={serviceNavItems()}
          tools={toolsWithCopy(toolsHub).filter((t) => t.visible)}
          content={{ header: site.header, services_menu: site.services_menu }}
        />
        {/* tabIndex lets the skip link move keyboard focus here, not just scroll. */}
        <main id="main" tabIndex={-1} className="flex-1 outline-hidden">
          {/* error.tsx is a client component, so its copy reaches it through context. */}
          <ErrorContentProvider value={errors.error}>{children}</ErrorContentProvider>
        </main>
        <Footer
          brand={brand}
          about={settingText(
            settings,
            'footer.about',
            'A business directory and SEO services for businesses worldwide. Connecting customers with trusted local businesses.',
          )}
          trustLine={settingText(settings, 'footer.trust_line').trim()}
          copyright={settingText(settings, 'footer.copyright', brand)}
          email={email}
          address={settingText(settings, 'contact.address').trim() || 'Manchester, United Kingdom'}
          social={social}
          content={{
            footer: site.footer,
            footer_quick_links: site.footer_quick_links,
            footer_core_services: site.footer_core_services,
            footer_ai_services: site.footer_ai_services,
          }}
        />
        <BackToTop />
        {site.whatsapp.visible ? <WhatsAppButton content={site.whatsapp} /> : null}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
