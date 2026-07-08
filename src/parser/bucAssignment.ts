import type { ParseState } from './types';
import type { Rng } from './rng';

export type Buc = 'blessed' | 'uncursed' | 'cursed';

export interface BucOutcome {
  buc: Buc;
  note: string;
}

export function rollBaseBuc(rng: Rng): Buc {
  const roll = rng.rn2(6);
  if (roll === 0) return 'blessed';
  if (roll === 1) return 'cursed';
  return 'uncursed';
}

/**
 * Mirrors the readobjnam() BUC-assignment switch (objnam.c:5284-5297).
 * Luck defaults to 0 in this tool (it can't be derived from wish text) --
 * at Luck 0 wizard and normal mode agree except where noted.
 */
export function resolveBuc(state: ParseState, mode: 'wizard' | 'normal', baseBuc: Buc, luck = 0): BucOutcome {
  const wizard = mode === 'wizard';

  if (state.iscursed) {
    return { buc: 'cursed', note: 'Explicitly requested cursed.' };
  }
  if (state.uncursed) {
    const buc: Buc = luck < 0 && !wizard ? 'cursed' : 'uncursed';
    return {
      buc,
      note:
        buc === 'cursed'
          ? `Requested uncursed, but negative Luck (${luck}) forces cursed instead in normal play.`
          : 'Explicitly requested uncursed.',
    };
  }
  if (state.blessed) {
    const buc: Buc = luck >= 0 || wizard ? 'blessed' : 'cursed';
    return {
      buc,
      note:
        buc === 'cursed'
          ? `Requested blessed, but negative Luck (${luck}) forces cursed instead in normal play.`
          : 'Explicitly requested blessed.',
    };
  }
  if (state.spesgnExplicit && state.spesgn < 0) {
    return { buc: 'cursed', note: 'A negative enchantment (even "-0") with no explicit beatitude implies cursed.' };
  }
  return { buc: baseBuc, note: `No beatitude requested -- keeps the object's natural roll (${baseBuc}).` };
}
