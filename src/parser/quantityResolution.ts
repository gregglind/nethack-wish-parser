import type { ParseState } from './types';
import { byOtyp } from './objectLookup';
import type { Rng } from './rng';

const AMMO_LIKE = new Set([
  'ARROW', 'DAGGER', 'DART', 'CROSSBOW_BOLT', 'SHURIKEN', 'BOOMERANG', 'ROCK', 'FLINT', 'KNIFE',
]);

export interface QuantityOutcome {
  quan: number;
  honored: boolean;
  note: string;
}

export function resolveQuantity(state: ParseState, mode: 'wizard' | 'normal', rng: Rng): QuantityOutcome {
  const requested = Math.max(state.cnt || 1, 1);

  if (state.otyp === 'GOLD_PIECE') {
    const cap = mode === 'wizard' ? Infinity : 5000;
    const quan = Math.min(requested, cap);
    return {
      quan,
      honored: quan === requested,
      note:
        mode === 'wizard'
          ? `Wizard mode: gold quantity is unlimited (requested ${requested}).`
          : `Normal play caps gold at 5000 (requested ${requested}${requested > 5000 ? ', clamped down' : ''}).`,
    };
  }

  const def = state.otyp ? byOtyp(state.otyp) : undefined;
  if (!def?.stackable || requested <= 1) {
    return { quan: 1, honored: true, note: 'Not a stackable request; quantity is 1.' };
  }

  if (mode === 'wizard') {
    return { quan: requested, honored: true, note: `Wizard mode always honors the requested quantity (${requested}).` };
  }

  const isCandle = def.class === 'tool' && def.actualName.includes('candle');
  const isAmmo = AMMO_LIKE.has(state.otyp ?? '');

  if (isCandle && requested <= 7) {
    return { quan: requested, honored: true, note: `Candles: up to 7 is always honored (requested ${requested}).` };
  }
  if (isAmmo && requested <= 20) {
    return { quan: requested, honored: true, note: `Ammo-like items: up to 20 is always honored (requested ${requested}).` };
  }

  const roll = rng.rnd(6);
  const honored = requested < roll;
  return {
    quan: honored ? requested : 1,
    honored,
    note: honored
      ? `Random gate: requested ${requested} < rnd(6)=${roll}, so the full amount is granted.`
      : `Random gate: requested ${requested} >= rnd(6)=${roll}, so only 1 is granted.`,
  };
}
