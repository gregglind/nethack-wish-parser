import { describe, it, expect } from 'vitest';
import { runWishPipeline } from '../src/parser/pipeline';

describe('wizard-mode terrain/trap wishes', () => {
  it('resolves "bear trap" as the disarmed object by default', () => {
    const result = runWishPipeline('bear trap', 1);
    // The disarmed BEARTRAP tool's real objects.h name is one word
    // ("beartrap"); "bear trap" (the terrain-feature wording) only appears
    // for the wizard-mode-only armed-trap path exercised below.
    expect(result.wizardObject.xname).toContain('beartrap');
    expect(result.normalObject.xname).toContain('beartrap');
    expect(result.wizardObject.xname).not.toContain('Creates');
  });

  it('resolves "trapped bear trap" as an armed trap in wizard mode only', () => {
    const result = runWishPipeline('trapped bear trap', 1);
    expect(result.wizardObject.xname).toContain('Creates');
    expect(result.wizardObject.xname).toContain('bear trap');
    expect(result.normalObject.xname).toBe('Nothing fitting that description exists.');
  });

  it('resolves "trapped land mine" as an armed trap in wizard mode only', () => {
    const result = runWishPipeline('trapped land mine', 1);
    expect(result.wizardObject.xname).toContain('Creates');
    expect(result.normalObject.xname).toBe('Nothing fitting that description exists.');
  });

  it('resolves a bare trap keyword ("web") to a wizard-mode trap', () => {
    const result = runWishPipeline('web', 1);
    expect(result.wizardObject.xname).toContain('web');
    expect(result.wizardObject.xname).toContain('Creates');
    expect(result.normalObject.xname).toBe('Nothing fitting that description exists.');
  });

  it('resolves a terrain suffix keyword ("fountain") to a wizard-mode feature', () => {
    const result = runWishPipeline('fountain', 1);
    expect(result.wizardObject.xname).toContain('fountain');
    expect(result.normalObject.xname).toBe('Nothing fitting that description exists.');
  });

  it('still resolves ordinary objects normally when no terrain/trap keyword matches', () => {
    const result = runWishPipeline('potion of healing', 1);
    expect(result.wizardObject.xname).toContain('potion of healing');
    expect(result.normalObject.xname).toContain('potion of healing');
  });
});
