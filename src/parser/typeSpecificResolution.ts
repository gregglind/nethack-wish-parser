import type { ParseState } from './types';
import { MONSTERS_BY_NAME } from '../data/monsters';
import type { Rng } from './rng';

export interface TypeSpecificOutcome {
  spe: number;
  mntmp: string | null;
  notes: string[];
}

/**
 * Mirrors the type-specific spe reassignment (objnam.c:5152-5218) and the
 * corpsenm/monster-type finalization (objnam.c:5220-5282), simplified.
 */
export function resolveTypeSpecific(
  state: ParseState,
  mode: 'wizard' | 'normal',
  rng: Rng,
  spe: number
): TypeSpecificOutcome {
  const notes: string[] = [];
  const wizard = mode === 'wizard';
  let mntmp = state.mntmp;

  switch (state.otyp) {
    case 'TIN': {
      if (state.contents !== 'spinach') spe = 0;
      break;
    }
    case 'TOWEL': {
      spe = state.wetness;
      break;
    }
    case 'SLIME_MOLD': {
      spe = 0;
      notes.push('Encodes the fruit id internally; displayed separately as the fruit name.');
      break;
    }
    case 'CORPSE': {
      if (mntmp) {
        const monster = MONSTERS_BY_NAME.get(mntmp.toLowerCase());
        if (!monster) {
          notes.push(`"${mntmp}" isn't a recognized monster in this tool's curated list -- treated as a random corpse.`);
          mntmp = null;
        } else if (monster.isUnique || !monster.hasCorpse) {
          notes.push(`${mntmp} is unique or leaves no corpse -- normal NetHack would substitute a random corpse instead.`);
        }
      }
      break;
    }
    case 'FIGURINE': {
      if (mntmp) {
        const monster = MONSTERS_BY_NAME.get(mntmp.toLowerCase());
        if (monster && (monster.isUnique || monster.isHuman) && mntmp.toLowerCase() !== 'mail daemon') {
          notes.push(`Figurines of unique monsters or humans (other than the mail daemon) are denied -- substitutes a random figurine.`);
          mntmp = null;
        }
      }
      break;
    }
    case 'EGG': {
      if (mntmp) {
        const monster = MONSTERS_BY_NAME.get(mntmp.toLowerCase());
        if (!monster || !monster.oviparous) {
          notes.push(`"${mntmp ?? 'that monster'}" isn't oviparous -- substitutes a random egg type.`);
          mntmp = null;
        }
      }
      break;
    }
    case 'WAN_WISHING': {
      if (!wizard) {
        spe = rng.rn2(10) ? -1 : 0;
        notes.push(`Wand of wishing is heavily anti-abuse-gated in normal play: charges forced to ${spe} (90% chance of -1, 10% chance of 0).`);
      } else {
        notes.push('Wizard mode grants the full requested charge count.');
      }
      break;
    }
  }

  return { spe, mntmp, notes };
}
