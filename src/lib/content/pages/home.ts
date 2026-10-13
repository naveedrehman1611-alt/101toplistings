import { definePage, defineSection, icon, image, link, list, text, textarea } from '../schema';

const hero = defineSection({
  label: 'Hero',
  description: 'The navy banner at the top: badge, headline, buttons, search bar and photo.',
  hideable: false,
  fields: {
    badge: text('Badge', 'Business Directory + SEO & Digital Marketing', {
      max: 80,
      hint: 'The pill above the headline. On narrow phones it wraps at " + ".',
    }),
    heading: textarea('Headline', 'List Your Business.\nGet Found Online.', {
      max: 200,
      hint: 'The page H1. Each line is shown on its own line.',
    }),
    highlight: text('Headline, last line (green)', 'Grow With SEO.', {
      max: 80,
      hint: 'Drawn in green under the headline. Leave blank for none.',
    }),
    intro: textarea(
      'Intro text',
      'Discover businesses worldwide, create a powerful business listing, and get SEO & digital marketing services to grow your visibility, traffic, and leads.',
      { max: 400 },
    ),
    primary: link('Main button', { label: 'Add Your Business', href: '/add-business' }),
    secondary: link('Second button', { label: 'Get an SEO Audit', href: '/seo-audit' }),
    search_placeholder: text('Search box placeholder', 'Business name, category or keyword', {
      max: 80,
    }),
    category_all: text('Category menu, "all" option', 'All Categories', { max: 40 }),
    city_all: text('City menu, "all" option', 'All Cities', { max: 40 }),
    search_button: text('Search button', 'Search', { max: 30 }),
    links: list('Links under the search bar', {
      noun: 'link',
      max: 4,
      item: { link: link('Link', { label: '', href: '/' }) },
      default: [
        { link: { label: 'Browse Businesses', href: '/business-directory' } },
        { link: { label: 'Explore SEO Services', href: '/seo-services' } },
      ],
    }),
    photo: image(
      'Photo',
      {
        src: '/images/hero-city.webp',
        alt: 'City skyline at sunset with a laptop showing local SEO growth charts',
      },
      'Shown top right on desktop, faded behind the text on phones. Best at 910×756 or larger in the same shape, with the subject top right. Leave the alt text blank if the photo is purely decorative.',
    ),
  },
});

const stats = defineSection({
  label: 'Stats strip',
  description:
    'The light band under the hero. The numbers are live from the directory; only their labels are edited here.',
  fields: {
    listings_icon: icon('Icon beside the number of businesses', 'handshake'),
    listings_label: text('Label under the number of businesses', 'Active Businesses', { max: 40 }),
    cities_icon: icon('Icon beside the number of cities', 'location_city'),
    cities_label: text('Label under the number of cities', 'Cities Covered', { max: 40 }),
    reviewed_icon: icon('Icon beside "100%"', 'schedule'),
    reviewed_label: text('Label under "100%"', 'Reviewed Listings', {
      max: 40,
      hint: 'Every public listing is approved by staff first, so this figure is always 100%.',
    }),
    rating_label: text('Label under the star rating', 'User Reviews', { max: 40 }),
  },
});

const top_rated = defineSection({
  label: 'Top-rated businesses',
  description:
    'The three highest-rated listings. The cards come from the directory; the heading and the message shown when there are none are edited here.',
  fields: {
    eyebrow: text('Small heading above', 'Curated Recommendations', { max: 60 }),
    heading: text('Heading', 'Top-Rated Businesses in Your Area', { max: 120 }),
    intro: textarea(
      'Intro text',
      'Find trusted local businesses reviewed by real customers in your city and in cities worldwide.',
      { max: 400 },
    ),
    verified_badge: text('Verified badge', 'Live Verified Registry', {
      max: 40,
      hint: 'Shown beside the heading only when at least one card below is verified.',
    }),
    empty_title: text('No businesses yet: title', 'No businesses to show yet', { max: 100 }),
    empty_body: textarea(
      'No businesses yet: text',
      'Published listings appear here as soon as they are approved. Add yours for free and be among the first.',
      { max: 300 },
    ),
    empty_button: link(
      'No businesses yet: button',
      { label: 'Add your business', href: '/add-business' },
      'Leave the text blank to hide the button.',
    ),
    empty_button_icon: icon('No businesses yet: button icon', 'add_business'),
  },
});

