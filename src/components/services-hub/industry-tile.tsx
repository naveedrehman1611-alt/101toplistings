import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';

/** Industry link on the hub: a compact tile that opens that industry's service page. */
export function IndustryTile({ name, icon, href }: { name: string; icon: IconName; href: string }) {
  return (
    <Link
      href={href}
      className="border-border-subtle hover:border-primary-container hover:bg-brand-50 focus-visible:outline-primary-container flex h-full items-center gap-2.5 rounded-[10px] border-[1.5px] bg-white px-4 py-3.5 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:-translate-y-0.5"
    >
      <Icon name={icon} size={18} className="text-primary-container" />
      <span className="text-on-surface text-[13px] leading-snug font-semibold">{name}</span>
    </Link>
  );
}
