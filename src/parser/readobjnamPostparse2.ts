import type { ParseState, ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { O_RANGES } from '../data/oRanges';
import type { Rng } from './rng';
import { byOtyp } from './objectLookup';

/**
 * objects.h has no single generic "worthless piece of glass" otyp -- each
 * color is its own real GEM_CLASS object (WORTHLESS_WHITE_GLASS, etc, 9
 * total). Mirrors the real desc strings on those GEM() entries.
 */
const GLASS_COLOR_OTYP: Record<string, string> = {
  white: 'WORTHLESS_WHITE_GLASS',
  blue: 'WORTHLESS_BLUE_GLASS',
  red: 'WORTHLESS_RED_GLASS',
  'yellowish brown': 'WORTHLESS_YELLOWBROWN_GLASS',
  orange: 'WORTHLESS_ORANGE_GLASS',
  yellow: 'WORTHLESS_YELLOW_GLASS',
  black: 'WORTHLESS_BLACK_GLASS',
  green: 'WORTHLESS_GREEN_GLASS',
  violet: 'WORTHLESS_VIOLET_GLASS',
};

export function readobjnamPostparse2(input: ParseState, rng: Rng): { state: ParseState; steps: ParseStep[]; rejected: string | null } {
  let s = { ...input };
  const steps: ParseStep[] = [];
  const text = s.input.trim();
  const lower = text.toLowerCase();

  if (!s.otyp) {
    const key = Object.keys(O_RANGES).find((k) => k.toLowerCase() === lower);
    if (key) {
      const options = O_RANGES[key].map((otyp) => byOtyp(otyp)).filter((o): o is NonNullable<typeof o> => !!o);
      const chosen = rng.weightedPick(options, (o) => Math.max(o.prob, 1));
      s = { ...s, otyp: chosen.otyp, oclass: chosen.class };
      steps.push({
        id: 'postparse2:o-ranges',
        stage: 'postparse2',
        title: `Exact class match ("${key}") -> weighted-random subtype`,
        matched: true,
        inputBefore: text,
        inputAfter: chosen.actualName,
        stateDiff: { otyp: chosen.otyp, oclass: chosen.class },
        sourceRef: SOURCE_REFS.postparse2ORanges,
        category: 'resolve-random',
        notes: [
          `Candidates: ${options.map((o) => o.actualName).join(', ')}.`,
          `Picked "${chosen.actualName}" (weighted by rarity).`,
        ],
      });
      return { state: s, steps, rejected: null };
    }
  }

  if (!s.otyp) {
    const stoneGem = /^(.+) (stone|gem)$/i.exec(text);
    if (stoneGem) {
      const before = text;
      const remainder = stoneGem[1].trim();
      s = { ...s, input: remainder, oclass: 'gem', dn: s.dn ?? remainder, actualn: remainder };
      steps.push({
        id: 'postparse2:stone-gem-suffix',
        stage: 'postparse2',
        title: '"stone"/"gem" suffix',
        matched: true,
        inputBefore: before,
        inputAfter: remainder,
        stateDiff: { oclass: 'gem', actualn: remainder },
        sourceRef: SOURCE_REFS.postparse2StoneGem,
        category: 'lookup',
      });
    }
  }

  if (!s.otyp) {
    const glass = /^(?:(worthless )?(?:piece of )?(?:colou?red )?(.*)\s)?glass$/i.exec(text);
    if (glass) {
      const before = text;
      if (s.broken || /\bbroken\b/i.test(text)) {
        return { state: s, steps, rejected: 'Nothing fitting that description exists in the game.' };
      }
      const color = (glass[2] || '').trim().toLowerCase();
      if (!color) {
        const chosen = rng.pick(Object.keys(GLASS_COLOR_OTYP));
        const reconstructed = `worthless piece of ${chosen} glass`;
        s = { ...s, otyp: GLASS_COLOR_OTYP[chosen], oclass: 'gem', dn: reconstructed };
        steps.push({
          id: 'postparse2:glass-random',
          stage: 'postparse2',
          title: 'Bare "glass" -> random glass-gem color',
          matched: true,
          inputBefore: before,
          inputAfter: reconstructed,
          stateDiff: { otyp: GLASS_COLOR_OTYP[chosen], oclass: 'gem' },
          sourceRef: SOURCE_REFS.postparse2Glass,
          category: 'resolve-random',
        });
      } else if (GLASS_COLOR_OTYP[color]) {
        const reconstructed = `worthless piece of ${color} glass`;
        s = { ...s, input: reconstructed, otyp: GLASS_COLOR_OTYP[color], oclass: 'gem', dn: reconstructed };
        steps.push({
          id: 'postparse2:glass-colored',
          stage: 'postparse2',
          title: '"X glass" suffix',
          matched: true,
          inputBefore: before,
          inputAfter: reconstructed,
          stateDiff: { otyp: GLASS_COLOR_OTYP[color], oclass: 'gem' },
          sourceRef: SOURCE_REFS.postparse2Glass,
          category: 'lookup',
        });
      } else {
        const reconstructed = `worthless piece of ${color} glass`;
        s = { ...s, input: reconstructed, oclass: 'gem', dn: reconstructed };
        steps.push({
          id: 'postparse2:glass-colored-unknown',
          stage: 'postparse2',
          title: '"X glass" suffix (unrecognized color)',
          matched: true,
          inputBefore: before,
          inputAfter: reconstructed,
          stateDiff: { oclass: 'gem' },
          sourceRef: SOURCE_REFS.postparse2Glass,
          category: 'lookup',
          notes: [`"${color}" isn't one of the real worthless-glass colors -- falls through to a random gem.`],
        });
      }
    }
  }

  // objnam.c ~4748: d->actualn = d->bp; if (!d->dn) d->dn = d->actualn;
  if (!s.otyp) {
    const actualn = s.actualn ?? s.input;
    s = { ...s, actualn, dn: s.dn ?? actualn };
  }

  return { state: s, steps, rejected: null };
}
