import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { RobotsGenerator } from './robots-generator';

export const metadata = toolMetadata(
  'robots-txt-generator',
  'Free Robots.txt Generator — Control Google & AI Bots',
  'Build a valid robots.txt in seconds. Block admin pages, add sitemaps, and choose which search engines and AI bots like GPTBot or ClaudeBot can crawl.',
);

const code = 'rounded bg-surface-container-low px-1 font-mono text-[0.9em]';

// Copy: Admin → Content → "Free tool: Robots.txt Generator" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_robots_txt'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage slug="robots-txt-generator" content={content} hub={hub} rich={{ code }}>
      <RobotsGenerator labels={content.tool} />
    </ToolPage>
  );
}
