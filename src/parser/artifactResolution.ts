import type { ArtifactDef, Role } from './types';
import type { Rng } from './rng';

export interface ArtifactOutcome {
  granted: boolean;
  note: string;
}

/**
 * Mirrors the artifact wish denial (objnam.c:5400-5410). `existingArtifacts`
 * approximates nartifact_exist() -- how many artifacts already exist in the
 * current game, which this tool can't know, so it defaults to 1 (only the
 * one being wished for) unless the user says otherwise.
 *
 * is_quest_artifact() (questpgr.c:66-70) only returns true for *your own
 * role's* quest artifact -- wishing for a different role's quest artifact
 * isn't specially denied at all, it just rolls the same generic
 * "rn2(nartifact_exist()) > 1" check as any ordinary artifact.
 */
export function resolveArtifactWish(
  artifact: ArtifactDef,
  mode: 'wizard' | 'normal',
  rng: Rng,
  currentRole: Role | null,
  existingArtifacts = 1
): ArtifactOutcome {
  if (mode === 'wizard') {
    return { granted: true, note: 'Wizard mode always grants artifact wishes.' };
  }
  if (artifact.isQuestArtifact && artifact.role === currentRole) {
    return {
      granted: false,
      note: `"${artifact.name}" is the ${currentRole}'s own quest artifact -- always denied outside wizard mode (it "evades your grasp" and falls to the floor).`,
    };
  }
  const n = Math.max(existingArtifacts, 1);
  const roll = rng.rn2(n);
  const granted = roll <= 1;
  const questCaveat = artifact.isQuestArtifact
    ? currentRole
      ? ` (it's the ${artifact.role}'s quest artifact, not the ${currentRole}'s, so it isn't specially denied)`
      : ` (it's the ${artifact.role}'s quest artifact -- no role selected, so it isn't specially denied)`
    : '';
  return {
    granted,
    note: granted
      ? `${artifact.isQuestArtifact ? 'Quest artifact, but not yours' : 'Non-quest artifact'}${questCaveat}: rn2(${n})=${roll} <= 1, so the wish succeeds.`
      : `${artifact.isQuestArtifact ? 'Quest artifact, but not yours' : 'Non-quest artifact'}${questCaveat}: rn2(${n})=${roll} > 1, so the wish is denied -- "you feel it for a moment, but it disappears."`,
  };
}
