import type { ServicePage } from '@/lib/service-pages';

const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };

/** Platform-specific and ecommerce service pages (hubs: platform, ecommerce), in manifest order. */
export const PLATFORM_ECOMMERCE_PAGES: ServicePage[] = [
  {
    slug: 'wordpress-seo',
    path: '/seo-services/wordpress-seo',
    name: 'WordPress SEO',
    title: 'WordPress SEO Services | Themes, Plugins, Speed',
    description:
      'WordPress SEO that fixes theme bloat, plugin conflicts, permalinks, indexing and speed, so search engines can crawl your site and visitors can use it.',
    h1: 'WordPress SEO services',
    intro:
      'WordPress SEO is the work of configuring a WordPress site, its theme, plugins, permalinks and content structure so search engines can crawl, understand and rank it. WordPress is flexible, which also means default settings, heavy plugins and duplicate archive pages often hold a site back until someone cleans them up.',
    icon: 'language',
    category: 'seo',
    hub: 'platform',
    tag: 'WordPress',
    includes: [
      {
        title: 'Theme and page builder review',
        body: 'We test your theme for crawlable markup, heading order, render-blocking scripts and mobile layout. If a page builder is adding excess code, we show where it hurts and how to reduce it.',
      },
      {
        title: 'Plugin audit and clean-up',
        body: 'We list every active plugin, remove overlap such as two SEO plugins or several caching tools, flag slow or abandoned ones and check that what remains is not creating thin or duplicate pages.',
      },
      {
        title: 'Permalinks and URL structure',
        body: 'We review your permalink settings, category and tag bases, attachment pages and pagination, then plan redirects so any URL change keeps its existing rankings rather than starting from nothing. We also test the result.',
      },
      {
        title: 'Indexing and archive control',
        body: 'Tag, author, date and search archives can flood the index with low-value pages. We decide what should be indexed, set noindex or canonicals where needed and tidy the XML sitemap.',
      },
      {
        title: 'Speed and hosting checks',
        body: 'We look at hosting response times, caching, image handling, database bloat and script loading, and recommend changes that improve Core Web Vitals without breaking forms, checkout or tracking. Changes are tested first.',
      },
      {
        title: 'Content and schema setup',
        body: 'Using your chosen SEO plugin or custom code, we configure titles, descriptions, breadcrumbs and structured data, and give editors a simple checklist so new posts follow the same standards. Nothing is left to memory.',
      },
    ],
    steps: [
      {
        title: 'Crawl and configuration audit',
        body: 'We crawl the site and review theme, plugins, settings and hosting to see what slows it down or confuses search engines.',
      },
      {
        title: 'Prioritise fixes',
        body: 'We rank issues by impact and risk, and agree a safe order of changes, ideally tested on staging before they reach the live site.',
      },
      {
        title: 'Implement and test',
        body: 'We make the changes with you or your developer, then recheck indexing, redirects, forms and tracking so nothing important breaks.',
      },
      {
        title: 'Monitor and maintain',
        body: 'We watch search data and site health after updates, because new plugin or core versions can reintroduce old problems. We flag regressions early.',
      },
    ],
    faq: [
      {
        q: 'Is WordPress good for SEO?',
        a: 'It can be. WordPress gives you clean control over titles, URLs, content and schema, but results depend on your theme, plugins, hosting and how it is configured. A well-maintained install performs fine; a bloated one often needs work first. Setup matters more than the name.',
      },
      {
        q: 'Which SEO plugin should I use?',
        a: 'The major SEO plugins cover the basics well, so the better choice is the one your team will use correctly. Running two at once causes conflicts, so we usually keep one and make sure its titles, sitemap and schema settings are accurate.',
      },
      {
        q: 'Will changing permalinks hurt my rankings?',
        a: 'It can if old URLs are not redirected. Changing a live permalink structure is risky and only worth doing when the current one causes real problems. If we do it, we map every old URL to its new one and monitor indexing afterwards.',
      },
      {
        q: 'Do too many plugins really slow a site down?',
        a: 'Plugin count matters less than what each one loads. A few badly built plugins can add scripts and database queries on every page, while many small ones may do no harm. We measure the impact instead of guessing from the number.',
      },
      {
        q: 'Can you work on a site built with Elementor or a similar builder?',
        a: 'Yes. Page builders add code, but they can still rank when headings, images, scripts and mobile layouts are handled carefully. We review what the builder outputs and suggest changes to templates and settings rather than asking you to rebuild everything.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'technical-seo', 'on-page-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Meta Tags & SERP Preview tool', href: '/free-tools/meta-tag-generator' },
    ],
  },
  {
    slug: 'shopify-seo',
    path: '/seo-services/shopify-seo',
    name: 'Shopify SEO',
    title: 'Shopify SEO Services | Grow Organic Store Sales',
    description:
      'Shopify SEO for collections, products and themes: work within the fixed URL structure, fix duplicate URLs, manage apps and turn organic traffic into sales.',
    h1: 'Shopify SEO services',
    intro:
      'Shopify SEO means getting a Shopify store found for the products and categories people search for, while working within the platform’s rules. Shopify fixes some things you cannot change, such as the /collections and /products URL paths, so good results come from getting collections, product pages, themes and apps right.',
    icon: 'shopping_bag',
    category: 'seo',
    hub: 'platform',
    tag: 'Shopify',
    includes: [
      {
        title: 'Collection page optimization',
        body: 'Collections are usually your best ranking pages. We write unique intros, set sensible titles and headings, tidy filters and pagination, and make sure each collection targets a distinct search need.',
      },
      {
        title: 'Duplicate product URL handling',
        body: 'Shopify can serve one product at /products/ and at /collections/…/products/. We check that canonical tags point to the main URL and that internal links, sitemaps and apps follow the same version.',
      },
      {
        title: 'Product page content and schema',
        body: 'We improve titles, descriptions, image alt text and variant handling, and check product schema and review markup so price, availability and ratings are accurate and eligible for rich results. We test pages with Google’s tools.',
      },
      {
        title: 'Theme and app review',
        body: 'Themes and installed apps add scripts that slow stores down. We test speed and mobile layout, identify apps that inject unwanted code or leftovers, and suggest lighter alternatives. Removal is done carefully and checked afterwards.',
      },
      {
        title: 'Redirects, tags and navigation',
        body: 'We use Shopify’s redirect tool to handle deleted or renamed products, clean up thin tag pages, and restructure menus so main collections are reachable in few clicks. We also keep menu labels clear for shoppers.',
      },
      {
        title: 'Blog and content planning',
        body: 'Buying guides, comparisons and how-to articles capture early research searches. We plan topics that link naturally to collections and products, without publishing filler content. Each article needs a clear purpose, an honest answer and a sensible next step for the reader.',
      },
    ],
    steps: [
      {
        title: 'Store audit',
        body: 'We crawl the store and check collections, products, canonicals, apps, theme code and speed, noting what is Shopify-specific and what can be changed.',
      },
      {
        title: 'Prioritise by revenue',
        body: 'We rank work by the pages and products that matter most for sales, so early effort goes where it can help most.',
      },
      {
        title: 'Optimise and fix',
        body: 'We update collections, products, theme settings and redirects, working in a duplicate theme or draft where possible to protect live sales.',
      },
      {
        title: 'Report on sales',
        body: 'We track organic traffic, landing pages and orders from search, and adjust the plan as the data comes in. Reports stay plain.',
      },
    ],
    faq: [
      {
        q: 'Can I change Shopify’s URL structure?',
        a: 'Not the core paths. Shopify keeps /collections/, /products/, /pages/ and /blogs/ in place. You can control the handles that follow them, so we focus on clear handles, one canonical product URL and tidy redirects. Within those limits there is still plenty of room to improve how pages are found.',
      },
      {
        q: 'Are Shopify stores good for SEO?',
        a: 'Shopify handles the basics well, including hosting, SSL, sitemaps and mobile themes. The limits are rigid URL paths and app-heavy themes. With sound collections, product content and a lean theme, many stores rank well. The platform rarely stops a store ranking; unmanaged apps and thin pages usually do.',
      },
      {
        q: 'Do Shopify apps hurt SEO?',
        a: 'Some do, mainly by loading extra scripts or leaving code behind after removal. Others help with reviews, redirects or schema. We test your store with and without suspect apps and keep only those that earn their place. We re-test after removing anything.',
      },
      {
        q: 'Should I worry about duplicate content on Shopify?',
        a: 'Duplicate product URLs are handled by canonical tags, but weak collection text, tag pages and filtered URLs can still cause problems. We check your theme’s canonicals and trim pages that add nothing for searchers. Where a page is useful, we improve it rather than hide it, which keeps your catalogue tidy and helpful.',
      },
      {
        q: 'Does Shopify SEO work for international stores?',
        a: 'It can. Shopify supports multiple markets and languages, but you need clear hreflang, sensible domains or subfolders and translated content that is not auto-generated filler. We review your setup before expanding to new regions. That prevents costly rework after launching in several markets at once.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'small-business-seo', 'technical-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
  {
    slug: 'google-business-profile',
    path: '/seo-services/google-business-profile',
    name: 'Google Business Profile Optimization',
    title: 'Google Business Profile Optimization Services',
    description:
      'Google Business Profile optimization: pick the right categories, keep NAP consistent, manage reviews, posts and photos, and show up in local searches and maps.',
    h1: 'Google Business Profile optimization',
    intro:
      'Google Business Profile optimization is the process of setting up and maintaining your free Google listing so it appears in Maps and local results. The right categories, accurate name, address and phone details, photos, services and genuine reviews help customers choose you, and help Google match you to nearby searches.',
    icon: 'location_on',
    category: 'seo',
    hub: 'platform',
    tag: 'Google Maps',
    includes: [
      {
        title: 'Categories and services',
        body: 'The primary category is one of the strongest signals on a profile. We pick it with care, add relevant secondary categories, and list services and products using the same terms customers use.',
      },
      {
        title: 'NAP consistency',
        body: 'We check that your business name, address and phone number match on your profile, website and key directories, and fix duplicates or old listings that confuse customers and search engines.',
      },
      {
        title: 'Review strategy and replies',
        body: 'We set up a simple way to ask real customers for reviews, draft considered replies to both praise and complaints, and flag reviews that break Google’s policies for reporting. Fake reviews are never part of the plan.',
      },
      {
        title: 'Posts, photos and Q&A',
        body: 'We plan regular posts for offers, events and updates, choose photos that show your premises and work, and monitor questions and answers so customers are not left with wrong information.',
      },
      {
        title: 'Profile compliance',
        body: 'We review your business name, address type, service-area setup and hours against Google’s guidelines, since keyword stuffing or a misused address can lead to suspension. Getting these details right at the start avoids lost visibility, locked profiles and slow reinstatement later.',
      },
      {
        title: 'Website and local link-up',
        body: 'We make sure the landing page linked from your profile matches the location, contains the same contact details and supports the services you list, and track calls, direction requests and clicks.',
      },
    ],
    steps: [
      {
        title: 'Profile audit',
        body: 'We review your listing, any duplicates, categories, reviews and competitors in the map results for your main searches. We note gaps.',
      },
      {
        title: 'Correct and complete',
        body: 'We fix the data, add missing details and photos, and align your website and directory listings with the profile. Everything then matches.',
      },
      {
        title: 'Build trust signals',
        body: 'We start the review process, publish posts and respond to feedback so the profile stays active and credible. Customers see real activity.',
      },
      {
        title: 'Track local results',
        body: 'We monitor profile views, calls, direction requests and local rankings, then refine what is not working. We also compare movement against nearby competitors, because map results shift constantly.',
      },
    ],
    faq: [
      {
        q: 'Does the primary category matter that much?',
        a: 'Yes. It heavily influences which searches your profile is eligible for. Choose the one that best describes your main business, then add secondary categories only for services you really offer. Changing it later can shift your visibility, so we test carefully.',
      },
      {
        q: 'Can I put keywords in my business name?',
        a: 'No. Your name should match what appears on your signage and paperwork. Adding extra keywords breaks Google’s guidelines and risks edits or suspension. Better local relevance comes from categories, services, content and genuine reviews. Those are the signals you can legitimately strengthen over time, without risking your profile.',
      },
      {
        q: 'How do I get more reviews safely?',
        a: 'Ask real customers soon after a good experience, with a direct link to your review page. Do not offer rewards, buy reviews or filter who may leave one. We help you build a routine that stays within Google’s policies. It stays simple for staff.',
      },
      {
        q: 'Do Google posts help rankings?',
        a: 'Posts are not a confirmed ranking factor, but they give customers up-to-date offers, events and information on your profile. They show an active business, so we use them for relevance and conversions rather than as a ranking trick. They are best treated as a small, steady habit.',
      },
      {
        q: 'What if my profile has been suspended?',
        a: 'First we find out why, usually a guideline issue with name, address or category. Then we correct the problem and submit a reinstatement request with accurate evidence. We cannot promise the outcome, because Google makes the final decision. Appeals can take time.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['local-seo', 'multi-location-seo', 'home-services-seo'],
    guides: [SEO_GUIDES, { label: 'Business directory guides', href: '/blog/business-directory' }],
  },
  {
    slug: 'ecommerce-seo',
    path: '/seo-services/ecommerce-seo',
    name: 'Ecommerce SEO',
    title: 'Ecommerce SEO Services | Category, Product, Feeds',
    description:
      'Full-store ecommerce SEO for any platform: category and product architecture, faceted navigation, product schema and feeds that turn organic search into sales.',
    h1: 'Ecommerce SEO services',
    intro:
      'Ecommerce SEO is the strategy behind how an online store, from a new shop to a catalogue of thousands of pages, gets found in search. It covers site architecture, category and product page templates, faceted navigation, structured data and product feeds. The goal is more qualified organic visitors and orders, on any platform. We tailor everything to your catalogue.',
    icon: 'sell',
    category: 'seo',
    hub: 'ecommerce',
    tag: 'High ROI',
    includes: [
      {
        title: 'Category and product architecture',
        body: 'We map how categories, subcategories and products connect, based on how people search, so important categories sit close to the homepage and no product is buried or orphaned. Structure comes first.',
      },
      {
        title: 'Faceted navigation control',
        body: 'Filters for size, colour or brand can create endless URLs. We decide which combinations earn their own indexable pages and which get canonical tags, noindex or robots rules to protect crawl budget.',
      },
      {
        title: 'Category and product templates',
        body: 'We design templates for titles, headings, descriptions, internal links and specification blocks, so thousands of pages gain unique, useful content without hand-writing every one from scratch. Templates also save your team time later on.',
      },
      {
        title: 'Structured data and merchant feeds',
        body: 'We implement product, offer, breadcrumb and review schema, and align it with your product feed so price, stock and identifiers agree across your site, search results and shopping listings. Consistency builds trust.',
      },
      {
        title: 'Out-of-stock and discontinued products',
        body: 'We set rules for sold-out items, seasonal lines and removed products: keep, redirect to a close match, or show alternatives, so authority is kept and shoppers do not hit dead ends.',
      },
      {
        title: 'Technical health and speed',
        body: 'We audit crawling, indexing, internal duplicates, pagination, mobile speed and checkout friction at scale, with fixes written so your developers can act on them. Each ticket includes examples, expected outcomes and a way to check the work once it ships.',
      },
      {
        title: 'Launch checklist for new stores',
        body: 'For new or small shops, we first confirm the store is indexable, has a sitemap, uses HTTPS, loads reasonably on mobile and tracks sales, so early traffic is not wasted on a store with basic faults.',
      },
      {
        title: 'Original product descriptions',
        body: 'We write or coach on original descriptions covering who a product is for, sizes, materials, care, delivery and returns, instead of reusing supplier text that other sellers already publish. Best sellers come first.',
      },
    ],
    steps: [
      {
        title: 'Store audit',
        body: 'We crawl the whole catalogue, review analytics and search data, and benchmark your categories against competitors. We also note which sections of the catalogue already earn organic visits.',
      },
      {
        title: 'Architecture plan',
        body: 'We prepare a keyword-to-page map, facet rules and template specifications, ranked by the revenue each part of the catalogue can influence.',
      },
      {
        title: 'Roll out in phases',
        body: 'We ship changes in controlled batches, starting with top categories, and test each release before applying it to the full catalogue.',
      },
      {
        title: 'Measure revenue',
        body: 'We report organic sessions, landing pages and ecommerce conversions, and use the findings to choose what to expand next. Wins are repeated.',
      },
    ],
    faq: [
      {
        q: 'Which ecommerce platforms do you work with?',
        a: 'We work with Shopify, WooCommerce, Magento, BigCommerce and custom builds. The principles are the same everywhere, but each platform has limits on URLs, templates and plugins, so we adapt recommendations to what your system can actually do. Platform limits shape the plan.',
      },
      {
        q: 'Should I optimize categories or products first?',
        a: 'Usually categories. They match broader searches, collect internal links and lead to many products. Product pages matter too, especially for specific or branded searches, so we start with top categories, then work through best sellers. Variants, accessories and long-tail searches come after the main categories are in good shape.',
      },
      {
        q: 'How do you handle faceted navigation?',
        a: 'We review which filters match real searches and which only create duplicate or empty pages. Valuable combinations get clean URLs and unique content. The rest are controlled with canonicals, noindex or crawl rules, depending on your platform. Platform limits matter here.',
      },
      {
        q: 'Do product feeds affect organic SEO?',
        a: 'Feeds mainly power shopping listings, but they must match what is on your site. Mismatched price or stock data can get products disapproved. Keeping site markup and feeds in sync also helps Google trust your product information. Clean data also lowers rejection risk.',
      },
      {
        q: 'How long until an ecommerce site sees results?',
        a: 'It varies with competition, site health and catalogue size. Technical fixes can show in weeks, while new content and authority usually take months. We cannot guarantee timing, but we report progress against agreed measures along the way. Honest expectations help planning.',
      },
      {
        q: 'Is SEO worth it for a new or small store?',
        a: 'Often, yes, because organic traffic does not need ad spend for every visit. It builds slowly, though, so it works best alongside other ways of finding first customers, and specific long-tail searches with clear buying intent tend to convert earlier than broad ones.',
      },
      {
        q: 'Do I need a blog for my online store?',
        a: 'Not at the start. Get categories and products right first. A blog helps later by capturing research-stage searches, such as how to choose or compare products, and by giving you pages that can link to your range.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['shopify-seo', 'wordpress-seo', 'technical-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
];
