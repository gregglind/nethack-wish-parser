import type { ObjClass, ParseState, ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { byOtyp } from './objectLookup';
import type { Rng } from './rng';
import { MONSTERS_BY_NAME } from '../data/monsters';
import { OBJECTS } from '../data/objects';

/** wrpsym[]-equivalent 13-slot pool (objnam.c any: label) -- spellbook and food appear twice, biasing the draw. */
const ANY_CLASS_POOL: ObjClass[] = [
  'wand', 'ring', 'potion', 'scroll', 'gem', 'amulet',
  'spellbook', 'spellbook', 'weapon', 'armor', 'tool', 'food', 'food',
];

export function objectConstruction(input: ParseState, rng: Rng): { state: ParseState; step: ParseStep } {
  let s = { ...input };
  const before = s.otyp ? (byOtyp(s.otyp)?.actualName ?? s.otyp) : s.input;
  const pickedRandomClass = !s.otyp && !s.oclass;
  const pickedRandomWithinClass = !s.otyp;

  if (pickedRandomClass) {
    s = { ...s, oclass: rng.pick(ANY_CLASS_POOL) };
  }

  // No specific type matched (whether or not a class was pinned down) --
  // mirrors mkobj()/mksobj() picking a random member of the resolved class.
  if (pickedRandomWithinClass) {
    const pool = OBJECTS.filter((o) => o.class === s.oclass && !o.noWish);
    if (pool.length) {
      const chosen = rng.weightedPick(pool, (o) => Math.max(o.prob, 1));
      s = { ...s, otyp: chosen.otyp };
    }
  }

  // Pudding corpse -> glob substitution (unconditional, both modes).
  if (s.otyp === 'CORPSE' && s.mntmp) {
    const monster = MONSTERS_BY_NAME.get(s.mntmp.toLowerCase());
    if (monster?.isPudding) {
      s = { ...s, otyp: 'GLOB_OF_GRAY_OOZE', oclass: 'food', mntmp: null };
    }
  }

  const resolvedName = s.otyp ? (byOtyp(s.otyp)?.actualName ?? s.otyp) : `random ${s.oclass}`;

  const step: ParseStep = {
    id: 'construction',
    stage: 'construction',
    title: 'Object construction',
    matched: true,
    inputBefore: before,
    inputAfter: resolvedName,
    stateDiff: { oclass: s.oclass, otyp: s.otyp },
    sourceRef: SOURCE_REFS.objectConstruction,
    category: 'construct',
    notes: pickedRandomClass
      ? [`No specific type or class matched -- picking a uniformly random class (spellbook and food are twice as likely as other classes in this 13-slot table), then a rarity-weighted random object within it: "${resolvedName}".`]
      : pickedRandomWithinClass
        ? [`Class "${s.oclass}" was pinned down but no specific type matched -- picking a rarity-weighted random object within that class: "${resolvedName}".`]
        : undefined,
  };

  return { state: s, step };
}

export interface ModeSubstitutionResult {
  otyp: string | null;
  rejected: string | null;
  note: string | null;
}

const NO_WISH_UNLESS_WIZARD: Record<string, string> = {
  AMULET_OF_YENDOR: 'FAKE_AMULET_OF_YENDOR',
  CANDELABRUM_OF_INVOCATION: 'WAX_CANDLE',
  BELL_OF_OPENING: 'BELL',
  SPE_BOOK_OF_THE_DEAD: 'SPE_BLANK_PAPER',
  MAGIC_LAMP: 'OIL_LAMP',
};

/** Applies the non-wizard item substitutions/rejections. Wizard mode passes through untouched. */
export function applyModeSubstitution(state: ParseState, mode: 'wizard' | 'normal'): ModeSubstitutionResult {
  if (!state.otyp) return { otyp: state.otyp, rejected: null, note: null };
  if (mode === 'wizard') return { otyp: state.otyp, rejected: null, note: null };

  const def = byOtyp(state.otyp);
  if (def?.noWish) {
    return {
      otyp: null,
      rejected: `"${def.actualName}" cannot be wished for outside wizard mode.`,
      note: 'oc_nowish types are rejected outright in normal play.',
    };
  }
  const sub = NO_WISH_UNLESS_WIZARD[state.otyp];
  if (sub) {
    const subDef = byOtyp(sub)!;
    return {
      otyp: sub,
      rejected: null,
      note: `Non-wizard play silently substitutes "${subDef.actualName}" for "${def!.actualName}".`,
    };
  }
  return { otyp: state.otyp, rejected: null, note: null };
}
