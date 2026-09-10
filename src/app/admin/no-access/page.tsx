import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NoAccessPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Not available on your account</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        Your role does not include this area. Ask an administrator if you need access.
      </p>
      <Link href="/admin" className="mt-6 inline-block text-sm text-brand-700 hover:underline">
        Back to the dashboard
      </Link>
    </div>
  );
}
