import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const DIRECTORY_GUIDES = { label: 'Business directory guides', href: '/blog/business-directory' };
const SCHEMA_TOOL = {
  label: 'Schema Markup Generator',
  href: '/free-tools/schema-markup-generator',
};
const SPEED_TOOL = { label: 'Website Speed Test', href: '/free-tools/website-speed-test' };

/**
 * Industry service pages, first group: property, healthcare, legal, hospitality,
 * finance, software, fashion, travel, startups, education, manufacturing and trades.
 */
export const INDUSTRY_PAGES_1: ServicePage[] = [
  {
    slug: 'real-estate-seo',
    path: '/seo-services/real-estate-seo',
    name: 'Real Estate SEO',
    title: 'Real Estate SEO Services | Win More Property Leads',
    description:
      'SEO for agents, agencies and developers: indexable listing pages, area guides and local search work that bring buyers and renters to you, not just the portals.',
    h1: 'Real estate SEO services',
    intro:
      'Real estate SEO is the work of getting your listings, agents and area expertise found by people searching to buy, rent or sell property. Because stock changes daily and portals dominate many results, the focus is on listing pages that stay indexable, neighbourhood content that earns trust, and local signals that point enquiries to you.',
    icon: 'apartment',
    category: 'seo',
    hub: 'industry',
    tag: 'Property',
    includes: [
      {
        title: 'Listing page optimization',
        body: 'Templates for property pages that carry unique descriptions, clean URLs, image alt text, location detail and structured data, so each listing can rank on its own while it is live.',
      },
      {
        title: 'Sold, expired and rented handling',
        body: 'Rules for what happens to a page when a property leaves the market: redirect, keep with a clear status, or point to similar stock, so you avoid soft 404s and wasted crawl budget.',
      },
      {
        title: 'Neighbourhood and area guides',
        body: 'Original guides covering schools, transport, price trends and daily life for each area you work in. They capture early-stage searchers who have not yet chosen an agent. We also add market snapshots so visitors can judge pricing before they speak to anyone.',
      },
      {
        title: 'Agent and agency profiles',
        body: 'Profile pages that show each agent’s areas, specialties and verifiable credentials, plus consistent branch listings, so buyers and search engines can connect a person to a place. Each profile links to the listings that agent handles, which helps visitors move naturally into enquiries.',
      },
      {
        title: 'Developer and project pages',
        body: 'For off-plan and new-build projects, we structure launch pages, floor plan and payment-plan content and update notes so interest is captured before and after sales open. Updates are published as phases release, so interested buyers always see current availability and plans.',
      },
      {
        title: 'Search filter and feed control',
        body: 'Decisions on which filter combinations, such as bedrooms plus suburb, deserve indexable pages and which should be blocked, so you avoid thousands of near-identical URLs. Pagination, sorting and map views are checked too, so crawlers reach live stock without wading through duplicates.',
      },
    ],
    steps: [
      {
        title: 'Inventory and market audit',
        body: 'We review how listings are crawled and indexed, how portals outrank you, and which areas and property types drive real enquiries.',
      },
      {
        title: 'Template and structure fixes',
        body: 'We correct listing templates, filter handling and internal links so live stock is easy to find and removed stock does not clutter the index.',
      },
      {
        title: 'Area and agent content',
        body: 'We publish area guides, market notes and agent profiles that show first-hand local knowledge and answer questions buyers and sellers actually ask.',
      },
      {
        title: 'Lead tracking and tuning',
        body: 'We connect rankings to enquiries, viewings and valuations requests, then shift effort toward the areas and page types producing instructions.',
      },
    ],
    faq: [
      {
        q: 'Can SEO compete with the big property portals?',
        a: 'Not head on for every search, and we will not pretend otherwise. SEO works best on areas, niches and seller-side searches where your local knowledge is stronger, and on brand searches that portals cannot capture. It also reduces how much you depend on paid listings.',
      },
      {
        q: 'Do individual listings need to rank?',
        a: 'Sometimes. Live listings can capture specific searches such as a building name or street, but they are short-lived. Area pages, project pages and valuation pages usually build lasting visibility, so we balance both rather than chasing every listing. We look at which pages already attract valuation requests and area searches before deciding where to invest.',
      },
      {
        q: 'We work in several cities. How is that handled?',
        a: 'Each city or district needs its own pages with genuine local detail, plus separate listing profiles for each branch. Copying one page and swapping the place name rarely works, so we plan content and local profiles market by market. Both channels can work together: we often show how organic visibility lowers the cost of each new instruction over time.',
      },
      {
        q: 'How long until we see enquiries from SEO?',
        a: 'It depends on competition and the state of your site. Technical fixes can be picked up within weeks, while area content and authority take longer. We cannot promise rankings, but we report visibility, enquiries and viewings so you can judge progress.',
      },
      {
        q: 'Is this useful for developers selling new projects?',
        a: 'Yes. Project launches generate searches for the development name, location and payment options. We make sure your project pages are indexed early, answer buyer questions and keep updating as phases release, rather than relying only on launch advertising. That earlier visibility also helps investors and overseas buyers who research a project long before they visit.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['local-seo', 'content-marketing', 'contractor-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'seo-for-doctors',
    path: '/seo-services/seo-for-doctors',
    name: 'SEO for Doctors',
    title: 'SEO for Doctors | Be Found by the Right Patients',
    description:
      'Ethical SEO for doctors and clinics: accurate condition pages, strong local profiles and trust signals that help patients find and choose you.',
    h1: 'SEO for doctors',
    intro:
      'SEO for doctors helps patients find your practice when they search for a symptom, a specialty or a nearby clinic. Health is a sensitive topic for search engines, so the work centres on accurate, clinician-reviewed content, visible credentials and consistent local profiles, never on exaggerated claims. Pages are written for patients first, with clear next steps for booking.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Healthcare',
    includes: [
      {
        title: 'Condition and treatment pages',
        body: 'Plain-language pages for the conditions you treat and the procedures you offer, written around real patient questions and reviewed by you before they go live. Each page names the clinician who reviewed it and the date, which supports trust.',
      },
      {
        title: 'Doctor profiles and credentials',
        body: 'Profile pages that state qualifications, registrations, specialties and hospital affiliations clearly, supported by Physician schema, so patients and search engines can verify who is behind the advice. We also link every profile to the services that doctor provides, so credentials sit beside the relevant treatments.',
      },
      {
        title: 'Clinic and map profile setup',
        body: 'Accurate Google Business Profile details, categories, hours, services and photos for each clinic, with consistent listings elsewhere so patients do not land on wrong phone numbers. We check duplicates created by old listings and merge or remove them, since patients often trust whichever number they find first.',
      },
      {
        title: 'Specialty and symptom research',
        body: 'Keyword work that separates people looking for self-care information from those ready to book, so pages are matched to intent instead of attracting irrelevant traffic. Pages for urgent symptoms point clearly to emergency care, and avoid suggesting that a website can replace medical advice.',
      },
      {
        title: 'Booking and telehealth paths',
        body: 'Clear appointment routes, whether by phone, form or online booking, plus dedicated pages for video consultations, with fast mobile pages where most patients arrive. We also review contact forms for clarity, so patients know how quickly a clinic will respond.',
      },
      {
        title: 'Privacy-aware measurement',
        body: 'Analytics set up so enquiries and bookings are measured without capturing sensitive health details, following the privacy rules that apply in the countries you serve. We recommend only consent-aware tracking, and report totals such as bookings and calls rather than personal records.',
      },
    ],
    steps: [
      {
        title: 'Practice and patient review',
        body: 'We map your specialties, locations and patient questions, then check your site, profiles and search presence against nearby competitors. Booking routes are reviewed at the same time.',
      },
      {
        title: 'Trust and accuracy fixes',
        body: 'We add credentials, review dates and clear authorship to key pages, correct inconsistent listings and remove thin or outdated content.',
      },
      {
        title: 'Clinical content plan',
        body: 'We draft pages and guides around what patients ask, send them for your clinical review, and publish only what you have approved.',
      },
      {
        title: 'Appointments and reporting',
        body: 'We track calls, booking requests and profile actions rather than traffic alone, and adjust the plan around the services you most want to grow.',
      },
    ],
    faq: [
      {
        q: 'Is SEO allowed for medical practices?',
        a: 'Yes, but medical advertising rules differ by country and by regulator. We keep content factual, avoid promises of outcomes and leave patient testimonials and before-and-after material to you to approve against your local rules. If in doubt, your regulator’s guidance comes first.',
      },
      {
        q: 'Will you write medical content without a doctor?',
        a: 'We research and draft, but every clinical page should be reviewed by a qualified clinician before publication. Search engines weigh expertise heavily on health topics, and patients deserve accurate information, so review and credit are part of the process. Where you offer different services at several locations, each gets its own page rather than sharing one.',
      },
      {
        q: 'Do we need separate pages for every condition?',
        a: 'Only for the conditions and treatments you actually offer and can explain well. A few strong pages usually beat dozens of thin ones. We start with your main services and expand as you see which pages bring appropriate enquiries. It depends on competition, so we focus on pages that match clear patient demand before expanding the programme.',
      },
      {
        q: 'Can SEO help a new clinic with no reviews?',
        a: 'It can help you set up accurate profiles, a clear site and an honest process for asking patients for feedback. Reputation takes time, though, and we do not suggest buying or inventing reviews, which platforms penalise. Where a procedure is not suitable for everyone, pages should say so, and encourage patients to seek a consultation.',
      },
      {
        q: 'How long does it take to see results?',
        a: 'Profile and technical fixes may improve visibility within weeks, while content and credibility build over months. Competition varies by specialty and city, so we do not promise timeframes. You will see monthly reports on visibility, calls and bookings. Reviews and replies are handled with care, never confirming whether a reviewer was a patient unless your rules allow it.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['seo-for-dentists', 'local-seo', 'content-marketing'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'seo-for-lawyers',
    path: '/seo-services/seo-for-lawyers',
    name: 'SEO for Lawyers',
    title: 'SEO for Lawyers | Practice Area and Local Search',
    description:
      'SEO for law firms built around practice areas and client trust: practice pages, attorney profiles and local visibility that respect bar advertising rules.',
    h1: 'SEO for lawyers',
    intro:
      'SEO for lawyers makes your firm visible when someone needs legal help and searches for it, often under stress and in a hurry. We structure your site around practice areas and the places you serve, show who your attorneys are, and keep every claim inside the advertising rules that apply to your bar or regulator.',
    icon: 'gavel',
    category: 'seo',
    hub: 'industry',
    tag: 'Legal',
    includes: [
      {
        title: 'Practice area page structure',
        body: 'One focused page per area of law, each answering what the problem is, what the process looks like and when to call, rather than a single page listing every service.',
      },
      {
        title: 'Location and jurisdiction pages',
        body: 'Pages for each city, court or jurisdiction you handle, with real detail about local procedure. We avoid copied city templates that add nothing for clients or for search engines. We also record which courts and filing offices matter to each practice, so pages show first-hand local knowledge.',
      },
      {
        title: 'Attorney biographies',
        body: 'Bios with admissions, education, memberships and areas of focus, linked to practice pages, so clients can see who will handle their matter and search engines can connect expertise to people.',
      },
      {
        title: 'Intent-based content',
        body: 'Guides for people early in a legal problem and pages for those ready to instruct, including FAQs on process, deadlines and what to bring to a first consultation. Each guide ends with a clear next step, whether that is a call, a form or a short intake questionnaire.',
      },
      {
        title: 'Firm profiles and legal directories',
        body: 'Accurate map profiles for each office and consistent entries in reputable legal directories, which help local visibility and give clients independent places to check you. Dates, addresses and practice descriptions match everywhere, which reduces confusion and strengthens trust with prospective clients.',
      },
      {
        title: 'Compliance-aware messaging',
        body: 'Pages reviewed against disclaimer, specialisation and results-claim rules, so nothing implies a guaranteed outcome or an attorney-client relationship before one exists. Cookie, consent and intake form wording is checked too, so enquiry forms do not collect more than needed.',
      },
    ],
    steps: [
      {
        title: 'Practice and market audit',
        body: 'We identify your most valuable matter types, check how your site is structured today and see who currently appears for those searches.',
      },
      {
        title: 'Restructure and clean up',
        body: 'We separate practice areas into dedicated pages, fix location and technical issues, and tidy office listings across the web. Duplicated pages are merged.',
      },
      {
        title: 'Authoritative content',
        body: 'We draft guides and FAQs for your attorneys to review, so the advice reflects how your firm actually handles cases.',
      },
      {
        title: 'Enquiry-level reporting',
        body: 'We track calls and contact forms by practice area and location, so you can see which pages bring the matters you want.',
      },
    ],
    faq: [
      {
        q: 'Do lawyers need different SEO from other businesses?',
        a: 'Largely yes. Legal is treated as a high-stakes topic, clients choose slowly and carefully, and advertising rules restrict what you can say. The work leans on clear authorship, credentials, practice area depth and local signals rather than volume of content.',
      },
      {
        q: 'Should we publish case results?',
        a: 'Only if your regulator allows it and you can present results accurately with the required context. We can show you how to structure such pages, but you and your compliance contact decide what is published. We never invent or exaggerate outcomes.',
      },
      {
        q: 'Can we rank in several cities from one site?',
        a: 'If you have a real presence or genuine capability in each place, yes, with distinct pages and profiles for each. Claiming offices you do not have can breach both search engine guidelines and professional rules, so we do not advise it.',
      },
      {
        q: 'Is SEO better than paid ads for law firms?',
        a: 'They do different jobs. Paid ads produce enquiries quickly but stop when the budget does, while SEO builds visibility over time. Many firms use both, and we can help you decide how much weight each deserves for your practice areas.',
      },
      {
        q: 'How soon can we expect new clients?',
        a: 'It depends on your practice area and the strength of competing firms. Some fixes show effects within weeks, but authority and rankings take months. We cannot guarantee instructions, and we report on enquiries so you can judge value. Practice areas with many competing firms usually take longer, while niche matters in a specific city can respond sooner.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['personal-injury-seo', 'professional-firms-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'restaurant-seo',
    path: '/seo-services/restaurant-seo',
    name: 'Restaurant SEO',
    title: 'Restaurant SEO Services | Fill More Tables',
    description:
      'Restaurant SEO focused on map results, crawlable menus, reviews and booking links, so hungry people nearby choose your tables over the next listing.',
    h1: 'Restaurant SEO services',
    intro:
      'Restaurant SEO gets your venue shown when people search for somewhere to eat, such as "brunch near me" or "halal steakhouse downtown". Most of that happens in map results and on mobile, so we concentrate on your map profile, crawlable menu, photos, reviews and the quickest route from search to booking or order.',
    icon: 'restaurant',
    category: 'seo',
    hub: 'industry',
    tag: 'Restaurants',
    includes: [
      {
        title: 'Map profile management',
        body: 'Categories, attributes, hours, holiday changes, menu links, dishes and photos are set up and kept accurate, because wrong opening hours cost more covers than most ranking issues. We also set up ordering and reservation buttons and product-style menu items where the platform supports them.',
      },
      {
        title: 'Crawlable menu pages',
        body: 'Menus published as real web text, not just a PDF or image, with dish names, ingredients and dietary notes, so searches for specific dishes and cuisines can find you. Seasonal and special menus get their own updated pages, so diners are never shown last year’s prices.',
      },
      {
        title: 'Booking and ordering paths',
        body: 'Reserve and order links placed where mobile visitors will tap them, tagged so you can see how many bookings came from search, and how many went to third-party platforms. We check that table, takeaway and catering enquiries all have a visible route on phones, where most diners decide.',
      },
      {
        title: 'Review growth and replies',
        body: 'A simple prompt for diners to leave honest reviews, plus a reply routine for praise and complaints that follows each platform’s policies. Where feedback mentions service or food issues, we flag recurring themes to you, since fixing them improves both reviews and repeat visits.',
      },
      {
        title: 'Cuisine and occasion content',
        body: 'Pages for private dining, events, set menus, catering or cuisine specialties such as halal or vegan, built around occasions people actually search for. Each page includes photos, capacity and booking details, which makes it easier to win group and corporate bookings.',
      },
      {
        title: 'Multi-location structure',
        body: 'Individual pages and profiles for each branch with its own menu variations, address, parking and booking details, linked from a clear locations hub. Where branches differ, such as opening hours on public holidays, those differences are shown accurately for each location.',
      },
    ],
    steps: [
      {
        title: 'Search and profile check',
        body: 'We look at how your venue appears in maps and search for dishes, cuisine and area, and compare it with nearby competitors.',
      },
      {
        title: 'Menu and site fixes',
        body: 'We convert menus to indexable pages, speed up mobile loading and make booking and call buttons obvious on every page.',
      },
      {
        title: 'Reviews and photos',
        body: 'We set up a routine for fresh photos, review requests and replies so your profile looks active and current to diners.',
      },
      {
        title: 'Bookings and covers',
        body: 'We report on calls, direction requests, reservations and orders, then adjust to the dayparts and branches that need more demand.',
      },
    ],
    faq: [
      {
        q: 'Why does my restaurant need SEO if I am on delivery apps?',
        a: 'Delivery and booking platforms take commission and own the customer relationship. SEO helps diners find your own site and map listing, where you keep the margin and the contact details. Most restaurants benefit from both channels rather than one. Delivery apps also rank for your name in many areas, so a well-optimised site helps you appear alongside them.',
      },
      {
        q: 'Does the menu really matter for search?',
        a: 'Yes. A menu locked in a PDF or image is hard for search engines to read, so searches for particular dishes may miss you. Publishing it as page text with accurate prices and dietary information helps diners and crawlers alike.',
      },
      {
        q: 'How do reviews affect local visibility?',
        a: 'Review quality, volume, recency and your replies all influence how you appear and whether people choose you. We help you ask fairly and respond professionally, but we never advise buying or writing fake reviews. We list dishes, descriptions, allergens and prices as page text, and mark up the menu where it helps search engines understand it.',
      },
      {
        q: 'Can SEO help a new restaurant?',
        a: 'Yes. A new venue can set up a complete map profile, an indexable menu and basic local citations before opening, so search users find you from week one. Reviews and reputation then build as real customers visit. Menus, hours, service styles, reviews and booking links need constant care, while general SEO rarely covers such detail.',
      },
      {
        q: 'How long until more people find us?',
        a: 'Correcting a map profile and menu can change visibility within weeks, but competitive dining areas take longer. We cannot promise specific positions, and we report on calls, directions and bookings so you see the practical impact. Replying calmly to criticism and following platform rules matters more than the star rating alone.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['local-seo', 'google-business-profile', 'food-delivery-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'hotel-seo',
    path: '/seo-services/hotel-seo',
    name: 'Hotel SEO',
    title: 'Hotel SEO Services | Grow Direct Bookings',
    description:
      'Hotel SEO that helps properties win direct bookings: room and offer pages, destination content, map profiles and multi-market targeting alongside OTAs.',
    h1: 'Hotel SEO services',
    intro:
      'Hotel SEO is about turning searches for a place to stay into bookings on your own site rather than on an online travel agency. We improve room and offer pages, destination content, map profiles and technical performance, and target the countries your guests actually travel from. We also review how reviews and rate listings influence the decision.',
    icon: 'hotel',
    category: 'seo',
    hub: 'industry',
    tag: 'Hospitality',
    includes: [
      {
        title: 'Room and rate page optimization',
        body: 'Each room type gets its own descriptive page with accurate amenities, photos and a clear path to the booking engine, so searches for specific stays lead to a direct booking.',
      },
      {
        title: 'Direct booking journey review',
        body: 'We check how search visitors move from landing page to booking engine, including mobile layout, rate display and tracking, so we can see where direct bookings are lost. Where direct rates differ from OTA prices, we make sure that benefit is visible to searchers, such as free cancellation.',
      },
      {
        title: 'Hotel profile and listings',
        body: 'A complete map profile with correct amenities, photos, rooms and links, plus consistent details across directories and review sites that guests consult before booking. Updates for seasonal openings, renovations and rate changes are made promptly, because inaccuracies quickly reduce guest trust.',
      },
      {
        title: 'Destination and event content',
        body: 'Guides to nearby attractions, conferences, weddings and seasonal events, which bring in travellers while they are still choosing where to stay. Content links back to your rooms and offers, so a reader planning a visit can book without leaving your site.',
      },
      {
        title: 'Multi-market and language setup',
        body: 'Hreflang and localised pages for the source markets that matter, such as guests from Europe, the Gulf or Asia, with currency and wording that fit each audience. Currency, date format and payment options are adjusted per market so guests do not hit surprises at checkout.',
      },
      {
        title: 'Meetings, weddings and group pages',
        body: 'Dedicated pages for venue hire and group stays, with capacity, layouts and enquiry forms, because these high-value bookings are often searched separately from rooms. Each page covers capacity, set-up options, catering, accessibility and photos, which are the details planners compare when shortlisting venues.',
      },
    ],
    steps: [
      {
        title: 'Channel and demand review',
        body: 'We look at what share of bookings come direct versus OTAs, which source markets matter and how your pages appear in search.',
      },
      {
        title: 'Page and booking fixes',
        body: 'We improve room, offer and facility pages, speed up the site and make the booking path clear on mobile and desktop.',
      },
      {
        title: 'Destination content',
        body: 'We publish guides and seasonal pages that match what guests research before booking, linked to the rooms and offers they might choose.',
      },
      {
        title: 'Direct booking reporting',
        body: 'We report on organic visits, booking engine entries and direct reservations, then refine around the seasons and markets you want to grow.',
      },
    ],
    faq: [
      {
        q: 'Can SEO really reduce our dependence on OTAs?',
        a: 'It can help. OTAs rank strongly for generic hotel searches, so the realistic gains are brand searches, specific room and feature queries, events and your own destination content. Over time this can shift some bookings to your site, but not all of them.',
      },
      {
        q: 'Do we still need paid search for our hotel?',
        a: 'Often yes, particularly for peak dates and brand protection. SEO and paid search complement each other. We help you see where organic visibility is already strong so you can decide where paid spend adds the most value. Branded and long-tail searches are usually the easiest place to start, followed by room types, events and local experiences.',
      },
      {
        q: 'How do reviews affect hotel SEO?',
        a: 'Reviews influence both rankings in map results and a guest’s decision to book. We help you respond consistently and ask guests for feedback at suitable moments, while following the rules of each review platform. We often review search term reports together, so you can pause paid spend where organic results already cover the demand.',
      },
      {
        q: 'Is a booking engine a problem for SEO?',
        a: 'It can be if it sits on another domain or loads content that cannot be crawled. We review how the engine is set up, how analytics tracks the handoff and whether rate or availability pages can be improved without breaking bookings.',
      },
      {
        q: 'How soon will direct bookings improve?',
        a: 'Technical and profile fixes can show effects within weeks, but travel searches are seasonal and competitive, so meaningful growth takes longer. We cannot guarantee numbers, and we report on bookings by channel so you can judge progress. Management responses, consistency and recent guest comments all matter, so we help you build a steady routine.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['travel-seo', 'local-seo', 'multilingual-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'fintech-seo',
    path: '/seo-services/fintech-seo',
    name: 'Fintech SEO',
    title: 'Fintech SEO Services | Build Trust and Sign-Ups',
    description:
      'SEO for payments, lending, wallets and money apps: compliant product pages, educational content and trust signals that grow qualified sign-ups.',
    h1: 'Fintech SEO services',
    intro:
      'Fintech SEO helps payment, lending, wallet and investment products get found by people comparing financial options. Search engines treat money topics as high-stakes, so the work combines product and comparison pages, plain-language education, visible regulatory information and a fast, secure site that earns trust before it asks for sign-ups. Search engines expect extra evidence of expertise here, so we build it into every page.',
    icon: 'account_balance',
    category: 'seo',
    hub: 'industry',
    tag: 'Fintech',
    includes: [
      {
        title: 'Product and feature pages',
        body: 'Pages for each product or use case, such as business payments or cross-border transfers, written around the problem solved, with eligibility, fees structure and next steps described clearly. Pages avoid unsupported superlatives and link to full terms, so claims are easy for compliance teams to check.',
      },
      {
        title: 'Educational and glossary content',
        body: 'Guides that explain financial concepts without jargon, reviewed for accuracy, so people researching a decision meet your brand before they compare providers. Every guide notes when it was last reviewed, and is updated when rules or products change.',
      },
      {
        title: 'Trust and regulatory signals',
        body: 'Licences, regulator names, security practices, team profiles and company details presented in obvious places, supporting both user confidence and the expertise search engines look for. We link each claim to its source, such as a regulator register entry, so users can confirm it themselves.',
      },
      {
        title: 'Comparison and alternative pages',
        body: 'Fair, accurate comparison pages for searches such as "wallet vs bank transfer", written with compliance review so claims about rates and features are supportable. Where a comparison could mislead, we add context and dates, because stale rate claims can create real regulatory risk.',
      },
      {
        title: 'App and web connection',
        body: 'Deep links, smart banners and landing pages that carry a search visitor into the app, and measurement that connects organic visits to sign-ups and verified accounts. We check that attribution survives app installs and handoffs, so organic sign-ups are not wrongly counted as direct.',
      },
      {
        title: 'Technical and security review',
        body: 'Checks on performance, secure delivery, crawl access to gated areas, JavaScript rendering and structured data, so important pages are indexed while account areas stay private. We also test how pages load on slower connections, since many users decide on mobile before installing anything.',
      },
    ],
    steps: [
      {
        title: 'Market and compliance scoping',
        body: 'We learn which jurisdictions and products you operate in, what wording is restricted, and who your searchers compare you with.',
      },
      {
        title: 'Foundation and trust fixes',
        body: 'We resolve technical issues and add the legal, licensing and team information that makes a financial site credible. Missing disclosures are added.',
      },
      {
        title: 'Reviewed content programme',
        body: 'We draft product, education and comparison content for your compliance team to approve before anything is published. Approved pages are then published steadily.',
      },
      {
        title: 'Sign-up measurement',
        body: 'We track organic visitors through to registrations and funded or verified accounts, then refine around the segments that convert. Funded and verified accounts are counted separately.',
      },
    ],
    faq: [
      {
        q: 'How is fintech SEO different from general SEO?',
        a: 'Financial pages are held to a higher standard of accuracy and trust, regulation limits what you can claim, and users hesitate before sharing personal data. That shapes the content, the proof you display and how closely legal teams are involved.',
      },
      {
        q: 'Do you work within financial promotion rules?',
        a: 'We write with them in mind, but compliance sign-off remains with your own legal team. Rules differ by country, so we ask which markets you serve, avoid guarantees and send content for approval before publishing. A page built for one country can mislead in another, so licences, wording and fees are kept market-specific.',
      },
      {
        q: 'Can SEO help a new payments app gain users?',
        a: 'It can bring in people who already search for the problem your app solves, such as sending money abroad or splitting bills. It works alongside product, referral and paid channels rather than replacing them, and trust building takes time. It depends on the stage of your product, and we would tell you if the search volume simply does not exist yet.',
      },
      {
        q: 'Can we target several countries?',
        a: 'Yes, if each market has its own licensing, pricing and language needs reflected on dedicated pages. We plan the site structure and hreflang accordingly and only create pages for countries where you can genuinely serve customers. We also look at which markets you are licensed in before creating any page aimed at that audience.',
      },
      {
        q: 'How long before we see sign-ups from SEO?',
        a: 'Competitive finance terms take time, and trust signals build gradually. Some technical and content fixes show effects in weeks. We cannot guarantee rankings, but we report organic sign-ups and assisted conversions so progress is visible. Intent also varies widely, from curious learners to customers ready to open an account, and pages must serve each honestly.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['saas-seo', 'financial-services-seo', 'startup-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'saas-seo',
    path: '/seo-services/saas-seo',
    name: 'SaaS SEO',
    title: 'SaaS SEO Services | Grow Trials and Demo Requests',
    description:
      'SaaS SEO built around use cases, integrations, comparisons and docs, with measurement tied to trials, demos and activated accounts instead of traffic.',
    h1: 'SaaS SEO services',
    intro:
      'SaaS SEO attracts software buyers at each stage, from people describing a problem to those comparing named vendors. We build use-case, integration, comparison and help content around your product, make sure a JavaScript-heavy site is crawlable, and measure success by trials, demos and activated accounts. Pages are written to be understood by evaluators, not only by search engines.',
    icon: 'hub',
    category: 'seo',
    hub: 'industry',
    tag: 'SaaS',
    includes: [
      {
        title: 'Use-case and solution pages',
        body: 'Pages that explain how the product solves a specific job for a specific team, so a searcher with a problem sees a direct answer rather than a generic feature list.',
      },
      {
        title: 'Integration and template pages',
        body: 'Pages for the tools you connect with and the templates you offer, each with real setup detail, which capture high-intent searches from people already using those tools. Each page includes real setup steps and screenshots, which is what makes it useful to someone trying to connect two tools.',
      },
      {
        title: 'Comparison and alternative content',
        body: 'Honest comparison and "alternative to" pages that state where you fit and where you do not, built for buyers narrowing a shortlist. We write them to be fair and verifiable, update them when competitors change, and avoid claims you could not defend.',
      },
      {
        title: 'Docs, help centre and glossary',
        body: 'Public documentation and glossary pages organised for search, with consistent internal links to product pages, so support content works as an acquisition channel too. Articles answer how-to questions with product-specific steps, which reduces support load and brings in users who already have the problem.',
      },
      {
        title: 'Rendering and site architecture',
        body: 'Audits of how your app, marketing site and docs are crawled and rendered, including subdomains, JavaScript content, canonical rules and any programmatic page sets. We also check that gated app areas stay out of the index while public documentation remains fully crawlable.',
      },
      {
        title: 'Funnel-based reporting',
        body: 'Organic traffic connected to sign-ups, product-qualified leads and demos, so you see which pages create pipeline rather than which ones simply collect visits. Where possible we report on product-qualified leads and expansion signals, so content is judged by revenue contribution.',
      },
    ],
    steps: [
      {
        title: 'Product and buyer mapping',
        body: 'We map your ideal customer, the jobs your product does and the vendors buyers compare, then audit how your site and docs perform.',
      },
      {
        title: 'Architecture and technical fixes',
        body: 'We settle site structure, rendering and indexing issues so new pages can be crawled, and so docs and blog support the product pages.',
      },
      {
        title: 'Page programme',
        body: 'We prioritise use-case, integration and comparison pages by likely revenue, and write them with input from your product and sales teams.',
      },
      {
        title: 'Pipeline measurement',
        body: 'We connect organic landing pages to trials and demos, review which topics convert and adjust the next quarter of content accordingly.',
      },
    ],
    faq: [
      {
        q: 'What makes SaaS SEO different?',
        a: 'Buyers often research for weeks, involve several people and compare many vendors. The goal is to appear across that journey with pages matching each question, and to judge results by pipeline and activation, not blog traffic alone. Evaluators also read reviews, pricing and security pages, so these should support your content and not be an afterthought.',
      },
      {
        q: 'Should we publish lots of programmatic pages?',
        a: 'Only if each page offers something genuinely useful, such as real integration steps or distinct template content. Thin pages generated at scale can harm a site, so we test small sets first and check indexing and engagement before expanding. We run smaller trials first, measure indexing and conversions, and expand only once the pattern holds.',
      },
      {
        q: 'Can you work with our product-led growth model?',
        a: 'Yes. For product-led teams we focus on pages that lead into free trials or freemium sign-ups, plus help content that supports onboarding. We measure activation rather than just registrations, if your analytics can provide it. We usually pair it with in-product prompts, so the visitors who reach your site continue on into the product.',
      },
      {
        q: 'How do you handle several products or plans?',
        a: 'Each product or major plan should have its own page matching its audience, with clear internal links between them, so pages do not compete for the same searches. We map this structure before writing new content. Sub-pages for different industries or roles can help, as long as each answers a distinct need.',
      },
      {
        q: 'How long until SEO produces trials?',
        a: 'Technical fixes and bottom-of-funnel pages can show returns sooner than broad educational content. Timing still depends on competition and your domain’s strength, so we do not promise specific rankings, only transparent reporting. Content that answers late-stage questions about pricing, migration or security often shows returns earlier than broader educational posts.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['it-company-seo', 'startup-seo', 'content-marketing'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'it-company-seo',
    path: '/seo-services/it-company-seo',
    name: 'IT Company SEO',
    title: 'IT Company SEO | Win Qualified Technology Leads',
    description:
      'SEO for IT service providers and software houses: service and industry pages, proof of delivery and content that reaches buyers choosing a technology partner.',
    h1: 'SEO for IT companies',
    intro:
      'SEO for IT companies helps software houses, managed service providers and consultancies appear when businesses look for a technology partner. Buyers search by service, stack and industry, then check proof before getting in touch, so we build service pages, case content and authority signals around that decision. We also check the pages that buyers visit to confirm you are reliable.',
    icon: 'lan',
    category: 'seo',
    hub: 'industry',
    tag: 'IT Services',
    includes: [
      {
        title: 'Service line pages',
        body: 'Separate pages for each offering, such as custom software, cloud migration, managed IT or cybersecurity, written for the buyer’s problem and including scope, engagement models and next steps. We also add engagement models, team size ranges you are willing to state, and a way to request a scoped proposal.',
      },
      {
        title: 'Technology and industry pages',
        body: 'Pages pairing your stack or sector experience with buyer needs, such as healthcare software or ERP integration, so specific searches land on relevant proof. These pages reflect real delivery, so if you have not worked in a sector, we recommend leaving it out.',
      },
      {
        title: 'Case study optimization',
        body: 'We structure your real client projects as searchable case studies covering problem, approach and outcomes. You supply the facts and permissions; we shape them so they persuade and rank. Where numbers are shared, they should come from you and be easy to verify, which is more persuasive than vague promises.',
      },
      {
        title: 'Vendor-selection content',
        body: 'Guides on choosing a development partner, outsourcing models, project costs factors and migration planning, which meet buyers while they build a shortlist. Content is reviewed by your engineers or account leads, so the advice reflects how your team actually delivers.',
      },
      {
        title: 'Authority and review signals',
        body: 'Profiles on respected B2B review sites and technology directories, expert articles and mentions that show you are a real, accountable team. Where your team has real expertise, bylines and speaker profiles help buyers see the people behind the company.',
      },
      {
        title: 'Technical foundation',
        body: 'Site speed, clean architecture, structured data and an easy contact path, because technical buyers judge a technology firm by how well its own website works. We also check security headers, uptime and accessibility basics, since an IT firm’s own site is read as a sample of its work.',
      },
    ],
    steps: [
      {
        title: 'Offer and buyer review',
        body: 'We identify the services you most want to sell, who buys them and which searches those buyers use at each stage.',
      },
      {
        title: 'Service page rebuild',
        body: 'We restructure your site around clear service, industry and technology pages and fix the technical issues holding them back. Redirects protect existing authority.',
      },
      {
        title: 'Proof and thought leadership',
        body: 'We turn real projects into case studies and publish expert content from your engineers and leaders, with their input and approval.',
      },
      {
        title: 'Lead quality tracking',
        body: 'We track enquiries by source and service, review their quality with your sales team and adjust toward the work you want more of.',
      },
    ],
    faq: [
      {
        q: 'How is IT company SEO different from SaaS SEO?',
        a: 'IT service buyers hire a team for a project or ongoing support, while SaaS buyers adopt a product. That changes the pages: services, process, proof and trust for IT firms, versus features, integrations and trials for SaaS companies. Another difference is buyer type: a CTO might compare engineering depth, while a business owner wants clarity on cost and risk.',
      },
      {
        q: 'Do we need case studies?',
        a: 'They help a lot, because buyers want evidence of delivery. If client confidentiality limits detail, we can anonymise sector and results where agreed. We only write what you can support, and never invent clients or outcomes. We then discuss ways to evidence results through references, ratings or certifications instead of private detail.',
      },
      {
        q: 'Can we target clients in other countries?',
        a: 'Yes. Many IT firms sell across borders, so we plan pages for specific regions where you have capacity, adapt wording for each market and avoid implying a local office you do not have. Regional pages should reflect where you can truly deliver, using local legal and language details where relevant.',
      },
      {
        q: 'Will SEO bring enquiries or just visitors?',
        a: 'The aim is enquiries from buyers with a real project. We focus on service and decision-stage searches, track form submissions and calls, and review lead quality with you so we do not optimise for traffic that never converts. That includes reviewing form quality, response times and how sales follows up, because slow replies lose good leads.',
      },
      {
        q: 'How long does it take?',
        a: 'Competitive terms like software development take months to build visibility, while narrower service and industry searches can respond sooner. We cannot promise rankings, but we give you clear monthly reporting on visibility and leads. Some of the strongest early gains come from tightening service pages, which usually moves faster than building new authority.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['saas-seo', 'startup-seo', 'seo-consulting'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'fashion-seo',
    path: '/seo-services/fashion-seo',
    name: 'Fashion SEO',
    title: 'Fashion SEO Services | Visibility for Apparel Brands',
    description:
      'Fashion SEO for brands and boutiques: collection and seasonal pages, image search, size and style content, and stock handling that keeps pages fresh.',
    h1: 'Fashion SEO services',
    intro:
      'Fashion SEO helps clothing, footwear and accessory brands get found while people look for style ideas and specific pieces. Because collections change each season and shoppers lean on images, the work focuses on collection pages that persist, image search, trend content and tidy handling of sold-out or retired products. We handle seasonal churn so effort invested in one collection is not lost.',
    icon: 'shopping_bag',
    category: 'seo',
    hub: 'industry',
    tag: 'Fashion',
    includes: [
      {
        title: 'Collection and category structure',
        body: 'Evergreen category pages, such as dresses or sneakers, that keep their history across seasons, with seasonal collections layered on top rather than replacing them every launch. Old seasonal pages are redirected or archived according to clear rules, instead of being deleted without a trace.',
      },
      {
        title: 'Image search optimization',
        body: 'Descriptive file names, alt text, sized and compressed images and image sitemaps, since many shoppers discover garments through visual search before they read any copy. Good images also improve product page speed when formats and dimensions are right, which helps mobile shoppers.',
      },
      {
        title: 'Seasonal and occasion planning',
        body: 'A calendar for festive seasons, weddings, sales and weather shifts, so landing pages are live and indexed before demand peaks instead of arriving as it ends. Pages are refreshed each year with new stock, so accumulated links and history are kept.',
      },
      {
        title: 'Size, fit and care content',
        body: 'Size guides, fit notes, fabric and care information that answer purchase doubts, reduce returns and give product pages the depth to compete with larger retailers. Where products are made-to-measure, we include measurement guidance and fabric notes to reduce hesitation.',
      },
      {
        title: 'Variant and faceted navigation control',
        body: 'Colour, size and filter URLs reviewed so useful combinations such as black midi dresses can be indexed while endless filter URLs are kept out of search. We also keep pagination and sorting from generating endless duplicate URLs that dilute your category pages.',
      },
      {
        title: 'Style editorials and lookbooks',
        body: 'Style guides, trend explainers and lookbooks linked to products, which attract inspiration searches and give publishers and creators something worth referencing. Each editorial links to the exact products featured, turning inspiration searches into potential sales.',
      },
    ],
    steps: [
      {
        title: 'Catalogue and demand audit',
        body: 'We review your categories, product pages, images and seasonal patterns against how shoppers search for your kind of fashion. We also check how sold-out items are handled.',
      },
      {
        title: 'Structure and stock rules',
        body: 'We fix category hierarchy, variant URLs and out-of-stock handling so pages keep value as items sell out and collections rotate.',
      },
      {
        title: 'Content and imagery',
        body: 'We improve product copy, size guidance and image optimization, then publish lookbooks and editorials tied to upcoming drops. Each piece is tied to a launch date.',
      },
      {
        title: 'Sales-led reporting',
        body: 'We report organic revenue by category and season, and use it to plan the next collection’s search work earlier. Category revenue guides priorities.',
      },
    ],
    faq: [
      {
        q: 'What do I do with sold-out products?',
        a: 'It depends on whether the item will return. Temporarily unavailable products can stay live with a restock option, while discontinued ones may redirect to the nearest category or similar style. We set clear rules so you avoid dead ends and lost authority.',
      },
      {
        q: 'How is fashion SEO different from general ecommerce SEO?',
        a: 'Fashion has fast-changing stock, strong seasonality, heavy reliance on images and trend-driven searches. The core ecommerce foundations still apply, but planning, category design and content have to account for rotating collections. Others, like final sale items or limited editions, may need a note and a link to similar styles, so the page still helps customers.',
      },
      {
        q: 'Do influencer collaborations help SEO?',
        a: 'They can, indirectly, through brand searches and links when creators publish on sites that allow them. Their main value is awareness. We can help you make sure any collaboration points to pages that are ready to convert visitors. Rules differ by market, so any gifted or paid content should be disclosed properly to avoid problems.',
      },
      {
        q: 'Can SEO support our big sale periods?',
        a: 'Yes, if sale and seasonal pages are planned well ahead and reused each year, not created and deleted. Stable sale URLs build history, and we prepare content and internal links before demand rises. We then keep a historical record of each season, so next year’s plan is quicker and more accurate.',
      },
      {
        q: 'How long until results appear?',
        a: 'Technical and structural improvements may be picked up within weeks, while competing for broad fashion terms takes longer. We cannot guarantee positions, but we show category-level traffic and sales so you can track real movement. These variations influence how shoppers phrase searches, so we adjust templates and content to match.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['ecommerce-seo', 'seo-for-online-stores', 'content-marketing'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'travel-seo',
    path: '/seo-services/travel-seo',
    name: 'Travel SEO',
    title: 'Travel SEO Services | Grow Tour and Trip Bookings',
    description:
      'SEO for travel agencies, tour operators and booking sites: destination guides, itineraries, trust signals and seasonal planning that capture travellers early.',
    h1: 'Travel SEO services',
    intro:
      'Travel SEO puts your agency, tours or booking site in front of people while they are still choosing where to go. Trips are researched for weeks, so we build destination guides, itineraries and tour pages for each stage, show proof you can be trusted with a booking, and plan content around travel seasons.',
    icon: 'flight_takeoff',
    category: 'seo',
    hub: 'industry',
    tag: 'Travel',
    includes: [
      {
        title: 'Destination guides',
        body: 'In-depth guides to places, with first-hand details on when to go, what it costs in general terms and what to see, linked to the trips you sell. We add practical sections such as visa notes, local transport and safety points, which travellers look for before booking.',
      },
      {
        title: 'Tour and itinerary pages',
        body: 'Pages for each tour or package with day-by-day plans, inclusions, exclusions, departure details and clear booking steps, marked up so search engines can read the key facts. Departure dates, group sizes and pricing structure are shown clearly, with a prominent enquiry or booking button.',
      },
      {
        title: 'Seasonal content calendar',
        body: 'Content published months ahead of peak booking windows, such as summer holidays or pilgrimage seasons, so pages have time to be indexed before searches rise. We also refresh older guides each year so prices, openings and travel conditions never look stale.',
      },
      {
        title: 'Trust and booking confidence',
        body: 'Licences, memberships, refund and cancellation terms, traveller reviews and contact details placed where a nervous buyer will look before paying a deposit. Where you handle pilgrim, family or group travel, we describe supervision, support and emergency contacts clearly.',
      },
      {
        title: 'Large inventory handling',
        body: 'For sites with thousands of tours or hotels, we control faceted search, duplicate content and crawl waste, so priority destinations are the ones that get indexed and refreshed. We also reduce duplicate descriptions that arrive from suppliers, so your pages offer something other sites cannot.',
      },
      {
        title: 'Source-market targeting',
        body: 'Pages and language versions for the markets your travellers come from, with correct currency and hreflang, since a visitor from one country searches differently from another. Payment methods and support hours are adapted to each market, so visitors from abroad feel confident to proceed.',
      },
    ],
    steps: [
      {
        title: 'Destination and demand map',
        body: 'We list the destinations, trip types and traveller markets you serve and compare them with search demand and current competitors.',
      },
      {
        title: 'Site and inventory fixes',
        body: 'We tidy tour page templates, search filters and technical issues so your best trips are easy to crawl and understand.',
      },
      {
        title: 'Guides and trip content',
        body: 'We produce destination guides and itineraries with your guides’ input, scheduled ahead of each booking season. Seasonal publishing dates are set early.',
      },
      {
        title: 'Booking attribution',
        body: 'We link organic visits to enquiries and bookings, even when the sale closes by phone or message, and adjust toward the trips that sell.',
      },
    ],
    faq: [
      {
        q: 'Why does travel SEO need long lead times?',
        a: 'Travellers research and compare for weeks or months before booking, and search interest peaks at predictable times. Content needs to be indexed and established ahead of those peaks, so we plan work well before each season rather than reacting to it.',
      },
      {
        q: 'Can a small operator compete with large booking sites?',
        a: 'Not on every broad destination term, but you can on niche trips, local knowledge, specific itineraries and brand searches. Small operators often win with specialised, first-hand content that large aggregators cannot easily imitate. Reviews, genuine photos and clear terms also help a smaller brand look as reliable as a larger one.',
      },
      {
        q: 'How do you handle thousands of tour or hotel pages?',
        a: 'We prioritise by revenue and demand, block or consolidate low-value filter pages and make sure key pages have unique descriptions. Scale is manageable when templates, internal links and indexing rules are planned deliberately. We also set clear templates for descriptions and rules for pagination, to keep indexed pages useful.',
      },
      {
        q: 'Does the travel agency need local SEO too?',
        a: 'If customers visit an office or you serve a city, yes. A complete map profile, reviews and local pages help nearby customers find you. Online-only operators can skip this and focus on destination and trip content. Travel purchases involve trust, so reviews and clear local contact information are valuable for all operators.',
      },
      {
        q: 'How do we measure success?',
        a: 'We look at organic enquiries and bookings, visibility for target destinations and which guides lead into trip pages. Because travel purchases often involve phone or chat, we agree how to capture those leads before starting. We also look at assisted conversions, since many travellers visit several times before booking.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['hotel-seo', 'multilingual-seo', 'content-marketing'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'startup-seo',
    path: '/seo-services/startup-seo',
    name: 'Startup SEO',
    title: 'Startup SEO Services | Early Traffic Without Waste',
    description:
      'SEO for early-stage companies with small budgets: sound site foundations, winnable keywords and content that compounds while you find product-market fit.',
    h1: 'SEO for startups',
    intro:
      'SEO for startups is about spending limited time and money on the searches you can realistically win. A new company has no authority and an evolving product, so we set up a clean site, choose narrow, high-intent topics first and build content that compounds instead of chasing broad terms dominated by established brands.',
    icon: 'rocket_launch',
    category: 'seo',
    hub: 'industry',
    tag: 'Startups',
    includes: [
      {
        title: 'Launch-ready site foundation',
        body: 'URL structure, metadata, analytics, indexing and speed set up correctly before launch, so you avoid costly migrations and lost history after the product pivots or grows. We also set up a simple measurement plan from day one, which saves a lot of cleaning up later.',
      },
      {
        title: 'Winnable keyword selection',
        body: 'Research that favours specific, lower-competition searches with clear buyer intent, so early content can rank and bring useful signals while you build brand and links. We also look at how Google already treats those searches, so you do not spend months aiming at results you cannot realistically reach.',
      },
      {
        title: 'Founder-led content plan',
        body: 'A small set of strong articles and pages drawn from the founders’ real knowledge and customer conversations, which is often more credible than generic content from outsiders. We interview founders and customer-facing staff, then shape the material into useful pages and avoid generic filler.',
      },
      {
        title: 'Positioning and messaging pages',
        body: 'Homepage, product and use-case pages tested against how customers describe their problem, so search visitors recognise the offer quickly and know what to do next. Pages are written in the customer’s own words, so visitors who arrive from search quickly see they are in the right place.',
      },
      {
        title: 'Early authority building',
        body: 'Launch listings, relevant directories, founder interviews and partnerships that earn first links and mentions without wasting budget on low-quality schemes. We keep the list short and relevant, and aim for mentions from sites your customers actually read.',
      },
      {
        title: 'Lean measurement setup',
        body: 'Simple dashboards tracking sign-ups, demos or sales by landing page, so a small team can see what works without a heavy analytics stack. The aim is a monthly view you can read in minutes, covering what grew, what stalled and what to try next.',
      },
    ],
    steps: [
      {
        title: 'Stage and goal check',
        body: 'We learn your stage, runway and target customer, then agree what organic search can realistically contribute in the first six to twelve months.',
      },
      {
        title: 'Foundation sprint',
        body: 'We fix the essentials in one focused push: structure, tracking, core pages and technical settings that are hard to change later.',
      },
      {
        title: 'Focused content cycles',
        body: 'We publish in small cycles aimed at the most promising topics, review early signals and drop what does not perform.',
      },
      {
        title: 'Review and scale',
        body: 'Each quarter we decide whether to expand, pause or reshape the plan around funding, product changes and what is converting.',
      },
    ],
    faq: [
      {
        q: 'Is SEO worth it for a very young company?',
        a: 'Often, but it is slower than paid channels and depends on your market. It suits startups with a clear problem people already search for. If demand does not exist yet, we will say so and suggest where to spend effort instead.',
      },
      {
        q: 'Can SEO replace paid acquisition?',
        a: 'Rarely at the start. Paid channels give fast data and traffic, while SEO builds more slowly but keeps paying back. Most startups combine them, and the mix shifts as organic pages gain traction. Paid campaigns can also help validate keywords and messages before you invest in longer organic content.',
      },
      {
        q: 'Do we need an in-house SEO hire?',
        a: 'Not necessarily at the beginning. An external team can set direction and build the foundation, while your team supplies product knowledge. As volume grows, you may bring parts in-house, and we can hand over documentation. Whoever does the work, someone on your side should own priorities and approve claims, because founders know the product best.',
      },
      {
        q: 'What if our market is very competitive?',
        a: 'We avoid competing head on for broad terms. We look for narrower segments, specific use cases and questions that established players ignore, build credibility there and expand outward as the site gains authority. We prioritise intent over volume, which often reveals questions that larger competitors have not answered well.',
      },
      {
        q: 'How soon should we expect traffic?',
        a: 'New sites usually need several months before search engines trust them, though narrow topics can move sooner. We cannot guarantee numbers. We will share leading indicators, such as indexed pages and impressions, alongside sign-ups. Early on, you will see leading indicators first, such as pages indexed and impressions, then clicks and conversions follow.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['saas-seo', 'seo-consulting', 'content-marketing'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'seo-for-dentists',
    path: '/seo-services/seo-for-dentists',
    name: 'SEO for Dentists',
    title: 'SEO for Dentists | More New Patient Enquiries',
    description:
      'Dental SEO for practices of any size: treatment pages, emergency and new-patient searches, map visibility and reviews that fill the appointment book.',
    h1: 'SEO for dentists',
    intro:
      'SEO for dentists helps your practice appear when people nearby look for a dentist, a treatment or urgent care. Patients usually pick someone close, compare reviews and call quickly, so we focus on your map profile, treatment pages, new-patient routes and the evidence of care that persuades someone to book.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Dental',
    includes: [
      {
        title: 'Treatment page optimization',
        body: 'Individual pages for general care, implants, aligners, whitening and cosmetic work, each describing what happens, who it suits and what to ask, without overpromising results. Each page links to booking and shows the clinician or team who provides the treatment.',
      },
      {
        title: 'Emergency and new-patient pages',
        body: 'Pages for urgent searches such as toothache, plus a simple new-patient page covering how to book, opening hours, what to bring and what a first visit involves. Opening hours, out-of-hours information and emergency contact options are displayed clearly, since delay costs patients and appointments.',
      },
      {
        title: 'Practice map profile',
        body: 'A fully completed profile with services, categories, photos, team and booking link, kept current so searchers see accurate hours and can call or get directions at once. We keep listings consistent across directories, so patients searching from different apps find the same details.',
      },
      {
        title: 'Review and reputation routine',
        body: 'A consistent way to ask satisfied patients for feedback and to reply thoughtfully to every review, handling comments in line with patient privacy rules. Responses are factual and calm, and we recommend never confirming that a reviewer was a patient unless your rules permit it.',
      },
      {
        title: 'Insurance and payment information',
        body: 'Clear pages on accepted insurers, payment plans and consultation options, which answer a question many patients check before calling. We also add typical options for patients without insurance, such as phased treatment or consultation visits.',
      },
      {
        title: 'Dentist profiles and trust signals',
        body: 'Profiles for each clinician with registration details, training and interests, plus practice photos, which help nervous patients feel comfortable before the first visit. We also add team photos and short introductions, which help anxious patients feel more comfortable before they visit.',
      },
    ],
    steps: [
      {
        title: 'Practice and area review',
        body: 'We check your site and map presence against nearby practices, noting the treatments you most want to grow. Opening hours are verified too.',
      },
      {
        title: 'Profile and page fixes',
        body: 'We update your map profile, fix site issues and rewrite thin treatment pages so each has a clear job. We also correct duplicate listings.',
      },
      {
        title: 'Patient-focused content',
        body: 'We add patient guides and answers to common anxieties, written for your review so clinical details are accurate. Each draft goes through your review.',
      },
      {
        title: 'Appointment tracking',
        body: 'We track calls, direction requests and booking forms by source, then focus on the treatments and locations that need more demand.',
      },
    ],
    faq: [
      {
        q: 'What matters most for dental SEO?',
        a: 'For most practices, a strong, accurate map profile, good reviews and clear treatment pages matter most, supported by a fast mobile site. Because patients search near home or work, location relevance is usually the biggest factor. Mobile speed and easy booking then decide whether that interest becomes an appointment, so we review both.',
      },
      {
        q: 'Can you promote specific treatments like implants?',
        a: 'Yes. Higher-value treatments deserve dedicated pages that explain the process, suitability and what is involved. We write them factually and for your clinical review, and avoid claims that could breach dental advertising guidance in your country. Pages also include safety information and alternatives where appropriate, so patients receive a balanced picture.',
      },
      {
        q: 'Can I use before-and-after photos?',
        a: 'Rules vary, and they require patient consent and accurate context. We can structure a gallery in a way that fits search, but you decide what to publish after checking your regulator’s requirements and your own consent records. If you decline, we simply create a gallery of treatment descriptions and team photos instead.',
      },
      {
        q: 'Do several branches need separate pages?',
        a: 'Yes. Each practice should have its own location page and map profile, with distinct details such as address, team and parking. A single page covering all sites rarely works for local searches. Each branch also needs a distinct description of the team, parking and transport, to give local searchers confidence.',
      },
      {
        q: 'How soon will we see new patients?',
        a: 'Fixes to a map profile and site can improve visibility within weeks, but crowded areas take longer. We cannot guarantee rankings. You will see calls, requests and profile actions each month, so you can judge the return. Because patients choose by distance, results vary by area, and we explain realistic expectations early on.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['seo-for-doctors', 'local-seo', 'google-business-profile'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'education-seo',
    path: '/seo-services/education-seo',
    name: 'Education SEO',
    title: 'Education SEO | Higher Education Enrollment Search',
    description:
      'SEO for universities and colleges: programme pages, admissions content and international student targeting that bring qualified applicants to your site.',
    h1: 'Education SEO services',
    intro:
      'Education SEO helps universities and colleges reach prospective students while they research programmes, fees and admissions. Large institutional sites often split across departments and subdomains, so the work is to organise programme pages, keep admissions information current and target applicants in the countries you recruit from. Content is checked with admissions teams, so figures and dates remain accurate.',
    icon: 'school',
    category: 'seo',
    hub: 'industry',
    tag: 'Education',
    includes: [
      {
        title: 'Programme page optimization',
        body: 'Each degree or course gets a page with entry requirements, duration, curriculum, outcomes and apply steps in a consistent template, supported by structured data for courses. We also add comparison tables and common questions, so applicants can decide without opening a dozen tabs.',
      },
      {
        title: 'Admissions content and deadlines',
        body: 'Pages for application steps, scholarships, fees, intakes and deadlines that are kept current each cycle, so applicants never meet outdated dates from an old cached page. We archive old cycles properly, so applicants do not mistake last year’s requirements for current ones.',
      },
      {
        title: 'Department and subdomain structure',
        body: 'A review of how faculties, departments and microsites relate, with consistent navigation, canonical rules and links, so authority is shared across the institution. We also set rules for new microsites, so campaigns do not splinter the institution’s authority into dozens of small sites.',
      },
      {
        title: 'International student targeting',
        body: 'Country-specific guides on visas, recognition of qualifications and living costs, and hreflang where translated versions exist, for applicants searching from abroad. We write them with admissions input, using real examples and links to official sources, so applicants trust the guidance.',
      },
      {
        title: 'Faculty and research visibility',
        body: 'Staff profiles, publications and research centre pages structured so expertise is visible, which supports reputation and attracts postgraduates and research partners. Profiles are kept current as staff move, and link to the courses they teach and research groups they lead.',
      },
      {
        title: 'Open day and enquiry funnels',
        body: 'Landing pages for open days, virtual tours and prospectus requests, with tracking from search visit to enquiry and application started. Registration forms are kept short, and thank-you pages are tracked so you can measure how many prospects continue to apply.',
      },
    ],
    steps: [
      {
        title: 'Recruitment and site audit',
        body: 'We learn your priority programmes and recruitment markets, then audit how departments, programme pages and subdomains perform in search. We also check seasonal intake patterns.',
      },
      {
        title: 'Structure and template fixes',
        body: 'We standardise programme templates, resolve duplicate or outdated pages and fix technical problems across the institution’s web estate. Old cycles are archived.',
      },
      {
        title: 'Applicant-focused content',
        body: 'We write or improve programme, admissions and student life content, working with admissions and faculty teams to keep it accurate.',
      },
      {
        title: 'Application funnel reporting',
        body: 'We track organic visitors through enquiries, applications started and open day registrations, and report by programme and country. Reports separate domestic and international applicants.',
      },
    ],
    faq: [
      {
        q: 'Which searches should a university target?',
        a: 'Typically programme names with locations or modes of study, entry requirements, scholarships, fees and student life questions. We use search data and your admissions enquiry patterns to pick the programmes where visibility will help most. Each department may need a different timeline, so we agree which programmes to prioritise before starting.',
      },
      {
        q: 'Do rankings and league tables depend on SEO?',
        a: 'No. Official rankings use their own criteria, though a clear, credible web presence supports reputation and discoverability. SEO helps applicants find accurate information about you; it does not change academic standing. Pages also need to show accreditation and outcomes honestly, since applicants and parents compare institutions carefully.',
      },
      {
        q: 'How do you handle many departments and sites?',
        a: 'We start by mapping the estate, then agree shared standards for templates, metadata, redirects and internal links. Governance matters as much as technique here, so we provide guidelines your content teams can follow. Paid campaigns can fill short-term gaps, and we can show which programmes already attract steady organic interest.',
      },
      {
        q: 'Can SEO replace paid recruitment campaigns?',
        a: 'It usually complements them. Paid campaigns are quick and targeted for intakes, while organic search captures steady research traffic all year. We can help you see which programmes already get organic interest before deciding spend. Cycle timing, scholarships and fee deadlines also shape when you should refresh content, so we schedule updates ahead of each intake.',
      },
      {
        q: 'How long does it take?',
        a: 'Fixing outdated pages and templates can show effects in weeks, while competing for popular programme searches takes longer. Because admissions are cyclical, we plan around intakes. We cannot promise rankings or enrolment numbers. Any public ranking claims should be factual and cited, so we check how they are presented on your pages.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['multilingual-seo', 'enterprise-seo', 'content-marketing'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'manufacturing-seo',
    path: '/seo-services/manufacturing-seo',
    name: 'Manufacturing SEO',
    title: 'Manufacturing SEO | Reach Industrial Buyers Online',
    description:
      'SEO for manufacturers and factories: product and specification pages, catalogue content, certifications and RFQ paths that reach engineers and buyers.',
    h1: 'Manufacturing SEO services',
    intro:
      'Manufacturing SEO helps factories and producers get found by engineers, buyers and distributors who search with specifications, standards and part numbers. We turn catalogues and data sheets into searchable pages, show certifications and capacity clearly, and make requesting a quote simple for procurement teams. Pages are written for technical readers who will compare several suppliers before contacting one.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Manufacturing',
    includes: [
      {
        title: 'Product and specification pages',
        body: 'Pages for each product or range with materials, dimensions, tolerances, standards and applications written out as text, not buried in downloadable files that search engines read poorly. Tables for sizes, grades and standards are structured so they are easy to read on a phone as well as a desktop.',
      },
      {
        title: 'Catalogue and data sheet handling',
        body: 'PDFs and CAD files organised, named and linked from their product pages, with the key details repeated on the page so technical buyers find them through search. We add descriptive names to each file, plus links to the products they relate to.',
      },
      {
        title: 'Capability and certification pages',
        body: 'Clear pages on production capacity, quality systems, test processes and certifications, which procurement teams check when they build a supplier shortlist. We add photos of your facility and equipment, which gives reassurance to buyers who cannot visit before ordering.',
      },
      {
        title: 'Application and industry content',
        body: 'Guides explaining how your products are used in specific sectors, such as construction or packaging, written in the vocabulary engineers actually search with. We validate the topics with your sales and engineering teams, so content matches the questions buyers ask in real calls.',
      },
      {
        title: 'RFQ and sample request paths',
        body: 'Quote forms that capture the details sales teams need, such as quantity and specification, and tracking that shows which pages generate serious enquiries. We also set up automatic confirmations and notifications, so enquiries are not lost between the website and your sales inbox.',
      },
      {
        title: 'Export and distributor visibility',
        body: 'Pages and language versions for target export markets, plus accurate listings in trade directories and B2B marketplaces that foreign buyers use to find suppliers. We check shipping terms, units and contact details for each market, so overseas buyers can see you are ready to export.',
      },
    ],
    steps: [
      {
        title: 'Product and buyer review',
        body: 'We map your product lines, who specifies and buys them, and the search terms used, including part numbers and standards.',
      },
      {
        title: 'Catalogue to web',
        body: 'We turn catalogue content into structured product pages and fix technical issues on legacy sites with large product trees. Old catalogue links are redirected.',
      },
      {
        title: 'Technical content',
        body: 'We publish application notes, comparison guides and capability content with your engineers’ input, so buyers can verify your expertise. Each article includes a quote path.',
      },
      {
        title: 'Quote request tracking',
        body: 'We track RFQs, sample requests and calls by product line and market, then focus on the lines that win profitable orders.',
      },
    ],
    faq: [
      {
        q: 'Why is manufacturing SEO different?',
        a: 'Buyers are technical, orders are large and decisions involve several people. Searches are specific, such as a material grade or standard, and volumes are low. The focus is on precise, detailed pages and credibility rather than broad traffic. It also tends to have longer sales cycles, so tracking assisted leads matters as much as final orders.',
      },
      {
        q: 'Should our catalogue stay as a PDF?',
        a: 'Keep the PDF for download, but also publish the key details as web pages. Search engines index text pages more reliably, and buyers on mobile find them easier to use. Each PDF should link to and from its relevant product page.',
      },
      {
        q: 'Can SEO help us find export customers?',
        a: 'It can raise your visibility with buyers abroad who search for suppliers in your category. That means market-specific pages, trade directory profiles and clear information on shipping, certifications and minimum orders. We also check that language, units and certifications suit each market, so enquiries come from buyers you can serve.',
      },
      {
        q: 'Do B2B marketplaces replace SEO?',
        a: 'Marketplaces can bring enquiries but you compete on their terms and they hold the relationship. SEO builds an asset you control. Many manufacturers use both, and we can help you balance them. Many firms get a few direct orders from search, but a strong profile also supports sales conversations and tenders.',
      },
      {
        q: 'How do we measure success?',
        a: 'We track quote requests, sample requests, calls and qualified leads by product line, not only visits. With long sales cycles, we also review assisted conversions and agree with your sales team how to follow up leads. Qualified inquiries, repeat contact and brand searches also show growth, even when lead volume is small.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['industrial-seo', 'international-seo', 'lead-generation-seo'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'contractor-seo',
    path: '/seo-services/contractor-seo',
    name: 'Contractor SEO',
    title: 'Contractor SEO Services | Win More Project Leads',
    description:
      'SEO for building, renovation and construction contractors: service-area pages, project portfolios, licence proof and map visibility that bring quote requests.',
    h1: 'Contractor SEO services',
    intro:
      'Contractor SEO helps building, renovation and construction firms win quote requests from property owners and commercial clients in their service area. Customers compare several firms for large projects, so we pair local map visibility with project portfolios, licence and insurance proof, and service pages for each type of job. We also help you present licences and past work, which clients check before calling.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Contractors',
    includes: [
      {
        title: 'Service and project-type pages',
        body: 'Separate pages for kitchens, extensions, roofing, fit-outs or whatever you build, each covering process, typical scope and what a client should prepare before asking for a quote. Pages are built from your real experience, so they help clients understand cost drivers and timing before they call.',
      },
      {
        title: 'Project portfolio pages',
        body: 'Real project galleries with location, scope, materials and timelines, which show capability to a client weighing a large investment and give search engines genuine local content. We obtain client permission first and focus on the details that show quality, such as before-and-after conditions and materials.',
      },
      {
        title: 'Service-area coverage',
        body: 'Pages for the towns and districts you actually serve, built from real project examples rather than duplicated text, plus a map profile whose service area matches your coverage. We keep the boundaries tight so you do not appear where you cannot work.',
      },
      {
        title: 'Licence, insurance and warranty proof',
        body: 'Clear display of registrations, insurance, safety record, warranties and memberships, because clients verify that a contractor is legitimate before sharing a budget. We add these to every service page and the footer, so trust signals are visible without searching for them.',
      },
      {
        title: 'Quote request optimization',
        body: 'Estimate forms and call prompts that collect project type, location and timeline, so you can qualify enquiries and avoid chasing jobs outside your scope. Forms ask only for what you need, and response times are shown, so clients know when to expect a reply.',
      },
      {
        title: 'Review and referral signals',
        body: 'A process for asking finished-project clients for reviews with photos where allowed, and for being listed in trusted trade and home improvement directories. We make the review process simple for clients, with direct links and clear instructions, shortly after project completion.',
      },
    ],
    steps: [
      {
        title: 'Job mix and area review',
        body: 'We identify your most profitable job types, the areas you will travel to and how you currently appear for those searches.',
      },
      {
        title: 'Page and profile build',
        body: 'We create or rewrite service and area pages, set up your map profile properly and display your credentials clearly. Licence details are added to key pages.',
      },
      {
        title: 'Portfolio publishing',
        body: 'We turn finished projects into portfolio entries with photos, scope and location, written with details only you can supply. Photos are optimised for speed.',
      },
      {
        title: 'Lead quality review',
        body: 'We track calls and quote requests by job type and area, review quality with you and shift focus toward profitable work.',
      },
    ],
    faq: [
      {
        q: 'How does contractor SEO differ from home services SEO?',
        a: 'Contractors sell larger, scheduled projects that clients compare carefully, so portfolios, credentials and quote forms matter most. Home service firms often handle urgent, repeat jobs where speed of response and map visibility dominate. Both can overlap, so we tailor the plan to your mix of job sizes and how clients usually find you.',
      },
      {
        q: 'Can SEO work for contractors in small towns?',
        a: 'Yes. Smaller areas often have less competition, and search engines favour nearby, relevant businesses. A complete profile, accurate service area and project examples can be enough to appear for local searches. Smaller towns also tend to value local references, so we help you collect and display them properly.',
      },
      {
        q: 'Do we need a new website?',
        a: 'Not always. We start by auditing what you have. If it is slow, hard to use on mobile or built in a way that blocks improvement, we will say so, but many sites can be improved without a full rebuild.',
      },
      {
        q: 'How should we show past work?',
        a: 'With honest, specific project pages: where it was, what was done, materials and duration, and real photos. Clients value detail, and always get permission before naming or showing a client’s property. It helps to confirm you own the content and the domain, so you can make changes in the future without delays.',
      },
      {
        q: 'How do we know it is working?',
        a: 'By the number and quality of quote requests and calls, tracked by source. We report these monthly, along with map and search visibility, and we will not claim credit for work that did not come from search. You will also see improvements such as growth in profile views and visits, which help show direction.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['home-services-seo', 'local-seo', 'real-estate-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'home-services-seo',
    path: '/seo-services/home-services-seo',
    name: 'Home Services SEO',
    title: 'Home Services SEO | Calls from Local Customers',
    description:
      'SEO for plumbing, repair, cleaning and home service firms: map pack visibility, service-area pages, reviews and call tracking that turn searches into jobs.',
    h1: 'Home services SEO',
    intro:
      'Home services SEO gets repair, maintenance and cleaning businesses to the top of the results when a householder needs help now. These customers search on their phone, pick from the first few listings and call fast, so we focus on map visibility, service-area pages, review velocity and call tracking. Every change is aimed at getting the phone to ring from the right area.',
    icon: 'near_me',
    category: 'seo',
    hub: 'industry',
    tag: 'Home Services',
    includes: [
      {
        title: 'Map profile and service-area setup',
        body: 'Primary and secondary categories, services, hours and the areas you actually cover are configured accurately, with regular posts and photos to show the profile is active. We keep hours, seasonal changes and emergency availability accurate, because wrong details lead to missed calls and poor reviews.',
      },
      {
        title: 'Service pages per job',
        body: 'A dedicated page for each service you offer, from leak repair to deep cleaning, with clear scope, response times and a click-to-call button above the fold. Pages list typical problems, what the visit involves and how quickly you respond, which reassures a stressed customer.',
      },
      {
        title: 'Area pages with local detail',
        body: 'Pages for neighbourhoods and towns, using real jobs, local landmarks and common issues in older or newer housing there, instead of repeating one script with the place name changed. We use photos and job notes from your team to prove real work in each area.',
      },
      {
        title: 'Review velocity and replies',
        body: 'A system that asks each customer for a review shortly after the job, and replies to all feedback, because recent reviews strongly affect both rankings and who gets the call.',
      },
      {
        title: 'Call and form tracking',
        body: 'Tracking numbers, form tracking and source reporting so you know which pages and profiles generate calls, including after-hours emergency enquiries. Where you advertise, we link ad calls to the same dashboard, so you can compare all call sources in one place.',
      },
      {
        title: 'Citation and directory clean-up',
        body: 'Consistent business details on the directories and home service sites that customers use, with duplicate and outdated listings removed. We also monitor new listings that appear without your knowledge, which can cause confusion and mismatched phone numbers.',
      },
    ],
    steps: [
      {
        title: 'Coverage and competitor check',
        body: 'We map your services and areas, and look at who appears in the local results for the searches that bring you jobs.',
      },
      {
        title: 'Profile and page setup',
        body: 'We correct your map profile and citations, then build the service and area pages that are missing or thin. We also remove duplicate listings.',
      },
      {
        title: 'Reviews and activity',
        body: 'We put a repeatable review request process in place and keep your profile fresh with photos and posts of recent work.',
      },
      {
        title: 'Call reporting',
        body: 'We report on calls, bookings and direction requests, and adjust service and area focus based on the jobs that pay best.',
      },
    ],
    faq: [
      {
        q: 'Why is the map listing so important for home services?',
        a: 'For urgent searches such as "plumber near me", map results usually appear first on mobile, and people often call straight from them. A complete, well-reviewed profile in the right categories often matters more than any single page on your site.',
      },
      {
        q: 'Do I need paid ads as well?',
        a: 'Many home service firms use both. Paid listings can fill gaps quickly, while SEO builds steady, lower-cost enquiries over time. We can show where you already appear organically so you do not pay for visibility you have. Used together, they help ensure you appear when customers are ready to call and reduce reliance on a single source.',
      },
      {
        q: 'I already rank well locally. Is more SEO needed?',
        a: 'Rankings can slip as competitors add reviews and pages. Ongoing work protects your position, widens the services and areas you appear for and fixes issues before they cost you calls. If you are in good shape, we will say so.',
      },
      {
        q: 'How do you measure results?',
        a: 'Through phone calls, form submissions, booking requests and profile actions, tracked by source. We care about booked jobs, so we ask you to flag which enquiries were genuine, and use that to refine our focus. We review call recordings or notes where permitted, to separate genuine job enquiries from spam or wrong numbers.',
      },
      {
        q: 'Can you guarantee top local rankings?',
        a: 'No one can. Local results depend on proximity, relevance, reviews and competition, and search engines change them frequently. We can improve the factors within your control and show you honestly how visibility and calls change. We also explain what influences the results so you can make informed decisions about budget and effort.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['contractor-seo', 'local-seo', 'google-business-profile'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
];
