import { createElement, type SVGProps } from 'react';
import { X_LOGO_PATH, type IconNode } from './icon-nodes';

/**
 * Inline SVG icons: no icon font, no sprite request, no client JavaScript of
 * their own. Client components import SvgIcon and the single nodes they need
 * from ./icon-nodes, so a bundle only carries the icons it draws. Server code
 * that renders an icon chosen in the admin uses <Icon name> from ./icons.
 */

export type SvgIconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  size?: number;
  strokeWidth?: number;
  /** Accessible name. Without one the icon is decorative and hidden from assistive tech. */
  title?: string;
};

export function SvgIcon({
  node,
  size = 24,
  strokeWidth = 1.75,
  title,
  ...rest
}: SvgIconProps & { node: IconNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/** The X (Twitter) mark is a filled shape, unlike the stroked icons. */
export function XLogo({ size = 24, title, ...rest }: Omit<SvgIconProps, 'strokeWidth'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={X_LOGO_PATH} />
    </svg>
  );
}
