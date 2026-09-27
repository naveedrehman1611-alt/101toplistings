import type { FaqVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function Faq({ section }: { section: FaqVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
