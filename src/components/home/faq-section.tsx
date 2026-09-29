import { Icon } from '@/components/icons';
import type { FaqVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

/**
 * Native <details> disclosures: keyboard support, find-in-page and a working
 * page without JavaScript come from the browser. A shared `name` makes the
 * group exclusive (one answer open at a time) where the browser supports it;
 * elsewhere several can simply be open at once.
 */
export function Faq({ section }: { section: FaqVM }) {
  return (
    <SectionShell section={section}>
      <div className="mx-auto max-w-4xl space-y-3">
        {section.items.map((item, i) => (
          <details
            key={item.id}
            name={section.singleOpen ? `${section.key}-questions` : undefined}
            open={section.openFirst && i === 0}
            className="group border-ink-200 rounded-lg border bg-white"
          >
            <summary className="group/summary flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="text-ink-900 group-hover/summary:text-brand-700 text-base font-medium transition-colors">
                {item.question}
              </span>
              <Icon
                name="plus"
                size={20}
                strokeWidth={2}
                className="text-ink-500 group-open:text-brand-700 shrink-0 group-open:rotate-45 motion-safe:transition-transform"
              />
            </summary>
            <div className="text-ink-500 space-y-3 px-5 pb-5 text-[0.9375rem] leading-[1.75]">
              {item.answer.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
