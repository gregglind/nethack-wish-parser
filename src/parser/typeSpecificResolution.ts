import type { ParseState } from './types';
import { MONSTERS, MONSTERS_BY_NAME } from '../data/monsters';
import type { Rng } from './rng';

const CORPSE_ELIGIBLE_MONSTERS = MONSTERS.filter((m) => m.hasCorpse && !m.isUnique);
const FIGURINE_ELIGIBLE_MONSTERS = MONSTERS.filter((m) => !m.isHuman && !m.isUnique);
// Statues have no uniqueness/human/no-corpse restriction at all (real
// corpsenm-finalization has no gate for STATUE, unlike CORPSE/TIN/FIGURINE)
// -- this pool is only used as the mksobj()-creation-time random fallback
// when no monster was named, matching rndmonnum()'s usual non-unique bias.
const STATUE_ELIGIBLE_MONSTERS = MONSTERS.filter((m) => !m.isUnique);

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
      if (state.contents !== 'spinach') {
        spe = 0;
        const monster = mntmp ? MONSTERS_BY_NAME.get(mntmp.toLowerCase()) : undefined;
        const blockedByUniqueness = !!monster?.isUnique && !wizard;
        const blockedByNoCorpse = !!mntmp && (!monster || !monster.hasCorpse);
        // TIN has its own extra requirement on top of hasCorpse/uniqueness
        // (objnam.c ~5236-5240): mons[].cnutrit must be nonzero. Wraith is
        // the one monster in the roster with a real corpse (hasCorpse) that
        // still fails this -- 0 nutrition means there's no meat to tin.
        const blockedByZeroNutrition = !blockedByNoCorpse && !!monster?.zeroNutrition;
        const noneSpecified = !mntmp;
        if (noneSpecified || blockedByUniqueness || blockedByNoCorpse || blockedByZeroNutrition) {
          const fallback = rng.pick(CORPSE_ELIGIBLE_MONSTERS);
          notes.push(
            noneSpecified
              ? `No monster specified -- a tin always gets some random content the moment it's created (simplified from a full random monster roll, "${fallback.name}" here), it isn't left blank.`
              : !monster
                ? `"${mntmp}" isn't a recognized monster -- the tin keeps the random content it was already given when created ("${fallback.name}" here, simplified from a full random monster roll).`
                : blockedByUniqueness
                  ? `${mntmp} is unique -- outside wizard mode the wish can't target it, so the tin keeps its random creation-time content ("${fallback.name}" here) instead.`
                  : blockedByZeroNutrition
                    ? `${mntmp} has zero nutrition -- even though it has a corpse, there's no meat to tin, so it keeps its random creation-time content ("${fallback.name}" here) instead.`
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
      const monster = mntmp ? MONSTERS_BY_NAME.get(mntmp.toLowerCase()) : undefined;
      const blockedByUniqueness = !!monster?.isUnique && !wizard;
      const blockedByNoCorpse = !!mntmp && (!monster || !monster.hasCorpse);
      const noneSpecified = !mntmp;
      if (noneSpecified || blockedByUniqueness || blockedByNoCorpse) {
        const fallback = rng.pick(CORPSE_ELIGIBLE_MONSTERS);
        notes.push(
          noneSpecified
            ? `No monster specified -- mksobj() always rolls a real random corpse-eligible monster at creation ("${fallback.name}" here), it isn't left blank.`
            : !monster
              ? `"${mntmp}" isn't a recognized monster -- substitutes a random corpse ("${fallback.name}" here).`
              : blockedByUniqueness
                ? `${mntmp} is unique -- outside wizard mode the wish can't target it, so it substitutes a random corpse ("${fallback.name}" here) instead.`
                : `${mntmp} leaves no corpse -- substitutes a random corpse ("${fallback.name}" here) instead.`
        );
        mntmp = fallback.name;
      }
      break;
    }
    case 'FIGURINE': {
      const monster = mntmp ? MONSTERS_BY_NAME.get(mntmp.toLowerCase()) : undefined;
      const isMailDaemon = mntmp?.toLowerCase() === 'mail daemon';
      const blockedByUniqueness = !!monster?.isUnique && !isMailDaemon;
      const blockedByHuman = !!monster?.isHuman && !isMailDaemon;
      const noneSpecified = !mntmp;
      if (noneSpecified || blockedByUniqueness || blockedByHuman) {
        const fallback = rng.pick(FIGURINE_ELIGIBLE_MONSTERS);
        notes.push(
          noneSpecified
            ? `No monster specified -- mksobj() always rolls a real random monster at creation ("${fallback.name}" here), it isn't left blank.`
            : blockedByUniqueness
              ? `${mntmp} is unique -- figurines of unique monsters are always denied, even in wizard mode -- substitutes a random figurine ("${fallback.name}" here).`
              : `Figurines of humans (other than the mail daemon) are denied -- substitutes a random figurine ("${fallback.name}" here).`
        );
        mntmp = fallback.name;
      }
      break;
    }
    case 'STATUE': {
      if (!mntmp) {
        const fallback = rng.pick(STATUE_ELIGIBLE_MONSTERS);
        notes.push(`No monster specified -- mksobj() always rolls a real random monster at creation ("${fallback.name}" here), it isn't left blank.`);
        mntmp = fallback.name;
      }
      // Unlike CORPSE/TIN/FIGURINE, an explicitly named monster (even a
      // unique one, e.g. Medusa) is never blocked here, in either mode --
      // there's no G_UNIQ/G_NOCORPSE/wizard gate on STATUE in the real
      // finalization switch.
      break;
    }
    case 'EGG': {
      if (mntmp) {
        let monster = MONSTERS_BY_NAME.get(mntmp.toLowerCase());
        // can_be_hatched() (mon.c:5553-5572) calls little_to_big() before
        // checking oviparous-ness -- "baby X" normalizes to the adult "X"
        // that actually lays eggs, and the egg ends up described by that
        // adult species either way ("baby blue dragon egg" and "blue
        // dragon egg" are the same wish).
        if (mntmp.toLowerCase().startsWith('baby ')) {
          const adult = MONSTERS_BY_NAME.get(mntmp.slice(5).toLowerCase());
          if (adult) {
            notes.push(`"${mntmp}" is the juvenile form -- eggs are described by the adult species that lays them ("${adult.name}").`);
            mntmp = adult.name;
            monster = adult;
          }
        }
        if (!monster || !monster.oviparous) {
          notes.push(`"${mntmp}" isn't oviparous -- substitutes a generic egg.`);
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
