import Link from 'next/link';
import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { MobileTest } from './mobile-test';

export const metadata = toolMetadata(
  'mobile-friendly-test',
  'Free Mobile-Friendly Test — Check Any Page on a Phone',
  'Is your website mobile-friendly? Check the viewport, font sizes, tap targets, content width and mobile Core Web Vitals, with a phone screenshot. Free, no signup.',
);

export default function Page() {
  return (
    <ToolPage
      slug="mobile-friendly-test"
      h1="Free Mobile-Friendly Test"
      intro="See how your page looks and performs on a smartphone. We load it on an emulated phone with Google Lighthouse, show you a screenshot, and check the things that make or break a mobile visit: viewport, readable text, tap targets, content width, images and mobile speed."
      steps={[
        {
          title: 'Enter your page URL',
          body: 'Paste the address of any public page. Test the pages customers land on most: home, services, contact and your top blog posts.',
        },
        {
          title: 'Google loads it on a phone',
          body: 'Lighthouse renders the page on an emulated mid-range phone over a throttled mobile connection. This takes 10–60 seconds.',
        },
        {
          title: 'Fix what fails',
          body: 'Read the verdict, then work through any failed or “needs work” rows. Each one explains what it means and how to fix it.',
        },
      ]}
      guide={[
        {
          heading: 'Mobile-first indexing: why this matters for SEO',
          body: (
            <>
              <p>
                Google now crawls and indexes the web with a smartphone crawler. Whatever your site
                shows on a phone is what Google reads, ranks and shows in search results — the
                desktop version is effectively secondary. If content, links, structured data or
                images are missing or hidden on mobile, Google may not see them at all.
              </p>
              <p>
                That makes a responsive, fast mobile site the baseline for ranking, especially for
                local searches like “plumber near me”, which happen overwhelmingly on phones.
              </p>
            </>
          ),
        },
        {
          heading: 'What makes a page mobile-friendly',
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-on-surface">A responsive viewport.</strong> Add{' '}
                <code className="break-all">
                  &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width,
                  initial-scale=1&quot;&gt;
                </code>{' '}
                to the page head and use CSS that adapts to the screen width.
              </li>
              <li>
                <strong className="text-on-surface">Readable text.</strong> Use a base font size of
                around 16px with comfortable line height; nobody should have to pinch-zoom to read.
              </li>
              <li>
                <strong className="text-on-surface">Comfortable tap targets.</strong> Buttons and
                links need to be big enough for a thumb and spaced so people do not tap the wrong
                one.
              </li>
              <li>
                <strong className="text-on-surface">No sideways scrolling.</strong> Fixed-width
                tables, wide images and embedded iframes are the usual causes of content spilling
                past the screen edge.
              </li>
              <li>
                <strong className="text-on-surface">Fast loading on mobile networks.</strong> Phones
                have slower processors and connections than desktops, so heavy images and scripts
                hurt far more on mobile.
              </li>
              <li>
                <strong className="text-on-surface">No intrusive pop-ups.</strong> Full-screen
                interstitials that cover content right after arriving from search frustrate users
                and can count against you.
              </li>
            </ul>
          ),
        },
        {
          heading: 'Mobile Core Web Vitals in plain English',
          body: (
            <>
              <p>
                Google’s Core Web Vitals are measured separately for mobile and desktop, and the
                mobile numbers are the ones that usually fail. Largest Contentful Paint (LCP) should
                be 2.5 seconds or less, Interaction to Next Paint (INP) 200 ms or less, and
                Cumulative Layout Shift (CLS) 0.1 or less, for at least 75% of real visits.
              </p>
              <p>
                This test shows the lab versions (LCP, CLS and Total Blocking Time, which stands in
                for INP) and, when Google has enough traffic data, the real-user values from the
                Chrome UX Report. For a deeper performance breakdown with a list of fixes, run our{' '}
                <Link
                  href="/free-tools/website-speed-test"
                  className="text-primary-container underline"
                >
                  website speed test
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          heading: 'Google retired its own Mobile-Friendly Test — what now?',
          body: (
            <p>
              Google shut down its standalone Mobile-Friendly Test and the Search Console Mobile
              Usability report in late 2023, recommending Lighthouse instead. This tool uses exactly
              that: Google’s Lighthouse engine via the PageSpeed Insights API, with the
              mobile-relevant audits pulled together into one clear pass/fail view. Newer Lighthouse
              versions have also dropped some older audits (such as font size and tap targets); when
              an audit is not reported we say so instead of marking it as a failure.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          q: 'How is the mobile-friendly verdict decided?',
          a: 'A page is marked mobile-friendly when it has a working responsive viewport tag and none of the critical layout checks (legible font sizes, tap targets and content width) fail. Speed results and image checks are shown as improvements to make, but they do not on their own make a page “not mobile-friendly”.',
        },
        {
          q: 'Why do some checks say “not reported”?',
          a: 'Google keeps updating Lighthouse and has removed or renamed some mobile audits over time, such as font-size and tap-targets. If the version Google ran did not include a check, we show it as not reported rather than counting it against your page. Check those items by hand on a real phone.',
        },
        {
          q: 'What is the difference between lab data and field data?',
          a: 'Lab data is a single simulated load on Google’s servers using an emulated phone and throttled network; it is consistent and good for debugging. Field data comes from real Chrome users over the past 28 days (the Chrome UX Report) and reflects their actual devices and connections. Google uses field data for rankings, so treat it as the final word and use lab data to diagnose problems.',
        },
        {
          q: 'Why do my results change between runs?',
          a: 'Each run loads your page from scratch. Server response time, network conditions, ads and third-party scripts, and the load on Google’s test machines all vary, so speed metrics can move noticeably between runs. Layout checks like the viewport are stable. Run the test two or three times before drawing conclusions about speed.',
        },
        {
          q: 'My site looks fine on my phone. Why does it fail?',
          a: 'Your phone is probably faster and on a better connection than the mid-range device Lighthouse emulates, and you may have the site cached. The test also checks things you might not notice, like small tap targets or a small amount of sideways scrolling. Try the page on an older Android phone over mobile data to see what many visitors see.',
        },
        {
          q: 'Does being mobile-friendly improve rankings?',
          a: 'Google ranks the mobile version of your site, and page experience, including Core Web Vitals, is part of its ranking systems. Being mobile-friendly will not outrank better content on its own, but a poor mobile experience can hold good content back and drives visitors away before they contact you.',
        },
        {
          q: 'Is the URL I test saved anywhere?',
          a: 'No. The test runs from your browser straight to Google’s PageSpeed Insights API; our servers do not see or store the URL or results. The last result is cached in your browser for 10 minutes so a refresh does not run the test again.',
        },
      ]}
    >
      <MobileTest />
    </ToolPage>
  );
}
