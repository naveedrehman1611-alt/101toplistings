import type { Metadata, ResolvingMetadata } from 'next';
import {
  getCategories,
  getCities,
  getCityListingCounts,
  getDirectoryStats,
  getFeaturedListingCards,
  getListingHighlights,
  getPostCards,
  getReviewSummary,
  getSettings,
  searchListings,
  settingText,
} from '@/lib/queries';
import { seoMetadata } from '@/lib/seo';
import { Hero } from '@/components/home/hero';
import { HeroStats } from '@/components/home/hero-stats';
import { TopRated } from '@/components/home/top-rated';
import { FeaturedBusinesses } from '@/components/home/featured-businesses';
import { LatestGuides } from '@/components/home/latest-guides';
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
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const brand = settingText(await getSettings(), 'brand.name', 'RankYouSite');
  const title = `${brand} | Business Directory & SEO Services`;
  const description =
    'List your business, get discovered online, and grow with SEO and digital marketing. Explore businesses worldwide or promote your own.';
  return seoMetadata(
    '/',
    {
      title: { absolute: title },
      description,
      openGraph: { title, description, siteName: brand, type: 'website', url: '/' },
      twitter: { card: 'summary_large_image', title, description },
    },
    parent,
  );
}

/**
 * The Stitch home page. Copy lives in the section components; every figure,
 * card and city count comes from Supabase and is hidden when it is missing.
 */
export default async function HomePage() {
  const [settings, categories, cities, topRated, featured, guides, stats, reviews] =
    await Promise.all([
      getSettings(),
      getCategories(),
      getCities(),
      searchListings({ sort: 'rating', limit: 3 }),
      getFeaturedListingCards(3),
      getPostCards({ limit: 3 }),
      getDirectoryStats(),
      getReviewSummary(),
    ]);

  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const homeCities = pickHomeCities(cities);
  const [highlights, cityCounts] = await Promise.all([
    // One highlights read covers both rows of cards.
    getListingHighlights([...new Set([...topRated, ...featured].map((l) => l.id))]),
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
      <FeaturedBusinesses
        listings={featured}
        highlights={highlights}
        categoryNames={categoryNames}
        cityNames={cityNames}
      />
      <Services categorySlugs={categorySlugs} />
      <HowItWorks brand={brand} />
      <GrowVisibility brand={brand} />
      <HelpingCustomers brand={brand} />
      <CtaBanner brand={brand} />
      <LatestGuides posts={guides} />
      <Faq brand={brand} />
      <FinalCta brand={brand} />
    </>
  );
}
