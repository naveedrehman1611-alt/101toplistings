import type { ListingsVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function TopRated({ section }: { section: ListingsVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
