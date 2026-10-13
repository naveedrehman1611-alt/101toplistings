import {
  definePage,
  defineSection,
  icon,
  link,
  list,
  text,
  textarea,
  type PageSpec,
  type SectionValues,
} from '../schema';

/**
 * Fixed copy on the directory and blog pages. Category, city, listing and blog
 * post names and descriptions are data with their own admin sections; only the
 * template copy around them lives here. Where copy names a piece of data, the
 * field takes a placeholder such as {city}, which the page fills in.
 */

const PAGES_HEADER_HINT =
  'If Admin → Pages has a header for this page, its heading and subheading are shown instead.';

// ---------------------------------------------------------------------------
// Shared by every directory page: the filter bar, result counts and cards
// ---------------------------------------------------------------------------

const filters = defineSection({
  label: 'Search and filter bar',
  description:
    'The keyword, category and city filters above the results on the directory, category, city and search pages.',
  hideable: false,
  fields: {
    keyword_placeholder: text('Keyword box placeholder', 'Business name or keyword', { max: 60 }),
    category_all: text('Category menu, "all" option', 'All categories', { max: 40 }),
    city_all: text('City menu, "all" option', 'All cities', { max: 40 }),
    button: text('Filter button', 'Filter', { max: 30 }),
    clear: text('Clear link', 'Clear', { max: 30 }),
    near_me: text('Near me button', 'Near me', { max: 30 }),
    near_me_busy: text('Near me button while locating', 'Finding you…', { max: 40 }),
    near_me_unsupported: text(
      'Near me: browser cannot share location',
      'Your browser cannot share its location. Pick a city instead.',
      { max: 200 },
    ),
    near_me_blocked: text(
      'Near me: location blocked',
      'Location is blocked for this site. Allow it in your browser settings, or pick a city.',
      { max: 200 },
    ),
    near_me_failed: text(
      'Near me: location not found',
      'We could not find your location. Try again, or pick a city.',
      { max: 200 },
    ),
  },
});

const results = defineSection({
  label: 'Result counts, sorting and pages',
  description: 'The count, sort buttons and page links above and below a list of businesses.',
  hideable: false,
  fields: {
    count_one: text('Count, one business', '{count} business', {
      max: 60,
      hint: 'Category, city and search pages. {count} is replaced by the number.',
    }),
    count_many: text('Count, several businesses', '{count} businesses', {
      max: 60,
      hint: '{count} is replaced by the number.',
    }),
    listing_one: text('Directory count noun, one', 'listing', { max: 30 }),
    listing_many: text('Directory count noun, several', 'listings', { max: 30 }),
    showing: text('Directory "showing" line', 'Showing {from}–{to} of {total} {noun}', {
      max: 100,
      hint: 'Business directory page. {from}, {to} and {total} are numbers; {noun} is the word above.',
    }),
    sort_label: text('Sort label', 'Sort:', { max: 30 }),
    sort_featured: text('Sort: featured first', 'Featured first', { max: 30 }),
    sort_nearest: text('Sort: nearest', 'Nearest', { max: 30 }),
    sort_newest: text('Sort: newest', 'Newest', { max: 30 }),
    sort_oldest: text('Sort: oldest', 'Oldest', { max: 30 }),
    sort_rating: text('Sort: highest rated', 'Highest rated', { max: 30 }),
    sort_alphabetical: text('Sort: A to Z', 'A–Z', { max: 30 }),
    previous: text('Previous page link', 'Previous', { max: 30 }),
    next: text('Next page link', 'Next', { max: 30 }),
    page_of: text('Page counter', 'Page {page} of {pages}', {
      max: 60,
      hint: '{page} and {pages} are replaced by numbers.',
    }),
  },
});

const cards = defineSection({
  label: 'Business cards and rows',
  description:
    'Badges and buttons on each business in a result list, and on the similar listings under a listing.',
  hideable: false,
  fields: {
    verified: text('Verified badge (cards)', 'Verified Business', { max: 40 }),
    view_profile: text('View profile button (cards)', 'View Profile', { max: 30 }),
    featured: text('Featured badge (directory rows)', 'Featured', { max: 30 }),
    open_now: text('Open badge (directory rows)', 'Open now', { max: 30 }),
    closed: text('Closed badge (directory rows)', 'Closed', { max: 30 }),
    published: text('Published date (directory rows)', 'Published {date}', {
      max: 60,
      hint: '{date} is replaced by the date the listing went live.',
    }),
    view_details: text('View details button (directory rows)', 'View details', { max: 30 }),
    contact: text('Contact button (directory rows)', 'Contact', { max: 30 }),
  },
});

