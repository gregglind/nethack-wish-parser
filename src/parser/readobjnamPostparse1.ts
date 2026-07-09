import type { ParseState, ParseStep, Gender } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { makesingular } from './utils';
import { SPELLINGS, normalizeBritishSpellings } from '../data/spellings';
import { CLASS_NAME_WORDS, CLASS_NAME_EXCLUSIONS } from '../data/classNames';
import { MONSTERS, MONSTERS_BY_NAME } from '../data/monsters';

/** Literal prefixes objnam.c excludes so rank titles/item names aren't misread as monster names. */
const MONSTER_PREFIX_STRIP_EXCEPTIONS = ['samurai sword', 'wizard lock', 'death wand', 'master key', 'ninja-to', 'magenta'];
const MONSTER_PREFIX_STRIP_SUBSTRING_EXCLUSIONS = ['wand ', 'spellbook ', 'gauntlets ', 'gloves ', 'finger '];

/**
 * Mirrors objnam.c's "find corpse type w/o 'of'" longest-monster-name-prefix
 * match (~4427-4462) -- the mechanism that lets "red dragon scale mail" or
 * "yeti corpse" work, but that ALSO fires for any other leftover text a
 * monster name happens to prefix ("gray dragon mail" -> mntmp=gray dragon,
 * remainder "mail" -> coincidentally matches the scroll of mail's real
 * name). Only strips if something non-empty remains afterward; a bare
 * monster name with no referent is left alone (objnam.c's "no referent"
 * check).
 */
/** Longest monster name (or plural) that prefixes `text`, followed by a space -- the core of name_to_monplus(). */
function findLongestMonsterPrefix(text: string): { name: string; matchLen: number } | null {
  const lower = text.toLowerCase();
  let best: { name: string; matchLen: number } | null = null;
  for (const m of MONSTERS) {
    for (const candidate of [m.name, m.plural].filter((c): c is string => !!c)) {
      const cl = candidate.toLowerCase();
      if (lower.startsWith(`${cl} `) && (!best || cl.length > best.matchLen)) {
        best = { name: m.name, matchLen: cl.length };
      }
    }
  }
  return best;
}

function stripMonsterNamePrefix(text: string): { mntmp: string; rest: string } | null {
  const lower = text.toLowerCase();
  if (MONSTER_PREFIX_STRIP_EXCEPTIONS.some((ex) => lower.startsWith(ex))) return null;
  if (MONSTER_PREFIX_STRIP_SUBSTRING_EXCLUSIONS.some((ex) => lower.includes(ex))) return null;

  const best = findLongestMonsterPrefix(text);
  if (!best) return null;
  const rest = text.slice(best.matchLen + 1).trim();
  if (!rest) return null; // no referent -- not really a monster prefix here
  return { mntmp: best.name, rest };
}

/**
 * Mirrors objnam.c's generic " of <monster>" stripper (~4421-4424, comment
 * says "figurine of an orc, tin of orc meat") -- unlike the dedicated
 * corpse/statue/figurine/tin/egg regexes above, this doesn't require any
 * specific keyword before "of"; ANY leading word works, including typos or
 * garbage ("figuring of an archon"). Everything from " of " onward is
 * discarded once a monster name is recognized just after it, regardless of
 * what follows the monster name.
 */
function stripGenericOfMonster(text: string): { mntmp: string; rest: string } | null {
  const lower = text.toLowerCase();
  if (MONSTER_PREFIX_STRIP_SUBSTRING_EXCLUSIONS.some((ex) => lower.includes(ex))) return null;
  const ofIdx = lower.indexOf(' of ');
  if (ofIdx === -1) return null;
  const before = text.slice(0, ofIdx).trim();
  if (!before) return null;
  const after = text.slice(ofIdx + 4).replace(/^(?:an?|the)\s+/i, '');
  const best = findLongestMonsterPrefix(`${after} `); // reuse the space-terminated prefix matcher
  if (!best) return null;
  return { mntmp: best.name, rest: before };
}

export interface Postparse1Result {
  state: ParseState;
  steps: ParseStep[];
  goldShortCircuit: { cnt: number } | null;
  rejected: string | null;
}

