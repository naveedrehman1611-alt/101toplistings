/**
 * Pure keyword-density analysis for the free Keyword Density Checker. Runs in
 * the visitor's browser; no DOM or network access here so it can be tested
 * with plain Node.
 */

/** Common English function words, ignored as single keywords and as n-gram edges. */
export const STOPWORDS = new Set(
  (
    "a about above after again against all also am an and any are aren't as at be because been before being " +
    "below between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down " +
    "during each even ever every few for from further get gets got had hadn't has hasn't have haven't having he " +
    "he'd he'll he's her here here's hers herself him himself his how how's however i i'd i'll i'm i've if in " +
    "into is isn't it it's its itself just let's like many may me might more most much must mustn't my myself " +
    'no nor not now of off often on once one only or other ought our ours ourselves out over own per quite rather ' +
    "really same shall shan't she she'd she'll she's should shouldn't since so some still such than that " +
    "that's the their theirs them themselves then there there's these they they'd they'll they're they've " +
    "this those though through thus to too under until up upon us use used using very via was wasn't we we'd " +
    "we'll we're we've well were weren't what what's when when's where where's whether which while who who's " +
    "whom whose why why's will with within without won't would wouldn't yet you you'd you'll you're you've " +
    'your yours yourself yourselves etc ok okay'
  ).split(' '),
);

const WORD_RE = /[\p{L}\p{M}\p{N}']+/gu;
const NUMBER_RE = /^[\p{N}']+$/u;
/** Sentence/clause boundaries: phrases never span these. */
const BREAK_RE = /[.!?;:\n\r…。()[\]{}"|]+/u;
const SENTENCE_RE = /[.!?…。]+(?=\s|$)|\n{2,}/u;

/** Lowercase, unify curly apostrophes and trim stray apostrophes from a token. */
function normalise(token: string): string {
  return token.toLowerCase().replace(/^'+|'+$/g, '');
}

/**
 * Splits text into runs of words that can form phrases. Numbers and one-letter
 * tokens are dropped and break the run, so "page 2 results" yields no
 * "page results".
 */
export function segments(text: string): string[][] {
  const out: string[][] = [];
  for (const part of text.replace(/[‘’ʼ]/g, "'").split(BREAK_RE)) {
    let run: string[] = [];
    for (const raw of part.match(WORD_RE) ?? []) {
      const w = normalise(raw);
      if (w.length < 2 || NUMBER_RE.test(w)) {
        if (run.length) out.push(run);
        run = [];
      } else {
        run.push(w);
      }
    }
    if (run.length) out.push(run);
  }
  return out;
}

/** Tokens of a short string (title, keyword) in order, numbers kept out. */
export function tokens(text: string): string[] {
  return segments(text).flat();
}

export type Phrase = { phrase: string; count: number; density: number; inTitle: boolean };

export type DensityReport = {
  /** Words counted for density (numbers and single letters excluded). */
  totalWords: number;
  uniqueWords: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  /** Minutes at 200 words per minute, rounded up (0 for empty text). */
  readingMinutes: number;
  /** Top phrases for 1, 2 and 3 words, most frequent first. */
  ngrams: Record<1 | 2 | 3, Phrase[]>;
  keyword: null | {
    phrase: string;
    count: number;
    density: number;
    inTitle: boolean;
    inFirst100: boolean;
  };
};

function containsSeq(haystack: string[], needle: string[]): boolean {
  return countSeq(haystack, needle) > 0;
}

function countSeq(haystack: string[], needle: string[]): number {
  if (!needle.length || needle.length > haystack.length) return 0;
  let n = 0;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    n++;
  }
  return n;
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Analyses `text`. Density of a phrase = occurrences ÷ total words × 100,
 * the same denominator for every phrase length. Single words skip stopwords;
 * two- and three-word phrases skip those that start or end with a stopword.
 */
export function analyse(
  text: string,
  opts: { title?: string; keyword?: string; limit?: number } = {},
): DensityReport {
  const limit = opts.limit ?? 50;
  const segs = segments(text);
  const words = segs.flat();
  const total = words.length;
  const titleTokens = tokens(opts.title ?? '');

  const counts: Record<1 | 2 | 3, Map<string, number>> = {
    1: new Map(),
    2: new Map(),
    3: new Map(),
  };
  for (const seg of segs) {
    for (let i = 0; i < seg.length; i++) {
      for (const n of [1, 2, 3] as const) {
        if (i + n > seg.length) break;
        const first = seg[i];
        const last = seg[i + n - 1];
        if (STOPWORDS.has(first) || STOPWORDS.has(last)) continue;
        const key = seg.slice(i, i + n).join(' ');
        counts[n].set(key, (counts[n].get(key) ?? 0) + 1);
      }
    }
  }

  const top = (n: 1 | 2 | 3): Phrase[] =>
    [...counts[n]]
      // A repeated phrase is a pattern; a phrase seen once is noise (except single words).
      .filter(([, c]) => n === 1 || c > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: total ? round2((count / total) * 100) : 0,
        inTitle: containsSeq(titleTokens, phrase.split(' ')),
      }));

  let keyword: DensityReport['keyword'] = null;
  const kw = tokens(opts.keyword ?? '');
  if (kw.length) {
    const count = segs.reduce((sum, seg) => sum + countSeq(seg, kw), 0);
    keyword = {
      phrase: kw.join(' '),
      count,
      density: total ? round2((count / total) * 100) : 0,
      inTitle: containsSeq(titleTokens, kw),
      // Within the first 100 counted words, without crossing a sentence break.
      inFirst100: (() => {
        let seen = 0;
        for (const seg of segs) {
          const slice = seg.slice(0, Math.max(0, 100 - seen));
          if (countSeq(slice, kw)) return true;
          seen += seg.length;
          if (seen >= 100) return false;
        }
        return false;
      })(),
    };
  }

  const trimmed = text.trim();
  return {
    totalWords: total,
    uniqueWords: new Set(words).size,
    characters: trimmed.length,
    charactersNoSpaces: trimmed.replace(/\s+/g, '').length,
    sentences: trimmed
      ? trimmed.split(SENTENCE_RE).filter((s) => /[\p{L}\p{N}]/u.test(s)).length
      : 0,
    readingMinutes: total ? Math.ceil(total / 200) : 0,
    ngrams: { 1: top(1), 2: top(2), 3: top(3) },
    keyword,
  };
}
