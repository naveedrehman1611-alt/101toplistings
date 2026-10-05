/** Pure robots.txt builder: no React, no browser APIs, so it can be tested in Node. */

export type DefaultPolicy = 'allow' | 'disallow' | 'custom';
export type BotRule = 'default' | 'allow' | 'block';

export type BotInfo = { name: string; owner: string; purpose: string };

export const SEARCH_BOTS: BotInfo[] = [
  { name: 'Googlebot', owner: 'Google', purpose: 'Google Search crawler' },
  { name: 'Googlebot-Image', owner: 'Google', purpose: 'Google Images' },
  { name: 'Bingbot', owner: 'Microsoft', purpose: 'Bing Search (also feeds Copilot)' },
  { name: 'Yandex', owner: 'Yandex', purpose: 'Yandex Search' },
  { name: 'Baiduspider', owner: 'Baidu', purpose: 'Baidu Search' },
  { name: 'DuckDuckBot', owner: 'DuckDuckGo', purpose: 'DuckDuckGo Search' },
  { name: 'Applebot', owner: 'Apple', purpose: 'Siri and Spotlight search' },
];

export type AiBotKind = 'training' | 'search' | 'user';

export const AI_BOTS: (BotInfo & { kind: AiBotKind })[] = [
  { name: 'GPTBot', owner: 'OpenAI', purpose: 'Collects training data', kind: 'training' },
  { name: 'OAI-SearchBot', owner: 'OpenAI', purpose: 'ChatGPT search index', kind: 'search' },
  {
    name: 'ChatGPT-User',
    owner: 'OpenAI',
    purpose: 'Fetches pages a user asks about',
    kind: 'user',
  },
  { name: 'ClaudeBot', owner: 'Anthropic', purpose: 'Collects training data', kind: 'training' },
  { name: 'Claude-SearchBot', owner: 'Anthropic', purpose: 'Claude search index', kind: 'search' },
  {
    name: 'Claude-User',
    owner: 'Anthropic',
    purpose: 'Fetches pages a user asks about',
    kind: 'user',
  },
  {
    name: 'PerplexityBot',
    owner: 'Perplexity',
    purpose: 'Perplexity search index',
    kind: 'search',
  },
  {
    name: 'Perplexity-User',
    owner: 'Perplexity',
    purpose: 'Fetches pages a user asks about',
    kind: 'user',
  },
  {
    name: 'Google-Extended',
    owner: 'Google',
    purpose: 'Gemini training and grounding (not Search)',
    kind: 'training',
  },
  {
    name: 'Applebot-Extended',
    owner: 'Apple',
    purpose: 'Apple AI model training',
    kind: 'training',
  },
  {
    name: 'CCBot',
    owner: 'Common Crawl',
    purpose: 'Open web dataset used for AI training',
    kind: 'training',
  },
  { name: 'Bytespider', owner: 'ByteDance', purpose: 'AI training data', kind: 'training' },
  {
    name: 'Amazonbot',
    owner: 'Amazon',
    purpose: 'Alexa answers and AI training',
    kind: 'training',
  },
  { name: 'meta-externalagent', owner: 'Meta', purpose: 'Meta AI training data', kind: 'training' },
];

export const ALL_BOTS = [...SEARCH_BOTS, ...AI_BOTS];

export type RobotsConfig = {
  policy: DefaultPolicy;
  /** Used only when policy is 'custom'. */
  disallow: string[];
  allow: string[];
  /** Seconds, as typed; blank means none. */
  crawlDelay: string;
  bots: Record<string, BotRule>;
  sitemaps: string[];
};

export type RobotsWarning = { level: 'danger' | 'warn'; text: string };

const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);

function uniq(list: string[]) {
  return [...new Set(list)];
}

/** Lines of the `User-agent: *` group, without the User-agent line. */
function defaultGroupRules(config: RobotsConfig): string[] {
  const lines: string[] = [];
  if (config.policy === 'allow') lines.push('Disallow:');
  else if (config.policy === 'disallow') lines.push('Disallow: /');
  else {
    const disallow = uniq(clean(config.disallow));
    const allow = uniq(clean(config.allow));
    if (!disallow.length && !allow.length) lines.push('Disallow:');
    // Allow lines first: easier to read; precedence is by path length anyway.
    allow.forEach((p) => lines.push(`Allow: ${p}`));
    disallow.forEach((p) => lines.push(`Disallow: ${p}`));
  }
  const delay = config.crawlDelay.trim();
  if (delay && Number(delay) > 0) lines.push(`Crawl-delay: ${Number(delay)}`);
  return lines;
}

