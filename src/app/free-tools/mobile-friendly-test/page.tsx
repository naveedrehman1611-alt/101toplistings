import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { MobileTest } from './mobile-test';

export function generateMetadata() {
  return toolMetadata(
    'mobile-friendly-test',
    'Free Mobile-Friendly Test — Check Any Page on a Phone',
    'Is your website mobile-friendly? Check the viewport, font sizes, tap targets, content width and mobile Core Web Vitals, with a phone screenshot. Free, no signup.',
  );
}

// Copy: Admin → Content → "Free tool: Mobile-Friendly Test" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_mobile_friendly'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage
      slug="mobile-friendly-test"
      content={content}
      hub={hub}
      rich={{
        strong: 'text-on-surface',
        code: 'break-all',
        link: 'text-primary-container underline',
      }}
    >
      <MobileTest labels={content.tool} />
    </ToolPage>
  );
}
