import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { SchemaGenerator } from './schema-generator';

export const metadata = toolMetadata(
  'schema-markup-generator',
  'Free Schema Markup Generator — JSON-LD for 8 Types',
  'Generate valid JSON-LD schema for LocalBusiness, Organization, Article, Product, FAQ, HowTo, Event and Breadcrumbs. Live validation, copy or download. Free.',
);

export default function Page() {
  return (
    <ToolPage
      slug="schema-markup-generator"
      h1="Schema Markup Generator"
      intro="Fill in a simple form and get clean JSON-LD structured data for 8 common schema types, checked against Google's required and recommended properties as you type. Everything runs in your browser."
      steps={[
        {
          title: 'Pick a schema type',
          body: 'Choose LocalBusiness, Organization, Article, Product, FAQ, HowTo, Event or Breadcrumbs. Use "Load example" to see a filled-in sample.',
        },
        {
          title: 'Fill in the details',
          body: 'Required fields are marked with a red star and recommended ones with a gold diamond. The JSON-LD and the validation list update on every keystroke.',
        },
        {
          title: 'Copy, paste and test',
          body: 'Copy the ready-made script tag into your page, publish it, then run Google’s Rich Results Test on the live URL to confirm it is picked up.',
        },
      ]}
      guide={[
        {
          heading: 'What is schema markup?',
          body: (
            <>
              <p>
                Schema markup is structured data that describes what a page is about in a vocabulary
                search engines agree on, published at schema.org. Instead of guessing that
                “+92-42-35761234” is a phone number or that “4.6” is a rating, Google, Bing and AI
                assistants read it as a labelled fact: this business has this telephone, this
                address and these opening hours.
              </p>
              <p>
                Markup does not directly raise rankings, but it makes a page eligible for rich
                results (stars, prices, event dates, breadcrumbs in the URL line) and helps search
                engines connect your website to your Google Business Profile and social profiles.
              </p>
            </>
          ),
        },
        {
          heading: 'JSON-LD vs microdata',
          body: (
            <>
              <p>
                There are three ways to add schema: JSON-LD, microdata and RDFa. Microdata and RDFa
                are attributes woven into your visible HTML, so a theme change or a page builder can
                silently break them. JSON-LD is a single block of JSON inside a{' '}
                <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code> tag, separate from
                the layout.
              </p>
              <p>
                Google recommends JSON-LD, it is easier to generate and review, and it can be added
                by a plugin, tag manager or developer without touching the design. That is why this
                tool outputs JSON-LD only.
              </p>
            </>
          ),
        },
        {
          heading: 'Where to put the code',
          body: (
            <>
              <p>
                Paste the script tag into the HTML of the page it describes, either in the{' '}
                <code>&lt;head&gt;</code> or anywhere in the <code>&lt;body&gt;</code>. On
                WordPress, use a header/footer code plugin or your SEO plugin’s custom schema
                option; on Shopify or Wix, use the custom code or theme settings area.
              </p>
              <p>
                Put each schema on the right page: LocalBusiness on your home or contact page,
                Product on each product page, Article on each post, FAQPage only where the questions
                are visible. The markup must match what visitors can see; marking up hidden or
                invented content breaks Google’s guidelines and can lead to a manual action.
              </p>
            </>
          ),
        },
        {
          heading: 'Which types help local businesses most',
          body: (
            <>
              <p>
                For a shop, clinic, restaurant or service business, start with{' '}
                <strong>LocalBusiness</strong> (or a specific subtype like Restaurant, Dentist or
                AutoRepair) with your exact name, address and phone as shown on your Google Business
                Profile, map coordinates, opening hours and sameAs links to your social and
                directory profiles. Consistent NAP details across your site, Google and directories
                are a core local SEO signal.
              </p>
              <p>
                Add <strong>Organization</strong> for your brand and logo,{' '}
                <strong>BreadcrumbList</strong> on deeper pages, <strong>Product</strong> if you
                sell online, and <strong>Event</strong> for workshops, sales or openings.
              </p>
            </>
          ),
        },
        {
          heading: 'Rich result eligibility: what to expect',
          body: (
            <>
              <p>
                Valid markup makes a page eligible for rich results; it does not guarantee them.
                Google decides per query and per site. A few changes are worth knowing:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Since August 2023, FAQ rich results are shown only for well-known, authoritative
                  government and health websites.
                </li>
                <li>HowTo rich results were retired in 2023 on both mobile and desktop.</li>
                <li>
                  Review stars are not shown for ratings a LocalBusiness or Organization publishes
                  about itself (self-serving reviews).
                </li>
              </ul>
              <p>
                The markup is still valid in all these cases and still helps search engines and AI
                tools understand your content, so it is worth keeping where it is accurate.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          q: 'Is this schema markup generator free?',
          a: 'Yes. It is free with no signup and no limits. The JSON-LD is built in your browser, and nothing you type is sent to a server. Drafts are saved only in your own browser’s local storage.',
        },
        {
          q: 'Will schema markup improve my Google rankings?',
          a: 'Not directly. Structured data is not a ranking factor on its own, but it can earn rich results that stand out and get more clicks, and it helps Google understand and trust details like your address, hours and products.',
        },
        {
          q: 'Which schema type should I use for my business?',
          a: 'Use LocalBusiness, or the most specific subtype available (Restaurant, Dentist, Store, ProfessionalService and so on), if customers visit you or you serve a local area. Use Organization for an online-only company or for your brand as a whole.',
        },
        {
          q: 'Can I use more than one schema type on a page?',
          a: 'Yes. You can add several script tags to one page, for example LocalBusiness plus BreadcrumbList, or Article plus FAQPage. Each must describe content that is actually on that page.',
        },
        {
          q: 'Why does the validator say a field is recommended but not required?',
          a: 'Google splits properties into required (the markup is invalid for rich results without them) and recommended (they improve eligibility and accuracy). Missing recommended fields are warnings: the code still works, but adding them makes it stronger.',
        },
        {
          q: 'How do I test my schema after adding it?',
          a: 'Use Google’s Rich Results Test to see which rich results the page is eligible for, and the Schema.org validator to check the markup against the full vocabulary. After publishing, the Enhancements reports in Google Search Console show errors across your whole site.',
        },
        {
          q: 'Is FAQ and HowTo schema still worth adding?',
          a: 'FAQ rich results are now limited to authoritative government and health sites, and HowTo rich results were retired in 2023. The markup is still valid and can help other search engines and AI answers read your content, but do not expect special display in Google.',
        },
        {
          q: 'Why should URLs be absolute?',
          a: 'Search engines read JSON-LD out of context, so relative paths like /logo.png can be misread. Use full URLs that start with https:// for your website, images, logo and profile links.',
        },
      ]}
    >
      <SchemaGenerator />
    </ToolPage>
  );
}
