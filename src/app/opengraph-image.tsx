import { ImageResponse } from 'next/og';
import { SHARE_IMAGE } from '@/lib/seo';

// The default share image for every page (file-based metadata is inherited by
// all routes below the root). Static text only, so it is built once at build
// time rather than on each request.
export const alt = SHARE_IMAGE.alt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(120deg, #071328 0%, #0b1c30 55%, #047857 100%)',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex', fontSize: 96, fontWeight: 700 }}>
        <span>RankYou</span>
        {/* The fallback font leaves a wide side bearing after "u"; close it up. */}
        <span style={{ color: '#9ffdd3', marginLeft: -16 }}>Site</span>
      </div>
      <div style={{ display: 'flex', marginTop: 24, fontSize: 38, opacity: 0.9 }}>
        Business directory and SEO services
      </div>
      <div style={{ display: 'flex', marginTop: 48, fontSize: 30, opacity: 0.75 }}>
        List your business · Get found online · Grow with SEO
      </div>
    </div>,
    size,
  );
}
