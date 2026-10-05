import Image from 'next/image';
// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { Icon } from '@/components/icons';
import type { ImageTextVM } from '@/lib/home-types';
import { isDark, SectionShell } from './section-shell';

export function ImageText({ section }: { section: ImageTextVM }) {
  const dark = isDark(section.background);

  const text = (
    <div>
      <div
        className={`space-y-5 text-[0.9375rem] leading-[1.8] ${dark ? 'text-white/80' : 'text-ink-500'}`}
      >
        {section.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {section.cta ? (
        <Link
          href={section.cta.href}
          className={`group mt-4 inline-flex min-h-11 items-center gap-2 font-medium underline-offset-4 hover:underline ${
            dark ? 'text-white focus-visible:outline-white!' : 'text-brand-700 hover:text-brand-800'
          }`}
        >
          {section.cta.label}
          <Icon
            name="arrow-right"
            size={18}
            className="shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );

  if (!section.image) {
    return (
      <SectionShell section={section}>
        <div className="mx-auto max-w-3xl">{text}</div>
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* First in the source so small screens show the photo above the text. */}
        <div
          className={`relative aspect-square overflow-hidden rounded-lg bg-[var(--surface-2)] sm:aspect-[16/10] lg:aspect-[16/15] ${
            section.imagePosition === 'right' ? 'lg:order-last' : ''
          }`}
        >
          <Image
            src={section.image.url}
            alt={section.image.alt}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        {text}
      </div>
    </SectionShell>
  );
}
