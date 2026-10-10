import type { ServicePage } from '@/lib/service-pages';

const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const DIRECTORY_GUIDES = { label: 'Business directory guides', href: '/blog/business-directory' };
const SCHEMA_TOOL = {
  label: 'Schema Markup Generator',
  href: '/free-tools/schema-markup-generator',
};
const AUDIT = { ctaLabel: 'Get a Free SEO Audit', ctaHref: '/seo-audit' };
const QUOTE = { ctaLabel: 'Request a quote', ctaHref: '/contact?subject=SEO%20services' };

/**
 * Industry service pages, part 3: iGaming, crypto, financial services, dental
 * and allied health specialists, hospitals, and security and home-trade businesses.
 */
export const INDUSTRY_PAGES_3: ServicePage[] = [
  {
    slug: 'igaming-seo',
    path: '/seo-services/igaming-seo',
    name: 'iGaming SEO',
    title: 'iGaming SEO Services | Compliant Organic Growth',
    description:
      'SEO for licensed casino, sportsbook and affiliate sites: market-by-market pages, review content and link work that respect licensing and advertising rules.',
    h1: 'iGaming SEO services',
    intro:
      'iGaming SEO is organic search work for licensed casino, sportsbook, poker and affiliate websites. Because gambling is legal in some countries, restricted in others and banned in many, the work starts with where you hold a licence, then builds pages, reviews and links that suit each market and the advertising rules that apply there.',
    icon: 'gavel',
    category: 'seo',
    hub: 'industry',
    tag: 'Regulated Markets',
    includes: [
      {
        title: 'Licence-led market map',
        body: 'Before any keyword work, we list the jurisdictions where you are licensed and allowed to market, and the ones where you are not. Targeting, hreflang and page access are planned from that map, not from search volume alone.',
      },
      {
        title: 'Game, sportsbook and bonus pages',
        body: 'Pages for game types, providers, sports and promotions, written with clear terms, wagering conditions and age notices on the page. Thin, duplicated lobby pages are consolidated so each URL has one clear purpose.',
      },
      {
        title: 'Review and comparison content',
        body: 'For affiliates and operators, we plan honest review templates, comparison tables and payment-method guides with disclosed relationships, so readers and search engines can see exactly how each recommendation was made and ranked.',
      },
      {
        title: 'Responsible gambling and trust signals',
        body: 'Licence details, responsible-gambling tools, help-line links, ownership information and clear complaints routes are placed where users and quality reviewers expect to find them, and kept consistent across every page and market version of the site.',
      },
      {
        title: 'Multi-language and multi-market structure',
        body: 'Country and language folders, hreflang annotations and localised payment, currency and sport content, so near-duplicate pages for different markets are not competing with each other or promoted where they should not be.',
      },
      {
        title: 'Careful link acquisition',
        body: 'Gambling is a heavily abused link niche, so we focus on editorial mentions, sports and industry publications and digital PR. We avoid paid link schemes and private networks that risk manual actions.',
      },
    ],
    steps: [
      {
        title: 'Licence and policy review',
        body: 'We confirm your licences, target markets and the advertising and affiliate rules that apply, then agree what the site may promote and where.',
      },
      {
        title: 'Technical and content audit',
        body: 'We check crawling, geo-handling, age gates, duplicate market pages and existing content, and list what to fix, merge or retire.',
      },
      {
        title: 'Build and publish',
        body: 'We create or rewrite priority pages, set up market structure and start editorial link work, with your compliance team approving copy before launch.',
      },
      {
        title: 'Monitor and adjust',
        body: 'We report on visibility by market, indexing and referral quality, and update pages as regulations, licences and search guidelines change.',
      },
    ],
    faq: [
      {
        q: 'Can gambling websites be promoted with SEO?',
        a: 'Often yes, but only where gambling is legal and your licence covers the audience. Rules differ by country and some forbid promotion altogether. We work with your legal or compliance team to define the markets and the copy that is allowed before we publish anything.',
      },
      {
        q: 'Do you promote sites in countries where gambling is banned?',
        a: 'No. We only plan SEO for markets where you hold the right licence and where marketing is permitted. If a market is restricted, we help you keep it out of targeting, rather than trying to rank there against the rules.',
      },
      {
        q: 'Is SEO a safe channel for iGaming compared with paid ads?',
        a: 'Search engines and ad networks restrict gambling advertising in many regions, so organic search is attractive. It still has risks, mainly link spam penalties and misleading claims. We follow search guidelines and avoid tactics that depend on loopholes or that regulators and search engines could later penalise.',
      },
      {
        q: 'How long does iGaming SEO take?',
        a: 'Competitive casino and betting terms are among the hardest in search, and results depend on your authority, licence markets and content quality. We cannot promise rankings or dates, but we report on indexing, visibility and traffic quality as the work progresses.',
      },
      {
        q: 'Do you build links for casino and betting sites?',
        a: 'We build links through editorial coverage, sports and industry content and digital PR. We do not buy links or run private blog networks, because gambling sites are closely watched and low-quality links can undo months of work, so we choose fewer, better links.',
      },
    ],
    ...QUOTE,
    related: ['crypto-seo', 'international-seo', 'link-building'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'crypto-seo',
    path: '/seo-services/crypto-seo',
    name: 'Crypto SEO',
    title: 'Crypto SEO Services | Exchanges, DeFi & Web3',
    description:
      'SEO for exchanges, wallets, DeFi and NFT projects: educational content, technical clean-up and compliant link building in a fast-moving, regulated field.',
    h1: 'Crypto SEO services',
    intro:
      'Crypto SEO helps exchanges, wallets, DeFi protocols, NFT projects and blockchain companies be found in organic search. The topic is treated as financial information by search engines, so the work centres on accurate educational content, clear risk wording, a technically sound site and links earned from credible, independent publications over time.',
    icon: 'hub',
    category: 'seo',
    hub: 'industry',
    tag: 'Web3 & Exchanges',
    includes: [
      {
        title: 'Intent mapping for crypto searches',
        body: 'We separate learners asking what a token is, users comparing wallets or exchanges, and holders looking for how-to steps. Each group gets pages that fit its stage, instead of one product page chasing every term.',
      },
      {
        title: 'Educational hub and glossary',
        body: 'Guides on how blockchains, staking, wallets and custody work, written clearly and reviewed for accuracy. We keep price predictions and promises of returns out of the content and add plain risk notices.',
      },
      {
        title: 'Product and coin pages',
        body: 'Templates for assets, trading pairs, networks or protocol features that add real information, such as how something works and its limits, rather than thousands of near-empty auto-generated pages that search engines tend to ignore.',
      },
      {
        title: 'Technical foundations for web apps',
        body: 'Many crypto sites rely on JavaScript front ends and dynamic data. We check rendering, indexing, site speed and structured data so important pages can be crawled and are not blocked behind app shells.',
      },
      {
        title: 'Compliance-aware messaging',
        body: 'Financial promotion rules for crypto vary by country and are changing. We flag risky claims, show where disclosures belong and let your legal team approve the wording of any page we publish.',
      },
      {
        title: 'Earned links and digital PR',
        body: 'Original research, data posts and expert commentary pitched to finance, technology and crypto media. We avoid paid placements and link exchanges, since they tend to attract low-quality crypto link networks and penalties.',
      },
    ],
    steps: [
      {
        title: 'Discovery and risk check',
        body: 'We learn what you offer, where you are allowed to market it and which claims need legal sign-off, then audit the site against that.',
      },
      {
        title: 'Strategy and content plan',
        body: 'We choose the topics and page types that match real search intent, and set an editorial standard for accuracy and sourcing.',
      },
      {
        title: 'Implementation',
        body: 'We fix technical issues, publish and improve priority pages, and begin outreach for credible coverage with your review at each stage.',
      },
      {
        title: 'Monitoring',
        body: 'We track visibility, indexing and referral traffic, and revisit and update content when protocols, regulations or search results change over time.',
      },
    ],
    faq: [
      {
        q: 'Is crypto treated differently by search engines?',
        a: 'Crypto content can affect people’s money, so search engines look for trustworthy, accurate information and clear authorship. Thin or hype-driven pages tend to struggle. That is why we focus on expert-reviewed education, honest risk language and transparent company information about who runs the project.',
      },
      {
        q: 'Can a new exchange or project compete with established brands?',
        a: 'It can find a footing, usually by targeting narrower topics and building credibility first, rather than head-on terms dominated by large exchanges. We cannot promise rankings, but we can pick realistic starting points, choose battles you can win and show progress month by month.',
      },
      {
        q: 'Do you write price predictions or investment tips?',
        a: 'No. We do not publish price forecasts or promise returns, as these can mislead readers and break financial promotion rules in many countries. We write explanations, comparisons and how-to content, with clear risk wording agreed with your legal team before anything is published.',
      },
      {
        q: 'How do you handle regulations and advertising limits?',
        a: 'Rules on promoting crypto vary widely and ad platforms restrict it in many regions, which is one reason organic search matters. We are not a law firm, so we work with your counsel to decide what each page may say and where.',
      },
      {
        q: 'How long does crypto SEO take?',
        a: 'It depends on your site’s authority, the competition and how quickly pages can be published and reviewed. We do not guarantee timeframes, but we report on indexing, visibility and traffic regularly so you can see what is working and what is not.',
      },
    ],
    ...QUOTE,
    related: ['fintech-seo', 'financial-services-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'financial-services-seo',
    path: '/seo-services/financial-services-seo',
    name: 'Financial Services SEO',
    title: 'Financial Services SEO | Advisers, Lenders & Wealth',
    description:
      'SEO for financial advisers, wealth managers, lenders and brokers: compliant content, local adviser pages and trust signals for high-stakes money searches.',
    h1: 'Financial services SEO',
    intro:
      'Financial services SEO helps advisers, wealth managers, lenders, brokers and investment firms appear when people search for money guidance. Search engines hold this content to a high standard because it affects people’s finances, so we build credible pages, clear credentials and compliance-checked copy that together earn trust steadily and last.',
    icon: 'account_balance',
    category: 'seo',
    hub: 'industry',
    tag: 'Finance & Wealth',
    includes: [
      {
        title: 'Search intent across the client journey',
        body: 'People search very differently when learning about pensions, comparing advisers or looking for a lender. We map terms to each stage, so research queries and "find an adviser" queries reach pages built for them.',
      },
      {
        title: 'Service and adviser pages',
        body: 'Clear pages for each service, plus profiles for named advisers with qualifications, regulator registration numbers and areas of focus. These show who is giving the advice, which matters on money topics.',
      },
      {
        title: 'Educational content and calculators',
        body: 'Plain-language guides on topics clients ask about, with sources cited and a reviewer named. We help plan calculators and checklists that earn links without implying personal advice or guaranteed outcomes.',
      },
      {
        title: 'Compliance-friendly workflow',
        body: 'Drafts go to your compliance reviewer before publishing, with standard disclaimers, risk warnings and required firm details placed consistently. We never write performance claims or promises of returns, and we keep legally required details in the same place on each page.',
      },
      {
        title: 'Local and office visibility',
        body: 'For firms that meet clients in person, we set up and maintain listings, office pages and reviews in line with each platform’s policies, so people searching for an adviser nearby find accurate details.',
      },
      {
        title: 'Authority and reputation links',
        body: 'Expert commentary, industry association profiles and press contributions that show your firm is recognised. We avoid mass directories and paid links, which carry a particular risk in finance and rarely help real clients find you.',
      },
    ],
    steps: [
      {
        title: 'Regulatory and audience review',
        body: 'We learn which products you may promote, to whom and with which wording, and audit the current site against those limits.',
      },
      {
        title: 'Content and trust plan',
        body: 'We agree priority services, adviser profiles and educational topics, with named reviewers and sourcing rules for every article and page.',
      },
      {
        title: 'Build and review',
        body: 'We fix technical issues, publish pages and route each draft through your compliance process before it goes live on the site.',
      },
      {
        title: 'Measure enquiries',
        body: 'We report on visibility, enquiry quality and consultation requests rather than traffic alone, and refine pages that attract the wrong audience.',
      },
    ],
    faq: [
      {
        q: 'Why is SEO harder for financial services than for other fields?',
        a: 'Finance is a "your money" topic, so search engines look for clear expertise, accurate information and a trustworthy company. New sites need credentials, named authors and strong sourcing before they compete, which is why the groundwork matters more than volume of content.',
      },
      {
        q: 'Can SEO help with regulatory compliance?',
        a: 'SEO does not make you compliant, and we do not give legal advice. We can work inside your rules by routing copy through your compliance reviewer, adding required disclosures consistently and avoiding claims that regulators typically restrict, but the final decision on wording always rests with you.',
      },
      {
        q: 'How is SEO different from paid advertising for financial firms?',
        a: 'Many ad platforms limit or require approval for financial products, and clicks stop when spend stops. SEO builds pages that can keep attracting enquiries, though it is slower and not guaranteed. Many firms use both, depending on their products and markets.',
      },
      {
        q: 'How do you measure success?',
        a: 'We look at enquiries, consultation requests and calls from organic search, along with visibility for the services you want. Traffic is reported too, but a smaller number of qualified enquiries is worth more than a large number of casual visitors.',
      },
      {
        q: 'How long will it take to see results?',
        a: 'Finance is competitive and trust builds slowly, so we cannot promise timeframes or rankings. Early signs are usually better indexing and visibility for specific pages, while stronger enquiry growth tends to follow sustained content and reputation work over many months.',
      },
    ],
    ...QUOTE,
    related: ['fintech-seo', 'insurance-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'orthodontist-seo',
    path: '/seo-services/orthodontist-seo',
    name: 'Orthodontist SEO',
    title: 'Orthodontist SEO Services | Braces & Aligner Leads',
    description:
      'SEO for orthodontic practices: treatment pages for braces and clear aligners, local visibility for parents and adults, and referral-friendly content.',
    h1: 'Orthodontist SEO services',
    intro:
      'Orthodontist SEO helps practices appear when parents, teenagers and adults search for braces, clear aligners and bite correction nearby. Treatment is a considered, multi-month decision, so the website needs to explain options clearly, show the team and make a first consultation easy to request, while local listings keep details accurate.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Braces & Aligners',
    includes: [
      {
        title: 'Treatment pages by appliance',
        body: 'Separate pages for metal braces, ceramic braces, clear aligners and retainers, each explaining who it suits, how long care generally lasts, what visits involve and what to expect. No page claims results it cannot back up.',
      },
      {
        title: 'Pages for each patient group',
        body: 'Parents of children, teenagers, and adults considering treatment ask different questions. We plan pages for early assessment, adult orthodontics and relapse or retreatment so each searcher lands on relevant information.',
      },
      {
        title: 'Local profile and location pages',
        body: 'Accurate Google Business Profile details, categories, photos and service areas, plus a dedicated page per clinic. Opening hours, parking and accessibility are included because families check them before booking a first visit.',
      },
      {
        title: 'Specialist credentials and trust',
        body: 'Orthodontist profiles with training, registrations and memberships, a clear explanation of how a specialist differs from a general dentist, and patient reviews collected within each platform’s guidelines and your regulator’s rules.',
      },
      {
        title: 'Patient education content',
        body: 'Articles on topics such as how to clean around braces, retainers, what happens at the first visit and common treatment concerns. Written in plain language and reviewed by a clinician before publishing.',
      },
      {
        title: 'Referral-friendly information',
        body: 'A page for referring dentists with referral forms, what to send and how patient updates are shared. This supports the referral relationships many practices depend on, and gives them a findable home.',
      },
    ],
    steps: [
      {
        title: 'Practice and market review',
        body: 'We check your site, listings and local competitors, and note which treatments you most want to be found for and who you hope to treat.',
      },
      {
        title: 'Fix the foundations',
        body: 'We correct listing details, speed and mobile issues, and set up booking and call tracking so we can see which searches lead to consultations.',
      },
      {
        title: 'Create treatment content',
        body: 'We write and improve treatment, team and location pages, with clinical review and your approval on every claim made. Nothing goes live unseen.',
      },
      {
        title: 'Report and refine',
        body: 'We report on local visibility, consultation requests and page performance, then adjust pages and listings based on what patients actually search.',
      },
    ],
    faq: [
      {
        q: 'Why do orthodontists need their own SEO approach?',
        a: 'Orthodontic searches are about a long, specialist treatment and are often made by parents rather than the patient. Pages must reassure them, explain options and show specialist training, which is different from the more general dental pages many practices have.',
      },
      {
        q: 'Can SEO help us compete with large dental groups?',
        a: 'Often it can help a single practice stand out locally with clear specialist pages, reviews and accurate listings. We cannot promise rankings against large groups, but a focused local presence gives smaller practices a realistic way to be seen by the families who live and work nearby.',
      },
      {
        q: 'Do you handle clear aligner brand searches?',
        a: 'We create accurate pages for the systems you offer, which can capture people searching for them by name. We follow any brand-use rules from the manufacturer and avoid implying approval or status you do not hold, such as provider tiers.',
      },
      {
        q: 'Are before-and-after photos allowed in SEO content?',
        a: 'They can help, but patient consent and local advertising rules for dental practices apply, and results vary between patients. We recommend written consent, clear captions and your regulator’s guidance, and we leave the decision on any images with you, as it should be.',
      },
      {
        q: 'Is SEO a one-off project?',
        a: 'Not usually. Local rankings, reviews and competitors keep changing, so some ongoing work is normal. Some practices pay for an initial set-up and then maintain pages and listings themselves, while others prefer continuing monthly support. We will explain which suits you.',
      },
    ],
    ...AUDIT,
    related: ['seo-for-dentists', 'periodontist-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'periodontist-seo',
    path: '/seo-services/periodontist-seo',
    name: 'Periodontist SEO',
    title: 'Periodontist SEO Services | Gum Specialist Visibility',
    description:
      'SEO for periodontal practices: symptom-led pages, implant and gum graft content, referral resources for dentists and local visibility for gum care patients.',
    h1: 'Periodontist SEO services',
    intro:
      'Periodontist SEO helps gum and implant specialists reach two groups: patients searching about bleeding gums, recession or loose teeth, and general dentists looking for somewhere to refer. The website has to explain conditions and procedures accurately, show specialist credentials and make both a patient self-referral and a dentist’s professional referral simple and clear.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Gum Specialists',
    includes: [
      {
        title: 'Symptom and condition pages',
        body: 'Pages for gum disease stages, receding gums, bleeding gums and bone loss, written for worried searchers. They explain signs, when to seek care and what an assessment involves, without diagnosing or promising cures.',
      },
      {
        title: 'Procedure and implant content',
        body: 'Pages for scaling and root planing, gum grafts, crown lengthening and dental implants. Each covers what the procedure is for, recovery expectations and risks, in language a patient can follow.',
      },
      {
        title: 'Referral page for dentists',
        body: 'A resource for referring practitioners with downloadable forms, what to include, typical response times and how treatment will be communicated back. It gives professional referrers an easy path and a findable page.',
      },
      {
        title: 'Specialist credentials and reviews',
        body: 'Clear profiles showing periodontal training and registration, with consistent details across directories. Review requests are timed and worded to follow each platform’s policy, and sensitive replies never reveal patient information or confirm anyone’s treatment.',
      },
      {
        title: 'Local search set-up',
        body: 'Google Business Profile with specialist categories, services and photos, location pages for each clinic and checks that name, address and phone details match across sources, so nearby patients see consistent information.',
      },
      {
        title: 'Clinically reviewed articles',
        body: 'Educational articles on home care, links between gum health and general health, and aftercare, each reviewed and dated by a clinician. This supports the higher accuracy standard search engines expect on health topics.',
      },
    ],
    steps: [
      {
        title: 'Referral and patient mapping',
        body: 'We learn who sends you patients, which procedures you want more of and how people currently find and contact you.',
      },
      {
        title: 'Audit and fix',
        body: 'We review the site, listings and competing specialists, then correct technical and information gaps that hold pages back from performing as they should.',
      },
      {
        title: 'Write and review',
        body: 'We draft condition, procedure and referral pages for clinician review, adding clear credentials, cited sources and review dates, then publish them once approved.',
      },
      {
        title: 'Track and improve',
        body: 'We report on enquiries, referral form submissions and local visibility, and update pages as treatments, clinical guidance or referral patterns change.',
      },
    ],
    faq: [
      {
        q: 'How is periodontist SEO different from general dentist SEO?',
        a: 'Specialists rely heavily on referrals and on patients who often do not know periodontics exists, so they search by symptom. Pages must explain conditions, show specialist training and give referring dentists a clear route, which a general dental site rarely covers.',
      },
      {
        q: 'Can SEO attract patients looking for gum disease care?',
        a: 'It can make your practice visible for symptom and treatment searches, such as bleeding gums or gum recession, when pages are accurate and well-structured. We cannot guarantee bookings or rankings, but we track enquiries and calls from those searches over time.',
      },
      {
        q: 'Do I need to rebuild my website?',
        a: 'Not necessarily. Many sites can be improved by editing and adding pages, fixing speed and mobile problems and tidying structure. We recommend a rebuild only if the platform itself blocks the changes needed, and we explain why before suggesting it.',
      },
      {
        q: 'How do you handle healthcare advertising rules?',
        a: 'Rules for health claims, testimonials and before-and-after images differ by country and regulator. We write cautiously, avoid cure and outcome promises, and rely on you or your regulator’s guidance for final approval on anything borderline, such as patient testimonials or images.',
      },
      {
        q: 'Is the return from SEO measurable for a small specialist practice?',
        a: 'Yes, mostly. We set up call tracking, form tracking and referral source questions so enquiries can be traced to organic search. Numbers depend on your market and capacity, so we report the actual enquiries rather than forecasting a return that nobody can know in advance.',
      },
    ],
    ...AUDIT,
    related: ['seo-for-dentists', 'orthodontist-seo', 'content-marketing'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'veterinarian-seo',
    path: '/seo-services/veterinarian-seo',
    name: 'Veterinarian SEO',
    title: 'Veterinarian SEO Services | Vet Clinic Visibility',
    description:
      'SEO for vet clinics and animal hospitals: emergency and out-of-hours visibility, species-specific pages, accurate listings and trust content for pet owners.',
    h1: 'Veterinarian SEO services',
    intro:
      'Veterinarian SEO makes vet clinics and animal hospitals easy to find when a pet owner needs help, whether that is a routine vaccination or a late-night emergency. Pet owners search by species, symptom and distance, so accurate listings, clear service pages and visible opening hours matter as much as articles.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Vets & Pet Clinics',
    includes: [
      {
        title: 'Emergency and out-of-hours visibility',
        body: 'Clear pages and profile details for emergency care, including hours, how to reach the on-call vet and what to do on the way. Wrong hours cost trust quickly, so we keep these accurate everywhere.',
      },
      {
        title: 'Species and service pages',
        body: 'Dedicated pages for dogs, cats, rabbits, birds and exotics where you treat them, plus vaccination, dental, surgery, diagnostics and neutering. Each tells owners what you do for their animal specifically.',
      },
      {
        title: 'Local map visibility',
        body: 'Google Business Profile with correct categories, services, photos and attributes, plus consistent clinic details across directories and per-branch pages, so owners nearby find the right practice and the right phone number.',
      },
      {
        title: 'New pet owner content',
        body: 'Guides for puppies, kittens and adoptions covering first vaccinations, microchipping, feeding and signs to watch for. This reaches owners early and builds familiarity before they choose a regular vet for the long term.',
      },
      {
        title: 'Reviews and reputation',
        body: 'A simple process for inviting owners to leave honest reviews, with reply guidance that stays kind and avoids sharing case details. Owners read these closely, especially after a difficult outcome.',
      },
      {
        title: 'Team and facility trust pages',
        body: 'Vet and nurse profiles with qualifications and interests, facility details such as isolation wards or imaging equipment, and clear information on booking and payment options. Owners want to know who will care for their pet.',
      },
    ],
    steps: [
      {
        title: 'Listing and site review',
        body: 'We check opening hours, emergency details and service pages against reality and note what competing clinics in your area offer.',
      },
      {
        title: 'Correct and complete',
        body: 'We fix listings, speed and mobile issues, and make phone, directions and booking buttons easy to use on small screens.',
      },
      {
        title: 'Publish useful pages',
        body: 'We add species, service and owner-guide pages written with your vets, so the advice matches how your clinic actually works.',
      },
      {
        title: 'Review and report',
        body: 'We report on map visibility, calls and booking requests, and update content seasonally, such as for parasites or festive hazards.',
      },
    ],
    faq: [
      {
        q: 'What makes SEO for vets different from other local businesses?',
        a: 'Owners often search in a worried moment, so emergency details and hours must be right, and they may be looking for a specific species. A vet site needs clear care information and visible reassurance, not only a list of services.',
      },
      {
        q: 'Can SEO bring in emergency cases?',
        a: 'It can make your clinic visible when owners search for urgent care nearby, provided your hours and contact details are accurate. We cannot control demand or guarantee rankings, but we can make sure those searches find the right information, including who to call and where to go.',
      },
      {
        q: 'How often should we update the website?',
        a: 'Opening hours, holiday cover and team changes should be updated straight away. Educational articles can follow a calmer rhythm, such as seasonal topics every few months. Fresh, accurate content matters more than a fixed schedule, and nothing should sit unchecked for years.',
      },
      {
        q: 'How much do reviews matter?',
        a: 'Quite a lot, because owners compare nearby clinics and read recent feedback before choosing. Reviews also feed local visibility. We help you ask in a way that follows platform rules and never suggest buying or incentivising reviews, which breaks the rules of most platforms.',
      },
      {
        q: 'Do you guarantee first-page results?',
        a: 'No. Nobody can guarantee rankings, and anyone who does is overpromising. We set up the factors we can control, such as listings, content and technical quality, then report on how your visibility, calls and enquiries are changing from month to month.',
      },
    ],
    ...AUDIT,
    related: ['seo-for-doctors', 'chiropractor-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'acupuncturist-seo',
    path: '/seo-services/acupuncturist-seo',
    name: 'Acupuncturist SEO',
    title: 'Acupuncturist SEO Services | Clinic Visibility',
    description:
      'SEO for acupuncture and integrative clinics: condition-led pages with careful claims, local visibility, practitioner trust signals and first-visit content.',
    h1: 'Acupuncturist SEO services',
    intro:
      'Acupuncturist SEO helps acupuncture and integrative health clinics appear when people look for relief from pain, stress, fertility concerns and other issues nearby. Because evidence varies by condition, the pages need careful, honest wording, clear practitioner qualifications and a calm explanation of what a first appointment involves for newcomers who have never tried it.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Acupuncture Clinics',
    includes: [
      {
        title: 'Condition-led pages with careful claims',
        body: 'Pages for conditions people search, such as back pain, migraines or stress, that describe what acupuncture is commonly used for and what research does or does not show. We avoid cure language and unsupported promises.',
      },
      {
        title: 'First-visit and treatment explainers',
        body: 'Pages that cover what happens at an initial consultation, how needles are used, hygiene, how many sessions are typical and possible side effects, which lowers the worry that stops many first-time patients booking.',
      },
      {
        title: 'Practitioner qualifications and registration',
        body: 'Profiles showing training, professional body membership and registration or licence where your region requires one. Credentials are shown prominently and kept consistent across directories, your own site and social profiles.',
      },
      {
        title: 'Local and service-area visibility',
        body: 'Google Business Profile categories, services and photos, a page for each clinic and consistent listings. Clinics that also offer cupping, herbs or massage get separate pages so each service can be found.',
      },
      {
        title: 'Trust-focused blog content',
        body: 'Articles written with practitioners on topics such as acupuncture and sleep, preparing for a session or combining treatments with medical care. Sources are cited and medical limits stated plainly, including when to see a doctor.',
      },
      {
        title: 'Reviews and patient stories',
        body: 'A consent-based approach to testimonials and reviews that follows local advertising rules for health practitioners. Patient stories are kept factual and never describe outcomes as typical or guaranteed, because results differ for every person.',
      },
    ],
    steps: [
      {
        title: 'Review services and rules',
        body: 'We list the treatments you offer and check which claims your regulator or professional body allows on public websites and in any patient testimonials.',
      },
      {
        title: 'Audit the site',
        body: 'We assess page structure, speed, listings and local competitors, and see which conditions people actually search for in your area.',
      },
      {
        title: 'Write with practitioners',
        body: 'We draft condition and treatment pages with your input, then you approve the wording of every health statement before it is published.',
      },
      {
        title: 'Measure bookings',
        body: 'We track calls, booking requests and local visibility, and revise pages that bring enquiries from people who are not a good fit.',
      },
    ],
    faq: [
      {
        q: 'Can SEO really help an acupuncture clinic get patients?',
        a: 'It can put your clinic in front of people actively searching for acupuncture or relief from a specific problem nearby. Results depend on your location, competition and reputation, and we cannot promise a number of patients, but we measure the enquiries SEO brings.',
      },
      {
        q: 'How do you handle health claims?',
        a: 'Carefully. We describe what acupuncture is used for, cite credible sources and avoid cure, guarantee or "proven to" language unless the evidence supports it. Your professional body or regulator may have its own advertising rules, which take priority over our suggestions.',
      },
      {
        q: 'How is this different from a general SEO company?',
        a: 'A specialist knows searchers use condition and symptom terms, that trust and qualifications weigh heavily, and that health advertising is regulated. A generic approach often misses these details, producing pages that read as promotional and attract little confidence from either readers or search engines.',
      },
      {
        q: 'Will it work for a holistic or integrative practice?',
        a: 'Usually, if each service has its own clear page and the practice explains who it helps. Practices offering many therapies often benefit from separate pages and a clear overall explanation, rather than one long list that blends everything together and answers nothing in particular.',
      },
      {
        q: 'How long until we see changes?',
        a: 'Listing and page fixes can influence local visibility within weeks in some markets, while competitive areas take longer. We do not guarantee dates or positions, and we share regular reports so you can see what has moved and what has not.',
      },
    ],
    ...AUDIT,
    related: ['chiropractor-seo', 'seo-for-doctors', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'chiropractor-seo',
    path: '/seo-services/chiropractor-seo',
    name: 'Chiropractor SEO',
    title: 'Chiropractor SEO Services | Reach Local Pain Patients',
    description:
      'SEO for chiropractic clinics: back, neck and sciatica pages, local map visibility, new-patient content and review management with careful claims.',
    h1: 'Chiropractor SEO services',
    intro:
      'Chiropractor SEO helps clinics reach people who are in pain and searching nearby for back, neck, joint or posture care. Those searches are urgent and local, so the website must show conditions treated, practitioner credentials and an easy way to book, while accurate listings and reviews support visibility on maps.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Spine Care',
    includes: [
      {
        title: 'Pain and condition pages',
        body: 'Pages for lower back pain, neck pain, sciatica, headaches and sports injuries, explaining typical causes, what an examination involves and when to see a doctor first. We avoid claims that treatment cures a condition.',
      },
      {
        title: 'Local map and listing management',
        body: 'Google Business Profile set-up, categories, services, photos, hours and booking links, plus accurate details across directories. Map results drive many first calls, so inconsistent data can quietly lose appointments without anyone noticing.',
      },
      {
        title: 'New patient journey',
        body: 'A clear page on what to expect at the first visit, how long it takes, what to wear, and how follow-up care works. It answers the practical questions that often decide whether someone books.',
      },
      {
        title: 'Practitioner and clinic trust',
        body: 'Profiles with qualifications, registration details and areas of interest, clinic photos and consistent contact information. Patients choosing a practitioner for spinal care want proof of training and a visible, real practice.',
      },
      {
        title: 'Multi-practitioner and multi-clinic structure',
        body: 'For groups, we create pages per location and per practitioner without duplicating text, so each clinic can appear for its own area and individual practitioners can be found by name.',
      },
      {
        title: 'Reviews and reputation',
        body: 'A repeatable process for requesting honest feedback and answering it professionally without revealing health information. Recent reviews influence both local visibility and a patient’s choice between two or three nearby clinics.',
      },
    ],
    steps: [
      {
        title: 'Discovery and audit',
        body: 'We review your site, listings, reviews and nearby clinics, and identify which conditions and areas matter most to your practice.',
      },
      {
        title: 'Plan pages and listings',
        body: 'We choose the condition, service and location pages to create or improve, and the profile changes needed for map visibility.',
      },
      {
        title: 'Implement and publish',
        body: 'We fix technical issues, write and edit pages with your sign-off on all clinical statements, and start a steady review routine.',
      },
      {
        title: 'Monitor and adjust',
        body: 'We track map visibility, calls and booking requests, and revise pages and listings when search patterns, seasons or competitors change.',
      },
    ],
    faq: [
      {
        q: 'Can SEO help a chiropractic clinic get more patients?',
        a: 'It can help more nearby people find you when they search for back or neck care, particularly through map results and condition pages. The number of new patients depends on your area and competition, so we report calls and bookings, not promises.',
      },
      {
        q: 'Is SEO better than paid ads for a clinic?',
        a: 'They do different jobs. Ads can bring enquiries quickly but stop when spend stops, while SEO is slower and builds visibility that continues. Health advertising rules may limit what ads can say, so some clinics choose a mix of both.',
      },
      {
        q: 'Will SEO work for a small or new clinic?',
        a: 'Often it can, because local searches reward accurate listings, good reviews and relevant pages, not only large budgets. A new clinic starts with less history, so building profile completeness and reviews early is a priority, alongside clear pages for the problems you treat.',
      },
      {
        q: 'How do you handle reviews?',
        a: 'We set up a simple way to ask patients for feedback, follow each platform’s guidelines, and help you write calm replies that do not confirm anyone is a patient. We do not buy reviews or filter requests to only happy customers.',
      },
      {
        q: 'How long does chiropractic SEO take?',
        a: 'Improvements to listings and key pages may show up in weeks, but competitive areas usually need longer. We cannot guarantee timelines or positions, but monthly reporting shows the work done and the movement in visibility, calls and enquiries over the months.',
      },
    ],
    ...AUDIT,
    related: ['acupuncturist-seo', 'personal-injury-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'hospital-seo',
    path: '/seo-services/hospital-seo',
    name: 'Hospital SEO',
    title: 'Hospital SEO Services | Departments & Doctors Online',
    description:
      'SEO for hospitals and medical centres: department and doctor pages, multi-site structure, appointment paths and medically reviewed content patients can trust.',
    h1: 'Hospital SEO services',
    intro:
      'Hospital SEO makes large healthcare websites easier to find and use. A hospital site holds hundreds of pages for departments, specialities, doctors, conditions and locations, so the work is about structure, accuracy and medical review: helping patients and families find the right service and reach an appointment, enquiry or emergency number quickly.',
    icon: 'apartment',
    category: 'seo',
    hub: 'industry',
    tag: 'Hospitals',
    includes: [
      {
        title: 'Department and speciality architecture',
        body: 'A clear hierarchy from specialities to conditions and procedures, with internal links that help patients and search engines move between them. We remove duplicate and outdated pages that dilute authority across a large site.',
      },
      {
        title: 'Doctor profiles and structured data',
        body: 'Consistent doctor pages with qualifications, speciality, languages, locations and booking links, supported by structured data. Accurate profiles help patients choose and help search engines connect people to the right departments and locations.',
      },
      {
        title: 'Appointment and enquiry paths',
        body: 'Mobile-friendly booking, call and enquiry routes from every relevant page, with emergency numbers always visible. We track which pages lead to appointments so improvements are based on what patients actually do.',
      },
      {
        title: 'Medically reviewed content',
        body: 'Condition and treatment pages with named clinical reviewers, review dates and cited sources. Search engines hold health information to a high standard, and so do patients deciding where to be treated.',
      },
      {
        title: 'Multi-location and campus listings',
        body: 'Managed Google Business Profiles for the hospital, clinics, pharmacies and departments, with correct hours, phone numbers, entrances and services. For networks, each site gets its own page rather than sharing one generic template.',
      },
      {
        title: 'International and multilingual patients',
        body: 'Where the hospital serves patients from other countries or language groups, we plan translated pages, hreflang, and clear information on international patient services, with proper review rather than raw machine translation.',
      },
    ],
    steps: [
      {
        title: 'Stakeholder and content inventory',
        body: 'We map the site, owners of each section and current performance, then agree priorities with marketing, clinical and IT teams.',
      },
      {
        title: 'Technical and structure fixes',
        body: 'We resolve crawling, duplication, speed and mobile issues, and set up templates and structured data for departments, doctors and locations.',
      },
      {
        title: 'Content governance',
        body: 'We set a review workflow so new and updated pages are checked by a clinician, dated and approved before publishing.',
      },
      {
        title: 'Measure and report',
        body: 'We report on department visibility, appointment requests and listing performance, and adjust priorities with each team every quarter so the roadmap stays realistic.',
      },
    ],
    faq: [
      {
        q: 'Is SEO appropriate for a hospital?',
        a: 'Yes, when it focuses on accurate, helpful information rather than aggressive promotion. Patients already search for symptoms, specialists and hospitals, and clear pages help them find the right care. We work within your communication policies and local healthcare advertising rules.',
      },
      {
        q: 'Can SEO increase appointment bookings?',
        a: 'It can bring more relevant visitors to department and doctor pages and make booking easier, which may lead to more appointments. We cannot promise a number, so we measure calls, form submissions and booking requests that begin in organic search.',
      },
      {
        q: 'How is hospital SEO different from SEO for a clinic?',
        a: 'The scale and the governance are different. A hospital has many departments, doctors, locations and content owners, so the challenge is keeping a large site consistent, accurate and reviewed, in addition to the local and content work a small clinic needs.',
      },
      {
        q: 'How do you protect accuracy and patient privacy?',
        a: 'Clinical content is reviewed by a named professional, and we never ask for patient data. Tracking is set up to respect consent and privacy laws that apply in your region, and review replies avoid disclosing anything about individual patients or their treatment.',
      },
      {
        q: 'How do you measure success?',
        a: 'We look at visibility for target specialities, organic appointment and enquiry actions, call volume from listings and page quality. Traffic is reported too, but the main question is whether the right patients can find and reach the right service without friction.',
      },
    ],
    ...AUDIT,
    related: ['seo-for-doctors', 'enterprise-seo', 'local-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'security-company-seo',
    path: '/seo-services/security-company-seo',
    name: 'Security Company SEO',
    title: 'Security Company SEO | Guarding, CCTV & Alarms',
    description:
      'SEO for security firms: manned guarding, CCTV, alarm and access control pages for homes and businesses, local visibility and B2B enquiries from tenders.',
    h1: 'Security company SEO',
    intro:
      'Security company SEO helps guarding firms, CCTV installers and alarm providers win enquiries from homeowners, businesses and procurement teams. Buyers want proof of licensing, experience and response capability, so we build service pages, local visibility and credibility signals that suit both a quick residential quote and a long commercial buying process.',
    icon: 'verified_user',
    category: 'seo',
    hub: 'industry',
    tag: 'Security Firms',
    includes: [
      {
        title: 'Pages for each security service',
        body: 'Separate pages for manned guarding, CCTV installation, alarm systems, remote monitoring, access control and risk assessments. Each covers who it is for, how it is delivered and what a buyer should expect, rather than listing everything on one page.',
      },
      {
        title: 'Residential and commercial split',
        body: 'Homeowners want installation and quotes, while businesses ask about sites, shifts, compliance and contracts. We structure pages and calls to action around each, so a facilities manager and a householder see relevant detail.',
      },
      {
        title: 'Licence and accreditation proof',
        body: 'Where your region requires licensing or certification for guarding or installation, we show it clearly with registration details, insurance information and industry memberships. These are among the first things buyers check.',
      },
      {
        title: 'Local service-area visibility',
        body: 'Google Business Profile, service-area pages and consistent listings for the cities you cover. For firms with branches, each location gets distinct pages with real coverage details instead of copied text.',
      },
      {
        title: 'Tender and B2B content',
        body: 'Sector pages for retail, construction sites, warehouses, schools and events, plus resources such as site-survey checklists and security plan outlines that help procurement teams shortlist suppliers, compare providers and contact you.',
      },
      {
        title: 'Careful public information',
        body: 'We take care not to publish details that could weaken client security, such as site specifics or system weaknesses. Case studies are written only with client permission and without sensitive operational detail.',
      },
    ],
    steps: [
      {
        title: 'Service and buyer review',
        body: 'We list what you sell, who buys it and how they search, separating homeowners, small businesses and large procurement buyers.',
      },
      {
        title: 'Audit and fixes',
        body: 'We check the site, listings and competitors, then fix technical issues, unclear service pages and missing proof of licensing or insurance.',
      },
      {
        title: 'Build content',
        body: 'We write service, sector and location pages with calls to action that match each type of buyer, and agree what may be published.',
      },
      {
        title: 'Measure enquiries',
        body: 'We report on calls, quote requests and tender enquiries from organic search, and tune pages by service, sector and area.',
      },
    ],
    faq: [
      {
        q: 'Do security companies really get leads from search?',
        a: 'Many do. People search for CCTV installation, guard services or alarm providers when they need them, often with a city name. Commercial buyers also research suppliers online before inviting quotes, so a clear, credible site can influence both kinds of enquiry.',
      },
      {
        q: 'Can SEO help us win commercial or tender work?',
        a: 'It can help procurement teams find and trust you through sector pages, case studies and accreditation details. Formal tenders are often won through other routes, so SEO is better seen as support for supplier research than a replacement for bidding.',
      },
      {
        q: 'Can SEO also help us recruit guards and technicians?',
        a: 'Yes, in part. Job pages, location details and clear role descriptions can appear in job searches, and good employer information supports applications. We can plan these pages alongside the service content if hiring is a real priority for your firm this year.',
      },
      {
        q: 'What if we rank in some areas but not others?',
        a: 'That is common. We look at which areas lack local pages, listings or reviews, and add what is missing for those places. Coverage claims should match where you genuinely operate, so we do not create pages for areas you cannot serve.',
      },
      {
        q: 'How long does it take?',
        a: 'Local searches can respond within weeks after listings and pages are fixed, but competitive markets and commercial terms usually take longer. We cannot guarantee positions or dates, and we report visibility and enquiry numbers so progress is clear and easy to check.',
      },
    ],
    ...AUDIT,
    related: ['contractor-seo', 'electrician-seo', 'lead-generation-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'hvac-seo',
    path: '/seo-services/hvac-seo',
    name: 'HVAC SEO',
    title: 'HVAC SEO Services | More Repair & Install Calls',
    description:
      'SEO for heating, cooling and air conditioning contractors: emergency repair, installation and maintenance pages, seasonal planning and local map visibility.',
    h1: 'HVAC SEO services',
    intro:
      'HVAC SEO helps heating, ventilation and air conditioning contractors show up when a system fails or a replacement is planned. Demand rises sharply with heat waves and cold snaps, so the work combines map visibility, service pages for repair, installation and maintenance, and planning ahead for the seasons your customers search in.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'HVAC',
    includes: [
      {
        title: 'Repair, install and maintenance pages',
        body: 'Separate pages for emergency repair, system replacement, new installation and service plans. Searchers in a breakdown want a number to call, while those replacing a system compare options, so each page is built for its own purpose.',
      },
      {
        title: 'Equipment and brand pages',
        body: 'Pages for the systems you install and service, such as split units, ducted systems, heat pumps, boilers and ventilation, with the brands you are authorised to work on and honest guidance on sizing and suitability.',
      },
      {
        title: 'Seasonal demand planning',
        body: 'We prepare content and listing updates before peak periods: cooling pages ahead of summer and heating pages before winter. Hours, availability and emergency messaging are updated so the site matches real capacity.',
      },
      {
        title: 'Service-area and map presence',
        body: 'Optimised Google Business Profile, accurate service areas and city or neighbourhood pages that describe genuine coverage. Map results are central for urgent searches, so details, photos and categories are kept current.',
      },
      {
        title: 'Reviews and trust details',
        body: 'Licence and insurance information, technician profiles and a steady flow of genuine reviews. Customers letting someone into their home want proof of reliability, and reviews also influence local visibility and which firm gets the call.',
      },
      {
        title: 'Maintenance plans and financing information',
        body: 'Clear pages for service agreements and, where offered, payment or finance options, with terms in plain language. These help buyers considering a large replacement decide to request a quote with more confidence.',
      },
    ],
    steps: [
      {
        title: 'Services and seasons',
        body: 'We list what you install and repair, where you work and when demand peaks, then audit your site and listings against that.',
      },
      {
        title: 'Fix and set up',
        body: 'We correct listing data, speed and mobile call buttons, and add tracking so phone calls and forms can be linked to search.',
      },
      {
        title: 'Publish service content',
        body: 'We create or improve service, equipment and area pages with genuine detail, in time for the seasons that matter to you.',
      },
      {
        title: 'Report and adapt',
        body: 'We report on map visibility, calls and quote requests, and adjust priorities as weather, competitors, staffing and your capacity change.',
      },
    ],
    faq: [
      {
        q: 'How long does HVAC SEO take to show results?',
        a: 'Map and listing changes can influence local results within weeks, while competitive terms take longer. Seasonal timing also matters, so we try to start before peak periods. We cannot guarantee rankings, but we report on visibility, calls and quote requests.',
      },
      {
        q: 'Do I need both Google Ads and SEO?',
        a: 'Many HVAC firms use both. Ads can bring urgent calls quickly during peak weeks, while SEO builds visibility that continues without per-click costs. The right mix depends on your margins, capacity and how competitive your area is at the time.',
      },
      {
        q: 'How do you handle several service areas?',
        a: 'We create area pages only for places you genuinely serve, with local detail such as common property types, typical issues or response coverage. Each page is distinct, because copied pages with only the town name changed tend to perform poorly.',
      },
      {
        q: 'How is HVAC SEO different from general digital marketing?',
        a: 'It focuses on being found at the moment of need, particularly in maps and by service and location. General marketing may build awareness, while HVAC SEO concentrates on calls from people who are ready to book a repair or request a quote.',
      },
      {
        q: 'Can SEO help with emergency repair calls?',
        a: 'It can make you visible when people search for urgent help, provided your hours, phone number and service area are accurate and you can actually answer. Misleading "24/7" claims hurt trust, so we only highlight availability you can genuinely deliver.',
      },
    ],
    ...AUDIT,
    related: ['plumber-seo', 'electrician-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'roofer-seo',
    path: '/seo-services/roofer-seo',
    name: 'Roofer SEO',
    title: 'Roofer SEO Services | Roof Repair & Replacement Leads',
    description:
      'SEO for roofing contractors: repair, replacement and storm damage pages, material guides, project galleries and local visibility that earn quote requests.',
    h1: 'Roofer SEO services',
    intro:
      'Roofer SEO helps roofing contractors get found by property owners facing a leak, storm damage or a planned replacement. A roof is a large, trust-heavy purchase, so the site needs clear service pages, proof of past work, honest material guidance and quick, simple ways to request an inspection or quote.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Roofing',
    includes: [
      {
        title: 'Repair, replacement and inspection pages',
        body: 'Pages for leak repair, full replacement, inspections and maintenance. They explain when repair is enough, what a replacement involves and how long it typically takes, helping owners decide while showing you are not just pushing the biggest job.',
      },
      {
        title: 'Material and roof-type content',
        body: 'Guides for tile, metal, flat, shingle or other roof types common in your market, covering lifespan, maintenance and climate suitability. Owners researching a replacement often start with the material and its likely lifespan.',
      },
      {
        title: 'Storm and damage response pages',
        body: 'Content for owners searching after severe weather, with a clear contact route, what to photograph and how an inspection works. Where claims are involved, we keep wording factual and avoid promising insurance outcomes.',
      },
      {
        title: 'Project gallery and proof',
        body: 'Completed project pages with location, roof type, scope and photos, published with customer permission. Real work in real places is persuasive for buyers and gives local pages genuine content that other sites do not have.',
      },
      {
        title: 'Residential and commercial split',
        body: 'Separate pathways for homeowners and for property managers or builders, covering flat roofing, waterproofing and maintenance contracts. Commercial buyers look for credentials and process, not only prices, so we write for both audiences.',
      },
      {
        title: 'Local visibility and reviews',
        body: 'Google Business Profile with service areas, photos and categories, city pages with real project detail, and a review routine tied to finished jobs. Licences and insurance are shown where required.',
      },
    ],
    steps: [
      {
        title: 'Audit and goals',
        body: 'We review your site, listings and local competitors, and decide which jobs matter most, such as repairs, replacements or commercial work.',
      },
      {
        title: 'Foundation fixes',
        body: 'We clean up listings, speed and mobile layouts, and add quote forms and call tracking so enquiries can be traced to search.',
      },
      {
        title: 'Build pages and proof',
        body: 'We create service, material and project pages using your real photos and details, and build relevant local citations and links.',
      },
      {
        title: 'Monitor and improve',
        body: 'We report on visibility, calls and quote requests, and update content after storm seasons or whenever local demand shifts in your area.',
      },
    ],
    faq: [
      {
        q: 'How long does roofing SEO take?',
        a: 'Local results may improve within weeks when listings and pages are fixed, while competitive terms take longer. We cannot guarantee rankings or timeframes. We report on visibility, calls and quote requests so you can judge the work for yourself. Reports are plain, not padded.',
      },
      {
        q: 'What is the difference between SEO and paid ads for roofers?',
        a: 'Paid ads can bring leads quickly but cost per click and stop when you stop paying. SEO takes longer to build and is not guaranteed, but pages and listings can keep generating enquiries. Many roofers use ads for peaks and SEO for steady visibility.',
      },
      {
        q: 'Can SEO help with emergency repair calls?',
        a: 'It can help you appear when owners search for urgent leak or storm repairs, if your listing, hours and phone number are right and you can respond. We would not advertise rapid response that your team cannot actually deliver on the day.',
      },
      {
        q: 'What if my roofing website is new?',
        a: 'A new site starts without history, so early work focuses on strong foundations: complete listings, clear service pages, a few genuine reviews and local mentions from nearby sites. Progress is gradual, and we agree realistic expectations with you before starting.',
      },
      {
        q: 'Do you build pages for every town we serve?',
        a: 'Only where you really work. Each area page should carry local detail, such as housing types, weather issues or completed projects, so it helps readers. Pages created purely to catch searches for places you do not serve can harm trust.',
      },
    ],
    ...AUDIT,
    related: ['contractor-seo', 'restoration-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'landscaper-seo',
    path: '/seo-services/landscaper-seo',
    name: 'Landscaper SEO',
    title: 'Landscaper SEO Services | Garden Design & Lawn Care',
    description:
      'SEO for landscaping businesses: portfolio-led pages, seasonal lawn care and design content, image optimisation and local visibility for quote requests.',
    h1: 'Landscaper SEO services',
    intro:
      'Landscaper SEO helps garden designers, lawn care providers and landscape contractors reach homeowners and property managers planning outdoor work. This is a visual, seasonal trade, so strong project photography, clear service pages and timely seasonal content count for more than almost anything else, all backed by accurate local listings and honest reviews.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Landscaping',
    includes: [
      {
        title: 'Portfolio built for search',
        body: 'Project pages with before and after photos, location, scope, plants and materials used, and a short account of the brief. Optimised images and captions help projects appear in image search and make the work believable.',
      },
      {
        title: 'Design, build and maintenance pages',
        body: 'Separate pages for garden design, patios and hardscaping, planting, lawn care and ongoing maintenance. Each speaks to a different buyer: someone planning a rebuild searches very differently from someone wanting regular mowing.',
      },
      {
        title: 'Seasonal content calendar',
        body: 'Planning content around the seasons in your climate: spring clean-ups, summer irrigation, autumn planting or winter prep. Pages are refreshed before demand rises, so they are already indexed when owners start searching.',
      },
      {
        title: 'Commercial landscaping',
        body: 'Pages aimed at property managers, housing developments, hotels and offices covering grounds maintenance contracts, scale of work, site safety and references. Commercial buyers need different reassurance than homeowners do, so these pages are kept separate.',
      },
      {
        title: 'Local profile and service areas',
        body: 'Google Business Profile with categories, photos, service areas and posts, along with city pages showing real work nearby. Photos of finished gardens help local listings stand out and earn more clicks.',
      },
      {
        title: 'Specialist and plant knowledge content',
        body: 'Articles on plant choice for local conditions, lawn problems, drainage and sustainable planting, written with your team’s experience. They show expertise and attract owners earlier in their planning, before they ask for quotes.',
      },
    ],
    steps: [
      {
        title: 'Service and season review',
        body: 'We list your services, typical project sizes and busy periods, then audit your site, project photos and local listings against competitors.',
      },
      {
        title: 'Organise the portfolio',
        body: 'We structure project pages, optimise image files and captions, and make quote requests quick and easy on mobile devices for people standing in a garden.',
      },
      {
        title: 'Create service and seasonal pages',
        body: 'We write the pages that match how people search for design, building and upkeep, timed to go live ahead of each season.',
      },
      {
        title: 'Report and refine',
        body: 'We track visibility, calls and quote requests by service, and adjust the plan as seasons, weather, workload and competitors shift.',
      },
    ],
    faq: [
      {
        q: 'How long does landscaping SEO take?',
        a: 'Improvements to listings and key pages can start to appear in weeks, though competitive local searches usually need longer. Seasonality matters too, so starting before your busy period helps. We cannot guarantee rankings or dates, and we report progress regularly.',
      },
      {
        q: 'Is SEO better than paid advertising for landscapers?',
        a: 'Neither is better in every case. Ads can fill a calendar quickly, but costs continue. SEO takes time and is not guaranteed, but your project pages and listings can keep working. Many landscapers use ads for new services and SEO for steady enquiries.',
      },
      {
        q: 'Can SEO work for a small landscaping business?',
        a: 'Yes, because many searches are local and rely on accurate listings, good photos and reviews rather than company size. A small team with a well-documented portfolio can stand out in its own area, even against larger firms with bigger budgets.',
      },
      {
        q: 'What happens if I stop SEO work?',
        a: 'Pages and listings that are already published generally continue to exist, but without updates, reviews and fresh content, visibility can gradually fade as competitors keep improving. Some businesses reduce to light maintenance after the main build is done, once the foundations are in place.',
      },
      {
        q: 'How do you measure success?',
        a: 'We track calls, form submissions and quote requests from organic search, alongside visibility for key services and areas. We also look at which projects and pages draw enquiries, so photography and content can focus on what works best for your type of customer.',
      },
    ],
    ...AUDIT,
    related: ['contractor-seo', 'home-services-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'restoration-seo',
    path: '/seo-services/restoration-seo',
    name: 'Restoration SEO',
    title: 'Restoration SEO Services | Water, Fire & Storm Damage',
    description:
      'SEO for restoration companies: water, fire, mould and storm damage pages built for urgent searches, and for the insurers and adjusters who refer work.',
    h1: 'Restoration SEO services',
    intro:
      'Restoration SEO helps water, fire, mould and storm damage companies be found at the worst moment for a customer. Searches are urgent and made on phones, so call-first pages, accurate availability and proof of certification matter most, along with content that speaks to insurers, property managers and adjusters who also send work.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Emergency Restoration',
    includes: [
      {
        title: 'Call-first emergency pages',
        body: 'Pages for burst pipes, flooding, fire and smoke damage and storm damage with a visible phone number, clear first steps for the property owner and what happens when your crew arrives. Built for stressed readers on small screens.',
      },
      {
        title: 'Damage type and service coverage',
        body: 'Detailed pages for water extraction, drying, mould remediation, fire and smoke cleaning, board-up and reconstruction. Each explains the process and limits honestly, so owners and adjusters see what is included.',
      },
      {
        title: 'Insurance and adjuster content',
        body: 'Information for policyholders on documenting damage and working with their insurer, plus pages for adjusters and property managers on response process and reporting. We avoid implying that any claim will be approved.',
      },
      {
        title: 'Certifications and credibility',
        body: 'Where your region recognises trade certifications, licences or insurance, we show them clearly and keep them current. Trust is vital when someone lets a crew into a damaged home or business.',
      },
      {
        title: 'Multi-city service coverage',
        body: 'Location pages for each area you can reach, with realistic response information and local detail, and matching Google Business Profiles for branches. We avoid claiming response times you cannot meet consistently.',
      },
      {
        title: 'Measurement for urgent leads',
        body: 'Call tracking and form tracking that separate emergency calls from planned work and show which pages and areas lead to jobs, so effort focuses on the enquiries that matter most to your business.',
      },
    ],
    steps: [
      {
        title: 'Capacity and coverage check',
        body: 'We confirm services, hours, areas and true response capability, since search visibility should match what you can actually deliver on the day.',
      },
      {
        title: 'Technical and listing fixes',
        body: 'We correct listings and speed, make phone buttons prominent on mobile, and set up call tracking before we change any pages.',
      },
      {
        title: 'Build the service content',
        body: 'We write damage, service and area pages, plus resources for insurers and property managers, with your approval on all claims.',
      },
      {
        title: 'Track and improve',
        body: 'We report on emergency calls, quote requests and map visibility, and review how pages perform around weather events and busy periods.',
      },
    ],
    faq: [
      {
        q: 'How long does restoration SEO take?',
        a: 'Fixing listings and emergency pages can affect local visibility within weeks, though competitive cities take longer. Because demand follows events, results can look uneven. We cannot guarantee positions or timeframes, but we report visibility and calls on a regular schedule.',
      },
      {
        q: 'Can SEO bring in emergency calls during a disaster?',
        a: 'It can help your company appear when people search for urgent help, if your listings are accurate and your phone is answered. Search interest spikes in these moments, which is why pages and profiles must be ready beforehand, not built after the event.',
      },
      {
        q: 'How is restoration SEO different from other service-business SEO?',
        a: 'Customers are in distress and often insurers or adjusters are involved, so you serve two audiences. Content must be quick to use on a phone for the owner, and detailed and professional for the people who manage the claim, so both are served.',
      },
      {
        q: 'What if we operate in several cities?',
        a: 'We build distinct pages and listings for each location you actually cover, with local detail and honest response information. Duplicating one page across many cities rarely works well and can undermine trust with both customers and search engines, and it wastes effort.',
      },
      {
        q: 'Can we compete against larger national restoration chains?',
        a: 'Often in your own area, yes, because local searches reward proximity, reviews and relevant pages. We cannot promise to outrank big brands, but local expertise, strong reviews and clear service pages give independents a realistic chance in the area they know best.',
      },
    ],
    ...AUDIT,
    related: ['roofer-seo', 'cleaning-company-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'locksmith-seo',
    path: '/seo-services/locksmith-seo',
    name: 'Locksmith SEO',
    title: 'Locksmith SEO Services | Genuine Local Visibility',
    description:
      'SEO for locksmiths: lockout, car key and commercial lock pages, verified map listings and trust details that stand apart from lead-gen and fake profiles.',
    h1: 'Locksmith SEO services',
    intro:
      'Locksmith SEO helps genuine, locally based locksmiths be found by people locked out, replacing locks or needing car keys. The category is full of fake listings and lead-generation sites, so the work centres on verified profiles, transparent pages and trust details that help real customers choose a real local business over an anonymous call centre.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Locksmiths',
    includes: [
      {
        title: 'Verified and policy-compliant profiles',
        body: 'Google Business Profile and other listings set up with real details, correct service-area or storefront settings and verification, following each platform’s rules. We never create fake addresses or duplicate profiles to appear more local.',
      },
      {
        title: 'Lockout, rekey and replacement pages',
        body: 'Separate pages for home lockouts, lock changes, rekeying, smart locks and security upgrades. Each explains how the process works and what the customer should expect on arrival, including identity checks.',
      },
      {
        title: 'Automotive key content',
        body: 'Pages for car lockouts, spare keys and transponder or smart-key replacement, explaining what can be done on site and what may need a dealer. Honest scope prevents wasted calls and disappointed customers.',
      },
      {
        title: 'Commercial and access control',
        body: 'Pages for master key systems, door hardware, safes and access control for offices, landlords and property managers, with enquiry routes for planned work, which is better value than emergency calls.',
      },
      {
        title: 'Trust signals against scams',
        body: 'Visible business name, local address or service area, technician photos, licence or registration details where required, and clear explanations of how call-outs are quoted. Buyers have learned to be cautious in this field.',
      },
      {
        title: 'Reviews and local mentions',
        body: 'A routine for collecting genuine reviews from real jobs and earning mentions from local landlords, estate agents and community sites. Reviews from real customers are the strongest signal separating local firms from lead-gen operators.',
      },
    ],
    steps: [
      {
        title: 'Business and listing audit',
        body: 'We check that your business details, profile type and verification are correct, and look for duplicate, suspended or spam listings.',
      },
      {
        title: 'Set up trust and tracking',
        body: 'We add transparent business information, call tracking and click-to-call, so we can see exactly which pages and listings produce calls.',
      },
      {
        title: 'Publish service pages',
        body: 'We write the lockout, key, security and commercial pages, using real local detail and honest explanations of scope and how call-outs are quoted.',
      },
      {
        title: 'Monitor and maintain',
        body: 'We report on map visibility, calls and reviews, and keep watch for listing issues that can affect profiles in this category.',
      },
    ],
    faq: [
      {
        q: 'What makes locksmith SEO different from other industries?',
        a: 'The category has many spam listings and middlemen, so platforms apply stricter checks and customers are wary. A genuine local locksmith has an advantage if profiles are verified, details are honest and the website clearly shows who will come to the door.',
      },
      {
        q: 'Will my business rank for emergency locksmith searches?',
        a: 'It can appear for those searches, but we cannot promise positions because they are among the most competitive local terms. We focus on accurate listings, reviews and clear pages, then report on map visibility and calls over time, month by month.',
      },
      {
        q: 'Can I do locksmith SEO myself?',
        a: 'Yes, the basics are manageable: claim and verify your profile, keep details accurate, ask customers for reviews and write clear service pages. Support helps when competition is strong, listings have problems or you do not have time to maintain them.',
      },
      {
        q: 'Do you create extra profiles or addresses to improve rankings?',
        a: 'No. Fake addresses, duplicate profiles and virtual offices break platform rules and can lead to suspension, which is especially common in this field. We work with your real business details and service area only, which keeps your profile safe from suspension.',
      },
      {
        q: 'How do you handle service-area businesses with no shopfront?',
        a: 'We set up the profile as a service-area business where that applies, with the address hidden if you work from home, and define realistic areas. Pages and content then focus on those areas, without pretending to have premises you do not.',
      },
    ],
    ...AUDIT,
    related: ['garage-door-seo', 'security-company-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'garage-door-seo',
    path: '/seo-services/garage-door-seo',
    name: 'Garage Door SEO',
    title: 'Garage Door SEO Services | Repair & Installation Leads',
    description:
      'SEO for garage door companies: repair, opener and replacement pages, same-day service visibility, product guides and local rankings that bring in calls.',
    h1: 'Garage door SEO services',
    intro:
      'Garage door SEO helps repair and installation companies get found when a door will not open, a spring breaks or a replacement is due. Customers split between urgent repair and planned upgrades, so we build separate pages for faults, openers, new doors and gates, and support them with accurate local profiles and clear contact options.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Garage Doors',
    includes: [
      {
        title: 'Fault and repair pages',
        body: 'Pages for broken springs, stuck doors, off-track panels, noisy operation and remote problems. They explain common causes, which jobs need a technician for safety, and how booking works, matching the words people use when stressed.',
      },
      {
        title: 'Opener and automation content',
        body: 'Pages for opener repair, replacement and smart-home compatibility, with the brands you service. Searchers often type a brand and model, so detailed pages can capture them better than one general page.',
      },
      {
        title: 'Replacement and new door guides',
        body: 'Sectional, roller, up-and-over and side-hinged options, with guidance on insulation, security, materials and sizing. Buyers planning a new door want information before asking for a quote, and good guides bring them in early.',
      },
      {
        title: 'Gates and shutters',
        body: 'Where you also fit automatic gates or roller shutters, separate pages for each, so those searches reach a relevant page rather than a general garage door page. Residential and commercial work are kept distinct.',
      },
      {
        title: 'Same-day and local presence',
        body: 'Google Business Profile, service-area pages and listing consistency, with availability messages that reflect real capacity. Same-day claims are only used when you can honour them, because disappointed customers leave honest reviews.',
      },
      {
        title: 'Quote and booking flow',
        body: 'Short quote forms, click-to-call and photo upload on mobile so customers can describe the problem quickly. We track which pages and areas produce jobs and focus effort on those first.',
      },
    ],
    steps: [
      {
        title: 'Discovery and competitor view',
        body: 'We learn your services, areas and capacity, and see who appears for repair and replacement searches in your market today.',
      },
      {
        title: 'Keyword and page mapping',
        body: 'We map repair, opener, replacement and area searches to specific pages, and decide which to create, merge or improve first.',
      },
      {
        title: 'Implement and optimise',
        body: 'We fix technical and listing issues, publish the pages and add call and quote tracking so results can be measured.',
      },
      {
        title: 'Monitor ongoing results',
        body: 'We report on map visibility, calls and quote requests, and refine pages by service and area as the data comes in.',
      },
    ],
    faq: [
      {
        q: 'How long does garage door SEO take?',
        a: 'Listing and page improvements can show in local results within weeks, although busy markets take longer. We cannot promise timelines or positions. Monthly reports show visibility, calls and quote requests so you can see whether the work is paying off.',
      },
      {
        q: 'Can you guarantee first-page rankings?',
        a: 'No. Rankings depend on competition, your reputation and the search engine’s own systems, and anyone guaranteeing a position is overpromising. We improve the factors we control and report openly on how your visibility is changing over time, month by month.',
      },
      {
        q: 'How is local SEO different from regular SEO for garage door firms?',
        a: 'Most of your customers search with a place in mind, often on a phone, so map listings, reviews and service-area pages matter as much as the website. Regular SEO covers the site itself, while local SEO adds that proximity layer.',
      },
      {
        q: 'How does SEO compare with paid advertising?',
        a: 'Ads can generate calls quickly but stop when spend stops, and costs rise in competitive areas. SEO is slower and not guaranteed, but pages and listings can keep working. Many companies use ads for urgent demand and SEO for steadier enquiries.',
      },
      {
        q: 'Do you optimise for gates and roller shutters as well?',
        a: 'Yes, if you fit and repair them. We give automatic gates, roller shutters and commercial doors their own pages and keywords, so those customers do not land on a residential garage door page that does not quite answer their question.',
      },
    ],
    ...AUDIT,
    related: ['locksmith-seo', 'contractor-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
];
