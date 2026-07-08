import type { ParseState } from './types';
import { byOtyp } from './objectLookup';
import type { Rng } from './rng';

const SPE_LIM = 99;
const GATED_CLASSES = new Set(['armor', 'weapon', 'ring']);

export interface EnchantmentOutcome {
  spe: number;
  note: string;
}

/**
 * baseSpe stands in for whatever mksobj()'s own random roll would have
 * produced -- not an exact reimplementation of NetHack's base-enchantment
 * distribution, just a plausible small value in the same range.
 */
export function rollBaseEnchantment(state: ParseState, rng: Rng): number {
  const def = state.otyp ? byOtyp(state.otyp) : undefined;
  if (!def) return 0;
  if (def.class === 'armor' || def.class === 'weapon' || def.class === 'ring' || def.chargeable) {
    return rng.rn2(4) - 1; // roughly -1..2
  }
  return 0;
}

export function resolveEnchantment(
  state: ParseState,
  mode: 'wizard' | 'normal',
  rng: Rng,
  baseSpe: number,
  luck: number
): EnchantmentOutcome {
  if (!state.spesgnExplicit) {
    return { spe: baseSpe, note: `No enchantment requested; keeps the object's natural roll (+${baseSpe}).` };
  }

  const requested = state.spe * state.spesgn;

  if (mode === 'wizard') {
    const clamped = Math.max(-SPE_LIM, Math.min(SPE_LIM, requested));
    return { spe: clamped, note: `Wizard mode: only the +/-${SPE_LIM} cap applies. Granted +${clamped}.` };
  }

  const def = state.otyp ? byOtyp(state.otyp) : undefined;
  const oclass = def?.class ?? state.oclass;

  if (oclass && GATED_CLASSES.has(oclass)) {
    const gate = rng.rnd(5);
    const denied = requested > gate && requested > baseSpe;
    if (denied) {
      return {
        spe: 0,
        note: `Armor/weapon/ring gate: requested +${requested} > rnd(5)=${gate} and > natural roll +${baseSpe}, so the wish is denied -- granted +0.`,
      };
    }
    let spe = requested;
    if (spe > 2 && luck < 0) {
      spe = -spe;
      return { spe, note: `Granted +${requested}, but negative Luck (${luck}) flips enchantment above +2 to negative: +${spe}.` };
    }
    return { spe, note: `Armor/weapon/ring gate: requested +${requested} <= rnd(5)=${gate} or <= natural roll, so it's granted.` };
  }

  if (oclass === 'wand' || def?.chargeable) {
    const spe = requested < 0 ? Math.max(requested, -1) : requested;
    return { spe, note: `Wands/chargeable tools: negative requests floor at -1. Granted +${spe} (this is the charge count).` };
  }

  if (requested >= 0) {
    const spe = Math.min(requested, baseSpe);
    return {
      spe,
      note:
        spe < requested
          ? `Requested +${requested}, but normal play caps positive enchantment to the natural roll (+${baseSpe}).`
          : `Requested +${requested}, natural roll was +${baseSpe} -- granted.`,
    };
  }
  const spe = Math.max(requested, 0);
  return { spe, note: `Negative enchantment on this item type floors at +0 in normal play (requested ${requested}).` };
}
