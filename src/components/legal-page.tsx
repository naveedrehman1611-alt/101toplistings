import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { InlineMarkdown } from '@/components/markdown';
import { PageHero } from '@/components/page-hero';

/** One clause: its paragraphs may hold **bold** and [links](/path). */
export type LegalSection = { heading: string; body: string[] };

/** Shared layout for the privacy policy and terms of use. */
export function LegalPage({
  path,
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  path: string;
  eyebrow: string;
  title: string;
  /** The whole line under the intro, such as "Last updated 29 September 2026". */
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const trail = [{ label: 'Home', href: '/' }, { label: title }];
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      <PageHero trail={trail} eyebrow={eyebrow} heading={title} subheading={intro}>
        {updated ? <p className="text-sm text-white/70">{updated}</p> : null}
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <div className="max-w-2xl">
          {sections.map((s, i) => (
            <section key={i} className="mt-10 first:mt-0">
              <h2 className="font-headline-md text-headline-md">{s.heading}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="mt-4 leading-relaxed text-[var(--text-muted)]">
                  <InlineMarkdown text={p} />
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
