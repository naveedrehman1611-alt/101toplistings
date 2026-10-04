import { Breadcrumbs } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';

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
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, path)} />
      <Breadcrumbs trail={trail} />
      <div className="max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated {updated}</p>
        <p className="mt-6 leading-relaxed text-[var(--text-muted)]">{intro}</p>
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-headline-md text-headline-md mt-10">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-4 leading-relaxed text-[var(--text-muted)]">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
