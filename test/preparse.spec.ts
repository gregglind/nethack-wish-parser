import { describe, it, expect } from 'vitest';
import { readobjnamInit } from '../src/parser/readobjnamInit';
import { readobjnamPreparse } from '../src/parser/readobjnamPreparse';
import { Rng } from '../src/parser/rng';

function preparse(input: string) {
  const { state } = readobjnamInit(input);
  return readobjnamPreparse(state, new Rng(1));
}

describe('readobjnamPreparse', () => {
  it('strips article, enchantment, and beatitude in order for a fully-loaded wish', () => {
    const { state, steps } = preparse('blessed +2 gray dragon scale mail');
    expect(state.blessed).toBe(true);
    expect(state.spe).toBe(2);
    expect(state.spesgn).toBe(1);
    expect(state.spesgnExplicit).toBe(true);
    expect(state.input).toBe('gray dragon scale mail');
    expect(steps.map((s) => s.id.split(':').slice(0, 2).join(':'))).toEqual([
      'preparse:beatitude',
      'preparse:enchantment',
    ]);
  });

  it('treats a literal "0" as not-a-quantity', () => {
    const { state } = preparse('0');
    expect(state.cnt).toBe(0);
    expect(state.input).toBe('0');
  });

  it('parses "0 boots" as an explicit zero count', () => {
    const { state } = preparse('0 boots');
    expect(state.cnt).toBe(0);
    expect(state.input).toBe('boots');
  });

  it('applies "thoroughly" as max erosion level (3)', () => {
    const { state } = preparse('thoroughly rusty long sword');
    expect(state.eroded).toBe(3);
  });

  it('applies plain erosion word as level 1', () => {
    const { state } = preparse('rusty long sword');
    expect(state.eroded).toBe(1);
  });

  it('treats holy/unholy as beatitude synonyms', () => {
    expect(preparse('holy water').state.blessed).toBe(true);
    expect(preparse('unholy water').state.iscursed).toBe(true);
  });

  it('leaves a qualifiers-only wish exhausted', () => {
    const { exhausted, state } = preparse('blessed greased');
    expect(exhausted).toBe(true);
    expect(state.blessed).toBe(true);
    expect(state.isgreased).toBe(true);
  });

  it('does not consume "small" ahead of a non-glob word (guards against "small mimic")', () => {
    const { state } = preparse('small mimic');
    expect(state.gsize).toBeNull();
    expect(state.input).toBe('small mimic');
  });
});
