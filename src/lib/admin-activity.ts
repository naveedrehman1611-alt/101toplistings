import 'server-only';

/**
 * Turns audit_logs rows into readable lines for the dashboard and the audit
 * log viewer: "Sameer Ali · approved listing · Iron Paradise Fitness".
 */

export type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: { display_name: string | null } | null;
};

export const AUDIT_SELECT =
  'id, action, entity_type, entity_id, before, after, ip_address, created_at, actor:profiles(display_name)';

const VERB: Record<string, string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  approve: 'approved',
  reject: 'rejected',
  suspend: 'suspended',
  restore: 'restored',
  login: 'signed in',
};

const NOUN: Record<string, string> = {
  listing: 'listing',
  review: 'review on',
  claim: 'claim for',
  form_submission: 'inbox message',
  newsletter_subscriber: 'subscriber',
  blog_post: 'post',
  blog_category: 'blog category',
  category: 'category',
  country: 'country',
  region: 'region',
  city: 'city',
  media: 'image',
  menu_item: 'menu link',
  page_section: 'section',
  section_item: 'section item',
  seo_meta: 'SEO for',
  redirect: 'redirect',
  setting: 'setting',
  profile: 'user',
  site_content: 'content',
};

/** Which filter tab an entity belongs to in the audit log. */
export function auditArea(
  entityType: string,
): 'listing' | 'review' | 'content' | 'user' | 'settings' {
  if (entityType === 'listing' || entityType === 'claim') return 'listing';
  if (entityType === 'review') return 'review';
  if (entityType === 'profile') return 'user';
  if (entityType === 'setting') return 'settings';
  return 'content';
}

export const AREA_COLOR: Record<ReturnType<typeof auditArea>, string> = {
  listing: '#0C8226',
  review: '#F59E0B',
  content: '#1884E7',
  user: '#0E7A7C',
  settings: '#062347',
};

function pick(o: Record<string, unknown> | null): string | null {
  if (!o) return null;
  for (const k of [
    'name',
    'title',
    'label',
    'display_name',
    'email',
    'source',
    'route',
    'key',
    'path',
    'heading',
  ]) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) {
      if (k === 'source' && typeof o.destination === 'string') return `${v} → ${o.destination}`;
      return v;
    }
  }
  return null;
}

export function describeAudit(r: AuditRow) {
  const verb = VERB[r.action] ?? r.action;
  const noun = NOUN[r.entity_type] ?? r.entity_type.replace(/_/g, ' ');
  const target = pick(r.after) ?? pick(r.before) ?? (r.entity_id ? r.entity_id.slice(0, 8) : '');
  return {
    user: r.actor?.display_name ?? 'Someone',
    action: `${verb} ${noun}`,
    target,
    area: auditArea(r.entity_type),
  };
}
