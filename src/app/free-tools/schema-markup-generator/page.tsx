import { ToolPage, toolMetadata } from '@/components/tools/tool-page';
import { getPageContent } from '@/lib/content/get';
import { SchemaGenerator } from './schema-generator';

export function generateMetadata() {
  return toolMetadata(
    'schema-markup-generator',
    'Free Schema Markup Generator — JSON-LD for 8 Types',
    'Generate valid JSON-LD schema for LocalBusiness, Organization, Article, Product, FAQ, HowTo, Event and Breadcrumbs. Live validation, copy or download. Free.',
  );
}

// Copy: Admin → Content → "Free tool: Schema Markup Generator" (src/lib/content/pages/tools.ts).
export default async function Page() {
  const [content, hub] = await Promise.all([
    getPageContent('tool_schema_markup'),
    getPageContent('free_tools'),
  ]);
  return (
    <ToolPage slug="schema-markup-generator" content={content} hub={hub}>
      <SchemaGenerator labels={content.tool} />
    </ToolPage>
  );
}
