import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  findSection,
  getDirectoryStats,
  getPageSections,
  getSettings,
  settingText,
} from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { CountUp } from '@/components/home/count-up';
import { HubCtaBand } from '@/components/services-hub/hub-cta-band';
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

const QUOTE_HREF = '/contact?subject=SEO%20services';

const button =
  'font-display inline-flex items-center justify-center gap-1.5 rounded-[7px] px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';
const primaryButton = `${button} bg-primary-container hover:bg-primary text-white focus-visible:outline-primary-container`;
const lightButton = `${button} text-on-surface hover:bg-ink-100 bg-white focus-visible:outline-white`;
const ghostDarkButton = `${button} border border-white/25 text-white hover:bg-white/10 focus-visible:outline-white`;

const eyebrowLight =
  'font-label-sm text-label-sm text-primary-container inline-flex items-center gap-2.5 font-semibold tracking-[2px] uppercase';
const eyebrowDark =
  'text-hero-green-light inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase';
const sectionTitle =
  'font-display text-[length:clamp(26px,3.2vw,40px)] leading-[1.2] font-extrabold text-on-surface';

const HERO_POINTS = [
  'Campaigns for businesses across the UK, USA and Europe',
  'Every strategy built around your market, language and local search results',
  'Monthly reporting in plain English, scheduled around your time zone',
  'White-hat methods only: nothing that puts your domain at risk',
];

const PILLARS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'manage_search',
    title: 'Expertise',
    body: 'Hands-on SEO specialists who audit, plan and execute every campaign themselves.',
  },
  {
    icon: 'monitoring',
    title: 'Results',
    body: 'Every plan starts from a measurable goal: leads, sales or qualified traffic.',
  },
  {
    icon: 'visibility',
    title: 'Transparency',
    body: 'You see every task, every link and every report. Nothing happens behind the curtain.',
  },
  {
    icon: 'verified_user',
    title: 'Trust',
    body: 'Honest advice, ethical tactics and no long lock-in contracts.',
  },
];

const BADGES = [
  'White-hat only',
  'No lock-in contracts',
  'Plain-English reports',
  'AI search ready',
];

const STORY_STEPS: { when: string; title: string; body: string }[] = [
  {
    when: 'Week 1',
    title: 'Discovery & full audit',
    body: 'Technical crawl, competitor gap analysis and keyword research for each market you sell into.',
  },
  {
    when: 'Weeks\u00a02–4',
    title: 'Technical foundation',
    body: 'Fix crawl, speed, Core Web Vitals, schema and hreflang so search engines understand every page.',
  },
  {
    when: 'Month 2',
    title: 'Content that answers buyers',
    body: 'Service, location and guide pages written for your audience, in UK or US English as needed.',
  },
  {
    when: 'Month 3',
    title: 'Authority & local visibility',
    body: 'Editorial links, citations and Google Business Profile work that builds lasting trust signals.',
  },
  {
    when: 'Every month',
    title: 'Report, review, refine',
    body: 'A clear report on rankings, traffic and leads, plus the next month’s priorities agreed with you.',
  },
];

const VALUES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'travel_explore',
    title: 'Search-First Focus',
    body: 'We do search: SEO, local visibility and business listings. Not paid ads, not social, not web design on the side. That focus is why our work goes deep.',
  },
  {
    icon: 'verified',
    title: 'White-Hat Integrity',
    body: 'No private blog networks, no bought links, no shortcuts. Every tactic follows Google’s guidelines, so the growth we build survives algorithm updates.',
  },
  {
    icon: 'fact_check',
    title: 'Radical Transparency',
    body: 'You get read access to the work: every page changed, every link earned, every metric we report. No jargon, no vanity numbers.',
  },
  {
    icon: 'handshake',
    title: 'Long-Term Partnership',
    body: 'Rolling monthly agreements, not 12-month lock-ins. We keep clients by delivering, not by contract terms.',
  },
  {
    icon: 'smart_toy',
    title: 'Ahead of the Curve',
    body: 'Search is changing fast. We optimise for Google AI Overviews, ChatGPT, Perplexity and Bing Copilot as well as the classic blue links.',
  },
];

const REASONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'public',
    title: 'Built for UK, US & European Markets',
    body: 'Local spelling, currency, search engines and buyer intent differ by country. Your strategy reflects that, with hreflang and regional pages done properly.',
  },
  {
    icon: 'groups',
    title: 'One Dedicated Team, No Hand-Offs',
    body: 'You work with the same specialists from audit to reporting, with one point of contact who knows your account.',
  },
  {
    icon: 'monitoring',
    title: 'Measured in Revenue, Not Just Rankings',
    body: 'We track enquiries, conversions and pipeline value, the numbers that actually show up in your accounts.',
  },
  {
    icon: 'smart_toy',
    title: 'Optimised for AI Search',
    body: 'Structured content and entity signals that help your brand get cited in AI Overviews and answer engines.',
  },
];

