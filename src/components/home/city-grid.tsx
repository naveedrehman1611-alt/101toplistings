import type { CityGridVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function CityGrid({ section }: { section: CityGridVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