const story = defineSection({
  label: 'Directory overview',
  description:
    'The white card with "Find Trusted Local Businesses Worldwide", three highlights and live directory counts.',
  fields: {
    badge_icon: icon('Badge icon', 'hub'),
    badge: text('Badge', 'Global Directory Network', { max: 60 }),
    heading: text('Heading', 'Find Trusted Local Businesses Worldwide', { max: 120 }),
    intro: textarea(
      'Intro text',
      'Local businesses in Pakistan, the UK, the US, the UAE and Europe. Search for what you need where you are, then contact the business directly: we do not sit in between.',
      { max: 500 },
    ),
    highlights: list('Highlights', {
      noun: 'highlight',
      max: 6,
      hint: 'Shown three to a row.',
      item: {
        icon: icon('Icon', 'travel_explore'),
        title: text('Title', '', { max: 80 }),
        body: textarea('Text', '', { max: 300 }),
      },
      default: [
        {
          icon: 'travel_explore',
          title: 'Discover & Compare',
          body: 'Pick a city and a category, then open any listing for its address, opening hours and reviews.',
        },
        {
          icon: 'verified',
          title: 'Verified Profiles',
          body: 'Verified badges mark businesses our team has checked, and anyone can report a listing that is wrong.',
        },
        {
          icon: 'storefront',
          title: 'Free Growth for Owners',
          body: 'Listing a business is free in every country we cover. Owners manage photos, hours and services from their dashboard.',
        },
      ],
    }),
    listings_label: text('Label under the number of listed businesses', 'Listed Businesses', {
      max: 40,
      hint: 'The numbers are live from the directory; a count of zero is left out.',
    }),
    cities_label: text('Label under the number of cities', 'Cities Covered', { max: 40 }),
    verified_label: text('Label under the number of verified businesses', 'Verified Businesses', {
      max: 40,
    }),
    categories_label: text('Label under the number of categories', 'Business Categories', {
      max: 40,
    }),
  },
});

const why_choose = defineSection({
  label: 'Why choose us',
  description: 'Centred cards explaining why to search this directory.',
  fields: {
    eyebrow: text('Small heading above', 'User Experience Advantage', { max: 60 }),
    heading: text('Heading', 'Why Choose {brand} for Local Business Search?', {
      max: 120,
      hint: '{brand} is replaced by the brand name from Settings.',
    }),
    intro: textarea(
      'Intro text',
      "Looking for a business shouldn't mean scrolling through endless results. {brand} sorts listings by category and location for faster, more relevant results.",
      { max: 500 },
    ),
    cards: list('Why choose us cards', {
      noun: 'card',
      max: 9,
      hint: 'Shown three to a row.',
      item: {
        icon: icon('Icon', 'manage_search'),
        title: text('Title', '', { max: 80 }),
        body: textarea('Text', '', { max: 400 }),
      },
      default: [
        {
          icon: 'manage_search',
          title: 'Filter by Location and Service',
          body: "Select the exact service you're looking for along with your city or nearby area. This helps you skip unrelated listings and reach businesses that actually match your needs.",
        },
        {
          icon: 'fact_check',
          title: 'Check Complete Business Info',
          body: 'View contact numbers, categories, addresses, current opening status, photos, and other profile details — all before you decide to reach out.',
        },
        {
          icon: 'contact_phone',
          title: 'Reach Out Directly',
          body: 'Contact the business by phone, visit their website, or check their exact location on the map. No third-party booking or unnecessary steps involved in the process.',
        },
      ],
    }),
  },
});

const cities = defineSection({
  label: 'Browse by city',
  description:
    'City tiles grouped in country tabs. The cities, their counts and photos come from the directory; the text around them is edited here.',
  fields: {
    eyebrow: text('Small heading above', 'Metro Hubs', { max: 60 }),
    heading: text('Heading', 'Browse Businesses by City', { max: 120 }),
    intro: textarea(
      'Intro text',
      'Find local businesses and service providers in top cities across Pakistan, the UK, the USA, the UAE and Europe. Select a city to explore available categories and business listings.',
      { max: 500 },
    ),
    all_tab: text('"All" tab', 'All', { max: 30 }),
    listing_one: text('Count word, one listing', 'Listing', {
      max: 30,
      hint: 'Shown on a tile after its number, as in "1 Listing".',
    }),
    listing_many: text('Count word, several listings', 'Listings', {
      max: 30,
      hint: 'As in "12 Listings".',
    }),
    no_count: text('Tile text when a city has no listings yet', 'Explore businesses', { max: 40 }),
    credit_text: text('Photo credit text', 'City photos:', { max: 60 }),
    credit_link: link(
      'Photo credit link',
      { label: 'Wikimedia Commons', href: 'https://commons.wikimedia.org/' },
      'Opens in a new tab. Leave the text blank to hide the credit line.',
    ),
  },
});

