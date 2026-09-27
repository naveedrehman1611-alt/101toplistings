import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/back-to-top';
import { getSettings, settingText } from '@/lib/queries';
import { getChrome } from '@/lib/chrome';
import { SITE_URL } from '@/lib/supabase';

// One variable font for the whole site, as on the reference. Self-hosted by
// next/font and preloaded, so there is no request to Google at runtime.
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap', preload: true });

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
  const brand = settingText(s, 'brand.name', 'SmartBizDir');
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

// The layout reads no cookies or headers — only cached settings and menus — so
// every public route below it can still be prerendered and served from cache.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const chrome = await getChrome();

  return (
    <html lang="en" className={jost.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="focus:bg-brand-700 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header chrome={chrome} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer chrome={chrome} />
        <BackToTop />
      </body>
    </html>
  );
}
