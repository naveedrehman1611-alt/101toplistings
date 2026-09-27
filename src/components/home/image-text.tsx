import type { ImageTextVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

// STUB — replaced by the section implementation.
export function ImageText({ section }: { section: ImageTextVM }) {
  return (
    <SectionShell section={section}>
      <div />
    </SectionShell>
  );
}
