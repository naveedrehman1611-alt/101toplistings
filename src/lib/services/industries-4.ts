import type { ServicePage } from '@/lib/service-pages';

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const DIRECTORY_GUIDES = { label: 'Business directory guides', href: '/blog/business-directory' };

/**
 * Industry SEO pages, batch four: cleaning, painting, fencing, appliance repair, body shops,
 * self storage, food delivery, franchises, cosmetics, industrial, furniture, personal injury,
 * professional firms, agencies, small business and window cleaning.
 */
export const INDUSTRY_PAGES_4: ServicePage[] = [
  {
    slug: 'cleaning-company-seo',
    path: '/seo-services/cleaning-company-seo',
    name: 'Cleaning Company SEO',
    title: 'Cleaning Company SEO | Win More Recurring Clients',
    description:
      'SEO for cleaning companies that brings in home and office clients: local rankings, service pages, reviews and quote requests built around repeat bookings.',
    h1: 'Cleaning company SEO',
    intro:
      'Cleaning company SEO helps a cleaning business show up when homeowners, landlords and facility managers search for a cleaner in their area. It covers map listings, service pages for each type of clean, trust signals such as insurance and vetting, and quote forms that turn a search into a booked first visit.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Recurring Clients',
    includes: [
      {
        title: 'Residential and commercial split',
        body: 'Homeowners want a friendly weekly clean, while offices want a reliable contractor. We build separate page paths and wording for each so neither audience lands on copy meant for the other.',
      },
      {
        title: 'Service pages by type of clean',
        body: 'Regular home cleaning, deep cleans, end-of-tenancy, post-construction and office cleaning each get a page covering what is included, how long it takes and how to request a quote. Each page links to a short quote form so visitors can ask for pricing straight away.',
      },
      {
        title: 'Service-area coverage',
        body: 'We map the districts and towns your teams can realistically reach, then build area pages with real detail instead of one list of place names pasted into a footer. These pages also help you attract customers in areas you want to grow.',
      },
      {
        title: 'Trust and vetting content',
        body: 'Cleaners enter private homes, so we help you show insurance, staff checks, products used and how you handle keys and access, in plain language near every booking button. Plain statements here ease the worry that stops many first-time bookings.',
      },
      {
        title: 'Reviews and map profile',
        body: 'We set up your Google profile with the right categories and services, and add a simple post-clean review request so recent, specific reviews keep arriving. Reviews also supply the phrases real customers use, which we reuse in service page copy.',
      },
      {
        title: 'Quote and booking flow',
        body: 'We review how quote forms, call buttons and instant-estimate tools work on a phone, since most cleaning searches happen on mobile and a slow form loses the booking. We also check that confirmation messages set clear expectations about response times.',
      },
    ],
    steps: [
      {
        title: 'Audit demand and coverage',
        body: 'We check where you appear for home and office cleaning searches, which areas you serve, and how competitors present their services and reviews.',
      },
      {
        title: 'Rebuild the service pages',
        body: 'We write or rework pages by clean type and audience, with clear inclusions, trust details and an easy quote route on each.',
      },
      {
        title: 'Strengthen the local profile',
        body: 'We tidy listings, set categories and service areas, and put a steady review process in place for finished jobs. Then we agree who asks for reviews and when.',
      },
      {
        title: 'Track enquiries',
        body: 'We report on calls, form submissions and map views, then focus effort on the services and areas that bring recurring work.',
      },
    ],
    faq: [
      {
        q: 'Do cleaning companies really need SEO?',
        a: 'Most people look for a cleaner through a map search or a recommendation they then verify online. If your listing, reviews and website are weak at that moment, the booking goes to a competitor. SEO makes sure you are visible and credible when the search happens.',
      },
      {
        q: 'Should I target residential and commercial clients on the same site?',
        a: 'Usually yes, but on separate pages. The two groups search differently and judge you differently: homeowners care about trust and flexibility, businesses about contracts, insurance and reliability. Separate pages let each speak to its own audience without confusing the other.',
      },
      {
        q: 'Can SEO help with one-off cleans as well as regular clients?',
        a: 'Yes. End-of-tenancy, deep cleaning and post-builder cleans are searched as distinct jobs, often under time pressure. Dedicated pages for each can attract one-off work, and a good first clean is often how a recurring client begins. These searches often come with a deadline, so pages that explain what is included and how quickly you can start tend to win the booking.',
      },
      {
        q: 'How do reviews affect a cleaning business?',
        a: 'Reviews carry extra weight because customers are letting you into their home or workplace. Recent reviews that mention specific services and areas help both rankings and confidence. We help you ask consistently and reply properly, following each platform’s rules. We write review request wording for you to adapt, and templates for replying to both praise and complaints.',
      },
      {
        q: 'How long until I see more enquiries?',
        a: 'Listing and page fixes can show movement within weeks, while competitive areas take longer. We do not promise rankings or timeframes, but we report calls, quote requests and map views so you can see what is changing. Tracking is set up at the start so changes can be linked to the work.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['window-cleaner-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'painter-seo',
    path: '/seo-services/painter-seo',
    name: 'Painter SEO',
    title: 'Painter SEO | Fill Your Painting Job Calendar',
    description:
      'SEO for painters and decorators: interior and exterior job pages, before-and-after galleries, local rankings and quote requests that arrive with photos.',
    h1: 'Painter SEO',
    intro:
      'Painter SEO is the work of getting a painting and decorating business in front of people who are about to book a job. It combines local map visibility, pages for interior, exterior and commercial painting, portfolio proof and a quote process that suits how clients actually ask: with photos and a rough room count.',
    icon: 'home_repair_service',
    category: 'seo',
    hub: 'industry',
    tag: 'Before and After',
    includes: [
      {
        title: 'Interior and exterior pages',
        body: 'Repainting a living room and repainting a house exterior are different searches with different worries. We write separate pages covering preparation, finishes, weather considerations and what a typical job involves.',
      },
      {
        title: 'Portfolio built for search',
        body: 'Before-and-after galleries are your best proof, so we structure them with descriptive captions, job type, location and compressed images that load quickly and can appear in image results. Fast loading matters here because galleries are image-heavy and most visitors browse on phones.',
      },
      {
        title: 'Seasonal planning',
        body: 'Exterior work clusters in dry, mild weather and interior work picks up when people are indoors or moving. We time content and profile updates to those cycles so you are visible before demand peaks.',
      },
      {
        title: 'Quote request that works',
        body: 'We design the enquiry form to collect room count, surfaces and photos, so you can give a rough idea quickly and filter out jobs outside your range without long back-and-forth.',
      },
      {
        title: 'Commercial and trade pages',
        body: 'Landlords, property managers and builders hire on reliability and scheduling. We create pages for these buyers with insurance details, sector experience and how you work around occupied buildings. Pages for these buyers also explain your health and safety approach and whether you can work out of hours.',
      },
      {
        title: 'Reviews and local profile',
        body: 'We optimize your map profile with photos of finished work and a review process that asks clients to mention the room or building type, helping your listing match specific searches.',
      },
    ],
    steps: [
      {
        title: 'Review your current reach',
        body: 'We check how you rank for interior, exterior and commercial painting in your service area and how your portfolio and reviews compare with local competitors.',
      },
      {
        title: 'Build job-type pages',
        body: 'We create or rework pages for each type of painting job, adding portfolio examples, process detail and a clear way to ask for a quote.',
      },
      {
        title: 'Publish your best work',
        body: 'We turn finished jobs into captioned gallery entries and local profile posts, with permission from clients where faces or addresses appear.',
      },
      {
        title: 'Measure and adjust',
        body: 'We track calls, quote forms and map actions by season, then shift effort toward the job types and areas that produce the best-fit work.',
      },
    ],
    faq: [
      {
        q: 'How do people usually find a painter online?',
        a: 'Many start with a map search or ask a neighbour, then check a few websites and galleries before requesting quotes. A strong profile, a visible portfolio and clear contact options help you make that shortlist and be chosen from it.',
      },
      {
        q: 'Is a photo gallery really that important?',
        a: 'For painters, yes. Clients are buying a finish they cannot see in advance, so finished work is the main proof of quality. Well-labelled photos also give search engines context about the jobs you do and the areas you cover. A handful of strong projects, shown with detail, usually does more than a long gallery of unlabelled pictures.',
      },
      {
        q: 'Should I have separate pages for interior and exterior painting?',
        a: 'Generally yes. The searches, seasons and concerns differ, such as drying times and weather on one side and furniture, dust and colour on the other. Separate pages let each be specific, which tends to serve both readers and search engines better.',
      },
      {
        q: 'Can SEO bring me larger commercial contracts?',
        a: 'It can support them. Commercial buyers look for evidence of scale, insurance, safety practice and past projects. Pages written for those questions help you appear credible, although larger contracts also depend on tenders, relationships and referrals. Case examples with building type and scale are especially persuasive to property managers comparing contractors.',
      },
      {
        q: 'How soon will the phone start ringing?',
        a: 'It depends on competition and where you start. Profile and page improvements can help within weeks, while competitive areas take longer. We cannot guarantee positions, but we report enquiries and visibility so you can judge progress. Seasonal swings in painting demand also affect timing, so we plan around your busy periods.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['cleaning-company-seo', 'fencing-company-seo', 'google-business-profile'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'fencing-company-seo',
    path: '/seo-services/fencing-company-seo',
    name: 'Fencing Company SEO',
    title: 'Fencing Company SEO | More Qualified Quote Requests',
    description:
      'SEO for fencing contractors: material and style pages, gate and repair content, local rankings and project galleries that turn researchers into quote requests.',
    h1: 'Fencing company SEO',
    intro:
      'Fencing company SEO helps a fencing contractor appear when property owners research materials, styles and installers for a new boundary, a security fence or a storm repair. Because jobs are high value and often planned weeks ahead, the focus is on informative pages, project proof and a quote process that captures site details.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Project Quotes',
    includes: [
      {
        title: 'Material and style pages',
        body: 'Timber, vinyl, metal, mesh and composite fencing each attract a different buyer. We write pages explaining appearance, upkeep, lifespan and suitability so people compare options on your site, not elsewhere.',
      },
      {
        title: 'Residential, farm and commercial paths',
        body: 'A garden boundary, a livestock enclosure and a secure industrial perimeter involve different decisions. We separate these audiences with pages covering their typical requirements and how you handle each project.',
      },
      {
        title: 'Repair and storm-damage content',
        body: 'Damaged panels and fallen sections are urgent, unplanned searches. We create a repair page with clear contact options and emergency wording so these enquiries find you quickly. Photos of the damage type you repair, and your response times, reassure anxious owners.',
      },
      {
        title: 'Planning and boundary guidance',
        body: 'Owners worry about boundaries, neighbours and local rules. We add practical guidance, with a reminder to check local requirements, which builds trust and answers questions before the first call. This content also earns links from local property and gardening sites over time.',
      },
      {
        title: 'Project gallery with detail',
        body: 'Completed installs are shown with material, length, height and location type, so visitors can match your work to their own site and search engines understand what you build. Captions with real measurements make each project a useful reference for later buyers.',
      },
      {
        title: 'Site-visit quote form',
        body: 'We build an enquiry form that asks for approximate length, material preference, gradient or access issues and a photo, so you can respond with a sensible next step. A short form like this also saves you wasted trips to jobs that do not fit.',
      },
    ],
    steps: [
      {
        title: 'Map your search demand',
        body: 'We look at the materials, styles and repair searches in your area and see which competitors dominate each, then pick the realistic priorities.',
      },
      {
        title: 'Build the page set',
        body: 'We create material, application and repair pages, each with project examples and a quote route written for that type of buyer.',
      },
      {
        title: 'Improve local presence',
        body: 'We set up your map profile with the right categories, service areas and project photos, and tidy listings across directories.',
      },
      {
        title: 'Report on quote quality',
        body: 'We track quote requests by source and page, flag the ones that were a good fit, and refine pages accordingly.',
      },
    ],
    faq: [
      {
        q: 'Which fencing searches matter most?',
        a: 'It varies by market, but three groups are common: material and style research, installer searches by location, and urgent repair searches. Each needs a different page and a different tone, so we plan coverage across all three rather than one general page.',
      },
      {
        q: 'Fencing jobs are seasonal. How does SEO handle that?',
        a: 'Research starts before the busy season, so pages need to be live and well established beforehand. We plan updates and project posts ahead of your peak, and keep repair content ready year-round for unplanned storm or damage enquiries. Material and style research usually happens first, so useful comparison pages are worth the effort.',
      },
      {
        q: 'Do I need a page for every town I cover?',
        a: 'Only where you can say something genuine, such as local project examples, typical property types or access conditions. Thin pages that swap a place name add little. We usually build fewer, stronger area pages for the places you win work in.',
      },
      {
        q: 'Can SEO attract farm and commercial buyers?',
        a: 'It can help them find you, provided pages speak to their needs: stock-proof or security specifications, installation scale and safety practice. Those buyers often also rely on referrals and tenders, so SEO works alongside, not instead of, those routes. We would rather build one strong page for each buyer type than many weak ones.',
      },
      {
        q: 'Will you guarantee a first-page position?',
        a: 'No. Nobody can honestly promise that. We can improve the pages, profile and proof that search engines look at, and report on enquiries and visibility so you see what the work is doing. Instead, we agree measurable targets such as quote requests, calls and profile actions each month, and review them with you.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['painter-seo', 'industrial-seo', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'appliance-repair-seo',
    path: '/seo-services/appliance-repair-seo',
    name: 'Appliance Repair SEO',
    title: 'Appliance Repair SEO | Be Found When Things Break',
    description:
      'SEO for appliance repair businesses: brand and fault-code pages, same-day booking visibility, map rankings and repair-or-replace content that wins calls.',
    h1: 'Appliance repair SEO',
    intro:
      'Appliance repair SEO puts a repair business in front of people whose washer, oven or fridge has just stopped working. Searches are specific, often naming the brand, model or an error code, and the buyer wants a fast answer. The work combines map visibility, brand and fault pages, and a booking path that is quick on a phone.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Same-Day Repair',
    includes: [
      {
        title: 'Appliance and brand pages',
        body: 'Washing machines, dryers, dishwashers, ovens and fridges each need their own page, plus brand pages where you genuinely service them. Each states what you repair, typical faults and how to book.',
      },
      {
        title: 'Fault and error-code content',
        body: 'Many searches are a symptom or code, such as a machine not draining. We write helpful troubleshooting pages that explain likely causes and when a technician is needed, capturing people before they call anyone.',
      },
      {
        title: 'Repair-or-replace guidance',
        body: 'People often wonder whether an older appliance is worth fixing. Honest pages that explain how to weigh age, cost and fault type build trust and bring in customers who value straight advice.',
      },
      {
        title: 'Same-day and call-out clarity',
        body: 'We make availability, service hours, call-out arrangements and coverage areas obvious near the top of key pages, since urgency decides who gets the call. Where you offer evening or weekend visits, we show that too, since broken appliances rarely wait for office hours.',
      },
      {
        title: 'Map profile and service areas',
        body: 'We optimize categories, services, hours and service-area settings on your map profile, and encourage reviews that name the appliance repaired and the fix completed. We also add photos of your vans and technicians, which helps customers feel safe letting you in.',
      },
      {
        title: 'Phone-first booking',
        body: 'We test click-to-call, booking forms and message options on mobile, because most breakdown searches start on a phone, often in a kitchen with a broken appliance. Fast pages and simple forms matter more here than long copy.',
      },
    ],
    steps: [
      {
        title: 'Audit by appliance and area',
        body: 'We check how you appear for each appliance type and brand you service across the neighbourhoods you cover, and who ranks above you.',
      },
      {
        title: 'Create the repair pages',
        body: 'We build appliance, brand and fault pages with clear scope, honest guidance and a prominent way to request a visit.',
      },
      {
        title: 'Tighten the local profile',
        body: 'We correct listing details, add real photos and services, and set up a review request tied to completed repairs. We also check that opening hours are correct on every site.',
      },
      {
        title: 'Follow calls and bookings',
        body: 'We track calls and form requests by page, then expand the appliance and brand pages that generate genuine work. We also note which appliances produce repeat calls.',
      },
    ],
    faq: [
      {
        q: 'What do people search for when an appliance fails?',
        a: 'Usually a mix: the appliance plus a fault, such as a dishwasher not draining, an error code, or a repair service near them. Covering each of these with a suitable page means you can appear whether they are diagnosing the problem or ready to book.',
      },
      {
        q: 'Should I list every brand I repair?',
        a: 'Only brands you genuinely service. Brand pages can match specific searches and signal expertise, but listing brands you cannot support wastes visits and damages trust. We build pages for the brands that make up most of your actual work. Brand pages also help match searches that include the manufacturer name alongside a fault.',
      },
      {
        q: 'Do troubleshooting guides send customers away to fix it themselves?',
        a: 'Some will, and that is fine. Many readers find the issue needs a technician, and they remember the business that explained it clearly. Guides also earn visibility for searches that a plain booking page would never match. Others remember you when the machine fails again, or when a larger appliance needs servicing.',
      },
      {
        q: 'Is the map listing or the website more important?',
        a: 'Both matter and they support each other. Urgent searches often surface the map results first, while the website provides detail, brands and proof. We improve both so a searcher can see you quickly and then feel confident enough to call.',
      },
      {
        q: 'Can SEO guarantee same-day jobs?',
        a: 'No, bookings depend on your capacity and the searches in your area. SEO improves how often you are seen and how easily people can contact you, and we report calls and requests so you can plan around real demand. Capacity planning matters, so we share expected demand patterns by season and appliance type.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['body-shop-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'body-shop-seo',
    path: '/seo-services/body-shop-seo',
    name: 'Body Shop SEO',
    title: 'Body Shop SEO | More Collision Repair Estimates',
    description:
      'SEO for auto body shops: collision repair, dent and paint pages, insurance-claim guidance, local rankings and photo estimate flows that bring in repair jobs.',
    h1: 'Body shop SEO',
    intro:
      'Body shop SEO helps an auto body and collision repair business get found by drivers dealing with accident damage, dents, scratches or paint problems. Many arrive stressed and unsure about insurance, so the work covers local visibility, repair-type pages, claim guidance and an estimate process that lets drivers send photos.',
    icon: 'build',
    category: 'seo',
    hub: 'industry',
    tag: 'Collision Repair',
    includes: [
      {
        title: 'Collision repair pages',
        body: 'We describe how you handle structural repair, panel replacement, paint matching and finishing, in language a worried driver can follow, with before-and-after examples that show the standard of work. Short sections help customers who are comparing several shops after an accident.',
      },
      {
        title: 'Smaller repair services',
        body: 'Dent removal, bumper repair, scratch and scuff work and alloy refurbishment are searched by people who want something fixed cheaply and quickly. Individual pages capture those jobs separately from major accident repair.',
      },
      {
        title: 'Insurance-claim guidance',
        body: 'Drivers want to know whether they can choose their own repairer and what happens next. We write clear, careful guidance, noting that rules differ by insurer and country, and explain how you support claims.',
      },
      {
        title: 'Photo estimate flow',
        body: 'A form that accepts photos of the damage, vehicle details and contact preferences lets you give a first view faster and reduces wasted visits for both sides. Clear next steps and an expected reply time reduce abandoned enquiries after the first message.',
      },
      {
        title: 'Credentials and equipment',
        body: 'Where genuinely held, we present manufacturer approvals, technician training, equipment and warranty terms clearly, because drivers are trusting you with a safety-critical repair. Photos of the workshop and equipment make those credentials more believable, and give your listing more to show.',
      },
      {
        title: 'Reviews and map presence',
        body: 'We optimize your profile for body shop and collision categories, and build a review process that captures feedback on communication, finish quality and turnaround. We also draft reply guidance in a calm, factual tone.',
      },
    ],
    steps: [
      {
        title: 'Assess your position',
        body: 'We review visibility for collision, dent and paint searches near you, and how insurer-related questions are answered by your site and competitors.',
      },
      {
        title: 'Build repair and claim pages',
        body: 'We write pages by repair type, add claims guidance and credentials, and set up the photo estimate request. We also add clear steps for the first visit, so drivers know what to bring and expect.',
      },
      {
        title: 'Reinforce local signals',
        body: 'We align listings, categories, hours and photos, and begin a steady review process after collected vehicles. We also correct duplicate or outdated listings that confuse drivers and search engines.',
      },
      {
        title: 'Review estimate quality',
        body: 'We track estimate requests, calls and bookings, then adjust pages and wording to bring in more of the jobs you want.',
      },
    ],
    faq: [
      {
        q: 'When do drivers start searching for a body shop?',
        a: 'Often right after an accident, but also weeks later once a dent or scratch becomes annoying. The first group needs reassurance and claims help, the second wants price and convenience. Different pages for each help you meet both sets of expectations.',
      },
      {
        q: 'Can SEO help with insurance-referred work?',
        a: 'It can help drivers who choose their own repairer find you, and clear claims guidance builds confidence. Work routed directly by insurers usually depends on approved-repairer arrangements, which SEO does not replace but can complement. Many drivers hold the choice for the repairer themselves, so clarity on how you manage the claim process helps.',
      },
      {
        q: 'Do before-and-after photos matter for search?',
        a: 'Yes, for people and for search. Drivers judge quality visually, and captioned photos tell search engines what repair was done. We help you present them with permission, avoiding visible number plates or personal details. Good photos also give your listing more appeal in image and map results.',
      },
      {
        q: 'Should I target minor repairs or accident repairs?',
        a: 'Most shops want both. Minor repairs bring volume and quick turnaround, while accident repairs bring larger jobs and insurer work. We plan pages and profiles for each so you are not relying on one type of search. Planning for both also protects you when one type of work slows down.',
      },
      {
        q: 'How do you measure success for a body shop?',
        a: 'By estimate requests, calls, map actions and bookings, not rankings alone. We set up tracking for these and share where they come from, so you can see which pages and searches lead to actual repair work. Reviews and call volume are included, and we separate genuine job enquiries from general questions.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['appliance-repair-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'self-storage-seo',
    path: '/seo-services/self-storage-seo',
    name: 'Self Storage SEO',
    title: 'Self Storage SEO | Fill Units With Local Renters',
    description:
      'SEO for self storage operators: facility pages, unit-size guides, local rankings and reservation flows that turn searches into move-ins at each location.',
    h1: 'Self storage SEO',
    intro:
      'Self storage SEO helps a storage operator appear when people search for a unit near a home, a workplace or a move. Customers compare size, price, access and location in minutes, so the work centres on one strong page per facility, clear unit-size guidance, map visibility and a reservation path that works without a phone call.',
    icon: 'storefront',
    category: 'seo',
    hub: 'industry',
    tag: 'Unit Rentals',
    includes: [
      {
        title: 'One page per facility',
        body: 'Each site gets its own page with address, access hours, security, unit types, directions and photos, so a searcher sees the exact details of the facility closest to them. Clear directions and parking notes cut down on calls from people looking for the gate.',
      },
      {
        title: 'Unit-size guidance',
        body: 'Renters rarely know what size they need. We build a clear size guide with examples of what typically fits, helping people pick a unit and reducing enquiries that stall on uncertainty.',
      },
      {
        title: 'Feature and use-case pages',
        body: 'Climate-controlled, vehicle, business, student and short-term storage attract different renters. We create pages for the features you actually offer and the situations that prompt a search. Each page names the unit sizes that suit the situation, which guides renters towards the right choice.',
      },
      {
        title: 'Reservation path',
        body: 'We review the route from search to reservation, including availability display, form length and mobile speed, because most renters decide quickly and move on if the process is awkward. Clear pricing messages, kept accurate, help avoid disappointing renters later.',
      },
      {
        title: 'Local profiles at scale',
        body: 'Each facility needs an accurate map profile and consistent listings. We clean up name, address and hours data and manage categories so locations support rather than compete with one another.',
      },
      {
        title: 'Moving-season content',
        body: 'Demand follows house moves, renovations, term dates and seasonal downsizing. We plan helpful content and profile updates ahead of those periods, such as packing and how-to-store guides. Seasonal posts on your map profile can also remind past renters that you are nearby.',
      },
    ],
    steps: [
      {
        title: 'Audit locations and listings',
        body: 'We review how each facility appears in local search, check listing accuracy, and see how nearby competitors present size, access and availability.',
      },
      {
        title: 'Rebuild facility and unit pages',
        body: 'We create a clear page for every location, plus size and use-case pages that link naturally between them. We also add photos and access details so renters know what to expect on arrival.',
      },
      {
        title: 'Smooth the reservation route',
        body: 'We test the journey on a phone, trim friction in forms and make availability and next steps obvious. Then we check that confirmation emails are working properly.',
      },
      {
        title: 'Measure by location',
        body: 'We report enquiries and reservations per facility, so you can see which sites are well served and which need more attention.',
      },
    ],
    faq: [
      {
        q: 'How do people choose a storage facility?',
        a: 'Mostly by proximity, then by size, access and perceived security, with price close behind. They scan a few options on a phone. Clear, accurate facility pages and a visible map listing make it easy to be one of the options they take seriously.',
      },
      {
        q: 'Why does each facility need its own page?',
        a: 'Because people search by place and want facts about that exact site: hours, access, unit types and how to find it. A single page for all locations cannot answer those questions well or match location-based searches as precisely. Pages with local landmarks and driving routes also help people recognise the right site.',
      },
      {
        q: 'Can SEO work alongside paid search?',
        a: 'Yes. Paid campaigns can fill urgent gaps while organic visibility builds. Many operators use both, with SEO providing a lower cost-per-enquiry over time. We can share what we learn about local search behaviour to help each channel support the other.',
      },
      {
        q: 'How do you handle multiple locations without duplicate content?',
        a: 'Each facility page carries its own details, photos, directions and local context, rather than the same text with a changed address. We also keep a shared template for structure so pages stay consistent without becoming copies of one another. This keeps pages useful for renters, and avoids the thin repetition search engines tend to ignore.',
      },
      {
        q: 'Do you promise more move-ins?',
        a: 'We cannot promise a number. We improve visibility and make the route to reserving a unit simpler, then report reservations and enquiries by facility so you can see the effect on occupancy over time. Results vary by location and competition, so we compare locations fairly and not just as a network total.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['franchise-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'food-delivery-seo',
    path: '/seo-services/food-delivery-seo',
    name: 'Food Delivery SEO',
    title: 'Food Delivery SEO | Win Direct Orders Online',
    description:
      'SEO for food delivery brands, cloud kitchens and ordering sites: area and cuisine pages, menu markup and direct-order visibility beyond the aggregator apps.',
    h1: 'Food delivery SEO',
    intro:
      'Food delivery SEO helps a delivery service, cloud kitchen or restaurant ordering site win orders directly rather than depending on marketplace apps. People search by cuisine, dish and delivery area, often at a particular hour. The work covers area and menu pages, structured data, local visibility and an ordering flow that is quick on mobile.',
    icon: 'restaurant',
    category: 'seo',
    hub: 'industry',
    tag: 'Direct Orders',
    includes: [
      {
        title: 'Delivery-area pages',
        body: 'People search for food delivered to their district, not just a cuisine. We build pages for the areas you genuinely deliver to, with local detail, delivery hours and minimum order information.',
      },
      {
        title: 'Cuisine and dish landing pages',
        body: 'A search for biryani, pizza or vegan bowls can lead to a page dedicated to that dish or cuisine, showing real menu items, photos and an order button, rather than a general homepage.',
      },
      {
        title: 'Menu structured data',
        body: 'We add markup for your menu, opening hours and delivery details where supported, helping search engines understand what you serve and when, and keeping prices and availability consistent. We check the markup against your live menu so out-of-date dishes do not remain online.',
      },
      {
        title: 'Cloud kitchen brand handling',
        body: 'If one kitchen runs several virtual brands, each needs its own identity and pages without looking duplicated. We structure sites and profiles so brands do not compete against one another.',
      },
      {
        title: 'Marketplace and direct balance',
        body: 'Aggregators will keep ranking for your name. We keep your listings accurate there, and build the direct pages, ordering links and offers that encourage repeat customers to order from you.',
      },
      {
        title: 'Mobile ordering speed',
        body: 'Most orders start on a phone, often when someone is hungry and impatient. We review page speed, menu navigation and checkout steps so a hungry searcher is not lost to slow loading.',
      },
    ],
    steps: [
      {
        title: 'Review demand and coverage',
        body: 'We map the cuisines, dishes and delivery areas you can serve and see how aggregators and rivals currently dominate those searches.',
      },
      {
        title: 'Build area and menu pages',
        body: 'We create the delivery-area and dish pages, add menu markup and make sure ordering links are obvious and fast. We also check that each page loads quickly on mobile data.',
      },
      {
        title: 'Align profiles and listings',
        body: 'We clean up map profiles, hours and marketplace listings so details match everywhere, including holiday and late-night changes. Then we plan updates for holidays and special menus.',
      },
      {
        title: 'Track orders by source',
        body: 'We report direct orders and traffic by page and area, and use them to decide where to extend delivery content next.',
      },
    ],
    faq: [
      {
        q: 'Can I really compete with the big delivery apps?',
        a: 'Not for every search, and that is not the aim. The apps will often rank for generic terms. A direct site can still win searches for your brand, specific dishes and the areas you serve, and it lets you keep a customer relationship the apps would otherwise own.',
      },
      {
        q: 'Do I need a page for each area I deliver to?',
        a: 'Only for areas where you actively deliver and can add something real, such as delivery time or popular items there. Thin pages for places you barely cover can mislead customers. We help you choose areas that deserve their own page.',
      },
      {
        q: 'How does menu markup help?',
        a: 'Structured data gives search engines a clear, machine-readable view of your menu, hours and delivery options, and may support richer results where available. It cannot guarantee special features, but it removes ambiguity and reduces mismatched information. It also helps keep opening hours correct when they change for holidays or events.',
      },
      {
        q: 'What about cloud kitchens with several brands?',
        a: 'Each brand needs a separate name, menu and set of pages so searchers can tell them apart. We watch for duplicate content between brands that share a kitchen, and make sure each profile and listing matches the right brand. Done well, this lets you run several brands without confusing customers or search engines.',
      },
      {
        q: 'Will SEO replace marketplace orders?',
        a: 'Probably not entirely, and that is fine for most operators. The goal is to shift a healthy share of orders to your own channel over time. We report direct order growth separately, so you can weigh it against marketplace fees and effort.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['restaurant-seo', 'seo-for-online-stores', 'google-business-profile'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'franchise-seo',
    path: '/seo-services/franchise-seo',
    name: 'Franchise SEO',
    title: 'Franchise SEO | Grow Every Location and Recruit',
    description:
      'Franchise SEO that supports each outlet with local pages and profiles, protects brand consistency and attracts new franchisees from one coordinated strategy.',
    h1: 'Franchise SEO',
    intro:
      'Franchise SEO coordinates search visibility across a brand and its many locations. It has two jobs: helping customers find the nearest outlet, and attracting prospective franchisees. The challenge is consistency, so that the brand site, location pages and map profiles agree, while franchisees keep enough local flavour to rank and convert in their own area.',
    icon: 'account_tree',
    category: 'seo',
    hub: 'industry',
    tag: 'Multi-Unit',
    includes: [
      {
        title: 'Location page framework',
        body: 'A repeatable template gives every outlet its own page with address, hours, team, offers and local content, so pages stay consistent without becoming near-identical copies across the network. Local managers can add team photos, offers and events without touching the underlying structure.',
      },
      {
        title: 'Map profile governance',
        body: 'Dozens of profiles drift quickly with changed hours, closed outlets and duplicates. We audit them, agree who edits what, and set routines so each location stays accurate under the brand.',
      },
      {
        title: 'Brand and local balance',
        body: 'Brand pages should not cannibalize location pages, or the reverse. We map which page targets which search, so “brand name” and “brand name near me” both lead to the right place.',
      },
      {
        title: 'Franchisee recruitment pages',
        body: 'Prospective owners search very differently from customers. We build pages on the opportunity, support, investment expectations and process, written responsibly and consistent with your disclosure obligations, which vary by country.',
      },
      {
        title: 'Reviews across the network',
        body: 'We set a review approach each outlet can follow and a reply standard for the brand, then report performance by location to show which franchisees need support. Prompt, polite replies from each outlet also show prospective customers that the location is run well.',
      },
      {
        title: 'Network reporting',
        body: 'You see visibility, calls and direction requests per outlet and for the brand overall, helping you spot strong locations, weak ones and gaps where there is no coverage. This view makes it far easier to decide where extra support will pay off.',
      },
    ],
    steps: [
      {
        title: 'Audit the network',
        body: 'We review every location page and profile, record duplicates and inconsistencies, and benchmark outlets against local competitors. We also list outlets that have no page at all, so gaps become visible.',
      },
      {
        title: 'Set standards',
        body: 'We agree templates, naming, categories, review practice and editing rights between the brand team and franchisees. This avoids confusion later, when staff change or new outlets open.',
      },
      {
        title: 'Roll out improvements',
        body: 'We update location pages and profiles in stages, starting with outlets where demand and competition suggest the biggest gains. Roll-outs happen in stages so mistakes are caught early and corrected.',
      },
      {
        title: 'Report and support',
        body: 'We report by outlet and for the brand, and give franchisees simple guidance on what they can do locally. Reports are tailored for franchisees and for head office.',
      },
    ],
    faq: [
      {
        q: 'Who should control local SEO in a franchise: the brand or the franchisee?',
        a: 'Usually both, with clear limits. The brand controls templates, naming and technical setup so the network stays consistent, while franchisees contribute accurate local detail, photos and reviews. We help set those responsibilities down in a simple, workable guide. Written guidance helps new owners follow the same process when the network grows.',
      },
      {
        q: 'How do you avoid duplicate content across locations?',
        a: 'Each page needs real local information, such as the team, nearby landmarks, local offers or stories, alongside a shared structure. We provide a framework and prompts that make it easy for outlets to add genuine detail instead of repeating the same text.',
      },
      {
        q: 'Can franchise SEO help recruit franchisees?',
        a: 'It can bring informed prospects to your recruitment pages by answering the questions owners ask. Those pages must be honest and meet any disclosure or advertising rules in your markets. We write carefully and recommend legal review before publishing. Prospects judge the brand by how clearly and carefully it presents the opportunity.',
      },
      {
        q: 'What if franchisees already run their own sites?',
        a: 'That is common, and it can cause conflicts and duplicate listings. We audit what exists, then recommend either moving everything onto the brand site or setting rules for independent sites, with clear canonical and linking arrangements. Consolidating is often cleaner, but not always possible, so we weigh the options with you.',
      },
      {
        q: 'How do you report on dozens of locations?',
        a: 'We group data by outlet and region, highlighting leaders, laggards and anomalies, rather than burying you in one huge table. Each franchisee can see their own numbers, and you see the network summary and where to focus support. That keeps reports short enough to be read and acted on.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['self-storage-seo', 'google-business-profile', 'enterprise-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'cosmetics-seo',
    path: '/seo-services/cosmetics-seo',
    name: 'Cosmetics SEO',
    title: 'Cosmetics SEO | Grow Beauty Brand Search Traffic',
    description:
      'SEO for cosmetics and beauty brands: product, shade and ingredient pages, careful claims, review content and category visibility that supports direct sales.',
    h1: 'Cosmetics SEO',
    intro:
      'Cosmetics SEO helps beauty and skincare brands and retailers be found by shoppers who research products before buying. They search by concern, ingredient, shade and routine, and trust reviews heavily. The work covers product and collection pages, ingredient and how-to content, careful claim wording and the technical setup of a busy online store.',
    icon: 'shopping_bag',
    category: 'seo',
    hub: 'industry',
    tag: 'Beauty Brands',
    includes: [
      {
        title: 'Product page depth',
        body: 'Each product page covers ingredients, shades, size, skin type, how to use and who it suits, written to answer shopper questions rather than repeat a supplier description. Complete information also helps reduce returns caused by wrong shade or skin type choices.',
      },
      {
        title: 'Concern and routine collections',
        body: 'Shoppers search for “products for dry skin” or “a morning routine” more than product names. We build collection pages and guides around concerns, skin types and routines that lead into your range.',
      },
      {
        title: 'Ingredient and education content',
        body: 'We write plain, accurate content about common ingredients and how products are used, with care to avoid medical claims, and reference reputable sources where it strengthens a point. Good education content also earns trust long before a shopper is ready to buy.',
      },
      {
        title: 'Claims and compliance wording',
        body: 'Cosmetic claims are regulated and rules differ between countries. We keep wording measured, flag anything that sounds like a treatment promise, and recommend your regulatory adviser reviews sensitive pages. This protects the brand as well as the shopper.',
      },
      {
        title: 'Shade, variant and review markup',
        body: 'Variants, stock and genuine customer reviews are marked up correctly so search engines understand each product, avoid duplicate pages for shades and show accurate information. Reviews are shown only where they genuinely come from customers.',
      },
      {
        title: 'Brand versus retailer strategy',
        body: 'If you sell both direct and through retailers, we help your own site stand out on brand searches and detailed product queries, where retailers often otherwise take the traffic. This protects margin on your own channel while keeping partners supplied with accurate information.',
      },
    ],
    steps: [
      {
        title: 'Audit store and category demand',
        body: 'We review how your products appear for concern, ingredient and brand searches, and how marketplaces and retailers rank for the same terms.',
      },
      {
        title: 'Restructure product and collection pages',
        body: 'We improve templates, fix duplicate variants and rewrite key pages around shopper questions, ingredients and routines. We also check page speed and image weight, since beauty imagery slows many stores.',
      },
      {
        title: 'Publish supporting content',
        body: 'We add careful educational content and guides that link naturally to relevant products and collections. We also use customer questions and reviews to choose topics.',
      },
      {
        title: 'Measure sales paths',
        body: 'We track organic visits, product views and orders by page group, and refine pages that attract visits but little buying.',
      },
    ],
    faq: [
      {
        q: 'What do cosmetics shoppers search for?',
        a: 'A mix of brand names, product types, concerns, ingredients and comparisons, often followed by reading reviews. Covering the whole journey, from early research to final product check, gives your brand more chances to appear than relying on product names alone.',
      },
      {
        q: 'Is cosmetics content treated as sensitive?',
        a: 'Content touching on skin conditions, treatments or health can face higher standards because accuracy matters. We keep product copy measured, avoid medical promises and suggest that anything close to health advice is checked by a qualified professional. Shoppers also benefit when the claims on a page are measured and the sources are clear.',
      },
      {
        q: 'How do I stop retailers outranking my own products?',
        a: 'You may not outrank them for every term. We concentrate on brand searches, detailed product pages with richer information than retailers provide, and original content. Strong direct pages also support partners, since consistent information helps everyone. Gaps retailers leave, such as detailed usage advice, are often your biggest opportunity.',
      },
      {
        q: 'Do shade and size variants cause SEO problems?',
        a: 'They can, if each creates a near-identical URL. We review how variants are handled and use consistent URLs, canonical tags and variant markup, so authority is not spread thinly and shoppers still reach the right shade. Shade selectors that work properly on mobile also help buyers decide faster.',
      },
      {
        q: 'Can influencers and SEO work together?',
        a: 'Yes. Creator coverage can bring brand searches, mentions and links that support organic visibility. We make sure landing pages and brand pages are ready for the extra attention, though we cannot promise how any collaboration will perform in search. Tracking links and brand search volume show whether collaborations help over time.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'seo-for-online-stores', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'industrial-seo',
    path: '/seo-services/industrial-seo',
    name: 'Industrial SEO',
    title: 'Industrial SEO | Reach Engineers and B2B Buyers',
    description:
      'SEO for industrial manufacturers, suppliers and engineering firms: technical product pages, spec sheets, part-number search and RFQ pages that reach buyers.',
    h1: 'Industrial SEO',
    intro:
      'Industrial SEO helps manufacturers, suppliers and engineering firms reach the buyers, specifiers and procurement teams who search for equipment, materials and services. Searches are technical, volumes are lower and sales cycles are long, so the work focuses on accurate product and specification pages, part-number visibility and a clear request-for-quote path.',
    icon: 'domain',
    category: 'seo',
    hub: 'industry',
    tag: 'B2B Industrial',
    includes: [
      {
        title: 'Technical product pages',
        body: 'Engineers want dimensions, materials, tolerances, ratings and compatibility. We structure product pages around those specifications, with downloadable data sheets and drawings that support a purchasing decision. Clear tables beat long paragraphs here, because specifiers compare several suppliers side by side.',
      },
      {
        title: 'Part-number and model search',
        body: 'Buyers often search an exact part or model code. We set up catalogue pages and internal search so those queries find the right page, including superseded or alternative references where relevant.',
      },
      {
        title: 'Application and industry pages',
        body: 'Specifiers search by use, such as corrosion-resistant fittings for food processing. We create application pages that connect problems and industries to your products and engineering capability. These pages also help non-specialists, such as procurement staff, understand why a product suits their site.',
      },
      {
        title: 'Certifications and standards',
        body: 'Quality systems, safety approvals and compliance with recognised standards influence supplier choice. We present those you genuinely hold clearly and keep references accurate across the site. Certificates should be easy to download, with current dates and scope noted.',
      },
      {
        title: 'RFQ and enquiry design',
        body: 'We design request-for-quote forms that capture quantity, specification, delivery location and timeline, so your sales team receives usable enquiries rather than vague messages. Enquiries are routed to the right sales contact, which speeds up a first response and avoids drops.',
      },
      {
        title: 'Export and distributor visibility',
        body: 'For companies selling across borders or through distributors, we set up regional pages, language versions where justified and clear distributor information so buyers anywhere can find the right route. Local-language content is added only where buyers genuinely search in that language.',
      },
    ],
    steps: [
      {
        title: 'Learn the buying process',
        body: 'We speak with your sales team about who searches, what they ask and how enquiries arrive, then map those questions to search demand.',
      },
      {
        title: 'Clean up the catalogue',
        body: 'We fix duplicate, thin or hidden product pages, consolidate specifications and make sure data sheets are crawlable and current. We also remove obsolete listings that confuse buyers searching for a current part.',
      },
      {
        title: 'Create application content',
        body: 'We build application, industry and comparison pages with engineers’ input so content is accurate and useful to technical readers. We also ask your engineers to review each page before publication.',
      },
      {
        title: 'Connect to sales',
        body: 'We track RFQs and enquiries by page, share them with sales, and learn which topics lead to qualified conversations. We also review sales feedback on quote quality.',
      },
    ],
    faq: [
      {
        q: 'Is SEO useful when search volumes are small?',
        a: 'Often very. A handful of precise searches can come from buyers with large orders, so volume is a poor measure. We judge success by qualified enquiries and the quality of the conversations they start, not by raw traffic numbers. We also compare demand across related terms and applications, so low volumes do not hide real opportunities.',
      },
      {
        q: 'Should we publish PDFs and data sheets?',
        a: 'Yes, because engineers expect them. We make sure files are named clearly, linked from relevant product pages and that key facts also appear as page text, so search engines and readers can find the information without opening every document. Stable, well-named URLs for each file also help buyers who bookmark and share them.',
      },
      {
        q: 'How do you write for technical buyers?',
        a: 'We work with your engineers and sales team, then write plainly and precisely, avoiding marketing fluff. Accuracy matters more than polish for this audience, so we ask for subject-matter review before publishing anything technical. Subject-matter review also protects your reputation in a field where errors are noticed quickly by experienced readers.',
      },
      {
        q: 'Can industrial SEO support international sales?',
        a: 'It can. Buyers in different regions use different terms, units and standards. We plan regional pages and, where worthwhile, hreflang and language versions, while being realistic about which markets justify the effort. We also plan hreflang carefully, so each region sees the right version, with currency, units and certifications that apply there.',
      },
      {
        q: 'How long are industrial SEO results likely to take?',
        a: 'Long sales cycles mean the impact on revenue can lag behind visibility. We cannot promise timeframes, but we track rankings, enquiries and pipeline contributions so you can see progress well before a large order is signed. Early indicators include rankings for part and application terms, as well as the first enquiries from new visitors.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['manufacturing-seo', 'fencing-company-seo', 'technical-seo'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'furniture-store-seo',
    path: '/seo-services/furniture-store-seo',
    name: 'Furniture Store SEO',
    title: 'Furniture Store SEO | Online and Showroom Sales',
    description:
      'SEO for furniture stores and makers: room, style and product pages, delivery and dimension details, showroom visibility and ecommerce fixes for bigger baskets.',
    h1: 'Furniture store SEO',
    intro:
      'Furniture store SEO helps showrooms and online furniture retailers get found by people furnishing a room or a whole home. These are considered purchases: shoppers browse by room and style, check dimensions and delivery, and often visit before buying. The work joins product and collection SEO with showroom visibility and the practical details buyers need.',
    icon: 'storefront',
    category: 'seo',
    hub: 'industry',
    tag: 'Showrooms',
    includes: [
      {
        title: 'Room and style collections',
        body: 'People search “small sofa for a studio” or “scandinavian dining table”. We build collection pages by room, style, size and material that match how shoppers think and lead into relevant products.',
      },
      {
        title: 'Product pages with real detail',
        body: 'Dimensions, materials, assembly, weight, fabric options and care instructions go on the page. Complete information reduces returns and answers the questions that otherwise send shoppers to a competitor. Good photography from several angles helps too, along with real customer photos where permitted.',
      },
      {
        title: 'Delivery, returns and assembly',
        body: 'Bulky items raise worries about delivery windows, access and returns. We present these policies clearly on product and checkout pages, since they strongly influence whether a visitor orders. Clear terms near the price also reduce basket abandonment on higher-value orders.',
      },
      {
        title: 'Showroom and local visibility',
        body: 'If you have a physical store, we optimize its map profile, opening hours, photos and a showroom page, so people can plan a visit and see what is on display.',
      },
      {
        title: 'Variant and catalogue control',
        body: 'Colours, sizes and fabrics can create hundreds of near-duplicate URLs. We tidy faceted navigation, canonical tags and variant structure so search engines focus on the pages that matter. We check this regularly, because new ranges tend to reintroduce the same problems.',
      },
      {
        title: 'Image and inspiration content',
        body: 'Furniture is bought with the eyes. We optimize image files, alt text and room-set galleries, and create buying guides that inspire without hiding the products behind long reading. Page speed is checked too, since large images can slow product pages on mobile.',
      },
    ],
    steps: [
      {
        title: 'Audit catalogue and demand',
        body: 'We review how your categories and products perform for room, style and product searches and where duplicates or thin pages dilute them.',
      },
      {
        title: 'Rework collections and products',
        body: 'We restructure categories by room and style, and improve product templates with specifications, policies and strong images. We also test mobile navigation, since many shoppers browse on phones before visiting.',
      },
      {
        title: 'Support the showroom',
        body: 'We refine local profiles and showroom pages, and link online browsing to in-store visits and appointments. We also set up appointment links where design services are offered.',
      },
      {
        title: 'Track baskets and visits',
        body: 'We report organic revenue, product views and store actions, and refine the collections that bring in higher-value orders. Then we plan seasonal updates for sale periods.',
      },
    ],
    faq: [
      {
        q: 'How is furniture search different from other retail?',
        a: 'Purchases are larger and less frequent, so shoppers research for weeks, compare dimensions and read reviews. Many start with inspiration or room-based searches rather than product names, which means broader content and collection pages matter more than usual. Browsing often happens across several visits, so consistent, memorable pages help shoppers return.',
      },
      {
        q: 'Do I need local SEO if I mainly sell online?',
        a: 'If you have a showroom, yes. People often want to see and sit on furniture before buying, and local listings bring them in. If you are online only, local SEO matters less, though delivery area information still helps. Opening hours, parking and click-and-collect details are valuable to local shoppers even then.',
      },
      {
        q: 'How should we handle products in many colours and sizes?',
        a: 'Usually one main product page with selectable variants, rather than a separate page for every combination. Where a colour has real search demand of its own, a dedicated page can work. We review this per range, balancing shopper needs and duplicate risk.',
      },
      {
        q: 'Does seasonality matter?',
        a: 'Yes. Moves, renovations, sales periods and holidays shape demand. We plan collection updates and content ahead of those peaks, so pages are already established when searches rise, instead of being rushed into place during the busiest weeks. Planning early also means you can test and fix pages before the busy period starts.',
      },
      {
        q: 'Can you help a small furniture maker compete with large retailers?',
        a: 'Often through specificity: custom sizes, materials, craftsmanship and local delivery. Large retailers cannot easily match a maker’s story or bespoke options. We cannot promise rankings, but we can help your distinct strengths show up in the right searches. Customer photos, honest descriptions and clear lead times can also help smaller brands stand out.',
      },
    ],
    ctaLabel: 'Get a Free SEO Audit',
    ctaHref: '/seo-audit',
    related: ['ecommerce-seo', 'retail-seo', 'google-business-profile'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'personal-injury-seo',
    path: '/seo-services/personal-injury-seo',
    name: 'Personal Injury SEO',
    title: 'Personal Injury SEO | Reach People Who Need Advice',
    description:
      'SEO for personal injury law firms: case-type pages, careful legal content, local visibility and intake paths built for people searching after an accident.',
    h1: 'Personal injury SEO',
    intro:
      'Personal injury SEO helps a law firm appear when people injured in an accident look for legal advice. It is a high-trust, highly regulated area: searchers are often distressed, content must be accurate, and advertising rules vary by jurisdiction. The work covers case-type pages, local and map visibility, attorney credibility and an intake path that respects the reader.',
    icon: 'gavel',
    category: 'seo',
    hub: 'industry',
    tag: 'Case Intake',
    includes: [
      {
        title: 'Case-type pages',
        body: 'Road accidents, workplace injuries, medical negligence and slips and falls each raise different questions. We write a page for each area you handle, covering how a claim generally works and when to seek advice.',
      },
      {
        title: 'Jurisdiction-aware content',
        body: 'Time limits, procedures and rules differ by country and state. We write for the jurisdictions you practise in, state where information is general, and avoid statements that could be mistaken for advice.',
      },
      {
        title: 'Lawyer credibility pages',
        body: 'Searchers choose a person as much as a firm. We build attorney profiles with qualifications, areas of practice, bar admissions and professional memberships, all verifiable and presented plainly. These pages should be honest about experience, and kept current as your lawyers change.',
      },
      {
        title: 'Local and map visibility',
        body: 'Many searches name a city or a nearby courthouse. We optimize office listings, practice-area categories and location pages, and handle reviews carefully within platform and professional conduct rules. Where practice allows, we also add court, hospital or area references that match real search wording.',
      },
      {
        title: 'Compliant outcomes language',
        body: 'Past results and testimonials are restricted in many places. We help you present them only where permitted and with the required disclaimers, never implying that a similar result is assured.',
      },
      {
        title: 'Intake and contact flow',
        body: 'We review contact forms, call buttons and chat options for clarity, privacy and tone, so someone who has just been hurt can reach you easily and understand what happens after they get in touch.',
      },
    ],
    steps: [
      {
        title: 'Audit practice areas and rules',
        body: 'We review current visibility by case type and location, and note advertising and content rules relevant to your jurisdictions. We also benchmark competing firms for the same case types.',
      },
      {
        title: 'Write responsible content',
        body: 'We draft case-type and guidance pages, ideally with your lawyers reviewing them, to make sure they are accurate and appropriately cautious.',
      },
      {
        title: 'Strengthen trust signals',
        body: 'We refine attorney profiles, office listings and review practice, and tidy technical issues that hold pages back. We also check that sensitive pages load quickly and read well on phones.',
      },
      {
        title: 'Track enquiries',
        body: 'We report calls, forms and chats by source and page, and refine content based on which enquiries become genuine cases.',
      },
    ],
    faq: [
      {
        q: 'Why is personal injury SEO considered difficult?',
        a: 'Many firms compete for the same valuable searches, and search engines hold legal content to a high standard of accuracy and authority. Visibility usually depends on genuine expertise, strong local signals and careful content, rather than quick tactics. Because of this, a long-term, steady approach usually fits better than short campaigns.',
      },
      {
        q: 'Are there rules about how law firms market online?',
        a: 'Yes, in most places. Bar associations and regulators set rules on advertising, testimonials, results and client solicitation, and they differ widely. We write with caution and recommend your compliance adviser reviews pages before they go live. Compliance review also reduces the risk of having to remove content after publication.',
      },
      {
        q: 'Can you promise more cases?',
        a: 'No. Outcomes depend on competition, case quality and many other factors. We aim to improve visibility for relevant searches and the quality of enquiries, and we report calls and contact forms so you can judge what the work is producing.',
      },
      {
        q: 'Should lawyers review the content we produce?',
        a: 'Yes. Legal accuracy matters, and your lawyers know the practical detail. We handle research, structure and writing, then ask for attorney review. Content approved and attributed to a named lawyer also supports credibility with readers. Named authors with real qualifications also help readers and search engines judge reliability.',
      },
      {
        q: 'How do reviews work for law firms?',
        a: 'They influence trust and map visibility, but rules vary on how and whether you may ask for them. We build a process that follows platform policies and professional conduct guidelines, and we help you reply to feedback without disclosing confidential details.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['seo-for-lawyers', 'professional-firms-seo', 'local-seo'],
    guides: [SEO_GUIDES],
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
    related: ['accounting-seo', 'personal-injury-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'agency-seo',
    path: '/seo-services/agency-seo',
    name: 'Agency SEO',
    title: 'Agency SEO | Win Clients for Your Own Agency',
    description:
      'SEO for marketing, design and creative agencies: positioning, service and niche pages, case study structure and lead paths that bring in the right clients.',
    h1: 'Agency SEO',
    intro:
      'Agency SEO is search optimization for your own agency rather than for clients: marketing, design, development and creative studios that need new business. Agencies often neglect their own sites, and prospects check them as proof of ability. The work covers sharper positioning, service and niche pages, case study structure and an enquiry path suited to B2B buyers.',
    icon: 'campaign',
    category: 'seo',
    hub: 'industry',
    tag: 'Agency Growth',
    includes: [
      {
        title: 'Positioning and niche pages',
        body: 'Generalist agencies are hard to find and easy to ignore. We help you pick the services, sectors or platforms you are best at, and build pages that make that focus clear to buyers.',
      },
      {
        title: 'Service pages that explain',
        body: 'Prospects want to know what you do, how you work and what to expect. We write service pages covering scope, process, typical engagement and who it suits, without jargon. We keep the language plain, because prospects often shortlist agencies in minutes.',
      },
      {
        title: 'Case study structure',
        body: 'Your own client work is your strongest proof. We structure case studies around the brief, approach and measurable outcomes you can substantiate, with client permission, so they persuade and are easy to find.',
      },
      {
        title: 'Location and remote visibility',
        body: 'Some buyers want a local agency; others do not mind. We balance city pages and map profiles with clear statements on remote work and the regions or time zones you serve.',
      },
      {
        title: 'Authority and PR',
        body: 'Mentions in industry press, podcasts and events build trust. We help you identify speaking, commentary and partnership opportunities that bring relevant links and reinforce your expertise. Relevant mentions also give your team material to share on its own channels.',
      },
      {
        title: 'Lead capture for B2B',
        body: 'We design contact and brief forms that qualify enquiries, ask about goals and budget range, and set expectations on response time, so you spend time on prospects that fit. Fast replies are important, so we also suggest an internal process for responding.',
      },
    ],
    steps: [
      {
        title: 'Clarify who you want to win',
        body: 'We review your best clients, services and capacity, and decide which segments are worth targeting through search. We also check which competitors already own those searches.',
      },
      {
        title: 'Restructure the site',
        body: 'We rework service, niche and case study pages around that focus and fix technical issues that hold the site back.',
      },
      {
        title: 'Create expert content',
        body: 'We plan articles and resources that show your thinking on topics your buyers research, written with input from your team.',
      },
      {
        title: 'Track qualified leads',
        body: 'We report enquiries by page and source, and look at how many become real conversations with the right buyers. We also feed lead quality back into the content plan.',
      },
    ],
    faq: [
      {
        q: 'Why would an agency need an outside SEO provider?',
        a: 'Client work usually comes first, so the agency’s own site is often left behind. An outside provider brings dedicated time and a fresh view of how buyers see you. Some agencies also prefer independent advice over marking their own homework.',
      },
      {
        q: 'Is this the same as white label SEO?',
        a: 'No. White label SEO is delivery of SEO work for your clients under your brand. Agency SEO is optimization of your own agency website to win new business. Some agencies use both, and we can discuss each separately. Both can complement each other, because your own site helps you win the clients you later serve.',
      },
      {
        q: 'Should we niche down?',
        a: 'Often, yes. A clear specialism is easier to rank for and easier for buyers to trust than a long list of services. We help you test the idea against search demand and your actual strengths before you commit to a new positioning.',
      },
      {
        q: 'How do case studies help search?',
        a: 'They show real work, include the language buyers use to describe problems, and attract links from clients and press. We structure them so that results are specific and verifiable. We never invent numbers and ask you to confirm every claim.',
      },
      {
        q: 'How long does it take to attract clients?',
        a: 'Agency sales cycles are often long, and competition in marketing searches is intense. We cannot promise a timeframe or ranking, but we can show progress in visibility, enquiries and lead quality along the way. Since long cycles delay revenue, we also watch earlier signals such as brand searches and returning visitors.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['white-label-seo', 'seo-reseller', 'professional-firms-seo'],
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
    related: ['startup-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
  {
    slug: 'window-cleaner-seo',
    path: '/seo-services/window-cleaner-seo',
    name: 'Window Cleaner SEO',
    title: 'Window Cleaner SEO | Fill Your Rounds Locally',
    description:
      'SEO for window cleaners: street-level local visibility, round-based service areas, quick quote requests and reviews that build dense, repeat cleaning routes.',
    h1: 'Window cleaner SEO',
    intro:
      'Window cleaner SEO helps a window cleaning business win customers on the streets it already drives through. Profit depends on route density and repeat rounds, so the aim is to attract customers close to existing jobs, then keep them. The work covers street-level local pages, a map profile with the right service areas, quick quotes and a steady stream of reviews.',
    icon: 'location_on',
    category: 'seo',
    hub: 'industry',
    tag: 'Local Rounds',
    includes: [
      {
        title: 'Round-based service areas',
        body: 'Your best new customer lives next door to an existing one. We define service areas around your real rounds and build pages for those neighbourhoods, avoiding wide areas you would not profitably reach.',
      },
      {
        title: 'Domestic and commercial pages',
        body: 'Homeowners want a regular, affordable clean; shops and offices want invoices, insurance and fixed schedules. Separate pages let you speak to each, including conservatories, gutters and frames if you offer them.',
      },
      {
        title: 'High-rise and access work',
        body: 'Rope access, water-fed poles and cherry pickers suit different buildings. If you offer them, we explain methods, safety practice and insurance, which matters to property managers choosing a contractor. Photos of the equipment in use also reassure managers who need to see competence before they appoint anyone.',
      },
      {
        title: 'Quick quote by address',
        body: 'Most jobs can be priced from a property type and photo. We build a short quote form or message option that asks for exactly that, so enquiries convert before the customer asks someone else.',
      },
      {
        title: 'Recurring-customer messaging',
        body: 'Your income depends on repeat work, so we write pages and follow-up wording that explain scheduled cleans, how payment works and how customers can pause or change their round. We also give you wording to explain price changes when your costs change.',
      },
      {
        title: 'Reviews from neighbours',
        body: 'Reviews that name a street or area help your profile for hyperlocal searches and reassure nearby households. We set up a simple request after each clean, and a way to reply properly.',
      },
    ],
    steps: [
      {
        title: 'Map your rounds',
        body: 'We look at where your current customers are, which areas are thin, and where local competitors have strong profiles and reviews.',
      },
      {
        title: 'Set up area and service pages',
        body: 'We build pages for the neighbourhoods you want to fill, along with domestic and commercial services, each with a quick quote route.',
      },
      {
        title: 'Optimize the profile',
        body: 'We refine categories, services, service areas and photos, and begin a regular review request after each completed clean. We also add before-and-after photos with permission.',
      },
      {
        title: 'Review route growth',
        body: 'We track enquiries by area and help you judge whether new customers are filling gaps in your rounds. We also note which streets respond best.',
      },
    ],
    faq: [
      {
        q: 'How is window cleaner SEO different from general cleaning SEO?',
        a: 'Window cleaning is built around routes and repeat visits, so growth depends on dense, local customers rather than occasional large jobs. That changes which areas you target, the pages you build and how you describe regular service to new customers.',
      },
      {
        q: 'Do I need a page for every street?',
        a: 'No. A page for each neighbourhood or town on your rounds, with real local detail, is more useful than hundreds of thin street pages. Reviews and photos that mention specific areas then add hyperlocal signals without cluttering the site. Reviews mentioning streets add useful local context in a natural way.',
      },
      {
        q: 'Can SEO help me win commercial contracts?',
        a: 'It can help managers of shops, offices and housing find you, especially with pages on insurance, safety and scheduled service. Larger contracts may also involve tenders and personal introductions, so SEO usually supports rather than replaces those routes. Pages that mention insurance, method statements and flexible access times answer the first questions managers ask.',
      },
      {
        q: 'Is weather and seasonality a problem?',
        a: 'Demand dips in some months and rises around spring and after storms or building work. We plan content and profile updates for those moments, and keep evergreen pages and reviews working through quieter periods. Weather-related pauses can also be explained in advance, so customers understand when rounds shift.',
      },
      {
        q: 'How soon will I see new customers?',
        a: 'Profile updates and clear pages can start helping within weeks, though dense areas with established competitors take longer. We cannot guarantee positions, but we track calls and quotes by area so you can see where new work comes from. Where possible we also compare those requests with the streets on your existing rounds.',
      },
    ],
    ctaLabel: 'Request a quote',
    ctaHref: SEO_QUOTE,
    related: ['cleaning-company-seo', 'google-business-profile', 'local-seo'],
    guides: [SEO_GUIDES, DIRECTORY_GUIDES],
  },
];
