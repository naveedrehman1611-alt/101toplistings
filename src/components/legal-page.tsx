import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';

export type LegalSection = { heading: string; body: string[] };

/** Shared layout for the privacy policy and terms of use. */
export function LegalPage({
  path,
  title,
  updated,
  intro,
  sections,
}: {
  path: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const trail = [{ label: 'Home', href: '/' }, { label: title }];
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      <PageHero trail={trail} eyebrow="Legal & policies" heading={title} subheading={intro}>
        <p className="text-sm text-white/70">Last updated {updated}</p>
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <div className="max-w-2xl">
          {sections.map((s) => (
            <section key={s.heading} className="mt-10 first:mt-0">
              <h2 className="font-headline-md text-headline-md">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-[var(--text-muted)]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
