import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };

/**
 * Link-and-partnership service pages (white hat, white label, reseller, outsourced)
 * and the AI and new-search pages (AI SEO, AEO, GEO, voice search, video).
 */
export const LINKS_AI_PAGES: ServicePage[] = [
  {
    slug: 'white-hat-seo',
    path: '/seo-services/white-hat-seo',
    name: 'White Hat SEO',
    title: 'White Hat SEO Services | Guideline-Safe Growth',
    description:
      'SEO that follows search engine guidelines: original content, clean technical work and earned links, with penalty risks flagged before they cost you traffic.',
    h1: 'White hat SEO services',
    intro:
      'White hat SEO means improving a website only with methods that follow search engine guidelines: useful content, sound technical foundations and links that are earned rather than bought or manufactured. As a white hat SEO agency we weigh every tactic by its risk as well as its upside, so the visibility you build does not depend on a loophole that can close.',
    icon: 'verified_user',
    category: 'seo',
    hub: 'links',
    tag: '100% Safe',
    includes: [
      {
        title: 'Guideline and risk review',
        body: 'We check your pages and link profile against published search guidelines and flag hidden text, doorway pages, paid links, scraped copy and similar tactics, with a plain-language risk rating for each one found.',
      },
      {
        title: 'Content that earns its place',
        body: 'Pages are planned around a real search need and written for the reader first, with original information, clear authorship and sources, rather than thin pages produced only to catch keywords.',
      },
      {
        title: 'Clean technical foundations',
        body: 'Crawlable structure, correct redirects and canonicals, honest structured data and fast pages. We do not cloak content or show search engines something different from what visitors see. Page speed and mobile usability are fixed at the source, not hidden behind tricks.',
      },
      {
        title: 'Earned link acquisition',
        body: 'Links come from outreach, original resources and genuine mentions, not private blog networks, paid placements or mass link swaps. Each target is checked for real audience and topical fit first.',
      },
      {
        title: 'Past-work and vendor audit',
        body: 'If an earlier agency or freelancer worked on your site, we review their links, redirects and templated pages, then recommend what to keep, fix, remove or disavow. You get the findings in writing, so decisions about cleanup are yours.',
      },
      {
        title: 'Documented change log',
        body: 'Every significant change is recorded with the reason behind it, so you can see exactly what was done to your site and answer questions about it later. The log is yours to keep, even if we stop working together.',
      },
    ],
    steps: [
      {
        title: 'Risk audit',
        body: 'We review content, links and technical setup against search guidelines and list anything that could trigger a penalty or a loss of trust.',
      },
      {
        title: 'Ground rules',
        body: 'We agree what is in and out of bounds, including link sources, content standards and the use of automation, before any work begins.',
      },
      {
        title: 'Build steadily',
        body: 'We fix foundations, publish useful pages and earn links at a pace that looks natural for your site and your industry.',
      },
      {
        title: 'Monitor and adjust',
        body: 'We watch rankings, indexing and guideline updates, and change course quickly when a tactic starts to look risky. We also review each month which activities add real value and which should stop.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between white hat and black hat SEO?',
        a: 'White hat SEO works within search engine guidelines and aims to help users. Black hat SEO tries to manipulate rankings with tactics such as link schemes, cloaking or hidden text. The second can win quickly but often ends in penalties or lost visibility.',
      },
      {
        q: 'Is white hat SEO slower than other methods?',
        a: 'It can feel slower at the start because content and trust take time to build, and no ethical agency can promise a timeframe. The trade-off is that gains are less likely to be wiped out by an algorithm update or a manual action.',
      },
      {
        q: 'Can you guarantee first-page rankings?',
        a: 'No. Anyone who guarantees a position is either taking risks with your site or overselling. We can promise a clear process, honest reporting and work that follows the rules, and we show you how visibility is changing. Be cautious of any guarantee, because search engines make the final call.',
      },
      {
        q: 'Can a site still be penalised if the SEO is white hat?',
        a: 'A properly run campaign makes it unlikely, but problems can come from old work by a previous vendor, hacked pages or user-generated spam. That is why we audit what already exists before adding anything new. Cleaning this up early protects the work that follows, and we explain each finding in plain language.',
      },
      {
        q: 'Is AI-written content considered white hat?',
        a: 'It depends on how it is used. Search engines focus on whether content is helpful and original, not on how it was drafted. Publishing large volumes of unreviewed, low-value pages to manipulate rankings breaks spam policies, so we edit and fact-check anything AI-assisted.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['seo-penalty-removal', 'seo-audit-services', 'link-building'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'white-label-seo',
    path: '/seo-services/white-label-seo',
    name: 'White Label SEO',
    title: 'White Label SEO Services | Unbranded SEO for Agencies',
    description:
      'We do the SEO work under your agency’s brand, from audits to link building, and deliver unbranded reports so you keep the client and the relationship.',
    h1: 'White label SEO services',
    intro:
      'White label SEO is search optimization carried out by a specialist team that works behind your agency’s brand. You keep the client relationship and the invoice, while we run the audits, on-page work, content and link building, and hand back reports with no mention of us. It lets an agency offer SEO without hiring and managing a full in-house team.',
    icon: 'sell',
    category: 'seo',
    hub: 'links',
    tag: 'For Agencies',
    includes: [
      {
        title: 'Unbranded reports',
        body: 'Monthly reports come as clean documents or exports you can place on your own template, with your logo, your colours and your commentary. Our name does not appear anywhere in them.',
      },
      {
        title: 'Work done in your name',
        body: 'Where a client needs to see a sender, such as outreach emails or support tickets, we write and send from your brand or a mailbox you control, matching your tone and style.',
      },
      {
        title: 'Client-ready audits',
        body: 'Technical, content and link audits written so you can present them as your own findings, with plain explanations and a prioritised list of fixes for each site. Each audit is formatted so it can drop straight into your own proposal or slide deck.',
      },
      {
        title: 'Ongoing delivery',
        body: 'Optimization, content briefs, internal linking and link building are carried out each month against a plan you have approved, with clear status updates back to your account manager. We also flag anything that needs client approval.',
      },
      {
        title: 'Account-manager briefings',
        body: 'Before client calls we send short talking points covering what changed, what moved and what comes next, so your team can answer questions without needing deep SEO knowledge. Each briefing is written in plain language and takes minutes to read.',
      },
      {
        title: 'Confidentiality terms',
        body: 'We agree not to contact your clients or mention the arrangement, and we sign a non-disclosure agreement before receiving any client access or data. We work through accounts you control, and can describe our security practices on request.',
      },
    ],
    steps: [
      {
        title: 'Partner setup',
        body: 'We agree scope, report format, communication channels and how work should be labelled, so everything arrives ready to use under your brand.',
      },
      {
        title: 'Client onboarding',
        body: 'You send each client’s goals and access. We audit the site and produce a plan you can review, edit and present as your own.',
      },
      {
        title: 'Monthly delivery',
        body: 'We carry out the agreed work and send your team a status note, so you always know what has been done for each client.',
      },
      {
        title: 'Reporting and review',
        body: 'You receive unbranded reports with commentary, and we review results with you to decide what to change the following month.',
      },
    ],
    faq: [
      {
        q: 'How is white label SEO different from regular SEO services?',
        a: 'With regular SEO the client hires us directly and we report to them. With white label SEO, your agency is the client-facing brand and we are a silent delivery partner. The methods are the same; the contact, branding and reports are not.',
      },
      {
        q: 'Do you ever contact my clients directly?',
        a: 'No. All communication goes through your team, unless you ask us to join a call and tell us how to introduce ourselves. We do not market to, or take on work from, the clients you send us. If a client reaches us by mistake, we pass the message on to you straight away.',
      },
      {
        q: 'Can I set my own prices for clients?',
        a: 'Yes. What you charge your clients is entirely your decision. We agree on what you pay us for the work, and you decide the margin, packaging and terms you offer to your own customers. We also do not require minimum resale prices, so you can bundle SEO with design, hosting or other services in whatever way suits your agency.',
      },
      {
        q: 'What do you need from me to start?',
        a: 'For each client we need their website, goals, target markets and the access required to audit and edit, such as analytics, search console and the CMS. A short intake form makes this quick. We also ask for any earlier SEO reports, brand guidelines and a named contact on your side for approvals, so questions get answered fast and nothing stalls.',
      },
      {
        q: 'Can you guarantee results for my clients?',
        a: 'No agency can guarantee rankings or traffic, and you should avoid promising them to your clients. We provide a documented plan, honest reporting and well-executed work that you can stand behind in client meetings. Careful wording in your proposals protects both your reputation and your client relationships, and we are happy to review your contract language if that would help.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-reseller', 'outsourced-seo', 'agency-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'seo-reseller',
    path: '/seo-services/seo-reseller',
    name: 'SEO Reseller',
    title: 'SEO Reseller Services | Packaged SEO to Resell',
    description:
      'Add SEO to your catalogue with ready-to-sell packages, pitch audits and fulfilment handled for you, so you can set your own prices and margin.',
    h1: 'SEO reseller services',
    intro:
      'SEO reselling is when a web design, marketing or IT firm sells SEO as a product under its own name and fulfils it through a delivery partner. The reseller owns the pricing, the sales conversation and the client, while the partner does the work. It suits firms whose customers already ask about search but who want a defined offer rather than one-off projects.',
    icon: 'handshake',
    category: 'seo',
    hub: 'links',
    tag: 'Reseller',
    includes: [
      {
        title: 'Packaged service tiers',
        body: 'Clear starter, growth and custom tiers, each with a defined list of deliverables, so you can put SEO on a price list and explain it in a single sentence. Each tier states what is and is not included.',
      },
      {
        title: 'Pitch-ready prospect audits',
        body: 'A short audit of a prospect’s site that you can use in a sales meeting, showing concrete issues and opportunities and pointing naturally to the package that fits. We keep these audits short and honest, so prospects see real findings, not a scare list.',
      },
      {
        title: 'Sales and scoping material',
        body: 'Plain-English service descriptions, answers to common objections, and scoping questions that help you quote correctly and avoid promising things SEO cannot deliver. We also share a short glossary and example client emails, so your sales team can answer common questions without improvising.',
      },
      {
        title: 'Margin-friendly pricing structure',
        body: 'A wholesale rate card per package, so you can calculate your margin before you quote and add your own fees for account management or related services. We keep the rate card simple, so quoting takes minutes.',
      },
      {
        title: 'Fulfilment and quality control',
        body: 'Our team carries out the work behind each package and checks it before delivery, with a named contact who handles your queries and escalations. Deliverables are reviewed against the package definition, and anything unclear is flagged to you before it reaches the client.',
      },
      {
        title: 'Renewal and upsell prompts',
        body: 'Each report highlights the next logical step, such as content, local or technical work, giving you a natural reason to expand the account. Suggestions are based on what the data shows, not on pressure to sell more, so you can recommend them to clients with confidence.',
      },
    ],
    steps: [
      {
        title: 'Choose your offer',
        body: 'We help you pick the packages that fit your customers and agree what is included in each, so nothing is vague when you sell.',
      },
      {
        title: 'Equip your sales team',
        body: 'You receive audit templates, scope sheets and explanations that let non-specialists talk about SEO with confidence. We also run a short walkthrough call for your sales staff.',
      },
      {
        title: 'Fulfil each sale',
        body: 'When a client signs, you send us the brief and access. We deliver the work to the agreed package and report back to you.',
      },
      {
        title: 'Review and expand',
        body: 'We go over results with you periodically and suggest where an existing client could use more, or where a new package would help.',
      },
    ],
    faq: [
      {
        q: 'How much margin can I make reselling SEO?',
        a: 'That depends on the package and the price you set for your clients. We give you a wholesale rate, and you decide the retail price, so your margin is the difference minus your own account management time. We do not dictate what you charge.',
      },
      {
        q: 'Do I need SEO knowledge to resell it?',
        a: 'Not deep knowledge. You need to understand what each package includes and what SEO can and cannot promise. We provide briefing notes and talking points, and we can join a client call if a technical question comes up. Most partners learn the basics within a few client conversations.',
      },
      {
        q: 'How is reselling different from white label work?',
        a: 'They overlap. Reselling is about packaging, pricing and selling SEO as part of your catalogue, while white label is about us delivering the work unbranded. Many partners do both, and we can set it up either way. Which setup suits you mostly depends on whether clients know we exist.',
      },
      {
        q: 'Can I customise packages for different clients?',
        a: 'Yes. Packages are a starting point. If a client needs more content, a heavier technical focus or support in several languages, we can adjust the scope and the wholesale rate to match it. Custom work is quoted before it starts, so you can price it into your own proposal without surprises.',
      },
      {
        q: 'What should I tell clients about timing and results?',
        a: 'Be honest that SEO takes time and depends on competition, site history and budget. We never guarantee rankings, and we recommend you do not either. Instead, set expectations around the work done each month and the measures we will report.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['white-label-seo', 'agency-seo', 'outsourced-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'outsourced-seo',
    path: '/seo-services/outsourced-seo',
    name: 'Outsourced SEO',
    title: 'Outsourced SEO Services | Hand Off SEO Execution',
    description:
      'Hand SEO execution to a team that works inside your process: shared backlog, developer-ready tickets, regular check-ins and documented handover.',
    h1: 'Outsourced SEO services',
    intro:
      'Outsourced SEO means handing the day-to-day execution of search optimization to an external team instead of hiring, training and managing staff for it. The best arrangements work inside your own process: shared priorities, access to your tools and regular check-ins. It suits businesses and in-house marketing teams that know SEO matters but lack the time or specialists to do it.',
    icon: 'business_center',
    category: 'seo',
    hub: 'links',
    tag: 'Outsource',
    includes: [
      {
        title: 'Access and workflow setup',
        body: 'We join your analytics, search console, CMS and project tools, agree who approves what, and set up a shared backlog so work is visible and nothing depends on email threads.',
      },
      {
        title: 'Agreed SEO roadmap',
        body: 'A quarterly plan built from your goals and an audit, broken into tasks with owners and dates, so your team knows what is being done and why. Priorities can be reordered when your business changes.',
      },
      {
        title: 'Hands-on execution',
        body: 'Keyword research, on-page changes, content briefs and drafts, internal linking and link building are carried out by us, so the work moves forward without taking your team’s time. Anything touching live pages is shared with you for approval first.',
      },
      {
        title: 'Developer-ready tickets',
        body: 'Technical fixes are written as clear tickets with the problem, the page affected, the change needed and how to test it, so your developers can ship without a meeting. Screenshots and examples are attached wherever they help.',
      },
      {
        title: 'Regular check-ins',
        body: 'A short weekly or fortnightly call and a written summary cover what was completed, what is blocked and what we need from you, keeping decisions moving. Notes from every call are kept in the shared workspace.',
      },
      {
        title: 'Handover documentation',
        body: 'Processes, templates and decisions are written down as we go, so your team can take work back in-house later, or onboard a new person quickly. Nothing important lives only in our heads or inboxes, which keeps you free to change the arrangement whenever your needs shift.',
      },
    ],
    steps: [
      {
        title: 'Scope and access',
        body: 'We agree which parts of SEO you are handing over, who on your side approves work, and which tools and accounts we need.',
      },
      {
        title: 'Plan the backlog',
        body: 'After an audit we build a prioritised backlog and agree the first month, matching our capacity to what your site needs most.',
      },
      {
        title: 'Run the cycle',
        body: 'We work through the backlog, raise tickets for your developers, and report on progress at each check-in. We flag blockers early and keep the next tasks ready.',
      },
      {
        title: 'Review and rebalance',
        body: 'Each quarter we review results, retire what is not working and decide whether to scale up, reduce or move work in-house.',
      },
    ],
    faq: [
      {
        q: 'How is outsourced SEO different from hiring in-house?',
        a: 'In-house gives you full-time focus and deep knowledge of your business, but one person rarely covers technical, content and links well. Outsourcing gives you a team with broader skills and no recruitment, though it needs good briefing and communication from you.',
      },
      {
        q: 'Will I lose control of my website?',
        a: 'No. You keep ownership of every account and the final say on changes. We work through shared tools, document what we do and usually propose changes for approval first, so you always know what has been done. Admin rights stay with you, and we can be removed at any time.',
      },
      {
        q: 'Which tasks should I outsource and which keep in-house?',
        a: 'Keep decisions that rely on product or brand knowledge close to your team. Research, audits, technical analysis, link outreach and production-heavy content are common to outsource. We help you draw the line during scoping. Many teams start with a small slice and widen it once the working relationship is proven.',
      },
      {
        q: 'How do I know the outsourced work is any good?',
        a: 'Through visibility. A shared backlog, a change log and regular reporting let you see every task and its result. You can also ask any of our team to walk you through why a change was made. You can also compare our reports with your own analytics at any time.',
      },
      {
        q: 'Can you guarantee results from outsourced SEO?',
        a: 'No. Results depend on competition, your site’s history and how quickly changes are approved and released. We commit to a clear process, honest reporting and well-executed work, and we show you the data as it comes in. If a month brings little movement, we explain why and what we plan next.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['white-label-seo', 'seo-management', 'freelance-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'ai-seo',
    path: '/seo-services/ai-seo',
    name: 'AI SEO',
    title: 'AI SEO Services | Use AI and Win in AI Search',
    description:
      'AI SEO covers two jobs: using AI tools to make SEO work faster and sharper, and shaping your site to perform in AI-driven search, with expert review.',
    h1: 'AI SEO services',
    intro:
      'AI SEO covers two jobs. The first is using AI tools to speed up research, analysis and production while people stay accountable for quality. The second is making your site work in a search landscape that now includes AI-written answers and chat assistants. We combine both, and we are open about where AI helps and where it does not.',
    icon: 'smart_toy',
    category: 'seo',
    hub: 'ai',
    tag: 'Future-Ready',
    includes: [
      {
        title: 'AI-assisted research and analysis',
        body: 'We use AI tools to cluster keywords, find content gaps and spot patterns in large datasets, then check the output by hand before it influences any decision about your site.',
      },
      {
        title: 'Human-reviewed content support',
        body: 'AI can help with outlines, summaries and first drafts, but every piece is edited, fact-checked and given real expertise before publishing. We do not mass-produce pages to catch searches. Authors remain accountable.',
      },
      {
        title: 'Automation for repetitive tasks',
        body: 'Routine work such as auditing titles, checking redirects and monitoring changes is scripted or automated, which frees more time for strategy and quality checks. Automations are documented and monitored, and a person reviews anything that would change your live site before it goes out, so speed never costs accuracy.',
      },
      {
        title: 'AI search visibility review',
        body: 'We test how your brand and key topics appear in AI Overviews and chat assistants, and record which pages and sources they draw on, so you have a baseline. We repeat these tests regularly and save the results.',
      },
      {
        title: 'Content structure for machines and people',
        body: 'Pages are organised with clear headings, direct answers, definitions and accurate structured data, which helps both traditional search and AI systems understand what each page covers. We avoid tricks aimed only at machines, because pages that read well for people tend to work best.',
      },
      {
        title: 'AI policy and risk guidance',
        body: 'We help you set rules on where AI may be used, how it is disclosed and how output is reviewed, so efficiency gains do not turn into quality or compliance problems.',
      },
    ],
    steps: [
      {
        title: 'Assess your position',
        body: 'We review current rankings, content and how AI search surfaces your brand, then decide where AI tools would help and where they would add risk.',
      },
      {
        title: 'Set the guardrails',
        body: 'We agree which tasks can use AI, what is always done by a person, and how output is checked before it reaches your site.',
      },
      {
        title: 'Apply and publish',
        body: 'We run the work using AI tools where they save time, and optimise pages so they are clear and useful for search engines and assistants.',
      },
      {
        title: 'Measure and revise',
        body: 'We track search performance and AI visibility together and adjust the approach as tools, search features and your results change.',
      },
    ],
    faq: [
      {
        q: 'What is AI SEO and how does it differ from traditional SEO?',
        a: 'Traditional SEO focuses on ranking pages in standard results. AI SEO adds two things: using AI tools in the workflow and optimising for AI-driven answers. The fundamentals of quality content, technical health and trust still apply to both. AI features are also changing quickly, so we revisit the plan regularly.',
      },
      {
        q: 'Will AI-generated content hurt my rankings?',
        a: 'Search engines say they judge helpfulness, not how content was made. Unreviewed, repetitive pages made at scale to manipulate rankings can break spam policies, though. We use AI for support, then edit and fact-check everything. We also keep a record of what was AI-assisted, so quality can be audited.',
      },
      {
        q: 'Can you get my brand shown in AI answers?',
        a: 'We can make your site clearer, more useful and easier to cite, but no one controls what an AI system outputs. We do not promise citations. We measure how often you appear and improve the pages and sources involved. Honest measurement matters more than promises.',
      },
      {
        q: 'Is AI SEO only for large companies?',
        a: 'No. Smaller businesses often benefit more from efficiency gains, since research and routine tasks take less time. The basics of helpful content and a sound site matter at any size, so the scope is scaled to your needs. We also keep tooling costs low.',
      },
      {
        q: 'How do you measure AI SEO?',
        a: 'We track the usual measures, including rankings, organic traffic and conversions, alongside periodic checks of how your brand appears in AI features. AI reporting is still imperfect, so we explain the limits of any figure we share. We would rather give you a clear picture with caveats than an impressive number that hides how AI answers vary between users, places and days.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['aeo-services', 'geo-services', 'automated-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'aeo-services',
    path: '/seo-services/aeo-services',
    name: 'AEO Services',
    title: 'AEO Services | Answer Engine Optimization',
    description:
      'Answer engine optimization shapes pages to win featured snippets, People Also Ask boxes and direct answers, backed by clean structured data and clear content.',
    h1: 'AEO services',
    intro:
      'Answer engine optimization, or AEO, is the practice of structuring content so search engines and assistants can lift a clear answer straight from your page. That means featured snippets, People Also Ask boxes, direct-answer panels and spoken responses. It builds on solid SEO, adding question research, tight formatting and accurate structured data, with no promise that any one answer will be shown.',
    icon: 'fact_check',
    category: 'seo',
    hub: 'ai',
    tag: 'AEO',
    includes: [
      {
        title: 'Question and intent research',
        body: 'We collect the questions your audience asks, using People Also Ask, autocomplete and search data, and group them by intent so each answer has a clear home on your site.',
      },
      {
        title: 'Featured snippet targeting',
        body: 'We find queries where a snippet is shown, check what format wins, whether a paragraph, list or table, and rewrite your pages to answer in that shape. This keeps the edit focused on queries you can realistically win.',
      },
      {
        title: 'Answer-first page formatting',
        body: 'Each target page opens with a short, direct answer of a few sentences, followed by depth, with descriptive headings, so a reader and an answer engine both find the key point quickly.',
      },
      {
        title: 'Structured data for answers',
        body: 'We add and validate schema where it fits the content, such as FAQ, how-to, product or organisation markup, noting that eligibility for rich results changes over time. Markup always reflects what is visible on the page, because search engines can ignore or penalise markup that misrepresents content.',
      },
      {
        title: 'Question hubs and FAQ content',
        body: 'Related questions are gathered into helpful pages written by subject experts, with sources and dates, rather than thin FAQ lists added to every page. Content is reviewed by someone who knows the subject, which matters most for sensitive topics where wrong answers could harm readers.',
      },
      {
        title: 'Zero-click performance tracking',
        body: 'We monitor which snippets and answer boxes you gain or lose, and read impressions as well as clicks, since answers can raise visibility even without a visit. Wins and losses are logged each month, so changes can be linked to edits.',
      },
    ],
    steps: [
      {
        title: 'Find answer opportunities',
        body: 'We look for queries where answers appear, then see which of those you could credibly win with your current pages.',
      },
      {
        title: 'Rewrite for clarity',
        body: 'We draft concise answers and restructure pages around them, keeping the depth that makes the page worth citing. Each rewrite is checked for accuracy before it is published.',
      },
      {
        title: 'Mark up and publish',
        body: 'We add valid structured data where appropriate, publish the updates and request re-indexing of key pages. We then test the pages in Google’s tools and monitor indexing.',
      },
      {
        title: 'Track and refine',
        body: 'We watch which answers appear for your pages, learn from what wins, and keep the content accurate as the topic changes.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between AEO and traditional SEO?',
        a: 'Traditional SEO aims to rank pages in the result list. AEO aims to have your content used as the answer itself, in a snippet, answer box or assistant response. It sits on top of normal SEO rather than replacing it.',
      },
      {
        q: 'Can you guarantee featured snippets?',
        a: 'No. Search engines choose snippets automatically and can change them at any time. We can improve how clearly your pages answer a question and show you where you win or lose, but we cannot promise any specific result. Snippets also differ by country, device and language.',
      },
      {
        q: 'Will AEO reduce clicks to my website?',
        a: 'Sometimes. Direct answers can satisfy a searcher without a visit, so we choose targets where visibility or brand recognition is worth it, and where a follow-up question is likely to bring people to your page. We track clicks and conversions as well as impressions, so you can judge the trade-off using your own numbers.',
      },
      {
        q: 'Does structured data make answers appear?',
        a: 'Not by itself. Schema helps search engines understand a page, and some types are eligible for rich results, but the content must still be useful and match the query. Search engines also limit which types they show. Marking up content that is not visible on the page is against guidelines.',
      },
      {
        q: 'What content formats work best for AEO?',
        a: 'Short definitions, step lists, comparison tables and clear question-and-answer sections tend to suit answer features. The right format depends on the query, so we check what already appears for each term before deciding how to write. Testing a few formats on real pages usually teaches us more than guessing.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ai-seo', 'voice-search-seo', 'on-page-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
  {
    slug: 'geo-services',
    path: '/seo-services/geo-services',
    name: 'GEO Services',
    title: 'GEO Services | Generative Engine Optimization',
    description:
      'Generative engine optimization improves how AI assistants and AI Overviews understand, mention and cite your brand, built on entity clarity and trusted sources.',
    h1: 'GEO services',
    intro:
      'Generative engine optimization, or GEO, is the work of improving how AI systems such as ChatGPT, Gemini, Perplexity and Google’s AI Overviews understand and mention your brand. It focuses on clear entities, citable pages and trustworthy mentions across the web. These systems are not controllable and change often, so GEO improves your chances without promising any citation.',
    icon: 'public',
    category: 'seo',
    hub: 'ai',
    tag: 'GEO',
    includes: [
      {
        title: 'AI visibility baseline',
        body: 'We run a fixed set of prompts and queries across major AI tools and record whether your brand appears, how it is described and which sources are cited, then repeat the checks over time.',
      },
      {
        title: 'Entity and brand clarity',
        body: 'Your name, offering, locations and people are described consistently on your site, in structured data and on profiles such as Wikipedia-style references, directories and knowledge panels where appropriate. Where facts differ between sources, we fix the ones you control and flag the rest.',
      },
      {
        title: 'Citable content',
        body: 'We create or improve pages with original data, clear definitions, named authors and up-to-date sources, since these are easier for systems to quote and for users to trust. Pages that offer something other sources lack, such as your own research, are the strongest candidates.',
      },
      {
        title: 'Third-party mentions',
        body: 'AI systems often draw on what others say about you. We identify reviews, publications, industry lists and communities that matter and plan honest ways to be featured in them. We avoid paid mentions or fake reviews, which damage trust and may breach platform rules.',
      },
      {
        title: 'Crawler and access checks',
        body: 'We check robots rules, rendering and page speed so AI crawlers and search bots that you want to allow can reach your content, and discuss which you would rather block.',
      },
      {
        title: 'Misinformation and accuracy watch',
        body: 'Where an AI answer states something wrong about your business, we trace likely sources, correct them on your pages and profiles, and use available feedback channels. We keep a log of each case, so you can see what changed afterwards.',
      },
    ],
    steps: [
      {
        title: 'Benchmark',
        body: 'We test how AI tools currently describe your brand and category, noting the sources they rely on and any inaccuracies.',
      },
      {
        title: 'Strengthen the source',
        body: 'We tidy your entity information and improve the pages most likely to be cited, so your own site gives a clear, consistent account.',
      },
      {
        title: 'Earn mentions',
        body: 'We plan outreach and content that put your brand in credible places where people and AI systems look for information.',
      },
      {
        title: 'Re-test and adapt',
        body: 'We repeat the prompt tests on a schedule and adjust the plan, as AI products update and their sources change.',
      },
    ],
    faq: [
      {
        q: 'How is GEO different from SEO?',
        a: 'SEO aims to rank pages in a results list. GEO aims for your brand to be understood, mentioned and cited inside generated answers. They share foundations such as quality content, technical health and trust, so GEO builds on SEO, not in place of it.',
      },
      {
        q: 'Can you get my brand cited by ChatGPT or Perplexity?',
        a: 'We cannot guarantee it. These tools produce different answers for different users and change often. We can improve the clarity, authority and visibility of your brand and track how often it appears, and we are open about the limits. Anyone claiming a certain outcome is guessing.',
      },
      {
        q: 'Do I need good rankings to appear in AI Overviews?',
        a: 'Strong search visibility helps, because AI features often draw on pages that already perform well, but it is not a strict rule. Eligibility and sourcing vary, so we treat solid SEO as the base and test what appears. Page content must also be clear enough to quote.',
      },
      {
        q: 'How long does GEO take to show anything?',
        a: 'It varies. Some changes, like fixing crawl access or inconsistent details, can be picked up fairly quickly, while building mentions and authority takes months. Because AI results fluctuate, we judge trends across repeated tests rather than one-off checks. We set expectations at the outset.',
      },
      {
        q: 'Is GEO worth it for a small business?',
        a: 'Often a light version is. Clear entity information, accurate profiles and genuinely helpful pages cost little and help in every channel. A larger programme makes more sense if buyers in your market already use AI tools to research. We start small and expand only if the early checks show it is worth it.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ai-seo', 'aeo-services', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'voice-search-seo',
    path: '/seo-services/voice-search-seo',
    name: 'Voice Search SEO',
    title: 'Voice Search SEO Services | Be the Spoken Answer',
    description:
      'Optimize for spoken, conversational queries on phones, smart speakers and car assistants, with concise answers, local accuracy and fast mobile pages.',
    h1: 'Voice search SEO services',
    intro:
      'Voice search SEO prepares your content for queries that people speak instead of type, usually longer, more conversational and often about something nearby or urgent. It combines natural-language keyword research, short spoken-style answers, accurate local data and fast mobile pages. Assistants decide for themselves which source they read aloud, so we improve your chances without promising a particular result.',
    icon: 'smartphone',
    category: 'seo',
    hub: 'ai',
    tag: 'Voice',
    includes: [
      {
        title: 'Conversational query research',
        body: 'We gather the full-sentence, question-style phrases your customers actually speak, including "how do I", "where can I" and "is it open" patterns, and map them to the pages that should answer them.',
      },
      {
        title: 'Spoken-style answers',
        body: 'Key pages get a concise answer that reads naturally when spoken aloud, usually a sentence or two in plain language, followed by the detail a visitor would want next. We read them aloud to check that they sound natural.',
      },
      {
        title: 'Local data accuracy',
        body: 'Many voice queries are about opening hours, directions and "near me" services, so we make sure your business profile, listings and location pages agree and are up to date. Small mismatches can cause an assistant to read out the wrong detail.',
      },
      {
        title: 'Mobile speed and usability',
        body: 'Most voice searches happen on phones, so we check loading speed, layout stability and tap targets and fix the issues that make a page slow or awkward on a handset.',
      },
      {
        title: 'Structured data and entity details',
        body: 'We use valid markup for business details, products, events or FAQs where it applies, helping assistants read your information correctly and reducing wrong answers about you. Every property is checked against what is shown on the page itself.',
      },
      {
        title: 'Language and accent coverage',
        body: 'For multilingual audiences we research how people phrase queries in each language they speak, rather than translating text word for word, and shape each language version accordingly. Native speakers review the final wording before anything is published.',
      },
    ],
    steps: [
      {
        title: 'Map spoken intent',
        body: 'We list the questions and local requests your audience is likely to speak, and note which already trigger answers or maps.',
      },
      {
        title: 'Write and fix',
        body: 'We add concise answers to the right pages, correct your business data and tidy up slow or unstable mobile pages.',
      },
      {
        title: 'Add markup',
        body: 'We apply validated structured data to support clear reading of your details, then re-test key pages on mobile devices. We also fix any markup errors found.',
      },
      {
        title: 'Check and iterate',
        body: 'We test sample voice queries on common assistants, record what is read out, and refine pages where answers are missing or wrong.',
      },
    ],
    faq: [
      {
        q: 'How is voice search SEO different from regular SEO?',
        a: 'Spoken queries are longer and more conversational, and the assistant usually gives one answer rather than a list. So voice SEO puts extra weight on clear question-and-answer content, local accuracy and mobile performance, on top of ordinary SEO. The core work still overlaps heavily with local and mobile SEO.',
      },
      {
        q: 'Can you guarantee my business will be read out by an assistant?',
        a: 'No. Each assistant picks sources by its own rules and may use different ones from day to day. We make your content easier to find and use, and we test real queries so you see what is happening. Results can also vary by device, language and location.',
      },
      {
        q: 'Is voice search relevant for small local businesses?',
        a: 'Often, yes, because many spoken queries are local, such as opening times, directions and nearby services. Accurate listings and a well-kept business profile are usually the most useful starting point for a small business. Smaller businesses also tend to benefit from simple improvements, such as correct hours and a clear description of services, which cost little and help in every channel.',
      },
      {
        q: 'How important is schema markup for voice?',
        a: 'It helps, but it is not a switch. Structured data lets machines read details like address, hours and services more reliably, though the page still needs useful content and good rankings before an assistant is likely to use it. We validate markup and keep it accurate.',
      },
      {
        q: 'Can you optimize for languages other than English?',
        a: 'Yes, where we can research the language properly. Voice queries differ by language and region, with their own phrasing and mix of local terms. We build separate query research for each, and recommend native-speaker review before publishing. We tell you up front if a language is outside what we can cover well.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['aeo-services', 'local-seo', 'mobile-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Mobile-Friendly Test', href: '/free-tools/mobile-friendly-test' },
    ],
  },
  {
    slug: 'video-seo',
    path: '/seo-services/video-seo',
    name: 'Video SEO',
    title: 'Video SEO Services | Get Your Videos Found',
    description:
      'Video SEO helps your videos appear on YouTube and in Google results, with search-led planning, metadata, transcripts, thumbnails, sitemaps and video markup.',
    h1: 'Video SEO services',
    intro:
      'Video SEO is the work of making your videos easy to find, understand and click, both on YouTube and in video results on Google and other search engines. It covers topic research, titles, descriptions, thumbnails, transcripts, video markup and the pages where videos are embedded. It does not replace good production, and it cannot promise a particular ranking for any video.',
    icon: 'visibility',
    category: 'seo',
    hub: 'ai',
    tag: 'Video',
    includes: [
      {
        title: 'Video topic and keyword research',
        body: 'We look for subjects where video is already favoured in results and where your audience searches on YouTube, then match them to videos you have or plan to make. We also note competing videos.',
      },
      {
        title: 'Titles, descriptions and chapters',
        body: 'Each video gets a clear title, a useful description with links and timestamps, and chapters where appropriate, written for viewers first and for search second. Keywords are used naturally, and we avoid stuffing descriptions with unrelated tags, which can hurt viewer trust and may breach platform policies.',
      },
      {
        title: 'Thumbnails and click appeal',
        body: 'We review thumbnails for legibility on small screens, consistency and accuracy, and suggest tests, since a thumbnail that misleads viewers usually leads to short watch times. We avoid clickbait that damages trust.',
      },
      {
        title: 'Transcripts and captions',
        body: 'Accurate captions and on-page transcripts make videos accessible, give search engines text to read, and let viewers who cannot play sound follow the content. Auto-generated captions are reviewed and corrected, since errors in names and technical terms are common and can mislead both viewers and search engines.',
      },
      {
        title: 'On-site video pages and markup',
        body: 'We set up pages built around each video, add valid VideoObject structured data, and provide a video sitemap so Google can discover and index your content properly. We test the pages with Google’s tools.',
      },
      {
        title: 'Channel structure and playlists',
        body: 'Playlists, channel description and linking between videos are organised to help viewers move from one video to the next and give each topic a clear shape. We also add end screens and cards where they suit your goals.',
      },
    ],
    steps: [
      {
        title: 'Audit your videos',
        body: 'We review your channel, embedded videos and video pages, and check which of them Google has indexed. We also note missing captions, weak titles and thin pages.',
      },
      {
        title: 'Plan around demand',
        body: 'We choose topics and formats based on search demand and on what already appears in results for each query. We also consider the effort each video needs.',
      },
      {
        title: 'Optimise and mark up',
        body: 'We update metadata, captions and thumbnails, add structured data and sitemaps, and improve the pages that host your videos. We then submit updated pages for crawling.',
      },
      {
        title: 'Measure and improve',
        body: 'We track impressions, views, watch time and referrals to your site, and use them to decide which videos to update or create next.',
      },
    ],
    faq: [
      {
        q: 'Do I need to make new videos to benefit from video SEO?',
        a: 'Not always. Existing videos often have weak titles, missing captions or no proper page on your site, and these can be improved. We also advise where new videos would help most, but you do not have to start from scratch.',
      },
      {
        q: 'What is the difference between video SEO and social video marketing?',
        a: 'Social video aims for reach in feeds, which can fade quickly. Video SEO targets people actively searching, on YouTube and in Google results, so a well-optimised video can keep bringing viewers for much longer. The two work well together. Many clients use both.',
      },
      {
        q: 'Should videos be on YouTube or on my own website?',
        a: 'Often both. YouTube gives you its own search audience, while a page on your site can bring in visits and conversions. We set up embeds and markup carefully so that they support each other rather than compete. Which one leads depends on whether your goal is awareness or direct enquiries.',
      },
      {
        q: 'Can video SEO help a local business?',
        a: 'Yes. Videos about services, work in progress, staff or local questions can support local search and build trust. We use clear location references and link them to your business profile and location pages where it makes sense. Short videos tied to specific services or neighbourhoods tend to be most useful, with accurate captions so viewers and search engines can follow them.',
      },
      {
        q: 'How long until video SEO shows results?',
        a: 'It depends on competition, channel history and how well the video meets viewer needs. Technical fixes can be picked up quickly, while rankings and watch time take longer. We cannot promise rankings, and we report what is changing. Results are rarely immediate.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['youtube-seo', 'content-marketing', 'technical-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
];
