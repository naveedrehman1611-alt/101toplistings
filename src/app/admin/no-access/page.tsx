import Link from 'next/link';
import { btn, card } from '@/components/admin/kit';

export const dynamic = 'force-dynamic';

export default function NoAccessPage() {
  return (
    <div
      className={`${card} mx-auto mt-10 flex max-w-md flex-col items-center gap-3 px-8 py-10 text-center`}
    >
      <h1 className="font-display m-0 text-xl font-bold text-[#062347]">
        Not available on your account
      </h1>
      <p className="m-0 text-sm text-[#64748B]">
        Your role does not include this area. Ask an administrator if you need access.
      </p>
      <Link href="/admin" className={`${btn.primary} mt-2 hover:no-underline`}>
        Back to the dashboard
      </Link>
    </div>
  );
}
