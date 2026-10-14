// PLACEHOLDER TEAM DATA: every entry below is a stand-in, not a real person.
// Replace the names, roles, bios and (optional) photos with the real team's
// details before launch. Photos go in public/images/team/ and are referenced
// by their public path, e.g. photo: '/images/team/jane-doe.webp'. Entries
// without a photo render an initials avatar instead.

export type TeamMember = {
  name: string;
  role: string;
  /** Short 2–3 line bio; shown on founder cards only. */
  bio?: string;
  /** Public path under /images/team/; omit to show an initials avatar. */
  photo?: string;
};

export const FOUNDERS: TeamMember[] = [
  {
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    bio: 'Sets the agency’s direction and works closely with clients on strategy, making sure every campaign is tied to clear commercial goals and reported honestly.',
  },
  {
    name: 'Sam Taylor',
    role: 'Co-founder & Head of SEO',
    bio: 'Leads the SEO team and owns how campaigns are planned and delivered, from technical audits and keyword research to content and link building.',
  },
];

export const TEAM: TeamMember[] = [
  { name: 'Jordan Lee', role: 'Technical SEO Lead' },
  { name: 'Casey Brooks', role: 'Content Lead' },
  { name: 'Riley Evans', role: 'Link Building Lead' },
  { name: 'Morgan Hayes', role: 'Local SEO Specialist' },
  { name: 'Jamie Clarke', role: 'Web Development Lead' },
  { name: 'Taylor Reed', role: 'Client Success Manager' },
];

export const ADVISORS: TeamMember[] = [
  { name: 'Dr. Chris Bennett', role: 'Advisor on search data and analytics' },
  { name: 'Pat Sullivan', role: 'Advisor on digital marketing strategy' },
  { name: 'Robin Walsh', role: 'Advisor on small business growth' },
];

const TITLES = new Set(['dr', 'prof', 'mr', 'mrs', 'ms', 'mx', 'sir', 'dame']);

/** Initials from the first letters of the first two name words, skipping titles like "Dr.". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word && !TITLES.has(word.replace(/\.$/, '').toLowerCase()))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
