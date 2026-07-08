import { describe, it, expect } from 'vitest';
import { resolveEnchantment } from '../src/parser/enchantmentResolution';
import { readobjnamInit } from '../src/parser/readobjnamInit';
import { Rng } from '../src/parser/rng';

describe('resolveEnchantment', () => {
  it('wizard mode only applies the SPE_LIM cap', () => {
    const { state } = readobjnamInit('');
    const requested = { ...state, spesgnExplicit: true, spesgn: 1 as const, spe: 150 };
    const outcome = resolveEnchantment(requested, 'wizard', new Rng(1), 0, 0);
    expect(outcome.spe).toBe(99);
  });

  it('keeps the natural roll when no enchantment was requested', () => {
    const { state } = readobjnamInit('');
    const outcome = resolveEnchantment(state, 'normal', new Rng(1), 3, 0);
    expect(outcome.spe).toBe(3);
  });

  it('normal mode cannot exceed the natural roll for non-gated classes', () => {
    const { state } = readobjnamInit('');
    const requested = { ...state, spesgnExplicit: true, spesgn: 1 as const, spe: 10, otyp: null, oclass: null };
    const outcome = resolveEnchantment(requested, 'normal', new Rng(1), 2, 0);
    expect(outcome.spe).toBeLessThanOrEqual(2);
  });
});
