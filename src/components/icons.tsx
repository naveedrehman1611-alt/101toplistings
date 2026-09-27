import { ICON_NODES, type IconNode } from './icon-nodes';
import { SvgIcon, XLogo, type SvgIconProps } from './svg-icon';

/**
 * Icons by name, for names stored in the database (section items, social
 * links). This pulls in every icon, so use it from server components; client
 * components import SvgIcon and single nodes instead (see ./svg-icon).
 *
 * The set is generated from Lucide (ISC) and simple-icons (CC0) into
 * ./icon-nodes.ts. To add one, copy its node array from lucide-static's
 * icon-nodes.json into that file and add it to ICON_NODES.
 */

export type IconName = keyof typeof ICON_NODES | 'x-logo';

export const ICON_NAMES = [...Object.keys(ICON_NODES), 'x-logo'].sort() as IconName[];

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && (value === 'x-logo' || value in ICON_NODES);
}

/** Renders nothing for an empty or unknown name, so a bad value never breaks a page. */
export function Icon({ name, ...props }: SvgIconProps & { name: string | null | undefined }) {
  if (!name) return null;
  if (name === 'x-logo') return <XLogo {...props} />;
  const node = (ICON_NODES as Record<string, IconNode>)[name];
  return node ? <SvgIcon node={node} {...props} /> : null;
}
