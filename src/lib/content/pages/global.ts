import {
  definePage,
  defineSection,
  image,
  link,
  list,
  text,
  textarea,
  type PageSpec,
  type SectionValues,
} from '../schema';

/*
 * Site-wide chrome, the sign-in pages and the error pages.
 *
 * The brand name, uploaded logos, menu links, contact details, social links and
 * the footer blurb and copyright stay in Settings and Menus; only copy that was
 * written into the header, footer and floating buttons lives here.
 */

// ---------------------------------------------------------------------------
// Site-wide (every page)
// ---------------------------------------------------------------------------

const header = defineSection({
  label: 'Header',
  description:
    'The bar at the top of every page and the slide-out menu on phones. The menu links themselves are edited in Menus.',
  hideable: false,
  fields: {
    logo: image(
      'Logo',
      { src: '/logo-header.svg', alt: '{brand}' },
      'Shown in the header and at the top of the phone menu. A wide logo about 5:1 works best; SVG or PNG with a transparent background.',
    ),
    home_label: text('"Home" link label', 'Home', {
      max: 30,
      hint: 'Added at the start of the menu unless the menu already links to the home page.',
    }),
    login: link(
      'Sign-in link',
      { label: 'Login', href: '/login' },
      'Shown to signed-out visitors, next to the Add Listing button.',
    ),
    login_suffix: text('Sign-in link, extra text on wide screens', '/ Sign Up', {
      max: 30,
      hint: 'Added after the sign-in label on phones, tablets and wide desktops. Leave blank for none.',
    }),
    mobile_login: text('Phone menu, sign-in button', 'Login / Sign Up', { max: 40 }),
    account_label: text('Phone menu, account button (signed in)', 'Your Account', { max: 40 }),
    add_listing: link('Add Listing button', {
      label: 'Add Listing',
      href: '/dashboard/listings/new',
    }),
    mobile_tools_label: text('Phone menu, free tools heading', 'Free SEO Tools', {
      max: 40,
      hint: 'Used when the menu has no link to the free tools page (that link’s label wins).',
    }),
    mobile_tools_all: link('Phone menu, "view all tools" link', {
      label: 'View all free tools',
      href: '/free-tools',
    }),
  },
});

const services_menu = defineSection({
  label: 'Services menu',
  description:
    'The "SEO Services" drop-down in the header (and its section in the phone menu). The services listed in it come from the service pages.',
  hideable: false,
  fields: {
    label: text('Menu label', 'SEO Services', {
      max: 40,
      hint: 'Used when the menu has no link to the services page (that link’s label wins).',
    }),
    short_label: text('Menu label on smaller laptops', 'Services', { max: 30 }),
    seo_heading: text('First column heading', 'SEO', { max: 40 }),
    links_heading: text('Second column heading', 'Links & Authority', { max: 40 }),
    marketing_heading: text('Third column heading', 'Content & Marketing', { max: 40 }),
    note: text('Note at the bottom', 'Not sure where to start?', { max: 80 }),
    note_link: link('Link after the note', { label: 'Get an SEO audit', href: '/seo-audit' }),
    view_all: link('"View all" link', { label: 'View all SEO services', href: '/seo-services' }),
  },
});

const footerLink = { link: link('Link', { label: '', href: '/' }) };

const footer = defineSection({
  label: 'Footer',
  description:
    'The navy block at the bottom of every page. The blurb, trust line, email, address, social links and copyright name are edited in Settings.',
  hideable: false,
  fields: {
    logo: image(
      'Logo (on navy)',
      { src: '/logo-dark.svg', alt: '{brand}' },
      'A light version of the logo that reads on the dark footer, about 4:1.',
    ),
    whatsapp_label: text('WhatsApp contact line', 'WhatsApp Us', { max: 40 }),
    rights: text('Text after the copyright name', 'All rights reserved.', { max: 80 }),
    privacy: link('Privacy link', { label: 'Privacy Policy', href: '/privacy' }),
    terms: link('Terms link', { label: 'Terms of Service', href: '/terms' }),
    back_to_top: text('"Back to Top" button', 'Back to Top', { max: 30 }),
  },
});

