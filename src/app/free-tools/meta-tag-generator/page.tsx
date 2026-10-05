import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { MetaTagGenerator } from './meta-tag-generator';

export const metadata = toolMetadata(
  'meta-tag-generator',
  'Meta Tag Generator & Google SERP Preview (Free)',
  'Write SEO titles and meta descriptions with a live Google preview, pixel-width counters and ready-to-paste meta, Open Graph and Twitter tags.',
);

export default function Page() {
  return (
    <ToolPage
      slug="meta-tag-generator"
      h1="Meta Tag Generator & SERP Preview"
      intro="See exactly how your page could look in Google before you publish. Type a title and meta description to get a live desktop and mobile preview measured in pixels, a social share card, and clean meta, Open Graph and Twitter tags ready to paste."
      steps={[
        {
          title: 'Enter your page details',
          body: 'Add the title, meta description and page URL. Optionally set robots rules, a canonical URL, a share image and the page language.',
        },
        {
          title: 'Tune it with the live preview',
          body: 'Watch the Google result update as you type. The counters turn amber or red when a title or description is likely to be cut off.',
        },
        {
          title: 'Copy the HTML',
          body: 'Copy the generated tags into your page’s <head>, or into your CMS or SEO plugin fields. Values are escaped and empty fields are skipped.',
        },
      ]}
      guide={[
        {
          heading: 'Why Google truncates by pixels, not characters',
          body: (
            <>
              <p>
                Google does not cut titles at a fixed number of characters. It cuts them when they
                run out of horizontal space, which on desktop is roughly 600 pixels of 20px Arial. A
                title full of wide letters such as “W” and “M” fits fewer characters than one full
                of narrow letters like “i” and “l”, which is why a 55-character title can be
                truncated while a 65-character one is shown in full.
              </p>
              <p>
                This tool measures your text with the browser’s own font engine, the same way the
                result page does, so the preview is a close match. Treat 30–60 characters as a guide
                and the pixel meter as the real limit. Descriptions are measured the same way, with
                roughly 920 pixels on desktop and less on mobile.
              </p>
            </>
          ),
        },
        {
          heading: 'How to write a title tag that earns clicks',
          body: (
            <>
              <p>
                Lead with the words people search for, then add what makes you the better choice: a
                location, a price, a guarantee or a year. Keep the brand at the end, separated by a
                pipe or dash, unless your brand is what people search for.
              </p>
              <p>
                Every page should have a unique title. Duplicate titles across service or city pages
                make it hard for Google to choose which page to show, and Google is more likely to
                rewrite titles that are vague, stuffed with keywords or much longer than the space
                available.
              </p>
            </>
          ),
        },
        {
          heading: 'Meta descriptions: not a ranking factor, still important',
          body: (
            <>
              <p>
                The meta description does not directly affect rankings, but it is often the text
                under your title in the results, so it shapes whether people click. Summarise what
                the page offers, include the main phrase (Google bolds matching words) and end with
                a reason to click, such as “Free quote in 24 hours”.
              </p>
              <p>
                Google rewrites descriptions when it thinks another passage from the page answers
                the search better. A specific, accurate description that matches the page content is
                the best way to have yours used.
              </p>
            </>
          ),
        },
        {
          heading: 'Robots, canonical and social tags explained',
          body: (
            <>
              <p>
                <strong>Robots</strong> controls indexing. Pages are indexed and their links
                followed by default, so the tag is only added here when you choose noindex or
                nofollow. <strong>Canonical</strong> tells search engines which URL is the main
                version when the same content is reachable at several addresses, for example with
                tracking parameters.
              </p>
              <p>
                <strong>Open Graph</strong> tags control the title, description and image shown when
                the page is shared on Facebook, LinkedIn and WhatsApp, and{' '}
                <strong>Twitter card</strong> tags do the same on X. A 1200×630 pixel image works
                well across all of them.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          q: 'How long should a title tag be?',
          a: 'Aim for about 30–60 characters and under roughly 600 pixels wide on desktop. Longer titles are not penalised, but the end will be cut off with an ellipsis, so put the most important words first.',
        },
        {
          q: 'How long should a meta description be?',
          a: 'Around 70–160 characters is a good target. Google measures snippets in pixels and shows less on mobile, so make sure the first 120 characters carry the key message.',
        },
        {
          q: 'Why does Google show a different title or description than mine?',
          a: 'Google rewrites titles and snippets when it thinks they do not describe the page well, are stuffed with keywords, are duplicated across pages or do not match the search. Clear, unique and accurate tags are rewritten far less often.',
        },
        {
          q: 'How accurate is the SERP preview?',
          a: 'It uses the same fonts and pixel limits as Google’s result layout and measures your text in your browser, so it is a close approximation. Google changes its design from time to time and may add dates, ratings or other details, so treat it as a guide rather than a guarantee.',
        },
        {
          q: 'Do I need the meta keywords tag?',
          a: 'No. Google has ignored the meta keywords tag for ranking for well over a decade, and it can reveal your target keywords to competitors, so this generator does not include it.',
        },
        {
          q: 'Where do I paste the generated tags?',
          a: 'Inside the <head> section of your HTML, replacing any existing title and description tags. On WordPress, Shopify or Wix, enter the title and description in the SEO fields of the page settings or your SEO plugin instead.',
        },
        {
          q: 'What size should my Open Graph image be?',
          a: '1200×630 pixels (a 1.91:1 ratio) is the safest size for Facebook, LinkedIn, WhatsApp and X large image cards. Keep important text away from the edges and the file under a few megabytes, and use an absolute https:// URL.',
        },
        {
          q: 'Is anything I type saved or sent anywhere?',
          a: 'No. The previews and HTML are generated in your browser. Nothing is uploaded or stored on our servers.',
        },
      ]}
    >
      <MetaTagGenerator />
    </ToolPage>
  );
}
