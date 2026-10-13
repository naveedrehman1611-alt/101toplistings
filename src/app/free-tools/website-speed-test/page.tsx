import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { SpeedTest } from './speed-test';

export const metadata = toolMetadata(
  'website-speed-test',
  'Free Website Speed Test — Core Web Vitals & Lighthouse',
  'Test any page’s speed on mobile and desktop. Get Lighthouse scores, Core Web Vitals (LCP, INP, CLS), real-user data and a prioritised list of fixes. Free.',
);

// Copy: Admin → Content → "Free tool: Website Speed Test" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_speed_test'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage
      slug="website-speed-test"
      content={content}
      hub={hub}
      rich={{ strong: 'text-on-surface' }}
    >
      <SpeedTest labels={content.tool} />
    </ToolPage>
  );
}
