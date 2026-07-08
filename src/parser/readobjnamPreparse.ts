import type { ParseState, ParseStep, StepCategory } from './types';
import { SOURCE_REFS } from './sourceRefs';
import type { Rng } from './rng';

interface MatchResult {
  consumed: string;
  rest: string;
  diff: Partial<ParseState>;
  notes?: string[];
}

interface PreparseRule {
  id: string;
  title: string;
  category: StepCategory;
  sourceRef: (typeof SOURCE_REFS)[keyof typeof SOURCE_REFS];
  match(remaining: string, state: ParseState, rng: Rng): MatchResult | null;
}

/**
 * `words` are given with a trailing space (e.g. "blessed "). Matches that
 * trailing-space form when more text follows, but also matches the bare
 * word (no trailing space) when it is the entire remainder -- otherwise a
 * qualifier that happens to be the last word in the wish (e.g. just
 * "greased") would never match.
 */
function prefixWord(remaining: string, words: string[]): { word: string; rest: string } | null {
  const lower = remaining.toLowerCase();
  for (const w of words) {
    const wLower = w.toLowerCase();
    const bare = wLower.trimEnd();
    if (lower === bare) {
      return { word: remaining, rest: '' };
    }
    if (lower.startsWith(wLower)) {
      return { word: remaining.slice(0, wLower.length), rest: remaining.slice(wLower.length) };
    }
  }
  return null;
}