const services = defineSection({
  label: 'Popular services',
  description: 'Linked cards for the categories people search for most.',
  fields: {
    eyebrow: text('Small heading above', 'High-Demand Sectors', { max: 60 }),
    heading: text('Heading', 'Popular Services People Search for Worldwide', { max: 120 }),
    intro: textarea(
      'Intro text',
      'From daily essentials to specialized services, these are the categories people search for most often in cities worldwide.',
      { max: 500 },
    ),
    link_label: text('Link text on every card', 'Explore directory', { max: 40 }),
    cards: list('Service cards', {
      noun: 'card',
      max: 12,
      hint: 'Shown three to a row.',
      item: {
        icon: icon('Icon', 'business_center'),
        title: text('Title', '', { max: 80 }),
        body: textarea('Text', '', { max: 300 }),
        category: text('Category slug', '', {
          max: 80,
          hint: 'The card opens /category/<slug>. Leave blank to use "Link to" instead.',
        }),
        keyword: text('Search word if the category is missing', '', {
          max: 60,
          hint: 'When the directory has no such category, the card searches for this word instead.',
        }),
        href: text('Link to', '', {
          max: 300,
          hint: 'Used only when the category slug is blank: a /path on this site or https://…',
        }),
      },
      default: [
        {
          icon: 'restaurant',
          title: 'Restaurants and Food Services',
          body: 'Find restaurants, cafés, bakeries, fast-food outlets, caterers, home chefs, and other food businesses in your city.',
          category: 'restaurants',
          keyword: 'restaurant',
          href: '',
        },
        {
          icon: 'medical_services',
          title: 'Health and Medical Services',
          body: 'Explore doctors, clinics, dental practices, laboratories, pharmacies, physiotherapists, and other healthcare-related listings.',
          category: 'doctors',
          keyword: 'doctor',
          href: '',
        },
        {
          icon: 'home_repair_service',
          title: 'Home Repair and Maintenance',
          body: 'Find plumbers, electricians, AC technicians, carpenters, painters, and other home service providers near you.',
          category: 'home-services',
          keyword: 'plumber',
          href: '',
        },
        {
          icon: 'school',
          title: 'Education and Training',
          body: 'Discover schools, colleges, tuition centers, language institutes, and training academies for every stage of learning.',
          category: 'schools',
          keyword: 'school',
          href: '',
        },
        {
          icon: 'flight_takeoff',
          title: 'Travel and Accommodation',
          body: 'Compare hotels, guest houses, travel agencies, tour operators, and Umrah and Hajj services for your next trip.',
          category: 'travel-agents',
          keyword: 'travel',
          href: '',
        },
        {
          // A mix of several categories, so it opens the full category index.
          icon: 'business_center',
          title: 'Professional and Business Services',
          body: 'Connect with consultants, designers, recruitment agencies, translators, and other professionals who help businesses grow.',
          category: '',
          keyword: '',
          href: '/business-categories',
        },
      ],
    }),
  },
});

const how_it_works = defineSection({
  label: 'How it works',
  description: 'Numbered steps for people searching the directory.',
  fields: {
    eyebrow: text('Small heading above', 'Step-by-Step Flow', { max: 60 }),
    heading: text('Heading', 'How Does {brand} Work?', { max: 120 }),
    intro: textarea(
      'Intro text',
      '{brand} is a global business directory — helping users search, compare, and connect with local businesses quickly and easily.',
      { max: 500 },
    ),
    steps: list('Steps', {
      noun: 'step',
      max: 6,
      hint: 'Numbered in this order.',
      item: {
        icon: icon('Icon', 'search'),
        title: text('Title', '', { max: 80 }),
        body: textarea('Text', '', { max: 400 }),
      },
      default: [
        {
          icon: 'search',
          title: 'Search & Discover',
          body: "Type in what you're looking for — a restaurant, doctor, lawyer, or any local service. Filter by city, category, or rating to find exactly what you need.",
        },
        {
          icon: 'reviews',
          title: 'Read Reviews & Compare',
          body: 'Browse detailed business profiles with real customer reviews, contact info, and location maps — all in one place. Fast, free, and built for businesses worldwide.',
        },
        {
          icon: 'near_me',
          title: 'Connect & Visit',
          body: 'Call, message, or get directions to the business directly from the listing. No middleman, no hassle — just direct connection.',
        },
      ],
    }),
  },
});

