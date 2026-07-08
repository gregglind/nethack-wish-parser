import type { ParseState, ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { TRAP_KEYWORDS, TERRAIN_KEYWORDS, doorStateNote } from '../data/terrainTraps';

/**
 * Bear trap / land mine are both ordinary wishable objects AND wizard-mode
 * armed floor traps. The C parser disambiguates this before general object
 * matching (readobjnam_postparse1, ~4651-4691): an explicit "trapped "
 * prefix (or trailing "trap"/"mine" text) means the ARMED trap; otherwise
 * it's the plain disarmed object (handled normally via the object lookup).
 * This must run before postparse2/3 so it can intercept "bear trap" before
 * the fuzzy object lookup claims it as the ordinary BEARTRAP/LAND_MINE item.
 */
export function resolveBearTrapLandMineDisambiguation(input: ParseState): { state: ParseState; step: ParseStep | null } {
  if (input.otyp || input.oclass) return { state: input, step: null };

  const text = input.input.trim().toLowerCase().replace(/\s+/g, ' ');
  const isBear = text === 'bear trap' || text === 'beartrap';
  const isMine = text === 'land mine' || text === 'landmine';
  if ((!isBear && !isMine) || input.trapped !== 1) {
    return { state: input, step: null };
  }

  const name = isBear ? 'bear trap' : 'land mine';
  const state: ParseState = {
    ...input,
    terrainMatch: {
      kind: 'trap',
      name,
      note: `The "trapped" prefix requested the armed floor trap rather than the ordinary ${name} object.`,
    },
  };
  const step: ParseStep = {
    id: 'postparse1:bear-trap-land-mine',
    stage: 'postparse1',
    title: 'Bear trap / land mine: armed trap vs. object',
    matched: true,
    inputBefore: input.input,
    inputAfter: name,
    stateDiff: {},
    sourceRef: SOURCE_REFS.postparse1ClassName,
    category: 'lookup',
    notes: [`"trapped ${name}" resolves to an armed map trap, not the disarmed tool object.`],
  };
  return { state, step };
}

/**
 * General wizard-mode terrain/trap wish matching (wizterrainwish(),
 * objnam.c:3583-3945), tried only as a last resort after every ordinary
 * object/class match has failed.
 */
export function resolveTerrainTrapWish(input: ParseState): { state: ParseState; step: ParseStep | null } {
  if (input.otyp || input.oclass || input.terrainMatch) return { state: input, step: null };

  const text = input.input.trim();
  const lower = text.toLowerCase();

  for (const { keyword, name } of TRAP_KEYWORDS) {
    if (lower.startsWith(keyword)) {
      const state: ParseState = {
        ...input,
        terrainMatch: { kind: 'trap', name, note: 'Only reachable in wizard mode, after no object/class matched.' },
      };
      return {
        state,
        step: {
          id: 'terrain-trap:trap',
          stage: 'terrainTrap',
          title: 'Wizard-mode trap wish',
          matched: true,
          inputBefore: text,
          inputAfter: name,
          stateDiff: {},
          sourceRef: SOURCE_REFS.wizterrainwish,
          category: 'construct',
          notes: [`Matched trap keyword "${keyword}".`, 'Creates a floor trap, not an inventory object.'],
        },
      };
    }
  }

  for (const { keyword, name } of TERRAIN_KEYWORDS) {
    if (lower.endsWith(keyword)) {
      const stateNote = doorStateNote(input);
      const note = stateNote ? `Door/feature state: ${stateNote}.` : undefined;
      const state: ParseState = {
        ...input,
        terrainMatch: {
          kind: 'terrain',
          name,
          note: 'Only reachable in wizard mode, after no object/class matched.',
        },
      };
      return {
        state,
        step: {
          id: 'terrain-trap:terrain',
          stage: 'terrainTrap',
          title: 'Wizard-mode terrain wish',
          matched: true,
          inputBefore: text,
          inputAfter: name,
          stateDiff: {},
          sourceRef: SOURCE_REFS.wizterrainwish,
          category: 'construct',
          notes: [`Matched terrain keyword "${keyword}".`, note, 'Creates a dungeon feature, not an inventory object.'].filter(
            (n): n is string => !!n
          ),
        },
      };
    }
  }

  return { state: input, step: null };
}
