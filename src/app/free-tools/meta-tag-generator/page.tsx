import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { MetaTagGenerator } from './meta-tag-generator';

export const metadata = toolMetadata(
  'meta-tag-generator',
  'Meta Tag Generator & Google SERP Preview (Free)',
  'Write SEO titles and meta descriptions with a live Google preview, pixel-width counters and ready-to-paste meta, Open Graph and Twitter tags.',
);

// Copy: Admin → Content → "Free tool: Meta Tags & SERP Preview" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_meta_tags'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage slug="meta-tag-generator" content={content} hub={hub}>
      <MetaTagGenerator labels={content.tool} />
    </ToolPage>
  );
}
