import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { ServicePage } from '@/lib/service-pages';

/**
 * One service on the hub. The card is an article with a single link; the
 * link's ::after stretches over the card so the whole card is clickable while
 * screen readers still hear one "Learn more <service>" link. The focus ring is
 * drawn on the card (has-[a:focus-visible]) since the link covers it.
 *
 * `featured` (the first card of each category) is the navy variant.
 */
export function ServiceCard({
  service,
  tag,
  featured = false,
}: {
  service: Pick<ServicePage, 'name' | 'description' | 'path' | 'icon'>;
  tag?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col gap-2.5 overflow-hidden rounded-xl border-[1.5px] px-5 py-[22px] outline-offset-2 transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:origin-left before:scale-x-0 before:transition-transform before:duration-200 hover:before:scale-x-100 has-[a:focus-visible]:outline-2 motion-safe:hover:-translate-y-0.5 ${
        featured
          ? 'bg-hero-navy border-hero-navy before:bg-hero-green-light outline-hero-navy hover:shadow-[0_4px_20px_rgb(6_35_71/0.28)]'
          : 'border-border-subtle hover:border-primary-container before:bg-primary-container outline-primary-container bg-white hover:shadow-[0_4px_20px_rgb(12_130_38/0.12)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon
          name={service.icon}
          size={22}
          className={featured ? 'text-hero-green-light' : 'text-primary-container'}
        />
        {tag ? (
          <span
            className={`rounded-full border px-[9px] py-[3px] text-[10px] leading-tight font-bold tracking-wide whitespace-nowrap uppercase ${
              featured
                ? 'text-hero-green-light border-white/20 bg-white/10'
                : 'text-primary-container bg-brand-50 border-brand-200'
            }`}
          >
            {tag}
          </span>
        ) : null}
      </div>
      <h3
        className={`font-display text-[15px] leading-snug font-bold ${
          featured ? 'text-white' : 'text-on-surface'
        }`}
      >
        {service.name}
      </h3>
      <p
        className={`flex-1 text-[13px] leading-[1.65] ${
          featured ? 'text-white/60' : 'text-[var(--text-muted)]'
        }`}
      >
        {service.description}
      </p>
      <Link
        href={service.path}
        className={`font-display inline-flex items-center gap-1 self-start text-[13px] font-bold transition-[gap] duration-200 group-hover:gap-2 after:absolute after:inset-0 focus-visible:outline-none ${
          featured ? 'text-hero-green-light' : 'text-primary-container'
        }`}
      >
        Learn more<span className="sr-only"> about {service.name}</span>
        <Icon name="arrow_forward" size={16} />
      </Link>
    </article>
  );
}
