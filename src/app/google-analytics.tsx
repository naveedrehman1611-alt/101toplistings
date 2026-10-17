import Script from 'next/script';

/**
 * GA4. Loaded with `lazyOnload` (browser idle time, after the page's own
 * resources) rather than `afterInteractive`: gtag.js is the largest
 * third-party script on the site and, fetched and run during hydration, it
 * competed with the hero for bandwidth and added main-thread time on phones.
 * The init snippet only queues commands on window.dataLayer, which gtag.js
 * drains whenever it arrives, so the page_view is still sent; only a visit
 * that leaves before the browser goes idle can go unrecorded.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  // Vercel preview deployments would otherwise count their visits as real traffic.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return null;
  return (
    <>
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
    </>
  );
}
