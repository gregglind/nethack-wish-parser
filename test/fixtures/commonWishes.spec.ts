import { describe, it, expect } from 'vitest';
import { COMMON_WISHES } from '../../src/data/commonWishes';
import { runWishPipeline } from '../../src/parser/pipeline';

const EXPECTED_FAILURES = new Set([
  'broken glass',
  'paperback spellbook',
  'blessed greased +2 gray scale mail',
  'gray dragon scale mail of gray dragon scale mail',
  'firetrap',
  'eyes',
]);

describe('golden: every curated common wish', () => {
  for (const wish of COMMON_WISHES) {
    it(`parses "${wish.text}" without throwing`, () => {
      const result = runWishPipeline(wish.text, 7);
      expect(result.steps.length).toBeGreaterThan(0);
      if (EXPECTED_FAILURES.has(wish.text)) {
        expect(result.failed).toBe(true);
      } else {
        expect(result.wizardObject.xname).not.toContain('Nothing fitting');
        expect(result.normalObject.xname).not.toContain('Nothing fitting');
      }
    });
  }

  it('is deterministic for a given seed', () => {
    const a = runWishPipeline('blessed greased +2 gray dragon scale mail', 99);
    const b = runWishPipeline('blessed greased +2 gray dragon scale mail', 99);
    expect(a.wizardObject.xname).toBe(b.wizardObject.xname);
    expect(a.normalObject.xname).toBe(b.normalObject.xname);
  });
});
