import { Icon } from '@/components/icon';
import { Button } from '@/components/ui';
import { getPageContent } from '@/lib/content/get';

export default async function NotFound() {
  const c = (await getPageContent('errors')).not_found;
  return (
    <div className="container-page grid min-h-[60vh] grid-cols-1 place-items-center py-20 text-center">
      <div className="w-full max-w-md">
        <span className="bg-surface-container text-primary-container mx-auto grid size-14 place-items-center rounded-xl">
          <Icon name="travel_explore" size={28} />
        </span>
        <p className="font-label-sm text-label-sm text-primary-container mt-6 tracking-wider uppercase">
          {c.eyebrow}
        </p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">{c.heading}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">{c.text}</p>
        <form action="/search" className="mt-8 flex gap-2">
          <input
            type="search"
            name="q"
            placeholder={c.search_placeholder}
            aria-label={c.search_placeholder}
            className="border-border-subtle bg-surface-card font-body-md text-body-md text-on-surface placeholder:text-secondary focus:border-primary-container focus:ring-primary-container/20 h-11 min-w-0 flex-1 rounded-lg border px-4 outline-hidden transition focus:ring-2"
          />
          <Button type="submit">
            <Icon name="search" size={18} />
            {c.search_button}
          </Button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {c.links.map(({ link }, i) => (
            <Button key={`${link.href}|${i}`} href={link.href} variant="ghost">
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
