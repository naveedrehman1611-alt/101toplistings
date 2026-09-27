import type { HomeSectionVM } from '@/lib/home-types';
import { Hero } from './hero';
import { TopRated } from './top-rated';
import { ImageText } from './image-text';
import { ValueProps } from './value-props';
import { CityGrid } from './city-grid';
import { Services } from './services';
import { Cta } from './cta';
import { Testimonials } from './testimonials';
import { Faq } from './faq';
import { Guides } from './guides';

/** One homepage section, chosen by its section_type. */
export function HomeSection({ section }: { section: HomeSectionVM }) {
  switch (section.type) {
    case 'hero_search':
      return <Hero section={section} />;
    case 'featured_listings':
      return <TopRated section={section} />;
    case 'image_text':
      return <ImageText section={section} />;
    case 'value_props':
      return <ValueProps section={section} />;
    case 'taxonomy_grid':
      return <CityGrid section={section} />;
    case 'featured_categories':
      return <Services section={section} />;
    case 'cta_banner':
      return <Cta section={section} />;
    case 'testimonials':
      return <Testimonials section={section} />;
    case 'faq':
      return <Faq section={section} />;
    case 'blog_grid':
      return <Guides section={section} />;
  }
}
