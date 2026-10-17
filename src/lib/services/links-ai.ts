import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=seo%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };

/**
 * Link-and-partnership service pages (white hat, white label, outsourced)
 * and the AI and new-search pages (AI SEO, AEO, GEO, voice search, video).
 */
export const LINKS_AI_PAGES: ServicePage[] = [
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
      {
        title: 'Packaged service tiers',
        body: 'Clear starter, growth and custom tiers, each with a defined list of deliverables, so you can put SEO on your price list and explain it in a sentence. Each tier states what is and is not included.',
      },
      {
        title: 'Pitch-ready prospect audits',
        body: 'A short audit of a prospect’s site you can use in a sales meeting, showing concrete issues and opportunities and pointing naturally to the package that fits. We keep these honest, so prospects see real findings, not a scare list.',
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
      {
        q: 'Is white label SEO the same as SEO reselling?',
        a: 'They overlap. Reselling is about packaging, pricing and selling SEO as part of your own catalogue, while white label describes us delivering the work unbranded behind you. Many partners do both, and we can set it up either way.',
      },
      {
        q: 'Do I need SEO knowledge to offer it?',
        a: 'Not deep knowledge. You need to understand what each package includes and what SEO can and cannot promise. We provide briefing notes and talking points, and we can join a client call under your brand if a technical question comes up.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-consulting', 'seo-audit-services', 'link-building'],
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
    related: ['geo-services', 'content-marketing', 'on-page-seo'],
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
    related: ['aeo-services', 'content-marketing', 'technical-seo'],
    guides: [SEO_GUIDES],
  },
];
