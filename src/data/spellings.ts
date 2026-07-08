/**
 * Curated subset of spellings[] (objnam.c:3403-3458) -- alternate names that
 * resolve to a real otyp even though they don't match objects[].oc_name.
 */
export const SPELLINGS: Record<string, string> = {
  pickax: 'PICK_AXE',
  pickaxe: 'PICK_AXE',
  whip: 'BULLWHIP',
  saber: 'SILVER_SABER',
  'silver sabre': 'SILVER_SABER',
  lantern: 'OIL_LAMP',
  mattock: 'DWARVISH_MATTOCK',
  can: 'TIN',
  cookie: 'FORTUNE_COOKIE',
  pie: 'CREAM_PIE',
  'amulet of poison resistance': 'AMULET_VERSUS_POISON',
  'amulet of protection': 'AMULET_OF_GUARDING',
  'amulet of telepathy': 'AMULET_OF_ESP',
  'gauntlets of ogre power': 'GAUNTLETS_OF_POWER',
  'gauntlets of giant strength': 'GAUNTLETS_OF_POWER',
  flintstone: 'FLINT',
  'luck stone': 'LUCKSTONE',
  'load stone': 'LOADSTONE',
  'touch stone': 'TOUCHSTONE',
};

/** normalize British spellings the way readobjnam_postparse1 does. */
export function normalizeBritishSpellings(s: string): string {
  return s
    .replace(/\barmour\b/gi, 'armor')
    .replace(/\bgrey\b/gi, 'gray')
    .replace(/\bcolour(ed)?\b/gi, (m) => (m.toLowerCase() === 'colour' ? 'color' : 'colored'));
}
