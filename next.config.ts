import type { NextConfig } from 'next';

// Listing and library images are served from the public Supabase Storage bucket
// (migration 0015). next/image only optimises remote images whose host is listed
// here, so the pattern comes from the env var the app already requires, and is
// limited to the public media bucket rather than the whole project host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    // Uploads get a fresh, unguessable object name and are never overwritten
    // (media-upload.ts), so an optimised variant can be cached for a month
    // without ever going stale. Every re-optimisation is a fetch from Supabase
    // Storage, so the longer TTL directly cuts Storage egress.
    minimumCacheTTL: 2678400,
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
  // The reference site ran on WordPress; its public URLs map onto this app's
  // routes so existing links and search results keep working after a move.
  async redirects() {
    return [
      { source: '/listing-category/:slug', destination: '/category/:slug', permanent: true },
      { source: '/listing-location/:slug', destination: '/city/:slug', permanent: true },
      { source: '/listing-top-filter', destination: '/listings', permanent: true },
      { source: '/submission', destination: '/dashboard/listings/new', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
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
