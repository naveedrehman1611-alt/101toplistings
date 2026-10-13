import type { Metadata } from 'next';
import Link from 'next/link';
import {
  findSection,
  getDirectoryStats,
  getPageSections,
  type DirectoryStats,
} from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { CountUp } from '@/components/home/count-up';
import { HubCtaBand } from '@/components/services-hub/hub-cta-band';
import { InlineMarkdown } from '@/components/markdown';
import { HighlightedHeading } from '@/components/company/highlighted';
import { getPageContent } from '@/lib/content/get';
import { paragraphs, type LinkValue, type SectionValues } from '@/lib/content/schema';
import type { ABOUT_PAGE } from '@/lib/content/pages/company';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'About Us | SEO Agency for UK, US & European Businesses';
const DESCRIPTION =
  'Meet the SEO and business directory team helping companies across the UK, USA and Europe grow organic traffic with white-hat, transparent, revenue-focused SEO.';
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/about', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

type Sections = (typeof ABOUT_PAGE)['sections'];
type Content = { [K in keyof Sections]: SectionValues<Sections[K]> };

/** The green band's quote button; the band's other copy is shared with the SEO pages. */
const QUOTE_HREF = '/contact?subject=SEO%20services';

const button =
  'font-display inline-flex items-center justify-center gap-1.5 rounded-[7px] px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';
const primaryButton = `${button} bg-primary-container hover:bg-primary text-white focus-visible:outline-primary-container`;
const lightButton = `${button} text-on-surface hover:bg-ink-100 bg-white focus-visible:outline-white`;
const ghostDarkButton = `${button} border border-white/25 text-white hover:bg-white/10 focus-visible:outline-white`;
const outlineButton = `${button} border-border-subtle text-on-surface hover:bg-ink-50 border`;

const eyebrowLight =
  'font-label-sm text-label-sm text-primary-container inline-flex items-center gap-2.5 font-semibold tracking-[2px] uppercase';
const eyebrowDark =
  'text-hero-green-light inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase';
const sectionTitle =
  'font-display text-[length:clamp(26px,3.2vw,40px)] leading-[1.2] font-extrabold text-on-surface';

const LIGHT = 'text-primary-container';
const DARK = 'text-hero-green-light';

