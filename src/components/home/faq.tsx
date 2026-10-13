import { Icon } from '@/components/icon';
import { jsonLdHtml } from '@/lib/json-ld';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type FaqContent = SectionValues<(typeof HOME_PAGE)['sections']['faq']>;

/**
 * Home page FAQ (Stitch design). A native <details> accordion, so it works
 * without client JavaScript; the first answer starts open, as in the design.
 * The visible accordion and the FAQPage JSON-LD come from the same resolved
 * list, so the structured data always matches what is on the page.
 */
export function Faq({ content: c }: { content: FaqContent }) {
  const faqs = c.items.filter((item) => item.question.trim() && item.answer.trim());
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section id="faq" className="mx-auto w-full max-w-4xl px-6 py-16 lg:px-12">
      {/* The copy is editable: escape "<" so it cannot close the tag. */}
      {faqs.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      ) : null}
      <div className="mb-12 text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          {c.eyebrow}
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          {c.heading}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{c.intro}</p>
      </div>
      <div className="space-y-3.5" id="faq-accordion">
        {faqs.map((item, i) => (
          <details
            key={i}
            open={i === 0}
            className="group bg-surface-card overflow-hidden rounded-xl shadow-xs"
          >
            <summary className="font-headline-sm text-headline-sm text-on-surface hover:text-primary-container focus-visible:ring-primary-container flex w-full cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-6 py-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <Icon
                name="expand_more"
                size={20}
                className="transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="font-body-md text-body-md text-on-surface-variant px-6 pt-1 pb-5">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
