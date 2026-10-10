import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
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
    related: ['woocommerce-seo', 'technical-seo', 'on-page-seo'],
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
    related: ['ecommerce-seo', 'seo-for-online-stores', 'woocommerce-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
  {
    slug: 'woocommerce-seo',
    path: '/seo-services/woocommerce-seo',
    name: 'WooCommerce SEO',
    title: 'WooCommerce SEO Services | WordPress Store Growth',
    description:
      'WooCommerce SEO for WordPress stores: product and category pages, plugin bloat, hosting speed, variations and filters, and checkout pages kept out of search.',
    h1: 'WooCommerce SEO services',
    intro:
      'WooCommerce SEO is the work of making an online store built on WordPress and the WooCommerce plugin visible in search. Because you own the hosting, theme and plugins, you have more control than on a hosted platform, along with more responsibility for speed, duplicate URLs and keeping cart and account pages out of the index.',
    icon: 'storefront',
    category: 'seo',
    hub: 'platform',
    tag: 'WooCommerce',
    includes: [
      {
        title: 'Hosting and performance review',
        body: 'Online stores demand more from servers than blogs do. We check response times, caching rules that must exclude cart and checkout, image sizes and database load, and suggest realistic improvements.',
      },
      {
        title: 'Plugin and extension audit',
        body: 'Stores tend to collect plugins for sliders, filters, popups and payments. We find what is slowing pages, conflicting with SEO settings or creating extra URLs, and recommend what to keep or replace.',
      },
      {
        title: 'Category and product structure',
        body: 'We review product categories, tags and attributes so each page targets a clear need, avoid category overlap, and set the product permalink base to a structure that works for your catalogue.',
      },
      {
        title: 'Variations, filters and duplicates',
        body: 'Variable products, layered filters and sorting parameters can multiply URLs. We decide which versions deserve indexing, apply canonicals or noindex, and keep faceted pages from wasting crawl budget. Unneeded URLs are removed.',
      },
      {
        title: 'Indexing of cart and account pages',
        body: 'Cart, checkout, account and thank-you pages should not appear in search. We confirm they are excluded, and that sitemaps list only products, categories and content people can actually land on.',
      },
      {
        title: 'Product schema and reviews',
        body: 'We check WooCommerce’s product markup, add missing fields such as availability and identifiers, and make sure review markup reflects genuine reviews that are visible on the page. Markup should never promise more than shoppers see.',
      },
    ],
    steps: [
      {
        title: 'Store and server audit',
        body: 'We crawl the store and review hosting, theme, plugins and settings to see what is affecting speed, crawling and indexing.',
      },
      {
        title: 'Plan the fixes',
        body: 'We list changes in order of sales impact and risk, flagging anything that should be tested on a staging copy before launch.',
      },
      {
        title: 'Implement and test',
        body: 'We update categories, products, filters, indexing rules and plugins, then run test orders to confirm checkout and tracking still work.',
      },
      {
        title: 'Track and iterate',
        body: 'We follow organic landing pages, product visibility and orders from search, and revisit plugins and speed as the catalogue grows.',
      },
    ],
    faq: [
      {
        q: 'Is WooCommerce good for SEO?',
        a: 'It gives you a lot of control over URLs, content and markup, and it can rank very well. The trade-off is that speed, security and plugin choices are your responsibility, so results depend on how carefully the store is built and maintained.',
      },
      {
        q: 'Why is my WooCommerce store slow?',
        a: 'Common causes are underpowered hosting, too many or poorly coded plugins, large images and a heavy theme. We measure each factor instead of assuming, then suggest the fixes that make the biggest difference without breaking checkout. Every change is tested on a staging copy before it goes live.',
      },
      {
        q: 'How should I handle product variations?',
        a: 'In most cases, one page per parent product with variations selectable on it works best, supported by clear attributes. Separate pages for each variation can make sense when people search for them individually, and we judge this case by case.',
      },
      {
        q: 'Should I noindex product tags and filters?',
        a: 'Often, yes, when they create thin or near-duplicate pages. But some filter combinations match real searches and may deserve an optimized page. We check demand and content quality before choosing noindex or a proper landing page. The decision rests on search demand, not habit.',
      },
      {
        q: 'Can you migrate my store without losing rankings?',
        a: 'A careful migration reduces risk, but no one can promise zero change. We map old URLs to new ones, preserve titles, content and schema, test on staging and monitor indexing after launch so problems get fixed quickly. Crawl errors, lost redirects and missing orders are caught early.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['wordpress-seo', 'ecommerce-seo', 'shopify-seo'],
    guides: [SEO_GUIDES, { label: 'Website Speed Test', href: '/free-tools/website-speed-test' }],
  },
  {
    slug: 'youtube-seo',
    path: '/seo-services/youtube-seo',
    name: 'YouTube SEO',
    title: 'YouTube SEO Services | Titles, Chapters, Retention',
    description:
      'YouTube SEO for channels and brands: keyword research, titles, descriptions, chapters, thumbnails and retention so your videos are found in YouTube and Google.',
    h1: 'YouTube SEO services',
    intro:
      'YouTube SEO is the practice of helping videos get discovered in YouTube search, suggested videos and Google results. Rankings there depend on how well a video matches what people want and how they respond to it, so titles, thumbnails, chapters and viewer retention matter as much as keywords. Together they decide who watches.',
    icon: 'monitoring',
    category: 'seo',
    hub: 'platform',
    tag: 'YouTube',
    includes: [
      {
        title: 'Video keyword and topic research',
        body: 'We use YouTube autocomplete, search data and competitor channels to find topics people actually search, and separate evergreen search videos from ones meant for browse and suggested traffic. Each type needs a different approach.',
      },
      {
        title: 'Titles, descriptions and tags',
        body: 'We write titles that lead with the main phrase and still earn clicks, descriptions with a useful first few lines, links and context, and tags used lightly, since they carry little weight.',
      },
      {
        title: 'Chapters and transcripts',
        body: 'We add timestamped chapters, clean captions and transcripts so viewers can jump to what they need, and so search engines can better understand what each section of the video covers.',
      },
      {
        title: 'Thumbnails and retention',
        body: 'We review thumbnail clarity, opening seconds, pacing and drop-off points in YouTube Studio, then suggest changes that keep viewers watching rather than tricks that win clicks and lose trust. Honest packaging keeps viewers.',
      },
      {
        title: 'Channel and playlist structure',
        body: 'We tidy channel description, banner, links, sections and playlists so new visitors understand your topics and are led to the next video, which supports session time. A clear channel page also helps people decide to subscribe after one good video.',
      },
      {
        title: 'Shorts and Google video results',
        body: 'We advise on where Shorts support your goals, and on embedding videos on relevant pages with schema so they can appear in Google’s video results as well as on YouTube.',
      },
    ],
    steps: [
      {
        title: 'Channel audit',
        body: 'We review your analytics, top videos, search terms and competitors to see what is working and which topics are missing.',
      },
      {
        title: 'Plan the content',
        body: 'We build a topic list with target phrases, titles, thumbnail ideas and chapter outlines, matched to your goals and production capacity.',
      },
      {
        title: 'Optimize and publish',
        body: 'We prepare metadata, captions and playlists for new videos and update older videos that still have potential. Old uploads often respond well to a fresh title and chapters.',
      },
      {
        title: 'Measure and refine',
        body: 'We review impressions, click-through, watch time and traffic sources every month, then adjust topics and packaging based on results. Winning formats get repeated.',
      },
    ],
    faq: [
      {
        q: 'Do tags still matter on YouTube?',
        a: 'Very little. YouTube has said tags can help with common misspellings, but titles, descriptions, captions and viewer behaviour matter far more. We keep tags short and relevant and put our effort into what viewers and the algorithm respond to. That is where gains come from.',
      },
      {
        q: 'How important is watch time?',
        a: 'Very. YouTube looks at how much of a video people watch and whether they continue watching afterwards. We study retention graphs to find where viewers leave, then adjust intros, pacing and structure for future videos. Strong videos usually earn attention in the first half minute, so we pay close attention to hooks.',
      },
      {
        q: 'Can you guarantee my videos will rank?',
        a: 'No. Rankings depend on competition, audience reaction and platform changes we do not control. We can improve discoverability and packaging, and show you what the data says, but we do not promise positions or view counts. Our reporting shows the changes made and how the numbers moved afterwards, good or bad.',
      },
      {
        q: 'Do you make the videos too?',
        a: 'Our focus is the search side: research, planning, metadata, structure and measurement. We can brief your video producer or editor, and work from scripts, but filming and editing stay with your team or a production partner. We can brief them on structure and titles.',
      },
      {
        q: 'Is YouTube SEO different from video SEO?',
        a: 'They overlap. YouTube SEO is about performing inside YouTube. Video SEO covers getting videos hosted on your own site to appear in Google. Many brands need both, so we plan one video so it serves each place. This avoids doing the same work twice.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['video-seo', 'content-marketing', 'digital-marketing'],
    guides: [SEO_GUIDES],
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
    related: ['local-seo', 'off-page-seo', 'retail-seo'],
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
      'Ecommerce SEO is the strategy behind how a store with hundreds or thousands of pages gets found in search. It covers site architecture, category and product page templates, faceted navigation, structured data and product feeds. The goal is more qualified organic visitors and orders, on any platform. We tailor everything to your catalogue.',
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
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['seo-for-online-stores', 'shopify-seo', 'technical-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
  {
    slug: 'seo-for-online-stores',
    path: '/seo-services/seo-for-online-stores',
    name: 'SEO for Online Stores',
    title: 'SEO for Online Stores | First Organic Sales',
    description:
      'SEO for small and new online stores: launch basics, product copy that sells, low-competition keywords and affordable steps to win your first organic sales.',
    h1: 'SEO for online stores',
    intro:
      'SEO for online stores is a focused starting plan for small or new shops that need their first organic sales without a large budget. Rather than fighting for the biggest terms, we get the basics right, write product copy that answers shopper questions and target searches you can win. Small gains add up.',
    icon: 'add_business',
    category: 'seo',
    hub: 'ecommerce',
    tag: 'Online Stores',
    includes: [
      {
        title: 'Launch checklist',
        body: 'Before promoting anything, we confirm that the store is indexable, has a sitemap, uses HTTPS, loads reasonably on mobile and tracks sales, so early traffic is not wasted on a store with basic faults.',
      },
      {
        title: 'Realistic keyword targets',
        body: 'New shops rarely outrank established brands for broad terms. We look for specific, lower-competition phrases such as product types, materials, uses and problems your products solve, with clear buying intent.',
      },
      {
        title: 'Product description writing',
        body: 'We write or coach on original descriptions covering who a product is for, sizes, materials, care, delivery and returns, instead of copying supplier text that other sellers already use. Original wording gives you an edge.',
      },
      {
        title: 'Priority pages first',
        body: 'With a small team, effort has to count. We choose your homepage, main categories and a handful of best sellers to improve first, rather than spreading effort thinly over every product.',
      },
      {
        title: 'Simple trust and conversion fixes',
        body: 'We review shipping and return pages, contact details, product photos and review prompts, because organic visitors only buy when the store looks reliable and answers their last questions. Trust is part of SEO here.',
      },
      {
        title: 'Low-cost early links and listings',
        body: 'We suggest practical, honest ways to earn early mentions: supplier and maker pages, local or niche directories, partners and helpful content, avoiding paid link schemes that put a young store at risk.',
      },
    ],
    steps: [
      {
        title: 'Quick store review',
        body: 'We check your platform, structure, speed and product pages to find the basic faults holding back a new store. Most are quick to fix.',
      },
      {
        title: 'Pick your battles',
        body: 'We choose a short list of categories and products with realistic search demand, so effort and budget go where they can pay back.',
      },
      {
        title: 'Optimize and write',
        body: 'We improve titles, category intros and product copy for the priority pages, and set simple templates you can reuse as you add stock.',
      },
      {
        title: 'Grow what works',
        body: 'We watch which pages start getting impressions and orders, then extend the same approach to more products and supporting guides.',
      },
    ],
    faq: [
      {
        q: 'Is SEO worth it for a brand-new store?',
        a: 'Often, yes, because organic traffic does not need ad spend for every visit. But it builds slowly, so it works best alongside other ways of getting first customers. We help you judge how much to invest at this stage. Budget is considered carefully.',
      },
      {
        q: 'How soon can I expect my first organic sales?',
        a: 'It depends on competition, products and how much content is already indexed. New stores usually need patience, and we cannot promise a date. Specific long-tail searches tend to convert earlier than broad ones. Their lower competition and clearer intent give a small store its best early chance of winning.',
      },
      {
        q: 'Can I use manufacturer product descriptions?',
        a: 'You can, but they rarely help. Many retailers publish the same text, so there is little reason for search engines to prefer your page. Rewriting at least your top products with real detail gives you a clearer edge. Start with your best sellers.',
      },
      {
        q: 'Do I need a blog for my online store?',
        a: 'Not at the start. First get categories and products right. A blog helps later by capturing research-stage searches, such as how to choose or compare products, and by giving you pages that can link to your range. Add it once the core pages are in good shape.',
      },
      {
        q: 'Which platform is best for SEO on a small budget?',
        a: 'Shopify, WooCommerce, BigCommerce and similar platforms can all work. The better choice depends on your skills, budget and growth plans. Whichever you pick, solid structure and original content matter more than the platform label. Switching platforms is rarely the first fix; most early gains come from structure, copy and clean setup.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'small-business-seo', 'shopify-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'b2c-seo',
    path: '/seo-services/b2c-seo',
    name: 'B2C SEO',
    title: 'B2C SEO Services | Capture Consumer Demand',
    description:
      'B2C SEO for consumer brands: capture buying-stage demand, grow branded search, earn trust with reviews and reach shoppers across devices and seasons.',
    h1: 'B2C SEO services',
    intro:
      'B2C SEO helps brands that sell directly to consumers get found by people deciding what to buy. Consumer searches are quick, emotional and often seasonal, so the work centres on capturing existing demand, building brand search, showing reviews and making buying simple on a phone. Customers decide quickly, so every step has to feel effortless, trustworthy and clear.',
    icon: 'groups',
    category: 'seo',
    hub: 'ecommerce',
    tag: 'B2C',
    includes: [
      {
        title: 'Demand capture mapping',
        body: 'We map searches across the shopper journey, from early problem and idea queries to comparisons and ready-to-buy terms, and match each to a page that deserves to rank for it.',
      },
      {
        title: 'Brand search growth',
        body: 'When people search your brand name, your result should answer them. We look at branded queries, sitelinks, knowledge panels and brand-plus-product searches, and fix gaps that send shoppers elsewhere. Branded results matter.',
      },
      {
        title: 'Reviews and social proof',
        body: 'Consumers lean on other buyers’ opinions. We help you collect, show and mark up genuine reviews, respond to criticism and use review language to improve page copy and FAQs. Customers tell you what matters.',
      },
      {
        title: 'Seasonal and trend planning',
        body: 'Consumer demand rises with holidays, weather and trends. We build a calendar so pages are updated and indexed before peaks, not while they are happening, and keep evergreen pages current.',
      },
      {
        title: 'Mobile shopping experience',
        body: 'Most consumer searches start on a phone. We review page speed, layout, tap targets, filters and checkout steps to find the points where shoppers leave without buying. These leaks cost sales quietly.',
      },
      {
        title: 'Content for consumer intent',
        body: 'We plan buying guides, comparisons, size guides and how-to pages in plain language that help shoppers decide, and link them to the products or services they lead to. Each guide has a purpose.',
      },
    ],
    steps: [
      {
        title: 'Understand your shoppers',
        body: 'We study your audience, competitors, search demand and branded search to see how buyers actually find and choose. This shapes everything else.',
      },
      {
        title: 'Plan the journey',
        body: 'We turn that research into a page and content map, covering each stage from discovery to purchase and returning customers.',
      },
      {
        title: 'Build and optimize',
        body: 'We improve key pages, create missing content, tidy review markup and fix mobile friction on the routes that lead to sales.',
      },
      {
        title: 'Review the trend',
        body: 'We track branded and non-branded visits, conversions and seasonal movement, then adjust the plan before the next peak. Timing is planned ahead.',
      },
    ],
    faq: [
      {
        q: 'How is B2C SEO different from B2B SEO?',
        a: 'Consumer purchases usually involve one person, a shorter decision and more emotion, price and convenience. B2B tends to involve several stakeholders and longer research. Therefore B2C pages lean on clear offers, reviews, mobile ease and seasonal timing. Trust signals carry extra weight here.',
      },
      {
        q: 'Why does branded search matter?',
        a: 'Branded searches are made by people who already know you, and they often convert well. If your own site, reviews or profiles do not fill that result page, competitors or resellers can capture the visit. We help you own it.',
      },
      {
        q: 'Do reviews really influence SEO?',
        a: 'Reviews can improve how your listings look and how much shoppers trust you, and review content can add useful wording to a page. We treat them as a trust and conversion signal and never fake or incentivise them. Honest feedback builds lasting trust.',
      },
      {
        q: 'Can SEO help with seasonal products?',
        a: 'Yes, if you plan early. Keep seasonal pages on the same URLs year after year, update them ahead of the peak and link to them from relevant places, so they retain authority and can be found when demand returns. Fresh content keeps them relevant.',
      },
      {
        q: 'Should consumer brands also invest in social media?',
        a: 'Often, since social builds awareness and gives people a reason to search your name later. SEO captures that intent. We focus on the search side, and can align content topics with your campaigns when it makes sense. Each channel supports the other.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'content-marketing', 'retail-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'app-store-optimization',
    path: '/seo-services/app-store-optimization',
    name: 'App Store Optimization',
    title: 'App Store Optimization (ASO) Services',
    description:
      'App Store Optimization for Apple and Google Play: titles, keywords, screenshots, ratings and an app landing page that helps people find and install your app.',
    h1: 'App store optimization',
    intro:
      'App store optimization, or ASO, is the process of improving how an app appears and ranks in the Apple App Store and Google Play. It covers the title, keywords, icon, screenshots, description and ratings, plus a web landing page, so more of the right people find the app and install it.',
    icon: 'smartphone',
    category: 'seo',
    hub: 'ecommerce',
    tag: 'App Store',
    includes: [
      {
        title: 'Title, subtitle and keyword research',
        body: 'We research the terms users search in each store, then place the best ones in your title, subtitle and keyword field, working within character limits and each store’s rules. We avoid keyword stuffing.',
      },
      {
        title: 'Store listing copy',
        body: 'Google Play indexes the long description, while Apple weighs it less for ranking but it still guides decisions. We write each for its purpose, leading with the benefit and not a feature list.',
      },
      {
        title: 'Icon, screenshots and preview video',
        body: 'Most users decide from the first screenshots. We review your icon, screenshot order, captions and preview video, and suggest tests that show what makes people install. Changing one asset at a time keeps results clear.',
      },
      {
        title: 'Ratings and review management',
        body: 'We set up in-app prompts that ask satisfied users at a sensible moment, follow store rules, and draft helpful replies to reviews, since ratings affect both ranking and conversion. Timing matters.',
      },
      {
        title: 'Localization by market',
        body: 'Listing text can be localized for each country and language. We prioritise markets with real potential and adapt keywords and screenshots properly rather than machine-translating them. Poor translations lose installs and can look careless to local users.',
      },
      {
        title: 'App landing page SEO',
        body: 'A web page for your app can rank in Google, hold download links and explain the product. We cover page content, schema, smart banners and deep links to the relevant store listing.',
      },
    ],
    steps: [
      {
        title: 'Listing and market audit',
        body: 'We review your current listings, keywords, ratings and competitor apps in every store and country you target. We note gaps and strengths.',
      },
      {
        title: 'Keyword and creative plan',
        body: 'We prepare a keyword set, new copy and a screenshot and icon brief, ordered by what is likely to affect installs.',
      },
      {
        title: 'Update and test',
        body: 'We apply the changes, use store experiments where available and keep notes, so we can tell which update caused which effect.',
      },
      {
        title: 'Track installs',
        body: 'We follow impressions, page views, install rate, keyword ranks and ratings, then keep refining as the app and stores change.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between ASO and SEO?',
        a: 'SEO helps web pages rank in search engines, while ASO helps an app rank and convert inside Apple’s and Google’s stores. They share keyword thinking, but ASO also depends on ratings, install rate and listing visuals. Many apps need both.',
      },
      {
        q: 'Do the App Store and Google Play work the same way?',
        a: 'Not quite. Apple uses the app name, subtitle and a hidden keyword field. Google Play reads the title, short and long descriptions. Both weigh ratings and installs, so we write and test each listing separately. Copying one store’s approach into the other usually wastes limited space and can hurt discoverability.',
      },
      {
        q: 'How much do ratings matter?',
        a: 'A lot. Ratings influence whether people tap install and are widely thought to affect ranking. A better rating usually comes from improving the app and asking happy users at the right time, never from fake or purchased reviews. Store policies prohibit them.',
      },
      {
        q: 'Can you guarantee my app will rank first?',
        a: 'No. Rankings depend on competition, app quality, ratings and store algorithms. We improve what you control and measure results, but we cannot promise positions or install numbers. Results depend on competition, app quality, ratings, pricing, category, paid activity and store algorithms that change often, so any promise would be guesswork.',
      },
      {
        q: 'Do I need a website for my app?',
        a: 'It is strongly recommended. A landing page can rank for brand and category searches, show screenshots and send visitors to the right store for their device. It also gives you a place for support and privacy information. Stores usually ask for it.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['mobile-seo', 'on-page-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'mobile-seo',
    path: '/seo-services/mobile-seo',
    name: 'Mobile SEO',
    title: 'Mobile SEO Services | Mobile-First and Web Vitals',
    description:
      'Mobile SEO for mobile-first indexing: equal content on mobile, Core Web Vitals, responsive layouts and mobile UX fixes that help people and search engines.',
    h1: 'Mobile SEO services',
    intro:
      'Mobile SEO makes sure a website works well for people on phones and for Google, which mainly crawls the mobile version of a page. That means matching content across devices, passing Core Web Vitals on real mobile connections and removing layout problems that make visitors leave. Small phone-screen faults can quietly cost a lot of traffic and enquiries.',
    icon: 'smartphone',
    category: 'seo',
    hub: 'ecommerce',
    tag: 'Mobile',
    includes: [
      {
        title: 'Mobile-first indexing check',
        body: 'Because Google primarily uses the mobile page, we compare it with desktop to ensure the same content, links, structured data, metadata and images are present, and nothing is hidden or blocked.',
      },
      {
        title: 'Core Web Vitals on mobile',
        body: 'We use field data and lab tests to review loading speed, responsiveness and layout shifts on phone-sized screens, then trace poor scores to specific images, scripts, fonts or third-party tags.',
      },
      {
        title: 'Responsive design review',
        body: 'We test breakpoints, viewport settings, text size, tap targets and horizontal scrolling across popular devices, and note where layouts break or buttons sit too close together. Fixes are listed per template.',
      },
      {
        title: 'Intrusive elements and pop-ups',
        body: 'Large interstitials, sticky banners and cookie notices can cover content and frustrate users. We assess which ones hurt usability and suggest placements that remain compliant and less disruptive. Legal needs still come first.',
      },
      {
        title: 'Mobile UX and conversion paths',
        body: 'We walk the key journeys on a phone, such as search, navigation, forms, click-to-call and checkout, and report friction points that reduce enquiries or sales. We time each step with a stopwatch and record screens so developers can see exactly what a customer sees.',
      },
      {
        title: 'Mobile search features',
        body: 'We look at how your pages appear on phones in local results, rich results and search features, and optimise titles, snippets and schema for smaller displays. Short, clear wording works best.',
      },
    ],
    steps: [
      {
        title: 'Test on real conditions',
        body: 'We review mobile crawl data, field metrics and device testing, instead of relying on desktop checks only. Phones behave differently.',
      },
      {
        title: 'Rank the problems',
        body: 'We sort issues by effect on visitors and rankings, and separate quick template fixes from larger development work. Priorities stay visible.',
      },
      {
        title: 'Fix and retest',
        body: 'We guide or support your developers through the changes and retest on mobile devices and in Search Console after each release.',
      },
      {
        title: 'Keep watching',
        body: 'We monitor Core Web Vitals and mobile usability over time, since new features and scripts often undo earlier gains. Regular checks prevent slow decline.',
      },
    ],
    faq: [
      {
        q: 'What is mobile-first indexing?',
        a: 'It means Google mainly uses the mobile version of your pages to crawl, index and rank them. If important content, links or markup exist only on desktop, they may be ignored, so both versions need to match. Check the basics first.',
      },
      {
        q: 'Do I need a separate mobile site?',
        a: 'Usually not. Responsive design, where one URL adapts to every screen, is the simplest to maintain and the format Google recommends. Separate mobile URLs add extra work and risk if the versions drift apart. If you already run one, we can still audit it and plan a move to responsive when it is practical.',
      },
      {
        q: 'Are Core Web Vitals a big ranking factor?',
        a: 'They are a ranking signal, but content relevance still matters more. Poor mobile performance mainly hurts users, which hurts conversions. We fix what is slow or unstable as a priority for visitors, with search benefits as a bonus. Speed rarely sells alone.',
      },
      {
        q: 'How do you measure mobile performance?',
        a: 'We combine field data from real visitors, such as the Chrome UX Report and Search Console, with lab tools such as Lighthouse. Field data shows what people actually experience, while lab tests help us find the cause. Both views are useful.',
      },
      {
        q: 'My site looks fine on my phone. Is that enough?',
        a: 'Not always. Your phone, network and cache may be better than your average visitor’s. Problems often appear on older devices, slower connections or particular screen sizes, so we test more widely and check real user data from actual visitors, not only our own devices.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['technical-seo', 'app-store-optimization', 'ecommerce-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Mobile-Friendly Test', href: '/free-tools/mobile-friendly-test' },
    ],
  },
];
