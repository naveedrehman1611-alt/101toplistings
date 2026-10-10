import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };

/** Core SEO service pages shown in the "core" section of the /seo-services hub. */
export const CORE_PAGES: ServicePage[] = [
  {
    slug: 'national-seo',
    path: '/seo-services/national-seo',
    name: 'National SEO',
    title: 'National SEO Services | Rank Across Your Country',
    description:
      'National SEO for businesses that sell across a whole country. Keyword, content, technical and link work built for broad commercial searches, not map results.',
    h1: 'National SEO services',
    intro:
      'National SEO is the work of ranking a website for non-local commercial searches across an entire country, such as "project management software" or "buy running shoes online". There is no map pack to win here. Results depend on strong category pages, helpful topical content, a healthy site and links from authoritative sources.',
    icon: 'flag',
    category: 'seo',
    hub: 'core',
    tag: 'Country-Wide',
    includes: [
      {
        title: 'Country-level keyword mapping',
        body: 'We group the terms buyers use across your country into topics, judge how competitive each one is and decide what to pursue first. Regional wording and spelling differences are noted so pages match the market.',
      },
      {
        title: 'Category and service page optimization',
        body: 'The pages that earn commercial rankings get clear targeting, strong headings, useful detail and internal links, so each one answers a specific search better than the pages currently ahead of it.',
      },
      {
        title: 'Topic cluster content',
        body: 'Guides, comparisons and explainers that support your money pages and cover the questions buyers ask before they choose. Each piece is planned around a gap we found in the results.',
      },
      {
        title: 'Authority link building',
        body: 'Outreach and digital PR aimed at relevant sites in your sector, because broad national terms are rarely won on content alone. We avoid link schemes that put your site at risk.',
      },
      {
        title: 'Technical foundation',
        body: 'Crawl, indexing, speed and structured data are checked on the templates that matter, so the national content you publish can actually be found, rendered and understood by search engines. We also look at rendering and duplicate pages.',
      },
      {
        title: 'Rank and revenue tracking',
        body: 'Tracking for priority terms across the country plus organic sessions, enquiries and sales in analytics, so reports show business movement and not just a list of positions. Reports are written in plain language.',
      },
    ],
    steps: [
      {
        title: 'Market and competitor research',
        body: 'We study who ranks for your priority terms nationally and why, and where the realistic openings are for your site.',
      },
      {
        title: 'Roadmap by commercial value',
        body: 'Pages, content and links are sequenced by likely business impact and effort, not by search volume alone. We also note where rivals are weak.',
      },
      {
        title: 'Build and publish',
        body: 'We optimize existing pages, create the missing ones and earn links in steady monthly batches. Quick wins are separated from longer projects, so you see progress early.',
      },
      {
        title: 'Measure and expand',
        body: 'Each month we review what gained visibility, double down on it and extend into the next group of terms. Everything is documented for your team.',
      },
    ],
    faq: [
      {
        q: 'What is national SEO?',
        a: 'National SEO aims to rank a site for searches across a whole country rather than a single city. It suits businesses that ship, serve or sell nationally and compete on broad, non-local commercial terms. It is common for online shops, software companies and publishers.',
      },
      {
        q: 'How is it different from local SEO?',
        a: 'Local SEO targets map results and "near me" searches for a defined area, so listings and reviews matter most. National SEO is closer to standard organic search, where content depth, site quality and links decide results. Both can be used together when a company has shops and an online offer.',
      },
      {
        q: 'Do I need it if I only serve some regions?',
        a: 'Not necessarily. If customers search by city or region, local or multi-location work fits better. National SEO makes sense when your offer is the same wherever the buyer lives and you can fulfil orders widely. We look at where your customers and competitors actually are before suggesting a scope.',
      },
      {
        q: 'How long does national SEO take?',
        a: 'Broad terms are contested, so it generally takes longer than local work. We cannot promise rankings or dates, but we will set milestones, show what has changed each month and explain what comes next. Time to results varies with your starting point, so we agree what to measure first.',
      },
      {
        q: 'How will we know it is working?',
        a: 'We track visibility for agreed terms, organic traffic to key pages and the enquiries or sales that follow. If traffic grows without business results, we tell you and adjust the plan. Reports are plain, and the numbers come from your own analytics, not just our tools.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['nationwide-seo', 'lead-generation-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'international-seo',
    path: '/seo-services/international-seo',
    name: 'International SEO',
    title: 'International SEO Services | Hreflang & Global Setup',
    description:
      'International SEO for sites that serve several countries or languages: hreflang, site structure, geotargeting and localized content so the right page ranks.',
    h1: 'International SEO services',
    intro:
      'International SEO is the technical and content setup that lets search engines show the right version of your site to people in each country and language. It covers hreflang annotations, domain or folder structure, geotargeting and localization, so your French, German or Brazilian pages do not compete with each other or get ignored.',
    icon: 'public',
    category: 'seo',
    hub: 'core',
    tag: 'Global',
    includes: [
      {
        title: 'Hreflang implementation',
        body: 'Correct language and region annotations in page headers, HTTP headers or sitemaps, with return links and self references checked at scale, so search engines pair each page with its alternates and serve the right one.',
      },
      {
        title: 'Site structure recommendation',
        body: 'We compare country-code domains, subfolders and subdomains against your resources, brand and CMS, then recommend one structure with the trade-offs explained before any URLs change. The decision is documented for your developers.',
      },
      {
        title: 'Geotargeting and market signals',
        body: 'Search Console settings, currency, addresses, local phone numbers, hosting and local links are reviewed so each version sends consistent signals about the country it is meant for. Mismatches are listed with fixes.',
      },
      {
        title: 'Localized keyword research',
        body: 'Terms are researched in each market and language, not translated from English, because people in different countries often use different words, spellings and search habits for the same product. We note regional spelling and slang.',
      },
      {
        title: 'Duplicate and indexing control',
        body: 'Near-identical English pages for the UK, US and Australia, mixed-language content and wrong canonical tags are found and resolved so each version can be indexed on its own merits. Each fix is tested with a crawl.',
      },
      {
        title: 'Per-market reporting',
        body: 'Visibility, traffic and conversions are segmented by country and language, including markets where Google is not the leading engine, so you can see which versions are performing and which need work.',
      },
    ],
    steps: [
      {
        title: 'Market and structure review',
        body: 'We check where your demand is, how the site is built today and which markets are worth a dedicated version.',
      },
      {
        title: 'Architecture and hreflang plan',
        body: 'You get a documented URL structure, hreflang mapping and rollout order your developers can follow without guesswork. Gaps in current coverage are listed too.',
      },
      {
        title: 'Implement and localize',
        body: 'We support the technical changes and guide localized content, then validate annotations and indexing with crawls. Developers get examples and test cases to check against.',
      },
      {
        title: 'Monitor by market',
        body: 'Each country and language is tracked separately, so problems such as the wrong version ranking are caught early. Alerts flag sudden drops in any one country.',
      },
    ],
    faq: [
      {
        q: 'Should I use country domains or subfolders?',
        a: 'Subfolders are usually simpler to manage and share authority across the brand. Country-code domains send a strong local signal but cost more to maintain and build up. The right choice depends on your resources and markets. We lay out both options for your situation.',
      },
      {
        q: 'What is hreflang and do I need it?',
        a: 'Hreflang tells search engines which page is meant for which language or region. You need it when you have equivalent pages for several audiences, especially same-language versions such as English for different countries. Mistakes are common, so we validate it with a crawl after launch.',
      },
      {
        q: 'Is translating my site enough?',
        a: 'Rarely. Direct translation often misses local search terms, units, currency, legal wording and buying habits. We recommend localized pages for markets that matter and lighter treatment for the rest. We usually start with your top two or three markets and extend from there as results justify it.',
      },
      {
        q: 'What about markets where Google is not dominant?',
        a: 'Some countries rely heavily on other engines, such as Baidu, Yandex or Naver. We can adapt the technical and content setup to their requirements, though each one has its own rules and often needs local hosting or accounts. We say so early if a market looks impractical.',
      },
      {
        q: 'How long does international SEO take?',
        a: 'Technical fixes can be reflected within weeks of re-crawling, while building authority in a new market takes longer. We cannot promise specific results, but we will report progress for each country separately. Large sites can take longer because search engines revisit pages at their own pace.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['multilingual-seo', 'global-seo', 'technical-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'enterprise-seo',
    path: '/seo-services/enterprise-seo',
    name: 'Enterprise SEO',
    title: 'Enterprise SEO Services | SEO for Large Websites',
    description:
      'Enterprise SEO for large, complex websites: template-level fixes, governance across teams, scalable content and reporting that executives can act on.',
    h1: 'Enterprise SEO services',
    intro:
      'Enterprise SEO is search optimization for large organizations whose websites run to many thousands of pages, several teams and a formal release process. The work shifts from fixing single pages to improving templates, setting standards, influencing roadmaps and proving the value of organic search to stakeholders who are not SEOs.',
    icon: 'domain',
    category: 'seo',
    hub: 'core',
    tag: 'Enterprise',
    includes: [
      {
        title: 'Large-site audit and prioritization',
        body: 'Crawl data, log files and analytics are combined to find issues by template and section, then ranked by traffic at stake and engineering effort, so scarce developer time goes to the biggest wins.',
      },
      {
        title: 'Template-level technical fixes',
        body: 'Product, category, article and listing templates are reviewed for rendering, indexation, pagination, faceted URLs and internal linking, because one change on a template can affect thousands of pages at once.',
      },
      {
        title: 'Content governance',
        body: 'Briefing standards, review steps and ownership rules help many writers and regional teams publish consistently, avoid cannibalization and retire thin or outdated pages instead of letting them pile up. Ownership is written down.',
      },
      {
        title: 'Cross-team workflows',
        body: 'We write tickets developers can estimate, join sprint planning where useful and agree a clear route between SEO, product, engineering, legal and brand teams so recommendations are not stuck in a queue.',
      },
      {
        title: 'Release and migration safeguards',
        body: 'SEO checks are added to launches, redesigns and platform changes, with pre-release testing and post-release monitoring to catch accidental noindex tags, broken redirects or lost content early. Findings go to the release owner.',
      },
      {
        title: 'Executive reporting',
        body: 'Dashboards and summaries connect organic performance to revenue, pipeline or other business measures, with enough detail for specialists and a clear narrative for leadership. Reports are scheduled around your planning cycle.',
      },
    ],
    steps: [
      {
        title: 'Stakeholder and site discovery',
        body: 'We learn how decisions are made, who owns what and where the platform limits what SEO can change. Findings are written up for sign-off.',
      },
      {
        title: 'Business-case roadmap',
        body: 'Recommendations are sized by impact and effort and tied to goals so they can be funded and scheduled. Each item shows its expected effect and owner.',
      },
      {
        title: 'Embedded delivery',
        body: 'We work alongside your teams on tickets, reviews and launches, rather than handing over a report and leaving. Hand-offs stay documented in your own systems.',
      },
      {
        title: 'Governance and review',
        body: 'Quarterly reviews check progress against the roadmap, update standards and plan the next set of changes. Standards are updated as the site grows and teams change.',
      },
    ],
    faq: [
      {
        q: 'What makes enterprise SEO different?',
        a: 'Scale and organisation. The same SEO principles apply, but changes are made through templates, approvals and release cycles, and most of the effort goes into prioritisation, communication and governance rather than single-page tweaks. That is why relationships matter as much as technical skill.',
      },
      {
        q: 'How big does a site need to be?',
        a: 'There is no fixed number. If your site has tens of thousands of URLs, multiple regions or brands, or several teams publishing at once, enterprise methods help. Smaller sites are usually better served by standard SEO. We can tell you honestly which side of the line you are on.',
      },
      {
        q: 'Can you work with our in-house SEO team?',
        a: 'Yes. We often support existing teams with specialist audits, technical direction, content scaling or extra capacity, and we agree up front who owns which tasks so work is not duplicated. Our team can also train new hires or fill a gap while a role is open.',
      },
      {
        q: 'Do you handle multiple domains and regions?',
        a: 'We can, including shared standards across brands and regional sites. For hreflang and country structure we draw on our international SEO work, so each market is handled consistently. Where several teams are involved we agree one owner for each market so nothing falls between them.',
      },
      {
        q: 'How do you report to non-SEO executives?',
        a: 'We keep the headline view short: organic traffic, leads or revenue, risks and decisions needed. Technical detail sits underneath for your team. We do not promise rankings, only transparent measurement of progress. You see risks and decisions needed early, not at the end of the quarter.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-strategy', 'seo-management', 'technical-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'seo-consulting',
    path: '/seo-services/seo-consulting',
    name: 'SEO Consulting',
    title: 'SEO Consulting Services | Expert Guidance for Teams',
    description:
      'SEO consulting for in-house teams and founders: expert strategy, prioritised roadmaps, reviews and training while your own people do the implementation.',
    h1: 'SEO consulting services',
    intro:
      'SEO consulting is expert advice for people who will do the work themselves. A consultant reviews your site and market, sets priorities, answers hard questions and checks what your team produces, but does not run the day-to-day tasks. It suits in-house marketers, developers and founders who need direction more than extra hands.',
    icon: 'handshake',
    category: 'seo',
    hub: 'core',
    tag: 'Expert Advice',
    includes: [
      {
        title: 'Strategy and priorities session',
        body: 'We go through your goals, site and competitors and agree what to do first, what to leave alone and what success looks like, so your team starts with a clear, realistic plan.',
      },
      {
        title: 'Written roadmap',
        body: 'A step-by-step plan broken into tasks your team can assign, with reasoning for each, so people who are not SEO specialists understand why a job matters before they start. Each task has a short rationale.',
      },
      {
        title: 'Recurring advisory calls',
        body: 'Scheduled calls to review progress, unblock decisions and answer new questions as they come up, such as algorithm changes, tool choices or how to handle a redesign. Notes follow every call.',
      },
      {
        title: 'Work reviews',
        body: 'We check content briefs, key pages, redirect maps and release plans before they go live and give specific feedback, catching expensive mistakes while they are still cheap to fix. Feedback is specific.',
      },
      {
        title: 'Team training and playbooks',
        body: 'Workshops and short guides for writers, developers and marketers covering the parts of SEO they touch, so good practice becomes routine and does not depend on one person. Materials suit mixed experience levels.',
      },
      {
        title: 'Second opinion on agencies and tools',
        body: 'An independent look at proposals, reports or existing vendor work, so you can judge whether what you are paying for is sound, necessary and well executed. We keep it factual and constructive.',
      },
    ],
    steps: [
      {
        title: 'Intake call',
        body: 'We learn about your business, your team’s skills and capacity, and the decisions you are stuck on. We also ask what has been tried already.',
      },
      {
        title: 'Assessment',
        body: 'We review the site, search results and analytics to find where the biggest opportunities and risks sit. Findings come with evidence from your own data.',
      },
      {
        title: 'Roadmap and handover',
        body: 'You receive a prioritised plan and a walkthrough, with training for the people who will carry it out. Nothing is left to interpretation.',
      },
      {
        title: 'Ongoing advice',
        body: 'We stay available for scheduled reviews and questions while your team delivers, and adjust the plan as results come in.',
      },
    ],
    faq: [
      {
        q: 'How is consulting different from a full SEO service?',
        a: 'With consulting you keep control of execution. We advise, review and train; your team writes, builds and publishes. A full service means we carry out the tasks as well. Many clients start with consulting and add hands-on help later. The right level depends on your team.',
      },
      {
        q: 'Who is it best suited to?',
        a: 'In-house marketing teams, developers who own the website, founders learning SEO and agencies that need a specialist on a tricky project. It works best when someone on your side has the time to do the work. It can also suit one-off projects such as a redesign.',
      },
      {
        q: 'What do you need from our team?',
        a: 'Access to analytics and Search Console, a named contact who can make decisions, and capacity to carry out agreed tasks. Without internal time to implement, a hands-on service is usually a better fit. We are upfront if the time is not there.',
      },
      {
        q: 'Can you review another agency’s work?',
        a: 'Yes. We can examine reports, audits, links and recommendations from another provider and tell you plainly what is useful, what is weak and what is missing. We keep the review factual and based on your site’s data. We do not nitpick for the sake of it.',
      },
      {
        q: 'Will consulting improve my rankings?',
        a: 'It can help your team make better decisions, but results depend on how well the plan is carried out and on your market. We cannot guarantee rankings, and we will say so if a plan is unlikely to deliver what you want.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-audit-services', 'custom-seo', 'seo-strategy'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'lead-generation-seo',
    path: '/seo-services/lead-generation-seo',
    name: 'Lead Generation SEO',
    title: 'Lead Generation SEO | Turn Organic Search Into Leads',
    description:
      'Lead generation SEO focuses on search terms and pages that bring enquiries, calls and sign-ups, not just traffic, with tracking that ties visits to leads.',
    h1: 'Lead generation SEO services',
    intro:
      'Lead generation SEO is search optimization measured by enquiries, calls, demo requests and sign-ups instead of visits alone. It starts from the searches people make when they are ready to talk to a provider, builds pages that answer those searches and tracks every lead back to the page and query that produced it.',
    icon: 'contact_phone',
    category: 'seo',
    hub: 'core',
    tag: 'ROI-Focused',
    includes: [
      {
        title: 'Buyer-intent keyword mapping',
        body: 'We separate searches from people researching from those comparing providers or ready to enquire, then prioritise terms that sit close to a decision and are realistic for your site to win.',
      },
      {
        title: 'Landing and service page optimization',
        body: 'Pages are reworked with a clear offer, proof, answers to common objections and a simple next step, so a visitor from search knows what to do and why to trust you.',
      },
      {
        title: 'Funnel-stage content',
        body: 'Comparison pages, pricing explainers, case-style write-ups and how-to guides support each stage of the journey and lead readers toward a conversion page instead of leaving them at a dead end.',
      },
      {
        title: 'Form and call tracking setup',
        body: 'Analytics events, form submissions and optional call tracking are configured and tested, so each lead is credited to its source page, keyword group and channel. Everything is tested before it goes live.',
      },
      {
        title: 'Lead quality feedback loop',
        body: 'Where you can share outcomes from your CRM or sales team, we compare which pages bring qualified leads and which bring noise, then shift effort toward the useful ones. Sharing is voluntary.',
      },
      {
        title: 'Conversion rate improvements',
        body: 'Layout, forms, calls to action and page speed on lead pages are tested and refined, because extra enquiries often come from converting existing traffic better. Changes are made one at a time so results can be read.',
      },
    ],
    steps: [
      {
        title: 'Define a lead',
        body: 'We agree what counts as a qualified lead for you and set up measurement so it can be tracked from the first visit.',
      },
      {
        title: 'Intent and gap analysis',
        body: 'We find high-intent searches you are missing and weak spots on pages that already get traffic but few enquiries. Quick fixes are noted.',
      },
      {
        title: 'Build and improve',
        body: 'Priority pages are created or rewritten, tracking is verified and links support the pages that matter most. Tracking is checked before launch.',
      },
      {
        title: 'Review lead data',
        body: 'Each month we look at leads by page and query, drop what is not working and expand what is. Findings are shared in plain language.',
      },
    ],
    faq: [
      {
        q: 'How is lead generation SEO different from regular SEO?',
        a: 'Regular SEO often reports on rankings and traffic. Lead generation SEO ranks success by qualified enquiries, so keyword choice, page design and tracking all revolve around the visitor taking a specific action. The difference shows up in which pages we prioritise.',
      },
      {
        q: 'Does it work for B2B and service businesses?',
        a: 'Yes, those are typical fits, since buyers research online and then request a quote or call. It can also support ecommerce or local work, though other service pages may be a closer match for those models. We will say if another service suits you better.',
      },
      {
        q: 'How do you measure lead quality?',
        a: 'We track form completions, calls and bookings, then compare them with whatever outcome data you can share, such as qualified, won or unsuitable leads. The clearer that feedback, the better we can steer the work. Even a basic form-and-call count is a useful start.',
      },
      {
        q: 'How long until leads arrive?',
        a: 'Improving conversion on pages that already rank can help within weeks, while new rankings take longer and depend on competition. We cannot promise lead volumes, but we will report what is changing each month. Seasonal and sales-cycle delays are normal in some sectors.',
      },
      {
        q: 'Do I need an existing website?',
        a: 'It helps, because existing pages and data show where to start. If you have no site yet, we can plan the structure and key pages first, so it is built around lead capture from the beginning. It also avoids rebuilding later.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['on-page-seo', 'content-marketing', 'local-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'nationwide-seo',
    path: '/seo-services/nationwide-seo',
    name: 'Nationwide SEO',
    title: 'Nationwide SEO | SEO for Multi-Location Brands',
    description:
      'Nationwide SEO for brands with many branches or service areas: location pages at scale, consistent listings and reporting for each location and the whole brand.',
    h1: 'Nationwide SEO services',
    intro:
      'Nationwide SEO is search optimization for brands that serve customers through many branches, stores or service areas. It combines a strong brand site with a large set of location pages, consistent listings and local profiles, so each branch can appear for nearby searches while the business builds authority as a whole.',
    icon: 'lan',
    category: 'seo',
    hub: 'core',
    tag: 'Multi-Location',
    includes: [
      {
        title: 'Location inventory and page plan',
        body: 'We list every branch and service area, check which already have pages and decide which deserve their own, so the site structure reflects how customers actually look for you. This avoids guesswork.',
      },
      {
        title: 'Location page templates',
        body: 'A flexible template carries a unique address, opening hours, local team or services, directions, reviews and photos, so thousands of pages can still read as useful rather than copied. Fields stay editable.',
      },
      {
        title: 'Listings and profile management',
        body: 'Names, addresses and phone numbers are made consistent across directories and map profiles for every location, with a process for opening, moving and closing branches without leaving stale data. Changes are logged.',
      },
      {
        title: 'Internal linking and store locator',
        body: 'City and region hub pages, a crawlable locator and breadcrumbs connect locations to services and to each other, helping both visitors and search engines move through the network. Links stay crawlable.',
      },
      {
        title: 'Duplicate and thin content control',
        body: 'We detect near-identical pages, decide what to merge, noindex or expand, and set content rules for local teams so quality holds as the network grows. Reviews happen on a set schedule.',
      },
      {
        title: 'Location-level reporting',
        body: 'Calls, direction requests, visits and enquiries are shown by branch and region next to brand-level performance, so managers can see which locations need attention. Regional managers get their own view.',
      },
    ],
    steps: [
      {
        title: 'Map your locations',
        body: 'We collect branch data, current listings and page coverage to see how complete and consistent the footprint is. Gaps and duplicates are flagged.',
      },
      {
        title: 'Design the template system',
        body: 'We plan location pages, hubs and internal links, plus the local content each branch must supply. Branch teams get a simple form for the details only they know.',
      },
      {
        title: 'Roll out in batches',
        body: 'Pages and profiles go live in groups, starting with high-value regions, so issues are caught before they are repeated. Each batch is checked before the next.',
      },
      {
        title: 'Report by location',
        body: 'Performance is tracked per branch and region, with regular reviews to improve weaker locations. Weak branches get a short plan, while strong ones show what works.',
      },
    ],
    faq: [
      {
        q: 'How is nationwide SEO different from national SEO?',
        a: 'National SEO ranks one site for broad terms across a country. Nationwide SEO is about being present in many individual places at once, through location pages, listings and local signals for each branch or service area. It is a question of scope.',
      },
      {
        q: 'Does every branch need its own page?',
        a: 'Usually, if it has a physical address or a distinct service area. Each page needs real local content, such as staff, services, hours and reviews, otherwise it adds little. We help decide where a page earns its place. Thin pages can do more harm than good.',
      },
      {
        q: 'Can you manage franchises or dealer networks?',
        a: 'Yes. Franchise and dealer structures add complications, such as independent owners and brand rules. We set up central standards and simple processes for local operators to follow. Our franchise SEO page covers that model. Getting consent and data from owners is usually the hardest part.',
      },
      {
        q: 'What about service-area businesses without shops?',
        a: 'They can be included. Instead of branch pages we plan service-area pages based on genuine coverage, and follow each platform’s rules about hiding or showing addresses on map profiles. We also check that each location is eligible for a map profile, because some service areas are not.',
      },
      {
        q: 'How long does it take to roll out?',
        a: 'It depends on the number of locations and how quickly local details can be gathered. We roll out in batches, and cannot promise rankings, but we will show progress for every location we have launched. Early batches usually teach us what to change.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['local-seo', 'national-seo', 'franchise-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'custom-seo',
    path: '/seo-services/custom-seo',
    name: 'Custom SEO',
    title: 'Custom SEO Services | A Plan Built From Your Audit',
    description:
      'Custom SEO starts with an audit and ends with a plan sized to your site, goals and team, rather than a fixed package. Pay for the work your site needs.',
    h1: 'Custom SEO services',
    intro:
      'Custom SEO is a plan built from an audit of your own site, market and goals, instead of a fixed package with preset deliverables. We find what is holding the site back, decide which work will matter most and scope only that, so your effort goes where the evidence points and nothing is included just to fill a list.',
    icon: 'build',
    category: 'seo',
    hub: 'core',
    tag: 'Tailored',
    includes: [
      {
        title: 'Audit-led scoping',
        body: 'A technical, content and link review shows where the site stands, and the findings, not a sales template, decide what work goes into the plan and what is left out.',
      },
      {
        title: 'Goal-based priorities',
        body: 'We turn your targets, such as more qualified enquiries, a product launch or recovery from a drop, into specific SEO objectives with a short list of actions behind each one.',
      },
      {
        title: 'Modular workstreams',
        body: 'Technical fixes, content, on-page work and links are chosen as separate modules and combined in the mix your site needs, so you do not pay for tasks that add little.',
      },
      {
        title: 'Fit to your team and platform',
        body: 'Tasks are shaped around your CMS, developers and in-house skills, so we know which work we do, which you do and which needs a third party before the plan starts.',
      },
      {
        title: 'Reporting that matches the plan',
        body: 'We agree measures for each workstream up front, so reports show progress on the things we said would matter, instead of a standard dashboard of unrelated numbers. This keeps expectations realistic.',
      },
      {
        title: 'Scheduled scope reviews',
        body: 'Every few months we revisit the plan, retire finished work, add new priorities and rebalance effort as results come in and the business changes. You are never locked into work that has stopped helping.',
      },
    ],
    steps: [
      {
        title: 'Audit your site',
        body: 'We review technical health, content, links and competitors to understand your starting point. The audit is the basis for every later decision, so it is done first.',
      },
      {
        title: 'Agree the scope',
        body: 'We present findings, propose workstreams in priority order and settle what is included with clear deliverables. You approve the plan before work begins.',
      },
      {
        title: 'Deliver the plan',
        body: 'Work starts on the highest-value items, with regular updates and a named contact. We report against the measures agreed in the plan.',
      },
      {
        title: 'Review and reshape',
        body: 'At each review we change the scope to match what is working and what the business needs next. Nothing is added without your agreement.',
      },
    ],
    faq: [
      {
        q: 'What makes SEO "custom"?',
        a: 'The scope comes from an audit of your site and goals, not from a package list. Two businesses in the same industry can end up with very different plans because their sites, competitors and limits are different. The audit is what makes the plan specific.',
      },
      {
        q: 'Do I have to pay for an audit first?',
        a: 'You can begin with our free SEO audit tool for a quick view. For a bespoke plan we review your site in more depth, and we will explain what that involves before you commit to anything. We agree this at the start so there are no surprises later.',
      },
      {
        q: 'Can the plan change after we start?',
        a: 'Yes, that is the point. If priorities shift, a workstream underperforms or a new opportunity appears, we revise the scope at the next review so effort follows results and not a contract template. Reviews are scheduled, and urgent changes can be made sooner.',
      },
      {
        q: 'Is custom SEO only for large sites?',
        a: 'No. Small sites often benefit most, since a narrow, well-chosen scope avoids wasted work. The approach is the same at any size; only the number of workstreams and the amount of detail change. Budget also shapes the scope, and we will tell you what fits.',
      },
      {
        q: 'How is this different from bespoke or consulting work?',
        a: 'Custom SEO means we deliver the work in a tailored scope. Consulting is advice for your team to carry out. Both start with analysis, and we can combine them if you want guidance on some tasks and hands-on help on others.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['bespoke-seo', 'seo-consulting', 'seo-audit-services'],
    guides: [SEO_GUIDES],
  },
];

/** Diagnostic and recovery service pages shown in the "technical" section of the /seo-services hub. */
export const TECHNICAL_PAGES: ServicePage[] = [
  {
    slug: 'seo-audit-services',
    path: '/seo-services/seo-audit-services',
    name: 'SEO Audit Services',
    title: 'SEO Audit Services | In-Depth Website Review',
    description:
      'A paid, in-depth SEO audit by a specialist: technical, content and backlink analysis, competitor gaps and a prioritised action plan with a walkthrough.',
    h1: 'SEO audit services',
    intro:
      'An SEO audit service is a specialist-led review of your whole website that ends in a written report and a ranked list of fixes. Unlike an automated scan, it combines crawl data, analytics, search results and manual checks to explain what is limiting organic performance, why it matters and what to do about it first.',
    icon: 'fact_check',
    category: 'seo',
    hub: 'technical',
    tag: 'Diagnostic',
    includes: [
      {
        title: 'Technical audit',
        body: 'A full crawl and manual review of indexing, site architecture, redirects, canonical tags, speed, mobile usability and structured data, with examples of each problem and where it appears on the site.',
      },
      {
        title: 'Content and on-page analysis',
        body: 'Titles, headings, copy, internal links and search intent are assessed page by page, highlighting thin, duplicate or overlapping content and the pages with the most room to improve. Priority pages come first.',
      },
      {
        title: 'Backlink profile review',
        body: 'We examine who links to you, how natural the profile looks, which pages attract links and any patterns that could carry risk, then compare it with the competitors you actually face.',
      },
      {
        title: 'Competitor and gap analysis',
        body: 'We identify the terms and topics your competitors rank for that you do not, and the page types and content depth that appear to be working for them. Gaps are ranked by value.',
      },
      {
        title: 'Prioritised action plan',
        body: 'Every finding is rated by likely impact and effort, with clear instructions that a developer or editor can follow, so you know what to do first and what can wait.',
      },
      {
        title: 'Findings walkthrough',
        body: 'A live session to take you and your team through the report, answer questions and agree next steps, whether you carry the fixes out yourselves or ask us to. Recording is shared.',
      },
    ],
    steps: [
      {
        title: 'Scope and access',
        body: 'We agree goals and the site areas to cover, and request read access to analytics and Search Console. Questions about past changes help too.',
      },
      {
        title: 'Collect data',
        body: 'We crawl the site, pull search and traffic data, and gather competitor and link information. Everything is stored so findings can be checked later.',
      },
      {
        title: 'Analyze and verify',
        body: 'Automated findings are checked by hand, so the report holds real problems and not tool noise. Each issue gets a severity rating.',
      },
      {
        title: 'Report and walkthrough',
        body: 'You receive the report and action plan, then a session to explain the findings and decide what to do next.',
      },
    ],
    faq: [
      {
        q: 'How is this different from your free SEO audit tool?',
        a: 'The free tool gives a quick automated snapshot of common issues. A paid audit adds manual analysis, full-site crawling, competitor and backlink review, a prioritised plan and a conversation with a specialist who can answer questions. The audit is the right choice when decisions or budgets depend on the findings.',
      },
      {
        q: 'How long does an audit take?',
        a: 'It depends on the size and complexity of the site and how quickly we get access. A small site is much quicker than a large ecommerce store. We confirm timing when we agree the scope. Very large sites may be sampled by template.',
      },
      {
        q: 'Can I use the report without hiring you?',
        a: 'Yes. The report is written so your developers, writers or another agency can act on it. We are glad to help with implementation, but there is no obligation to use us for it. It includes clear instructions for each fix.',
      },
      {
        q: 'How often should a site be audited?',
        a: 'A full audit makes sense before a major investment, after a redesign or traffic drop, and then every year or so for most sites. Lighter checks in between catch new issues sooner. Changes in your market or a new platform are also good reasons for a fresh look.',
      },
      {
        q: 'Will fixing the issues improve my rankings?',
        a: 'Fixing real problems removes obstacles, but we cannot promise ranking gains or timeframes, since competitors, content and search updates all play a part. The plan puts the changes most likely to help first. Some fixes show effects sooner than others.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['technical-seo', 'seo-consulting', 'custom-seo'],
    guides: [SEO_GUIDES, { label: 'Website Speed Test', href: '/free-tools/website-speed-test' }],
  },
  {
    slug: 'seo-migration',
    path: '/seo-services/seo-migration',
    name: 'SEO Migration',
    title: 'SEO Migration Services | Protect Rankings on Launch',
    description:
      'SEO migration support for domain changes, replatforming and redesigns: URL mapping, redirects, staging checks and post-launch monitoring to limit traffic loss.',
    h1: 'SEO migration services',
    intro:
      'SEO migration is the planning and checking needed when a website changes its domain, platform, structure or design, so the search visibility it has earned carries over. The aim is to tell search engines where every important page has moved, keep what ranks and catch mistakes within days instead of months.',
    icon: 'alt_route',
    category: 'seo',
    hub: 'technical',
    tag: 'Migration',
    includes: [
      {
        title: 'Pre-migration benchmark',
        body: 'Before anything changes we record rankings, traffic, indexed pages, backlinks and top landing pages, so we know what must be protected and can measure the impact accurately afterwards. Nothing is assumed.',
      },
      {
        title: 'URL mapping and redirect plan',
        body: 'Every old URL that matters is matched to its best new equivalent, with a redirect file your developers can load, avoiding blanket redirects to the home page and long chains.',
      },
      {
        title: 'Staging site review',
        body: 'The test version is crawled before launch to catch noindex tags, blocked robots files, missing titles, broken internal links, lost structured data and content that has gone missing. Problems are ranked.',
      },
      {
        title: 'Launch-day checklist',
        body: 'On the day we verify redirects, canonical tags, sitemaps, robots rules and analytics tracking, and update Search Console, including change of address for domain moves. Issues found are fixed straight away.',
      },
      {
        title: 'Backlink and reference updates',
        body: 'Links from important external sites, profiles and listings are tracked down and updated where possible, so authority comes through the redirects directly instead of relying on them for ever. Priority links come first.',
      },
      {
        title: 'Post-launch monitoring',
        body: 'For several weeks we compare crawl, indexing and traffic data to the benchmark, flag drops by section and give your team a short fix list while problems are still small.',
      },
    ],
    steps: [
      {
        title: 'Benchmark and scope',
        body: 'We document the current site, agree the type of migration and set success measures and a launch date. Key pages are flagged.',
      },
      {
        title: 'Map and prepare',
        body: 'URL maps, redirect rules and on-page requirements are written and tested on staging before anyone presses launch. Developers get a plain checklist.',
      },
      {
        title: 'Launch support',
        body: 'We are on hand during release to validate the live site and fix urgent issues quickly. A shared channel keeps decisions quick.',
      },
      {
        title: 'Monitor and recover',
        body: 'We watch performance against the benchmark and correct anything that slips until the site settles. Reports cover rankings, traffic and indexed pages.',
      },
    ],
    faq: [
      {
        q: 'Will my rankings drop after a migration?',
        a: 'Some fluctuation is common while search engines process the changes, and well-planned migrations usually limit it. We cannot guarantee there will be no loss, but careful mapping and testing reduce the risk considerably. Recovery time depends on the size of the site and how clean the change was.',
      },
      {
        q: 'What types of migration do you cover?',
        a: 'Domain changes, HTTP to HTTPS, CMS or ecommerce replatforming, redesigns that alter URLs or structure, hosting moves and merging several sites into one. The checks differ for each, so we tailor the plan. Mixed projects, such as a new domain and platform together, need extra care.',
      },
      {
        q: 'When should we involve an SEO?',
        a: 'As early as possible, ideally when the project is scoped. Decisions about structure, URLs and content are cheap to change at the design stage and costly to fix after launch. Ideally weeks before the build starts, so URL structure can be planned with the design team.',
      },
      {
        q: 'We have already migrated and traffic fell. Can you help?',
        a: 'Often, yes. We compare the old and new site, find the lost redirects, pages or signals and prepare a recovery list. The longer a problem goes unfixed the harder it can be, so earlier is better. Results are not certain, but a structured review gives the best chance.',
      },
      {
        q: 'Do we need to update backlinks after a domain change?',
        a: 'Redirects pass most value, but updating the best links to point straight to the new URLs is good practice and reduces dependence on redirects. We prioritise the links from the most important sites. Updating also helps visitors who follow old links and keeps your link data tidy.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['technical-seo', 'seo-audit-services', 'seo-penalty-removal'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'seo-penalty-removal',
    path: '/seo-services/seo-penalty-removal',
    name: 'SEO Penalty Removal',
    title: 'SEO Penalty Removal | Recover From Google Penalties',
    description:
      'Diagnose and recover from Google manual actions and algorithmic drops: backlink and content clean-up, reconsideration requests and prevention advice.',
    h1: 'SEO penalty removal services',
    intro:
      'SEO penalty removal is the process of working out why a site has lost search visibility because of a manual action or an algorithm update, fixing the underlying problems and, where it applies, asking Google to review the site again. Recovery depends on addressing real causes, such as unnatural links, thin content or spam.',
    icon: 'gavel',
    category: 'seo',
    hub: 'technical',
    tag: 'Recovery',
    includes: [
      {
        title: 'Penalty diagnosis',
        body: 'We check Search Console for manual actions, line up traffic drops with known update dates and look at affected pages and queries to separate a penalty from a technical fault or normal volatility.',
      },
      {
        title: 'Backlink audit and clean-up',
        body: 'Your link profile is reviewed for paid, networked or spammy patterns. We request removals where realistic and prepare a disavow file only for links that justify it. Notes are kept for each decision.',
      },
      {
        title: 'Content quality review',
        body: 'Thin, auto-generated, scraped or keyword-stuffed pages are identified and rewritten, merged or removed, with reference to Google’s published guidance on helpful content and spam. Pages we remove are listed so you can approve them first.',
      },
      {
        title: 'Technical clean-up',
        body: 'Hidden text, cloaking, injected spam from a hacked site, sneaky redirects and structured data misuse are found and corrected, since these often trigger actions and can return if not fully removed.',
      },
      {
        title: 'Reconsideration request',
        body: 'For manual actions we write a clear, honest request that explains what went wrong, what was fixed and the evidence, and we handle any follow-up if Google asks for more.',
      },
      {
        title: 'Prevention and monitoring',
        body: 'We set up alerts and a short set of rules for links, content and development changes, so your team can avoid repeating the issue after recovery. Reviews are scheduled each quarter.',
      },
    ],
    steps: [
      {
        title: 'Diagnose',
        body: 'We confirm whether the drop is a manual action, an algorithmic effect or something else, and identify the affected areas.',
      },
      {
        title: 'Remove the causes',
        body: 'Problem links, content and technical issues are cleaned up, with documentation of each change. Nothing is deleted without your approval.',
      },
      {
        title: 'Request review or recover',
        body: 'Manual actions go through a reconsideration request; algorithmic issues recover as pages are reassessed over time. Evidence is kept ready in case Google asks.',
      },
      {
        title: 'Monitor and prevent',
        body: 'We track visibility, watch for repeat signals and agree safeguards for future link and content work. Prevention rules are shared with your team.',
      },
    ],
    faq: [
      {
        q: 'Can you guarantee the penalty will be removed?',
        a: 'No. Google makes the decision and nobody can promise an outcome or date. What we can do is find real causes, fix them thoroughly and present the case clearly, which is what a successful review depends on. Be wary of anyone who does.',
      },
      {
        q: 'What is the difference between manual and algorithmic penalties?',
        a: 'A manual action is applied by a Google reviewer and appears in Search Console. An algorithmic drop comes from an automated update and has no notice. Manual actions allow a reconsideration request; algorithmic ones recover when the site is reassessed.',
      },
      {
        q: 'How do I know if my site is penalized?',
        a: 'Check Search Console for manual action messages first. A sudden fall that matches an update date, or pages missing from results for their own names, can also point to a problem, though technical faults can look similar. Do not ignore unexplained falls.',
      },
      {
        q: 'What if Google rejects the reconsideration request?',
        a: 'It usually means some issues were missed or not documented well enough. We review Google’s response, tackle remaining problems, such as links or content, and submit a better-supported request. A rejected request is not the end of the road, but each attempt should show real progress.',
      },
      {
        q: 'How long does recovery take?',
        a: 'It varies widely. Clean-up can take weeks on a large site, a review can take more, and algorithmic recovery may wait for the next update cycle. We will give an honest outline once we have diagnosed the problem. Rushing rarely helps.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-audit-services', 'off-page-seo', 'link-building'],
    guides: [SEO_GUIDES],
  },
];
