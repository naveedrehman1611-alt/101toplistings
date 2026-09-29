import { Icon } from '@/components/icon';
import { jsonLdHtml } from '@/lib/json-ld';

type FaqItem = { question: string; answer: string };

// One source for both the visible accordion and the FAQPage JSON-LD, so the
// structured data always matches what is on the page.
function faqItems(brand: string): FaqItem[] {
  return [
    {
      question: `What is ${brand}?`,
      answer: `${brand} is an online business directory for Pakistan. It helps people find local businesses and service providers by category and city, and gives business owners a free way to be found online.`,
    },
    {
      question: `Is ${brand} free to use?`,
      answer:
        'Yes. Searching the directory, browsing categories and cities, and viewing business profiles is free. You do not need an account to look up a business.',
    },
    {
      question: `Is ${brand} free for business submissions?`,
      answer:
        'Yes. Creating an account and submitting your business listing costs nothing. Each new listing is reviewed by our team before it is published.',
    },
    {
      question: 'How can I find a business near me?',
      answer:
        'Use the search bar at the top of the homepage: choose what you are looking for, select your city, and press Search. You can also browse businesses by city or by category.',
    },
    {
      question: 'What information is available on a business listing?',
      answer:
        'A listing can show the business name, category, address, city, phone number, email, website, opening hours, photos, social media links and customer reviews. Each business decides which details to provide, so some profiles are more complete than others.',
    },
    {
      question: `Which cities does ${brand} cover?`,
      answer: `${brand} lists businesses across Pakistan, from large cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar and Quetta to smaller towns. You can browse the businesses listed in any city from its city page.`,
    },
    {
      question: `Does ${brand} verify every business listing?`,
      answer:
        'Every new listing is reviewed by our team before it goes live, and a listing marked as verified has had its details confirmed. Details can still change, so contact the business to confirm prices and availability before you visit.',
    },
    {
      question: 'How should I choose a local service provider?',
      answer:
        'Compare a few businesses in the same category: look at their services, location, opening hours, photos and reviews, then contact your shortlist to ask about prices, experience and availability before you decide.',
    },
    {
      question: 'How can I update my business listing?',
      answer:
        'Sign in and open your dashboard, where you can edit your listing details, opening hours and photos at any time.',
    },
    {
      question: 'How can incorrect business information be reported?',
      answer:
        'Send us a message through the contact page with the business name and the detail that needs correcting. Our team reviews every report and updates the listing.',
    },
    {
      question: 'Can I contact businesses directly?',
      answer: `Yes. ${brand} does not act as a middleman. Use the phone number, email, website or address on a business profile to contact the business directly.`,
    },
  ];
}

/**
 * Home page FAQ (Stitch design). A native <details> accordion, so it works
 * without client JavaScript; the first answer starts open, as in the design.
 */
export function Faq({ brand }: { brand: string }) {
  const faqs = faqItems(brand);
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
      {/* The brand name comes from editable settings: escape "<" so it cannot close the tag. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="mb-12 text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          Everything You Need To Know
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          Frequently Asked Questions
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Answers to common questions about finding businesses and listing your business on {brand}.
        </p>
      </div>
      <div className="space-y-3.5" id="faq-accordion">
        {faqs.map((item, i) => (
          <details
            key={item.question}
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