const footer_quick_links = defineSection({
  label: 'Footer: Quick Links column',
  description: 'The first column of links in the footer.',
  fields: {
    heading: text('Column heading', 'Quick Links', { max: 40 }),
    links: list('Links', {
      noun: 'link',
      max: 15,
      item: footerLink,
      default: [
        { link: { label: 'Home', href: '/' } },
        { link: { label: 'All SEO Services', href: '/seo-services' } },
        { link: { label: 'Business Directory', href: '/business-directory' } },
        { link: { label: 'SEO Blog', href: '/blog' } },
        { link: { label: 'About Us', href: '/about' } },
        { link: { label: 'Contact Us', href: '/contact' } },
        { link: { label: 'Free SEO Audit', href: '/seo-audit' } },
        { link: { label: 'SEO Consulting', href: '/seo-services/seo-consulting' } },
        { link: { label: 'Free SEO Tools', href: '/free-tools' } },
      ],
    }),
    whatsapp_label: text('WhatsApp link (last, in green)', 'WhatsApp Us', {
      max: 40,
      hint: 'Opens a WhatsApp chat. Leave blank to leave it out of this column.',
    }),
  },
});

const footer_core_services = defineSection({
  label: 'Footer: Core SEO Services column',
  description: 'The second column of links in the footer.',
  fields: {
    heading: text('Column heading', 'Core SEO Services', { max: 40 }),
    links: list('Links', {
      noun: 'link',
      max: 15,
      item: footerLink,
      default: [
        { link: { label: 'Local SEO Services', href: '/seo-services/local-seo' } },
        { link: { label: 'Technical SEO', href: '/seo-services/technical-seo' } },
        { link: { label: 'Ecommerce SEO', href: '/seo-services/ecommerce-seo' } },
        { link: { label: 'National SEO', href: '/seo-services/national-seo' } },
        { link: { label: 'International SEO', href: '/seo-services/international-seo' } },
        { link: { label: 'Enterprise SEO', href: '/seo-services/enterprise-seo' } },
        { link: { label: 'On-Page SEO', href: '/seo-services/on-page-seo' } },
        { link: { label: 'Off-Page SEO', href: '/seo-services/off-page-seo' } },
        { link: { label: 'Link Building', href: '/seo-services/link-building' } },
        { link: { label: 'Lead Generation SEO', href: '/seo-services/lead-generation-seo' } },
      ],
    }),
  },
});

const footer_ai_services = defineSection({
  label: 'Footer: AI & Platform SEO column',
  description: 'The third column of links in the footer.',
  fields: {
    heading: text('Column heading', 'AI & Platform SEO', { max: 40 }),
    links: list('Links', {
      noun: 'link',
      max: 15,
      item: footerLink,
      default: [
        { link: { label: 'AEO Services', href: '/seo-services/aeo-services' } },
        { link: { label: 'GEO Services', href: '/seo-services/geo-services' } },
        { link: { label: 'AI SEO Services', href: '/seo-services/ai-seo' } },
        { link: { label: 'WordPress SEO', href: '/seo-services/wordpress-seo' } },
        { link: { label: 'Shopify SEO', href: '/seo-services/shopify-seo' } },
        { link: { label: 'WooCommerce SEO', href: '/seo-services/woocommerce-seo' } },
        { link: { label: 'White Label SEO', href: '/seo-services/white-label-seo' } },
        { link: { label: 'GBP / GMB Services', href: '/seo-services/google-business-profile' } },
        { link: { label: 'SEO Migration', href: '/seo-services/seo-migration' } },
        { link: { label: 'Penalty Removal', href: '/seo-services/seo-penalty-removal' } },
      ],
    }),
  },
});

const whatsapp = defineSection({
  label: 'WhatsApp button',
  description:
    'The green chat button in the bottom-right corner of public pages. Hide this section to remove it.',
  fields: {
    message: textarea(
      'Pre-filled message',
      'Hi {brand} team! 👋 I found you through your website and would love to know more about getting my business listed and growing it online. Could you help me out?',
      {
        max: 500,
        hint: 'The text WhatsApp fills in for the visitor to send. {brand} becomes the brand name.',
      },
    ),
    tooltip: text('Tooltip', 'Chat with us on WhatsApp', {
      max: 80,
      hint: 'Shown on hover and read out by screen readers.',
    }),
  },
});

