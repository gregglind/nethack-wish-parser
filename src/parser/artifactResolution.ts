import type { ArtifactDef } from './types';
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
 */
export function resolveArtifactWish(
  artifact: ArtifactDef,
  mode: 'wizard' | 'normal',
  rng: Rng,
  existingArtifacts = 1
): ArtifactOutcome {
  if (mode === 'wizard') {
    return { granted: true, note: 'Wizard mode always grants artifact wishes.' };
  }
  if (artifact.isQuestArtifact) {
    return {
      granted: false,
      note: `"${artifact.name}" is a quest artifact -- always denied outside wizard mode (it "evades your grasp" and falls to the floor).`,
    };
  }
  const n = Math.max(existingArtifacts, 1);
  const roll = rng.rn2(n);
  const granted = roll <= 1;
  return {
    granted,
    note: granted
      ? `Non-quest artifact: rn2(${n})=${roll} <= 1, so the wish succeeds.`
      : `Non-quest artifact: rn2(${n})=${roll} > 1, so the wish is denied -- "you feel it for a moment, but it disappears."`,
  };
}
