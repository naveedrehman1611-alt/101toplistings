/** Pure slug builder: no React, no browser APIs, so it can be tested in Node. */

export type SlugOptions = {
  separator: '-' | '_';
  lowercase: boolean;
  removeStopWords: boolean;
  transliterate: boolean;
  keepNonLatin: boolean;
  /** 0 = no limit. */
  maxLength: number;
};

export const DEFAULT_SLUG_OPTIONS: SlugOptions = {
  separator: '-',
  lowercase: true,
  removeStopWords: false,
  transliterate: true,
  keepNonLatin: true,
  maxLength: 0,
};

export const STOP_WORDS = new Set(
  (
    'a an the and or but nor of to in on for with at by from into onto upon about as ' +
    'is are was were be been being am it its this that these those than then so ' +
    'if do does did vs via your our their my his her'
  ).split(' '),
);

/** Letters NFKD cannot decompose to plain Latin. */
const SPECIAL: Record<string, string> = {
  ß: 'ss',
  ẞ: 'SS',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  ł: 'l',
  Ł: 'L',
  þ: 'th',
  Þ: 'TH',
  ı: 'i',
  ħ: 'h',
  Ħ: 'H',
};
const SPECIAL_RE = new RegExp(`[${Object.keys(SPECIAL).join('')}]`, 'g');

export function slugify(text: string, opts: SlugOptions = DEFAULT_SLUG_OPTIONS): string {
  let s = text;

  // Programming-language names that would otherwise collapse to "c".
  s = s.replace(/(^|[^\p{L}\p{N}])c\+\+(?![\p{L}\p{N}])/giu, '$1cpp');
  s = s.replace(/(^|[^\p{L}\p{N}])c#(?![\p{L}\p{N}])/giu, '$1csharp');
  s = s.replace(/&/g, ' and ');
  // Apostrophes join words: don't -> dont, Google's -> googles.
  s = s.replace(/['’‘ʼ`´]/g, '');
  // Zero-width joiners sit inside Urdu/Persian words and emoji; drop them.
  s = s.replace(/[‌‍️]/g, '');

  if (opts.lowercase) s = s.toLowerCase();

  if (opts.transliterate) {
    s = s.replace(SPECIAL_RE, (ch) => SPECIAL[ch] ?? ch);
    // Strip accents from Latin letters only, so Devanagari vowel signs etc. survive.
    s = s
      .normalize('NFKD')
      .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
      .normalize('NFC');
  } else {
    s = s.normalize('NFC');
  }

  const wordRe = opts.keepNonLatin ? /[\p{L}\p{M}\p{N}]+/gu : /[A-Za-z0-9]+/g;
  let words: string[] = s.match(wordRe) ?? [];
  // A leading combining mark with no base letter is noise.
  words = words.map((w) => w.replace(/^\p{M}+/u, '')).filter(Boolean);

  if (opts.removeStopWords) {
    const kept = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
    if (kept.length) words = kept;
  }

  const sep = opts.separator;
  if (opts.maxLength > 0) {
    const limited: string[] = [];
    let len = 0;
    for (const w of words) {
      const next = len + (limited.length ? sep.length : 0) + w.length;
      if (next > opts.maxLength) break;
      limited.push(w);
      len = next;
    }
    // A single word longer than the limit is cut rather than dropped.
    if (!limited.length && words.length)
      limited.push([...(words[0] ?? '')].slice(0, opts.maxLength).join(''));
    words = limited;
  }

  return words.join(sep);
}
