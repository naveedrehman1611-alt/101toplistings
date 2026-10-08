'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/icon';
import { SiteLogo } from '@/components/site-logo';
import { drawer } from '@/lib/motion';
import { useSignedIn } from '@/lib/use-signed-in';
import { TOOLS_BASE, toolHref, toolsByCategory } from '@/lib/free-tools';
import { NewPill, SoonPill, ToolsMegaMenu } from '@/components/tools/tools-mega-menu';
import { SERVICES_BASE, ServicesMegaMenu, isServicePath } from '@/components/services-mega-menu';
import type { MenuItem } from '@/lib/queries';
import type { ServiceNavItem } from '@/lib/service-pages';

const ADD_LISTING = '/dashboard/listings/new';

const TOOL_CATEGORIES = toolsByCategory();

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

/** "Home" leads the menu unless the admin has already added a link to "/". */
function withHome(items: MenuItem[]): MenuItem[] {
  return items.some((item) => item.url === '/')
    ? items
    : [{ label: 'Home', url: '/', sort_order: 0 }, ...items];
}

/** "/" matches only the home page; any other path also covers the pages below it. */
function isActive(pathname: string, url: string): boolean {
  if (!url.startsWith('/') || url.startsWith('//') || /[?#]/.test(url)) return false;
  if (url === '/') return pathname === '/';
  const base = url.replace(/\/+$/, '');
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** An admin link to the services hub becomes the Services menu, in its place. */
function isServicesLink(item: MenuItem): boolean {
  return item.url.replace(/\/+$/, '') === SERVICES_BASE;
}

export function Header({
  brand,
  nav,
  mobileNav,
  services,
}: {
  brand: string;
  nav: MenuItem[];
  mobileNav: MenuItem[];
  services: ServiceNavItem[];
}) {
  const pathname = usePathname();
  // null while unknown: neither the login link nor the account icon shows yet.
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // While the drawer is open, focus starts on its close button and Escape
  // closes it; focus then goes back to the menu button.
  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  const primary = withHome(nav);
  // Without an admin link to the hub, the Services menu sits just before the tools.
  const servicesLink = primary.find(isServicesLink);
  // Login (or the account link) and Add Listing have their own buttons at the
  // foot of the drawer, and the services hub its own section.
  const drawerItems = withHome(mobileNav).filter(
    (item) => item.url !== '/login' && item.url !== ADD_LISTING && !isServicesLink(item),
  );

  return (
    <>
      <header className="bg-surface-card/90 sticky top-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className={`flex min-w-0 shrink items-center rounded-xl ${focusRing}`}>
              <SiteLogo alt={brand} eager className="h-9 w-auto sm:h-11 lg:h-10 xl:h-11" />
            </Link>

            {/* gap-4 until xl and gap-6 from xl: with the services and tools triggers, anything
                wider squeezes the logo once the admin adds a fifth or sixth menu link. */}
            <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex xl:gap-6">
              {primary.map((item) => {
                if (item === servicesLink) {
                  return (
                    <ServicesMegaMenu
                      key={`${item.url}|${item.label}`}
                      services={services}
                      label={item.label}
                    />
                  );
                }
                const active = isActive(pathname, item.url);
                return (
                  <Link
                    key={`${item.url}|${item.label}`}
                    href={item.url}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-sm whitespace-nowrap transition-colors ${focusRing} ${
                      active
                        ? 'text-primary-container font-semibold'
                        : 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {servicesLink ? null : <ServicesMegaMenu services={services} />}
              <ToolsMegaMenu />
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              {/* Signed out only. Shortened to "Login" from lg to xl, where the nav and
                  tools menu need the room. */}
              {signedIn === false ? (
                <Link
                  href="/login"
                  className={`font-label-md text-label-md text-on-surface-variant hover:text-on-surface hidden rounded-sm whitespace-nowrap transition-colors sm:inline-flex ${focusRing}`}
                >
                  Login<span className="lg:hidden xl:inline">&nbsp;/ Sign Up</span>
                </Link>
              ) : null}
              {/* Icon only below sm, so the bar fits a 360px screen. */}
              <Link
                href={ADD_LISTING}
                className={`bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary inline-flex size-10 items-center justify-center gap-2 rounded-lg shadow-xs transition-all hover:shadow-sm sm:size-auto sm:px-5 sm:py-2.5 ${focusRing}`}
              >
                <Icon name="add_circle" size={18} />
                <span className="sr-only sm:not-sr-only">Add Listing</span>
              </Link>
              {/* Signed in only. */}
              {signedIn ? (
                <Link
                  href="/dashboard"
                  aria-label="Your account"
                  className={`bg-primary hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:flex ${focusRing}`}
                >
                  <Icon name="person" size={18} className="text-on-primary" />
                </Link>
              ) : null}
              <button
                ref={menuButton}
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className={`border-border-subtle text-on-surface hover:bg-surface-container-low grid size-10 place-items-center rounded-lg border transition-colors lg:hidden ${focusRing}`}
              >
                <Icon name="menu" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Outside <header> on purpose: its backdrop-filter would make it the
          containing block of this fixed overlay, clipping it to the bar. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              className="bg-on-background/50 absolute inset-0 backdrop-blur-xs"
              onClick={close}
            />
            <motion.nav
              aria-label="Mobile"
              variants={drawer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-surface-card absolute top-0 right-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <SiteLogo alt={brand} className="h-9 w-auto min-w-0" />
                <button
                  ref={closeButton}
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className={`text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface grid size-10 shrink-0 place-items-center rounded-lg transition-colors ${focusRing}`}
                >
                  <Icon name="close" />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {drawerItems.map((item) => {
                  const active = isActive(pathname, item.url);
                  return (
                    <li key={`${item.url}|${item.label}`}>
                      <Link
                        href={item.url}
                        onClick={close}
                        aria-current={active ? 'page' : undefined}
                        className={`font-label-md text-label-md block rounded-lg px-3 py-3 transition-colors ${focusRing} ${
                          active
                            ? 'bg-surface-container-low text-primary-container font-semibold'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-controls="mobile-services"
                    onClick={() => setServicesOpen((v) => !v)}
                    className={`font-label-md text-label-md flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors ${focusRing} ${
                      isServicePath(pathname, services)
                        ? 'text-primary-container font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    SEO Services
                    <Icon
                      name="expand_more"
                      size={20}
                      className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div id="mobile-services" hidden={!servicesOpen} className="px-3 pb-2">
                    <ul className="mt-1 flex flex-col">
                      {services.map((service) => (
                        <li key={service.slug}>
                          <Link
                            href={service.path}
                            onClick={close}
                            aria-current={pathname === service.path ? 'page' : undefined}
                            className={`font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${focusRing}`}
                          >
                            <Icon
                              name={service.icon}
                              size={18}
                              className="text-primary-container shrink-0"
                            />
                            <span className="min-w-0 flex-1">{service.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={SERVICES_BASE}
                      onClick={close}
                      className={`font-label-md text-label-md text-primary-container mt-1 inline-flex items-center gap-1 rounded-sm px-2 py-2 font-semibold ${focusRing}`}
                    >
                      View all SEO services
                      <Icon name="north_east" size={16} />
                    </Link>
                  </div>
                </li>
                <li>
                  <button
                    type="button"
                    aria-expanded={toolsOpen}
                    aria-controls="mobile-free-tools"
                    onClick={() => setToolsOpen((v) => !v)}
                    className={`font-label-md text-label-md flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors ${focusRing} ${
                      isActive(pathname, TOOLS_BASE)
                        ? 'text-primary-container font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    Free SEO Tools
                    <Icon
                      name="expand_more"
                      size={20}
                      className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div id="mobile-free-tools" hidden={!toolsOpen} className="px-3 pb-2">
                    {TOOL_CATEGORIES.map((category) => (
                      <div key={category.id} className="mt-3">
                        <p className="font-label-sm text-label-sm text-secondary mb-1 tracking-wider uppercase">
                          {category.label}
                        </p>
                        <ul className="flex flex-col">
                          {category.tools.map((tool) => (
                            <li key={tool.slug}>
                              {tool.status === 'live' ? (
                                <Link
                                  href={toolHref(tool)}
                                  onClick={close}
                                  aria-current={pathname === toolHref(tool) ? 'page' : undefined}
                                  className={`font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${focusRing}`}
                                >
                                  <Icon
                                    name={tool.icon}
                                    size={18}
                                    className="text-primary-container shrink-0"
                                  />
                                  <span className="min-w-0 flex-1">{tool.name}</span>
                                  {tool.isNew ? <NewPill /> : null}
                                </Link>
                              ) : (
                                <span
                                  aria-disabled="true"
                                  className="font-body-sm text-body-sm text-secondary flex items-center gap-2 px-2 py-2 opacity-70"
                                >
                                  <Icon name={tool.icon} size={18} className="shrink-0" />
                                  <span className="min-w-0 flex-1">{tool.name}</span>
                                  <SoonPill />
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link
                      href={TOOLS_BASE}
                      onClick={close}
                      className={`font-label-md text-label-md text-primary-container mt-3 inline-flex items-center gap-1 rounded-sm px-2 py-2 font-semibold ${focusRing}`}
                    >
                      View all free tools
                      <Icon name="north_east" size={16} />
                    </Link>
                  </div>
                </li>
              </ul>

              <div className="border-border-subtle mt-6 flex flex-col gap-3 border-t pt-6">
                {signedIn === null ? null : (
                  <Link
                    href={signedIn ? '/dashboard' : '/login'}
                    onClick={close}
                    className={`border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low inline-flex h-11 items-center justify-center gap-2 rounded-lg border transition-colors ${focusRing}`}
                  >
                    {signedIn ? (
                      <>
                        <Icon name="person" size={18} />
                        Your Account
                      </>
                    ) : (
                      'Login / Sign Up'
                    )}
                  </Link>
                )}
                <Link
                  href={ADD_LISTING}
                  onClick={close}
                  className={`bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg shadow-xs transition-all hover:shadow-sm ${focusRing}`}
                >
                  <Icon name="add_circle" size={18} />
                  Add Listing
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
