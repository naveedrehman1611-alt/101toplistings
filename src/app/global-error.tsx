'use client';

// Replaces the root layout when the layout itself fails, so it cannot rely on
// globals.css or the site header; styles are inline on purpose.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 16,
        }}
      >
        <title>Something went wrong</title>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>This page didn&apos;t load</h1>
          <p style={{ color: '#555', marginTop: 12 }}>
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
              background: '#1d4ed8',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ color: '#888', fontSize: 12, marginTop: 24 }}>Reference: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
