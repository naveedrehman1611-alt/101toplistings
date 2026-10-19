import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServicePageView } from '@/components/service-page';
import { Icon } from '@/components/icon';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { ServiceCard } from '@/components/services-hub/service-card';
import { getPageContent } from '@/lib/content/get';
import { serviceKey } from '@/lib/content/pages/services';
import { SERVICE_PAGES, WEB_DEVELOPMENT_BASE, servicePage } from '@/lib/service-pages';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const PAGE = servicePage('web-development');

export async function generateMetadata(): Promise<Metadata> {
  if (!PAGE) return {};
  return seoMetadata('/web-development-services', {
    title: PAGE.title,
    description: PAGE.description,
    openGraph: { title: PAGE.title, description: PAGE.description },
    twitter: { card: 'summary_large_image', title: PAGE.title },
  });
}

/**
 * The web development landing page plus blocks listing the pages under it and
 * the technologies we build with. Those blocks' copy is the "Web development"
 * page in Admin → Content; the rest is its section under "Service pages".
 */
export default async function WebDevelopmentPage() {
  if (!PAGE) notFound();
  const [content, services, template] = await Promise.all([
    getPageContent('web_development'),
    getPageContent('service'),
    getPageContent('service_template'),
  ]);
  const { sub_services: c, technologies: tech } = content;
  const subServices = SERVICE_PAGES.filter((p) => p.path.startsWith(`${WEB_DEVELOPMENT_BASE}/`));
  const showTech = tech.visible && tech.items.length > 0;
  return (
    <ServicePageView
      page={PAGE}
      // Related services repeat sub-service cards; only a hidden block leaves them in.
      extraSlugs={c.visible ? subServices.map((s) => s.slug) : []}
      extra={
        c.visible || showTech ? (
          <>
            {c.visible ? (
              <section aria-labelledby="sp-sub-services">
                <HubSectionHeader
                  id="sp-sub-services"
                  icon={c.icon}
                  title={c.heading}
                  count={`${subServices.length} ${c.count}`}
                />
                {c.intro ? (
                  <p className="-mt-2 mb-6 max-w-3xl text-[var(--text-muted)]">{c.intro}</p>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subServices.map((s) => (
                    <ServiceCard
                      key={s.slug}
                      service={s}
                      tag={services[serviceKey(s.slug)]?.tag ?? s.tag}
                      learnMore={template.related.learn_more}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showTech ? (
              <section aria-labelledby="sp-tech" className={c.visible ? 'mt-16' : undefined}>
                <HubSectionHeader
                  id="sp-tech"
                  icon={tech.icon}
                  title={tech.heading}
                  count={`${tech.items.length} ${tech.count}`}
                />
                {tech.intro ? (
                  <p className="-mt-2 mb-6 max-w-3xl text-[var(--text-muted)]">{tech.intro}</p>
                ) : null}
                <ul className="flex flex-wrap gap-3">
                  {tech.items.map((item, i) => (
                    <li
                      key={`${i}-${item.name}`}
                      className="border-border-subtle text-on-surface inline-flex items-center gap-1.5 rounded-full border-[1.5px] bg-white px-4 py-2 text-[13px] font-bold"
                    >
                      <Icon name="check_circle" size={16} className="text-primary-container" />
                      {item.name}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
