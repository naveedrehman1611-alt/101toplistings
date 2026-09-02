import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getMenu, getSettings, settingText } from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase';

// Criterion 36: critical fonts preloaded.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: true });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const brand = settingText(s, 'brand.name', 'Vicinia');
  const title = settingText(s, 'seo.default_title', brand);
  const description = settingText(s, 'seo.default_description', '');
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${brand}` },
    description,
    openGraph: { title, description, siteName: brand, type: 'website', url: SITE_URL },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, mobileNav, explore, company] = await Promise.all([
    getSettings(),
    getMenu('header', 'Primary'),
    getMenu('mobile', 'Mobile'),
    getMenu('footer', 'Explore'),
    getMenu('footer', 'Company'),
  ]);

  const brand = settingText(settings, 'brand.name', 'Vicinia');

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header brand={brand} nav={nav} mobileNav={mobileNav} />
        <main className="flex-1">{children}</main>
        <Footer
          brand={brand}
          tagline={settingText(settings, 'brand.tagline')}
          copyright={settingText(settings, 'footer.copyright', brand)}
          email={settingText(settings, 'contact.email')}
          columns={[
            { name: 'Explore', items: explore },
            { name: 'Company', items: company },
          ]}
        />
      </body>
    </html>
  );
}
