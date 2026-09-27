import type { GuidesVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function Guides({ section }: { section: GuidesVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
