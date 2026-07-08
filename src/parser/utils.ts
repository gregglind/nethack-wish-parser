/** NetHack mungspaces(): collapse runs of whitespace to single spaces and trim. */
export function mungspaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Simplified stand-in for NetHack's makesingular(). Handles common regular
 * plurals plus a small irregular-word exception list covering the items in
 * our curated object database. Not a full reimplementation -- see the
 * ScopeNotice in the UI.
 */
const IRREGULAR_PLURALS: Record<string, string> = {
  knives: 'knife',
  staves: 'staff',
  wolves: 'wolf',
  leaves: 'leaf',
  loaves: 'loaf',
  teeth: 'tooth',
  feet: 'foot',
  mice: 'mouse',
  dice: 'die',
  gauntlets: 'gauntlets', // proper noun-ish plural-looking singular; leave as-is
  clothes: 'clothes', // exempted in the real code too
  tricks: 'tricks', // exempted in the real code too ("bag of tricks")
  boots: 'boots', // footwear items are canonically named in plural form
  shoes: 'shoes',
  gloves: 'gloves',
};

export function makesingular(raw: string): { result: string; changed: boolean } {
  const words = raw.split(' ');
  const last = words[words.length - 1];
  const lower = last.toLowerCase();

  if (lower in IRREGULAR_PLURALS) {
    const singular = IRREGULAR_PLURALS[lower];
    if (singular === lower) return { result: raw, changed: false };
    words[words.length - 1] = singular;
    return { result: words.join(' '), changed: true };
  }

  if (lower.endsWith('ies') && lower.length > 3) {
    words[words.length - 1] = last.slice(0, -3) + 'y';
    return { result: words.join(' '), changed: true };
  }
  if (lower.endsWith('ses') && lower.length > 3) {
    words[words.length - 1] = last.slice(0, -2);
    return { result: words.join(' '), changed: true };
  }
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 1) {
    words[words.length - 1] = last.slice(0, -1);
    return { result: words.join(' '), changed: true };
  }
  return { result: raw, changed: false };
}

/** Fuzzy match ignoring spaces, hyphens, and case -- mirrors wishymatch()'s base fuzzymatch(). */
export function fuzzyEquals(a: string, b: string): boolean {
  const strip = (s: string) => s.toLowerCase().replace(/[\s-]/g, '');
  return strip(a) === strip(b);
}

export function fuzzyIncludes(haystack: string, needle: string): boolean {
  const strip = (s: string) => s.toLowerCase().replace(/[\s-]/g, '');
  return strip(haystack).includes(strip(needle));
}

/** "of"-swap retry: "potion of healing" <-> "healing potion". */
export function invertOf(name: string): string | null {
  const m = /^(.*) of (.*)$/i.exec(name);
  if (!m) return null;
  return `${m[2]} ${m[1]}`;
}

export function stripPrefix(s: string, prefix: string): string | null {
  if (s.toLowerCase().startsWith(prefix.toLowerCase())) {
    return s.slice(prefix.length);
  }
  return null;
}

export function stripSuffix(s: string, suffix: string): string | null {
  if (s.toLowerCase().endsWith(suffix.toLowerCase())) {
    return s.slice(0, s.length - suffix.length);
  }
  return null;
}

export function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function article(word: string): 'an' | 'a' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}
