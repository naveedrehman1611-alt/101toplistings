import type { ServicesVM } from '@/lib/home-types';
import { Carousel } from './carousel';
import { IconCard } from './icon-card';
import { SectionShell } from './section-shell';

export function Services({ section }: { section: ServicesVM }) {
  return (
    <SectionShell section={section}>
      <Carousel
        label={section.heading ?? 'Services'}
        step="page"
        // The bottom padding leaves room for the hover shadow, which the
        // scrolling track would otherwise clip.
        slideClassName="basis-full pb-6 sm:basis-1/2 lg:basis-1/3"
      >
        {section.items.map((card) => (
          <IconCard
            key={card.id}
            card={card}
            titleCase={section.titleCase}
            bordered={section.background === 'white'}
          />
        ))}
      </Carousel>
    </SectionShell>
  );
}