const SITE = definePage({
  label: 'Site-wide: header, footer and buttons',
  path: '/',
  sections: {
    header,
    services_menu,
    footer,
    footer_quick_links,
    footer_core_services,
    footer_ai_services,
    whatsapp,
  },
});

// ---------------------------------------------------------------------------
// Sign-in pages
// ---------------------------------------------------------------------------

const login = defineSection({
  label: 'Sign in page',
  description:
    'The /login page. Error messages come from the sign-in check and are not edited here.',
  hideable: false,
  fields: {
    breadcrumb: text('Breadcrumb', 'Sign in', { max: 40 }),
    heading: text('Heading', 'Sign in', { max: 80 }),
    intro: text('Intro', 'Manage listings, content and settings.', { max: 200 }),
    reset_notice: text(
      'Notice after a password change',
      'Your password has been changed. Sign in with your new password.',
      { max: 200 },
    ),
    email_label: text('Email label', 'Email', { max: 40 }),
    password_label: text('Password label', 'Password', { max: 40 }),
    button: text('Button', 'Sign in', { max: 40 }),
    forgot: link('Forgot password link', {
      label: 'Forgot your password?',
      href: '/forgot-password',
    }),
    register_before: text('Sign-up line, before the link', 'New here?', { max: 80 }),
    register_link: link('Sign-up line, link', { label: 'Create an account', href: '/register' }),
    register_after: text(
      'Sign-up line, after the link',
      'to add your business or write a review.',
      {
        max: 120,
      },
    ),
  },
});

const register = defineSection({
  label: 'Create account page',
  description:
    'The /register page. Error messages come from the sign-up check and are not edited here.',
  hideable: false,
  fields: {
    breadcrumb: text('Breadcrumb', 'Create an account', { max: 40 }),
    heading: text('Heading', 'Create an account', { max: 80 }),
    intro: text('Intro', 'Add your business for free, or review places you have been.', {
      max: 200,
    }),
    sent_notice: textarea(
      'Notice after signing up',
      'Check your inbox — we sent a link to confirm your email address. After confirming, sign in to continue.',
      { max: 400, hint: 'Shown when the account needs its email confirmed first.' },
    ),
    name_label: text('Name label', 'Your name', { max: 40 }),
    email_label: text('Email label', 'Email', { max: 40 }),
    password_label: text('Password label', 'Password', { max: 40 }),
    password_hint: text('Password hint', 'At least 8 characters.', { max: 120 }),
    button: text('Button', 'Create account', { max: 40 }),
    login_before: text('Sign-in line, before the link', 'Already have an account?', { max: 80 }),
    login_link: link('Sign-in line, link', { label: 'Sign in', href: '/login' }),
  },
});

const forgot_password = defineSection({
  label: 'Forgot password page',
  description: 'The /forgot-password page, where people ask for a reset link.',
  hideable: false,
  fields: {
    breadcrumb: text('Breadcrumb', 'Reset your password', { max: 40 }),
    breadcrumb_parent: link('Breadcrumb, middle step', { label: 'Sign in', href: '/login' }),
    heading: text('Heading', 'Reset your password', { max: 80 }),
    intro: textarea(
      'Intro',
      'Enter the email you signed up with and we will send you a link to choose a new password.',
      { max: 300 },
    ),
    sent_notice: textarea(
      'Notice after sending',
      'If an account exists for that email, we have sent a link to reset its password. Open it in this browser — it expires after a short while.',
      { max: 400 },
    ),
    email_label: text('Email label', 'Email', { max: 40 }),
    button: text('Button', 'Send reset link', { max: 40 }),
    login_before: text('Sign-in line, before the link', 'Remembered it?', { max: 80 }),
    login_link: link('Sign-in line, link', { label: 'Sign in', href: '/login' }),
  },
});

