/** Posts | Blog categories, above both blog tables. */
export const BLOG_TABS = (active: 'posts' | 'cats') => [
  { label: 'Posts', href: '/admin/blog', active: active === 'posts' },
  { label: 'Blog categories', href: '/admin/blog/categories', active: active === 'cats' },
];
