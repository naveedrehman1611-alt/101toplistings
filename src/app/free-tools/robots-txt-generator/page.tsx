import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { RobotsGenerator } from './robots-generator';

export const metadata = toolMetadata(
  'robots-txt-generator',
  'Free Robots.txt Generator — Control Google & AI Bots',
  'Build a valid robots.txt in seconds. Block admin pages, add sitemaps, and choose which search engines and AI bots like GPTBot or ClaudeBot can crawl.',
);

const code = 'rounded bg-surface-container-low px-1 font-mono text-[0.9em]';

export default function Page() {
  return (
    <ToolPage
      slug="robots-txt-generator"
      h1="Robots.txt Generator"
      intro="Create a clean, valid robots.txt file for your website. Set rules for all crawlers, block private folders, add your sitemap, and decide which search engines and AI bots (GPTBot, ClaudeBot, PerplexityBot and more) may crawl your pages. Everything runs in your browser."
      steps={[
        {
          title: 'Set the default rules',
          body: 'Choose Allow all, Disallow all, or Custom, then add the folders you want kept out of crawlers’ reach. Quick-add chips cover WordPress admin, cart, checkout and search pages.',
        },
        {
          title: 'Pick rules per crawler',
          body: 'Leave each bot on Default, or allow or block it individually. Use a preset to block AI training bots while keeping AI search bots that can cite and link to you.',
        },
        {
          title: 'Copy or download',
          body: 'Add your sitemap URL, check the warnings, then copy the file or download robots.txt and upload it to the root of your domain.',
        },
      ]}
      guide={[
        {
          heading: 'What a robots.txt file does',
          body: (
            <>
              <p>
                robots.txt is a plain text file at{' '}
                <code className={code}>https://yourdomain.com/robots.txt</code> that tells crawlers
                which parts of a site they may request. Each block starts with one or more{' '}
                <code className={code}>User-agent</code> lines followed by{' '}
                <code className={code}>Allow</code> and <code className={code}>Disallow</code>{' '}
                rules. A crawler obeys only the most specific group that names it, falling back to
                the <code className={code}>User-agent: *</code> group otherwise.
              </p>
              <p>
                It is a set of instructions, not a lock. Reputable crawlers follow it, but anyone
                can still open a blocked URL in a browser, so never rely on robots.txt to hide
                private or sensitive content. Use passwords or server rules for that.
              </p>
            </>
          ),
        },
        {
          heading: 'Crawling is not the same as indexing',
          body: (
            <>
              <p>
                Disallowing a URL stops Google from fetching it, but if other pages link to it,
                Google can still list the bare URL in results without a description. To remove a
                page from search, add{' '}
                <code className={code}>
                  &lt;meta name=&quot;robots&quot; content=&quot;noindex&quot;&gt;
                </code>{' '}
                and keep the page crawlable so Google can see that tag.
              </p>
              <p>
                Also avoid blocking CSS, JavaScript or image folders that your pages need to render.
                Google renders pages like a browser, and blocked resources can make your content
                look broken or thin.
              </p>
            </>
          ),
        },
        {
          heading: 'AI training bots vs AI search bots',
          body: (
            <>
              <p>
                AI companies run different crawlers for different jobs. Training crawlers such as{' '}
                <code className={code}>GPTBot</code>, <code className={code}>ClaudeBot</code>,{' '}
                <code className={code}>Google-Extended</code> and{' '}
                <code className={code}>CCBot</code> collect content to train models. Blocking them
                keeps your content out of future training sets and has no effect on Google or Bing
                rankings.
              </p>
              <p>
                Search and user-triggered crawlers such as{' '}
                <code className={code}>OAI-SearchBot</code>,{' '}
                <code className={code}>ChatGPT-User</code>,{' '}
                <code className={code}>Claude-SearchBot</code> and{' '}
                <code className={code}>PerplexityBot</code> fetch pages so AI assistants can quote
                and link to them in answers. For most businesses these bring visitors, so the “Block
                AI training, allow AI search” preset is a sensible middle ground.
              </p>
            </>
          ),
        },
        {
          heading: 'Wildcards, precedence and common mistakes',
          body: (
            <>
              <p>
                Google and Bing support <code className={code}>*</code> (any characters) and{' '}
                <code className={code}>$</code> (end of URL).{' '}
                <code className={code}>Disallow: /*?sort=</code> blocks every URL with a sort
                parameter, and <code className={code}>Disallow: /*.pdf$</code> blocks PDFs. When an
                Allow and a Disallow rule both match, the longer (more specific) rule wins, which is
                why <code className={code}>Allow: /wp-admin/admin-ajax.php</code> works inside a
                blocked <code className={code}>/wp-admin/</code>.
              </p>
              <p>
                The costliest mistake is leaving <code className={code}>Disallow: /</code> live
                after a site launch, which blocks the entire site. Paths are case-sensitive, must
                start with a slash, and each subdomain (such as{' '}
                <code className={code}>shop.example.com</code>) needs its own file.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          q: 'Where do I upload robots.txt?',
          a: 'At the root of your domain, so it loads at https://yourdomain.com/robots.txt. Crawlers do not look for it in subfolders. On WordPress you can upload it by FTP or edit it with an SEO plugin; on most hosts it goes in the public_html folder.',
        },
        {
          q: 'Will blocking a page in robots.txt remove it from Google?',
          a: 'Not reliably. robots.txt stops crawling, not indexing, so a blocked URL that is linked from elsewhere can still appear in results. Use a noindex meta tag (and keep the page crawlable) or remove the page to take it out of Google.',
        },
        {
          q: 'Should I block AI bots like GPTBot and ClaudeBot?',
          a: 'It depends on your goals. Blocking training bots keeps your content out of model training without hurting search rankings. Blocking AI search bots such as OAI-SearchBot, Claude-SearchBot or PerplexityBot can stop AI assistants from citing and linking to you, which usually costs traffic.',
        },
        {
          q: 'Does blocking Google-Extended affect my Google rankings?',
          a: 'No. Google-Extended is a control token for Gemini training and grounding only. Google Search crawls with Googlebot, so blocking Google-Extended does not change how you rank or appear in Google Search.',
        },
        {
          q: 'Does Google respect Crawl-delay?',
          a: 'No. Googlebot ignores the Crawl-delay directive and sets its crawl rate automatically based on how your server responds. Bing and Yandex do respect it. If Googlebot is overloading your server, return 503 or 429 responses temporarily.',
        },
        {
          q: 'Do I need a robots.txt file at all?',
          a: 'It is not required. Without one, crawlers assume they can crawl everything. A short file is still useful to point crawlers to your sitemap, keep them out of cart, search and admin pages, and set rules for AI crawlers.',
        },
        {
          q: 'Should I add my sitemap to robots.txt?',
          a: 'Yes. A Sitemap line with the full URL helps every crawler find your sitemap, including ones where you have not submitted it manually. You can list several sitemaps or a sitemap index file.',
        },
        {
          q: 'Is this robots.txt generator free and private?',
          a: 'Yes. It is completely free with no sign-up, and the file is built in your browser. Nothing you enter is sent to our servers.',
        },
      ]}
    >
      <RobotsGenerator />
    </ToolPage>
  );
}
