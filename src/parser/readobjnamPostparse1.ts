import type { ParseState, ParseStep, Gender } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { makesingular } from './utils';
import { SPELLINGS, normalizeBritishSpellings } from '../data/spellings';
import { CLASS_NAME_WORDS, CLASS_NAME_EXCLUSIONS } from '../data/classNames';

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
        mntmp = stripTrailingPossessive(extracted.monster);
        mgend = extracted.gender;
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
      return { state: s, steps, goldShortCircuit: null, rejected: '"paperback spellbook" is not a real item -- paperback books and spellbooks are deliberately incompatible.' };
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
  const CLASS_SYMBOLS: Record<string, ParseState['oclass']> = {
    '/': 'wand', '=': 'ring', '!': 'potion', '?': 'scroll', '*': 'gem',
    '"': 'amulet', '+': 'spellbook', ')': 'weapon', '[': 'armor', '(': 'tool',
    '%': 'food', '$': 'coin',
  };
  if (!s.otyp && !s.oclass && text.trim().length === 1 && CLASS_SYMBOLS[text.trim()]) {
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
        const suffix = new RegExp(`^(.+)\\s+${word}s?$`, 'i').exec(text);
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
          actualn = text.trim();
          matchedForm = `X ${word}`;
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
