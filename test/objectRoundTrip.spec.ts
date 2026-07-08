import { describe, it, expect } from 'vitest';
import { OBJECTS } from '../src/data/objects';
import { runWishPipeline } from '../src/parser/pipeline';

/**
 * Golden round-trip check over the full mechanically-extracted OBJECTS
 * table: wishing (in wizard mode, so oc_nowish substitution doesn't get in
 * the way) for an entry's own actualName should resolve back to that same
 * otyp, for at least one of a handful of seeds. This is the main defense
 * against systematic data-entry bugs (wrong class, mis-split macro args,
 * material mixups, etc) across ~450 entries that can't be eyeballed by hand.
 *
 * A handful of otyps are unreachable via runWishPipeline for reasons that
 * have nothing to do with the object data itself:
 *  - GOLD_PIECE: gold has its own short-circuit path (postparse1's "gold
 *    piece"/"zorkmids" handling) that returns a plain string before any
 *    object-type field is ever populated.
 *  - GLOB_OF_BROWN_PUDDING / GLOB_OF_GREEN_SLIME / GLOB_OF_BLACK_PUDDING:
 *    readobjnamPostparse1's glob-detection is deliberately simplified to
 *    only ever produce GLOB_OF_GRAY_OOZE (see its own comment); the other
 *    glob types are real objects.h entries kept for data completeness but
 *    aren't reachable through that simplified regex.
 *  - HELMET: oRanges.ts's curated (pre-existing, not touched by this table
 *    regen) "helmet" o_range intercepts the bare word "helmet" and always
 *    picks between HELM_OF_BRILLIANCE/HELM_OF_TELEPATHY before the plain
 *    HELMET object ever gets a chance at a direct name match.
 */
const KNOWN_UNREACHABLE = new Set([
  'GOLD_PIECE',
  'GLOB_OF_BROWN_PUDDING',
  'GLOB_OF_GREEN_SLIME',
  'GLOB_OF_BLACK_PUDDING',
  'HELMET',
]);

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

describe('golden: every OBJECTS entry round-trips through its own actualName', () => {
  it(`resolves every wishable otyp (excluding ${KNOWN_UNREACHABLE.size} known-unreachable exceptions)`, () => {
    const failures: string[] = [];
    for (const entry of OBJECTS) {
      if (KNOWN_UNREACHABLE.has(entry.otyp)) continue;
      const matched = SEEDS.some((seed) => {
        const result = runWishPipeline(entry.actualName, seed);
        const otypField = result.wizardObject.fields.find((f) => f.label === 'Object type');
        return otypField?.value === entry.otyp;
      });
      if (!matched) failures.push(`${entry.otyp} (wished "${entry.actualName}")`);
    }
    expect(failures).toEqual([]);
  });

  it('every known-unreachable otyp still exists in OBJECTS (sanity check on the exception list)', () => {
    const otyps = new Set(OBJECTS.map((o) => o.otyp));
    for (const otyp of KNOWN_UNREACHABLE) {
      expect(otyps.has(otyp)).toBe(true);
    }
  });
});
