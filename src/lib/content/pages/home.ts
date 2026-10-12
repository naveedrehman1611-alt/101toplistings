import { definePage, defineSection, image, link, list, text, textarea } from '../schema';

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

export const HOME_PAGE = definePage({
  label: 'Home page',
  path: '/',
  sections: { hero },
});