const reset_password = defineSection({
  label: 'New password page',
  description: 'The /reset-password page, opened from the link in a reset email.',
  hideable: false,
  fields: {
    breadcrumb: text('Breadcrumb', 'Choose a new password', { max: 40 }),
    heading: text('Heading', 'Choose a new password', { max: 80 }),
    intro: textarea(
      'Intro',
      'Setting a new password for {email}. You will be signed out everywhere and asked to sign in again.',
      { max: 300, hint: '{email} becomes the address of the account being changed.' },
    ),
    email_fallback: text('Used for {email} when the address is unknown', 'your account', {
      max: 40,
    }),
    expired_text: textarea(
      'Message when the link has expired',
      'This page only works from the link in a password reset email, and that link has expired or was opened in a different browser.',
      { max: 400 },
    ),
    expired_link: link('Link after that message', {
      label: 'Request a new reset link',
      href: '/forgot-password',
    }),
    password_label: text('New password label', 'New password', { max: 40 }),
    password_hint: text('Password hint', 'At least 8 characters.', { max: 120 }),
    confirm_label: text('Confirm password label', 'Confirm new password', { max: 40 }),
    button: text('Button', 'Update password', { max: 40 }),
  },
});

const google = defineSection({
  label: 'Google sign-in button',
  description:
    'The "Continue with Google" button and the "or" divider on the sign-in and create account pages. Hide this section to offer email sign-in only.',
  fields: {
    button: text('Button', 'Continue with Google', { max: 40 }),
    divider: text('Divider', 'or', { max: 20 }),
  },
});

const AUTH = definePage({
  label: 'Sign in and account pages',
  path: '/login',
  sections: { login, register, forgot_password, reset_password, google },
});

// ---------------------------------------------------------------------------
// Error pages
// ---------------------------------------------------------------------------

const not_found = defineSection({
  label: 'Page not found (404)',
  description: 'Shown for any address that does not exist.',
  hideable: false,
  fields: {
    eyebrow: text('Small label above the heading', '404', { max: 30 }),
    heading: text('Heading', 'Page not found', { max: 80 }),
    text: textarea(
      'Text',
      'That page does not exist, or it moved. Try a search, or start from the listings.',
      { max: 300 },
    ),
    search_placeholder: text('Search box placeholder', 'Search businesses', { max: 60 }),
    search_button: text('Search button', 'Search', { max: 30 }),
    links: list('Links under the search box', {
      noun: 'link',
      max: 6,
      item: { link: link('Link', { label: '', href: '/' }) },
      default: [
        { link: { label: 'Home', href: '/' } },
        { link: { label: 'All listings', href: '/business-directory' } },
        { link: { label: 'Categories', href: '/business-categories' } },
      ],
    }),
  },
});

const error = defineSection({
  label: 'Something went wrong',
  description: 'Shown when a page fails to load because of a problem on the server.',
  hideable: false,
  fields: {
    eyebrow: text('Small label above the heading', 'Error', { max: 30 }),
    heading: text('Heading', "This page didn't load", { max: 80 }),
    text: textarea(
      'Text',
      'Something went wrong on our side. It is usually temporary, so try again in a moment.',
      { max: 300 },
    ),
    retry: text('"Try again" button', 'Try again', { max: 30 }),
    home: link('Second button', { label: 'Home', href: '/' }),
    reference: text('Label before the error code', 'Reference:', {
      max: 30,
      hint: 'Shown with a code people can quote when they contact you.',
    }),
  },
});

const ERRORS = definePage({
  label: 'Error pages',
  path: '/this-page-does-not-exist',
  sections: { not_found, error },
});

export const GLOBAL_PAGES = {
  site: SITE,
  auth: AUTH,
  errors: ERRORS,
} satisfies Record<string, PageSpec>;

/** Resolved values of one section, for the components that render it. */
type Values<P extends { sections: Record<string, unknown> }> = {
  [S in keyof P['sections']]: SectionValues<P['sections'][S]>;
};
export type SiteContent = Values<typeof SITE>;
export type AuthContent = Values<typeof AUTH>;
export type ErrorsContent = Values<typeof ERRORS>;
