import {
  definePage,
  defineSection,
  image,
  icon,
  link,
  list,
  text,
  textarea,
  type PageSpec,
} from '../schema';

/*
 * Company pages: about, contact, pricing, add / claim a business, featured
 * businesses and the two legal pages. Every default is the copy the page
 * shipped with, so an empty site_content table renders the original pages.
 *
 * Coloured words in a heading are split into "before", "coloured" and "after"
 * fields, so an admin never has to type markup.
 */

const QUOTE_HREF = '/contact?subject=seo%20services';

const MARKDOWN_HINT = 'Use **bold**, *italic* and [link text](/path) for emphasis and links.';
const PARAGRAPHS_HINT = 'Leave a blank line between paragraphs.';

/** Heading split around its coloured words. */
function headingFields(before: string, highlight: string, after: string, label = 'Heading') {
  return {
    heading: text(`${label}, before the coloured words`, before, { max: 120 }),
    heading_highlight: text(`${label}, coloured words`, highlight, {
      max: 80,
      hint: 'Drawn in the accent colour. Leave blank for none.',
    }),
    heading_after: text(`${label}, after the coloured words`, after, { max: 120 }),
  };
}

const titleBody = (titleMax = 80, bodyMax = 400) => ({
  title: text('Title', '', { max: titleMax }),
  body: textarea('Text', '', { max: bodyMax }),
});

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const ABOUT_PAGE = definePage({
  label: 'About us',
  path: '/about',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      description:
        'Eyebrow, headline, intro, checklist, buttons and the four cards on the right. Until you save this section, a heading saved for this page in Admin → Pages & sections is shown instead; after that, this one wins.',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Free Listings + SEO for Businesses Worldwide', { max: 80 }),
        ...headingFields('About', '{brand}', '– Free Business Directory & SEO Agency', 'Headline'),
        intro: textarea(
          'Intro text',
          '{brand} is a free business directory and SEO agency for businesses in Pakistan, the UK, the USA, the UAE and Europe. Any business can add a free business listing and get found by local customers. When you need more visibility, our team grows your traffic with technical SEO, local SEO, content and ethical link building, and we report every result in plain English.',
          { max: 800 },
        ),
        points: list('Checklist', {
          noun: 'point',
          max: 8,
          item: { text: text('Point', '', { max: 160 }) },
          default: [
            { text: 'Free business listings in 80+ cities, reviewed before they go live' },
            { text: 'Every strategy built around your market, language and local search results' },
            { text: 'Monthly reporting in plain English, scheduled around your time zone' },
            { text: 'White-hat methods only: nothing that puts your domain at risk' },
          ],
        }),
        primary_icon: icon('Main button icon', 'fact_check'),
        primary: link('Main button', { label: 'Get a Free SEO Audit', href: '/seo-audit' }),
        secondary: link('Second button', { label: 'Talk to Our Team', href: QUOTE_HREF }),
        secondary_icon: icon('Second button icon', 'mail'),
        pillars: list('Cards on the right', {
          noun: 'card',
          max: 8,
          item: { icon: icon('Icon', 'manage_search'), ...titleBody(60, 240) },
          default: [
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
          ],
        }),
      },
    }),
    positioning: defineSection({
      label: 'Navy band: who we are',
      description:
        'Positioning statement, buttons, the green headline card, live stats and badges.',
      fields: {
        eyebrow: text('Eyebrow', 'About {brand}', { max: 80 }),
        ...headingFields(
          'A Free Business Directory',
          'and SEO Partner',
          'for Businesses Worldwide',
        ),
        heading_line2: text('Heading, second line', 'Built on Real Results.', { max: 120 }),
        body: textarea(
          'Text',
          'We are not a generalist marketing agency that offers SEO as an add-on. Search is what we do: getting businesses found on Google, in local map results, in trusted directories and increasingly in AI-generated answers. Unlike many free local business listing sites and SEO listing sites, every profile on {brand} is checked by a person before it goes live.\n\nWhether you are a London law firm, a Texas home-services company or a Berlin e-commerce brand, the process is the same: understand the market, fix what holds the site back, publish content buyers want, and earn authority the honest way.',
          { max: 1500, hint: PARAGRAPHS_HINT },
        ),
        primary_icon: icon('Main button icon', 'fact_check'),
        primary: link('Main button', { label: 'Get a Free SEO Audit', href: '/seo-audit' }),
        secondary: link('Second button', { label: 'Request a Proposal', href: QUOTE_HREF }),
        secondary_icon: icon('Second button icon', 'mail'),
        card_title: text('Green card, big text', 'PK · UK · US · UAE · EU', { max: 40 }),
        card_text: text(
          'Green card, small text',
          'Free business listings and SEO campaigns for local and international markets',
          { max: 160 },
        ),
        stat_listings: text('Stat label: businesses listed', 'Businesses listed in our directory', {
          max: 60,
          hint: 'The figures come from the directory; a stat with no figure is hidden.',
        }),
        stat_verified: text('Stat label: verified profiles', 'Verified business profiles', {
          max: 60,
        }),
        stat_categories: text('Stat label: categories', 'Industries and categories covered', {
          max: 60,
        }),
        stat_cities: text('Stat label: cities', 'Cities and locations indexed', { max: 60 }),
        badges: list('Badges', {
          noun: 'badge',
          max: 8,
          item: { text: text('Badge', '', { max: 40 }) },
          default: [
            { text: 'White-hat only' },
            { text: 'No lock-in contracts' },
            { text: 'Plain-English reports' },
            { text: 'AI search ready' },
          ],
        }),
      },
    }),
    story: defineSection({
      label: 'Our story and first 90 days',
      description: 'Left column of the white section: the story and the 90-day timeline.',
      fields: {
        eyebrow: text('Eyebrow', 'Our story', { max: 60 }),
        ...headingFields('From a Business Directory to a', 'Full-Service SEO Partner', ''),
        body: textarea(
          'Story',
          '{brand} started as a free business directory with one simple rule: list real businesses with details that actually help a customer decide. Reviewing listing after listing taught us exactly what makes a business visible in search, and what keeps it invisible.\n\nBusiness owners kept asking us the same question: *why can’t people find us?* So we turned that knowledge into a dedicated SEO service for companies in the UK, the USA and across Europe, from local trades to national e-commerce brands.\n\nToday every client gets the same structured process, the same [professional SEO services](/seo-services) and the same honest reporting, whatever their size or market.',
          { max: 2500, hint: `${PARAGRAPHS_HINT} ${MARKDOWN_HINT}`, markdown: 'inline' },
        ),
        timeline_heading: text('Timeline heading', 'What your first 90 days look like', {
          max: 100,
        }),
        steps: list('Timeline steps', {
          noun: 'step',
          max: 10,
          item: {
            when: text('When', '', { max: 20, hint: 'Shown in the navy column, e.g. "Week 1".' }),
            ...titleBody(80, 300),
          },
          default: [
            {
              when: 'Week 1',
              title: 'Discovery & full audit',
              body: 'Technical crawl, competitor gap analysis and keyword research for each market you sell into.',
            },
            {
              when: 'Weeks 2–4',
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
          ],
        }),
      },
    }),
    values: defineSection({
      label: 'What we stand for',
      description: 'Right column of the story section: the list of values.',
      fields: {
        heading: text('Heading', 'What We Stand For', { max: 100 }),
        intro: textarea(
          'Intro text',
          'The principles behind every campaign, every client relationship and every decision we make on your behalf.',
          { max: 400 },
        ),
        items: list('Values', {
          noun: 'value',
          max: 10,
          item: { icon: icon('Icon', 'travel_explore'), ...titleBody(80, 400) },
          default: [
            {
              icon: 'travel_explore',
              title: 'Search-First Focus',
              body: 'We do search: SEO, local visibility and business listings. Not paid ads and not social media management. That focus is why our work goes deep.',
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
          ],
        }),
      },
    }),
    founder: defineSection({
      label: 'Meet the founder',
      description:
        'The person behind the business. The name, role and profile link also go into the page’s Person schema, so keep them real.',
      fields: {
        eyebrow: text('Eyebrow', 'Meet the founder', { max: 60 }),
        name: text('Name', 'Naveed ur Rehman', { max: 80 }),
        photo: image(
          'Photo',
          {
            src: '/images/founder-naveed-ur-rehman.webp',
            alt: 'Naveed ur Rehman, founder of {brand}',
          },
          'A square head-and-shoulders photo, 400×400 or larger. Also used as the Person schema image. Remove it to show initials instead.',
        ),
        role: text('Role', 'Founder & SEO Lead', { max: 80 }),
        experience: text('Experience line', '10+ years in SEO', {
          max: 60,
          hint: 'Shown as a badge next to the name. Leave blank to hide it.',
        }),
        bio: textarea(
          'Bio',
          'Naveed ur Rehman founded {brand} after more than ten years working in search engine optimisation. He leads every client campaign personally, from the first audit to the monthly report, so the person who plans your strategy is the person who does the work.\n\nHis focus today is helping small and growing businesses be found in both classic search results and AI answers from Google, ChatGPT and Perplexity, using [technical SEO](/seo-services/technical-seo), useful content and white-hat [link building](/seo-services/link-building).',
          { max: 2000, hint: `${PARAGRAPHS_HINT} ${MARKDOWN_HINT}`, markdown: 'inline' },
        ),
        profile_url: text('LinkedIn or profile URL', '', {
          max: 300,
          hint: 'Full https:// address of a public profile, such as LinkedIn. Leave blank until you have one.',
        }),
      },
    }),
    why: defineSection({
      label: 'Why choose us panel',
      description: 'The rounded navy panel with buttons and the list of reasons.',
      fields: {
        eyebrow: text('Eyebrow', 'Why {brand}', { max: 60 }),
        ...headingFields('Why Growing Businesses', 'Choose Our SEO Team', ''),
        body: textarea(
          'Text',
          'Businesses in the UK, the US and Europe choose us for one reason: we connect SEO work to commercial outcomes. You know what we are doing, why we are doing it and what it is worth to your business.',
          { max: 600 },
        ),
        primary_icon: icon('Main button icon', 'rocket_launch'),
        primary: link('Main button', { label: 'Start With a Free Audit', href: '/seo-audit' }),
        secondary: link('Second button', { label: 'Contact Our Team', href: QUOTE_HREF }),
        secondary_icon: icon('Second button icon', 'mail'),
        reasons: list('Reasons', {
          noun: 'reason',
          max: 8,
          item: { icon: icon('Icon', 'public'), ...titleBody(80, 400) },
          default: [
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
          ],
        }),
      },
    }),
    approach: defineSection({
      label: 'Our SEO approach',
      description: 'The grid of principle cards; the first and last cards are navy.',
      fields: {
        ...headingFields('Our', 'SEO Approach', ''),
        heading_line2: text('Heading, second line', 'Why It Delivers Results Others Can’t', {
          max: 120,
        }),
        intro: textarea(
          'Intro text',
          'We do not work from a template. Every campaign is built on six principles that keep the work focused, ethical and accountable.',
          { max: 400 },
        ),
        number_label: text('Card number label', 'Principle', {
          max: 30,
          hint: 'Shown above each card with its number, e.g. "Principle 01".',
        }),
        principles: list('Principles', {
          noun: 'principle',
          max: 12,
          item: { icon: icon('Icon', 'manage_search'), ...titleBody(80, 400) },
          default: [
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
          ],
        }),
      },
    }),
    cta: defineSection({
      label: 'Green call-to-action band',
      description: 'The green band above the footer: heading, a short line and two buttons.',
      fields: {
        heading: text('Heading', 'Ready to rank your business higher?', { max: 120 }),
        body: text(
          'Text under the heading',
          'Get a free SEO audit and a plan you can actually read.',
          {
            max: 200,
            hint: 'Leave blank for none.',
          },
        ),
        primary: link(
          'Dark button',
          { label: 'Get Free SEO Audit', href: '/seo-audit' },
          'Leave the text blank to hide the button.',
        ),
        primary_icon: icon('Dark button icon', 'fact_check'),
        quote: link(
          'White button',
          { label: 'Request a Quote', href: '/contact?subject=seo%20services' },
          'Leave the text blank to hide the button.',
        ),
        quote_icon: icon('White button icon', 'mail'),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const CONTACT_PAGE = definePage({
  label: 'Contact us',
  path: '/contact',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      description:
        'The navy banner. Until you save this section, a heading saved for this page in Admin → Pages & sections is shown instead; after that, this one wins.',
      hideable: false,
      fields: {
        breadcrumb: text('Breadcrumb label', 'Contact us', { max: 40 }),
        eyebrow: text('Eyebrow', 'We reply by email', { max: 60 }),
        ...headingFields('Get in', 'touch', '', 'Headline'),
        intro: textarea(
          'Intro text',
          "Have a question, a listing issue, or a partnership idea? Send us a message and we'll get back to you.",
          { max: 400 },
        ),
      },
    }),
    info: defineSection({
      label: 'Contact information card',
      description:
        'The card beside the form. The email address itself comes from Settings (contact.email).',
      fields: {
        heading: text('Heading', 'Contact information', { max: 60 }),
        body: textarea(
          'Text',
          "Questions about the directory, your account, or how listings work — email us and we'll get back to you.",
          { max: 400 },
        ),
        email_label: text('Label above the email address', 'Email us', { max: 40 }),
        cta_heading: text('Bottom heading', 'Ready to get listed?', { max: 80 }),
        cta_text: text('Bottom text', "It only takes a couple of minutes, and it's free.", {
          max: 160,
        }),
        cta_link: link('Bottom link', {
          label: 'Add your listing',
          href: '/add-business',
        }),
      },
    }),
    help: defineSection({
      label: 'Quick help questions',
      description: 'The card of common questions beside the form.',
      fields: {
        heading: text('Heading', 'Quick help', { max: 60 }),
        items: list('Questions', {
          noun: 'question',
          max: 10,
          item: {
            question: text('Question', '', { max: 160 }),
            answer: textarea('Answer', '', { max: 600 }),
            link: link('Link under the answer', { label: '', href: '' }, 'Leave blank for none.'),
          },
          default: [
            {
              question: 'How do I list my business?',
              answer:
                "It's free and takes just a couple of minutes. Fill in your details and submit — every listing is reviewed before it goes live.",
              link: { label: 'Add your listing', href: '/add-business' },
            },
            {
              question: 'Is it free to use?',
              answer:
                'Yes. Browsing the directory and listing your business are both completely free — no pay-to-rank tricks or hidden fees.',
              link: { label: '', href: '' },
            },
            {
              question: 'How do I edit my listing?',
              answer:
                'Sign in and open My listings from your dashboard, then choose the listing you want to update.',
              link: { label: 'Go to my listings', href: '/login?next=/dashboard' },
            },
            {
              question: 'What areas do you cover?',
              answer:
                "Every city and category currently in the directory — browse by category to see what's listed near you.",
              link: { label: 'Browse categories', href: '/business-categories' },
            },
          ],
        }),
      },
    }),
    form: defineSection({
      label: 'Contact form',
      description: 'Labels, subjects and button of the form, and the thank-you message.',
      hideable: false,
      fields: {
        heading: text('Heading', 'Send us a message', { max: 60 }),
        name_label: text('Name field label', 'Your name', { max: 40 }),
        email_label: text('Email field label', 'Email address', { max: 40 }),
        subject_label: text('Subject field label', 'Subject', { max: 40 }),
        subject_placeholder: text('Subject menu placeholder', 'Select a subject', { max: 60 }),
        subjects: list('Subjects', {
          noun: 'subject',
          max: 20,
          hint: 'Saved with each message and shown in the inbox. Links such as /contact?subject=seo%20services preselect the subject with that name.',
          item: { subject: text('Subject', '', { max: 80 }) },
          default: [
            { subject: 'General question' },
            { subject: 'Listing issue or correction' },
            { subject: 'Help with my account' },
            { subject: 'Partnership or advertising' },
            { subject: 'Report a problem' },
            { subject: 'SEO services' },
            { subject: 'Digital marketing' },
            { subject: 'Web development' },
            { subject: 'Guest posting' },
            { subject: 'Link building' },
            { subject: 'Other' },
          ],
        }),
        message_label: text('Message field label', 'Message', { max: 40 }),
        button: text('Send button', 'Send message', { max: 40 }),
        sent_heading: text('Thank-you heading', 'Thanks — your message has been sent.', {
          max: 120,
        }),
        sent_text: text('Thank-you text', 'We will reply by email.', { max: 200 }),
        sent_link: link('Thank-you link', { label: 'Send another message', href: '/contact' }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const PRICING_PAGE = definePage({
  label: 'Pricing',
  path: '/pricing',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Plans & Pricing', { max: 60 }),
        ...headingFields('Business listing and', 'SEO pricing', '', 'Headline'),
        intro: textarea(
          'Intro text',
          'Listing your business in the directory is free. Featured placement and SEO services are priced by quote, because the right scope depends on your business and website. There are no fixed prices published here.',
          { max: 600 },
        ),
        stat_plans: text('Stat label: number of plans', 'Plans', {
          max: 40,
          hint: 'The figure is the number of plans below.',
        }),
        stat_value: text('Second stat, value', 'Free', { max: 20 }),
        stat_label: text('Second stat, label', 'Business Listing', { max: 40 }),
      },
    }),
    plans: defineSection({
      label: 'Plans',
      description: 'The plan cards.',
      fields: {
        heading: text('Heading', 'Choose a plan', { max: 80 }),
        plans: list('Plans', {
          noun: 'plan',
          max: 6,
          item: {
            icon: icon('Icon', 'add_business'),
            name: text('Name', '', { max: 60 }),
            price: text('Price', '', { max: 40 }),
            body: textarea('Description', '', { max: 400 }),
            points: textarea('Included', '', { max: 800, hint: 'One point per line.' }),
            primary: link('Main button', { label: '', href: '' }, 'Leave blank for none.'),
            secondary: link(
              'Second button (outlined)',
              { label: '', href: '' },
              'Leave blank for none.',
            ),
          },
          default: [
            {
              icon: 'add_business',
              name: 'Free listing',
              price: 'Free',
              body: 'A standard business listing in the directory, reviewed before it goes live.',
              points:
                'Your own listing page\nCategory and city placement\nEdit your details any time',
              primary: { label: 'Create listing', href: '/register?next=/dashboard/listings/new' },
              secondary: { label: '', href: '' },
            },
            {
              icon: 'star',
              name: 'Featured listing',
              price: 'Quote on request',
              body: 'Extra visibility: featured listings are shown first in the business directory.',
              points: 'Shown ahead of standard listings\nListed on the featured businesses page',
              primary: {
                label: 'Request a quote',
                href: '/contact?subject=partnership%20or%20advertising',
              },
              secondary: { label: '', href: '' },
            },
            {
              icon: 'monitoring',
              name: 'SEO & marketing services',
              price: 'Custom quote',
              body: 'Hands-on work on your own website: audits, technical and on-page SEO, content and link building.',
              points: 'Start with an SEO audit\nA plan scoped to your site and goals',
              primary: { label: 'Get SEO audit', href: '/seo-audit' },
              secondary: { label: 'View SEO services', href: '/seo-services' },
            },
          ],
        }),
      },
    }),
    factors: defineSection({
      label: 'What affects SEO pricing',
      description: 'The cards explaining what drives the price, and the note under them.',
      fields: {
        heading: text('Heading', 'What affects SEO pricing', { max: 80 }),
        items: list('Factors', {
          noun: 'factor',
          max: 8,
          item: titleBody(80, 400),
          default: [
            {
              title: 'Size and condition of the site',
              body: 'A five-page local business site and a large online store need very different amounts of work.',
            },
            {
              title: 'Competition and goals',
              body: 'Ranking in a crowded market or across several cities takes more effort than a single niche.',
            },
            {
              title: 'Scope of work',
              body: 'Technical fixes, content, local SEO and link building are separate workstreams; you pay for the ones you need.',
            },
            {
              title: 'Starting point',
              body: 'An audit shows what is already working and what is holding the site back, which sets the scope.',
            },
          ],
        }),
        note: text(
          'Note under the cards',
          'Not sure where to start? See [featured businesses](/featured-businesses) or [contact us](/contact).',
          { max: 300, hint: MARKDOWN_HINT, markdown: 'inline' },
        ),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Add your business
// ---------------------------------------------------------------------------

export const ADD_BUSINESS_PAGE = definePage({
  label: 'Add your business',
  path: '/add-business',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Free business listing', { max: 60 }),
        ...headingFields('Add your business', 'online', '', 'Headline'),
        intro: textarea(
          'Intro text',
          'Adding your business to {brand} creates a free business listing: a page with your description, services, location, contact details and website that customers can find by category or city. Want to list your business online? You will need an account, and the form takes a few minutes.',
          { max: 800 },
        ),
        primary_icon: icon('Main button icon', 'add_business'),
        primary: link('Main button', {
          label: 'Create listing',
          href: '/register?next=/dashboard/listings/new',
        }),
        secondary: link('Second button', {
          label: 'Claim an existing listing',
          href: '/claim-business',
        }),
      },
    }),
    why: defineSection({
      label: 'Why add a listing',
      description: 'Three cards on why to list.',
      fields: {
        heading: text('Heading', 'Why add a business listing', { max: 80 }),
        items: list('Cards', {
          noun: 'card',
          max: 9,
          item: { icon: icon('Icon', 'travel_explore'), ...titleBody(80, 400) },
          default: [
            {
              icon: 'travel_explore',
              title: 'Get found by customers',
              body: 'People browse the directory by category and by city. A listing puts your business in front of them with the details they need to choose.',
            },
            {
              icon: 'language',
              title: 'A page that points to your website',
              body: 'Your listing is its own page with your website, contact details and services, so searchers can reach you directly.',
            },
            {
              icon: 'sell',
              title: 'Free to list',
              body: 'Adding a business listing costs nothing. Optional paid promotion exists, but a standard listing is free.',
            },
          ],
        }),
      },
    }),
    good_listing: defineSection({
      label: 'What a good listing contains',
      description: 'The checklist of what to include.',
      fields: {
        heading: text('Heading', 'What a good listing contains', { max: 80 }),
        intro: textarea(
          'Intro text',
          'The more complete your submit business listing form is, the easier it is for customers to trust and contact you.',
          { max: 400 },
        ),
        items: list('Checklist', {
          noun: 'item',
          max: 16,
          item: { text: text('Item', '', { max: 160 }) },
          default: [
            { text: 'A unique description written for customers, not copied from your website' },
            {
              text: 'Your business name, address and phone number, exactly as they appear elsewhere',
            },
            { text: 'Your website and a contact email' },
            { text: 'The category that best matches what you do' },
            { text: 'Your city and location' },
            { text: 'The services you offer' },
            { text: 'Clear photos, such as a logo and your premises or work' },
            { text: 'Opening hours' },
          ],
        }),
      },
    }),
    review: defineSection({
      label: 'How review works',
      fields: {
        heading: text('Heading', 'How review works', { max: 80 }),
        body: textarea(
          'Text',
          'Every listing is reviewed before it goes live. You can edit your listing afterwards, but its published status is decided by our team, not by the owner. If the business already appears in the directory, claim it instead of adding a duplicate.',
          { max: 1000 },
        ),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Claim your business
// ---------------------------------------------------------------------------

export const CLAIM_BUSINESS_PAGE = definePage({
  label: 'Claim your business',
  path: '/claim-business',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Free ownership claim', { max: 60 }),
        ...headingFields('Claim your', 'business listing', '', 'Headline'),
        intro: textarea(
          'Intro text',
          'To claim a business listing means asking to take over management of a listing that already exists for your business. Once verified, you can update its details, photos and opening hours and reply to reviews. Claiming is free.',
          { max: 800 },
        ),
      },
    }),
    find: defineSection({
      label: 'Find your business search',
      description: 'The search box that finds a listing to claim, and the note under it.',
      fields: {
        heading: text('Heading', 'Find your business', { max: 80 }),
        placeholder: text('Search box placeholder', 'Business name', { max: 60 }),
        button: text('Search button', 'Claim Listing', { max: 30 }),
        note: text(
          'Note under the search box',
          "Or browse the [business directory](/business-directory). Can't find it? [Add your business](/add-business) instead.",
          { max: 300, hint: MARKDOWN_HINT, markdown: 'inline' },
        ),
      },
    }),
    steps: defineSection({
      label: 'How claiming works',
      description: 'The numbered steps.',
      fields: {
        heading: text('Heading', 'How claiming works', { max: 80 }),
        step_label: text('Step label', 'Step', {
          max: 20,
          hint: 'Shown with the step number, e.g. "Step 1".',
        }),
        items: list('Steps', {
          noun: 'step',
          max: 8,
          item: titleBody(80, 500),
          default: [
            {
              title: 'Find your business',
              body: 'Search for it by name below, or browse the business directory by category or city.',
            },
            {
              title: 'Open the listing',
              body: 'On the listing page, use the claim link ("Own this business? Claim it for free"). Listings that are already verified do not show it.',
            },
            {
              title: 'Sign in and submit your claim',
              body: 'Sign in or create an account, then tell us your role, a phone number we can reach you on, and optionally a link to proof such as your website or a business profile that names you.',
            },
            {
              title: 'We verify, then hand over control',
              body: 'Our team checks every claim before ownership is handed over, usually within a couple of days. Once approved, the account you used manages the listing.',
            },
          ],
        }),
      },
    }),
    cta: defineSection({
      label: 'Call to action',
      description: 'The card at the bottom of the page.',
      fields: {
        heading: text('Heading', 'Ready to take control?', { max: 80 }),
        text: textarea(
          'Text',
          'Search for your business to open its listing and start your claim.',
          { max: 300 },
        ),
        button: link('Button', { label: 'Browse businesses', href: '/business-directory' }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Featured businesses
// ---------------------------------------------------------------------------

export const FEATURED_BUSINESSES_PAGE = definePage({
  label: 'Featured businesses',
  path: '/featured-businesses',
  sections: {
    hero: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Promoted listings', { max: 60 }),
        ...headingFields('', 'Featured', 'businesses', 'Headline'),
        intro: textarea(
          'Intro text',
          'A featured business listing is a directory listing that has been given extra visibility. Featured businesses are shown first in the business directory, ahead of other listings, so customers see them before they scroll. Featuring changes where a listing appears, not how it is reviewed: every listing is checked before it goes live.',
          { max: 800 },
        ),
        stat_label: text('Stat label', 'Featured listings', {
          max: 40,
          hint: 'The figure is the number of featured listings; hidden when there are none.',
        }),
        primary: link('Main button', { label: 'Get featured', href: '/pricing' }),
        secondary: link('Second button', {
          label: 'Browse businesses',
          href: '/business-directory',
        }),
      },
    }),
    listings: defineSection({
      label: 'Featured listings',
      description: 'Heading over the listings, and the message shown when none are featured.',
      hideable: false,
      fields: {
        heading: text('Heading', 'Featured business listings', { max: 80 }),
        empty_title: text('No listings: title', 'No featured businesses yet', { max: 80 }),
        empty_body: textarea(
          'No listings: text',
          'No listing is featured at the moment. Browse the full directory, or find out how to get your business featured.',
          { max: 400 },
        ),
        empty_button: link('No listings: button', {
          label: 'Browse businesses',
          href: '/business-directory',
        }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Legal pages
// ---------------------------------------------------------------------------

const clauseItem = {
  heading: text('Heading', '', { max: 120 }),
  body: textarea('Text', '', {
    max: 5000,
    hint: `${PARAGRAPHS_HINT} ${MARKDOWN_HINT}`,
    markdown: 'inline',
  }),
};

export const PRIVACY_PAGE = definePage({
  label: 'Privacy policy',
  path: '/privacy',
  sections: {
    header: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Legal & policies', { max: 60 }),
        title: text('Title', 'Privacy policy', { max: 80, hint: 'The page H1 and breadcrumb.' }),
        updated: text('Last updated line', 'Last updated 29 September 2026', {
          max: 80,
          hint: 'Change the date whenever the policy changes.',
        }),
        intro: textarea(
          'Intro text',
          'This policy explains what information {brand} collects when you browse the directory, create an account, list a business or contact us, and what we do with it.',
          { max: 800 },
        ),
      },
    }),
    policy: defineSection({
      label: 'Policy sections',
      description:
        'Each section of the policy. Write {contact} where the reader should be told how to reach you: it becomes "email <address> or use the contact page" (or "use the contact page" when no email is set in Settings).',
      hideable: false,
      fields: {
        clauses: list('Sections', {
          noun: 'section',
          max: 30,
          item: clauseItem,
          default: [
            {
              heading: 'What we collect',
              body: 'Account details: your email address and password when you register. Passwords are handled by our authentication provider and are never visible to us.\n\nGoogle sign-in: if you continue with Google, Google shares your name, email address and profile picture with us. We never receive your Google password or access to anything else in your Google account.\n\nBusiness listings: the details you submit for a business, such as its name, address, phone number, opening hours, photos and website. Once approved, these are shown publicly.\n\nReviews, reports and claims: what you write, and the name you choose to show with a review.\n\nMessages: what you send through the contact form or newsletter sign-up, including your name and email address.',
            },
            {
              heading: 'How we use it',
              body: 'To run the directory: publishing listings and reviews, letting owners manage their own listings, and moderating submissions before they go live.\n\nTo reply to your messages and, if you asked for it, send you updates. We do not sell your personal information.',
            },
            {
              heading: 'Cookies',
              body: 'We use cookies that are needed to keep you signed in. We do not use advertising cookies.',
            },
            {
              heading: 'Where it is stored',
              body: 'Data is stored with our hosting and database providers, who process it only to provide their service to us.',
            },
            {
              heading: 'Your choices',
              body: 'You can edit your listings from your dashboard at any time. To have your account, a listing or a review corrected or deleted, {contact}.',
            },
            {
              heading: 'Changes',
              body: 'If this policy changes, the new version will be posted here with a new date at the top.',
            },
          ],
        }),
      },
    }),
  },
});

export const TERMS_PAGE = definePage({
  label: 'Terms of use',
  path: '/terms',
  sections: {
    header: defineSection({
      label: 'Top of the page',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Legal & policies', { max: 60 }),
        title: text('Title', 'Terms of use', { max: 80, hint: 'The page H1 and breadcrumb.' }),
        updated: text('Last updated line', 'Last updated 29 September 2026', {
          max: 80,
          hint: 'Change the date whenever the terms change.',
        }),
        intro: textarea(
          'Intro text',
          'By using {brand} you agree to these terms. If you do not agree, please do not use the site.',
          { max: 800 },
        ),
      },
    }),
    terms: defineSection({
      label: 'Terms sections',
      description: 'Each section of the terms.',
      hideable: false,
      fields: {
        clauses: list('Sections', {
          noun: 'section',
          max: 30,
          item: clauseItem,
          default: [
            {
              heading: 'Using the directory',
              body: '{brand} lists local businesses to help people find and contact them. Details are provided by business owners and checked before publication, but they can change, so confirm prices, hours and availability with the business before you rely on them.\n\nWe are not a party to any agreement between you and a business listed here, and are not responsible for the goods or services they provide.',
            },
            {
              heading: 'Listing a business',
              body: 'Only list a business you own or are authorised to represent, and keep its details accurate. Every listing is reviewed before it is published, and we may edit, decline or remove a listing that is inaccurate, misleading, duplicated or breaks the law.',
            },
            {
              heading: 'Reviews',
              body: 'Reviews must describe a real experience. Do not post fake, paid-for, abusive or off-topic reviews, or reviews of your own business or a competitor. We may remove reviews that break these rules.',
            },
            {
              heading: 'Your content',
              body: 'You keep ownership of what you submit. By submitting it, you allow us to display it on the site and use it to promote the directory.',
            },
            {
              heading: 'Accounts',
              body: 'Keep your login details secure. We may suspend accounts used to spam, impersonate others or misuse the site.',
            },
            {
              heading: 'Changes',
              body: 'We may update these terms. The new version will be posted here with a new date at the top, and continuing to use the site means you accept it.',
            },
          ],
        }),
      },
    }),
  },
});

export const COMPANY_PAGES = {
  about: ABOUT_PAGE,
  contact: CONTACT_PAGE,
  pricing: PRICING_PAGE,
  add_business: ADD_BUSINESS_PAGE,
  claim_business: CLAIM_BUSINESS_PAGE,
  featured_businesses: FEATURED_BUSINESSES_PAGE,
  privacy: PRIVACY_PAGE,
  terms: TERMS_PAGE,
} satisfies Record<string, PageSpec>;
