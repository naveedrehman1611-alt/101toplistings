import type { NextConfig } from 'next';

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
const redirectVercelHost =
  process.env.VERCEL_ENV === 'production' && siteHost !== '' && !siteHost.endsWith('.vercel.app');

const nextConfig: NextConfig = {
  async redirects() {
    if (!redirectVercelHost) return [];
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
        destination: `https://${siteHost}/:path*`,
        statusCode: 301,
      },
    ];
  },
  images: {
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
