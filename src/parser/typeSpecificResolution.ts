import type { ParseState } from './types';
import { MONSTERS, MONSTERS_BY_NAME } from '../data/monsters';
import type { Rng } from './rng';

const CORPSE_ELIGIBLE_MONSTERS = MONSTERS.filter((m) => m.hasCorpse && !m.isUnique);

/** objnam.c:5275-5280 -- generic "scale mail" + a dragon-name mntmp becomes that dragon's scale mail. */
const DRAGON_SCALE_MAIL_BY_MONSTER: Record<string, string> = {
  'gray dragon': 'GRAY_DRAGON_SCALE_MAIL',
  'gold dragon': 'GOLD_DRAGON_SCALE_MAIL',
  'silver dragon': 'SILVER_DRAGON_SCALE_MAIL',
  'red dragon': 'RED_DRAGON_SCALE_MAIL',
  'white dragon': 'WHITE_DRAGON_SCALE_MAIL',
  'orange dragon': 'ORANGE_DRAGON_SCALE_MAIL',
  'black dragon': 'BLACK_DRAGON_SCALE_MAIL',
  'blue dragon': 'BLUE_DRAGON_SCALE_MAIL',
  'green dragon': 'GREEN_DRAGON_SCALE_MAIL',
  'yellow dragon': 'YELLOW_DRAGON_SCALE_MAIL',
};

export interface TypeSpecificOutcome {
  otyp: string | null;
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
  let otyp = state.otyp;

  switch (state.otyp) {
    case 'TIN': {
      if (state.contents !== 'spinach') spe = 0;
      if (mntmp) {
        const monster = MONSTERS_BY_NAME.get(mntmp.toLowerCase());
        const blockedByUniqueness = !!monster?.isUnique && !wizard;
        const blockedByNoCorpse = !monster || !monster.hasCorpse;
        if (blockedByUniqueness || blockedByNoCorpse) {
          const fallback = rng.pick(CORPSE_ELIGIBLE_MONSTERS);
          notes.push(
            !monster
              ? `"${mntmp}" isn't a recognized monster -- the tin keeps the random content it was already given when created ("${fallback.name}" here, simplified from a full random monster roll).`
              : blockedByUniqueness
                ? `${mntmp} is unique -- outside wizard mode the wish can't target it, so the tin keeps its random creation-time content ("${fallback.name}" here) instead.`
                : `${mntmp} leaves no corpse -- the tin keeps its random creation-time content ("${fallback.name}" here) instead.`
          );
          mntmp = fallback.name;
        }
      }
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
    case 'SCALE_MAIL': {
      const dragonType = mntmp ? DRAGON_SCALE_MAIL_BY_MONSTER[mntmp.toLowerCase()] : undefined;
      if (dragonType) {
        notes.push(`"${mntmp}" prefix matched before "scale mail" -- upgrades the generic scale mail to ${mntmp} scale mail.`);
        otyp = dragonType;
        mntmp = null;
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

  return { otyp, spe, mntmp, notes };
}
