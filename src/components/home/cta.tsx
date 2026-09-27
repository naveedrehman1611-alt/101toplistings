import type { CtaVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function Cta({ section }: { section: CtaVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
