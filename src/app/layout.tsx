import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/back-to-top';
import { getCities, getMenu, getSettings, settingText } from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase';

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
  return {
    metadataBase: safeUrl(SITE_URL),
    title: { default: title, template: `%s · ${brand}` },
    description,
    openGraph: { title, description, siteName: brand, type: 'website', url: SITE_URL },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, mobileNav, explore, company, featuredCities] = await Promise.all([
    getSettings(),
    getMenu('header', 'Primary'),
    getMenu('mobile', 'Mobile'),
    getMenu('footer', 'Explore'),
    getMenu('footer', 'Company'),
    getCities(true),
  ]);

  const brand = settingText(settings, 'brand.name', 'RankYouSite');

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="focus:bg-brand-700 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header
          brand={brand}
          subtitle={settingText(settings, 'brand.subtitle', 'Pakistan Directory')}
          nav={nav}
          mobileNav={mobileNav}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer
          brand={brand}
          about={settingText(
            settings,
            'footer.about',
            'Covering all of Pakistan, from Karachi to Lahore and Islamabad to Peshawar. Connecting customers with trusted local businesses.',
          )}
          copyright={settingText(settings, 'footer.copyright', brand)}
          email={settingText(settings, 'contact.email')}
          cities={featuredCities}
          explore={explore}
          company={company}
        />
        <BackToTop />
      </body>
    </html>
  );
}