const RULES: PreparseRule[] = [
  {
    id: 'preparse:article-quantity',
    title: 'Article / quantity',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseArticleQuantity,
    match(remaining) {
      const hit = prefixWord(remaining, ['an ', 'a ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { cnt: 1 } };
      const the = prefixWord(remaining, ['the ']);
      if (the) return { consumed: the.word, rest: the.rest, diff: {} };
      if (remaining.trim() === '0') return null; // literal "0" is not a count
      const digits = /^(\d+)\s*/.exec(remaining);
      if (digits) {
        return {
          consumed: digits[0],
          rest: remaining.slice(digits[0].length),
          diff: { cnt: parseInt(digits[1], 10) },
        };
      }
      return null;
    },
  },
  {
    id: 'preparse:enchantment',
    title: 'Enchantment sign + number',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseEnchantment,
    match(remaining) {
      const m = /^([+-])(\d+)\s*/.exec(remaining);
      if (!m) return null;
      return {
        consumed: m[0],
        rest: remaining.slice(m[0].length),
        diff: { spe: parseInt(m[2], 10), spesgn: m[1] === '-' ? -1 : 1, spesgnExplicit: true },
      };
    },
  },
  {
    id: 'preparse:beatitude',
    title: 'Beatitude (blessed / uncursed / cursed)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseBlessed,
    match(remaining) {
      let hit = prefixWord(remaining, ['blessed ', 'holy ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { blessed: true } };
      hit = prefixWord(remaining, ['cursed ', 'unholy ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { iscursed: true } };
      hit = prefixWord(remaining, ['uncursed ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { uncursed: true } };
      return null;
    },
  },
  {
    id: 'preparse:erodeproof',
    title: 'Erosion-proofing synonym',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseErodeproof,
    match(remaining) {
      const hit = prefixWord(remaining, [
        'rustproof ', 'erodeproof ', 'corrodeproof ', 'fixed ',
        'fireproof ', 'rotproof ', 'tempered ', 'crackproof ',
      ]);
      if (!hit) return null;
      return {
        consumed: hit.word,
        rest: hit.rest,
        diff: { erodeproof: true },
        notes: ['NetHack does not distinguish which erosion type this protects against -- one flag covers fire/rust/corrosion/cracking.'],
      };
    },
  },
  {
    id: 'preparse:lit',
    title: 'Lit / unlit',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseLit,
    match(remaining) {
      let hit = prefixWord(remaining, ['lit ', 'burning ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { islit: true } };
      hit = prefixWord(remaining, ['unlit ', 'extinguished ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { islit: false } };
      return null;
    },
  },
  {
    id: 'preparse:wetness',
    title: 'Wetness (towels)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseWetness,
    match(remaining, _state, rng) {
      let hit = prefixWord(remaining, ['moist ']);
      if (hit) {
        const wetness = rng.rnd(2);
        return { consumed: hit.word, rest: hit.rest, diff: { wetness }, notes: [`Rolled wetness=${wetness} (moist is randomized 1-2).`] };
      }
      hit = prefixWord(remaining, ['wet ']);
      if (hit) {
        const wetness = 3 + rng.rn2(3);
        return { consumed: hit.word, rest: hit.rest, diff: { wetness }, notes: [`Rolled wetness=${wetness} (wet is randomized 3-5).`] };
      }
      return null;
    },
  },
  {
    id: 'preparse:unlabeled',
    title: 'Unlabeled / blank',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseUnlabeled,
    match(remaining) {
      const hit = prefixWord(remaining, ['unlabeled ', 'unlabelled ', 'blank ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { unlabeled: true } };
    },
  },
  {
    id: 'preparse:poisoned',
    title: 'Poisoned',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparsePoisoned,
    match(remaining) {
      const hit = prefixWord(remaining, ['poisoned ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { ispoisoned: true } };
    },
  },
  {
    id: 'preparse:trapped',
    title: 'Trapped / untrapped',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseTrapped,
    match(remaining) {
      let hit = prefixWord(remaining, ['trapped ']);
      if (hit) {
        return {
          consumed: hit.word,
          rest: hit.rest,
          diff: { trapped: 1 },
          notes: ['"trapped" is only honored in wizard mode -- silently ignored otherwise.'],
        };
      }
      hit = prefixWord(remaining, ['untrapped ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { trapped: 2 } };
      return null;
    },
  },
  {
    id: 'preparse:lock-state',
    title: 'Lock / door state',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseLockState,
    match(remaining) {
      let hit = prefixWord(remaining, ['locked ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { locked: true } };
      hit = prefixWord(remaining, ['unlocked ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { unlocked: true } };
      hit = prefixWord(remaining, ['broken ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { broken: true } };
      hit = prefixWord(remaining, ['open ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { open: true } };
      hit = prefixWord(remaining, ['closed ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { closed: true } };
      hit = prefixWord(remaining, ['doorless ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { doorless: true } };
      return null;
    },
  },
  {
    id: 'preparse:looted',
    title: 'Looted / disturbed',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseLooted,
    match(remaining) {
      const hit = prefixWord(remaining, ['looted ', 'disturbed ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { looted: true } };
    },
  },
  {
    id: 'preparse:greased',
    title: 'Greased',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseGreased,
    match(remaining) {
      const hit = prefixWord(remaining, ['greased ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { isgreased: true } };
    },
  },
  {
    id: 'preparse:zombifying',
    title: 'Zombifying (wizard corpse feature)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseZombifying,
    match(remaining) {
      const hit = prefixWord(remaining, ['zombifying ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { zombify: true } };
    },
  },
  {
    id: 'preparse:intensity',
    title: 'Erosion intensity modifier (deferred)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseIntensity,
    match(remaining) {
      let hit = prefixWord(remaining, ['very ']);
      if (hit) {
        return {
          consumed: hit.word,
          rest: hit.rest,
          diff: { very: true },
          notes: ['Consumed but not applied yet -- takes effect on the next erosion word, or as a heavy-iron-ball weight bonus at the very end.'],
        };
      }
      hit = prefixWord(remaining, ['thoroughly ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { very: true } };
      return null;
    },
  },
  {
    id: 'preparse:eroded-1',
    title: 'Erosion (rust/burn/crack bucket)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseErodedBucket1,
    match(remaining, state) {
      const hit = prefixWord(remaining, ['rusty ', 'rusted ', 'burnt ', 'burned ', 'cracked ']);
      if (!hit) return null;
      const level = Math.min(3, (state.very ? 2 : 0) + 1);
      return { consumed: hit.word, rest: hit.rest, diff: { eroded: level, very: false } };
    },
  },
  {
    id: 'preparse:eroded-2',
    title: 'Erosion (corrode/rot bucket)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseErodedBucket2,
    match(remaining, state) {
      const hit = prefixWord(remaining, ['corroded ', 'rotted ']);
      if (!hit) return null;
      const level = Math.min(3, (state.very ? 2 : 0) + 1);
      return { consumed: hit.word, rest: hit.rest, diff: { eroded2: level, very: false } };
    },
  },
  {
    id: 'preparse:partly-eaten',
    title: 'Partly eaten',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparsePartlyEaten,
    match(remaining) {
      const hit = prefixWord(remaining, ['partly eaten ', 'partially eaten ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { halfeaten: true } };
    },
  },
  {
    id: 'preparse:historic',
    title: 'Historic',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseHistoric,
    match(remaining) {
      const hit = prefixWord(remaining, ['historic ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { ishistoric: true } };
    },
  },
  {
    id: 'preparse:diluted',
    title: 'Diluted',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseDiluted,
    match(remaining) {
      const hit = prefixWord(remaining, ['diluted ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { isdiluted: true } };
    },
  },
  {
    id: 'preparse:empty',
    title: 'Empty',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseEmpty,
    match(remaining) {
      const hit = prefixWord(remaining, ['empty ']);
      if (!hit) return null;
      return { consumed: hit.word, rest: hit.rest, diff: { contents: 'empty' } };
    },
  },
  {
    id: 'preparse:glob-size',
    title: 'Glob size',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseGlobSize,
    match(remaining, state) {
      const lower = remaining.toLowerCase();
      if (state.very && lower.startsWith('large glob')) {
        return { consumed: remaining.slice(0, 6), rest: remaining.slice(6), diff: { gsize: 'very large', very: false } };
      }
      if (lower.startsWith('small glob')) {
        return { consumed: remaining.slice(0, 6), rest: remaining.slice(6), diff: { gsize: 'small' } };
      }
      if (lower.startsWith('medium glob')) {
        return { consumed: remaining.slice(0, 7), rest: remaining.slice(7), diff: { gsize: 'medium' } };
      }
      if (lower.startsWith('large glob')) {
        return { consumed: remaining.slice(0, 6), rest: remaining.slice(6), diff: { gsize: 'large' } };
      }
      return null;
    },
  },
  {
    id: 'preparse:real-fake',
    title: 'Real / fake (Amulet of Yendor)',
    category: 'lex',
    sourceRef: SOURCE_REFS.preparseRealFake,
    match(remaining) {
      let hit = prefixWord(remaining, ['real ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { real: true } };
      hit = prefixWord(remaining, ['fake ', 'cheap ', 'plastic ', 'imitation ']);
      if (hit) return { consumed: hit.word, rest: hit.rest, diff: { fake: true, real: false } };
      return null;
    },
  },
];

export function readobjnamPreparse(
  state: ParseState,
  rng: Rng
): { state: ParseState; steps: ParseStep[]; exhausted: boolean } {
  const steps: ParseStep[] = [];
  let s = { ...state };
  let remaining = s.input;

  outer: for (;;) {
    for (const rule of RULES) {
      const hit = rule.match(remaining, s, rng);
      if (hit) {
        const before = remaining;
        remaining = hit.rest;
        s = { ...s, ...hit.diff, input: remaining };
        steps.push({
          id: `${rule.id}:${steps.length}`,
          stage: 'preparse',
          title: rule.title,
          matched: true,
          inputBefore: before,
          inputAfter: remaining,
          stateDiff: hit.diff,
          sourceRef: rule.sourceRef,
          category: rule.category,
          notes: hit.notes,
        });
        continue outer;
      }
    }
    break;
  }

  return { state: s, steps, exhausted: remaining.trim().length === 0 };
}