function pushStep(
  steps: ParseStep[],
  id: string,
  title: string,
  before: string,
  after: string,
  diff: Partial<ParseState>,
  sourceRef: (typeof SOURCE_REFS)[keyof typeof SOURCE_REFS],
  notes?: string[]
) {
  steps.push({
    id,
    stage: 'postparse1',
    title,
    matched: true,
    inputBefore: before,
    inputAfter: after,
    stateDiff: diff,
    sourceRef,
    category: 'lookup',
    notes,
  });
}

function extractMonsterAndGender(text: string): { monster: string; gender: Gender | null } {
  const withoutArticle = text.trim().replace(/^(?:an?|the)\s+/i, '');
  const genderMatch = /^(female|male|neuter)\s+(.*)$/i.exec(withoutArticle);
  if (genderMatch) {
    return { monster: genderMatch[2].trim(), gender: genderMatch[1].toLowerCase() as Gender };
  }
  return { monster: withoutArticle, gender: null };
}

function stripTrailingPossessive(s: string): string {
  return s.replace(/'s$/i, '').replace(/s$/i, (m) => (s.length > 1 ? m : m)).trim();
}

export function readobjnamPostparse1(input: ParseState): Postparse1Result {
  let s = { ...input };
  const steps: ParseStep[] = [];
  let text = s.input;

  // -- named --
  {
    const m = / named (.+)$/i.exec(text);
    if (m) {
      const before = text;
      text = text.slice(0, m.index).trim();
      s = { ...s, name: m[1].trim(), input: text };
      pushStep(steps, 'postparse1:named', 'Personal name ("named X")', before, text, { name: m[1].trim() }, SOURCE_REFS.postparse1Named);
    }
  }

  // -- called --
  {
    const m = / called (.+)$/i.exec(text);
    if (m) {
      const before = text;
      text = text.slice(0, m.index).trim();
      s = { ...s, un: m[1].trim(), input: text };
      pushStep(steps, 'postparse1:called', 'Player nickname ("called X")', before, text, { un: m[1].trim() }, SOURCE_REFS.postparse1Called, [
        'Matched against oc_uname -- how the player has been calling this unidentified type.',
      ]);
    }
  }

  // -- labeled --
  {
    const m = / labell?ed (.+)$/i.exec(text);
    if (m) {
      const before = text;
      text = text.slice(0, m.index).trim();
      s = { ...s, dn: m[1].trim(), input: text };
      pushStep(steps, 'postparse1:labeled', 'Descriptive name ("labeled X")', before, text, { dn: m[1].trim() }, SOURCE_REFS.postparse1Labeled, [
        'Matched against oc_descr -- the unidentified appearance text.',
      ]);
    }
  }

  // -- gold piece short-circuit --
  {
    const lower = text.toLowerCase().trim();
    if (
      /gold pieces?$/.test(lower) ||
      /zorkmids?$/.test(lower) ||
      lower === 'gold' ||
      lower === 'money' ||
      lower === 'coin' ||
      lower === 'coins'
    ) {
      const before = text;
      pushStep(steps, 'postparse1:gold', 'Gold piece short-circuit', before, '', {}, SOURCE_REFS.postparse1Gold, [
        'Returns a gold-piece object immediately, bypassing all remaining lookup stages.',
        'Non-wizard quantity is capped at 5000; wizard mode is unlimited.',
      ]);
      return { state: s, steps, goldShortCircuit: { cnt: s.cnt || 1 }, rejected: null };
    }
  }

  // -- of spinach / tin of spinach --
  {
    const lower = text.toLowerCase().trim();
    if (lower === 'spinach' || lower === 'tin of spinach') {
      const before = text;
      text = 'tin';
      s = { ...s, input: text, contents: 'spinach', otyp: 'TIN', oclass: 'food' };
      pushStep(steps, 'postparse1:spinach', 'Tin of spinach', before, text, { contents: 'spinach', otyp: 'TIN', oclass: 'food' }, SOURCE_REFS.postparse1Spinach);
    }
  }

  // -- Amulet of Yendor: real vs fake is a deterministic special case, not an
  // ambiguous name/description fuzzy match. "Amulet of Yendor" is both the
  // real amulet's actualName and the fake's unidentified description, but the
  // real game special-cases the text match itself: not specifying "fake" (or
  // "cheap"/"plastic"/"imitation") always means the real one here. Whether it
  // survives to the final object is a wizard-mode question, resolved later by
  // applyModeSubstitution.
  if (!s.otyp) {
    const lower = text.toLowerCase();
    const idx = lower.indexOf('amulet of yendor');
    if (idx !== -1 && (idx === 0 || /\s/.test(text[idx - 1]))) {
      const before = text;
      const prefix = lower.slice(0, idx);
      const fake = s.fake || ['cheap ', 'plastic ', 'imitation '].some((w) => prefix.endsWith(w));
      const real = !fake;
      const otyp = real ? 'AMULET_OF_YENDOR' : 'FAKE_AMULET_OF_YENDOR';
      text = '';
      s = { ...s, otyp, oclass: 'amulet', real, fake, input: text };
      pushStep(
        steps,
        'postparse1:amulet-of-yendor',
        'Amulet of Yendor: real vs fake',
        before,
        real ? 'Amulet of Yendor (real)' : 'cheap plastic imitation of the Amulet of Yendor',
        { otyp, oclass: 'amulet', real, fake },
        SOURCE_REFS.postparse1AmuletOfYendor,
        [
          real
            ? 'Not specifying "fake"/"cheap"/"plastic"/"imitation" defaults to the real Amulet of Yendor -- checked deterministically, before the generic ambiguous-name fuzzy lookup ever runs.'
            : '"fake"/"cheap"/"plastic"/"imitation" forces the worthless imitation.',
        ]
      );
      return { state: s, steps, goldShortCircuit: null, rejected: null };
    }
  }

  // -- pair/set of --
  if (!s.otyp) {
    const m = /^(pair|pairs|set|sets) of (.+)$/i.exec(text);
    if (m) {
      const before = text;
      text = m[2].trim();
      const doublesAlways = /^pair$/i.test(m[1]);
      const doublesIfPlural = /^pairs$/i.test(m[1]);
      const newCnt = doublesAlways ? Math.max(s.cnt, 1) * 2 : doublesIfPlural && s.cnt > 1 ? s.cnt * 2 : s.cnt;
      s = { ...s, input: text, cnt: newCnt };
      pushStep(steps, 'postparse1:pair-set', `"${m[1]} of" doubling`, before, text, { cnt: newCnt }, SOURCE_REFS.postparse1Glob);
    }
  }

  // -- glob detection --
  if (!s.otyp) {
    const m = /^glob(?:s)?(?: of (.+))?$/i.exec(text.trim());
    if (m) {
      const before = text;
      s = { ...s, input: text, otyp: 'GLOB_OF_GRAY_OOZE', oclass: 'food' };
      pushStep(steps, 'postparse1:glob', 'Glob of ooze/pudding/slime', before, text, { otyp: 'GLOB_OF_GRAY_OOZE', oclass: 'food' }, SOURCE_REFS.postparse1Glob, [
        'Simplified: this tool only models glob of gray ooze; the real game supports every pudding/ooze/slime species.',
      ]);
    }
  }

  // -- corpse / statue / figurine / tin / egg of <monster> --
  if (!s.otyp) {
    const patterns: { re: RegExp; otyp: string; kind: string }[] = [
      { re: /^(?:corpse of |(.+) corpse$|corpse$)/i, otyp: 'CORPSE', kind: 'corpse' },
      { re: /^(?:statue of |(.+) statue$|statue$)/i, otyp: 'STATUE', kind: 'statue' },
      { re: /^(?:figurine of |(.+) figurine$|figurine$)/i, otyp: 'FIGURINE', kind: 'figurine' },
      { re: /^(?:tin of |(.+) tin$|tin$)/i, otyp: 'TIN', kind: 'tin' },
      { re: /^(?:egg of |(.+) egg$|eggs?$)/i, otyp: 'EGG', kind: 'egg' },
    ];
    for (const p of patterns) {
      const lower = text.trim();
      const ofMatch = new RegExp(`^${p.kind} of (.+)$`, 'i').exec(lower);
      const suffixMatch = new RegExp(`^(.+) ${p.kind}$`, 'i').exec(lower);
      const bareMatch = new RegExp(`^${p.kind}$`, 'i').exec(lower);
      let monsterText: string | null = null;
      if (ofMatch) monsterText = ofMatch[1];
      else if (suffixMatch) monsterText = suffixMatch[1];
      else if (bareMatch) monsterText = null;
      else continue;

      const before = text;
      let mntmp: string | null = null;
      let mgend: Gender | null = null;
      if (monsterText) {
        const extracted = extractMonsterAndGender(monsterText);
        const candidate = stripTrailingPossessive(extracted.monster);
        mgend = extracted.gender;
        // Real name_to_mon() does a longest-monster-name-PREFIX match, not
        // an exact match against the whole captured phrase -- "tin of orc
        // meat" needs to recognize "orc" and discard the trailing "meat"
        // the same way it would discard any other leftover text. Try an
        // exact match first (handles multi-word names like "gnome ruler"
        // that aren't a strict prefix-plus-trailing-word), then fall back
        // to the longest real prefix.
        if (MONSTERS_BY_NAME.has(candidate.toLowerCase())) {
          mntmp = candidate;
        } else {
          const prefix = findLongestMonsterPrefix(`${candidate} `);
          mntmp = prefix ? prefix.name : candidate;
        }
      }

      // Only literal "tin of <X>" has an unconditional handler in the real
      // source (objnam.c's dedicated `strstri(d->bp, "tin of ")` branch) --
      // it sets d->typ = TIN regardless of whether X is a recognized
      // monster. Every other case (including "<X> tin" without "of", and
      // "<X> corpse"/"<X> statue"/"<X> figurine"/"<X> egg" with or without
      // "of") relies on the generic " of <monster>"/monster-name-prefix
      // strippers, which only fire when X is an actual, recognized monster
      // name -- if it's not, nothing matches here at all in the real game,
      // and the wish falls through to fail ("ant egg" has no monster
      // literally named "ant", so it never becomes an egg wish in the first
      // place; "giant ant egg" does, since "giant ant" is a real monster).
      const isUnconditionalTinOf = p.kind === 'tin' && !!ofMatch;
      if (monsterText && mntmp && !isUnconditionalTinOf && !MONSTERS_BY_NAME.has(mntmp.toLowerCase())) {
        continue;
      }

      text = p.kind;
      s = { ...s, input: text, otyp: p.otyp, oclass: 'food', mntmp, mgend: mgend ?? s.mgend };
      pushStep(
        steps,
        `postparse1:${p.kind}-of-monster`,
        `${p.kind[0].toUpperCase()}${p.kind.slice(1)} of monster`,
        before,
        text,
        { otyp: p.otyp, oclass: 'food', mntmp, mgend: mgend ?? s.mgend },
        SOURCE_REFS.postparse1Glob,
        mntmp
          ? [`Monster type: "${mntmp}"${mgend ? ` (${mgend})` : ''}.`]
          : ['No monster specified -- resolves to a random one of this kind.']
      );
      break;
    }
  }

  // -- generic "<anything> of <monster>" stripper ("figuring of an archon") --
  // No specific keyword required before "of" -- a monster name recognized
  // right after it is enough, and everything from " of " onward is discarded
  // regardless of what remains before it.
  if (!s.otyp) {
    const hit = stripGenericOfMonster(text);
    if (hit) {
      const before = text;
      text = hit.rest;
      s = { ...s, input: text, mntmp: hit.mntmp };
      pushStep(steps, 'postparse1:generic-of-monster-strip', 'Generic "of <monster>" stripped', before, text, { mntmp: hit.mntmp }, SOURCE_REFS.postparse1Glob, [
        `"${hit.mntmp}" recognized right after "of" -- the whole "of ${hit.mntmp}..." tail is discarded, leaving just "${text}" to be matched on its own.`,
      ]);
    }
  }

  // -- monster-name prefix stripping ("red dragon scale mail", "yeti corpse") --
  // Runs even when nothing downstream will use mntmp; the leftover remainder
  // still gets matched normally, which is what lets "gray dragon mail"
  // (missing "scale") accidentally resolve to the unrelated scroll of mail.
  // Guarded on !s.mntmp -- objnam.c only tries this "d->mntmp < LOW_PM", i.e.
  // only if a monster name hasn't already been claimed by the generic
  // "of <monster>" stripper above.
  if (!s.otyp && !s.mntmp) {
    const hit = stripMonsterNamePrefix(text);
    if (hit) {
      const before = text;
      text = hit.rest;
      s = { ...s, input: text, mntmp: hit.mntmp };
      pushStep(steps, 'postparse1:monster-prefix-strip', 'Monster-name prefix stripped', before, text, { mntmp: hit.mntmp }, SOURCE_REFS.postparse1Glob, [
        `"${hit.mntmp}" is a recognized monster name prefixing the rest of the text -- stripped off, leaving "${text}" to be matched on its own.`,
        'This is also how a stray monster name can accidentally reroute a wish to a totally unrelated object if what remains happens to match something else.',
      ]);
    }
  }

  // -- singularize --
  if (!s.otyp) {
    const lowerWhole = text.toLowerCase();
    if (lowerWhole !== 'tricks' && lowerWhole !== 'clothes') {
      const { result, changed } = makesingular(text);
      if (changed) {
        const before = text;
        const bumpCnt = s.cnt === 1;
        text = result;
        s = { ...s, input: text, cnt: bumpCnt ? 2 : s.cnt };
        pushStep(steps, 'postparse1:singularize', 'Pluralization', before, text, { cnt: s.cnt }, SOURCE_REFS.postparse1Singular, [
          bumpCnt ? 'Plural with no explicit quantity implies "give me 2".' : 'Explicit quantity was already given; count unchanged.',
        ]);
      }
    }
  }

  // -- British spelling / alt-spellings --
  if (!s.otyp) {
    const normalized = normalizeBritishSpellings(text);
    if (normalized !== text) {
      const before = text;
      text = normalized;
      s = { ...s, input: text };
      pushStep(steps, 'postparse1:british', 'Normalize British spelling', before, text, {}, SOURCE_REFS.postparse1Singular);
    }
    const spellingHit = SPELLINGS[text.toLowerCase().trim()];
    if (spellingHit) {
      const before = text;
      s = { ...s, otyp: spellingHit };
      pushStep(steps, 'postparse1:alt-spelling', 'Alternate spelling lookup', before, text, { otyp: spellingHit }, SOURCE_REFS.postparse1Singular, [
        `"${before}" is a recognized alias, not objects[]'s canonical name.`,
      ]);
    }
  }

  // -- holy/unholy water suffix -- check "unholy" first since /holy water$/
  // also matches the tail of "unholy water".
  if (!s.otyp) {
    if (/unholy water$/i.test(text)) {
      const before = text;
      s = { ...s, otyp: 'POT_WATER', iscursed: true };
      pushStep(steps, 'postparse1:unholy-water', 'Unholy water suffix', before, text, { otyp: 'POT_WATER', iscursed: true }, SOURCE_REFS.postparse1HolyWater);
    } else if (/holy water$/i.test(text)) {
      const before = text;
      s = { ...s, otyp: 'POT_WATER', blessed: true };
      pushStep(steps, 'postparse1:holy-water', 'Holy water suffix', before, text, { otyp: 'POT_WATER', blessed: true }, SOURCE_REFS.postparse1HolyWater);
    }
  }

  // -- paperback --
  if (!s.otyp) {
    if (/^paperback spellbook$/i.test(text.trim())) {
      return { state: s, steps, goldShortCircuit: null, rejected: 'Nothing fitting that description exists in the game.' };
    }
    if (/^paperback( book)?$/i.test(text.trim())) {
      const before = text;
      s = { ...s, otyp: 'SPE_NOVEL' };
      pushStep(steps, 'postparse1:paperback', 'Paperback (tribute novel)', before, text, { otyp: 'SPE_NOVEL' }, SOURCE_REFS.postparse1Paperback);
    }
  }

  // -- blank scroll/spellbook --
  if (!s.otyp && s.unlabeled) {
    if (/scrolls?$/i.test(text.trim())) {
      const before = text;
      s = { ...s, otyp: 'SCR_BLANK_PAPER' };
      pushStep(steps, 'postparse1:blank-scroll', 'Unlabeled -> blank scroll', before, text, { otyp: 'SCR_BLANK_PAPER' }, SOURCE_REFS.postparse1Paperback);
    } else if (/spellbooks?$/i.test(text.trim())) {
      const before = text;
      s = { ...s, otyp: 'SPE_BLANK_PAPER' };
      pushStep(steps, 'postparse1:blank-spellbook', 'Unlabeled -> blank spellbook', before, text, { otyp: 'SPE_BLANK_PAPER' }, SOURCE_REFS.postparse1Paperback);
    }
  }

  // -- orange (food, not gem) --
  if (!s.otyp && text.trim().toLowerCase() === 'orange' && !s.mntmp) {
    const before = text;
    s = { ...s, otyp: 'ORANGE', oclass: 'food' };
    pushStep(steps, 'postparse1:orange', 'Orange (food, not color)', before, text, { otyp: 'ORANGE', oclass: 'food' }, SOURCE_REFS.postparse1Paperback);
  }

  // -- single-char class symbol --
  // objnam.c's def_char_to_objclass() also recognizes '0' (BALL_CLASS) and
  // '_' (CHAIN_CLASS) -- both real classes with exactly one wishable member
  // (prob 1000, i.e. the only choice), so they resolve straight to that otyp
  // rather than through the generic oclass-then-random-within-class path.
  // '.' (VENOM_CLASS) is intentionally out of scope (see objects.ts).
  const SINGLE_CHAR_OTYP: Record<string, string> = {
    '0': 'HEAVY_IRON_BALL',
    '_': 'IRON_CHAIN',
  };
  const CLASS_SYMBOLS: Record<string, ParseState['oclass']> = {
    '/': 'wand', '=': 'ring', '!': 'potion', '?': 'scroll', '*': 'gem',
    '"': 'amulet', '+': 'spellbook', ')': 'weapon', '[': 'armor', '(': 'tool',
    '%': 'food', '$': 'coin', '`': 'rock',
  };
  if (!s.otyp && !s.oclass && text.trim().length === 1 && SINGLE_CHAR_OTYP[text.trim()]) {
    const before = text;
    const otyp = SINGLE_CHAR_OTYP[text.trim()]!;
    s = { ...s, otyp, oclass: 'tool' };
    pushStep(steps, 'postparse1:class-symbol-ball-chain', 'Single-character class symbol (ball/chain)', before, text, { otyp, oclass: 'tool' }, SOURCE_REFS.postparse1ClassSymbol, [
      `"${before}" is the display symbol for a real object class with exactly one wishable member.`,
    ]);
  } else if (!s.otyp && !s.oclass && text.trim().length === 1 && CLASS_SYMBOLS[text.trim()]) {
    const before = text;
    const oclass = CLASS_SYMBOLS[text.trim()]!;
    s = { ...s, oclass };
    pushStep(steps, 'postparse1:class-symbol', 'Single-character class symbol', before, text, { oclass }, SOURCE_REFS.postparse1ClassSymbol);
  }

  // -- class-name table --
  if (!s.otyp && !s.oclass) {
    const lower = text.toLowerCase();
    const excluded = CLASS_NAME_EXCLUSIONS.some((ex) => lower.includes(ex));
    if (!excluded) {
      for (const { word, oclass } of CLASS_NAME_WORDS) {
        const ofPrefix = new RegExp(`^${word}s? of (.+)$`, 'i').exec(text);
        const prefix = new RegExp(`^${word}s?\\s+(.+)$`, 'i').exec(text);
        // Real objnam.c does a pure suffix comparison here (BSTRCMPI, no word
        // boundary) -- "figuring" ends in "ring" and matches RING_CLASS even
        // though there's no space before it. Faithfully reproducing that is
        // what makes "figuring of an archon" give a random ring.
        const suffix = new RegExp(`^(.+)${word}s?$`, 'i').exec(text);
        const bare = new RegExp(`^${word}s?$`, 'i').exec(text.trim());
        let actualn: string | null = null;
        let matchedForm: string | null = null;
        if (ofPrefix) {
          actualn = `${word} of ${ofPrefix[1].trim()}`;
          matchedForm = `${word} of X`;
        } else if (bare) {
          matchedForm = word;
        } else if (prefix) {
          actualn = text.trim();
          matchedForm = `${word} X`;
        } else if (suffix) {
          // Real objnam.c truncates bp right at the suffix match and doesn't
          // preserve the remainder as an actualn to search for -- it just
          // falls through to a random pick within the now-known class.
          matchedForm = `X${word}`;
        }
        if (matchedForm) {
          const before = text;
          s = { ...s, oclass, actualn: actualn ?? s.actualn };
          pushStep(
            steps,
            `postparse1:class-name-${oclass}`,
            `Class-name table: "${word}"`,
            before,
            text,
            { oclass, actualn: actualn ?? s.actualn },
            SOURCE_REFS.postparse1ClassName,
            [`Matched form: ${matchedForm}.`]
          );
          break;
        }
      }
    }
  }

  return { state: s, steps, goldShortCircuit: null, rejected: null };
}
