import Image from 'next/image';
import { Icon } from '@/components/icons';
import type { TestimonialVM, TestimonialsVM } from '@/lib/home-types';
import { Carousel } from './carousel';
import { isDark, SectionShell } from './section-shell';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0])
    .join('')
    .toUpperCase();
}

function Testimonial({ item, dark }: { item: TestimonialVM; dark: boolean }) {
  return (
    <figure className="relative flex h-full flex-col items-center px-4 pt-2 text-center sm:px-6">
      <figcaption className="flex flex-col items-center">
        {/* The reference marks only the centre quote; one slide in view is always the centre. */}
        <Icon
          name="quote"
          size={44}
          className={`absolute top-0 left-2 opacity-0 group-data-[center=true]:opacity-100 motion-safe:transition-opacity max-md:opacity-100 ${
            dark ? 'text-white/30' : 'text-ink-300'
          }`}
        />
        {/* Decorative: the name is right below. */}
        {item.avatar ? (
          <span className="relative size-16 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <Image src={item.avatar.url} alt="" fill sizes="64px" className="object-cover" />
          </span>
        ) : (
          <span
            aria-hidden
            className="bg-brand-50 text-brand-700 grid size-16 place-items-center rounded-full text-lg font-medium"
          >
            {initials(item.name)}
          </span>
        )}
        <span className={`mt-4 text-base font-medium ${dark ? 'text-white' : 'text-ink-900'}`}>
          {item.name}
        </span>
        {item.role ? (
          <span className={`mt-0.5 text-[0.8125rem] ${dark ? 'text-white/70' : 'text-ink-500'}`}>
            {item.role}
          </span>
        ) : null}
      </figcaption>
      <blockquote
        className={`mt-4 line-clamp-6 space-y-3 text-sm leading-[1.75] ${
          dark ? 'text-white/80' : 'text-ink-500'
        }`}
      >
        {item.quote.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </blockquote>
    </figure>
  );
}

export function Testimonials({ section }: { section: TestimonialsVM }) {
  const dark = isDark(section.background);
  return (
    <SectionShell section={section}>
      <Carousel
        label={section.heading ?? 'Testimonials'}
        step="slide"
        highlightCenter
        slideClassName="basis-full md:basis-1/2 lg:basis-1/3"
      >
        {section.items.map((item) => (
          <Testimonial key={item.id} item={item} dark={dark} />
        ))}
      </Carousel>
    </SectionShell>
  );
}