const grow_visibility = defineSection({
  label: 'Grow your visibility (for owners)',
  description:
    'The two-panel card for business owners: why a complete profile matters, and a checklist with a button.',
  fields: {
    eyebrow: text('Small heading above', 'Merchant & Provider Growth', { max: 60 }),
    heading: text('Heading', 'Grow your local visibility with a business listing', { max: 120 }),
    intro: textarea(
      'Intro text',
      'Customers search online before choosing a local service provider. A complete profile helps them find you first.',
      { max: 500 },
    ),
    why_icon: icon('Left panel heading icon', 'visibility'),
    why_heading: text('Left panel heading', 'Why a Complete Profile Matters', { max: 100 }),
    why_body: textarea(
      'Left panel text',
      'Customers increasingly search online before choosing a local service provider. A complete business profile helps potential customers understand what your business offers, where it operates, and how they can contact you.\n\nBusiness owners can use {brand} to present their company name, service category, business description, phone number, address, operating hours, images, website, and other useful details. Accurate and complete information can make a listing more helpful to customers and improve confidence before they make contact.',
      { max: 2000, hint: 'Leave a blank line between paragraphs.' },
    ),
    why_note: text(
      'Left panel footnote',
      'Complete, accurate profiles make it easier for customers to call you directly.',
      {
        max: 200,
        hint: 'The line with the tick at the bottom of the left panel. Leave blank to hide it.',
      },
    ),
    why_note_icon: icon('Left panel footnote icon', 'verified'),
    checklist_icon: icon('Right panel heading icon', 'checklist'),
    checklist_heading: text(
      'Right panel heading',
      'What Should a Complete Business Profile Include?',
      {
        max: 100,
      },
    ),
    checklist: list('Checklist', {
      noun: 'item',
      max: 12,
      item: { text: text('Item', '', { max: 120 }) },
      default: [
        { text: 'Accurate business name and category' },
        { text: 'Original service description' },
        { text: 'Current phone number and address' },
        { text: 'Opening and closing hours' },
        { text: 'Clear business or service images' },
        { text: 'Website and social media details' },
        { text: 'Service areas and available facilities' },
      ],
    }),
    checklist_bullet: icon('Checklist bullet icon', 'check_circle'),
    button: link(
      'Button',
      { label: "Add Your Business — It's Free", href: '/add-business' },
      'Leave the text blank to hide the button.',
    ),
    button_icon: icon('Button icon', 'add_business'),
  },
});

const helping_customers = defineSection({
  label: 'Helping customers',
  description: 'Advice for customers using listings, and a link to report wrong details.',
  fields: {
    badge_icon: icon('Badge icon', 'verified'),
    badge: text('Badge', 'Consumer Protection & Accuracy', { max: 60 }),
    heading: text('Heading', 'Helping Customers Make Better Local Choices', { max: 120 }),
    subheading: textarea(
      'Subheading',
      'Use each listing to compare your options, then confirm the details that matter before you visit or book.',
      { max: 300 },
    ),
    body: textarea(
      'Text',
      'Every profile on {brand} brings together the details people usually look for across several websites: what a business does, where it is, when it is open and how to reach it. Business owners provide and update this information, so it is always worth checking that it is current.\n\nFor medical, financial, legal and other important services, confirm opening hours, prices, qualifications or licences, availability and service terms with the business directly before you visit, book or pay.\n\nIf you notice a phone number, address, opening time or any other detail that is wrong or out of date, let us know through our contact page so we can review and correct the listing.',
      { max: 3000, hint: 'Leave a blank line between paragraphs.' },
    ),
    report_icon: icon('Report bar icon', 'report'),
    report_text: text('Report bar text', 'Spotted an out-of-date number or address?', {
      max: 120,
    }),
    report_link: link(
      'Report bar link',
      { label: 'Report incorrect information', href: '/contact' },
      'Leave the text blank to hide the link.',
    ),
  },
});

