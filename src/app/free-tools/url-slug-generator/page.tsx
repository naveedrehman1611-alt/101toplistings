import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { SlugGenerator } from './slug-generator';

export const metadata = toolMetadata(
  'url-slug-generator',
  'Free URL Slug Generator — SEO-Friendly Slugs',
  'Turn titles into clean, SEO-friendly URL slugs. Handles accents, apostrophes, Urdu and other scripts, stop words and length limits. Bulk mode included.',
);

const code = 'rounded bg-surface-container-low px-1 font-mono text-[0.9em]';

export default function Page() {
  return (
    <ToolPage
      slug="url-slug-generator"
      h1="URL Slug Generator"
      intro="Convert any headline, product name or page title into a short, readable, SEO-friendly URL slug. Strip punctuation and emoji, transliterate accents, keep Urdu or Arabic words if you want them, and generate slugs for a whole list at once. It all runs in your browser."
      steps={[
        {
          title: 'Paste your title',
          body: 'Type or paste a headline. Turn on bulk mode to paste many titles, one per line, and get one slug for each.',
        },
        {
          title: 'Adjust the options',
          body: 'Pick a separator, remove stop words, transliterate accents, keep non-Latin scripts, or cap the length at a word boundary.',
        },
        {
          title: 'Copy the slug',
          body: 'Check the character count and the full URL preview, then copy a single slug or copy all of them at once.',
        },
      ]}
      guide={[
        {
          heading: 'What makes a good URL slug',
          body: (
            <>
              <p>
                The slug is the part of a URL that identifies a page, such as{' '}
                <code className={code}>best-restaurants-in-lahore</code>. Good slugs are short,
                lowercase, use hyphens between words and describe the page in a few keywords. People
                see them in search results and shared links, so a readable slug builds trust and can
                improve click-through.
              </p>
              <p>
                Keep the main keyword, drop filler, and avoid dates or numbers that will go stale
                (for example <code className={code}>/seo-checklist</code> ages better than{' '}
                <code className={code}>/seo-checklist-2026</code>
                ). Around 3–6 words, or under about 60 characters, is a practical target.
              </p>
            </>
          ),
        },
        {
          heading: 'Hyphens, not underscores',
          body: (
            <p>
              Google treats a hyphen as a word separator, so <code className={code}>red-shoes</code>{' '}
              reads as “red shoes”. Underscores join words, so{' '}
              <code className={code}>red_shoes</code> may be read as a single term. Use hyphens for
              new URLs; there is no need to change existing underscore URLs only for this reason.
            </p>
          ),
        },
        {
          heading: 'Accents, apostrophes and non-English slugs',
          body: (
            <>
              <p>
                Transliteration turns <code className={code}>Café Crème</code> into{' '}
                <code className={code}>cafe-creme</code> and <code className={code}>Straße</code>{' '}
                into <code className={code}>strasse</code>. Apostrophes are removed rather than
                replaced, so <code className={code}>Google’s</code> becomes{' '}
                <code className={code}>googles</code> instead of the awkward{' '}
                <code className={code}>google-s</code>.
              </p>
              <p>
                Urdu, Arabic, Hindi and other scripts are valid in URLs and Google indexes them
                well. Browsers show them as readable text, though they are percent-encoded when
                copied in some apps. If your audience searches in Urdu, an Urdu slug can be the
                right choice; if links are mostly shared in English contexts, an English slug is
                easier to type and share.
              </p>
            </>
          ),
        },
        {
          heading: 'Changing slugs on live pages',
          body: (
            <p>
              Choose slugs carefully before publishing, because changing one later breaks existing
              links and bookmarks. If you must change a slug, add a 301 redirect from the old URL to
              the new one and update your internal links and sitemap so search engines pass the old
              page’s signals to the new address.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          q: 'What is a URL slug?',
          a: 'It is the readable part of a URL after the domain or folder that identifies a specific page, for example “url-slug-generator” in /free-tools/url-slug-generator. It is usually created from the page title.',
        },
        {
          q: 'How long should a URL slug be?',
          a: 'There is no hard limit, but short slugs are easier to read and share and are less likely to be cut off in search results. Aim for 3–6 meaningful words, roughly 60 characters or less.',
        },
        {
          q: 'Should I remove stop words like “the” and “and”?',
          a: 'Often yes, because they add length without meaning. Keep them when removing them changes the meaning or makes the slug hard to read. This tool never removes stop words if nothing else would be left.',
        },
        {
          q: 'Should I use hyphens or underscores in URLs?',
          a: 'Use hyphens. Google recommends hyphens to separate words in URLs, while underscores can cause words to be read as one term.',
        },
        {
          q: 'Can I use Urdu or Arabic characters in a slug?',
          a: 'Yes. Modern browsers and search engines support Unicode URLs. Turn on “Keep non-Latin scripts” to keep them. They are percent-encoded behind the scenes, so in some places they appear as long %D8%… strings.',
        },
        {
          q: 'Should I include the year in a slug?',
          a: 'Usually not. A year in the URL makes evergreen content look outdated and forces a redirect when you update it. Put the year in the title instead, which you can change without breaking links.',
        },
        {
          q: 'Does changing a slug hurt SEO?',
          a: 'It can temporarily, because the old URL’s links and history must transfer to the new one. Always set up a 301 redirect from the old slug and update internal links to limit the impact.',
        },
        {
          q: 'Is this slug generator free?',
          a: 'Yes, it is free with no sign-up and no limits. Slugs are generated in your browser, so your text is never sent to a server.',
        },
      ]}
    >
      <SlugGenerator />
    </ToolPage>
  );
}
