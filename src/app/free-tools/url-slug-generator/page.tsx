import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { SlugGenerator } from './slug-generator';

export const metadata = toolMetadata(
  'url-slug-generator',
  'Free URL Slug Generator — SEO-Friendly Slugs',
  'Turn titles into clean, SEO-friendly URL slugs. Handles accents, apostrophes, Urdu and other scripts, stop words and length limits. Bulk mode included.',
);

const code = 'rounded bg-surface-container-low px-1 font-mono text-[0.9em]';

// Copy: Admin → Content → "Free tool: URL Slug Generator" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_url_slug'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage slug="url-slug-generator" content={content} hub={hub} rich={{ code }}>
      <SlugGenerator labels={content.tool} />
    </ToolPage>
  );
}