function EyebrowRule({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-0.5 w-7 ${dark ? 'bg-hero-green-light' : 'bg-primary-container'}`}
    />
  );
}

const shown = (l: LinkValue) => Boolean(l.label && l.href);

/** A pair of buttons; either can be blanked in the editor, and the row goes with both. */
function ButtonRow({
  primary,
  secondary,
  primaryIcon,
  secondaryIcon,
  secondaryClass,
}: {
  primary: LinkValue;
  secondary: LinkValue;
  primaryIcon: IconName;
  secondaryIcon: IconName;
  secondaryClass: string;
}) {
  if (!shown(primary) && !shown(secondary)) return null;
  return (
    <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
      {shown(primary) ? (
        <Link href={primary.href} className={primaryButton}>
          <Icon name={primaryIcon} size={18} />
          {primary.label}
        </Link>
      ) : null}
      {shown(secondary) ? (
        <Link href={secondary.href} className={secondaryClass}>
          <Icon name={secondaryIcon} size={18} />
          {secondary.label}
        </Link>
      ) : null}
    </div>
  );
}

export default async function AboutPage() {
  const [content, sections, stats] = await Promise.all([
    getPageContent('about'),
    getPageSections('about'),
    getDirectoryStats(),
  ]);
  // A heading or intro saved under Admin -> Pages still wins, as it did before.
  const header = findSection(sections, 'header');

  return (
    <>
      <Hero c={content.hero} heading={header?.heading} subheading={header?.subheading} />
      {content.positioning.visible ? <Positioning c={content.positioning} stats={stats} /> : null}
      {content.story.visible || content.values.visible ? (
        <StoryAndValues story={content.story} values={content.values} />
      ) : null}
      {content.why.visible ? <Why c={content.why} /> : null}
      {content.approach.visible ? <Approach c={content.approach} /> : null}
      {content.cta.visible ? (
        <HubCtaBand
          heading={content.cta.heading}
          body={content.cta.body}
          primary={content.cta.primary}
          primaryIcon={content.cta.primary_icon}
          quoteHref={content.cta.quote.href || QUOTE_HREF}
          quoteLabel={content.cta.quote.label}
          quoteIcon={content.cta.quote_icon}
        />
      ) : null}
    </>
  );
}

/** Hero: intro and checklist left, 2×2 pillar cards right. */
function Hero({
  c,
  heading,
  subheading,
}: {
  c: Content['hero'];
  heading?: string | null;
  subheading?: string | null;
}) {
  return (
    <section className="bg-white pt-10 pb-16 lg:pb-24">
      <div className="container-page">
        <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
        <div className="mt-6 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {c.eyebrow ? (
              <p className={eyebrowLight}>
                <EyebrowRule />
                {c.eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-on-surface mt-4 text-[length:clamp(32px,4.4vw,52px)] leading-[1.12] font-extrabold">
              {heading || <HighlightedHeading c={c} className={LIGHT} />}
            </h1>
            <p className="mt-5 text-base leading-[1.75] text-[var(--text-muted)]">
              {subheading || c.intro}
            </p>
            {c.points.length ? (
              <ul className="mt-6 space-y-3">
                {c.points.map((point, i) => (
                  <li key={i} className="text-on-surface flex items-start gap-3 text-[15px]">
                    <Icon
                      name="check_circle"
                      size={20}
                      className="text-primary-container mt-0.5 shrink-0"
                    />
                    {point.text}
                  </li>
                ))}
              </ul>
            ) : null}
            <ButtonRow
              primary={c.primary}
              secondary={c.secondary}
              primaryIcon={c.primary_icon}
              secondaryIcon={c.secondary_icon}
              secondaryClass={outlineButton}
            />
          </div>
          {c.pillars.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {c.pillars.map((p, i) => (
                <li
                  key={i}
                  className="border-border-subtle rounded-card shadow-card hover:shadow-card-hover border bg-white p-6 transition-shadow"
                >
                  <span className="bg-surface-container text-primary-container inline-flex size-12 items-center justify-center rounded-2xl">
                    <Icon name={p.icon} size={24} />
                  </span>
                  <h2 className="font-display text-on-surface mt-4 text-lg font-extrabold">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{p.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Navy band: positioning statement left, headline card and live stats right. */
function Positioning({ c, stats }: { c: Content['positioning']; stats: DirectoryStats }) {
  // Live directory figures; a count that failed is left out rather than shown as 0.
  const statTiles = [
    { value: stats.listings, label: c.stat_listings },
    { value: stats.verified, label: c.stat_verified },
    { value: stats.categories, label: c.stat_categories },
    { value: stats.cities, label: c.stat_cities },
  ].filter((s): s is { value: number; label: string } => s.value !== null && s.value > 0);

  return (
    <section
      aria-labelledby="about-trusted"
      className="bg-hero-navy relative isolate overflow-hidden py-20 lg:py-[100px]"
    >
      <div
        aria-hidden="true"
        className="bg-hero-green-light pointer-events-none absolute -top-20 -right-20 -z-10 size-[400px] rounded-full opacity-10 blur-[80px]"
      />
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          {c.eyebrow ? (
            <p className={eyebrowDark}>
              <EyebrowRule dark />
              {c.eyebrow}
            </p>
          ) : null}
          <h2
            id="about-trusted"
            className="font-display mt-4 text-[length:clamp(28px,3.6vw,44px)] leading-[1.15] font-extrabold text-white"
          >
            <HighlightedHeading c={c} className={DARK} />
            {c.heading_line2 ? <span className="mt-2 block">{c.heading_line2}</span> : null}
          </h2>
          {paragraphs(c.body).map((p, i) => (
            <p
              key={i}
              className={`${i === 0 ? 'mt-5' : 'mt-4'} text-base leading-[1.75] text-white/70`}
            >
              {p}
            </p>
          ))}
          <ButtonRow
            primary={c.primary}
            secondary={c.secondary}
            primaryIcon={c.primary_icon}
            secondaryIcon={c.secondary_icon}
            secondaryClass={ghostDarkButton}
          />
        </div>
        <div>
          {c.card_title || c.card_text ? (
            <div className="bg-primary-container rounded-card p-7 text-white">
              {c.card_title ? (
                <p className="font-display text-[44px] leading-none font-extrabold">
                  {c.card_title}
                </p>
              ) : null}
              {c.card_text ? (
                <p className="mt-3 text-sm font-medium text-white">{c.card_text}</p>
              ) : null}
            </div>
          ) : null}
          {statTiles.length > 0 ? (
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {statTiles.map((s, i) => (
                <div key={i} className="rounded-[10px] border border-white/10 bg-white/5 p-5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-hero-green-light text-[28px] font-extrabold">
                    <CountUp to={s.value} format="compact" />
                  </dd>
                  <dd aria-hidden="true" className="mt-1 text-xs leading-snug text-white/60">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {c.badges.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.badges.map((b, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  <Icon name="check_circle" size={14} className="text-hero-green-light" />
                  {b.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Story with first-90-days timeline left, values list right. */
function StoryAndValues({ story, values }: { story: Content['story']; values: Content['values'] }) {
  return (
    <section
      aria-labelledby={story.visible ? 'about-story' : undefined}
      className="bg-white py-20 lg:py-[100px]"
    >
      <div className="container-page grid gap-14 lg:grid-cols-2">
        {story.visible ? (
          <div>
            {story.eyebrow ? (
              <p className={eyebrowLight}>
                <EyebrowRule />
                {story.eyebrow}
              </p>
            ) : null}
            <h2 id="about-story" className={`${sectionTitle} mt-4`}>
              <HighlightedHeading c={story} className={LIGHT} />
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-[var(--text-muted)]">
              {paragraphs(story.body).map((p, i) => (
                <p key={i}>
                  <InlineMarkdown
                    text={p}
                    linkClassName="text-primary-container font-semibold hover:underline"
                  />
                </p>
              ))}
            </div>
            {story.timeline_heading ? (
              <h3 className="font-display text-on-surface mt-10 text-lg font-extrabold">
                {story.timeline_heading}
              </h3>
            ) : null}
            {story.steps.length ? (
              <ol className="border-border-subtle mt-5 overflow-hidden rounded-[12px] border">
                {story.steps.map((s, i) => (
                  <li
                    key={i}
                    className="border-border-subtle grid grid-cols-[108px_1fr] border-b last:border-b-0 sm:grid-cols-[120px_1fr]"
                  >
                    <span className="bg-hero-navy font-display flex items-start px-4 py-4 text-xs font-extrabold text-white">
                      {s.when}
                    </span>
                    <div className="px-4 py-4">
                      <p className="text-on-surface text-sm font-bold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}
        {values.visible ? (
          <div>
            <h2 className="font-display text-on-surface text-2xl font-extrabold">
              {values.heading}
            </h2>
            {values.intro ? (
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
                {values.intro}
              </p>
            ) : null}
            <ul className="mt-6 space-y-4">
              {values.items.map((v, i) => (
                <li
                  key={i}
                  className="border-border-subtle rounded-card flex gap-4 border bg-white p-5"
                >
                  <span className="bg-surface-container text-primary-container inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon name={v.icon} size={22} />
                  </span>
                  <div>
                    <h3 className="text-on-surface text-[15px] font-bold">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                      {v.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Why choose us: rounded navy panel. */
function Why({ c }: { c: Content['why'] }) {
  return (
    <section aria-labelledby="about-why" className="bg-surface-bg py-20 lg:py-[100px]">
      <div className="container-page">
        <div className="bg-hero-navy grid gap-10 rounded-3xl p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            {c.eyebrow ? (
              <p className={eyebrowDark}>
                <EyebrowRule dark />
                {c.eyebrow}
              </p>
            ) : null}
            <h2
              id="about-why"
              className="font-display mt-4 text-[length:clamp(26px,3.2vw,38px)] leading-[1.2] font-extrabold text-white"
            >
              <HighlightedHeading c={c} className={DARK} />
            </h2>
            {c.body ? (
              <p className="mt-5 text-[15px] leading-[1.75] text-white/70">{c.body}</p>
            ) : null}
            <ButtonRow
              primary={c.primary}
              secondary={c.secondary}
              primaryIcon={c.primary_icon}
              secondaryIcon={c.secondary_icon}
              secondaryClass={lightButton}
            />
          </div>
          <ul className="space-y-4">
            {c.reasons.map((r, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-[12px] border border-white/10 bg-white/5 p-5"
              >
                <span className="bg-hero-green-light/15 text-hero-green-light inline-flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon name={r.icon} size={20} />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-white">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Principle grid; first and last cards are navy for rhythm. */
function Approach({ c }: { c: Content['approach'] }) {
  return (
    <section aria-labelledby="about-approach" className="bg-white py-20 lg:py-[100px]">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="about-approach" className={sectionTitle}>
            <HighlightedHeading c={c} className={LIGHT} />
            {c.heading_line2 ? <span className="block">{c.heading_line2}</span> : null}
          </h2>
          {c.intro ? (
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">{c.intro}</p>
          ) : null}
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.principles.map((p, i) => {
            const dark = i === 0 || i === c.principles.length - 1;
            return (
              <li
                key={i}
                className={`rounded-card p-7 ${
                  dark
                    ? 'bg-hero-navy text-white'
                    : 'border-border-subtle shadow-card border bg-white'
                }`}
              >
                <p
                  className={`text-xs font-bold tracking-[2px] uppercase ${
                    dark ? 'text-hero-green-light' : 'text-primary-container'
                  }`}
                >
                  {c.number_label} {String(i + 1).padStart(2, '0')}
                </p>
                <Icon
                  name={p.icon}
                  size={28}
                  className={`mt-5 ${dark ? 'text-hero-green-light' : 'text-primary-container'}`}
                />
                <h3
                  className={`font-display mt-4 text-lg font-extrabold ${
                    dark ? 'text-white' : 'text-on-surface'
                  }`}
                >
                  {p.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    dark ? 'text-white/70' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {p.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
