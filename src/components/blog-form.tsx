import { Check, Field, Select, SubmitButton, TextArea } from '@/components/admin-ui';

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  standfirst: string | null;
  body: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
};

/** Shared by /admin/blog/new and /admin/blog/[id]; the action decides create vs update by `id`. */
export function BlogForm({
  action,
  post,
  tags = [],
  categories,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  post?: EditablePost;
  tags?: string[];
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="sm:col-span-2">
        <Field label="Title" name="title" required defaultValue={post?.title} />
      </div>
      <Field
        label="Slug"
        name="slug"
        defaultValue={post?.slug}
        hint="The /blog/ address. Leave blank to make one from the title."
      />
      <Select
        label="Category"
        name="category_id"
        defaultValue={post?.category_id}
        emptyLabel="None"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <div className="sm:col-span-2">
        <TextArea label="Standfirst" name="standfirst" defaultValue={post?.standfirst} rows={2} />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="Body (markdown)" name="body" defaultValue={post?.body} rows={20} />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Blank line between paragraphs. <code>## Heading</code>, <code>### Subheading</code>,{' '}
          <code>**bold**</code>, <code>*italic*</code>, <code>[text](https://…)</code>, and lists
          starting with <code>-</code> or <code>1.</code> Reading time is worked out on save.
        </p>
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Tags"
          name="tags"
          defaultValue={tags.join(', ')}
          placeholder="Local SEO, Reviews"
          hint="Comma-separated. New tags are created; this list replaces the post's tags."
        />
      </div>
      <Field label="SEO title" name="seo_title" defaultValue={post?.seo_title} />
      <Field
        label="Canonical URL"
        name="canonical_url"
        type="url"
        defaultValue={post?.canonical_url}
        placeholder="https://"
        hint="Leave blank to use this post's own address."
      />
      <div className="sm:col-span-2">
        <TextArea
          label="SEO description"
          name="seo_description"
          defaultValue={post?.seo_description}
          rows={2}
        />
      </div>
      <Check label="Featured" name="is_featured" defaultChecked={post?.is_featured} />
      <Check label="Published" name="is_published" defaultChecked={post?.is_published} />
      {post?.published_at ? (
        <p className="text-xs text-[var(--text-muted)] sm:col-span-2">
          First published {new Date(post.published_at).toLocaleDateString('en-GB')}. The date is
          kept if you unpublish and publish again.
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
