import type { ServicePage } from '@/lib/service-pages';

/**
 * /website-development: a standalone page like /digital-marketing, but not an
 * SEO service, so it sits outside the /seo-services hub sections (hub: null).
 * It has its own "Web Development" column in the header's Services menu.
 */
export const WEBSITE_DEVELOPMENT_PAGE: ServicePage = {
  slug: 'website-development',
  path: '/website-development',
  name: 'Website development',
  title: 'Website Development Services | Fast, SEO-Ready Sites',
  description:
    'Custom business websites, WordPress builds, online stores and landing pages, built to load fast, work well on phones and be ready for search from day one.',
  h1: 'Website development services',
  intro:
    'Website development is the work of planning, designing and building the site your business runs on, from a handful of service pages to a full online store. As an SEO agency, we build websites that load quickly, work well on phones and are structured for search from the start, so you are not paying to rebuild them once marketing begins.',
  icon: 'data_object',
  category: 'web',
  hub: null,
  tag: 'Design & Build',
  includes: [
    {
      title: 'Custom business websites',
      body: 'Sites planned around your services, locations and customers, with layouts designed for your brand rather than a stock theme with a new logo. Every page has a clear job, such as explaining a service or prompting a call, and the structure leaves room to add pages as you grow.',
    },
    {
      title: 'WordPress and CMS builds',
      body: 'Built on WordPress or another content management system that suits your team, so you can edit text, add pages and publish posts without calling a developer. We keep plugins to the ones the site genuinely needs, which makes updates safer and keeps pages light.',
    },
    {
      title: 'E-commerce stores',
      body: 'Online shops on platforms such as WooCommerce or Shopify, with clear category and product pages, sensible filters and a checkout that works on phones. Products, shipping and payment options are planned before design starts, so the store fits how you actually sell.',
    },
    {
      title: 'Landing pages',
      body: 'Focused pages for a campaign, service or offer, with one clear call to action and a form or phone link that is tracked. They share your main site’s templates, so they load quickly, stay on brand and can be updated without starting from scratch each time.',
    },
    {
      title: 'SEO-ready, fast builds',
      body: 'Clean URLs, logical headings, editable titles and meta descriptions, an XML sitemap and schema markup are in place before launch. We test speed and Core Web Vitals on real templates and fix heavy images, scripts and fonts before the site goes live.',
    },
    {
      title: 'Maintenance and support',
      body: 'After launch we can keep the platform, themes and plugins updated, check backups and security, and make content changes when you need them. Problems are fixed and explained in plain language, so the site does not quietly fall out of date or break after an update.',
    },
  ],
  steps: [
    {
      title: 'Discovery and plan',
      body: 'We learn what you sell, who you sell to and what the site needs to do, and review your current site, analytics and competitors. You approve a page list, a feature list and a timeline before design starts.',
    },
    {
      title: 'Design and content',
      body: 'We design the key page templates for mobile and desktop and agree the copy, images and calls to action for each page. When a site is being replaced, every old URL is mapped to its new home.',
    },
    {
      title: 'Build and test',
      body: 'We build on a staging copy, set up forms, analytics and the SEO basics, then test across browsers and screen sizes. Speed, accessibility and broken links are checked before you sign off.',
    },
    {
      title: 'Launch and support',
      body: 'We launch, submit the sitemap in Search Console and watch for errors in the first weeks. Maintenance and improvements then continue on whatever basis suits you.',
    },
  ],
  faq: [
    {
      q: 'What does website development include?',
      a: 'Planning the pages and features, designing the layouts, building the site on a platform such as WordPress or Shopify, adding your content and testing everything before launch. We also set up forms, analytics and the SEO basics, so the site can be found and measured from the first day.',
    },
    {
      q: 'How long does it take to build a website?',
      a: 'It depends on the number of pages, the features needed and how quickly content and feedback are ready. A small business site is quicker than an online store with many products or custom integrations. We agree a timeline after the planning stage and tell you early if anything is likely to move it.',
    },
    {
      q: 'How much does a website cost?',
      a: 'Cost depends on scope: how many page templates are needed, whether you need e-commerce or bookings, integrations with other tools, and who writes the content. We quote after a short discovery conversation and list exactly what is included, rather than selling a fixed package that may not fit.',
    },
    {
      q: 'Which platform will you build on?',
      a: 'The one that fits how you work. WordPress suits most service businesses that publish content regularly, while WooCommerce or Shopify suit online stores. If your current platform is sound, we can improve the site you already have instead of starting again.',
    },
    {
      q: 'Will a new website hurt my Google rankings?',
      a: 'A redesign can lose traffic when pages that earn visits are removed or rewritten without care. We keep the content that performs, build the new site with search-friendly structure from the start and check Search Console after launch, so problems are spotted early.',
    },
    {
      q: 'Can you look after the website after launch?',
      a: 'Yes. We can handle updates, backups, security checks and content changes on a schedule that suits you.',
    },
  ],
  ctaLabel: 'Discuss Your Website',
  ctaHref: '/contact?subject=Website%20development',
  quoteSubject: 'Website development',
  related: ['technical-seo', 'wordpress-seo', 'seo-migration'],
  guides: [
    { label: 'SEO guides and how-tos', href: '/blog/seo' },
    { label: 'Website Speed Test', href: '/free-tools/website-speed-test' },
    { label: 'Mobile-Friendly Test', href: '/free-tools/mobile-friendly-test' },
    { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
  ],
};
