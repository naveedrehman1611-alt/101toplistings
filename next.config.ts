import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects';

// Listing and library images are served from the public Supabase Storage bucket
// (migration 0015). next/image only optimises remote images whose host is listed
// here, so the pattern comes from the env var the app already requires, and is
// limited to the public media bucket rather than the whole project host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

// Once NEXT_PUBLIC_SITE_URL points at the custom domain, production requests
// that arrive on a *.vercel.app host get a 301 redirect there, so search
// engines consolidate on one domain. Preview deployments keep their own
// vercel.app URLs, and nothing changes while SITE_URL is still a vercel.app
// address.
const siteHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? '').host;
  } catch {
    return '';
  }
})();
const siteIsLocal =
  siteHost === '' || ['localhost', '127.0.0.1', '[::1]'].includes(siteHost.replace(/:\d+$/, ''));
const redirectVercelHost =
  process.env.VERCEL_ENV === 'production' && !siteIsLocal && !siteHost.endsWith('.vercel.app');

// SITE_URL (src/lib/supabase.ts) falls back to http://localhost:3000, which a
// production build would bake into the sitemap, canonicals and JSON-LD. Warn
// loudly in the Vercel build log rather than failing the build.
if (process.env.VERCEL_ENV === 'production' && siteIsLocal) {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  console.warn(
    [
      '',
      `⚠️  NEXT_PUBLIC_SITE_URL is ${raw ? `"${raw}"` : 'not set'} in this production build.`,
      `    The sitemap, canonical URLs and JSON-LD will be built from ${raw ? `"${raw}"` : 'http://localhost:3000'}.`,
      '    Fix: Vercel → Project → Settings → Environment Variables, set',
      '    NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://www.rankyousite.com)',
      '    for the Production environment, then redeploy.',
      '',
    ].join('\n'),
  );
}

// Security headers on every response. The CSP is limited to directives that
// cannot break the app: a script-src allowlist would need a per-request nonce
// for Next's inline scripts, which makes every page dynamic and gives up ISR.
// object-src and base-uri still close the plugin and <base> injection routes
// for XSS, and frame-ancestors (with X-Frame-Options for older browsers) stops
// other sites framing the pages.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests",
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  // Next streams generateMetadata into <body> for any user agent missing from
  // its bot list, so SEO crawlers that are not on it (site auditors, smaller
  // search engines) saw no <title>, and canonical and robots tags outside
  // <head>. Matching every user agent keeps metadata in <head> for all.
  htmlLimitedBots: /.*/,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    // Uploads get a fresh, unguessable object name and are never overwritten
    // (media-upload.ts), so an optimised variant can be cached for a month
    // without ever going stale. Every re-optimisation is a fetch from Supabase
    // Storage, so the longer TTL directly cuts Storage egress.
    minimumCacheTTL: 2678400,
    // Next 16 refuses to optimise images from private addresses (SSRF guard).
    // Only a local Supabase stack (`supabase start`, 127.0.0.1:54321) needs
    // that, and remotePatterns still limits fetches to its media bucket.
    dangerouslyAllowLocalIP: supabaseUrl
      ? ['localhost', '127.0.0.1'].includes(supabaseUrl.hostname)
      : false,
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol === 'http:' ? 'http' : 'https',
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: '/storage/v1/object/public/media/**',
          },
        ]
      : [],
  },
  // Production *.vercel.app hosts go to the custom domain (see siteHost above).
  // The reference site ran on WordPress; its public URLs map onto this app's
  // routes so existing links and search results keep working after a move.
  async redirects() {
    return [
      ...(redirectVercelHost
        ? [
            {
              source: '/:path*',
              has: [{ type: 'host' as const, value: '.*\\.vercel\\.app' }],
              destination: `https://${siteHost}/:path*`,
              statusCode: 301 as const,
            },
          ]
        : []),
      // Old public URLs (WordPress paths, renamed and merged pages). The same
      // table rewrites stale stored links at read time, so it lives in one place.
      ...LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),
    ];
  },
  experimental: {
    serverActions: {
      // Uploads go through Server Actions, whose body is capped at 1 MB by
      // default. The app accepts images up to 4 MB (MAX_UPLOAD_BYTES) and the
      // multipart wrapping adds a little; Vercel rejects bodies over 4.5 MB anyway.
      bodySizeLimit: '4.5mb',
    },
  },
};

export default nextConfig;