const cta_banner = defineSection({
  label: 'Add your business banner',
  description: 'The navy banner in the middle of the page.',
  fields: {
    heading: text('Heading', 'Get Your Business in Front of Thousands', { max: 120 }),
    body: textarea(
      'Text',
      'Create a free profile on {brand} and reach customers worldwide who are already searching for businesses like yours.',
      { max: 400 },
    ),
    button: link(
      'Button',
      { label: "Add Your Business — It's Free", href: '/add-business' },
      'Leave the text blank to hide the button.',
    ),
    button_icon: icon('Button icon', 'rocket_launch'),
  },
});

const faq = defineSection({
  label: 'FAQ',
  description:
    'Questions and answers. They also feed the FAQ data search engines read, so keep answers factual.',
  fields: {
    eyebrow: text('Small heading above', 'Everything You Need To Know', { max: 60 }),
    heading: text('Heading', 'Frequently Asked Questions', { max: 120 }),
    intro: textarea(
      'Intro text',
      'Answers to common questions about finding businesses and listing your business on {brand}.',
      { max: 400 },
    ),
    items: list('Questions', {
      noun: 'question',
      max: 30,
      hint: 'The first answer starts open.',
      item: {
        question: text('Question', '', { max: 200 }),
        answer: textarea('Answer', '', { max: 1500 }),
      },
      default: [
        {
          question: 'What is {brand}?',
          answer:
            '{brand} is a global online business directory. It helps people find local businesses and service providers by category and city, and gives business owners a free way to be found online.',
        },
        {
          question: 'Is {brand} free to use?',
          answer:
            'Yes. Searching the directory, browsing categories and cities, and viewing business profiles is free. You do not need an account to look up a business.',
        },
        {
          question: 'Is {brand} free for business submissions?',
          answer:
            'Yes. Creating an account and submitting your business listing costs nothing. Each new listing is reviewed by our team before it is published.',
        },
        {
          question: 'How can I find a business near me?',
          answer:
            'Use the search bar at the top of the homepage: choose what you are looking for, select your city, and press Search. You can also browse businesses by city or by category.',
        },
        {
          question: 'What information is available on a business listing?',
          answer:
            'A listing can show the business name, category, address, city, phone number, email, website, opening hours, photos, social media links and customer reviews. Each business decides which details to provide, so some profiles are more complete than others.',
        },
        {
          question: 'Which cities does {brand} cover?',
          answer:
            '{brand} lists businesses worldwide, from large cities to smaller towns. You can browse the businesses listed in any city from its city page.',
        },
        {
          question: 'Does {brand} verify every business listing?',
          answer:
            'Every new listing is reviewed by our team before it goes live, and a listing marked as verified has had its details confirmed. Details can still change, so contact the business to confirm prices and availability before you visit.',
        },
        {
          question: 'How should I choose a local service provider?',
          answer:
            'Compare a few businesses in the same category: look at their services, location, opening hours, photos and reviews, then contact your shortlist to ask about prices, experience and availability before you decide.',
        },
        {
          question: 'How can I update my business listing?',
          answer:
            'Sign in and open your dashboard, where you can edit your listing details, opening hours and photos at any time.',
        },
        {
          question: 'How can incorrect business information be reported?',
          answer:
            'Send us a message through the contact page with the business name and the detail that needs correcting. Our team reviews every report and updates the listing.',
        },
        {
          question: 'Can I contact businesses directly?',
          answer:
            'Yes. {brand} does not act as a middleman. Use the phone number, email, website or address on a business profile to contact the business directly.',
        },
      ],
    }),
  },
});

const final_cta = defineSection({
  label: 'Closing call to action',
  description: 'The navy band with a flag icon just above the footer.',
  fields: {
    icon: icon('Icon above the heading', 'flag'),
    heading: text('Heading', 'Submit Your Listing Today!', { max: 120 }),
    body: textarea(
      'Text',
      'List your business on {brand} for free and start reaching customers who are searching for services like yours.',
      { max: 400 },
    ),
    button: link(
      'Button',
      { label: "Add Your Business — It's Free", href: '/add-business' },
      'Leave the text blank to hide the button.',
    ),
    button_icon: icon('Button icon', 'add_circle'),
  },
});

export const HOME_PAGE = definePage({
  label: 'Home page',
  path: '/',
  sections: {
    hero,
    stats,
    top_rated,
    story,
    why_choose,
    cities,
    services,
    how_it_works,
    grow_visibility,
    helping_customers,
    cta_banner,
    faq,
    final_cta,
  },
});
