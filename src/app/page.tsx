import type { Metadata, ResolvingMetadata } from 'next';
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

// The layout's defaults (from settings) are the home page's own metadata, so
// this only changes anything when the SEO manager holds an override for "/".
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return seoMetadata('/', {}, parent);
}

/**
 * The Stitch home page. Copy lives in the section components; every figure,
 * card and city count comes from Supabase and is hidden when it is missing.
 */
export default async function HomePage() {
  const [settings, categories, cities, topRated, stats, reviews] = await Promise.all([
    getSettings(),
    getCategories(),
    getCities(),
    searchListings({ sort: 'rating', limit: 3 }),
    getDirectoryStats(),
    getReviewSummary(),
  ]);

  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const homeCities = pickHomeCities(cities);
  const [highlights, cityCounts] = await Promise.all([
    getListingHighlights(topRated.map((l) => l.id)),
    getCityListingCounts(homeCities.map((c) => c.id)),
  ]);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <>
      <Hero categories={categories} cities={cities} />
      <HeroStats stats={stats} reviews={reviews} />
      <TopRated
        listings={topRated}
        highlights={highlights}
        categoryNames={categoryNames}
        cityNames={cityNames}
      />
      <Story stats={stats} />
      <WhyChoose brand={brand} />
      <Cities cities={homeCities} counts={cityCounts} />
      <Services categorySlugs={categorySlugs} />
      <HowItWorks brand={brand} />
      <GrowVisibility brand={brand} />
      <HelpingCustomers brand={brand} />
      <CtaBanner brand={brand} />
      <Faq brand={brand} />
      <FinalCta brand={brand} />
    </>
  );
}
