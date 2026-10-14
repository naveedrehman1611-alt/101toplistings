import Image from 'next/image';
import { ADVISORS, FOUNDERS, TEAM, initials, type TeamMember } from '@/lib/team';

// Eyebrow and highlight styles mirror the helpers in src/app/about/page.tsx.
const eyebrow =
  'font-label-sm text-label-sm text-primary-container inline-flex items-center gap-2.5 font-semibold tracking-[2px] uppercase';
const sectionTitle =
  'font-display text-[length:clamp(26px,3.2vw,40px)] leading-[1.2] font-extrabold text-on-surface';

/** Photo from /public when set, otherwise the member's initials on a grey-blue tile. */
function Avatar({
  member,
  className,
  sizePx,
  textClass,
}: {
  member: TeamMember;
  className: string;
  sizePx: number;
  textClass: string;
}) {
  return (
    <div className={`bg-surface-container-high relative shrink-0 overflow-hidden ${className}`}>
      {member.photo ? (
        <Image
          src={member.photo}
          alt={`Photo of ${member.name}`}
          fill
          sizes={`${sizePx}px`}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={`font-display grid size-full place-items-center font-extrabold text-[var(--text-muted)] ${textClass}`}
        >
          {initials(member.name)}
        </span>
      )}
    </div>
  );
}

export function TeamSection({ brand }: { brand: string }) {
  return (
    <section aria-labelledby="about-team" className="bg-surface-bg py-20 lg:py-[100px]">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className={eyebrow}>
            <span aria-hidden="true" className="bg-primary-container h-0.5 w-7" />
            Meet the team
          </p>
          <h2 id="about-team" className={`${sectionTitle} mt-4`}>
            The People Behind <span className="text-primary-container">{brand}</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
            A small, specialist team of SEO strategists, writers and developers. The people you meet
            at the start are the people who do the work.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 lg:grid-cols-2">
          {FOUNDERS.map((f) => (
            <li
              key={f.name}
              className="border-border-subtle rounded-card shadow-card flex flex-col gap-6 border bg-white p-6 sm:flex-row sm:items-center sm:p-7"
            >
              <Avatar
                member={f}
                sizePx={144}
                className="size-28 rounded-2xl sm:size-36"
                textClass="text-3xl sm:text-4xl"
              />
              <div>
                <h3 className="font-display text-on-surface text-xl font-extrabold">{f.name}</h3>
                <p className="text-primary-container mt-1 text-sm font-semibold">{f.role}</p>
                {f.bio ? (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{f.bio}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {TEAM.map((m) => (
            <li key={m.name} className="text-center">
              <Avatar
                member={m}
                sizePx={96}
                className="mx-auto size-24 rounded-full"
                textClass="text-2xl"
              />
              <h3 className="text-on-surface mt-4 text-[15px] font-bold">{m.name}</h3>
              <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">{m.role}</p>
            </li>
          ))}
        </ul>

        <h3 className="mt-16 text-center text-xs font-bold tracking-[2px] text-[var(--text-muted)] uppercase">
          Backed and guided by
        </h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {ADVISORS.map((a) => (
            <li
              key={a.name}
              className="border-border-subtle rounded-card flex items-center gap-4 border bg-white p-5"
            >
              <Avatar
                member={a}
                sizePx={56}
                className="size-14 rounded-full"
                textClass="text-base"
              />
              <div>
                <h4 className="text-on-surface text-[15px] font-bold">{a.name}</h4>
                <p className="mt-0.5 text-sm leading-snug text-[var(--text-muted)]">{a.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
