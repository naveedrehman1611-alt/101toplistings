import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { SpeedTest } from './speed-test';

export const metadata = toolMetadata(
  'website-speed-test',
  'Free Website Speed Test — Core Web Vitals & Lighthouse',
  'Test any page’s speed on mobile and desktop. Get Lighthouse scores, Core Web Vitals (LCP, INP, CLS), real-user data and a prioritised list of fixes. Free.',
);

export default function Page() {
  return (
    <ToolPage
      slug="website-speed-test"
      h1="Free Website Speed Test"
      intro="Check how fast any web page loads on a phone or a desktop. You get Google Lighthouse scores for performance, accessibility, best practices and SEO, your Core Web Vitals from real Chrome users, and a ranked list of what to fix first."
      steps={[
        {
          title: 'Enter a page URL',
          body: 'Paste the full address of the page you want to test. Test your home page, but also your key landing, product and service pages; each page has its own speed.',
        },
        {
          title: 'Pick mobile or desktop',
          body: 'Mobile is the one that matters most, because Google indexes and ranks the mobile version of your site. Desktop is useful for comparison.',
        },
        {
          title: 'Read the scores and fix the top items',
          body: 'Google’s Lighthouse loads the page in 10–60 seconds. Start with the opportunities at the top of the list: they have the biggest estimated time savings.',
        },
      ]}
      guide={[
        {
          heading: 'What Core Web Vitals measure',
          body: (
            <>
              <p>
                Core Web Vitals are the three user-experience metrics Google uses as part of its
                page experience ranking signals. Each is judged at the 75th percentile of real
                visits, so three out of four visitors need a good experience for the page to pass.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-on-surface">Largest Contentful Paint (LCP)</strong> — how
                  long until the biggest image or text block is visible. Good is 2.5 seconds or
                  less. Slow servers, large hero images and render-blocking CSS are the usual
                  culprits.
                </li>
                <li>
                  <strong className="text-on-surface">Interaction to Next Paint (INP)</strong> — how
                  quickly the page responds when someone taps, clicks or types, across the whole
                  visit. Good is 200 ms or less. Heavy JavaScript, chat widgets and third-party tags
                  are the common causes of poor INP.
                </li>
                <li>
                  <strong className="text-on-surface">Cumulative Layout Shift (CLS)</strong> — how
                  much content jumps around while the page loads. Good is 0.1 or less. Give images,
                  ads and embeds fixed dimensions and avoid inserting banners above existing
                  content.
                </li>
              </ul>
              <p>
                Lighthouse lab tests cannot measure INP because no real person interacts with the
                page, so the lab report shows Total Blocking Time (TBT) as a stand-in: if TBT is
                high, INP is usually poor too.
              </p>
            </>
          ),
        },
        {
          heading: 'How the Lighthouse performance score is calculated',
          body: (
            <>
              <p>
                The 0–100 performance score is a weighted blend of five lab metrics: Total Blocking
                Time and Largest Contentful Paint carry the most weight, followed by Cumulative
                Layout Shift, First Contentful Paint and Speed Index. Each metric is compared with
                data from real websites, so a score of 50 roughly means you are around the median of
                the web, and 90+ puts you among the fastest pages.
              </p>
              <p>
                The accessibility, best practices and SEO scores work differently: they are the
                weighted share of pass/fail audits your page passes, such as image alt text, colour
                contrast, HTTPS, valid meta tags and crawlable links.
              </p>
            </>
          ),
        },
        {
          heading: 'Quick wins that fix most slow sites',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Compress and resize images, serve them as WebP or AVIF, and lazy-load anything below
                the fold — but never lazy-load the main hero image.
              </li>
              <li>
                Use a good host or a CDN so the server answers in well under a second (Time to First
                Byte). Cheap shared hosting is often the single biggest bottleneck for small
                business sites.
              </li>
              <li>
                Remove plugins, sliders, chat widgets and tracking tags you do not really need. Each
                third-party script competes for the phone’s processor.
              </li>
              <li>
                Turn on caching and text compression (gzip or Brotli), and minify CSS and
                JavaScript.
              </li>
              <li>
                Preload the LCP image and the main web font, and use <code>font-display: swap</code>{' '}
                so text appears straight away.
              </li>
              <li>
                Set width and height on images and video so the browser reserves space and the
                layout does not shift.
              </li>
            </ul>
          ),
        },
        {
          heading: 'Does page speed affect Google rankings?',
          body: (
            <p>
              Yes, but as a tie-breaker rather than a trump card. Relevance and content quality
              still come first, yet when several pages answer a search equally well, the faster one
              with better Core Web Vitals has an edge. The bigger effect is on people: slow pages
              lose visitors before they ever see your offer, and every extra second on mobile
              measurably reduces enquiries and sales. For local businesses competing in the map pack
              and organic results, a fast mobile site is one of the cheapest advantages you can buy.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          q: 'What is the difference between lab data and field data?',
          a: 'Lab data comes from a single Lighthouse test run on Google’s servers with a simulated mid-range phone and slow 4G connection. It is repeatable and great for debugging. Field data (the “Real-user data” panel) comes from the Chrome UX Report: anonymised measurements from real Chrome users who visited the page over the last 28 days on their own devices and networks. Google uses field data for rankings, so if the two disagree, trust field data for SEO and use lab data to find what to fix.',
        },
        {
          q: 'Why does my score change every time I run the test?',
          a: 'Lighthouse loads your page fresh each time, and small differences add up: server response time, network routing, third-party scripts and ads that load different content, A/B tests, and the load on Google’s test machines. A swing of 5–10 points between runs is normal. Run the test three times and look at the middle result, and focus on the metrics and opportunities rather than one number.',
        },
        {
          q: 'Why is there no real-user data for my site?',
          a: 'The Chrome UX Report only publishes data for pages and sites with enough traffic from Chrome users who have opted in to usage statistics. Newer or low-traffic sites often have no field data at page level, and sometimes not even for the whole origin. In that case rely on the lab metrics until traffic grows.',
        },
        {
          q: 'Is mobile or desktop speed more important?',
          a: 'Mobile. Google uses mobile-first indexing, meaning it crawls and ranks the mobile version of your pages, and in most markets the majority of visitors are on phones. Mobile scores are also usually lower because the test simulates a slower processor and network.',
        },
        {
          q: 'What is a good PageSpeed score?',
          a: '90–100 is good, 50–89 needs improvement and below 50 is poor. Do not chase a perfect 100: a page scoring in the 80s that passes all three Core Web Vitals in field data is in excellent shape. Passing Core Web Vitals for real users matters more than the lab score.',
        },
        {
          q: 'Who runs the test and is my data stored?',
          a: 'The test is run by Google’s PageSpeed Insights service, called directly from your browser. We do not store the URLs you test or the results on our servers. Your last results are kept in your browser’s session storage for 10 minutes so refreshing the page does not repeat the test.',
        },
        {
          q: 'The test failed or says the quota is busy. What can I do?',
          a: 'Google’s free API has a shared rate limit, so at busy times you may need to wait a minute and try again. If the error says the page could not be loaded, check that the address is correct, that the site is publicly reachable, and that a firewall or security plugin is not blocking Google’s Lighthouse user agent.',
        },
        {
          q: 'Can I test pages behind a login or on localhost?',
          a: 'No. Google’s servers have to be able to load the page, so it must be public. For staging sites, temporarily allow public access or run Lighthouse locally from Chrome DevTools.',
        },
      ]}
    >
      <SpeedTest />
    </ToolPage>
  );
}
