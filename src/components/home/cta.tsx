import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import type { CtaCardVM, CtaVM, LinkVM } from '@/lib/home-types';
import { isDark, SectionShell } from './section-shell';

const BUTTON =
  'inline-flex min-h-12 items-center justify-center rounded-lg px-8 py-3 text-center text-[0.9375rem] font-medium transition-colors sm:px-12';

// The site-wide focus ring is brand blue, which vanishes on a blue or navy
// band. That rule in globals.css sits outside Tailwind's layers, so only an
// important utility can recolour it.
const VARIANT = {
  solid: 'bg-brand-700 text-white hover:bg-brand-800',
  white: 'bg-white text-brand-700 hover:bg-brand-50 focus-visible:outline-white!',
  outline:
    'border-2 border-white text-white hover:bg-white hover:text-brand-700 focus-visible:outline-white!',
} as const;

function CtaButton({ cta, variant }: { cta: LinkVM; variant: keyof typeof VARIANT }) {
  return (
    <Link href={cta.href} className={`${BUTTON} ${VARIANT[variant]}`}>
      {cta.label}
    </Link>
  );
}

function CtaCard({ card }: { card: CtaCardVM }) {
  return (
    <div className="border-ink-300 rounded-2xl border bg-white p-6 shadow-[var(--shadow-raised)] sm:p-7">
      {card.title ? (
        <h3 className="text-ink-900 mb-4 text-[1.0625rem] leading-snug font-semibold">
          {card.title}
        </h3>
      ) : null}
      <div className="space-y-4">
        {card.paragraphs.map((p, i) => (
          <p key={i} className="text-ink-500 text-sm leading-[1.75]">
            {p}
          </p>
        ))}
        {card.checklist?.length ? (
          <ul className="space-y-3">
            {card.checklist.map((line, i) => (
              <li key={i} className="text-ink-700 flex gap-3 text-sm">
                <Icon
                  name={card.icon ?? undefined}
                  size={18}
                  strokeWidth={2.5}
                  className="text-brand-700 mt-0.5 shrink-0"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** Cards above a centred button ("Grow your local visibility…"). */
function CardsLayout({ section }: { section: CtaVM }) {
  return (
    <SectionShell section={section}>
      {section.cards.length ? (
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          {section.cards.map((card) => (
            <CtaCard key={card.id} card={card} />
          ))}
        </div>
      ) : null}
      {section.cta ? (
        <div className="mt-10 text-center">
          <CtaButton cta={section.cta} variant={isDark(section.background) ? 'white' : 'solid'} />
        </div>
      ) : null}
    </SectionShell>
  );
}

/** A full-width band: over a darkened photo, or a plain colour. */
function BannerLayout({ section }: { section: CtaVM }) {
  const photo = section.image;
  // A photo always sits under a dark overlay, so it takes the dark treatment
  // whatever background the editor picked.
  const shell = photo ? { ...section, background: 'navy' as const } : section;
  const dark = isDark(shell.background);
  const variant = photo ? 'white' : dark ? 'outline' : 'solid';

  return (
    <SectionShell
      section={shell}
      className={
        photo
          ? 'relative isolate flex min-h-[380px] items-center overflow-hidden py-16 sm:min-h-[420px]'
          : 'py-14'
      }
      containerClassName="container-page text-center"
    >
      {photo ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={photo.url} alt="" fill sizes="100vw" className="object-cover" />
          <div className="bg-navy-950/70 absolute inset-0" />
        </div>
      ) : null}
      {section.paragraphs.length ? (
        <div
          className={`mx-auto max-w-2xl space-y-4 text-[0.9375rem] leading-[1.75] ${
            dark ? 'text-white/85' : 'text-ink-500'
          }`}
        >
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      {section.cta ? (
        <div className={section.paragraphs.length ? 'mt-8' : ''}>
          <CtaButton cta={section.cta} variant={variant} />
        </div>
      ) : null}
    </SectionShell>
  );
}

export function Cta({ section }: { section: CtaVM }) {
  return section.layout === 'cards' ? (
    <CardsLayout section={section} />
  ) : (
    <BannerLayout section={section} />
  );
}