export function isAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname;
  } catch {
    return false;
  }
}

export function buildRobots(config: RobotsConfig): string {
  const out: string[] = [
    '# robots.txt',
    '# Generated with the RankYouSite free Robots.txt Generator',
    '# Upload to the root of your domain, e.g. https://example.com/robots.txt',
    '',
    'User-agent: *',
    ...defaultGroupRules(config),
  ];

  // One group per rule type; user-agents sharing identical rules are merged.
  const blocked = ALL_BOTS.filter((b) => config.bots[b.name] === 'block').map((b) => b.name);
  const allowed = ALL_BOTS.filter((b) => config.bots[b.name] === 'allow').map((b) => b.name);
  if (allowed.length) {
    out.push('', ...allowed.map((n) => `User-agent: ${n}`), 'Allow: /');
  }
  if (blocked.length) {
    out.push('', ...blocked.map((n) => `User-agent: ${n}`), 'Disallow: /');
  }

  const sitemaps = uniq(clean(config.sitemaps).filter(isAbsoluteUrl));
  if (sitemaps.length) out.push('', ...sitemaps.map((s) => `Sitemap: ${s}`));

  return out.join('\n') + '\n';
}

function duplicates(list: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const item of list) (seen.has(item) ? dup : seen).add(item);
  return [...dup];
}

export function robotsWarnings(config: RobotsConfig): RobotsWarning[] {
  const w: RobotsWarning[] = [];
  const disallow = config.policy === 'custom' ? clean(config.disallow) : [];
  const allow = config.policy === 'custom' ? clean(config.allow) : [];

  if (config.policy === 'disallow' || disallow.includes('/')) {
    w.push({
      level: 'danger',
      text: '“Disallow: /” for all robots blocks your whole site. Search engines will stop crawling it and pages will drop out of results. Only use this on staging or private sites.',
    });
  }
  if (config.bots.Googlebot === 'block' || config.bots.Bingbot === 'block') {
    w.push({
      level: 'danger',
      text: 'You are blocking Googlebot or Bingbot. Your pages will disappear from that search engine (Bing also powers Copilot and several other AI answers).',
    });
  }
  for (const p of [...disallow, ...allow]) {
    if (!p.startsWith('/') && !p.startsWith('*')) {
      w.push({
        level: 'warn',
        text: `“${p}” should start with “/” (or “*”). Paths are relative to the domain root.`,
      });
    }
    if (/^https?:\/\//i.test(p)) {
      w.push({
        level: 'warn',
        text: `“${p}” is a full URL. robots.txt rules take a path only, e.g. /private/.`,
      });
    }
  }
  for (const d of duplicates(disallow))
    w.push({ level: 'warn', text: `Duplicate Disallow entry: ${d}` });
  for (const d of duplicates(allow)) w.push({ level: 'warn', text: `Duplicate Allow entry: ${d}` });
  for (const p of uniq(disallow.filter((d) => allow.includes(d)))) {
    w.push({
      level: 'warn',
      text: `“${p}” is in both lists. Google resolves equal-length ties in favour of Allow.`,
    });
  }

  const delay = config.crawlDelay.trim();
  if (delay && !(Number(delay) > 0)) {
    w.push({
      level: 'warn',
      text: 'Crawl-delay must be a positive number of seconds; it was left out.',
    });
  } else if (Number(delay) > 30) {
    w.push({
      level: 'warn',
      text: 'A crawl-delay above 30 seconds can stop Bing and Yandex from crawling enough of a large site.',
    });
  }

  const sitemaps = clean(config.sitemaps);
  for (const s of sitemaps.filter((s) => !isAbsoluteUrl(s))) {
    w.push({
      level: 'warn',
      text: `Sitemap “${s}” is not a full URL (https://…) and was left out.`,
    });
  }
  for (const d of duplicates(sitemaps)) w.push({ level: 'warn', text: `Duplicate sitemap: ${d}` });

  return w;
}
