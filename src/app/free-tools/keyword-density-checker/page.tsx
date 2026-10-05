import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { KeywordDensityChecker } from './keyword-density';

export const metadata = toolMetadata(
  'keyword-density-checker',
  'Free Keyword Density Checker — Top Phrases & Density',
  'Paste text or HTML to see word count, top one-, two- and three-word phrases and keyword density. Runs in your browser, free, no signup.',
);

export default function Page() {
  return (
    <ToolPage
      slug="keyword-density-checker"
      h1="Keyword Density Checker"
      intro="Paste an article or a page’s HTML and instantly see which words and phrases it repeats most, how often your target keyword appears, and whether it is in the title and opening. Everything runs in your browser, so your content never leaves your device."
      steps={[
        {
          title: 'Paste your content',
          body: 'Paste plain text, or the full HTML source of a page. HTML is stripped of scripts, styles and tags automatically, and the title tag is picked up for you.',
        },
        {
          title: 'Add a target keyword',
          body: 'Optionally enter the phrase the page should rank for and its title. The tool shows how often the phrase is used, its density and where it appears.',
        },
        {
          title: 'Review the top phrases',
          body: 'Switch between one-, two- and three-word tabs to see what the page is really about, spot accidental repetition and find topics you have missed.',
        },
      ]}
      guide={[
        {
          heading: 'What keyword density actually measures',
          body: (
            <>
              <p>
                Keyword density is the share of a text taken up by one word or phrase. This tool
                uses the common formula: the number of times a phrase appears, divided by the total
                number of words, multiplied by 100. A 500-word page that uses “plumber in Karachi”
                five times has a density of 1% for that phrase.
              </p>
              <p>
                Numbers and single letters are not counted as words, and very common words such as
                “the”, “and” and “for” are ignored as keywords. Phrases never run across the end of
                a sentence or a heading, so the counts reflect phrases a reader would actually see.
              </p>
            </>
          ),
        },
        {
          heading: 'Is there an ideal keyword density?',
          body: (
            <>
              <p>
                No. Google has said for years that it does not use keyword density as a ranking
                signal, and no percentage guarantees rankings. Modern search engines understand
                synonyms and topics, so a page can rank for a phrase it uses only once or twice.
              </p>
              <p>
                What density is good for is spotting extremes. If a single phrase is above roughly
                3% of a normal-length page, the copy usually reads as forced and can look like
                keyword stuffing, which Google’s spam policies do penalise. If your main topic never
                appears at all, the page may not be clear about what it offers.
              </p>
            </>
          ),
        },
        {
          heading: 'How to use the phrase tables',
          body: (
            <>
              <p>
                The one-word tab shows the vocabulary of the page. The two- and three-word tabs are
                usually more revealing: they surface the phrases a search engine is most likely to
                associate with the page, such as “SEO audit” or “Google Business Profile”.
              </p>
              <p>
                Compare the top phrases with what you want the page to rank for. If the list is
                dominated by your brand name, generic words or a phrase you did not intend, rewrite
                those passages. The “in title” column shows which repeated phrases also appear in
                the title, the strongest on-page relevance signal you control.
              </p>
            </>
          ),
        },
        {
          heading: 'Better than density: placement and coverage',
          body: (
            <>
              <p>
                Put the main topic in the title tag, the H1 and early in the opening paragraph,
                which this tool checks for you within the first 100 words. After that, focus on
                covering the questions a searcher has: prices, locations, timings, comparisons and
                proof such as reviews.
              </p>
              <p>
                For local businesses, naturally mentioning your city or area alongside the service
                (for example “bridal makeup in DHA Lahore”) matters more than repeating the service
                name. Variations and related terms make the copy read better and widen the range of
                searches the page can appear for.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          q: 'How is keyword density calculated?',
          a: 'Density = (number of times the phrase appears ÷ total words) × 100. The same total is used for one-, two- and three-word phrases, so a two-word phrase used 10 times in 1,000 words has a density of 1%.',
        },
        {
          q: 'What is a good keyword density for SEO?',
          a: 'There is no ideal number and density is not a Google ranking factor. Most well-written pages land between about 0.5% and 2.5% for their main phrase without trying. Above about 3% the text often reads as repetitive and may be treated as keyword stuffing.',
        },
        {
          q: 'Can I check a live web page?',
          a: 'Yes. Open the page, view its source (Ctrl+U or Cmd+Option+U), copy everything and paste it in. The tool detects HTML, removes scripts, styles and markup, analyses the visible text and reads the title and meta description.',
        },
        {
          q: 'Why are words like “the” and “and” missing?',
          a: 'They are stopwords: very common words that say nothing about the topic. They are skipped as single keywords, and two- or three-word phrases that start or end with one are left out, but they still count towards the total word count.',
        },
        {
          q: 'Why does a phrase I used once not appear in the 2- and 3-word tabs?',
          a: 'Multi-word phrases are only listed when they appear at least twice. A phrase used once is not a pattern, and including every one-off combination would bury the useful results.',
        },
        {
          q: 'Is my content stored or sent anywhere?',
          a: 'No. The analysis runs entirely in your browser with JavaScript. Nothing you paste is uploaded, saved or logged, so it is safe to check unpublished drafts.',
        },
        {
          q: 'Does it work with languages other than English?',
          a: 'Word counting, phrases and density work with any language that separates words with spaces, including Urdu written in Unicode and Roman Urdu. The stopword list is English, so common words in other languages will still show up in the results.',
        },
        {
          q: 'How is reading time estimated?',
          a: 'Reading time assumes an average adult silent reading speed of about 200 words per minute, rounded up to the next minute.',
        },
      ]}
    >
      <KeywordDensityChecker />
    </ToolPage>
  );
}
