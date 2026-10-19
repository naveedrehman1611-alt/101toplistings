import { SERVICE_PAGES, type ServicePage } from '@/lib/service-pages';
import { HUB_CATEGORIES } from '@/lib/services-hub';
import type { HubCategoryId } from '@/lib/service-pages';
import {
  definePage,
  defineSection,
  icon,
  link,
  list,
  text,
  textarea,
  type PageSpec,
  type SectionValues,
} from '../schema';

/*
 * The SEO services hub, the SEO audit page and every service page. A service's
 * own icon stays in src/lib/service-pages.ts, since the header menu draws it too.
 */

// ---------------------------------------------------------------------------
// /seo-services hub
// ---------------------------------------------------------------------------

const QUOTE_HREF = '/contact?subject=seo%20services';

function hubDefault(id: HubCategoryId) {
  const c = HUB_CATEGORIES.find((h) => h.id === id);
  return { title: c?.title ?? '', icon: c?.icon ?? 'search' };
}

const groupTitle = (id: HubCategoryId, label: string) =>
  text(`${label} heading`, hubDefault(id).title, {
    max: 80,
    hint: 'Also shown as the small label above the heading on each service page in this group.',
  });

const groupIcon = (id: HubCategoryId, label: string) => icon(`${label} icon`, hubDefault(id).icon);

