import Image from 'next/image';
// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { Icon } from '@/components/icons';
import type { GuidesVM, PostCardVM } from '@/lib/home-types';
import { Carousel } from './carousel';
import { isDark, SectionShell } from './section-shell';

// Dates are publication days in Pakistan, whatever the server's time zone.
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Karachi',
});

function formatDate(iso: string): string | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : DATE_FORMAT.format(date);
}

// The whole card is the click target, but the link's accessible name stays the
// title. The clamp sits on the link rather than the heading so the heading's
// overflow clipping cannot cut off the link's focus ring.
const STRETCHED_LINK = 'line-clamp-2 after:absolute after:inset-0 after:rounded-lg';

function PostCard({
  post,
  showDates,
  dark,
}: {
  post: PostCardVM;
  showDates: boolean;
  dark: boolean;
}) {
  const date = showDates && post.publishedAt ? formatDate(post.publishedAt) : null;
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[var(--surface-2)]">
        {/* Decorative: the title below is the link text. */}
        {post.image ? (
          <Image
            src={post.image.url}
            alt=""
            fill
            sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <span className="text-ink-300 grid h-full place-items-center">
            <Icon name="image" size={40} strokeWidth={1.5} />
          </span>
        )}
        {post.category ? (
          // Top corner: the carousel's arrows sit level with the lower half on tablets.
          <span className="bg-brand-700 absolute top-3 left-3 rounded px-3 py-1 text-xs text-white">
            {post.category}
          </span>
        ) : null}
      </div>
      {date || post.readMinutes ? (
        <p
          className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] ${
            dark ? 'text-white/70' : 'text-ink-500'
          }`}
        >
          {date && post.publishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar-check" size={15} />
              <time dateTime={post.publishedAt}>{date}</time>
            </span>
          ) : null}
          {date && post.readMinutes ? <span aria-hidden>·</span> : null}
          {post.readMinutes ? <span>{post.readMinutes} min read</span> : null}
        </p>
      ) : null}
      <h3
        className={`mt-2 text-lg leading-snug font-medium transition-colors ${
          dark ? 'text-white' : 'text-ink-900 group-hover:text-brand-700'
        }`}
      >
        <Link href={post.href} className={STRETCHED_LINK}>
          {post.title}
        </Link>
      </h3>
      {post.excerpt ? (
        <p className={`mt-2 line-clamp-2 text-sm ${dark ? 'text-white/80' : 'text-ink-500'}`}>
          {post.excerpt}
        </p>
      ) : null}
    </article>
  );
}

export function Guides({ section }: { section: GuidesVM }) {
  const dark = isDark(section.background);
  return (
    <SectionShell section={section}>
      <Carousel
        label={section.heading ?? 'Articles'}
        step="page"
        arrows
        slideClassName="basis-full md:basis-1/2"
      >
        {section.posts.map((post) => (
          <PostCard key={post.id} post={post} showDates={section.showDates} dark={dark} />
        ))}
      </Carousel>
      {section.cta ? (
        <div className="mt-8 text-center">
          <Link
            href={section.cta.href}
            className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-8 py-3 text-[0.9375rem] font-medium transition-colors ${
              dark
                ? 'hover:text-brand-700 border-white text-white hover:bg-white focus-visible:outline-white!'
                : 'border-brand-700 text-brand-700 hover:bg-brand-700 hover:text-white'
            }`}
          >
            {section.cta.label}
          </Link>
        </div>
      ) : null}
    </SectionShell>
  );
}
