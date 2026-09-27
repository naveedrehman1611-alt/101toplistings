import type { ServicesVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function Services({ section }: { section: ServicesVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
