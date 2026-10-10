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
 * Industry service pages, second batch: insurance, banking, automotive, cosmetic surgery,
 * creative and professional services, trades, non-profit, retail, jewelry, moving, logistics
 * and funeral homes. Merged into SERVICE_PAGES by service-pages.ts.
 */
export const INDUSTRY_PAGES_2: ServicePage[] = [
  {
    slug: 'insurance-seo',
    path: '/seo-services/insurance-seo',
    name: 'Insurance SEO',
    title: 'Insurance SEO Services | Reach Buyers Comparing Cover',
    description:
      'SEO for insurers, brokers and agents: product pages, quote-intent keywords and trust content that help people comparing cover find and choose your business.',
    h1: 'Insurance SEO services',
    intro:
      'Insurance SEO is the work of getting an insurer, broker or agency found by people who are comparing cover, renewing a policy or asking what a clause means. It focuses on product and quote pages, plain-language explainers and trust signals, because insurance is a regulated, high-stakes purchase where buyers compare carefully before they call anyone.',
    icon: 'verified_user',
    category: 'seo',
    hub: 'industry',
    tag: 'Insurance',
    includes: [
      {
        title: 'Product and intent research',
        body: 'We map how people search for each line of cover, from motor and health to life, travel, business and Takaful, then separate quote-ready searches from early research so every page we plan has one clear job to do.',
      },
      {
        title: 'Policy and quote pages',
        body: 'One focused page per product, covering eligibility, what is and is not included, short example scenarios and a quick quote path, so visitors are not pushed through a generic enquiry form that tells them nothing.',
      },
      {
        title: 'Explainer and claims content',
        body: 'Guides on excess, renewals, exclusions and the claims process, written in everyday language and reviewed by someone qualified. They build trust and answer questions before a salesperson is needed, which keeps wary buyers reading.',
      },
      {
        title: 'Technical and compliance checks',
        body: 'Fast, crawlable pages with the disclosures and licence details your market requires, plus organization markup, and a check that comparison tables and premium calculators can actually be read and indexed by search engines.',
      },
      {
        title: 'Branch and agent visibility',
        body: 'Google Business Profiles and location pages for offices and individual agents, so people who prefer to speak with someone nearby can find the right contact, opening hours and directions without hunting through your site.',
      },
      {
        title: 'Authority and reputation',
        body: 'Mentions from financial publications, industry bodies and community partners, along with a steady and honest review process, to support a brand that has to be trusted with a customer’s savings, property and family.',
      },
    ],
    steps: [
      {
        title: 'Audit the product range',
        body: 'We review current rankings by product line, see how you compare with aggregators and competing insurers, and check which pages turn visits into quote requests.',
      },
      {
        title: 'Plan page by product',
        body: 'We agree which types of cover to prioritise, then outline the pages, explainers and internal links that guide a reader from first question to quote.',
      },
      {
        title: 'Build compliant content',
        body: 'Pages and guides are written with your compliance team’s review in mind, then published with the disclosures and markup that your regulator and market expect.',
      },
      {
        title: 'Measure quotes, not clicks',
        body: 'Reporting follows quote starts, calls and completed applications by product, so you can see which searches lead to genuine policy interest instead of passing traffic.',
      },
    ],
    faq: [
      {
        q: 'How is SEO for insurance different from other industries?',
        a: 'Insurance is regulated and people are cautious about buying it, so pages must be accurate, clearly disclosed and easy to compare. Searchers also arrive at different stages, from "what does this cover" to "get a quote", and each stage needs its own kind of page.',
      },
      {
        q: 'Can a smaller insurer or broker compete with big brands and aggregators?',
        a: 'Often, yes, by being more specific. A niche product, a particular region, a customer group or very clear claims guidance can win searches that larger sites answer in generic terms. We cannot promise rankings, but a focused plan gives a smaller brand a real chance.',
      },
      {
        q: 'Do you cover Takaful and Islamic insurance?',
        a: 'Yes. Takaful products use their own vocabulary and need pages that explain the model accurately, including contributions, pooling and the role of the operator. We research the terms people actually use in each market before writing anything, so the wording fits how customers speak.',
      },
      {
        q: 'How long does insurance SEO take to show results?',
        a: 'Technical fixes and improved product pages can move visibility within a few months, while competitive terms such as car or health insurance take longer. We cannot guarantee timings, so we report monthly on rankings, quote starts and enquiries to show exactly what is changing.',
      },
      {
        q: 'Does SEO replace paid search for insurance?',
        a: 'Not entirely. Paid search can bring quote requests quickly, while SEO builds lasting visibility that does not stop when the budget does. Many insurers run both, and we can align keyword targets so the two channels support each other rather than duplicate effort.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['financial-services-seo', 'banking-seo', 'lead-generation-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'banking-seo',
    path: '/seo-services/banking-seo',
    name: 'Banking SEO',
    title: 'Banking SEO Services | Visibility for Banks and Lenders',
    description:
      'SEO for banks, credit unions and lenders: account and loan pages, branch locators, rate content and compliance-aware work that earns trust with new customers.',
    h1: 'Banking SEO services',
    intro:
      'Banking SEO helps a bank, credit union or lender appear when people search for accounts, loans, cards and branches. It is shaped by compliance, security concerns and a large product range, so the work combines clear product pages, branch visibility and educational content that earns trust without making claims the institution cannot back up.',
    icon: 'account_balance',
    category: 'seo',
    hub: 'industry',
    tag: 'Banking',
    includes: [
      {
        title: 'Product-led keyword strategy',
        body: 'Research across current accounts, savings, mortgages, cards, SME lending and Islamic finance, grouped by customer segment, so that retail, business and private clients each reach pages built around their own questions and needs.',
      },
      {
        title: 'Account and loan pages',
        body: 'Pages that state features, eligibility, where fees are published and the next step plainly, with calculators and application paths that search engines can crawl and that real customers can actually finish on a phone.',
      },
      {
        title: 'Branch and ATM locator SEO',
        body: 'Crawlable location pages, Google Business Profiles and consistent listings for every branch and machine, so that people searching nearby see correct opening hours, available services and directions instead of outdated details.',
      },
      {
        title: 'Educational content',
        body: 'Guides on budgeting, borrowing, saving and spotting fraud, written for the general public and reviewed internally. They build topical authority and help prospects long before they are ready to apply for anything.',
      },
      {
        title: 'Technical performance and security',
        body: 'Secure, fast templates, clean redirects when a product is retired, and careful handling of logged-in areas so private pages are never indexed, while the public site stays quick and easy to crawl.',
      },
      {
        title: 'Authority and digital PR',
        body: 'Coverage and links from financial media, universities and community organizations, giving the brand recognised third-party endorsement in a category where customers need to believe the institution is stable and legitimate.',
      },
    ],
    steps: [
      {
        title: 'Review the estate',
        body: 'We audit the public site separately from online banking areas, noting indexation, speed, duplicated product copy and the accuracy of every branch listing.',
      },
      {
        title: 'Align with compliance',
        body: 'We agree wording rules, approval routes and disclosures upfront, so optimization never delays or conflicts with the regulatory review your team already runs.',
      },
      {
        title: 'Optimize by segment',
        body: 'Product, branch and guide content is rolled out segment by segment, starting with the offers that matter most commercially to the institution.',
      },
      {
        title: 'Report on applications',
        body: 'Dashboards connect organic visits to started and completed applications, and to branch actions where measurable, rather than stopping at rankings and traffic.',
      },
    ],
    faq: [
      {
        q: 'Why do banks need a different SEO approach?',
        a: 'Banking content is regulated, security-sensitive and spread across many products and locations. Search engines also treat financial information as high-stakes, so accuracy, clear authorship and strong trust signals matter more than they do for most other kinds of website, and all of it has to hold up under scrutiny.',
      },
      {
        q: 'Can SEO work for Islamic banking and microfinance?',
        a: 'Yes. Islamic banking and microfinance customers use different terms and ask different questions, so each product needs its own research and explanatory pages. We write them to match local vocabulary while keeping the structure that search engines can read easily.',
      },
      {
        q: 'How do you keep SEO work compliant?',
        a: 'We do not give financial advice or make promises about rates. Copy goes through your own compliance process, and we build in disclosures, accurate product facts and review dates. Where a regulator sets rules for online promotion, we work to them and ask you to confirm anything unclear.',
      },
      {
        q: 'What should a bank measure from SEO?',
        a: 'Look beyond traffic to account applications, loan enquiries, branch searches and calls from listings. Segmenting by product shows which content brings in useful prospects. We set up tracking so these numbers are visible and consistent each month, and explain any change.',
      },
      {
        q: 'Is SEO better than paid ads for banks?',
        a: 'They do different jobs. Paid ads can promote a campaign immediately, while SEO builds steady visibility for evergreen questions such as how to open an account. Because rankings cannot be guaranteed, many banks use both and review the mix regularly against real applications.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['financial-services-seo', 'fintech-seo', 'enterprise-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'car-dealer-seo',
    path: '/seo-services/car-dealer-seo',
    name: 'Car Dealer SEO',
    title: 'Car Dealer SEO Services | More Showroom Visits',
    description:
      'SEO for car dealerships: indexable inventory pages, model and make keywords, service-department visibility and local search work that fills showrooms.',
    h1: 'Car dealer SEO services',
    intro:
      'Car dealer SEO gets a dealership found by people searching for a specific make, model or used vehicle near them. Because stock changes every day, the work centres on inventory pages that search engines can index and retire cleanly, together with local visibility, model research pages and traffic for the service department.',
    icon: 'storefront',
    category: 'seo',
    hub: 'industry',
    tag: 'Automotive',
    includes: [
      {
        title: 'Inventory page optimization',
        body: 'Every vehicle page gets a unique title, a usable description, photos with alt text and vehicle markup, so individual listings can rank for make, model, trim and location searches instead of only appearing in your on-site search results.',
      },
      {
        title: 'Sold and expired stock handling',
        body: 'Clear rules for what happens when a car sells, whether that is a short sold notice with similar cars or a redirect to the model page, so you avoid soft errors and thousands of dead pages.',
      },
      {
        title: 'Make, model and comparison pages',
        body: 'Pages for new models and popular used segments that cover trims, specifications and alternatives, capturing buyers who are still deciding what to buy long before they choose which dealership to visit.',
      },
      {
        title: 'Dealership local SEO',
        body: 'Google Business Profile, opening hours, photos and reviews for each showroom, plus separate service and parts listings where they exist, so you appear in the map pack when nearby shoppers search for cars.',
      },
      {
        title: 'Service and trade-in content',
        body: 'Pages for servicing, finance, valuation and trade-in requests, which bring repeat customers and private sellers as well as buyers, and are often far less competitive than the broad new-car terms everyone chases.',
      },
      {
        title: 'Feed and technical health',
        body: 'Checks on inventory feeds, page speed on photo-heavy listings, filter combinations and crawl budget, so that a large and constantly changing catalogue is indexed properly without creating duplicate or near-empty pages.',
      },
    ],
    steps: [
      {
        title: 'Inspect the stock site',
        body: 'We crawl your inventory, study how listings are created and removed, and see which vehicle and location searches you currently appear for in your market.',
      },
      {
        title: 'Fix the templates',
        body: 'Changes to the vehicle page template, filters and feed give every listing a better chance at once, without editing cars one at a time.',
      },
      {
        title: 'Add local and model content',
        body: 'We build make and model pages, service pages and profile updates, with fresh content timed to new arrivals and the seasons when your buyers are most active.',
      },
      {
        title: 'Track leads by type',
        body: 'Calls, test-drive bookings and finance enquiries are reported against organic visits, so you can see exactly which pages and searches bring serious buyers in.',
      },
    ],
    faq: [
      {
        q: 'Does SEO help used car dealers more than new car franchises?',
        a: 'Both benefit, in different ways. Used dealers have unique stock, so individual listings can rank for specific models. Franchises compete against manufacturer sites, so local, service and finance pages often matter more. We plan around whichever situation you are in.',
      },
      {
        q: 'How do you handle vehicles that sell quickly?',
        a: 'We agree a rule for sold stock, such as keeping a short-lived page that links to similar cars, or redirecting to the model category. Either approach avoids broken pages and preserves the value of any links that the listing may have earned while it was live.',
      },
      {
        q: 'Should we run Google Ads as well as SEO?',
        a: 'Many dealers do. Ads put current stock or offers in front of buyers quickly, while SEO builds visibility that continues without per-click spend. We can review your search terms together and avoid paying for clicks you are already receiving from organic results.',
      },
      {
        q: 'How do you measure results for a dealership?',
        a: 'We track organic visits to inventory pages, calls, form leads, test-drive requests and direction requests from your profile. Where your CRM allows, we match leads to sales so the report reflects showroom outcomes and not just clicks on a listing.',
      },
      {
        q: 'How long until we see more enquiries?',
        a: 'Template and local fixes can show change within weeks to a few months, depending on competition and the size of your site. Rankings cannot be guaranteed, but we report progress every month so you can see what is working and what is not.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['retail-seo', 'moving-company-seo', 'local-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'plastic-surgery-seo',
    path: '/seo-services/plastic-surgery-seo',
    name: 'Plastic Surgery SEO',
    title: 'Plastic Surgery SEO Services | Patient-Led Growth',
    description:
      'SEO for plastic and cosmetic surgeons: procedure pages, surgeon credentials, consented galleries and compliant content that builds trust with patients.',
    h1: 'Plastic surgery SEO services',
    intro:
      'Plastic surgery SEO helps surgeons and cosmetic clinics appear when people research procedures, compare surgeons and plan consultations. Patients make a considered and costly decision, so the work prioritises procedure education, visible credentials and responsibly presented results over sheer traffic volume, and it respects the medical advertising rules of each market.',
    icon: 'medical_services',
    category: 'seo',
    hub: 'industry',
    tag: 'Cosmetic Surgery',
    includes: [
      {
        title: 'Procedure page strategy',
        body: 'A dedicated page for every procedure, covering who it suits, how it works, recovery, risks and questions to ask at consultation, written in plain language and checked by the surgeon for clinical accuracy before it goes live.',
      },
      {
        title: 'Surgeon credentials and E-E-A-T',
        body: 'Profiles that show training, qualifications, memberships and experience, with named authorship and review dates on clinical content, because health-related searches are judged heavily on who stands behind the information provided.',
      },
      {
        title: 'Before-and-after gallery SEO',
        body: 'Galleries organized by procedure with descriptive text, fast image delivery and clear notes on patient consent, so they help people decide while also adding useful, indexable depth to each procedure page.',
      },
      {
        title: 'Local and map visibility',
        body: 'Profiles, categories and consistent listings for each clinic, along with pages for surrounding cities, so patients who are willing to travel for the right surgeon can find you and plan the journey.',
      },
      {
        title: 'Medical tourism content',
        body: 'Pages for international patients covering video consultation, travel planning, recovery stay and aftercare, available in the languages your patients actually search in, with honest, realistic expectations about follow-up care once they have returned home.',
      },
      {
        title: 'Reviews and reputation',
        body: 'A process for collecting honest patient feedback within platform and medical advertising rules, with careful handling of anything that could reveal private information or imply guaranteed outcomes for a future patient or their family.',
      },
    ],
    steps: [
      {
        title: 'Check the rules',
        body: 'We confirm the advertising and privacy rules for your jurisdiction, and agree which claims, images and testimonials can appear before any copy is written.',
      },
      {
        title: 'Map the patient journey',
        body: 'We chart searches from first curiosity about a procedure through comparison of surgeons to booking, and match each stage to a specific page.',
      },
      {
        title: 'Publish reviewed content',
        body: 'Procedure pages, surgeon profiles and galleries are drafted for your review and published only once you and your clinical team approve them.',
      },
      {
        title: 'Report on consultations',
        body: 'We follow enquiry forms, calls and consultation bookings from organic search, so you can judge the quality of enquiries and not traffic alone.',
      },
    ],
    faq: [
      {
        q: 'How do you make sure content meets medical advertising rules?',
        a: 'We start from the rules that apply where you practise and where you advertise, then write conservatively. Claims about results are avoided, risks are stated and your surgeon approves every page. Where rules are unclear, we ask you to confirm with your regulator.',
      },
      {
        q: 'Can we show before-and-after photos?',
        a: 'Often, but it depends on your regulator, the platform and patient consent. We organize galleries so they are useful and fast, with context about each procedure. Patients should have given informed written consent, and you remain responsible for approving every image shown.',
      },
      {
        q: 'Is SEO or paid advertising better for plastic surgeons?',
        a: 'Each has a role. Paid campaigns are restricted on some platforms for cosmetic procedures, while SEO builds visibility through education and reputation. Because rankings are never guaranteed, we usually suggest treating SEO as a steady investment and reviewing the overall mix often.',
      },
      {
        q: 'Do you handle SEO for specific procedures like rhinoplasty?',
        a: 'Yes. Individual procedures have their own search terms, concerns and comparison questions, so each deserves a detailed page rather than a line on a general services list. We research what patients actually ask and answer those questions honestly, including recovery and risks.',
      },
      {
        q: 'Can SEO attract patients from other countries?',
        a: 'It can help. International patients search differently, often combining a procedure with a destination, and they need practical information about travel and aftercare. We build pages and language versions for those searches, but results depend on competition and the markets you target.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-for-doctors', 'seo-for-dentists', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'photography-seo',
    path: '/seo-services/photography-seo',
    name: 'Photography SEO',
    title: 'Photography SEO Services | Get Booked by Clients',
    description:
      'SEO for photographers: image-heavy portfolios that still rank, wedding and event pages, local visibility and blog content that turns searches into bookings.',
    h1: 'Photography SEO services',
    intro:
      'Photography SEO makes a photographer easy to find for the kind of work they want to do, such as weddings, portraits, events or commercial shoots. The challenge is that portfolios are mostly images with very little text, so the work adds structure, captions and location pages that tell search engines what each gallery shows and where you shoot.',
    icon: 'visibility',
    category: 'seo',
    hub: 'industry',
    tag: 'Photographers',
    includes: [
      {
        title: 'Niche and location pages',
        body: 'Separate pages for wedding, portrait, family, newborn, event or product work, each tied to the places you cover, so a couple in one city and a brand in another each land on a page written for them.',
      },
      {
        title: 'Portfolio gallery optimization',
        body: 'Descriptive file names, alt text, captions and short stories for each gallery, giving search engines real text to read around your images without hiding or cluttering the photographs that actually sell your work.',
      },
      {
        title: 'Image performance',
        body: 'Modern formats, correct sizing and lazy loading so heavy galleries load quickly on phones, because a slow page costs you the visitor before they have had the chance to see a single photograph.',
      },
      {
        title: 'Real-shoot blog content',
        body: 'Posts about real weddings, venues and sessions with the vendors and locations named, which capture searches for specific venues, add local relevance and give you fresh pages without inventing generic advice articles.',
      },
      {
        title: 'Local profile and reviews',
        body: 'A well-completed Google Business Profile with service area, sample photos and client reviews, which helps you appear for "photographer near me" searches and builds confidence quickly with people who have never heard of you.',
      },
      {
        title: 'Collaboration links',
        body: 'Features and links from venues, planners, florists and publications you have worked with. These are relevant, earned and usually easier to secure than generic directory links, and they tell search engines who vouches for you.',
      },
    ],
    steps: [
      {
        title: 'Choose the work to grow',
        body: 'We agree which types of shoot you most want to book, because trying to rank for everything dilutes the portfolio and attracts the wrong enquiries.',
      },
      {
        title: 'Structure the portfolio',
        body: 'Galleries are reorganized into indexable pages with text, captions and internal links, without changing how your photographs look to visitors.',
      },
      {
        title: 'Publish stories and profiles',
        body: 'We add venue and session posts, update your local profile, and then ask the collaborators you have worked with for features that link back.',
      },
      {
        title: 'Track enquiries',
        body: 'Contact form, message and call enquiries are reported by page and source, so you can see which galleries and posts actually bring in bookings.',
      },
    ],
    faq: [
      {
        q: 'Can I rank with a website that is mostly photos?',
        a: 'Yes, but images alone give search engines little to work with. Adding captions, short descriptions, structured galleries and location details provides context. The photographs still lead, with just enough text around them to explain what they show and where they were taken.',
      },
      {
        q: 'Is social media enough to get bookings?',
        a: 'Social platforms are valuable for showing your style, but people searching for a photographer in a particular place often use Google. A well-structured website captures those searches and does not depend on a platform algorithm. The two channels tend to work best together.',
      },
      {
        q: 'How do I handle several specialties?',
        a: 'Give each specialty its own page and keep them clearly linked. A wedding client and a corporate headshot buyer want different proof, so mixing them on one page weakens both. We help you decide which specialties deserve the most attention and which to keep lighter.',
      },
      {
        q: 'How long before SEO brings bookings?',
        a: 'It depends on competition in your area and how well your site is set up. Some improvements show in weeks, but building visibility in busy categories takes longer. We cannot promise outcomes, though we report on enquiries and rankings so progress is easy to follow.',
      },
      {
        q: 'What can I do myself?',
        a: 'Write clear captions, name files sensibly, ask for reviews after each shoot and publish real sessions with venue names. We can set up the structure and a simple routine, and you can maintain it between our regular reviews of how the pages are performing.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['travel-seo', 'architecture-seo', 'local-seo'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'accounting-seo',
    path: '/seo-services/accounting-seo',
    name: 'Accounting SEO',
    title: 'Accounting SEO Services | Win Clients Before Deadlines',
    description:
      'SEO for accountants, tax advisers and audit firms: service and sector pages, deadline-driven content and local search work that brings steady client enquiries.',
    h1: 'Accounting SEO services',
    intro:
      'Accounting SEO helps accountants, bookkeepers, tax advisers and audit firms get found by people who need help with filing, compliance or financial decisions. Demand follows deadlines and tax seasons, so we build service and sector pages that rank all year and time fresh content to the weeks when clients search the most.',
    icon: 'fact_check',
    category: 'seo',
    hub: 'industry',
    tag: 'Accountants',
    includes: [
      {
        title: 'Service-by-service pages',
        body: 'Separate pages for tax returns, bookkeeping, payroll, audit, company formation and advisory, each explaining who the service is for, what you do, what the client needs to provide and how the engagement usually begins.',
      },
      {
        title: 'Sector and client-type pages',
        body: 'Pages for the clients you want most, such as freelancers, start-ups, property owners, online sellers or family businesses, so visitors immediately see that you understand their particular situation and its tax and reporting issues.',
      },
      {
        title: 'Deadline-led content calendar',
        body: 'Guides and reminders planned ahead of filing dates and rule changes, then kept current each cycle. This captures peak-season searches and gives previous visitors a good reason to come back to your site.',
      },
      {
        title: 'Local and remote visibility',
        body: 'Google Business Profile and location pages for clients who prefer to meet in person, plus clear signals about the jurisdictions you can advise on for clients who work with you online from elsewhere.',
      },
      {
        title: 'Credentials and trust signals',
        body: 'Qualifications, professional body memberships and named partners shown on service and team pages, along with honest client reviews, since people choose someone to handle their money and records mainly on trust.',
      },
      {
        title: 'Lead capture and reporting',
        body: 'Simple consultation forms, call tracking and downloadable checklists that turn visitors into enquiries, with monthly reports that tie each lead back to the specific pages and searches that produced it.',
      },
    ],
    steps: [
      {
        title: 'Understand your clients',
        body: 'We review your best clients, the jurisdictions you serve and the services with the best margin, then target the searches that bring similar work.',
      },
      {
        title: 'Rebuild the service pages',
        body: 'Thin or combined service pages are replaced with clear, separate ones that say who you help, what you do and what happens next.',
      },
      {
        title: 'Plan around the tax year',
        body: 'We schedule updates and new guides ahead of busy periods, so the content is already indexed and ranking before demand begins to rise.',
      },
      {
        title: 'Review and adjust',
        body: 'Each quarter we compare enquiries, rankings and seasonal patterns, then adjust the plan and priorities for the next filing cycle.',
      },
    ],
    faq: [
      {
        q: 'Why does accounting SEO feel seasonal?',
        a: 'Searches rise around filing deadlines, year-end and rule changes, then dip. Pages need to be live and indexed beforehand, so we plan content ahead of each peak and keep it updated, rather than writing it when the rush is already well under way.',
      },
      {
        q: 'Should we target local clients or the whole country?',
        a: 'It depends on how you work. Firms that meet clients in person benefit from local search, while firms offering remote bookkeeping or specialist tax advice can target wider terms. Many do both, using different pages for each purpose and audience.',
      },
      {
        q: 'Can you guarantee first-page rankings?',
        a: 'No agency honestly can. Rankings depend on competition, the state of your site and search engine changes. What we can do is improve your pages, build credible authority and give you regular reports, so you can judge progress by the enquiries you receive.',
      },
      {
        q: 'How often should accounting content be updated?',
        a: 'Tax and compliance guidance changes, so pages should be reviewed at least once a year and whenever the rules change. We add review dates so readers and search engines can see the information is current, and we flag outdated pages for rewriting.',
      },
      {
        q: 'Do tax, audit and bookkeeping firms need different SEO?',
        a: 'Yes. Tax clients often search around deadlines and specific problems, audit clients are usually companies comparing firms, and bookkeeping clients want an ongoing relationship. We choose keywords, proof points and calls to action to suit each audience, and keep the three service lines clearly linked.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['financial-services-seo', 'seo-for-lawyers', 'local-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'architecture-seo',
    path: '/seo-services/architecture-seo',
    name: 'Architecture SEO',
    title: 'Architecture SEO Services | Win Design Commissions',
    description:
      'SEO for architecture firms: project case-study pages, building-type keywords, local search and press links that bring in qualified design commissions.',
    h1: 'Architecture SEO services',
    intro:
      'Architecture SEO helps design practices get discovered by clients planning a home, a commercial building or a renovation. Most firms win work through reputation, so the goal is to turn finished projects into searchable case studies, and to appear when someone is first looking for an architect for a particular building type or place.',
    icon: 'apartment',
    category: 'seo',
    hub: 'industry',
    tag: 'Architects',
    includes: [
      {
        title: 'Project case-study pages',
        body: 'Each completed project gets its own page with brief, location, challenges, materials and outcome, alongside strong photography, so your portfolio becomes a set of pages that can both rank in search and persuade a prospective client.',
      },
      {
        title: 'Building-type and service pages',
        body: 'Pages for residential, hospitality, healthcare, interiors, masterplanning or heritage work, written around the questions each type of client asks before they decide to hire an architect and what they should prepare first.',
      },
      {
        title: 'Local and regional presence',
        body: 'Profile, location pages and listings that show where you practise and which authorities and planning contexts you know, helping clients who want an architect close to their site or familiar with local approval processes.',
      },
      {
        title: 'Process and planning content',
        body: 'Plain guides on design stages, planning approval, budgets and timelines, which help owners new to building understand the journey and show how you work before they have even picked up the phone to contact you.',
      },
      {
        title: 'Technical image handling',
        body: 'Fast-loading galleries, sensible image sizes, alt text and structured data, so a beautiful portfolio does not hold back page speed or leave your best images invisible to search engines and image results.',
      },
      {
        title: 'Press and award links',
        body: 'Outreach to design publications, local media, contractors and suppliers who feature your projects, along with proper links from award and registry listings you already hold, which add credibility with both clients and search engines.',
      },
    ],
    steps: [
      {
        title: 'Audit the portfolio',
        body: 'We look at which projects have their own pages, how they are described, and where your site shows less depth than comparable practices.',
      },
      {
        title: 'Choose the commissions to target',
        body: 'Together we select the building types and places where you want more work, and set priorities for pages and outreach accordingly.',
      },
      {
        title: 'Write and structure',
        body: 'Case studies, service pages and guides are drafted with your team, then published with images prepared for speed and for search visibility.',
      },
      {
        title: 'Follow the enquiries',
        body: 'We track which pages lead to briefs and calls, and adjust the plan as the mix of commissions you want shifts over time.',
      },
    ],
    faq: [
      {
        q: 'Will SEO bring me more architecture projects?',
        a: 'It can bring more enquiries from people who are searching for an architect, but it cannot promise commissions. Strong case studies, clear services and local visibility make you easier to find and easier to trust, which improves your chances at the shortlist stage.',
      },
      {
        q: 'What is the difference between local and broader architectural SEO?',
        a: 'Local SEO targets clients near you, who often start with "architect in" searches. Broader SEO targets project types and expertise, such as hospitals or heritage restoration, where clients may look beyond their own city. A practice can pursue both with separate pages.',
      },
      {
        q: 'Do I need to publish every project?',
        a: 'No. Choose the projects that represent the work you want more of and give those proper pages. A smaller number of well-written case studies usually does more than a long gallery with minimal text, and it also respects client confidentiality where that applies.',
      },
      {
        q: 'Can I handle architecture SEO myself?',
        a: 'Some of it, yes. Writing good project descriptions and keeping your profile updated are things you can do. Technical checks, strategy and outreach take specialist time, so many practices handle the content themselves and use us for planning and the harder parts.',
      },
      {
        q: 'How long does it take to see results?',
        a: 'Client decisions are slow, and so is SEO, so expect months rather than weeks for steady change. We cannot guarantee positions, but you will see monthly updates on rankings, visits and enquiries that show whether the work is moving in the right direction.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['contractor-seo', 'photography-seo', 'real-estate-seo'],
    guides: [SEO_GUIDES, SPEED_TOOL],
  },
  {
    slug: 'pest-control-seo',
    path: '/seo-services/pest-control-seo',
    name: 'Pest Control SEO',
    title: 'Pest Control SEO Services | More Calls and Bookings',
    description:
      'SEO for pest control companies: pest-specific service pages, urgent local searches, seasonal content and map visibility that bring in call-outs and contracts.',
    h1: 'Pest control SEO services',
    intro:
      'Pest control SEO puts your company in front of people who have found termites, bed bugs, rodents or cockroaches and want help quickly. Many searches are urgent and local, so the work combines pest-specific service pages, map visibility and seasonal content, along with safety information that reassures households and businesses.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Pest Control',
    includes: [
      {
        title: 'Pest-by-pest service pages',
        body: 'Individual pages for termites, bed bugs, ants, rodents, cockroaches and fumigation, each describing the signs to look for, the treatment method, what the customer must prepare beforehand and what happens after the visit.',
      },
      {
        title: 'Urgent and local search',
        body: 'Prominent phone numbers, click-to-call buttons and area pages built for mobile, so that a person dealing with an active infestation can reach you within seconds of finding your listing or website.',
      },
      {
        title: 'Map pack and profile work',
        body: 'Categories, service areas, photos, posts and a steady flow of reviews on your Google profile, which often decides who gets the call when someone searches for pest control near them.',
      },
      {
        title: 'Seasonal content planning',
        body: 'Guides timed to monsoon, summer or winter pest peaks, plus pre-purchase termite inspection and rental-property topics, so that pages are already indexed and ranking before seasonal demand begins to climb.',
      },
      {
        title: 'Safety and trust information',
        body: 'Clear notes on the products used, safety for pets and children, licences held and re-entry times, which answer the objections that most often stop a worried homeowner from picking up the phone and booking.',
      },
      {
        title: 'Commercial contract pages',
        body: 'Separate pages for restaurants, warehouses, offices and property managers that need recurring treatment, covering inspection records, compliance requirements and service schedules, aimed at buyers who sign longer agreements than homeowners.',
      },
    ],
    steps: [
      {
        title: 'Map services and areas',
        body: 'We list the pests you treat and the areas you reach, then compare them with what customers search for and what competitors cover.',
      },
      {
        title: 'Build the core pages',
        body: 'Service and area pages go live first, complete with call buttons and safety information, followed by improvements to your local profile.',
      },
      {
        title: 'Prepare for the season',
        body: 'We publish and refresh seasonal guides ahead of known peaks, and set up a review request routine to run after each completed job.',
      },
      {
        title: 'Count calls and jobs',
        body: 'Call tracking and form data show which pages, pests and areas generate booked work, so effort keeps moving toward where the jobs are.',
      },
    ],
    faq: [
      {
        q: 'How is pest control SEO different from general SEO?',
        a: 'Searches are urgent, local and driven by a specific pest, so each treatment needs its own page and a quick way to call. Seasonality also matters, because demand changes with the weather. General SEO plans rarely account for either of these.',
      },
      {
        q: 'Can a small local firm compete with national brands?',
        a: 'Often it can, because searchers want someone nearby who can attend soon. A strong local profile, good reviews and area pages help a small team appear alongside larger names. We cannot guarantee positions, but a local focus gives you a fair chance.',
      },
      {
        q: 'Should I have a page for each pest?',
        a: 'Generally yes, for the pests that bring you the most work. A termite customer and a bed bug customer have different worries, treatments and urgency. Separate pages let you answer them properly and appear for the specific searches each one makes.',
      },
      {
        q: 'How long does it take to see calls increase?',
        a: 'Profile and call-button fixes can help within weeks, while new pages build over a few months. Timing varies with competition and the season. We report calls and booked jobs every month, so you can judge for yourself whether the work is paying off.',
      },
      {
        q: 'Can I do pest control SEO myself?',
        a: 'You can handle reviews, photos and basic updates yourself. Planning pages around pests and areas, technical fixes and call tracking benefit from experience. Many owners do the routine tasks while we look after strategy, page building and measurement of the results.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['home-services-seo', 'plumber-seo', 'cleaning-company-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'plumber-seo',
    path: '/seo-services/plumber-seo',
    name: 'Plumber SEO',
    title: 'Plumber SEO Services | Win Emergency Plumbing Calls',
    description:
      'SEO for plumbers: 24-hour emergency visibility, service-area pages, call tracking and review building that put your number in front of urgent searchers.',
    h1: 'Plumber SEO services',
    intro:
      'Plumber SEO gets a plumbing business to the top of the results when a pipe bursts or a water heater fails, and also when a homeowner plans a bathroom job. The emphasis is on speed to contact: map listings, mobile pages with tap-to-call and clear emergency availability, backed by service pages for the jobs you want.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Plumbers',
    includes: [
      {
        title: 'Emergency visibility',
        body: 'Pages and profile details that make 24-hour or same-day availability obvious, with the phone number high on the page, so a stressed searcher with water on the floor can call without having to read or scroll.',
      },
      {
        title: 'Service pages by job',
        body: 'Pages for leak repair, blocked drains, water heaters, bathroom fitting, pipe replacement and commercial maintenance, each describing the problem, your approach and what the customer can expect on the day.',
      },
      {
        title: 'Service-area coverage',
        body: 'Genuine pages for the neighbourhoods and towns you serve, with local details such as common housing types and typical issues, instead of repeated pages where only the place name has been changed.',
      },
      {
        title: 'Call tracking and conversion',
        body: 'Tracked numbers, click-to-call buttons and simple forms, so you can see which searches create phone calls, how many of those calls are answered, and which pages deserve more attention and investment next month.',
      },
      {
        title: 'Reviews and reputation',
        body: 'A repeatable way to ask for reviews straight after a finished job, and polite replies to all feedback, since plumbers are so often chosen from the map pack according to their rating and recent comments.',
      },
      {
        title: 'Citations and local links',
        body: 'Accurate business listings, supplier and trade association links, and community sponsorships, which strengthen local authority and help your business details agree everywhere online, without bulk submissions to low-quality directories that do nothing for your reputation.',
      },
    ],
    steps: [
      {
        title: 'Check calls and maps',
        body: 'We review how you appear for emergency and routine searches in your area, and how many calls the current site actually produces each month.',
      },
      {
        title: 'Fix the quick wins',
        body: 'Profile details, click-to-call, mobile page speed and the main service pages are corrected first, since they affect call volume soonest.',
      },
      {
        title: 'Add areas and content',
        body: 'We add area and job pages month by month, and begin the review routine and the local link building alongside them.',
      },
      {
        title: 'Report on booked jobs',
        body: 'Monthly reports show tracked calls, form leads and map actions, with clear notes on what changed and what we plan to do next.',
      },
    ],
    faq: [
      {
        q: 'Will SEO help me get emergency calls at night?',
        a: 'It can, if your pages and profile make your availability clear and your phone is answered. People searching at night want a quick answer, so we put hours, coverage and a call button in plain sight. Your response then decides whether the call becomes a job.',
      },
      {
        q: 'Can I compete with larger plumbing companies?',
        a: 'Yes, in many areas. Searchers pick from nearby options, so strong reviews, accurate listings and well-built local pages can put a small business beside bigger ones. We cannot promise positions, but local relevance often matters more than company size, especially for urgent jobs.',
      },
      {
        q: 'What is the difference between SEO and paid ads for plumbers?',
        a: 'Ads appear while you pay per click and are useful for filling gaps quickly. SEO builds visibility that stays without ongoing click costs, but takes longer to establish. Many plumbers use both, and we can show you which one is working harder for you, using your own call data as the evidence.',
      },
      {
        q: 'How do you measure plumbing SEO?',
        a: 'We track phone calls, form submissions, direction requests and booked jobs, not just rankings. Call tracking links searches to actual customers, and we report which services and areas produce them so that you can decide where to focus your effort.',
      },
      {
        q: 'How long until I see more calls?',
        a: 'Fixes to your profile and mobile pages can help within weeks. New area and service pages take a few months to settle, and competitive towns take longer still. Results are never guaranteed, but you will see call data every month so progress is visible.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['electrician-seo', 'hvac-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'electrician-seo',
    path: '/seo-services/electrician-seo',
    name: 'Electrician SEO',
    title: 'Electrician SEO Services | Licensed Trade Visibility',
    description:
      'SEO for electricians and contractors: safety-led trust pages, rewiring, EV charger and solar services, and local search work that brings in larger jobs.',
    h1: 'Electrician SEO services',
    intro:
      'Electrician SEO helps electrical contractors get found for both urgent faults and planned projects such as rewiring, panel upgrades, EV chargers and solar installs. Because electrical work involves safety and regulation, buyers look for proof of licensing and experience, so trust content carries as much weight as keywords do for this trade.',
    icon: 'call',
    category: 'seo',
    hub: 'industry',
    tag: 'Electricians',
    includes: [
      {
        title: 'Licence and safety signals',
        body: 'Prominent licence details, insurance, accreditation and the safety standards you work to, shown on service pages and in your profile, because customers will not let just anyone near the wiring in their home or premises.',
      },
      {
        title: 'Project-based service pages',
        body: 'Pages for rewiring, consumer unit or panel upgrades, lighting, EV charger installation, solar connection and inspection reports, which attract planned, higher-value jobs and explain the process, preparation and likely disruption involved.',
      },
      {
        title: 'Residential and commercial split',
        body: 'Separate paths for homeowners and for businesses or landlords, covering maintenance contracts, compliance certificates and periodic testing, since the two audiences ask for different things and judge a contractor differently.',
      },
      {
        title: 'Local profile and area pages',
        body: 'Categories, service areas, photos and area pages that let nearby customers see you are close and available, including for emergency call-outs, and that keep your details consistent wherever they appear online.',
      },
      {
        title: 'Explainer content',
        body: 'Guides on warning signs, why circuit breakers trip, when to rewire and what an inspection involves, written clearly so homeowners understand the job and its urgency before they decide to call a professional.',
      },
      {
        title: 'Reviews and job photos',
        body: 'A steady review routine and photos of completed work with location context, which show real and recent jobs instead of stock images, and give future customers evidence of tidy, careful workmanship.',
      },
    ],
    steps: [
      {
        title: 'Choose the jobs to grow',
        body: 'We separate emergency work from planned projects, and decide which of them your business wants to win more of this year.',
      },
      {
        title: 'Build trust pages',
        body: 'Licences, accreditations and safety information are added to the site and profile first, before we start on any of the wider content work.',
      },
      {
        title: 'Publish service and area content',
        body: 'Project pages and local pages are written with your input, using real jobs, the standards you follow and questions from your customers.',
      },
      {
        title: 'Monitor and refine',
        body: 'We track calls, quote requests and map activity, then tune pages and priorities based on which jobs are actually being booked.',
      },
    ],
    faq: [
      {
        q: 'How is electrician SEO different from plumber SEO?',
        a: 'Both rely on local search, but electrical customers lean harder on licensing and safety, and many jobs are planned projects such as EV chargers or rewiring. Pages therefore need credentials and detailed project information alongside emergency availability, not just a phone number.',
      },
      {
        q: 'Will SEO work if I also install solar panels?',
        a: 'Yes. Solar and EV charging are researched differently from repairs, with longer comparison and more questions about incentives and equipment. We give each its own pages and keep them clearly linked to your main electrical services, so visitors can move between them easily.',
      },
      {
        q: 'Can SEO help in a small town?',
        a: 'Often it helps more there, because fewer firms compete and local pages can stand out. We focus on your town and nearby areas, and make sure your profile and listings match, so people searching close by find the right details and a way to reach you.',
      },
      {
        q: 'What is the difference between SEO and Google Ads for electricians?',
        a: 'Ads give immediate visibility while you pay for clicks, which suits busy periods or new services. SEO takes longer but keeps working without click costs. We can help you decide which kinds of job to promote through each route, and revisit it as results come in.',
      },
      {
        q: 'How do you handle reviews?',
        a: 'We set up a simple request after each completed job and help you reply politely to every review. We do not buy or fabricate reviews, which breaks platform rules and can get a profile suspended. Genuine feedback from real customers is what helps over time.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['plumber-seo', 'contractor-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'non-profit-seo',
    path: '/seo-services/non-profit-seo',
    name: 'Non-Profit SEO',
    title: 'Non-Profit SEO Services | Reach Donors and Volunteers',
    description:
      'SEO for charities, NGOs and foundations: cause pages, donation journeys, volunteer content and trust signals that help supporters find and back your work.',
    h1: 'Non-profit SEO services',
    intro:
      'Non-profit SEO helps charities, NGOs and foundations be found by the people they serve and the people who support them: donors, volunteers, partners and beneficiaries. Each group searches differently, so the work shapes the site around those journeys and shows the transparency and impact evidence that make people willing to give.',
    icon: 'handshake',
    category: 'seo',
    hub: 'industry',
    tag: 'Non-Profits',
    includes: [
      {
        title: 'Audience-based keyword research',
        body: 'We separate searches made by donors, volunteers, beneficiaries, corporate partners and journalists, and match each to a page, so that supporters and people seeking help are never sent to the same message or form.',
      },
      {
        title: 'Cause and programme pages',
        body: 'Detailed pages for each programme explaining the problem, what you do, where you work and how people can help, instead of one general about page that tries to cover every project you run.',
      },
      {
        title: 'Donation page optimization',
        body: 'Fast, mobile-friendly giving pages with clear options, reassurance about how funds are used and a short path to completion, since a large share of supporters arrive on a phone and abandon slow or confusing forms.',
      },
      {
        title: 'Impact stories and reports',
        body: 'Stories, annual reports and financial summaries published as indexable pages alongside your registration details, which are exactly the kind of evidence a cautious donor looks for before deciding to give to an unfamiliar cause.',
      },
      {
        title: 'Campaign and event pages',
        body: 'Evergreen pages for recurring appeals, awareness days and fundraising events that are updated each year, so their authority keeps building instead of resetting every time a new campaign page is created.',
      },
      {
        title: 'Partner and media links',
        body: 'Outreach to universities, local press, corporate partners and sector networks who already follow your work, to earn links that reflect your standing in the community and give new audiences a reason to trust you.',
      },
    ],
    steps: [
      {
        title: 'Understand supporters',
        body: 'We review your goals, audiences and current traffic to see who finds you, who does not, and where visitors drop out of the journey.',
      },
      {
        title: 'Restructure around journeys',
        body: 'Programme, giving, volunteer and help-seeking pages are reorganized so that each audience reaches the right content within a few clicks.',
      },
      {
        title: 'Create and improve',
        body: 'We write or refine the key pages and stories, and set up transparent reporting content that supports people who are considering a gift.',
      },
      {
        title: 'Report in your terms',
        body: 'Reports follow donations, sign-ups and enquiries as well as visits, in a format that is easy to share with your trustees or board.',
      },
    ],
    faq: [
      {
        q: 'How is non-profit SEO different from commercial SEO?',
        a: 'You are not selling a product, you are asking for trust, time or donations. That means transparency, impact evidence and a clear explanation of what happens to a gift matter heavily. You also serve several audiences at once, each with its own searches and needs.',
      },
      {
        q: 'Can we do SEO with a small website?',
        a: 'Yes. A small site with clear programme pages and a good giving page can perform well for a specific cause or region. We start with the pages that matter most to supporters and add more as your team has the capacity to maintain them.',
      },
      {
        q: 'What is the difference between SEO and paid ads for non-profits?',
        a: 'Paid ads can promote an urgent campaign, and some platforms offer discounted programmes to registered charities that you would need to apply for. SEO builds lasting visibility for ongoing questions. Many organizations combine the two and review results by season.',
      },
      {
        q: 'What should we prioritise first?',
        a: 'Usually the donation page, the main programme pages and a clear statement of who you are, where you work and how you are governed. These affect trust the most. Once they are solid, stories, guides and outreach can build on that base without wasted effort.',
      },
      {
        q: 'Do you guarantee more donations?',
        a: 'No. Giving depends on your cause, timing and many factors we do not control. SEO can make you easier to find and the giving journey smoother, and we report on visits, sign-ups and gifts so you can see what the work contributes to your results.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['education-seo', 'funeral-home-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'retail-seo',
    path: '/seo-services/retail-seo',
    name: 'Retail SEO',
    title: 'Retail SEO Services | Drive Foot Traffic and Sales',
    description:
      'SEO for retail businesses with physical stores: store-page visibility, local product availability, seasonal campaigns and listings that bring shoppers in.',
    h1: 'Retail SEO services',
    intro:
      'Retail SEO helps shops and store chains attract customers who search for a product and want to buy it nearby. It links your physical locations, stock and seasonal offers to what people type into search, so the benefit shows up in footfall and click-and-collect orders as well as in online sales.',
    icon: 'storefront',
    category: 'seo',
    hub: 'industry',
    tag: 'Retail',
    includes: [
      {
        title: 'Store location pages',
        body: 'A unique page for each shop with address, opening hours, parking, departments, local offers and photos, so every location can rank for its own area instead of relying on a single generic contact page for the whole chain.',
      },
      {
        title: 'Google profile management',
        body: 'Accurate hours including holidays, categories, attributes, product highlights and posts for each store, because most nearby shopping searches begin in the map results and shoppers rely on those details when deciding where to go.',
      },
      {
        title: 'Local product availability',
        body: 'Free product listings and, where available, local inventory feeds that show shoppers what is in stock close to them, bridging the gap between your online catalogue and what is actually on the shelves today.',
      },
      {
        title: 'Category and brand pages',
        body: 'Well-written category and brand pages that rank for broad shopping searches, with buying advice that helps people choose between options before they visit, and internal links that move them toward products you stock.',
      },
      {
        title: 'Seasonal and event planning',
        body: 'A calendar of sale periods, holidays and local events, with pages built early and reused year after year, so that authority carries over between campaigns instead of starting from nothing every season.',
      },
      {
        title: 'Reviews and local links',
        body: 'Review requests that fit the in-store experience, plus links from local press, community groups and the suppliers whose products you stock, which together support your standing in the area you serve.',
      },
    ],
    steps: [
      {
        title: 'Audit stores and catalogue',
        body: 'We compare each store’s listing, page and ranking with your product and category visibility to find the gaps between online and offline.',
      },
      {
        title: 'Standardise locations',
        body: 'Store details, pages and profiles are made consistent and complete, so customers and search engines see the same accurate information everywhere.',
      },
      {
        title: 'Build product and seasonal content',
        body: 'Category pages, buying guides and campaign pages are launched ahead of busy periods and then refreshed once the rush has passed.',
      },
      {
        title: 'Connect to footfall',
        body: 'We report direction requests, calls, click-and-collect orders and online sales, so organic performance can be linked to what happens in your stores.',
      },
    ],
    faq: [
      {
        q: 'How does retail SEO differ from ecommerce SEO?',
        a: 'Retail SEO adds the physical dimension: store pages, map listings, local stock and opening hours. Ecommerce SEO centres on product and category pages for delivery. If you sell both ways, the two should be planned together rather than run as separate projects.',
      },
      {
        q: 'Can SEO really increase foot traffic?',
        a: 'It can help more nearby people find your store and see its details. Direction requests, calls and visits from your profile are good indicators. We cannot guarantee a specific rise in footfall, but we can track the signals that point toward it.',
      },
      {
        q: 'How do we compete against large online marketplaces?',
        a: 'Compete where they cannot: local availability, same-day pickup, advice from staff and specialist ranges. Pages and profiles that highlight these advantages attract shoppers who want to see or collect items nearby, rather than wait for a delivery to arrive days later.',
      },
      {
        q: 'Do we need separate SEO for online and offline sales?',
        a: 'You need one joined-up plan with different tactics. Store pages and listings serve local shoppers, while category and product pages serve people searching more widely. Sharing data and content between them avoids duplicated work and mixed messages to customers, and keeps stock information consistent across every channel.',
      },
      {
        q: 'How long before we see results?',
        a: 'Profile and location fixes can improve visibility fairly soon, while category and content work takes longer. Seasonal timing matters too, so we start well before your busy periods. We never guarantee rankings, but we will report progress every month so you can see what has changed and what is still pending.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'jeweler-seo', 'fashion-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'jeweler-seo',
    path: '/seo-services/jeweler-seo',
    name: 'Jeweler SEO',
    title: 'Jeweler SEO Services | Reach Bridal and Gift Buyers',
    description:
      'SEO for jewelers: bridal, gold and diamond category pages, buying guides, trust and certification content, and local visibility for showrooms and online stores.',
    h1: 'Jeweler SEO services',
    intro:
      'Jeweler SEO helps jewelry stores and designers reach people shopping for engagement rings, wedding sets, gold pieces and gifts. These are high-value, emotional purchases made after long research, so the work builds detailed category pages, buying guides and proof of authenticity that reassure buyers before they visit or place an order.',
    icon: 'sell',
    category: 'seo',
    hub: 'industry',
    tag: 'Jewelry',
    includes: [
      {
        title: 'Collection and category pages',
        body: 'Pages for bridal, gold, diamond, gemstone, men’s and gifting collections, with helpful introductions and crawlable filters, so they rank for broad searches as well as for specific styles, metals and stone shapes.',
      },
      {
        title: 'Product detail optimization',
        body: 'Descriptions covering metal, purity, stone details, dimensions and care, plus quality photography and product markup, so that each piece answers the practical questions a serious buyer asks before spending a significant amount.',
      },
      {
        title: 'Buying guides',
        body: 'Guides on choosing a ring, understanding purity and certificates, sizing and caring for pieces, which attract early research traffic, demonstrate real expertise and give hesitant buyers a reason to trust your advice over a marketplace.',
      },
      {
        title: 'Trust and authenticity content',
        body: 'Pages on hallmarking, certification, returns, valuation and repair policies, because buyers spend heavily only when they believe the piece is genuine and that you will stand behind it after the sale.',
      },
      {
        title: 'Showroom local SEO',
        body: 'Profiles, location pages and listings for each store, highlighting appointments, custom design consultations and after-sale services, to capture "jeweler near me" and bridal shopping searches from people who want to see pieces in person.',
      },
      {
        title: 'Seasonal and occasion planning',
        body: 'Content timed to wedding seasons, festivals, anniversaries and gifting dates, built early and updated yearly, so each selling period begins with pages that already have authority instead of starting again from scratch.',
      },
    ],
    steps: [
      {
        title: 'Review range and demand',
        body: 'We look at your collections, margins and best sellers, then compare them with what buyers search for and what rivals rank for.',
      },
      {
        title: 'Strengthen the core pages',
        body: 'Category, product and trust pages are improved first because they influence both rankings and the confidence of a hesitant buyer.',
      },
      {
        title: 'Add guides and local presence',
        body: 'Buying guides, showroom pages and profile updates follow, planned around your wedding season and festival calendar so timing works for you.',
      },
      {
        title: 'Measure sales and visits',
        body: 'We report organic orders, appointment bookings, calls and direction requests, so results reflect real interest in your pieces and not just visits.',
      },
    ],
    faq: [
      {
        q: 'How long does jewelry SEO take to show results?',
        a: 'Fixing product and category pages can show change within a few months, while competitive terms such as engagement rings take longer. Seasonal peaks also matter. We cannot promise timings, but we start early and report progress every month so you can follow it.',
      },
      {
        q: 'Can SEO work alongside paid ads?',
        a: 'Yes. Paid shopping ads can feature specific pieces quickly, while SEO builds organic visibility and trust content that supports buyers considering a large purchase. We can compare keywords across both, so you are not paying for clicks you would earn anyway.',
      },
      {
        q: 'How do you handle several lines like gold, bridal and diamonds?',
        a: 'Each line gets its own category structure, language and buying guide, because the shopper, budget and occasion differ. We link the lines sensibly so visitors can move between them without the site feeling like one undifferentiated catalogue of everything you sell.',
      },
      {
        q: 'Can I appear in local results without a showroom?',
        a: 'Local map results generally need a physical location that customers can visit. Online-only jewelers can still rank in standard results and shopping listings, and can offer appointments by video. We would focus your plan on those channels instead of the map.',
      },
      {
        q: 'Can SEO attract customers from other countries?',
        a: 'It can, if you ship or serve internationally and have pages in the right language and currency. Overseas buyers, such as families planning a wedding from abroad, search differently. We set up the structure and then monitor which markets actually respond.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['retail-seo', 'fashion-seo', 'ecommerce-seo'],
    guides: [SEO_GUIDES, SCHEMA_TOOL],
  },
  {
    slug: 'moving-company-seo',
    path: '/seo-services/moving-company-seo',
    name: 'Moving Company SEO',
    title: 'Moving Company SEO Services | Win More Quote Requests',
    description:
      'SEO for removals and moving companies: route and area pages, quote-form optimization, trust content and local search work that fills your calendar.',
    h1: 'Moving company SEO services',
    intro:
      'Moving company SEO helps removals firms appear when people are planning a house, office or long-distance move and asking for quotes. Because customers compare several companies and worry about damage and hidden charges, the work pairs route and area pages with a short quote path and visible proof of reliability.',
    icon: 'near_me',
    category: 'seo',
    hub: 'industry',
    tag: 'Movers',
    includes: [
      {
        title: 'Local and long-distance pages',
        body: 'Pages for house, flat, office and storage moves, as well as the city-to-city routes you genuinely serve, each with realistic detail on how the move is planned, priced in principle and carried out on the day.',
      },
      {
        title: 'Quote form optimization',
        body: 'A short, mobile-friendly request form that asks only what you need to prepare an estimate, with tracking in place, so more visitors finish it and you can see exactly where the others give up.',
      },
      {
        title: 'Trust and reliability signals',
        body: 'Insurance cover, licences, packing methods, staff vetting and a clear claims process, shown on key pages, since fear of damage, delays and scams drives much of the hesitation customers feel before booking.',
      },
      {
        title: 'Google profile and reviews',
        body: 'A complete profile, service areas and photos, plus a routine to request reviews after delivery, which help you appear for "movers near me" and reassure undecided customers who are comparing several companies.',
      },
      {
        title: 'Planning checklists and guides',
        body: 'Moving checklists, packing advice and guides on how estimates work, which attract people early in the process and show that you are straightforward about what affects the final cost of a move.',
      },
      {
        title: 'Peak-season preparation',
        body: 'Pages and profile updates prepared before summer, month-end and school-year moves, when demand is highest and customers book earliest, so you are already visible when those searches begin and not scrambling to catch up.',
      },
    ],
    steps: [
      {
        title: 'Review routes and services',
        body: 'We look at the moves you want most, the areas you cover and how your site and listings currently perform for each of them.',
      },
      {
        title: 'Simplify the quote path',
        body: 'Forms, phone numbers and call buttons are improved so that a visitor can request a quote in well under a minute.',
      },
      {
        title: 'Publish area and route pages',
        body: 'Genuine pages for your key areas and routes go live, along with trust content and guides that answer the most common worries.',
      },
      {
        title: 'Track leads to bookings',
        body: 'We report quote requests and calls by page and area, and where you can share booking data, we link them to the jobs you won.',
      },
    ],
    faq: [
      {
        q: 'How is local SEO different from general SEO for movers?',
        a: 'Most customers choose from nearby companies shown in the map results, so profile quality, reviews and area pages matter more than broad content. Long-distance work needs route pages too. We build both, so you appear for local moves and for longer ones.',
      },
      {
        q: 'What if our website exists but brings no customers?',
        a: 'That usually points to unclear service pages, slow mobile pages or a weak quote path rather than a missing site. We audit these first, fix the most important problems and then build on what you already have instead of starting over from scratch.',
      },
      {
        q: 'How do you measure success for a moving company?',
        a: 'We follow quote requests, calls, form completions and, where possible, booked moves, all linked to the pages and search terms that produced them. Rankings are included, but enquiries and jobs are the figures that matter most to your business, so they lead every monthly report we send.',
      },
      {
        q: 'Do you work with all types of moving companies?',
        a: 'Yes, from local residential movers to commercial, international and specialist firms such as piano or storage providers. Each type has different searches and concerns, so we plan keywords, pages and trust content around the work you want more of, and we say so if a service is a poor fit for search.',
      },
      {
        q: 'How long until the phone rings more?',
        a: 'Quote form and profile improvements can help within weeks. New area and route pages need a few months to become established, and busy markets take longer. We cannot guarantee a timeline, but you will see monthly lead data that shows what is happening.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['logistics-seo', 'home-services-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'logistics-seo',
    path: '/seo-services/logistics-seo',
    name: 'Logistics SEO',
    title: 'Logistics SEO Services | Reach Shippers and Buyers',
    description:
      'SEO for freight, 3PL and logistics providers: service, lane and industry pages for B2B buyers with long decisions, plus content that supports quote requests.',
    h1: 'Logistics SEO services',
    intro:
      'Logistics SEO helps freight forwarders, carriers, warehousing firms and third-party logistics providers reach the shippers and procurement teams who choose them. These buyers research for weeks and involve several people, so the work focuses on service, lane and industry pages, and on content that answers their technical and commercial questions.',
    icon: 'public',
    category: 'seo',
    hub: 'industry',
    tag: 'Logistics',
    includes: [
      {
        title: 'Service and mode pages',
        body: 'Separate pages for air, sea, road and rail freight, customs brokerage, warehousing, last-mile and cold chain, each explaining capabilities, coverage and how a shipment is handled from pickup through to final delivery.',
      },
      {
        title: 'Lane and corridor pages',
        body: 'Pages for the trade lanes and regions you actually run, covering transit considerations, documentation and typical cargo, to meet searches from buyers who are planning a specific route and want to see that you operate it.',
      },
      {
        title: 'Industry vertical pages',
        body: 'Content for sectors such as retail, pharmaceuticals, automotive, food and ecommerce fulfilment, showing that you understand their handling, compliance and timing requirements and have the right equipment and processes in place.',
      },
      {
        title: 'Buyer education content',
        body: 'Guides on Incoterms, freight documents, the factors behind a quote, tracking and customs clearance, which attract research-stage traffic and demonstrate the operational knowledge that procurement teams look for in a partner.',
      },
      {
        title: 'Quote and tracking journeys',
        body: 'A clear quote request, a findable tracking page and gated resources that capture details without driving away procurement teams who simply want specifics, so serious enquiries reach your sales team with the right information.',
      },
      {
        title: 'B2B authority and directories',
        body: 'Listings in freight networks and trade bodies, partnerships with carriers and ports, and industry press, which provide credible links in a sector that relies heavily on references, memberships and recommendations.',
      },
    ],
    steps: [
      {
        title: 'Map the buying group',
        body: 'We identify who searches before a contract is signed, such as logistics managers and procurement teams, and what each of them needs to see.',
      },
      {
        title: 'Structure services and lanes',
        body: 'The site is organized around modes, lanes and industries, so that a specific need leads straight to a specific and detailed page.',
      },
      {
        title: 'Create expert content',
        body: 'Guides, comparisons and sector pages are written with your operations team’s input and published on a steady schedule that you can sustain.',
      },
      {
        title: 'Report on pipeline',
        body: 'We connect organic visits to quote requests and qualified leads, using your CRM data where possible, rather than reporting traffic alone.',
      },
    ],
    faq: [
      {
        q: 'Who is logistics SEO for?',
        a: 'It suits freight forwarders, carriers, warehouse operators, 3PLs, courier networks and customs brokers. Each has different buyers and search terms, so the plan depends on whether you serve small shippers, large enterprises or other logistics companies, and on the modes and regions you cover.',
      },
      {
        q: 'Why do long B2B sales cycles matter for SEO?',
        a: 'Buyers spend a long time comparing providers, often with several decision-makers. Content must answer operational, commercial and compliance questions over many visits. We build pages for each stage and use internal links to move readers toward a quote request, while keeping technical details easy for specialists to find.',
      },
      {
        q: 'Can SEO help us win international shipping enquiries?',
        a: 'Yes, when pages are built around the lanes and countries you serve and use the terms shippers search. Where you serve several markets, language versions and hreflang may help. We confirm which markets deserve investment before building anything for them.',
      },
      {
        q: 'How do you measure results for a logistics business?',
        a: 'We track quote requests, calls, consultation bookings and, with your CRM, qualified opportunities from organic search. Rankings and traffic are reported too, but we focus on whether the enquiries match the kind of freight you want to carry, in the volumes and on the routes you can handle.',
      },
      {
        q: 'How long does logistics SEO take?',
        a: 'Expect several months before it meaningfully affects the pipeline, since competition from large carriers is strong and buyers take time to decide. We cannot guarantee a timeline, but we agree early milestones with you and report regularly on progress against them.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['moving-company-seo', 'manufacturing-seo', 'international-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'funeral-home-seo',
    path: '/seo-services/funeral-home-seo',
    name: 'Funeral Home SEO',
    title: 'Funeral Home SEO Services | Be Found in Hard Moments',
    description:
      'Respectful SEO for funeral homes: clear service information, local visibility, faith and tradition pages, and pre-planning content for families.',
    h1: 'Funeral home SEO services',
    intro:
      'Funeral home SEO makes it easier for families to find a trusted provider at a difficult time, and for others to plan ahead. It is done with restraint: clear information, accurate local details and respectful language, covering immediate needs, ceremonies and traditions, and also pre-planning, without pressure or exaggerated promises.',
    icon: 'groups',
    category: 'seo',
    hub: 'industry',
    tag: 'Funeral Homes',
    includes: [
      {
        title: 'Immediate-need visibility',
        body: 'Pages and profile details that show availability at any hour, location, contact numbers and the first steps to take, written calmly so that a grieving family can act without needing to search any further for help.',
      },
      {
        title: 'Service and tradition pages',
        body: 'Pages for burial, cremation, memorial services and the practices of different faiths and communities, written accurately with guidance from your own staff and, where appropriate, local religious advisers who know the customs.',
      },
      {
        title: 'Transparent information',
        body: 'Clear descriptions of what each service includes and how arrangements work, which helps families compare providers and builds confidence that nothing is hidden at a time when they are least able to question it.',
      },
      {
        title: 'Pre-planning content',
        body: 'Guides and pages for people who want to arrange their own service or spare relatives from difficult decisions, aimed at a quieter, more reflective kind of search than an urgent need for immediate help.',
      },
      {
        title: 'Obituary and memorial pages',
        body: 'Well-structured obituary and tribute pages that are fast, shareable and respectful, that families can find by name, and that give your site a steady stream of local relevance without any need for promotional wording.',
      },
      {
        title: 'Local profile and reviews',
        body: 'A complete Google profile with service details and sensitive handling of reviews, including gentle follow-up with families who wish to share their experience, and calm, courteous replies to every piece of feedback.',
      },
    ],
    steps: [
      {
        title: 'Listen first',
        body: 'We learn how families reach you, which communities you serve and which services you offer, then review how the site reads in practice.',
      },
      {
        title: 'Simplify the essentials',
        body: 'Contact details, availability and service information are made plain and easy to find on every page, especially when viewed on a phone.',
      },
      {
        title: 'Write with care',
        body: 'Service, tradition and planning pages are drafted in a respectful tone and checked by your team before anything is published.',
      },
      {
        title: 'Review gently',
        body: 'We monitor calls, pre-planning enquiries and profile activity, and keep reporting simple, without tactics that would feel intrusive to families.',
      },
    ],
    faq: [
      {
        q: 'How is funeral home SEO different from general business SEO?',
        a: 'Visitors are often grieving and need clear, calm information quickly. Tone, accuracy and trust count for more than clever tactics. Searches also divide between urgent needs and advance planning, which call for different pages, different language and a very different pace.',
      },
      {
        q: 'Can SEO help a funeral home reach more families?',
        a: 'It can make your home easier to find when families search for services nearby, and it can help your pre-planning content reach people earlier. We cannot guarantee numbers, and we avoid anything that treats bereaved families as leads to be pushed.',
      },
      {
        q: 'Can you optimize pages for specific religious or cultural services?',
        a: 'Yes. Families often search for services that follow their own customs, such as particular burial timings, prayers or rites. We work with your staff to describe these accurately, using the terms the community uses, and never guess at practices we are unsure of.',
      },
      {
        q: 'Do we need to update our website for SEO?',
        a: 'Often some changes help, such as clearer service pages, mobile-friendly contact options and obituary pages that load quickly. We start with an audit and suggest only the changes that matter, keeping the tone and look that families already recognise and trust in your community.',
      },
      {
        q: 'How do you measure success?',
        a: 'We look at calls, enquiry forms, pre-planning requests and profile actions such as directions, alongside rankings. Numbers are reported simply each month. We treat them as signs that families can find you, not as targets to be pushed upward at any cost.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['non-profit-seo', 'insurance-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
];
