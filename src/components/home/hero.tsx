import type { HeroVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function Hero({ section }: { section: HeroVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