const PRINCIPLES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'manage_search',
    title: 'Data Before Strategy, Always',
    body: 'We spend the first weeks researching your audience, competitors and site before recommending a single change.',
  },
  {
    icon: 'build',
    title: 'Technical Foundation First',
    body: 'Content and links only work on a site search engines can crawl, render and trust, so we fix the foundation first.',
  },
  {
    icon: 'campaign',
    title: 'Content That Earns Authority',
    body: 'Pages that answer real buyer questions, demonstrate expertise and give people a reason to link to you.',
  },
  {
    icon: 'link',
    title: 'Links Earned, Never Bought',
    body: 'Digital PR, genuine outreach and relevant directories. No link farms, no packages, no penalties.',
  },
  {
    icon: 'smart_toy',
    title: 'Built for AI Search Too',
    body: 'Every page is structured to be understood and cited by AI-driven search, not just ranked in ten blue links.',
  },
  {
    icon: 'speed',
    title: 'Measured, Reported, Refined',
    body: 'Monthly reviews show what worked and what didn’t, and next month’s plan changes accordingly.',
  },
];

function Highlight({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={dark ? 'text-hero-green-light' : 'text-primary-container'}>{children}</span>
  );
}

function EyebrowRule({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-0.5 w-7 ${dark ? 'bg-hero-green-light' : 'bg-primary-container'}`}
    />
  );
}

export default async function AboutPage() {
  const [sections, settings, stats] = await Promise.all([
    getPageSections('about'),
    getSettings(),
    getDirectoryStats(),
  ]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');

  // Live directory figures; a count that failed is left out rather than shown as 0.
  const statTiles = [
    { value: stats.listings, label: 'Businesses listed in our directory' },
    { value: stats.verified, label: 'Verified business profiles' },
    { value: stats.categories, label: 'Industries and categories covered' },
    { value: stats.cities, label: 'Cities and locations indexed' },
  ].filter((s): s is { value: number; label: string } => s.value !== null && s.value > 0);

  return (
    <>
      {/* Hero: intro and checklist left, 2×2 pillar cards right. */}
      <section className="bg-white pt-10 pb-16 lg:pb-24">
        <div className="container-page">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <div className="mt-6 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className={eyebrowLight}>
                <EyebrowRule />
                SEO for the UK, USA &amp; Europe
              </p>
              <h1 className="font-display text-on-surface mt-4 text-[length:clamp(32px,4.4vw,52px)] leading-[1.12] font-extrabold">
                {header?.heading || (
                  <>
                    About <Highlight>{brand}</Highlight>
                  </>
                )}
              </h1>
              <p className="mt-5 text-base leading-[1.75] text-[var(--text-muted)]">
                {header?.subheading ||
                  `${brand} is an SEO and business directory team helping companies across the UK, the United States and Europe win more customers from search. We combine technical SEO, content and ethical link building with a directory that puts real businesses in front of real buyers, and we report every result in plain English.`}
              </p>
              <ul className="mt-6 space-y-3">
                {HERO_POINTS.map((point) => (
                  <li key={point} className="text-on-surface flex items-start gap-3 text-[15px]">
                    <Icon
                      name="check_circle"
                      size={20}
                      className="text-primary-container mt-0.5 shrink-0"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link href="/seo-audit" className={primaryButton}>
                  <Icon name="fact_check" size={18} />
                  Get a Free SEO Audit
                </Link>
                <Link
                  href={QUOTE_HREF}
                  className={`${button} border-border-subtle text-on-surface hover:bg-ink-50 border`}
                >
                  <Icon name="mail" size={18} />
                  Talk to Our Team
                </Link>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {PILLARS.map((p) => (
                <li
                  key={p.title}
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
          </div>
        </div>
      </section>

      {/* Navy band: positioning statement left, headline card and live stats right. */}
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
            <p className={eyebrowDark}>
              <EyebrowRule dark />
              About {brand}
            </p>
            <h2
              id="about-trusted"
              className="font-display mt-4 text-[length:clamp(28px,3.6vw,44px)] leading-[1.15] font-extrabold text-white"
            >
              A Specialist <Highlight dark>SEO Partner</Highlight> for International Businesses
              <span className="mt-2 block">Built on Real Results.</span>
            </h2>
            <p className="mt-5 text-base leading-[1.75] text-white/70">
              We are not a generalist marketing agency that offers SEO as an add-on. Search is what
              we do: getting businesses found on Google, in local map results, in trusted
              directories and increasingly in AI-generated answers.
            </p>
            <p className="mt-4 text-base leading-[1.75] text-white/70">
              Whether you are a London law firm, a Texas home-services company or a Berlin
              e-commerce brand, the process is the same: understand the market, fix what holds the
              site back, publish content buyers want, and earn authority the honest way.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link href="/seo-audit" className={primaryButton}>
                <Icon name="fact_check" size={18} />
                Get a Free SEO Audit
              </Link>
              <Link href={QUOTE_HREF} className={ghostDarkButton}>
                <Icon name="mail" size={18} />
                Request a Proposal
              </Link>
            </div>
          </div>
          <div>
            <div className="bg-primary-container rounded-card p-7 text-white">
              <p className="font-display text-[44px] leading-none font-extrabold">UK · US · EU</p>
              <p className="mt-3 text-sm font-medium text-white">
                SEO campaigns built for English-speaking and European markets
              </p>
            </div>
            {statTiles.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {statTiles.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[10px] border border-white/10 bg-white/5 p-5"
                  >
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
            <ul className="mt-4 flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  <Icon name="check_circle" size={14} className="text-hero-green-light" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Story with first-90-days timeline left, values list right. */}
      <section aria-labelledby="about-story" className="bg-white py-20 lg:py-[100px]">
        <div className="container-page grid gap-14 lg:grid-cols-2">
          <div>
            <p className={eyebrowLight}>
              <EyebrowRule />
              Our story
            </p>
            <h2 id="about-story" className={`${sectionTitle} mt-4`}>
              From a Business Directory to a <Highlight>Full-Service SEO Partner</Highlight>
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-[var(--text-muted)]">
              <p>
                {brand} started as a business directory with one simple rule: list real businesses
                with details that actually help a customer decide. Reviewing listing after listing
                taught us exactly what makes a business visible in search, and what keeps it
                invisible.
              </p>
              <p>
                Business owners kept asking us the same question: <em>why can’t people find us?</em>{' '}
                So we turned that knowledge into a dedicated SEO service for companies in the UK,
                the USA and across Europe, from local trades to national e-commerce brands.
              </p>
              <p>
                Today every client gets the same structured process, the same{' '}
                <Link
                  href="/seo-services"
                  className="text-primary-container font-semibold hover:underline"
                >
                  professional SEO services
                </Link>{' '}
                and the same honest reporting, whatever their size or market.
              </p>
            </div>
            <h3 className="font-display text-on-surface mt-10 text-lg font-extrabold">
              What your first 90 days look like
            </h3>
            <ol className="border-border-subtle mt-5 overflow-hidden rounded-[12px] border">
              {STORY_STEPS.map((s) => (
                <li
                  key={s.when}
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
          </div>
          <div>
            <h2 className="font-display text-on-surface text-2xl font-extrabold">
              What We Stand For
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              The principles behind every campaign, every client relationship and every decision we
              make on your behalf.
            </p>
            <ul className="mt-6 space-y-4">
              {VALUES.map((v) => (
                <li
                  key={v.title}
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
        </div>
      </section>

      {/* Why choose us: rounded navy panel. */}
      <section aria-labelledby="about-why" className="bg-surface-bg py-20 lg:py-[100px]">
        <div className="container-page">
          <div className="bg-hero-navy grid gap-10 rounded-3xl p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className={eyebrowDark}>
                <EyebrowRule dark />
                Why {brand}
              </p>
              <h2
                id="about-why"
                className="font-display mt-4 text-[length:clamp(26px,3.2vw,38px)] leading-[1.2] font-extrabold text-white"
              >
                Why Growing Businesses <Highlight dark>Choose Our SEO Team</Highlight>
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-white/70">
                Businesses in the UK, the US and Europe choose us for one reason: we connect SEO
                work to commercial outcomes. You know what we are doing, why we are doing it and
                what it is worth to your business.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link href="/seo-audit" className={primaryButton}>
                  <Icon name="rocket_launch" size={18} />
                  Start With a Free Audit
                </Link>
                <Link href={QUOTE_HREF} className={lightButton}>
                  <Icon name="mail" size={18} />
                  Contact Our Team
                </Link>
              </div>
            </div>
            <ul className="space-y-4">
              {REASONS.map((r) => (
                <li
                  key={r.title}
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

      {/* Six-principle approach grid; first and last cards are navy for rhythm. */}
      <section aria-labelledby="about-approach" className="bg-white py-20 lg:py-[100px]">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="about-approach" className={sectionTitle}>
              Our <Highlight>SEO Approach</Highlight>
              <span className="block">Why It Delivers Results Others Can’t</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
              We do not work from a template. Every campaign is built on six principles that keep
              the work focused, ethical and accountable.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => {
              const dark = i === 0 || i === PRINCIPLES.length - 1;
              return (
                <li
                  key={p.title}
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
                    Principle {String(i + 1).padStart(2, '0')}
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

      <HubCtaBand quoteHref={QUOTE_HREF} />
    </>
  );
}
