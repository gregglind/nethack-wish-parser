import type { ParseState } from './types';
import { byOtyp } from './objectLookup';

export interface ErosionOutcome {
  eroded: number;
  eroded2: number;
  erodeproof: boolean;
  note: string;
}

export function resolveErosion(state: ParseState, mode: 'wizard' | 'normal', luck = 0): ErosionOutcome {
  const def = state.otyp ? byOtyp(state.otyp) : undefined;
  const wizard = mode === 'wizard';

  if (!def) {
    return { eroded: 0, eroded2: 0, erodeproof: false, note: 'Unresolved object type; erosion does not apply.' };
  }

  const eroded = def.rustprone || def.flammable ? state.eroded : 0;
  const eroded2 = def.corrodible || def.rottable ? state.eroded2 : 0;
  const droppedNotes: string[] = [];
  if (state.eroded && !eroded) droppedNotes.push(`this item's material can't rust/burn/crack, so "eroded" was dropped`);
  if (state.eroded2 && !eroded2) droppedNotes.push(`this item's material can't corrode/rot, so "eroded2" was dropped`);

  const isDamageable = def.rustprone || def.flammable || def.corrodible || def.rottable || state.otyp === 'CRYSKNIFE';
  const erodeproof = state.erodeproof && isDamageable && (luck >= 0 || wizard);
  if (state.erodeproof && isDamageable && !erodeproof) {
    droppedNotes.push(`negative Luck (${luck}) denied the requested erosion-proofing in normal play`);
  }

  return {
    eroded,
    eroded2,
    erodeproof,
    note: droppedNotes.length ? droppedNotes.join('; ') + '.' : 'Erosion/erodeproof state applied as requested.',
  };
}
