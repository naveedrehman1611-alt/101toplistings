import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { KeywordDensityChecker } from './keyword-density';

export function generateMetadata() {
  return toolMetadata(
    'keyword-density-checker',
    'Free Keyword Density Checker — Top Phrases & Density',
    'Paste text or HTML to see word count, top one-, two- and three-word phrases and keyword density. Runs in your browser, free, no signup.',
  );
}

// Copy: Admin → Content → "Free tool: Keyword Density Checker" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_keyword_density'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage slug="keyword-density-checker" content={content} hub={hub}>
      <KeywordDensityChecker labels={content.tool} />
    </ToolPage>
  );
}
