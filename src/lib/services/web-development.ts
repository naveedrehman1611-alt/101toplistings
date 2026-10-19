import type { ServicePage } from '@/lib/service-pages';

const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const SPEED_TEST = { label: 'Website Speed Test', href: '/free-tools/website-speed-test' };
const MOBILE_TEST = { label: 'Mobile-Friendly Test', href: '/free-tools/mobile-friendly-test' };
const SCHEMA_GENERATOR = {
  label: 'Schema Markup Generator',
  href: '/free-tools/schema-markup-generator',
};

/**
 * Web development pages: the /web-development-services landing page first,
 * then the pages under it. They form the "web" column of the header's Services
 * menu and the "web" section of the /seo-services hub.
 */
export const WEB_DEVELOPMENT_PAGES: ServicePage[] = [
  {
    slug: 'web-development',
    path: '/web-development-services',
    name: 'Web development',
    title: 'Web Development Services | Fast, SEO-Ready Websites',
    description:
      'Custom websites built in React, Next.js and WordPress by an SEO agency: fast, mobile-friendly and SEO-ready from launch, plus ecommerce, redesigns and care.',
    h1: 'Web development services',
    intro:
      'Web development is the work of planning and building a website that loads quickly, works on every device and is easy for search engines to understand. As an SEO agency that also builds sites, we develop custom websites in React, Next.js and WordPress with technical SEO, structure and tracking set up from day one, so the build and the SEO come as one package rather than two projects that have to be reconciled later.',
    icon: 'data_object',
    category: 'web',
    hub: 'web',
    tag: 'SEO-Ready Builds',
    includes: [
      {
        title: 'Custom website builds',
        body: 'We build business websites in React, Next.js or WordPress, choosing the platform that fits your content, budget and the team who will run it. Designs start from your brand and goals rather than a stock theme with your logo dropped in.',
      },
      {
        title: 'SEO-ready from day one',
        body: 'Clean URLs, heading structure, meta tags, sitemaps, canonical tags and structured data are part of the build, not a fix after launch. Our SEO team reviews each template before go-live, so pages are ready to be crawled and indexed from the first day.',
      },
      {
        title: 'Ecommerce websites',
        body: 'Online shops on WooCommerce, Shopify or a headless setup, with clear product pages, a simple checkout and reliable payments. Product and category templates are planned around how customers search for what you sell.',
      },
      {
        title: 'Website redesigns',
        body: 'A redesign can lift enquiries, but it can also lose rankings if old URLs disappear. We map every existing page, plan redirects and compare search data after launch, so the new site keeps what the old one earned.',
      },
      {
        title: 'Speed and Core Web Vitals',
        body: 'Images, fonts, scripts and hosting are set up for fast loading on mobile networks, not just a fast office connection. We test real templates against Core Web Vitals before launch and fix problems while they are still cheap to change.',
      },
      {
        title: 'Maintenance and support',
        body: 'After launch we can handle updates, backups, security patches and small content changes, and keep an eye on search data. If something breaks after a plugin or framework update, you have one team to call for both the site and its SEO.',
      },
    ],
    steps: [
      {
        title: 'Discovery and scope',
        body: 'We learn what the site needs to do, who it is for and what you have today, then agree the pages, features and platform. You receive a written scope and quote before any work starts.',
      },
      {
        title: 'Structure and design',
        body: 'We plan the sitemap, page templates and content around real search demand, then design key pages for you to review. Feedback happens at this stage, while changes are quick to make.',
      },
      {
        title: 'Build and test',
        body: 'We develop the site on a staging copy, add content, forms and tracking, and test speed, mobile layout, accessibility basics and SEO settings before anything goes live.',
      },
      {
        title: 'Launch and support',
        body: 'We launch with redirects, sitemaps and Search Console in place, then check indexing and performance in the weeks after. Ongoing maintenance is available if you want it.',
      },
    ],
    faq: [
      {
        q: 'How much does a website cost?',
        a: 'It depends on scope: the number of pages and templates, features such as booking or ecommerce, content and integrations all change the price. We do not publish fixed packages, because they rarely match real projects. After a short call we send a written quote that sets out what is and is not included.',
      },
      {
        q: 'How long does it take to build a website?',
        a: 'A simple brochure site takes far less time than a custom shop or web app. The biggest factors are the number of templates and integrations, and how quickly content and feedback arrive. We agree a realistic timeline in the scope, so you know the milestones from the start.',
      },
      {
        q: 'Should I choose WordPress or Next.js?',
        a: 'WordPress suits teams who want to edit content in a familiar dashboard and use a wide choice of plugins. Next.js and React suit sites that need top performance, custom features or app-like behaviour, often paired with a headless CMS for editing. We recommend one based on your needs, not on what we prefer to build.',
      },
      {
        q: 'What does an SEO-ready website mean?',
        a: 'It means the technical foundations search engines rely on are built in: crawlable pages, sensible URLs, correct headings, meta tags, sitemaps, structured data and fast loading. It does not guarantee rankings, which also depend on content, links and competition, but it means you are not paying to fix the site later.',
      },
      {
        q: 'Can you redesign my site without losing rankings?',
        a: 'We reduce the risk by keeping or redirecting every URL that has traffic or links, carrying over content that ranks and checking search data after launch. Some movement is normal for a few weeks after any redesign, and we monitor it closely so real problems are fixed quickly.',
      },
    ],
    ctaLabel: 'Get a Website Quote',
    ctaHref: '/contact?subject=web%20development&service=web-development',
    related: ['wordpress-development', 'nextjs-react-development', 'ecommerce-website-development'],
    guides: [SEO_GUIDES, SPEED_TEST, MOBILE_TEST],
  },
  {
    slug: 'wordpress-development',
    path: '/web-development-services/wordpress-development',
    name: 'WordPress development',
    title: 'WordPress Development Services | Custom, Fast Sites',
    description:
      'Custom WordPress development: lightweight themes, block editor layouts, few plugins and SEO set up from the start, so your site stays fast and easy to edit.',
    h1: 'WordPress development services',
    intro:
      'WordPress development is building or improving a website on WordPress, the content management system that lets your team edit pages and posts without code. We build custom, lightweight WordPress sites with a lean theme, a short list of reliable plugins and SEO configured from the start, so the site stays fast and easy to manage as it grows.',
    icon: 'grid_view',
    category: 'web',
    hub: 'web',
    tag: 'WordPress',
    includes: [
      {
        title: 'Custom theme development',
        body: 'We build a lightweight theme around your design instead of loading a heavy multipurpose theme full of unused features. Less code means faster pages, fewer conflicts and simpler updates.',
      },
      {
        title: 'Block editor layouts',
        body: 'Reusable blocks and patterns let your team build new pages from approved sections without breaking the design. Editors get the flexibility they need, and the site keeps a consistent look and heading structure.',
      },
      {
        title: 'Plugin selection and setup',
        body: 'We choose a short list of well-maintained plugins for forms, SEO, caching and security, and build small features in code where a plugin would be overkill. Every plugin we add is documented with the reason it is there.',
      },
      {
        title: 'SEO configuration',
        body: 'Permalinks, titles, meta descriptions, sitemaps, breadcrumbs and schema are set up before launch, and archive pages that add no value are kept out of the index. Each build goes through the same checks we use for WordPress SEO work.',
      },
      {
        title: 'Speed and hosting',
        body: 'We recommend hosting that fits your traffic, then set up caching, image compression and script loading so pages load quickly on mobile. Core Web Vitals are tested on real templates before the site goes live.',
      },
      {
        title: 'Migrations, updates and care',
        body: 'We move sites to WordPress from other platforms, or between hosts, with every URL mapped and redirected. After launch we can handle core and plugin updates, backups and security checks, so the site does not drift out of date.',
      },
    ],
    steps: [
      {
        title: 'Plan the site',
        body: 'We agree the pages, content types and features, and decide what belongs in the theme and what genuinely needs a plugin.',
      },
      {
        title: 'Design and build',
        body: 'We design the key templates, then build the theme and blocks on a staging site where you can review progress and try editing yourself.',
      },
      {
        title: 'Content, SEO and testing',
        body: 'Content is added or migrated, SEO settings and redirects are configured, and we test speed, forms, mobile layout and the editing experience.',
      },
      {
        title: 'Launch and handover',
        body: 'We launch, submit sitemaps and check indexing, then walk your team through editing. Ongoing updates and support are available if you want them.',
      },
    ],
    faq: [
      {
        q: 'How much does a WordPress website cost?',
        a: 'It depends on the number of templates, custom features, content migration and integrations such as booking or CRM tools. A lean custom theme costs more up front than a ready-made one, but is usually easier to run and change. We quote after a short call about what you need.',
      },
      {
        q: 'Is WordPress still a good choice for a business website?',
        a: 'For many businesses, yes. It is widely supported, easy for editors to learn and flexible enough for most marketing sites. It is less suited to sites that need heavy custom functionality or app-like interfaces, where Next.js may fit better, and we will say so if that is the case.',
      },
      {
        q: 'Can I edit the site myself after launch?',
        a: 'Yes. We build with the block editor and reusable patterns, so your team can update text, images and pages without a developer. A short walkthrough is part of the handover, and layouts are set up so it is hard to break the design by accident.',
      },
      {
        q: 'Do you use page builders like Elementor?',
        a: 'We usually build with the native block editor and a custom theme, because it produces less code and relies on fewer plugins. If your team already depends on a page builder, we can work with it and keep its output as lean as possible.',
      },
      {
        q: 'Can you fix or speed up my existing WordPress site?',
        a: 'Often, yes. We review the theme, plugins, hosting and database to find what is slowing the site down or causing errors, then fix the biggest problems first. Sometimes a rebuild is better value than repairs, and if so we explain why before you decide.',
      },
    ],
    ctaLabel: 'Get a WordPress Quote',
    ctaHref: '/contact?subject=web%20development&service=wordpress-development',
    related: ['web-development', 'wordpress-seo', 'technical-seo'],
    guides: [SEO_GUIDES, SPEED_TEST, SCHEMA_GENERATOR],
  },
  {
    slug: 'nextjs-react-development',
    path: '/web-development-services/nextjs-react-development',
    name: 'Next.js & React development',
    title: 'Next.js Development Services | Fast React Websites',
    description:
      'Next.js and React development for fast, custom websites and web apps, with server rendering, a headless CMS and SEO built into every page template from day one.',
    h1: 'Next.js and React development services',
    intro:
      'Next.js is a React framework for building websites that render pages on the server, so they load quickly and search engines can read the full content. We use Next.js and React to build fast marketing sites, headless CMS setups and custom web apps, with metadata, structured data and Core Web Vitals handled in every template rather than added afterwards.',
    icon: 'speed',
    category: 'web',
    hub: 'web',
    tag: 'High Performance',
    includes: [
      {
        title: 'Next.js websites',
        body: 'Marketing and content sites built with server rendering or static generation, so each page arrives as complete HTML. Visitors get fast first loads, and search engines get content they can index without waiting for JavaScript.',
      },
      {
        title: 'Headless CMS setup',
        body: 'We connect Next.js to a headless CMS, so your team edits content in a familiar interface while the front end stays fast and custom. The CMS is chosen to suit how your editors work and the content types you publish.',
      },
      {
        title: 'React web apps and features',
        body: 'Dashboards, portals, calculators, booking flows and other interactive features built as React components. Where part of an app sits behind a login, we keep the public pages crawlable and the private ones out of the index.',
      },
      {
        title: 'Technical SEO in the code',
        body: 'Titles, meta descriptions, canonical tags, sitemaps, robots rules and structured data are generated from your content, so every new page follows the same rules. We also make sure links are real links and that important content is not hidden behind client-side rendering.',
      },
      {
        title: 'Performance and Core Web Vitals',
        body: 'Image optimisation, font loading, code splitting and caching are set up from the start, and real pages are tested against Core Web Vitals. We keep third-party scripts in check, since tags and widgets are a common cause of slow sites.',
      },
      {
        title: 'Migration from other platforms',
        body: 'We move sites from WordPress, Wix or older frameworks to Next.js with every URL mapped, redirected and tested. Search data is checked after launch, so any drop in visibility is spotted and dealt with quickly.',
      },
    ],
    steps: [
      {
        title: 'Scope and architecture',
        body: 'We agree the pages, features and content model, and choose the rendering approach and CMS that fit how often your content changes.',
      },
      {
        title: 'Design and components',
        body: 'We design the key pages and build a shared set of React components, so new pages are quick to assemble and stay consistent.',
      },
      {
        title: 'Build, integrate and test',
        body: 'We develop on a preview environment, connect the CMS and other services, and test speed, accessibility basics, metadata and structured data on every template.',
      },
      {
        title: 'Launch and iterate',
        body: 'We launch with redirects and sitemaps in place, monitor indexing and performance, and keep improving the site if you want ongoing support.',
      },
    ],
    faq: [
      {
        q: 'Is Next.js good for SEO?',
        a: 'Yes, when it is used properly. Server rendering and static generation mean pages arrive as full HTML that search engines can read straight away. Results still depend on content, metadata and internal links, so we treat SEO as part of the build rather than relying on the framework alone.',
      },
      {
        q: 'Should I choose Next.js or WordPress?',
        a: 'Next.js suits sites that need strong performance, custom features or a design that does not fit a theme. WordPress suits teams that want an all-in-one editor and a large choice of plugins. We recommend the option that fits your content, budget and team, not the one that is most fashionable.',
      },
      {
        q: 'Can my team edit content without a developer?',
        a: 'Yes. We connect the site to a headless CMS, so editors can add pages, posts and images through a dashboard. Page sections are set up as reusable blocks in the CMS, so new content keeps the design and the SEO structure.',
      },
      {
        q: 'How much does a Next.js website cost?',
        a: 'It depends on the number of templates, the CMS, integrations and any custom app features. A custom Next.js build often costs more up front than a theme-based site, but it can be easier to extend as you grow. We quote after a short call and a look at what you need.',
      },
      {
        q: 'Where is a Next.js site hosted?',
        a: 'Next.js sites are usually hosted on a platform built for it, such as Vercel or Netlify, or on your own cloud servers. We recommend hosting based on your traffic, budget and audience, and set up deployments so updates go live safely and can be rolled back.',
      },
    ],
    ctaLabel: 'Get a Next.js Quote',
    ctaHref: '/contact?subject=web%20development&service=nextjs-react-development',
    related: ['web-development', 'technical-seo', 'wordpress-development'],
    guides: [SEO_GUIDES, SPEED_TEST, MOBILE_TEST],
  },
  {
    slug: 'ecommerce-website-development',
    path: '/web-development-services/ecommerce-website-development',
    name: 'Ecommerce website development',
    title: 'Ecommerce Website Development | Shops Built to Sell',
    description:
      'Ecommerce website development on WooCommerce, Shopify or headless: product pages, checkout, secure payments and product schema set up so your store can rank.',
    h1: 'Ecommerce website development services',
    intro:
      'Ecommerce website development is building an online shop where customers can find products, compare them and pay securely. We build stores on WooCommerce, Shopify or a headless setup, with product pages, category structure, checkout and product schema planned around how people search, so the shop is ready to be found as well as used.',
    icon: 'storefront',
    category: 'web',
    hub: 'web',
    tag: 'Online Stores',
    includes: [
      {
        title: 'Platform choice and setup',
        body: 'WooCommerce, Shopify and headless builds each suit different catalogues, budgets and teams. We recommend one based on your products, how you fulfil orders and who will run the shop day to day.',
      },
      {
        title: 'Product and category pages',
        body: 'Product templates show clear images, prices, variants, stock status and the details buyers need to decide. Category pages get their own intro copy and sensible filters, since they often rank for the broadest product searches.',
      },
      {
        title: 'Checkout and payments',
        body: 'A short, clear checkout with guest buying, trusted payment providers and accurate shipping and tax rules. We test the full order flow on desktop and mobile, including emails, refunds and failed payments.',
      },
      {
        title: 'Product schema and technical SEO',
        body: 'Product, offer and review markup reflects what is on the page, and canonical tags handle variants and filtered URLs so duplicates do not split rankings. Sitemaps and internal links are set up so new products are found quickly.',
      },
      {
        title: 'Speed on mobile',
        body: 'Product images, scripts and apps are kept lean, because slow pages cost sales as well as rankings. We test key templates against Core Web Vitals and remove or replace apps that add weight without earning their place.',
      },
      {
        title: 'Integrations and migration',
        body: 'We connect stock, shipping, accounting and email tools, and move products, customers and orders from your old platform. Every old product and category URL is redirected, so existing rankings and links carry over.',
      },
    ],
    steps: [
      {
        title: 'Plan the store',
        body: 'We review your catalogue, how you sell today and what customers search for, then agree the platform, features and category structure.',
      },
      {
        title: 'Design the buying journey',
        body: 'We design the home, category, product, basket and checkout pages, focusing on clarity and trust rather than decoration.',
      },
      {
        title: 'Build, load and test',
        body: 'We build on a staging store, import products, connect payments and integrations, and test orders, emails, speed and SEO settings end to end.',
      },
      {
        title: 'Launch and improve',
        body: 'We launch with redirects and sitemaps in place, watch orders, errors and search data closely, and refine pages based on how customers use the shop.',
      },
    ],
    faq: [
      {
        q: 'How much does an ecommerce website cost?',
        a: 'It depends on the platform, the size of your catalogue, custom features, integrations and whether products are being migrated. Platform, app and payment fees are separate from the build. We quote after a short call about your products and how you sell.',
      },
      {
        q: 'Should I use Shopify or WooCommerce?',
        a: 'Shopify is hosted for you and simple to run, with monthly fees and some fixed rules such as its URL structure. WooCommerce runs on WordPress, gives you more control and suits shops that publish a lot of content, but it needs hosting and regular updates. We weigh both against your needs before recommending one.',
      },
      {
        q: 'What is headless ecommerce?',
        a: 'Headless means the shop’s back end, such as Shopify, handles products and orders while a separate front end, often built with Next.js, displays the store. It allows a faster, fully custom design but costs more to build and maintain, so it tends to suit larger or more demanding shops.',
      },
      {
        q: 'Will my online store be set up for SEO?',
        a: 'Yes. Category structure, product templates, metadata, product schema, canonical tags and sitemaps are part of the build. That gives the store a sound foundation, but rankings also depend on content, links and competition, so we can continue with ecommerce SEO after launch if you want.',
      },
      {
        q: 'Can you move my existing shop to a new platform?',
        a: 'Yes. We migrate products, customers and order history where the platforms allow it, and redirect every old URL to its new equivalent. Redirects are tested before launch and search data is watched afterwards, so rankings and links built up over time are not lost.',
      },
    ],
    ctaLabel: 'Get an Ecommerce Quote',
    ctaHref: '/contact?subject=web%20development&service=ecommerce-website-development',
    related: ['web-development', 'ecommerce-seo', 'shopify-seo'],
    guides: [SEO_GUIDES, SCHEMA_GENERATOR, SPEED_TEST],
  },
];
