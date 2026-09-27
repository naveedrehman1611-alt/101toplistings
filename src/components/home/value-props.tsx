import type { ValuePropsVM } from '@/lib/home-types';
import { IconCard } from './icon-card';
import { SectionShell } from './section-shell';

export function ValueProps({ section }: { section: ValuePropsVM }) {
  return (
    <SectionShell section={section}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((card, i) => (
          <li
            key={card.id}
            // In the two-column layout an odd last card sits centred, not alone on the left.
            className="sm:max-lg:last:odd:col-span-2 sm:max-lg:last:odd:mx-auto sm:max-lg:last:odd:w-[calc(50%-0.75rem)]"
          >
            <IconCard
              card={card}
              titleCase={section.titleCase}
              step={section.numbered ? i + 1 : undefined}
              bordered={section.background === 'white'}
            />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