const SEO_SERVICES_PAGE = definePage({
  label: 'SEO services hub',
  path: '/seo-services',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top: label, headline, intro and the three figures.',
      hideable: false,
      fields: {
        eyebrow: text('Small label above the headline', 'Complete SEO Services', { max: 60 }),
        heading_start: text('Headline, start', 'Every', {
          max: 120,
          hint: 'The page H1 is: start, the green words, then the end. Any part may be blank. Until you save this section, a heading saved for this page in Admin → Pages & sections is shown instead; after that, this one wins.',
        }),
        heading_highlight: text('Headline, green words', 'Professional SEO Service', { max: 120 }),
        heading_end: text('Headline, end', 'Your Business Needs to Rank, Grow, and Get Found.', {
          max: 160,
        }),
        intro: textarea(
          'Intro text',
          '{brand} is an SEO agency and SEO company offering professional, affordable SEO services for small business and growing brands worldwide. We help you rank higher, earn more organic traffic and turn visits into leads.',
          {
            max: 600,
            hint: '{brand} becomes the brand name. Until you save this section, a heading saved for this page in Admin → Pages & sections is shown instead; after that, this one wins.',
          },
        ),
        stat_services: text('Figure 1 label (number of services)', 'SEO Services', {
          max: 40,
          hint: 'The number is counted from the service pages.',
        }),
        stat_industries: text('Figure 2 label (number of industries)', 'Industries Served', {
          max: 40,
          hint: 'The number is counted from the industry pages.',
        }),
        stat_audit_value: text('Figure 3 value', 'Free', { max: 12 }),
        stat_audit_label: text('Figure 3 label', 'SEO Audit', { max: 40 }),
      },
    }),
    groups: defineSection({
      label: 'Service groups',
      description:
        'The cards grouped by type of service. Each card shows the service name, its description and its badge (edited under “Service pages”).',
      fields: {
        core_title: groupTitle('core', 'Core group'),
        core_icon: groupIcon('core', 'Core group'),
        technical_title: groupTitle('technical', 'Technical group'),
        technical_icon: groupIcon('technical', 'Technical group'),
        links_title: groupTitle('links', 'Link building group'),
        links_icon: groupIcon('links', 'Link building group'),
        ai_title: groupTitle('ai', 'AI search group'),
        ai_icon: groupIcon('ai', 'AI search group'),
        platform_title: groupTitle('platform', 'Platform group'),
        platform_icon: groupIcon('platform', 'Platform group'),
        ecommerce_title: groupTitle('ecommerce', 'Ecommerce group'),
        ecommerce_icon: groupIcon('ecommerce', 'Ecommerce group'),
        specialty_title: groupTitle('specialty', 'Specialty group'),
        specialty_icon: groupIcon('specialty', 'Specialty group'),
        web_title: groupTitle('web', 'Web development group'),
        web_icon: groupIcon('web', 'Web development group'),
        count_one: text('Count label, one', 'Service', {
          max: 30,
          hint: 'The pill beside each heading, as in “1 Service”.',
        }),
        count_many: text('Count label, several', 'Services', {
          max: 30,
          hint: 'As in “6 Services”.',
        }),
        learn_more: text('Card link text', 'Learn more', { max: 30 }),
      },
    }),
    industries: defineSection({
      label: 'Industries',
      description: 'The compact tiles linking to each industry page.',
      fields: {
        heading: groupTitle('industry', 'Industries'),
        icon: groupIcon('industry', 'Industries'),
        count: text('Count label', 'Industries', {
          max: 30,
          hint: 'The pill beside the heading, as in “60 Industries”.',
        }),
      },
    }),
    cta: defineSection({
      label: 'Call to action band',
      description: 'The green band above the footer.',
      fields: {
        heading: text('Heading', 'Ready to rank your business higher?', { max: 120 }),
        body: text('Text', 'Get a free SEO audit and a plan you can actually read.', {
          max: 200,
        }),
        primary: link('Main button', { label: 'Get Free SEO Audit', href: '/seo-audit' }),
        primary_icon: icon('Main button icon', 'fact_check'),
        secondary: link('Second button', { label: 'Request a Quote', href: QUOTE_HREF }),
        secondary_icon: icon('Second button icon', 'mail'),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /seo-audit
// ---------------------------------------------------------------------------

const SEO_AUDIT_PAGE = definePage({
  label: 'SEO audit',
  path: '/seo-audit',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top: label, headline, intro, figures and buttons.',
      hideable: false,
      fields: {
        eyebrow: text('Small label above the headline', 'Website SEO Audit', { max: 60 }),
        heading_start: text('Headline, start', 'SEO', {
          max: 120,
          hint: 'The page H1 is: start, the green words, then the end. Any part may be blank.',
        }),
        heading_highlight: text('Headline, green words', 'audit', { max: 120 }),
        heading_end: text('Headline, end', '', { max: 160 }),
        intro: textarea(
          'Intro text',
          'A website SEO audit finds what is holding your site back in search: technical faults, weak pages, thin content, poor internal links and a lack of authority. Start with the free SEO audit tools below, or request a full audit from our team.',
          { max: 600 },
        ),
        stat_checks: text('Figure 1 label (number of quick checks)', 'Free Quick Checks', {
          max: 40,
        }),
        stat_areas: text('Figure 2 label (number of audit areas)', 'Audit Areas', { max: 40 }),
        primary: link(
          'Main button',
          { label: 'Run a quick check', href: '#quick-check' },
          '#quick-check jumps to the quick checks below.',
        ),
        primary_icon: icon('Main button icon', 'speed'),
        secondary: link(
          'Second button',
          { label: 'Request a full audit', href: '#full-audit' },
          '#full-audit jumps to the request form below.',
        ),
        secondary_icon: icon('Second button icon', 'mail'),
      },
    }),
    quick_check: defineSection({
      label: 'Quick checks',
      description:
        'The free tools that check one area each. The tools themselves come from Free tools.',
      fields: {
        heading: text('Heading', 'Run a quick check now', { max: 120 }),
        intro: textarea(
          'Intro text',
          'These free SEO audit tools run in your browser. Each one checks a single area, so they are a starting point rather than a complete audit.',
          { max: 600 },
        ),
      },
    }),
    covers: defineSection({
      label: 'What the audit covers',
      description: 'The cards listing each area a full audit looks at.',
      fields: {
        heading: text('Heading', 'What the full audit covers', { max: 120 }),
        cards: list('Audit area cards', {
          noun: 'card',
          max: 12,
          item: {
            icon: icon('Icon', 'fact_check'),
            title: text('Title', '', { max: 80 }),
            body: textarea('Text', '', { max: 400 }),
          },
          default: [
            {
              icon: 'build',
              title: 'Technical',
              body: 'Crawling, indexing, redirects, sitemaps, site speed, Core Web Vitals and mobile usability.',
            },
            {
              icon: 'fact_check',
              title: 'On-page',
              body: 'Titles, descriptions, headings, keyword targeting and structured data on your key pages.',
            },
            {
              icon: 'manage_search',
              title: 'Content',
              body: 'Whether pages match search intent, where content is thin or duplicated, and which topics are missing.',
            },
            {
              icon: 'lan',
              title: 'Internal linking',
              body: 'How pages link to each other, orphaned pages and the anchor text that points to important ones.',
            },
            {
              icon: 'public',
              title: 'Authority',
              body: 'Your backlink profile, brand mentions and citations compared with the sites you compete with.',
            },
          ],
        }),
      },
    }),
    form: defineSection({
      label: 'Audit request form',
      description: 'The form visitors send to ask for a full audit.',
      fields: {
        heading: text('Heading', 'Request a full website SEO audit', { max: 120 }),
        intro: textarea(
          'Intro text',
          'Tell us about your site and what you want from search. We will reply by email with the next step. After you send the form you will see a confirmation on our contact page.',
          { max: 600 },
        ),
        name_label: text('Name label', 'Your name', { max: 60 }),
        email_label: text('Email label', 'Email address', { max: 60 }),
        site_label: text('Website label', 'Website URL', { max: 60 }),
        site_placeholder: text('Website placeholder', 'https://example.com', { max: 80 }),
        message_label: text('Message label', 'What would you like us to look at?', { max: 120 }),
        submit: text('Send button', 'Request SEO audit', { max: 40 }),
        submit_icon: icon('Send button icon', 'arrow_forward'),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Service pages (/seo-services/<slug>, /digital-marketing and
// /web-development-services[/<slug>])
// ---------------------------------------------------------------------------

/** Steps for a service page that sets none of its own. */
const DEFAULT_STEPS = [
  {
    title: 'Free audit',
    body: 'Tell us about your business and website. We look at where you stand today and what is holding you back.',
  },
  {
    title: 'A plan you can read',
    body: 'You get a short, prioritised plan: what we will do, what it is for, and what you can expect.',
  },
  {
    title: 'Work and reporting',
    body: 'We do the work and report on what changed, so you can see what your budget is doing.',
  },
];

/** The site_content section name for a service: its slug, kept to the key's characters. */
export function serviceKey(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function serviceSection(p: ServicePage) {
  return defineSection({
    label: p.name,
    description: `${p.path}. The page name, address, menu placement and search snippet are fixed; the copy below is editable.`,
    hideable: false,
    fields: {
      h1: text('Page heading (H1)', p.h1, { max: 120 }),
      intro: textarea('Intro under the heading', p.intro, {
        max: 1200,
        hint: 'Answer what the service is in the first sentence.',
      }),
      tag: text('Badge', p.tag, {
        max: 40,
        hint: 'Shown on this service’s card on the SEO services hub and under “Related services”.',
      }),
      cta: link(
        'Main button',
        { label: p.ctaLabel, href: p.ctaHref },
        p.category === 'web'
          ? 'The second button opens a WhatsApp chat.'
          : 'When it links to /seo-audit, the second button offers a quote; otherwise it offers the free audit.',
      ),
      includes: list('What’s included cards', {
        noun: 'card',
        max: 12,
        item: {
          title: text('Title', '', { max: 100 }),
          body: textarea('Text', '', { max: 1000 }),
        },
        default: p.includes,
      }),
      steps: list('How it works steps', {
        noun: 'step',
        max: 8,
        hint: 'Leave empty to hide the “How it works” block on this page.',
        item: {
          title: text('Title', '', { max: 100 }),
          body: textarea('Text', '', { max: 800 }),
        },
        default: p.steps ?? DEFAULT_STEPS,
      }),
      faq: list('Frequently asked questions', {
        noun: 'question',
        max: 12,
        hint: 'Leave empty to hide the FAQ block on this page.',
        item: {
          q: text('Question', '', { max: 200 }),
          a: textarea('Answer', '', { max: 1500 }),
        },
        default: p.faq,
      }),
      guides: list('Guide and tool links', {
        noun: 'link',
        max: 8,
        hint: 'The pill links at the bottom. Matching directory categories are added before them automatically.',
        item: { link: link('Link', { label: '', href: '/' }) },
        default: p.guides.map((g) => ({ link: { label: g.label, href: g.href } })),
      }),
    },
  });
}

const SERVICE_PAGE = definePage({
  label: 'Service pages',
  path: '/seo-services/local-seo',
  sections: Object.fromEntries(SERVICE_PAGES.map((p) => [serviceKey(p.slug), serviceSection(p)])),
});

export type ServiceContent = SectionValues<ReturnType<typeof serviceSection>>;

const SERVICE_TEMPLATE_PAGE = definePage({
  label: 'Service pages: shared labels',
  path: '/seo-services/local-seo',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'Breadcrumb, figure labels and second button, on every service page.',
      hideable: false,
      fields: {
        crumb_home: text('Breadcrumb: home', 'Home', { max: 40 }),
        crumb_hub: text('Breadcrumb: SEO services hub', 'SEO services', { max: 60 }),
        crumb_marketing: text('Breadcrumb: digital marketing page', 'Digital marketing', {
          max: 60,
        }),
        crumb_web: text('Breadcrumb: web development page', 'Web development', { max: 60 }),
        stat_includes: text('Figure 1 label (number of included items)', 'Deliverables', {
          max: 40,
        }),
        stat_steps: text('Figure 2 label (number of steps)', 'Step process', { max: 40 }),
        stat_faq: text('Figure 3 label (number of questions)', 'FAQs answered', { max: 40 }),
        quote_button: text('Second button, quote', 'Request a quote', {
          max: 40,
          hint: 'Shown when the main button is the SEO audit. It opens the contact form with the service named.',
        }),
        audit_button: link(
          'Second button, audit',
          { label: 'Free SEO audit', href: '/seo-audit' },
          'Shown when the main button is not the SEO audit.',
        ),
        audit_icon: icon(
          'Audit button icon',
          'fact_check',
          'On whichever button leads to the SEO audit.',
        ),
        quote_icon: icon(
          'Quote button icon',
          'mail',
          'On whichever button asks for a quote or contact.',
        ),
        whatsapp_button: text('WhatsApp button', 'Chat on WhatsApp', {
          max: 40,
          hint: 'Shown on the web development pages, in the hero and the call to action band. Opens a WhatsApp chat with the service named.',
        }),
        whatsapp_message: text('WhatsApp message', "Hi, I'm interested in {service}.", {
          max: 200,
          hint: '{service} becomes the page’s service name.',
        }),
      },
    }),
    included: defineSection({
      label: 'What’s included',
      fields: {
        heading: text('Heading', "What's included", { max: 80 }),
        card_icon: icon(
          'Card icon',
          'check_circle',
          'Drawn on every card. The heading icon is the service’s own.',
        ),
        count_one: text('Count label, one', 'Deliverable', { max: 30 }),
        count_many: text('Count label, several', 'Deliverables', { max: 30 }),
      },
    }),
    steps: defineSection({
      label: 'How it works',
      fields: {
        heading: text('Heading', 'How it works', { max: 80 }),
        icon: icon('Heading icon', 'alt_route'),
        count_one: text('Count label, one', 'Step', { max: 30 }),
        count_many: text('Count label, several', 'Steps', { max: 30 }),
      },
    }),
    faq: defineSection({
      label: 'Frequently asked questions',
      fields: {
        heading: text('Heading', 'Frequently asked questions', { max: 80 }),
        icon: icon('Heading icon', 'fact_check'),
        count_one: text('Count label, one', 'Question', { max: 30 }),
        count_many: text('Count label, several', 'Questions', { max: 30 }),
      },
    }),
    related: defineSection({
      label: 'Related services',
      description:
        'Cards for sibling services. Also used for the service cards on /digital-marketing and /web-development-services.',
      fields: {
        heading: text('Heading', 'Related services', { max: 80 }),
        icon: icon('Heading icon', 'hub'),
        count_one: text('Count label, one', 'Service', { max: 30 }),
        count_many: text('Count label, several', 'Services', { max: 30 }),
        learn_more: text('Card link text', 'Learn more', { max: 30 }),
      },
    }),
    guides: defineSection({
      label: 'Guides and tools',
      fields: {
        heading: text('Heading', 'Guides and tools', { max: 80 }),
        heading_directory: text('Heading with directory links', 'Directory, guides and tools', {
          max: 80,
          hint: 'Used on industry pages that also link to matching directory categories.',
        }),
      },
    }),
    cta: defineSection({
      label: 'Call to action band',
      description: 'The green band above the footer.',
      fields: {
        heading: text('Heading', 'Talk to {brand}', {
          max: 120,
          hint: '{brand} becomes the brand name.',
        }),
        body: text('Text', 'Get a free SEO audit and a plan you can actually read.', {
          max: 200,
        }),
        primary: link('Main button', { label: 'Get Free SEO Audit', href: '/seo-audit' }),
        primary_icon: icon('Main button icon', 'fact_check'),
        secondary_label: text('Second button', 'Request a Quote', {
          max: 40,
          hint: 'Opens the contact form with the service named.',
        }),
        secondary_icon: icon('Second button icon', 'mail'),
      },
    }),
    web_cta: defineSection({
      label: 'Call to action band: web development',
      description:
        'The green band above the footer on the web development pages, in place of the one above. Its second button is the WhatsApp button from Hero.',
      fields: {
        heading: text('Heading', 'Ready to build a website that ranks?', { max: 120 }),
        body: text(
          'Text',
          'Tell us what you need and get a clear quote, or message us on WhatsApp.',
          { max: 200 },
        ),
        quote_label: text('Main button', 'Request a Quote', {
          max: 40,
          hint: 'Opens the contact form with the service named.',
        }),
        quote_icon: icon('Main button icon', 'mail'),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /digital-marketing (the rest of the page is its service page above)
// ---------------------------------------------------------------------------

const DIGITAL_MARKETING_PAGE = definePage({
  label: 'Digital marketing',
  path: '/digital-marketing',
  sections: {
    sub_services: defineSection({
      label: 'Our SEO services',
      description:
        'The block after “What’s included” listing the SEO service pages. The rest of this page is under “Service pages” → Digital marketing.',
      fields: {
        heading: text('Heading', 'Our SEO services', { max: 80 }),
        icon: icon('Heading icon', 'search'),
        count: text('Count label', 'Services', { max: 30, hint: 'As in “7 Services”.' }),
        intro: textarea(
          'Intro text',
          'Each part of digital marketing has its own page, so you can start with the one that fits your goal.',
          { max: 400 },
        ),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /web-development-services (the rest of the page is its service page above)
// ---------------------------------------------------------------------------

const WEB_DEVELOPMENT_PAGE = definePage({
  label: 'Web development',
  path: '/web-development-services',
  sections: {
    sub_services: defineSection({
      label: 'Our web development services',
      description:
        'The block after “What’s included” listing the web development pages. The rest of this page is under “Service pages” → Web development.',
      fields: {
        heading: text('Heading', 'Our web development services', { max: 80 }),
        icon: icon('Heading icon', 'data_object'),
        count: text('Count label', 'Services', { max: 30, hint: 'As in “3 Services”.' }),
        intro: textarea(
          'Intro text',
          'Each type of website has its own page, so you can start with the one that fits your project.',
          { max: 400 },
        ),
      },
    }),
    technologies: defineSection({
      label: 'Technologies',
      description: 'The block after the services, listing what we build with.',
      fields: {
        heading: text('Heading', 'Technologies we build with', { max: 80 }),
        icon: icon('Heading icon', 'build'),
        count: text('Count label', 'Technologies', { max: 30, hint: 'As in “8 Technologies”.' }),
        intro: textarea(
          'Intro text',
          'We pick the stack that suits your site, your team and your budget, not the other way round.',
          { max: 400 },
        ),
        items: list('Technologies', {
          noun: 'technology',
          max: 24,
          item: { name: text('Name', '', { max: 40 }) },
          default: [
            { name: 'React' },
            { name: 'Next.js' },
            { name: 'WordPress' },
            { name: 'WooCommerce' },
            { name: 'Shopify' },
            { name: 'Tailwind CSS' },
            { name: 'Supabase' },
            { name: 'Headless CMS' },
          ],
        }),
      },
    }),
  },
});

export const SERVICES_PAGES = {
  seo_services: SEO_SERVICES_PAGE,
  seo_audit: SEO_AUDIT_PAGE,
  service: SERVICE_PAGE,
  service_template: SERVICE_TEMPLATE_PAGE,
  digital_marketing: DIGITAL_MARKETING_PAGE,
  web_development: WEB_DEVELOPMENT_PAGE,
} satisfies Record<string, PageSpec>;
