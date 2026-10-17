import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=seo%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const DIRECTORY_GUIDES = { label: 'Business directory guides', href: '/blog/business-directory' };
const SPEED_TOOL = { label: 'Website Speed Test', href: '/free-tools/website-speed-test' };

/**
 * Industry SEO pages. Each one is an umbrella for a group of trades or
 * professions (home services, professional firms, dental), plus the business
 * types the agency serves most: SaaS and small businesses.
 */
export const INDUSTRY_PAGES: ServicePage[] = [
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
    related: ['content-marketing', 'geo-services', 'international-seo'],
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
    related: ['local-seo', 'google-business-profile', 'multi-location-seo'],
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
    related: ['local-seo', 'google-business-profile', 'small-business-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'professional-firms-seo',
    path: '/seo-services/professional-firms-seo',
    name: 'Professional Firms SEO',
    title: 'Professional Firms SEO | Build Expertise Online',
    description:
      'SEO for consultancies, accountancies, engineering and other professional firms: expertise pages, partner profiles, thought leadership and referral-led growth.',
    h1: 'Professional firms SEO',
    intro:
      'Professional firms SEO helps consultancies, accountancies, engineering practices and similar advisory businesses turn their expertise into search visibility. Clients often arrive by referral and then check the firm online, so the site has to prove credibility. The work covers service and sector pages, partner profiles, original insight and the paths that lead to an enquiry.',
    icon: 'business_center',
    category: 'seo',
    hub: 'industry',
    tag: 'Expertise-Led',
    includes: [
      {
        title: 'Service and sector pages',
        body: 'Most firms list services in one long page. We separate them into distinct service and sector pages, each explaining who it is for, the problems it solves and how an engagement works.',
      },
      {
        title: 'Partner and team profiles',
        body: 'Clients hire people, not logos. We build profiles with qualifications, experience, memberships and publications, linking each person to the services and insights they own. We keep profiles current as people join, move or leave, so the site never shows outdated staff.',
      },
      {
        title: 'Thought leadership with substance',
        body: 'We turn your professionals’ knowledge into articles, briefings and guides about real client questions, so the content reflects experience and gives other sites a reason to reference you. Each piece is attributed to a named professional, which supports credibility and encourages sharing.',
      },
      {
        title: 'Referral validation',
        body: 'People referred to you will search your name, your partners and your firm. We make sure those results are accurate, current and show the credentials a referred client hopes to see.',
      },
      {
        title: 'Office and local presence',
        body: 'Where clients meet you in person, we optimize office pages and local profiles with accurate details, directions and the contacts for each team, so the right person is reached first time.',
      },
      {
        title: 'Recruitment and brand pages',
        body: 'Professional firms also compete for talent. We keep careers pages, culture content and firm background consistent and findable, as candidates research a firm much as clients do. These pages also help your firm appear in searches where candidates compare employers.',
      },
    ],
    steps: [
      {
        title: 'Interview the firm',
        body: 'We speak with partners about their best clients, key services and how new work usually arrives, then connect that to search behaviour.',
      },
      {
        title: 'Restructure services and people',
        body: 'We rebuild service, sector and profile pages so expertise is easy to find and consistently presented. We also fix navigation so related services and people link together.',
      },
      {
        title: 'Publish insight',
        body: 'We plan a manageable programme of articles and guides drawing on your professionals’ knowledge, with their review before release. We also agree a simple review route so publication never stalls.',
      },
      {
        title: 'Report on enquiries',
        body: 'We track enquiries and the pages that preceded them, and compare them with referrals so you see what search adds.',
      },
    ],
    faq: [
      {
        q: 'Our work comes through referrals. Why do we need SEO?',
        a: 'Because referred clients usually check you online before getting in touch. If your site is thin, outdated or hard to navigate, you lose trust at the last step. SEO also adds a second route to new clients who have not heard of you.',
      },
      {
        q: 'Do the partners need to write the content?',
        a: 'Not the whole thing. We can interview them, draft from their input and send it back for review. Their name and expertise on the page matters, but it should not take hours of their week, so we design a process that respects their time.',
      },
      {
        q: 'Is professional services content held to a higher standard?',
        a: 'For topics touching money, law, health or safety, search engines look harder at accuracy and author expertise. That means named, qualified authors, careful sourcing and honest limits on what general content can say. This is why we favour named experts, real sources and clear dates on advisory content.',
      },
      {
        q: 'Should each service have its own page?',
        a: 'Generally yes, if it is a distinct offering with its own client need. Separate pages let you explain scope, process and relevant experience, and they match specific searches that a single page listing every service would struggle to cover. It also stops the site from reading like a list of capabilities with no focus.',
      },
      {
        q: 'How do you measure results for a firm with few, high-value clients?',
        a: 'By enquiry quality and relevance more than volume. We track which pages preceded enquiries, ask how people found you during intake, and report on the pieces of work that began with a search, even if there are only a few.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['local-seo', 'content-marketing', 'seo-consulting'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'small-business-seo',
    path: '/seo-services/small-business-seo',
    name: 'Small Business SEO',
    title: 'Small Business SEO | Practical Plans That Fit',
    description:
      'SEO for small businesses with limited time and budget: a short priority list covering your profile, key pages and reviews, so effort goes where it pays.',
    h1: 'Small business SEO',
    intro:
      'Small business SEO is a focused approach for owners who cannot spend months on a large campaign. It starts with the basics that bring the most enquiries: an accurate Google profile, a handful of well-written pages, genuine reviews and a site that works on a phone. We then add effort gradually as results and capacity allow.',
    icon: 'storefront',
    category: 'seo',
    hub: 'industry',
    tag: 'Start Small',
    includes: [
      {
        title: 'A short priority plan',
        body: 'You get a clear list of the few actions most likely to help, in order, with a note on what to leave until later, so limited time and budget go where they matter.',
      },
      {
        title: 'Google profile first',
        body: 'For most local businesses, the map profile brings the first enquiries. We complete it properly with categories, services, hours, photos and a plan for posts and questions. Spending an hour or two each month keeping it fresh is usually enough to maintain momentum.',
      },
      {
        title: 'Core pages that sell',
        body: 'A home page, a page for each main service and a contact page, written clearly, often outperform a larger but vague site. We tighten these before expanding anywhere else. Strong core pages also make later growth easier, because everything else can link back to them.',
      },
      {
        title: 'Reviews without the awkwardness',
        body: 'We give you a simple, platform-compliant way to ask for reviews, such as a short message or a card, and templates for replying to praise and complaints. We also explain how to respond to unfair reviews without making matters worse.',
      },
      {
        title: 'Basic tracking you can read',
        body: 'We set up simple measurement for calls, forms and direction requests, and give a monthly summary in plain language rather than a dashboard you have no time to interpret. Plain summaries help you decide what to do next without needing technical knowledge.',
      },
      {
        title: 'Fixes you can do yourself',
        body: 'Where an owner can reasonably handle a task, such as updating hours or adding photos, we show how and give a checklist, keeping your spending for work that needs expertise.',
      },
    ],
    steps: [
      {
        title: 'Quick review',
        body: 'We look at your profile, website and local competitors, and find the handful of issues holding back enquiries. We also check basics such as mobile display and contact details.',
      },
      {
        title: 'Agree the plan',
        body: 'We choose a realistic set of actions for the next few months, matching your time, budget and goals. We keep the scope small enough to finish and review.',
      },
      {
        title: 'Do the essentials',
        body: 'We fix the profile, improve key pages and set up review requests, handing over anything you prefer to manage yourself.',
      },
      {
        title: 'Check in and grow',
        body: 'We review what has changed, then decide together whether to add content, links or more locations. We also decide whether to stay small or invest more.',
      },
    ],
    faq: [
      {
        q: 'Is SEO worth it for a very small business?',
        a: 'Often, yes, if customers search for what you do. The basics are inexpensive in effort and can bring steady enquiries. We would tell you honestly if your market is too niche or too competitive for SEO to be your best use of money.',
      },
      {
        q: 'What should I do first?',
        a: 'Claim and complete your Google Business Profile, make sure your website states clearly what you do and where, and make it easy to call or send a message. Those steps usually matter more than any technical tweak. After that, add short pages for each service and ask recent customers for reviews.',
      },
      {
        q: 'Can I do SEO myself?',
        a: 'Many owners can handle the basics, such as profile updates and review requests. Where time or expertise runs short, specialist help can save effort on audits, content and technical fixes. We are happy to split the work so you keep what you enjoy.',
      },
      {
        q: 'How much content does a small site need?',
        a: 'Fewer pages than most people expect, but better ones. A page for each core service and area you serve, plus a few helpful answers to common customer questions, is a strong start. Volume matters less than clarity and usefulness. More pages can be added later, once the first ones are performing and you know what customers ask.',
      },
      {
        q: 'When should I expect to see results?',
        a: 'Improvements to profiles and basic pages can show up within weeks, while competitive searches take longer. We cannot promise timeframes, but we agree what to watch, such as calls and messages, and review it with you regularly. Even a small business should expect early feedback in profile views and calls before ranking changes appear.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['local-seo', 'google-business-profile', 'wordpress-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
];
