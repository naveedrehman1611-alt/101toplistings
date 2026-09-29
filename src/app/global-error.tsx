'use client';

// Replaces the root layout when the layout itself fails, so it cannot rely on
// globals.css or the site header; styles are inline on purpose, with the Stitch
// palette written out as hex (on-surface ink, secondary muted text, emerald CTA).
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
          padding: 16,
          background: '#f8fafc',
          color: '#0b1c30',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <title>Something went wrong</title>
        <div
          style={{
            maxWidth: 420,
            padding: '40px 32px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              lineHeight: '36px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            This page didn&apos;t load
          </h1>
          <p style={{ color: '#565e74', fontSize: 15, lineHeight: '24px', marginTop: 12 }}>
            Something went wrong on our side. It is usually temporary, so try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              height: 44,
              padding: '0 20px',
              borderRadius: 8,
              border: 0,
              background: '#047857',
              color: '#ffffff',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ color: '#565e74', fontSize: 12, marginTop: 24, marginBottom: 0 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
