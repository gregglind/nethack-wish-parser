import { describe, it, expect } from 'vitest';
import { runWishPipeline } from '../src/parser/pipeline';

describe('postparse resolution (via full pipeline)', () => {
  it('resolves "gray dragon scale mail" to the real object', () => {
    const result = runWishPipeline('blessed greased +2 gray dragon scale mail', 42);
    expect(result.failed).toBe(false);
    expect(result.wizardObject.xname).toContain('gray dragon scale mail');
    expect(result.wizardObject.xname).toContain('+2');
    expect(result.wizardObject.xname).toContain('greased');
  });

  it('resolves gold pieces via the short-circuit path and caps at 5000 in normal play', () => {
    const result = runWishPipeline('6000 gold pieces', 1);
    expect(result.wizardObject.xname).toBe('6000 gold pieces');
    expect(result.normalObject.xname).toBe('5000 gold pieces');
  });

  it('rejects "paperback spellbook"', () => {
    const result = runWishPipeline('paperback spellbook', 1);
    expect(result.failed).toBe(true);
  });

  it('rejects "broken glass"', () => {
    const result = runWishPipeline('broken glass', 1);
    expect(result.failed).toBe(true);
  });

  it('resolves "nothing" without producing an object', () => {
    const result = runWishPipeline('nothing', 1);
    expect(result.failed).toBe(false);
    expect(result.wizardObject.xname).toContain('wished for nothing');
  });

  it('infers cursed from "unholy" inside a suffix, not from the whole-string prefix', () => {
    const result = runWishPipeline('potion of unholy water', 1);
    expect(result.wizardObject.xname).toContain('cursed');
    expect(result.wizardObject.xname).not.toContain('blessed');
  });

  it('infers blessed from "holy water"', () => {
    const result = runWishPipeline('potion of holy water', 1);
    expect(result.wizardObject.xname).toContain('blessed');
  });

  it('does not mis-singularize inherently-plural footwear/handwear names', () => {
    const boots = runWishPipeline('blessed +2 speed boots', 1);
    expect(boots.wizardObject.xname).toContain('speed boots');
    const gloves = runWishPipeline('leather gloves', 1);
    expect(gloves.wizardObject.xname).toContain('leather gloves');
  });

  it('extracts monster and gender from "statue of a female gnome ruler"', () => {
    const result = runWishPipeline('statue of a female gnome ruler', 1);
    expect(result.wizardObject.xname).toContain('female gnome ruler statue');
  });

  it('always denies quest artifacts in normal play but grants them in wizard mode', () => {
    const result = runWishPipeline('blessed Orb of Fate', 1);
    expect(result.normalObject.xname).toContain('disappears');
    expect(result.wizardObject.xname).toContain('Orb of Fate');
  });

  it('resolves an artifact by name and forces quantity to 1', () => {
    const result = runWishPipeline('Excalibur', 1);
    expect(result.wizardObject.xname).toContain('Excalibur');
    expect(result.wizardObject.fields.find((f) => f.label === 'Quantity')?.value).toBe('1');
  });
});
