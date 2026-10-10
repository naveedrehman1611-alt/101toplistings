import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };

/** Specialty SEO service pages: strategy, management, multilingual, reverse, automated, global, bespoke, offshore, freelance and blogger SEO. */
export const SPECIALTY_PAGES: ServicePage[] = [
  {
    slug: 'seo-strategy',
    path: '/seo-services/seo-strategy',
    name: 'SEO Strategy',
    title: 'SEO Strategy Services | A Roadmap for Organic Growth',
    description:
      'Get a written SEO strategy built from your site audit, market and competitors: a prioritised roadmap your team or ours can follow, step by step.',
    h1: 'SEO strategy services',
    intro:
      'An SEO strategy is a written plan that decides where your organic effort goes before anyone starts fixing pages or publishing content. We research your market, audit your site and study your competitors, then deliver a prioritised roadmap for technical work, content and links that your own team or ours can put into action.',
    icon: 'alt_route',
    category: 'seo',
    hub: 'specialty',
    tag: 'Strategy',
    includes: [
      {
        title: 'Goals and discovery workshop',
        body: 'We agree what organic search should achieve for the business, such as leads, sales or sign-ups, and document your audiences, offers, markets and constraints so the plan fits how you really work.',
      },
      {
        title: 'Site audit and gap analysis',
        body: 'A review of crawlability, indexing, page quality and content coverage that shows what is blocking growth today and which gaps are worth closing first. Findings are summarised in a short report with screenshots and examples.',
      },
      {
        title: 'Keyword and demand mapping',
        body: 'Search terms grouped by intent and matched to existing or new pages, so each page has one clear job and nothing competes with itself. Pages that overlap are flagged so you can merge or retarget them early.',
      },
      {
        title: 'Competitor benchmarking',
        body: 'We compare who ranks for your target topics, what they publish and where their links come from, then point out realistic openings rather than fights you are unlikely to win.',
      },
      {
        title: 'Prioritised roadmap',
        body: 'Every recommendation is scored by likely impact and effort, then sequenced into a timeline with owners, so your team knows what to do first and why. Dependencies, such as developer time, are noted.',
      },
      {
        title: 'Measurement plan',
        body: 'The metrics, dashboards and review points that tell you whether the strategy is working, set up before work begins so progress can be judged fairly. Reporting rhythm and ownership are agreed too.',
      },
    ],
    steps: [
      {
        title: 'Discovery',
        body: 'We interview your team, review goals and analytics access, and collect everything we need to understand the business and its customers.',
      },
      {
        title: 'Research and analysis',
        body: 'We audit the site, map keywords and benchmark competitors to find where the strongest opportunities and biggest risks sit. We note quick wins as we go.',
      },
      {
        title: 'Draft the strategy',
        body: 'Findings become a sequenced roadmap with priorities, content themes, technical fixes and a link plan, written in plain language. Each item says why it matters.',
      },
      {
        title: 'Walk-through and hand-over',
        body: 'We present the plan, answer questions and adjust it with your feedback, then hand it over for your team or ours to execute.',
      },
    ],
    faq: [
      {
        q: 'How is an SEO strategy different from ongoing SEO?',
        a: 'A strategy is the plan: what to do, in what order and why. Ongoing SEO is the execution of that plan month after month. Many clients buy the strategy first, then decide who carries out the work. The two work best together.',
      },
      {
        q: 'Can my own team carry out the strategy?',
        a: 'Yes. The roadmap is written so in-house marketers, developers and writers can follow it without us. If you would rather not do the work yourselves, we can take on some or all of it separately. We can brief them on any questions along the way.',
      },
      {
        q: 'How long does it take to produce a strategy?',
        a: 'It depends on the size and complexity of the site and how quickly we receive access and answers. A small site is far quicker than a large multi-section one. We agree a timeline after the initial conversation. Rushing the research usually produces a weaker plan.',
      },
      {
        q: 'Will the strategy guarantee rankings?',
        a: 'No. Nobody outside the search engines can promise rankings. What a strategy does is focus effort on the changes most likely to help, and it defines how you will measure whether they did. Anyone claiming certainty on rankings is guessing, so be wary of such promises.',
      },
      {
        q: 'How often should a strategy be reviewed?',
        a: 'We suggest a light review each quarter and a full refresh when something big changes, such as a redesign, a new market, a platform move or a major search update. Markets and competitors rarely stand still. Regular reviews keep the plan honest.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-consulting', 'seo-management', 'custom-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'seo-management',
    path: '/seo-services/seo-management',
    name: 'SEO Management',
    title: 'SEO Management Services | Monthly Done-for-You SEO',
    description:
      'We run your SEO every month: technical upkeep, content, links and plain-English reporting, so search work keeps moving without you managing it.',
    h1: 'SEO management services',
    intro:
      'SEO management means handing the day-to-day running of your organic search work to a team that does it every month. We take responsibility for technical upkeep, content, links and reporting, follow a plan agreed with you, and show what was done and what changed, so SEO keeps progressing without adding to your workload.',
    icon: 'monitoring',
    category: 'seo',
    hub: 'specialty',
    tag: 'Managed SEO',
    includes: [
      {
        title: 'Monthly work plan',
        body: 'Each month starts with an agreed list of tasks drawn from the roadmap, ranked by impact. You see what is planned before it happens and can reorder it as business priorities shift.',
      },
      {
        title: 'Technical monitoring and fixes',
        body: 'Regular checks of crawl errors, indexing, speed and redirects, with problems fixed or ticketed for your developers before they quietly cost you traffic. Urgent issues are handled straight away rather than held for the next cycle.',
      },
      {
        title: 'Content optimisation and creation',
        body: 'Existing pages are refreshed and new ones planned, briefed and published against the keyword map, with edits focused on usefulness rather than word count. Everything we publish is tracked so we can see which changes actually helped.',
      },
      {
        title: 'Link and authority building',
        body: 'Steady, relevant link earning through outreach, partnerships and useful assets, with every placement documented and no bulk or paid-scheme shortcuts. Link targets are chosen for relevance to your sector and audience, and we share the list with you for approval before outreach begins.',
      },
      {
        title: 'Reporting you can read',
        body: 'A monthly report covering work completed, visibility, traffic, leads and next steps, written for decision-makers, with a call to talk it through when you want one. We also flag anything unusual that needs a decision.',
      },
      {
        title: 'Named point of contact',
        body: 'One person who knows your account, answers questions and raises issues early, so you are never chasing for updates or explaining your business twice. Introductions to your developers and writers are handled by this person.',
      },
    ],
    steps: [
      {
        title: 'Onboarding and baseline',
        body: 'We take access, review the current state of the site and record starting numbers, so later progress is measured against something real.',
      },
      {
        title: 'Plan the first quarter',
        body: 'Priorities from the audit and strategy become a three-month plan with clear tasks, owners and the results we will track.',
      },
      {
        title: 'Execute each month',
        body: 'We carry out the agreed work, fix new issues as they appear and keep you informed through regular check-ins. Nothing is left unexplained.',
      },
      {
        title: 'Report and adjust',
        body: 'After each cycle we review results with you and change the plan based on what the data shows, not on habit.',
      },
    ],
    faq: [
      {
        q: 'What is included in monthly SEO management?',
        a: 'Typically technical monitoring, on-page improvements, content work, link building and reporting, scaled to the size of the site. Exact scope is written down at the start so you know what each month covers. Larger sites with many sections need more hours than a small brochure site.',
      },
      {
        q: 'How is this different from a one-off SEO strategy?',
        a: 'A strategy is a plan delivered once. Management is the continuing execution: we do the work, monitor the results and adapt the plan. You can start with a strategy and move into management later. It also keeps work going in the gaps between projects, which is where many sites slip.',
      },
      {
        q: 'Do I need a long contract?',
        a: 'SEO takes sustained effort, so a minimum commitment of a few months is common, but we would rather earn renewal than lock you in. Terms are discussed openly before you sign anything. If it is not working for you, we would rather talk about it than hold you to it.',
      },
      {
        q: 'How do you handle search algorithm updates?',
        a: 'We watch for changes, check whether your pages are affected and respond with evidence rather than panic. A sound site built on useful content tends to need adjustments, not rebuilds. Many updates affect only certain kinds of page, so a measured review beats rushed edits across the whole site.',
      },
      {
        q: 'When will I see results?',
        a: 'Some technical fixes show an effect within weeks, while content and authority usually take months, depending on competition and your starting point. We cannot promise rankings, but we report honestly on progress. Slow months do happen, and we explain the reasons when they do.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-strategy', 'outsourced-seo', 'bespoke-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'multilingual-seo',
    path: '/seo-services/multilingual-seo',
    name: 'Multilingual SEO',
    title: 'Multilingual SEO Services | Rank in Every Language',
    description:
      'Reach searchers in their own language with native keyword research, proper localisation and correct hreflang, not just a translated copy of your site.',
    h1: 'Multilingual SEO services',
    intro:
      'Multilingual SEO is the practice of making a website findable in more than one language. It goes further than translation: people search differently in each language, so we research keywords natively, adapt content to the culture behind it and set up the technical signals, such as hreflang, that tell search engines which version to show.',
    icon: 'language',
    category: 'seo',
    hub: 'specialty',
    tag: 'Multilingual',
    includes: [
      {
        title: 'Language and audience research',
        body: 'We identify which languages bring real search demand for your offer, including regional variants such as Latin American and European Spanish, so you do not translate pages nobody will search for.',
      },
      {
        title: 'Native keyword research per language',
        body: 'Keywords are researched in each language from scratch, because a direct translation of your English term is often not what local searchers actually type. Search volume tools differ by market, so we check several sources.',
      },
      {
        title: 'Translation versus localisation',
        body: 'We advise where plain translation is enough and where pages need localising, covering idioms, units, currency, examples and tone, so the content reads as written for that reader. Decisions are documented for your translators.',
      },
      {
        title: 'URL structure and hreflang',
        body: 'We choose between subfolders, subdomains or separate domains, then implement hreflang and canonical tags correctly so language versions do not compete or get confused. Dates, address formats and legal wording are checked too.',
      },
      {
        title: 'Translated metadata and schema',
        body: 'Titles, descriptions, headings, image alt text and structured data are written in each language, because untranslated snippets are a common reason local pages underperform. We also review how snippets display in each market’s results.',
      },
      {
        title: 'Language-specific links and tracking',
        body: 'Link outreach aimed at sites in each language, plus separate reporting per language version so you can see which ones are earning their keep. Separate dashboards show which languages need more attention.',
      },
    ],
    steps: [
      {
        title: 'Choose languages',
        body: 'We weigh search demand, competition and your ability to serve customers to decide which languages deserve investment first. We also consider customer service coverage.',
      },
      {
        title: 'Plan structure and keywords',
        body: 'We settle the URL setup and build a separate keyword map per language, matched to the pages you will publish.',
      },
      {
        title: 'Localise and implement',
        body: 'Content is translated or rewritten by native speakers, then published with hreflang, canonicals and translated metadata in place. Reviewers sign off before anything goes live.',
      },
      {
        title: 'Monitor each language',
        body: 'We track indexing, rankings and conversions per language, fix signal errors and expand to further languages when the data supports it.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between translation and localisation?',
        a: 'Translation converts words from one language to another. Localisation also adapts examples, currency, formats, tone and search terms to the audience. Pages that only translate often read oddly and rank poorly. The second is what helps pages match real search behaviour in each market, so most sites need both.',
      },
      {
        q: 'Should each language have its own website?',
        a: 'Not always. Subfolders on one domain are often simplest to maintain and share authority, while separate domains can suit distinct brands or legal needs. We explain the trade-offs for your situation before recommending one. Either way, each language version needs its own unique, well-linked pages.',
      },
      {
        q: 'Is machine translation acceptable?',
        a: 'It can help as a first draft, but unreviewed machine output tends to be stiff or wrong and can read as low-effort content. We recommend native-speaker review, especially for pages that sell or carry legal weight. Mistakes in meaning can also damage trust and lose sales.',
      },
      {
        q: 'Do I need hreflang?',
        a: 'If you have equivalent pages in several languages or regions, hreflang helps search engines serve the right version. It is easy to get wrong, so we test the annotations and report any errors we find. We can audit existing annotations first if you already have some.',
      },
      {
        q: 'How long until a new language version performs?',
        a: 'It varies with competition, how much content you publish and the strength of your domain. Established sites often move faster than new ones. We cannot promise timings, but we measure each language separately. Smaller language markets with fewer competitors can sometimes move faster.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['international-seo', 'global-seo', 'technical-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'reverse-seo',
    path: '/seo-services/reverse-seo',
    name: 'Reverse SEO',
    title: 'Reverse SEO Services | Reduce Negative Search Results',
    description:
      'Push damaging search results down by building positive, accurate pages that earn their place, using ethical methods that follow search engine guidelines.',
    h1: 'Reverse SEO services',
    intro:
      'Reverse SEO is the work of reducing how visible unwanted search results are, usually by building stronger, accurate pages that rank above them. We do not delete other people’s content or hide the truth. We create and improve assets you own or earn, so what people see first when they search your name is fair and current.',
    icon: 'visibility',
    category: 'seo',
    hub: 'specialty',
    tag: 'ORM',
    includes: [
      {
        title: 'Search results audit',
        body: 'We review what appears for your brand or personal name across first pages, related queries, images and suggestions, and note which results hurt, which help and which are neutral. Findings go into a simple ranked list.',
      },
      {
        title: 'Root cause assessment',
        body: 'We look at why a negative result ranks, such as an old article, a review profile or a forum thread, and judge whether it is accurate, outdated or open to a legitimate removal request.',
      },
      {
        title: 'Owned asset development',
        body: 'We strengthen your website, About and leadership pages, and official profiles, with accurate, well-structured content that gives search engines good pages to show. Pages are written for people first, with clear facts about who you are and what you do.',
      },
      {
        title: 'Earned coverage and profiles',
        body: 'Genuine interviews, partner mentions and credible third-party profiles that deserve to rank, built through honest outreach and never through fake reviews or planted articles. Quality and relevance matter more than the number of mentions.',
      },
      {
        title: 'Legitimate removal routes',
        body: 'Where content breaks a platform policy or the law, we help prepare the right request. Outcomes sit with the platform or court, and we cannot promise removal. Anything legitimate is documented thoroughly first.',
      },
      {
        title: 'Monitoring and response guidance',
        body: 'Alerts for new mentions and review activity, plus advice on replying calmly and factually, so new problems are caught before they spread. You get monthly summaries showing what appeared, what moved and what needs attention.',
      },
    ],
    steps: [
      {
        title: 'Audit the results',
        body: 'We capture the current search landscape for your name and brand, and sort each result by accuracy, visibility and potential harm.',
      },
      {
        title: 'Decide the approach',
        body: 'We agree what can be corrected, what can be removed on policy grounds and what needs positive content built around it.',
      },
      {
        title: 'Build positive assets',
        body: 'We create and improve pages and profiles you control, and earn credible mentions that can compete for the same searches.',
      },
      {
        title: 'Monitor and maintain',
        body: 'We watch results over time, report what moved and keep the new assets current so the improvement lasts. You receive regular summaries.',
      },
    ],
    faq: [
      {
        q: 'Can you remove a negative result completely?',
        a: 'Not on demand. Content hosted by others can usually only be removed by the site owner, the platform or a legal process. We can support legitimate requests, but we never promise a removal or hide behind guarantees. We tell you early which route looks realistic.',
      },
      {
        q: 'Is reverse SEO ethical?',
        a: 'Done properly, yes. We build accurate content and earn real coverage. We do not buy fake reviews, post false claims about others or use tactics that break search engine guidelines, because those risk making the problem worse. Honest methods are slower but safer.',
      },
      {
        q: 'How does it differ from reputation management?',
        a: 'Reputation management is the wider job, including customer service and review replies. Reverse SEO is the search-specific part: shifting which pages appear and in what order when people look you up. Many clients need both, and we can coordinate with whoever handles customer replies.',
      },
      {
        q: 'How long does it take?',
        a: 'It depends on how strongly the negative result ranks, how much competition for your name exists and how quickly we can build credible pages. Expect months of steady work, not days, and no fixed outcome. We would rather tell you that plainly than leave you disappointed later.',
      },
      {
        q: 'What if the negative content is true?',
        a: 'Then it generally cannot and should not be removed. We focus on adding fair context, such as what has changed since, and on building positive, factual pages so the full picture is easier to see. A simple, truthful response from you often helps as well.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['white-hat-seo', 'off-page-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'automated-seo',
    path: '/seo-services/automated-seo',
    name: 'Automated SEO',
    title: 'Automated SEO Services | Scale With Human Oversight',
    description:
      'Use automation for monitoring, reporting and technical checks across large sites, with people reviewing the output so quality does not slip as you scale.',
    h1: 'Automated SEO services',
    intro:
      'Automated SEO uses software to handle the repetitive parts of search work, such as monitoring, technical checks, reporting and templated page elements, across sites too large to review by hand. We set it up and keep people in charge of judgement, because automation finds problems quickly but cannot decide strategy or write trustworthy copy alone.',
    icon: 'smart_toy',
    category: 'seo',
    hub: 'specialty',
    tag: 'Automated',
    includes: [
      {
        title: 'Automated technical monitoring',
        body: 'Scheduled crawls and alerts for broken links, redirect chains, noindex mistakes, sitemap errors and speed regressions, so changes that hurt search are spotted within days. Alert rules are tuned to avoid noise.',
      },
      {
        title: 'Rank and visibility tracking',
        body: 'Automated tracking of keywords, pages and segments across locations and devices, with notes on notable movements for a person to investigate instead of raw numbers. Reports separate real changes from normal daily fluctuation.',
      },
      {
        title: 'Templated on-page elements',
        body: 'Rules that generate titles, meta descriptions and schema for large sets of similar pages, such as products or listings, with exceptions for pages that need hand-written treatment. Rules are tested on a small batch first.',
      },
      {
        title: 'Reporting pipelines',
        body: 'Dashboards that pull from search, analytics and crawl data so reports update themselves, leaving analyst time for explaining what the numbers mean. Each report is built once and then refreshes on a schedule you choose, with commentary added by an analyst.',
      },
      {
        title: 'Quality controls and review',
        body: 'Sampling, thresholds and manual approval steps so templated or generated output is checked before it goes live, avoiding thin, repetitive pages. Anything that fails a check is held back until someone has looked at it and decided what to do.',
      },
      {
        title: 'Workflow and ticketing integration',
        body: 'Findings routed straight into your issue tracker with context and priority, so detected problems actually get fixed rather than sitting in a report. Priorities and owners are attached so engineers can act without extra explanation.',
      },
    ],
    steps: [
      {
        title: 'Map the manual work',
        body: 'We list the checks and reports your team repeats, then pick the ones where automation saves time without risking quality.',
      },
      {
        title: 'Build and test',
        body: 'We configure crawlers, rules and dashboards on a sample first, and compare their output with manual checks to confirm they are accurate.',
      },
      {
        title: 'Add human review',
        body: 'We define who approves what, set alert thresholds and agree which decisions always stay with a person. This keeps accountability clear.',
      },
      {
        title: 'Run and refine',
        body: 'The system runs on schedule, and we tune rules, remove noisy alerts and expand coverage as the site changes. Reviews happen on a regular schedule.',
      },
    ],
    faq: [
      {
        q: 'What can automation not do?',
        a: 'It cannot set strategy, judge whether content is genuinely useful or understand your customers. It also produces false alarms. We treat it as a way to spot issues faster, with people making the decisions. Use it as an assistant, not a substitute for judgement.',
      },
      {
        q: 'Will automated content get my site penalised?',
        a: 'Mass-produced pages written to manipulate rankings risk poor performance or manual action. We avoid that. Automation is used for checks and structured elements, and anything published at scale is reviewed for real value. Reviewing samples before publishing is the key safeguard against that outcome.',
      },
      {
        q: 'Is it only for big websites?',
        a: 'It pays off most on large or fast-changing sites, such as catalogues and multi-location businesses. On a small site, manual review is often cheaper and more effective, and we will tell you if that applies to you. Honest scoping is part of the service.',
      },
      {
        q: 'How is this different from buying an SEO tool?',
        a: 'A tool gives you data. We configure it for your site, remove noise, connect it to your workflow and interpret the findings. You can keep the setup afterwards or have us keep running it. The result is a system fitted to your site rather than a generic dashboard.',
      },
      {
        q: 'How soon will I see an effect?',
        a: 'Monitoring and reporting savings appear quickly. Ranking and traffic effects depend on which issues are fixed and how competitive your market is, so we cannot give a guaranteed timeline. Faster detection of problems is usually the first benefit, while changes in traffic follow more slowly and depend on many factors outside anyone’s control.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['technical-seo', 'seo-audit-services', 'enterprise-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'global-seo',
    path: '/seo-services/global-seo',
    name: 'Global SEO',
    title: 'Global SEO Services | Grow One Brand Across Countries',
    description:
      'Grow one brand in many countries at once: market prioritisation, a shared playbook, clear governance and local execution, so each market gets what it needs.',
    h1: 'Global SEO services',
    intro:
      'Global SEO is the programme of growing organic search for one brand across many countries at the same time. The focus is on which markets to enter first, how head office and local teams share the work, and how results are compared fairly, while the technical set-up in each country follows from those choices.',
    icon: 'public',
    category: 'seo',
    hub: 'specialty',
    tag: 'Multi-Country',
    includes: [
      {
        title: 'Market prioritisation',
        body: 'We score countries on search demand, competition, buying power, delivery capability and legal fit, then recommend a launch order so effort goes where returns are likeliest. The shortlist is shared with stakeholders for challenge.',
      },
      {
        title: 'Global operating model',
        body: 'A clear split between what is decided centrally, such as brand, templates and tracking, and what local teams own, such as offers, tone and local partnerships. Responsibilities are written down and shared.',
      },
      {
        title: 'Shared SEO playbook',
        body: 'Written standards for page types, naming, metadata, content briefs and quality checks, so every market publishes to the same bar without rewriting the rules each time. It becomes the reference for every market.',
      },
      {
        title: 'Cross-market measurement',
        body: 'Consistent reporting that compares markets on like-for-like terms, adjusting for market size and maturity, so leadership can see where to invest more or pause. Currency and language differences are handled in the reporting layer.',
      },
      {
        title: 'Brand and content governance',
        body: 'Approval flows, shared glossaries and review points that keep messaging consistent while leaving room for genuine local relevance and regulation. Local legal and cultural requirements are built into review points, so nothing sensitive goes live without the right local check.',
      },
      {
        title: 'Rollout support',
        body: 'Hands-on help launching each new market against the plan, then handing day-to-day work to local teams, an agency partner or our team. We stay involved through early results, then step back as local owners gain confidence.',
      },
    ],
    steps: [
      {
        title: 'Assess the footprint',
        body: 'We review current rankings, traffic and revenue by country and the resources each local team has available. Gaps in local skills are noted early.',
      },
      {
        title: 'Choose and sequence markets',
        body: 'We rank countries by opportunity and effort, then propose a phased rollout that fits budget and capacity. We show the reasoning behind every choice.',
      },
      {
        title: 'Set governance and standards',
        body: 'We write the playbook, define who decides what and set up the shared reporting before the first market launches. Everything is written down and shared.',
      },
      {
        title: 'Launch, learn, repeat',
        body: 'Each market goes live, we review results against the playbook, and lessons are fed into the next country on the list.',
      },
    ],
    faq: [
      {
        q: 'How is global SEO different from international SEO?',
        a: 'International SEO is mostly the technical set-up for serving the right pages to the right country and language. Global SEO sits above it: choosing markets, organising teams and keeping many countries consistent. Both are needed when a brand operates in several countries, and the work overlaps in practice.',
      },
      {
        q: 'Do we need to launch in every country at once?',
        a: 'Rarely. Starting with the strongest few markets and expanding in phases usually works better. The plan we build sets out an order based on opportunity and your ability to serve each market properly. Early success in a few markets also builds the case for further investment.',
      },
      {
        q: 'Who should own SEO in each market?',
        a: 'That depends on your organisation. Some brands keep a central team and use local reviewers, others give each country a specialist. We help you choose a model and write down responsibilities so nothing falls between teams. The right model usually changes as the number of markets grows.',
      },
      {
        q: 'Can Google Ads and global SEO work together?',
        a: 'Yes. Paid search can test demand and messaging in a new country while organic results build up, and the learning can inform content. They are separate channels, so we measure them separately. Paid channels have their own costs and rules, so we keep their results separate from organic performance.',
      },
      {
        q: 'How long before a new country shows results?',
        a: 'It depends on competition, language, the strength of your brand there and how fast content ships. We do not promise timelines, but each market is tracked against agreed measures so progress is visible. Markets with strong local competitors or heavy regulation may take longer than others.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['international-seo', 'multilingual-seo', 'enterprise-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'bespoke-seo',
    path: '/seo-services/bespoke-seo',
    name: 'Bespoke SEO',
    title: 'Bespoke SEO Services | Senior-Led Premium SEO',
    description:
      'A high-touch SEO partnership for complex or high-value sites: senior specialists, a dedicated lead, custom reporting and a plan built around your business.',
    h1: 'Bespoke SEO services',
    intro:
      'Bespoke SEO is a premium, high-touch way of working for sites where the stakes or the complexity are high, such as large catalogues, regulated sectors or high-value leads. You get senior specialists, a dedicated lead, reporting shaped around your board and teams, and a programme designed for your business instead of a fixed package.',
    icon: 'star',
    category: 'seo',
    hub: 'specialty',
    tag: 'Bespoke',
    includes: [
      {
        title: 'Senior specialist team',
        body: 'Experienced strategists, technical SEOs and editors work on your account directly, rather than leaving the judgement calls to junior staff following a checklist. Their experience shortens the time between spotting a problem and fixing it properly.',
      },
      {
        title: 'Dedicated account lead',
        body: 'One accountable person who knows your business in depth, attends your planning meetings and brings issues and opportunities to you before you ask. They are the person you call when something unexpected happens.',
      },
      {
        title: 'Programme designed around you',
        body: 'Scope, priorities and ways of working are built from your commercial model, release cycles and internal approvals, and revisited regularly as the business changes. Nothing is copied from a template without being checked against your situation.',
      },
      {
        title: 'Custom reporting and dashboards',
        body: 'Metrics tied to revenue, lead quality and your own definitions of success, delivered in the formats executives and specialist teams each actually use. You choose what appears and how often it arrives.',
      },
      {
        title: 'Deep technical and data work',
        body: 'Log file analysis, rendering checks, large-scale crawl segmentation and bespoke data pulls for the problems standard audits are not designed to catch. These analyses require time and experience, so we use them only where the likely payoff justifies it.',
      },
      {
        title: 'Collaboration with your teams',
        body: 'Close work with developers, product, legal and brand stakeholders, including documented requirements and testing support, so recommendations are shipped rather than shelved. We provide briefing documents and attend meetings where decisions are made.',
      },
    ],
    steps: [
      {
        title: 'Immersion',
        body: 'We study your business model, customers, systems and internal processes, and meet the people who will approve or deliver changes.',
      },
      {
        title: 'Design the programme',
        body: 'We shape scope, team, governance and reporting around what you need, and agree success measures with senior stakeholders. Roles and review points are clear to everyone.',
      },
      {
        title: 'Deliver with senior oversight',
        body: 'Work proceeds in short cycles with regular reviews, senior sign-off on important decisions and direct access to the people doing it.',
      },
      {
        title: 'Review and evolve',
        body: 'Each quarter we assess results against goals and reshape the programme, adding or removing workstreams as priorities move. Nothing is fixed permanently.',
      },
    ],
    faq: [
      {
        q: 'How is bespoke SEO different from custom SEO?',
        a: 'Custom SEO tailors a plan to what an audit finds. Bespoke SEO goes further on people and process, with a senior team, a dedicated lead and reporting designed around your organisation. It is aimed at complex, high-value sites. The difference is mostly in the depth of service.',
      },
      {
        q: 'Who is it best suited to?',
        a: 'Businesses with large or technically complex websites, high-value leads or sales, regulated content or many stakeholders. If your site is small and simple, a lighter service will usually serve you better and cost less. Competition, site health and the scale of change all play a part, so we avoid giving fixed timelines.',
      },
      {
        q: 'Will I work with senior people or juniors?',
        a: 'Senior specialists lead the strategy and key decisions, supported by other team members for routine tasks. You are told who works on your account and what each person is responsible for. If your site does not need that level of attention, we will suggest something simpler.',
      },
      {
        q: 'Can reporting fit our internal systems?',
        a: 'Often, yes. We can build dashboards and scheduled exports around the tools and definitions your teams already use, subject to data access. We agree the format and cadence at the start. You can ask us to introduce the specialists before you commit to anything.',
      },
      {
        q: 'Do you guarantee results?',
        a: 'No. A premium service buys expertise, attention and accountability, not a promised ranking. We commit to clear goals, honest reporting and regular reviews of whether the programme is working. Our reports show what was done and what happened next, so you can decide whether the investment is justified.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['custom-seo', 'enterprise-seo', 'seo-consulting'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'offshore-seo',
    path: '/seo-services/offshore-seo',
    name: 'Offshore SEO',
    title: 'Offshore SEO Services | Remote SEO Team You Can Trust',
    description:
      'A remote SEO team in another time zone with agreed overlap hours, clear communication and quality control, so distance does not hurt delivery.',
    h1: 'Offshore SEO services',
    intro:
      'Offshore SEO means working with a team based in a different country and time zone to run your search programme. The value is dedicated capacity and specialist skills; the risk is distance. We handle that with agreed overlap hours, written processes, shared tools and quality checks, so you get predictable delivery and visible work.',
    icon: 'schedule',
    category: 'seo',
    hub: 'specialty',
    tag: 'Offshore',
    includes: [
      {
        title: 'Agreed overlap hours',
        body: 'We set a daily window when your contacts and our team are both online, so questions get answered the same day and urgent issues are not left overnight. Calendars are shared so booking is easy.',
      },
      {
        title: 'Communication rhythm',
        body: 'A regular pattern of short stand-ups, written updates and monthly reviews through your preferred channels, so you always know what happened and what is next. Urgent matters have a separate route.',
      },
      {
        title: 'Shared tools and access',
        body: 'Work happens in project boards, documents and analytics you can see, with access set at the right level and logged, instead of in files you never get to inspect. Permissions can be removed instantly.',
      },
      {
        title: 'Documented processes',
        body: 'Briefs, checklists and style guides written down, so output does not depend on one person’s memory and new team members can pick up your account quickly. Handover notes cover recurring tasks.',
      },
      {
        title: 'Quality control layers',
        body: 'Every deliverable is reviewed by a second person before it reaches you, with spot checks on live changes and a record of fixes and revisions. Approvals are recorded so you can trace decisions.',
      },
      {
        title: 'Market and language review',
        body: 'Content for your audience is edited by someone who knows your language, spelling and sector, with your feedback used to refine the brief next time. Local spelling and terminology are applied consistently.',
      },
    ],
    steps: [
      {
        title: 'Set up the working model',
        body: 'We agree time zones, contacts, tools, approval steps and escalation routes, and write them into a short working agreement. The agreement can be updated later.',
      },
      {
        title: 'Onboard and trial',
        body: 'The team learns your business and starts with a defined set of tasks, so both sides can judge fit before scaling up.',
      },
      {
        title: 'Deliver and review',
        body: 'Work runs in regular cycles with written updates, second-person checks and a standing review where you give direct feedback. Issues are logged and resolved openly.',
      },
      {
        title: 'Scale or adjust',
        body: 'Once the rhythm is working, we add scope or capacity, or change the model if something is not serving you well.',
      },
    ],
    faq: [
      {
        q: 'How do you manage the time difference?',
        a: 'We agree overlap hours up front and keep important discussions inside them. Outside those hours the team works from written briefs and tickets, so progress continues and nothing waits for a live conversation. Urgent matters have an agreed escalation route that works at any hour.',
      },
      {
        q: 'How do you keep quality high without being in the room?',
        a: 'Through documented standards, peer review before delivery, shared access to the work and regular check-ins. You can see what is being done and challenge it at any point rather than waiting for a monthly report. Transparency is the main protection against surprises.',
      },
      {
        q: 'Will the team understand my market?',
        a: 'They need briefing and we build that in: research on your audience, competitor review and a style guide. Content that needs native fluency is edited by someone who knows your market, and we welcome your corrections. Examples from your own site help the team calibrate quickly.',
      },
      {
        q: 'Can you work alongside my in-house team?',
        a: 'Yes. Many clients use us to extend an existing team, taking on technical work, content production or reporting. We fit into your tools, tickets and approval flow instead of asking you to change them. Handovers are structured so the two groups stay aligned on goals.',
      },
      {
        q: 'Is offshore SEO right for everyone?',
        a: 'Not always. If you need frequent real-time workshops during your own local business hours, or your work is heavily confidential, a local partner may suit you better. We will say so if that looks true. Cost savings are possible but are not the main reason to choose this model.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['outsourced-seo', 'seo-management', 'white-label-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'freelance-seo',
    path: '/seo-services/freelance-seo',
    name: 'Freelance SEO',
    title: 'Freelance SEO Services | Freelancer or Agency?',
    description:
      'Find out when a freelance SEO specialist fits and when an agency is the safer choice, with an honest look at cost, capacity, risk and continuity.',
    h1: 'Freelance SEO services',
    intro:
      'Freelance SEO means hiring an individual specialist rather than an agency team. It can be a good fit for focused projects and smaller budgets, but one person has limits on range and availability. This page explains the trade-offs honestly and, where a freelancer is not the right answer, how our agency team compares.',
    icon: 'person',
    category: 'seo',
    hub: 'specialty',
    tag: 'Freelance',
    includes: [
      {
        title: 'Single-project work',
        body: 'Discrete tasks such as an audit, a keyword map, a content refresh or a migration check, scoped with a clear deliverable and end date instead of an open-ended retainer. Costs and timing stay predictable.',
      },
      {
        title: 'Direct specialist access',
        body: 'You talk to the person doing the work, with no account layer between you, which can make decisions faster for small sites and founder-led companies. Feedback loops are short and nothing gets lost in translation.',
      },
      {
        title: 'Advice for your in-house team',
        body: 'Part-time guidance and reviews for marketers who run SEO themselves but want an expert second opinion, training or a regular sanity check. Sessions can be one-off or recurring, and we leave you with written notes to share with colleagues.',
      },
      {
        title: 'Honest fit assessment',
        body: 'We explain what a freelancer can realistically cover, such as strategy, audits or writing, and where a team is needed, such as development, outreach at volume or a wide technical stack.',
      },
      {
        title: 'Vetting checklist',
        body: 'Questions to ask any freelancer or agency: examples of past work you can verify, how they report, what access they need and what happens if they become unavailable. These apply equally if you consider hiring us.',
      },
      {
        title: 'Hand-over documentation',
        body: 'Written notes, logins and a change log at the end of every engagement, so you are never dependent on one individual to understand your own SEO. You own everything we produce, and can take it anywhere.',
      },
    ],
    steps: [
      {
        title: 'Define the need',
        body: 'We clarify whether you need a one-off project, ongoing support or a full programme, and how much capacity that realistically takes.',
      },
      {
        title: 'Compare the options',
        body: 'We lay out how a freelancer, an agency team or an in-house hire would handle it, including the risks of each.',
      },
      {
        title: 'Scope the work',
        body: 'The chosen route is written up with deliverables, access, timing and reporting, so expectations are clear before any work begins.',
      },
      {
        title: 'Deliver and document',
        body: 'The work is completed and handed over with notes, so you can continue yourself, bring in a team or return to us later.',
      },
    ],
    faq: [
      {
        q: 'When is a freelancer the better choice?',
        a: 'For a defined project, a small site, a tight budget or a need for one experienced adviser, a freelancer is often a good fit. You get direct access and less overhead, as long as the scope stays within one person’s range.',
      },
      {
        q: 'When is an agency the safer choice?',
        a: 'When the work needs several skills at once, such as development, content, outreach and analytics, or when it must continue during holidays and illness. A team spreads the risk that one person is unavailable. Continuity is the other big advantage of a team.',
      },
      {
        q: 'What are the main risks of hiring a freelancer?',
        a: 'Single-person dependence, limited capacity, uneven skills across technical and content work, and weaker continuity if they leave. Verify past work, agree hand-over terms and keep ownership of your own accounts and logins. These risks are manageable when you plan for them from the start.',
      },
      {
        q: 'How do I know a freelancer is legitimate?',
        a: 'Ask for work you can check, a clear method, plain reporting and no ranking guarantees. Be careful with anyone promising first-page results or asking for control of your accounts without explaining why. Pressure tactics and secrecy about methods are warning signs worth taking seriously.',
      },
      {
        q: 'Do you offer freelance-style engagements?',
        a: 'We offer project-based work such as audits, strategy and advice with no long retainer. For ongoing programmes, our team-based approach covers more skills. We will recommend whichever suits your situation, even if that is not us. There is no pressure to move beyond a single project.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-consulting', 'outsourced-seo', 'seo-management'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'seo-for-bloggers',
    path: '/seo-services/seo-for-bloggers',
    name: 'SEO for Bloggers',
    title: 'SEO for Bloggers | Grow Blog Traffic and Authority',
    description:
      'SEO for content sites and blogs: topical authority, content audits, internal linking and ad- or affiliate-friendly page structure for steady organic growth.',
    h1: 'SEO for bloggers',
    intro:
      'SEO for bloggers is built around a content library rather than a handful of service pages. We help blogs and content sites earn topical authority by covering subjects thoroughly, linking posts together and keeping older articles accurate, while protecting the reading experience that advertising and affiliate income depend on. This suits personal blogs, niche publishers and affiliate sites alike.',
    icon: 'manage_search',
    category: 'seo',
    hub: 'specialty',
    tag: 'Bloggers',
    includes: [
      {
        title: 'Topic cluster planning',
        body: 'We organise your subject area into pillar articles and supporting posts, so search engines see depth on a topic and readers can follow a clear path from beginner to advanced.',
      },
      {
        title: 'Content audit and pruning',
        body: 'Every post is rated as keep, update, merge or remove, based on traffic, intent match and quality, so thin or overlapping articles stop diluting the rest. Decisions are listed in a simple spreadsheet.',
      },
      {
        title: 'Search intent matching',
        body: 'Briefs and rewrites that match what searchers want, whether a quick answer, a list, a comparison or a full guide, rather than padding to reach a word count. Each brief states the main question the post answers.',
      },
      {
        title: 'Internal linking system',
        body: 'Deliberate links between related posts and from popular pages to newer ones, so authority flows around the site and readers find more of what they came for. Anchor text stays natural and descriptive.',
      },
      {
        title: 'Monetisation-friendly optimisation',
        body: 'Page layouts, ad placement, affiliate disclosures and speed reviewed together, so revenue elements do not push down content or slow the page and hurt rankings. Any trade-off between income and speed is explained.',
      },
      {
        title: 'Technical blog hygiene',
        body: 'Category and tag clean-up, pagination, archive handling, schema for articles, image weight and Core Web Vitals checks on your blogging platform. We also check that images are compressed, that pagination is handled properly and that old archives are not wasting crawl effort.',
      },
    ],
    steps: [
      {
        title: 'Audit the library',
        body: 'We crawl the blog, review analytics and search data, and sort every post by what it contributes today and what it could.',
      },
      {
        title: 'Plan topics and updates',
        body: 'We build a map of clusters, refresh priorities and new post ideas, based on demand and gaps, not on guesswork.',
      },
      {
        title: 'Improve and publish',
        body: 'Priority posts are rewritten, merged or linked, and new content follows briefs that match intent and your voice. Changes are logged for later comparison.',
      },
      {
        title: 'Track and refresh',
        body: 'We watch traffic, engagement and earnings by topic, and schedule regular refreshes for posts whose information goes stale. Stale facts are the first thing we look for.',
      },
    ],
    faq: [
      {
        q: 'What is topical authority?',
        a: 'It is the idea that a site covering a subject thoroughly and consistently is more likely to be seen as a reliable source on it. Building it means useful depth, clear structure and linking, not simply publishing more posts. Depth beats volume.',
      },
      {
        q: 'Should I delete old posts?',
        a: 'Not automatically. Weak or duplicate posts can be updated, merged into stronger ones or removed with a redirect. We decide case by case from the data, because deleting content that still earns traffic can be a mistake. Every change should have a reason.',
      },
      {
        q: 'Will SEO changes hurt my ad or affiliate income?',
        a: 'They should not if done carefully. We review layout, speed and disclosures together, aiming for pages that satisfy readers and search engines. We flag any trade-off to you before making it. Clean disclosure and good layout also help earn reader trust over the long term.',
      },
      {
        q: 'Can you help blogs in more than one language?',
        a: 'Yes. Blogs in other languages need keyword research in that language and sensible structure for translated versions. We treat each language as its own audience instead of translating English posts word for word. Local audience habits and spelling differences are taken into account as well.',
      },
      {
        q: 'How do you measure success for a blog?',
        a: 'We look at organic visits to priority posts, impressions and clicks from search, engagement and, where relevant, revenue per topic. We cannot promise rankings, but we show which changes moved which numbers. Search traffic alone can mislead, so we pair it with engagement signals.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['content-marketing', 'on-page-seo', 'link-building'],
    guides: [SEO_GUIDES],
  },
];
