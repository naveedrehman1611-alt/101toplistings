import type { EditablePost } from '@/components/blog-form';
import { FormShell } from './form-shell';
import { FormField, Section, SwitchField, inputCls, selectCls, textareaCls } from './kit';
import { OgPicker, type OgOption } from './og-picker';

/**
 * The blog post form in the admin design: Post, Publishing and SEO cards with
 * a sticky save bar. Field names match saveBlogPost, which decides create vs
 * update by `id`.
 */
export function PostEditor({
  action,
  post,
  tags = [],
  categories,
  ogOptions,
}: {
  action: (fd: FormData) => Promise<void>;
  post?: EditablePost;
  tags?: string[];
  categories: { id: string; name: string }[];
  ogOptions: OgOption[];
}) {
  const content = (
    <>
      <Section title="Post">
        <FormField label="Title" htmlFor="p-title" required full>
          <input id="p-title" name="title" required defaultValue={post?.title} className={inputCls} />
        </FormField>
        <FormField label="Slug" htmlFor="p-slug" help="Leave blank to make one from the title.">
          <div className="flex items-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-white focus-within:border-[#1884E7]">
            <span className="pl-3 text-sm text-[#94A3B8]">/blog/</span>
            <input
              id="p-slug"
              name="slug"
              defaultValue={post?.slug}
              className="h-[38px] min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
            />
          </div>
        </FormField>
        <FormField label="Category" htmlFor="p-cat">
          <select id="p-cat" name="category_id" defaultValue={post?.category_id ?? ''} className={selectCls}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Tags" htmlFor="p-tags" full help="Separate with commas. New tags are created; this list replaces the post’s tags.">
          <input id="p-tags" name="tags" defaultValue={tags.join(', ')} placeholder="Local SEO, Reviews" className={inputCls} />
        </FormField>
        <FormField label="Standfirst" htmlFor="p-stand" full help="The short intro under the title.">
          <textarea id="p-stand" name="standfirst" rows={2} defaultValue={post?.standfirst ?? ''} className={textareaCls} />
        </FormField>
        <FormField
          label="Body"
          htmlFor="p-body"
          full
          help={
            <>
              Markdown supported: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>,{' '}
              <code>[text](https://…)</code> and lists. Reading time is worked out on save.
            </>
          }
        >
          <textarea
            id="p-body"
            name="body"
            rows={14}
            defaultValue={post?.body ?? ''}
            className={`${textareaCls} font-mono`}
          />
        </FormField>
      </Section>

      <Section title="Publishing">
        <SwitchField
          name="is_published"
          label="Published"
          defaultChecked={post?.is_published}
          help={
            post?.published_at
              ? `First published ${new Date(post.published_at).toLocaleDateString('en-GB')}. The date is kept if you unpublish and publish again.`
              : 'Off keeps it as a draft that only staff can see.'
          }
        />
        <SwitchField name="is_featured" label="Featured on blog home" defaultChecked={post?.is_featured} />
      </Section>

      <Section title="SEO">
        <FormField label="SEO title" htmlFor="p-seot" full help="Aim for 60 characters or fewer. Blank uses the post title.">
          <input id="p-seot" name="seo_title" defaultValue={post?.seo_title ?? ''} className={inputCls} />
        </FormField>
        <FormField label="Meta description" htmlFor="p-seod" full help="Aim for 160 characters or fewer.">
          <textarea id="p-seod" name="seo_description" rows={3} defaultValue={post?.seo_description ?? ''} className={textareaCls} />
        </FormField>
        <FormField label="Canonical URL" htmlFor="p-can" full help="Leave blank to use this post’s own address.">
          <input id="p-can" name="canonical_url" type="url" defaultValue={post?.canonical_url ?? ''} placeholder="https://" className={inputCls} />
        </FormField>
        <FormField label="Social share image (OG)" full isNew>
          <OgPicker options={ogOptions} />
        </FormField>
      </Section>
    </>
  );

  return (
    <FormShell
      action={action}
      hidden={post ? <input type="hidden" name="id" value={post.id} /> : null}
      panels={[{ id: 'post', label: 'Post', content }]}
      saveLabel={post ? 'Save changes' : 'Add post'}
      alwaysShowBar={!post}
    />
  );
}
