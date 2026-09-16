import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Only the public objects of the listing-media bucket — nothing else on the
    // Supabase host may be run through the optimizer.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rccuhznzediwocwlqflk.supabase.co',
        pathname: '/storage/v1/object/public/listing-media/**',
      },
    ],
  },
};

export default nextConfig;
