import type { ValuePropsVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function ValueProps({ section }: { section: ValuePropsVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
