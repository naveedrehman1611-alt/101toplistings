import type { Metadata } from 'next';
import {
  getCategories,
  getCities,
  getCityListingCounts,
  getDirectoryStats,
  getListingHighlights,
  getReviewSummary,
  getSettings,
  searchListings,
  settingText,
} from '@/lib/queries';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { Hero } from '@/components/home/hero';
import { HeroStats } from '@/components/home/hero-stats';
import { TopRated } from '@/components/home/top-rated';
import { Story } from '@/components/home/story';
import { WhyChoose } from '@/components/home/why-choose';
import { Cities, pickHomeCities } from '@/components/home/cities';
import { Services } from '@/components/home/services';
import { HowItWorks } from '@/components/home/how-it-works';
import { GrowVisibility } from '@/components/home/grow-visibility';
import { HelpingCustomers } from '@/components/home/helping-customers';
import { CtaBanner } from '@/components/home/cta-banner';
import { Faq } from '@/components/home/faq';
import { FinalCta } from '@/components/home/final-cta';

export const revalidate = 300; // ISR — §1.5 rendering table

// Strategy title and description; an override held by the SEO manager for "/" still wins.
export async function generateMetadata(): Promise<Metadata> {
  const brand = settingText(await getSettings(), 'brand.name', 'RankYouSite');
  const title = `Free Business Directory Listing & SEO Services | ${brand}`;
  const description = `Add your free business listing on ${brand}, a free business directory for Pakistan, UK, USA, UAE & Europe. Get found online and grow with SEO services.`;
  return seoMetadata('/', {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  });
}

/**
 * The Stitch home page. Copy, links and images come from Admin → Content
 * (src/lib/content/pages/home.ts holds the defaults); every figure, card and
 * city count comes from Supabase and is hidden when it is missing.
 */
export default async function HomePage() {
  const [content, categories, cities, topRated, stats, reviews] = await Promise.all([
    getPageContent('home'),
    getCategories(),
    getCities(),
    searchListings({ sort: 'rating', limit: 3 }),
    getDirectoryStats(),
    getReviewSummary(),
  ]);

  const cityMarkets = pickHomeCities(cities);
  const [highlights, cityCounts] = await Promise.all([
    getListingHighlights(topRated.map((l) => l.id)),
    getCityListingCounts(cityMarkets.flatMap((m) => m.cities.map((c) => c.id))),
  ]);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <>
      <Hero content={content.hero} categories={categories} cities={cities} />
      {content.stats.visible ? (
        <HeroStats content={content.stats} stats={stats} reviews={reviews} />
      ) : null}
      {content.top_rated.visible ? (
        <TopRated
          content={content.top_rated}
          listings={topRated}
          highlights={highlights}
          categoryNames={categoryNames}
          cityNames={cityNames}
        />
      ) : null}
      {content.story.visible ? <Story content={content.story} stats={stats} /> : null}
      {content.why_choose.visible ? <WhyChoose content={content.why_choose} /> : null}
      {content.cities.visible ? (
        <Cities content={content.cities} markets={cityMarkets} counts={cityCounts} />
      ) : null}
      {content.services.visible ? (
        <Services content={content.services} categorySlugs={categorySlugs} />
      ) : null}
      {content.how_it_works.visible ? <HowItWorks content={content.how_it_works} /> : null}
      {content.grow_visibility.visible ? (
        <GrowVisibility content={content.grow_visibility} />
      ) : null}
      {content.helping_customers.visible ? (
        <HelpingCustomers content={content.helping_customers} />
      ) : null}
      {content.cta_banner.visible ? <CtaBanner content={content.cta_banner} /> : null}
      {content.faq.visible ? <Faq content={content.faq} /> : null}
      {content.final_cta.visible ? <FinalCta content={content.final_cta} /> : null}
    </>
  );
}