const DIRECTORY_SHARED = definePage({
  label: 'Directory: filters, results and cards',
  path: '/business-directory',
  sections: { filters, results, cards },
});

// ---------------------------------------------------------------------------
// /business-directory
// ---------------------------------------------------------------------------

const BUSINESS_DIRECTORY = definePage({
  label: 'Business directory',
  path: '/business-directory',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top: eyebrow, heading, intro and figures.',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Business directory', { max: 60 }),
        heading: text('Heading', 'All listings', {
          max: 120,
          hint: `The page H1, also the last breadcrumb. ${PAGES_HEADER_HINT}`,
        }),
        intro: textarea('Intro text', '', { max: 400, hint: 'Leave blank for none.' }),
        stat_listings: text('Figure label: listings', 'Listings', { max: 30 }),
        stat_categories: text('Figure label: categories', 'Categories', { max: 30 }),
        stat_cities: text('Figure label: cities', 'Cities', { max: 30 }),
      },
    }),
    summary: defineSection({
      label: 'Directory at a glance',
      description: 'Figures and the top category and city chips above the first page of results.',
      fields: {
        heading: text('Heading', 'Directory at a glance', { max: 80 }),
        stat_listings: text('Figure label: listings', 'Listings', { max: 30 }),
        stat_featured: text('Figure label: featured', 'Featured', { max: 30 }),
        stat_phone: text('Figure label: with phone', 'With phone', { max: 30 }),
        stat_categories: text('Figure label: categories', 'Categories', { max: 30 }),
        stat_cities: text('Figure label: cities', 'Cities', { max: 30 }),
        top_categories: text('Top categories heading', 'Top categories', { max: 60 }),
        top_cities: text('Top cities heading', 'Top cities', { max: 60 }),
      },
    }),
    empty: defineSection({
      label: 'No results messages',
      description: 'Shown instead of the list when there is nothing to show.',
      hideable: false,
      fields: {
        filtered_title: text('Filters match nothing: title', 'No matches', { max: 80 }),
        filtered_body: text(
          'Filters match nothing: text',
          'Nothing matches these filters. Try another city or category, or clear the filters.',
          { max: 300 },
        ),
        clear_button: text('Filters match nothing: button', 'Clear filters', { max: 30 }),
        empty_title: text('Directory empty: title', 'No listings yet', { max: 80 }),
        empty_body: text('Directory empty: text', 'Nothing has been approved for this view.', {
          max: 300,
        }),
        past_end_title: text('Page number too high: title', 'Nothing on this page', { max: 80 }),
        past_end_body: text(
          'Page number too high: text',
          'The list is shorter than this page number. Start again from the first page.',
          { max: 300 },
        ),
        past_end_button: text('Page number too high: button', 'Go to page 1', { max: 30 }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /business-categories
// ---------------------------------------------------------------------------

const BUSINESS_CATEGORIES = definePage({
  label: 'Business categories',
  path: '/business-categories',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top. The category cards below come from Categories.',
      hideable: false,
      fields: {
        crumb: text('Breadcrumb label', 'Categories', { max: 60 }),
        eyebrow: text('Eyebrow', 'Browse by industry', { max: 60 }),
        heading: text('Heading', 'Business', {
          max: 120,
          hint: `The page H1. ${PAGES_HEADER_HINT}`,
        }),
        highlight: text('Heading, green words', 'categories', {
          max: 60,
          hint: 'Drawn in green after the heading. Leave blank for none.',
        }),
        intro: textarea(
          'Intro text',
          'This business directory by category groups companies by the industry they work in. Pick a category to see the businesses listed under it, or [list your business](/add-business) in the category that fits.',
          { max: 600, hint: 'Links are written [like this](/path).' },
        ),
        stat_categories: text('Figure label: categories', 'Categories', { max: 30 }),
        stat_subcategories: text('Figure label: subcategories', 'Subcategories', { max: 30 }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /locations
// ---------------------------------------------------------------------------

const LOCATIONS = definePage({
  label: 'Locations',
  path: '/locations',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top: heading, intro, figures and buttons.',
      hideable: false,
      fields: {
        crumb: text('Breadcrumb label', 'Locations', { max: 60 }),
        eyebrow: text('Eyebrow', 'Browse by location', { max: 60 }),
        heading: text('Heading', 'Business directory by', { max: 120, hint: 'The page H1.' }),
        highlight: text('Heading, green words', 'location', {
          max: 60,
          hint: 'Drawn in green after the heading. Leave blank for none.',
        }),
        intro: textarea(
          'Intro text',
          'Use this business directory by country and city to find companies near you or in the market you are researching. Choose a city to see the businesses listed there.',
          { max: 500 },
        ),
        stat_country: text('Figure label: one country', 'Country', { max: 30 }),
        stat_countries: text('Figure label: several countries', 'Countries', { max: 30 }),
        stat_city: text('Figure label: one city', 'City', { max: 30 }),
        stat_cities: text('Figure label: several cities', 'Cities', { max: 30 }),
        primary: link('Main button', { label: 'List your business', href: '/add-business' }),
        secondary: link('Second button', {
          label: 'Browse all businesses',
          href: '/business-directory',
        }),
      },
    }),
    countries: defineSection({
      label: 'Country lists',
      description:
        'One heading per country with its cities. Countries and cities come from Cities.',
      hideable: false,
      fields: {
        heading: text('Country heading', 'Business directory in {country}', {
          max: 100,
          hint: '{country} is replaced by the country name.',
        }),
        listing_one: text('City count, one', '{count} listing', {
          max: 40,
          hint: '{count} is replaced by the number.',
        }),
        listing_many: text('City count, several', '{count} listings', { max: 40 }),
      },
    }),
    empty: defineSection({
      label: 'No locations message',
      description: 'Shown when no cities have been added yet.',
      hideable: false,
      fields: {
        title: text('Title', 'No locations yet', { max: 80 }),
        body: text('Text', 'Cities will appear here once they are added to the directory.', {
          max: 300,
        }),
        button: link('Button', { label: 'Browse businesses', href: '/business-directory' }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /category/[slug] and /city/[slug] templates
// ---------------------------------------------------------------------------

const CATEGORY_PAGE = definePage({
  label: 'Category pages (template)',
  path: '/category/food-restaurant',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description:
        'Copy shared by every category page. The heading and description are the category’s own (Admin → Categories).',
      hideable: false,
      fields: {
        crumb: text('Breadcrumb: categories', 'Categories', {
          max: 60,
          hint: 'Links to the business categories page.',
        }),
        eyebrow: text('Eyebrow', 'Business category', { max: 60 }),
        stat_listings: text('Figure label: listings', 'Listings', { max: 30 }),
        stat_subcategories: text('Figure label: subcategories', 'Subcategories', { max: 30 }),
      },
    }),
    empty: defineSection({
      label: 'No results messages',
      description:
        'Shown when a category has no businesses. {category} is the category name in lower case; {city} is the chosen city.',
      hideable: false,
      fields: {
        empty_title: text('Category empty: title', 'No {category} listed yet', { max: 100 }),
        empty_body: text(
          'Category empty: text',
          'Nothing has been approved in this category so far.',
          { max: 300 },
        ),
        filtered_title: text('Filters match nothing: title', 'No {category} match', { max: 100 }),
        city_body: text(
          'City filter matches nothing: text',
          'Nothing in {city} yet. Try another city or clear the filters.',
          { max: 300 },
        ),
        search_body: text(
          'Keyword matches nothing: text',
          'Nothing matches that search. Try a shorter keyword.',
          { max: 300 },
        ),
      },
    }),
  },
});

const CITY_PAGE = definePage({
  label: 'City pages (template)',
  path: '/city/lahore',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description:
        'Copy shared by every city page. The intro under the heading is the city’s own (Admin → Cities).',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Local business directory', { max: 60 }),
        heading: text('Heading', 'Businesses in {city}', {
          max: 120,
          hint: 'The page H1. {city} is replaced by the city name, drawn in green.',
        }),
        stat_listings: text('Figure label: listings', 'Listings', { max: 30 }),
      },
    }),
    empty: defineSection({
      label: 'No results messages',
      description: 'Shown when a city has no businesses. {city} is replaced by the city name.',
      hideable: false,
      fields: {
        empty_title: text('City empty: title', 'Nothing listed in {city} yet', { max: 100 }),
        empty_body: text('City empty: text', 'Be the first to add a business here.', {
          max: 300,
        }),
        filtered_title: text('Filters match nothing: title', 'No matches', { max: 100 }),
        filtered_body: text(
          'Filters match nothing: text',
          'Nothing in {city} matches these filters. Try another category or clear them.',
          { max: 300 },
        ),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /search
// ---------------------------------------------------------------------------

const SEARCH = definePage({
  label: 'Search results',
  path: '/search',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description:
        'The heading changes with the search. {query}, {category}, {city} and {km} are filled in from it.',
      hideable: false,
      fields: {
        crumb: text('Breadcrumb label', 'Search', { max: 60 }),
        eyebrow: text('Eyebrow', 'Search the directory', { max: 60 }),
        heading: text('Heading before a search', 'Search', { max: 120 }),
        results_heading: text('Heading for a keyword', 'Results for “{query}”', { max: 120 }),
        in_city: text('City part of the heading', 'in {city}', { max: 60 }),
        within: text('Distance part of the heading', 'within {km} km of you', { max: 60 }),
        near_heading: text('Heading for Near me', '{category} near you', {
          max: 120,
          hint: '{category} is the chosen category, or the word below when none is chosen.',
        }),
        near_any: text('Near me heading, no category', 'Businesses', { max: 60 }),
      },
    }),
    distance: defineSection({
      label: 'Distance choices',
      description: 'The distance links shown after a Near me search.',
      hideable: false,
      fields: {
        label: text('Label', 'Distance:', { max: 30 }),
        option: text('Each choice', '{km} km', { max: 30, hint: '{km} is the distance.' }),
      },
    }),
    empty: defineSection({
      label: 'Prompt and no results messages',
      hideable: false,
      fields: {
        prompt: text(
          'Before a search',
          "Type a keyword, pick a category or city, or press Near me to see what's close by.",
          { max: 300 },
        ),
        title: text('Nothing matched: title', 'No matches', { max: 80 }),
        body: text(
          'Nothing matched: text',
          'Nothing matched. Try a shorter keyword, another city, or clear a filter.',
          { max: 300 },
        ),
        nearby_title: text('Nothing nearby: title', 'Nothing nearby yet', { max: 80 }),
        nearby_body: text(
          'Nothing nearby: text',
          'Nothing within {km} km of you matches. Try a wider distance, or browse by city.',
          { max: 300, hint: '{km} is the chosen distance.' },
        ),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// /listing/[slug] and its claim, report and review pages
// ---------------------------------------------------------------------------

const NAME_HINT = '{name} is replaced by the business name.';
const SIGNIN_HINT =
  '{signin} and {register} become the two links below; leave them in so visitors can sign in.';

const LISTING_PAGE = definePage({
  label: 'Listing pages (template)',
  path: '/business-directory',
  sections: {
    actions: defineSection({
      label: 'Badges and buttons under the cover',
      description:
        'Labels shared by every listing page. Names, photos and details are the listing’s own.',
      hideable: false,
      fields: {
        featured: text('Featured badge', 'Featured', { max: 30 }),
        verified: text('Verified badge', 'Verified', { max: 30 }),
        share: text('Share button', 'Share', { max: 30 }),
        copy_link: text('Share menu: copy link', 'Copy link', { max: 30 }),
        email: text('Share menu: email', 'Email', { max: 30 }),
        save: text('Save button', 'Save', { max: 30 }),
        saved: text('Save button, once saved', 'Saved', { max: 30 }),
        review: text('Review button', 'Submit Review', { max: 30 }),
        copied: text('Link copied note', 'Link copied', { max: 60 }),
        copy_failed: text(
          'Copy failed note',
          'Could not copy the link. Copy it from the address bar instead.',
          { max: 200 },
        ),
      },
    }),
    description: defineSection({
      label: 'Description',
      hideable: false,
      fields: {
        heading: text('Heading', 'Description', { max: 60 }),
        show_more: text('Show more button', 'Show more', { max: 30 }),
        show_less: text('Show less button', 'Show less', { max: 30 }),
      },
    }),
    reviews: defineSection({
      label: 'Reviews',
      description: `Headings around the reviews. ${NAME_HINT} {count} is the number of reviews.`,
      hideable: false,
      fields: {
        first_heading: text('Heading with no reviews', 'Be the first to review “{name}”', {
          max: 120,
        }),
        heading_one: text('Heading, one review', '{count} review for “{name}”', { max: 120 }),
        heading_many: text('Heading, several reviews', '{count} reviews for “{name}”', {
          max: 120,
        }),
        overall: text('Overall rating label', 'Overall rating', { max: 60 }),
        showing_recent: text('Only the latest shown', 'Showing the {count} most recent.', {
          max: 120,
        }),
        anonymous: text('Name for a reviewer without one', 'Visitor', { max: 40 }),
        reply_heading: text('Business reply label', 'Reply from the business', { max: 60 }),
        add_heading: text('Add a review heading', 'Add a review', { max: 60 }),
      },
    }),
    review_form: defineSection({
      label: 'Review form',
      description: 'On the listing page and on its "Write a review" page.',
      hideable: false,
      fields: {
        rating: text('Overall rating label', 'Overall rating', { max: 60 }),
        details: text('Detail ratings label', 'Rate the details', { max: 60 }),
        optional: text('"Optional" marker', '(optional)', { max: 30 }),
        title: text('Title label', 'Title', { max: 60 }),
        body: text('Review label', 'Your review', { max: 60 }),
        note: text(
          'Note above the button',
          'Reviews are posted from your RankYouSite account and checked before they appear.',
          { max: 300 },
        ),
        submit: text('Submit button', 'Submit Review', { max: 30 }),
        submitting: text('Submit button while sending', 'Submitting…', { max: 30 }),
        clear: text('Clear rating button', 'Clear', { max: 30 }),
        signin: text(
          'Sign-in prompt',
          '{signin} or {register} — you will come straight back to the reviews.',
          {
            max: 300,
            hint: `Shown when a visitor who is not signed in submits. ${SIGNIN_HINT}`,
          },
        ),
        signin_link: text('Sign-in link', 'Sign in', { max: 40 }),
        register_link: text('Create account link', 'create an account', { max: 40 }),
      },
    }),
    gallery: defineSection({
      label: 'Gallery',
      hideable: false,
      fields: {
        heading: text('Heading', 'Gallery', { max: 60 }),
        count_one: text('Photo count, one', '({count} photo)', { max: 40 }),
        count_many: text('Photo count, several', '({count} photos)', {
          max: 40,
          hint: '{count} is replaced by the number of photos.',
        }),
      },
    }),
    information: defineSection({
      label: 'Information box',
      description: 'Map, address and contact details in the sidebar.',
      hideable: false,
      fields: {
        heading: text('Heading', 'Information', { max: 60 }),
        larger_map: text('Map link', 'View larger map', { max: 40 }),
        directions: text('Directions link', 'Get Direction', { max: 40 }),
      },
    }),
    hours: defineSection({
      label: 'Opening hours box',
      hideable: false,
      fields: {
        heading: text('Heading', 'Hours', { max: 60 }),
        open_now: text('Open badge', 'Open now', {
          max: 30,
          hint: 'Also on the similar listings cards.',
        }),
        closed_now: text('Closed badge', 'Closed now', { max: 30 }),
        note: text('Note under the table', 'Times are local (Pakistan time).', { max: 200 }),
      },
    }),
    categories: defineSection({
      label: 'Categories box',
      fields: { heading: text('Heading', 'Categories', { max: 60 }) },
    }),
    author: defineSection({
      label: 'Author box',
      description: 'The business card in the sidebar with the claim and report links.',
      fields: {
        heading: text('Heading', 'Author', { max: 60 }),
        verified: text('Verified line', 'Verified business', { max: 60 }),
        claim_prompt: text('Claim prompt', 'Own this business?', { max: 80 }),
        claim_link: text('Claim link', 'Claim it for free', { max: 60 }),
        contact: text('Contact button', 'Contact Author', { max: 40 }),
        report: text('Report link', 'Report a problem with this listing', { max: 80 }),
      },
    }),
    contact: defineSection({
      label: 'Contact form',
      description: `The private message form in the sidebar. ${NAME_HINT}`,
      hideable: false,
      fields: {
        heading: text('Heading', 'Contact Author', { max: 60 }),
        subheading: text('Subheading', 'Send message to “{name}”', { max: 120 }),
        name: text('Name label', 'Name', { max: 40 }),
        email: text('Email label', 'Email', { max: 40 }),
        phone: text('Phone label', 'Phone (optional)', { max: 40 }),
        message: text('Message label', 'Message', { max: 40 }),
        consent: text(
          'Consent checkbox',
          'I agree to share these details with {name} so they can reply.',
          { max: 200 },
        ),
        submit: text('Send button', 'Send Private Message', { max: 40 }),
        sending: text('Send button while sending', 'Sending…', { max: 30 }),
      },
    }),
    similar: defineSection({
      label: 'Similar listings',
      fields: { heading: text('Heading', 'Similar Listings', { max: 80 }) },
    }),
    cta: defineSection({
      label: 'Submit your listing banner',
      description: 'The navy banner at the foot of every listing page.',
      fields: {
        heading: text('Heading', 'Submit Your Listing Today!', { max: 100 }),
        body: textarea(
          'Text',
          'Add your business to {brand} and get found by customers searching in your city, wherever you are in the world.',
          { max: 400 },
        ),
        primary: link('Main button', { label: 'Add Listing', href: '/add-business' }),
        primary_icon: icon('Main button icon', 'add_circle', 'Shown before the label.'),
        secondary: link('Second button', { label: 'Browse listings', href: '/business-directory' }),
        secondary_icon: icon('Second button icon', 'arrow_forward', 'Shown after the label.'),
      },
    }),
    claim: defineSection({
      label: 'Claim this business page',
      description: `The /listing/…/claim page. ${NAME_HINT}`,
      hideable: false,
      fields: {
        crumb: text('Breadcrumb label', 'Claim this business', { max: 60 }),
        heading: text('Heading', 'Claim {name}', { max: 120 }),
        intro: textarea(
          'Intro text',
          "Own or manage this business? Claim it to update its details, photos and opening hours and reply to reviews. It's free. We check every claim before handing over control.",
          { max: 500 },
        ),
        sent: text(
          'After sending',
          "Thanks — your claim was received. We'll contact you to verify it, usually within a couple of days.",
          { max: 300 },
        ),
        back: text('Back link', '← Back to {name}', { max: 80 }),
        owns: text('Already the manager', 'You already manage this business.', { max: 200 }),
        dashboard: link('Dashboard link', { label: 'Go to your dashboard →', href: '/dashboard' }),
        pending: text(
          'Claim already sent',
          'You have already claimed this business. We will be in touch once we have checked it.',
          { max: 300 },
        ),
        resolved: text(
          'Claim already reviewed',
          'We have reviewed your claim for this business. If you think we got it wrong, please contact us.',
          { max: 300 },
        ),
        signin: text(
          'Sign-in prompt',
          'Please {signin} or {register} to claim this business. The account becomes the one that manages the listing.',
          { max: 300, hint: SIGNIN_HINT },
        ),
        signin_link: text('Sign-in link', 'sign in', { max: 40 }),
        register_link: text('Create account link', 'create an account', { max: 40 }),
        role: text('Role label', 'Your role at the business', { max: 60 }),
        role_placeholder: text('Role menu prompt', 'Choose one', { max: 40 }),
        roles: list('Roles to choose from', {
          noun: 'role',
          max: 10,
          hint: 'The chosen role is sent with the claim.',
          item: { label: text('Role', '', { max: 80 }) },
          default: [
            { label: 'Owner' },
            { label: 'Manager' },
            { label: 'Employee' },
            { label: 'Marketing agency' },
          ],
        }),
        phone: text('Phone label', 'Phone number', { max: 60 }),
        phone_hint: text(
          'Phone help text',
          'Ideally the business number shown on the listing, so we can confirm quickly.',
          { max: 200 },
        ),
        proof: text('Proof label', 'Link to proof (optional)', { max: 60 }),
        proof_hint: text(
          'Proof help text',
          'Your business website, Facebook page or Google profile that names you.',
          { max: 200 },
        ),
        message: text('Message label', 'Anything else? (optional)', { max: 60 }),
        submit: text('Submit button', 'Submit claim', { max: 30 }),
      },
    }),
    report: defineSection({
      label: 'Report a problem page',
      description: `The /listing/…/report page. ${NAME_HINT}`,
      hideable: false,
      fields: {
        heading: text('Heading', 'Report a problem', { max: 100, hint: 'Also the breadcrumb.' }),
        intro: text(
          'Intro text',
          'Something wrong with {name}? Let us know and our team will look into it.',
          { max: 300, hint: `${NAME_HINT} It is shown in bold.` },
        ),
        sent: text('After sending', "Thanks — we've received your report and will check it.", {
          max: 300,
        }),
        back: text('Back link', '← Back to {name}', { max: 80 }),
        reason: text('Reason question', "What's wrong?", { max: 60 }),
        details: text('Details label', 'Details', { max: 60 }),
        details_placeholder: text(
          'Details placeholder',
          'For example, the correct phone number or address.',
          { max: 120 },
        ),
        email: text('Email label', 'Your email (optional)', { max: 60 }),
        email_hint: text('Email help text', "Only if you'd like us to follow up with you.", {
          max: 200,
        }),
        submit: text('Submit button', 'Send report', { max: 30 }),
      },
    }),
    review_page: defineSection({
      label: 'Write a review page',
      description: `The /listing/…/review page. ${NAME_HINT}`,
      hideable: false,
      fields: {
        crumb: text('Breadcrumb label', 'Write a review', { max: 60 }),
        heading: text('Heading', 'Review {name}', { max: 120 }),
        signin: text(
          'Sign-in prompt',
          'Please {signin} or {register} to write a review. One review per person, per business.',
          { max: 300, hint: SIGNIN_HINT },
        ),
        signin_link: text('Sign-in link', 'sign in', { max: 40 }),
        register_link: text('Create account link', 'create an account', { max: 40 }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

const BLOG = definePage({
  label: 'Blog',
  path: '/blog',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top. The guide hub links come from Blog guide hubs.',
      hideable: false,
      fields: {
        eyebrow: text('Eyebrow', 'Guides & insights', { max: 60 }),
        heading: text('Heading', 'Blog', {
          max: 120,
          hint: `The page H1, also the last breadcrumb. ${PAGES_HEADER_HINT}`,
        }),
        intro: textarea('Intro text', '', { max: 400, hint: 'Leave blank for none.' }),
        stat_article: text('Figure label: one article', 'Article', { max: 30 }),
        stat_articles: text('Figure label: several articles', 'Articles', { max: 30 }),
        stat_hubs: text('Figure label: guide hubs', 'Guide Hubs', { max: 30 }),
      },
    }),
    posts: defineSection({
      label: 'Article list',
      hideable: false,
      fields: {
        read_time: text('Reading time', '{minutes} min read', {
          max: 40,
          hint: '{minutes} is replaced by the article’s reading time.',
        }),
        empty_title: text('No articles: title', 'No articles yet', { max: 80 }),
        empty_body: text('No articles: text', 'Nothing has been published so far.', { max: 300 }),
      },
    }),
  },
});

function cluster(
  label: string,
  path: string,
  d: {
    name: string;
    heading: string;
    intro: string;
    cta: { label: string; href: string };
    links: { label: string; href: string }[];
  },
) {
  return defineSection({
    label,
    description: `The ${path} hub. Its articles are the blog posts in the matching blog category.`,
    hideable: false,
    fields: {
      name: text('Name', d.name, {
        max: 60,
        hint: 'The breadcrumb, and the link to this hub on the blog page.',
      }),
      heading: text('Heading', d.heading, { max: 120, hint: 'The page H1.' }),
      intro: textarea('Intro text', d.intro, { max: 800 }),
      links: list('Related services', {
        noun: 'link',
        max: 8,
        hint: 'Remove every link to hide the related services block.',
        item: { link: link('Link', { label: '', href: '/' }) },
        default: d.links.map((l) => ({ link: l })),
      }),
      cta: link('Button', d.cta, 'Leave the label blank to hide the button.'),
    },
  });
}

const BLOG_CLUSTERS = definePage({
  label: 'Blog guide hubs',
  path: '/blog/seo',
  sections: {
    shared: defineSection({
      label: 'Copy shared by every hub',
      hideable: false,
      fields: {
        blog_crumb: text('Breadcrumb: blog', 'Blog', { max: 60 }),
        eyebrow: text('Eyebrow', 'Guide hub', { max: 60 }),
        stat_guide: text('Figure label: one guide', 'Guide', { max: 30 }),
        stat_guides: text('Figure label: several guides', 'Guides', { max: 30 }),
        read_time: text('Reading time', '{minutes} min read', {
          max: 40,
          hint: '{minutes} is replaced by the article’s reading time.',
        }),
        empty_title: text('No guides: title', 'Guides coming soon', { max: 80 }),
        empty_body: text(
          'No guides: text',
          'No guides are published here yet. Check back soon, or browse the rest of the blog.',
          { max: 300 },
        ),
        empty_link: link('No guides: link', { label: 'Browse all articles', href: '/blog' }),
        related_heading: text('Related services heading', 'Related services', { max: 80 }),
      },
    }),
    business_directory: cluster('Business directory guides', '/blog/business-directory', {
      name: 'Business directory guides',
      heading: 'Business directory guides',
      intro:
        'A business directory is an online listing site where companies are organised by category and location, so customers can find them and compare options. These guides explain how business listings and directory citations help your business get found online, and how to set yours up properly.',
      cta: { label: 'Add Business', href: '/add-business' },
      links: [
        { label: 'Add your business', href: '/add-business' },
        { label: 'Browse the business directory', href: '/business-directory' },
        { label: 'Claim your business listing', href: '/claim-business' },
        { label: 'Local SEO services', href: '/seo-services/local-seo' },
      ],
    }),
    seo: cluster('SEO guides', '/blog/seo', {
      name: 'SEO guides',
      heading: 'SEO guides',
      intro:
        'SEO (search engine optimisation) is the work of making a website easier for search engines to understand and more worth recommending, so it earns more organic traffic. These guides cover how to rank a website, from technical and on-page fixes to local citations, backlinks and guest posting.',
      cta: { label: 'Get SEO Help', href: '/seo-services' },
      links: [
        { label: 'SEO services', href: '/seo-services' },
        { label: 'Free SEO audit', href: '/seo-audit' },
        { label: 'Link building services', href: '/seo-services/link-building' },
        { label: 'Local SEO services', href: '/seo-services/local-seo' },
      ],
    }),
    digital_marketing: cluster('Digital marketing guides', '/blog/digital-marketing', {
      name: 'Digital marketing guides',
      heading: 'Digital marketing guides',
      intro:
        'Digital marketing is how a business earns attention and customers online, through search, content, local listings and outreach. These guides show how the channels fit together so you can decide where to spend your time first.',
      cta: { label: 'Contact', href: '/contact?subject=Digital%20marketing' },
      links: [
        { label: 'Digital marketing services', href: '/digital-marketing' },
        { label: 'SEO services', href: '/seo-services' },
        { label: 'Content marketing services', href: '/seo-services/content-marketing' },
      ],
    }),
  },
});

const BLOG_POST = definePage({
  label: 'Blog posts (template)',
  path: '/blog',
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'Copy shared by every post. Titles and text are the post’s own (Admin → Blog).',
      hideable: false,
      fields: {
        blog_crumb: text('Breadcrumb: blog', 'Blog', { max: 60 }),
        eyebrow: text('Eyebrow', 'From the blog', { max: 60 }),
        read_time: text('Reading time', '{minutes} min read', {
          max: 40,
          hint: '{minutes} is replaced by the post’s reading time.',
        }),
      },
    }),
    footer: defineSection({
      label: 'Line under the post',
      fields: {
        text: text(
          'Text',
          '[Need help with SEO?](/seo-services) or [list your business](/add-business).',
          { max: 300, hint: 'Links are written [like this](/path).' },
        ),
      },
    }),
    related: defineSection({
      label: 'Related articles',
      description: 'Up to three other posts, listed under the post.',
      fields: { heading: text('Heading', 'Related articles', { max: 80 }) },
    }),
  },
});

export const DIRECTORY_PAGES = {
  directory_shared: DIRECTORY_SHARED,
  business_directory: BUSINESS_DIRECTORY,
  business_categories: BUSINESS_CATEGORIES,
  locations: LOCATIONS,
  category_page: CATEGORY_PAGE,
  city_page: CITY_PAGE,
  search: SEARCH,
  listing_page: LISTING_PAGE,
  blog: BLOG,
  blog_clusters: BLOG_CLUSTERS,
  blog_post: BLOG_POST,
} satisfies Record<string, PageSpec>;

// Section value types for the components that render them.
type Sections<P extends keyof typeof DIRECTORY_PAGES> = (typeof DIRECTORY_PAGES)[P]['sections'];
export type FiltersContent = SectionValues<Sections<'directory_shared'>['filters']>;
export type ResultsContent = SectionValues<Sections<'directory_shared'>['results']>;
export type CardsContent = SectionValues<Sections<'directory_shared'>['cards']>;
export type ListingContent = {
  [S in keyof Sections<'listing_page'>]: SectionValues<Sections<'listing_page'>[S]>;
};
export type BlogClusterContent = SectionValues<Sections<'blog_clusters'>['seo']>;
export type BlogClusterSharedContent = SectionValues<Sections<'blog_clusters'>['shared']>;
