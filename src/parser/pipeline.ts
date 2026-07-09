import type { ParseState, ParseStep, WishResult, Role } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { Rng } from './rng';
import { makewish } from './makewish';
import { readobjnamInit } from './readobjnamInit';
import { readobjnamPreparse } from './readobjnamPreparse';
import { readobjnamParseCharges } from './readobjnamParseCharges';
import { readobjnamPostparse1 } from './readobjnamPostparse1';
import { readobjnamPostparse2 } from './readobjnamPostparse2';
import { readobjnamPostparse3 } from './readobjnamPostparse3';
import { objectConstruction, applyModeSubstitution } from './objectConstruction';
import { resolveQuantity } from './quantityResolution';
import { rollBaseEnchantment, resolveEnchantment } from './enchantmentResolution';
import { rollBaseBuc, resolveBuc, type Buc } from './bucAssignment';
import { resolveErosion } from './erosionAssignment';
import { resolveTypeSpecific } from './typeSpecificResolution';
import { resolveArtifactWish } from './artifactResolution';
import { resolveBearTrapLandMineDisambiguation, resolveTerrainTrapWish } from './terrainTrapWish';
import { renderObject, type FinalFields } from './xname';
import { article } from './utils';
import { byOtyp } from './objectLookup';
import { ARTIFACTS_BY_NAME } from '../data/artifacts';

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function combinedStep(
  id: string,
  stage: ParseStep['stage'],
  title: string,
  before: string,
  after: string,
  sourceRef: ParseStep['sourceRef'],
  category: ParseStep['category'],
  wizardNote: string,
  normalNote: string,
  probability?: number
): ParseStep {
  return {
    id,
    stage,
    title,
    matched: true,
    inputBefore: before,
    inputAfter: after,
    stateDiff: {},
    sourceRef,
    category,
    rngNote: {
      description: title,
      wizardOutcome: wizardNote,
      normalModeProbability: probability,
      normalModeOutcomeDescription: normalNote,
    },
  };
}

export function runWishPipeline(rawInput: string, seed?: number, luck = 0, currentRole: Role | null = null): WishResult {
  const effectiveSeed = seed ?? hashSeed(rawInput);
  const clampedLuck = Math.max(-13, Math.min(13, luck));
  const lookupRng = new Rng(effectiveSeed);
  const outcomeRngNormal = new Rng(effectiveSeed + 1);
  const outcomeRngWizard = new Rng(effectiveSeed + 2); // deterministic paths don't actually consume this

  const steps: ParseStep[] = [];

  const mw = makewish(rawInput);
  steps.push(...mw.steps);

  if (mw.isNothing) {
    return {
      input: rawInput,
      steps,
      wizardObject: { xname: 'You wished for nothing. (Wishless conduct preserved.)', fields: [] },
      normalObject: { xname: 'You wished for nothing. (Wishless conduct preserved.)', fields: [] },
      failed: false,
    };
  }

  const { state: initState, step: initStep } = readobjnamInit(mw.cleaned);
  steps.push(initStep);

  const preparseResult = readobjnamPreparse(initState, lookupRng);
  steps.push(...preparseResult.steps);
  let state: ParseState = preparseResult.state;

  if (preparseResult.exhausted) {
    steps.push({
      id: 'preparse:qualifiers-only',
      stage: 'preparse',
      title: 'Qualifiers only -- no object name left',
      matched: true,
      inputBefore: state.input,
      inputAfter: '',
      stateDiff: {},
      sourceRef: SOURCE_REFS.preparseLoop,
      category: 'lex',
      notes: ['Falls through to a fully random object of a random class, keeping every qualifier parsed so far (BUC, enchantment, greased, etc).'],
    });
  }

  // Default count to 1 (objnam.c:4960-4961).
  if (!state.cnt) state = { ...state, cnt: 1 };

  const chargesResult = readobjnamParseCharges(state);
  state = chargesResult.state;
  if (chargesResult.step) steps.push(chargesResult.step);

  const pp1 = readobjnamPostparse1(state);
  steps.push(...pp1.steps);
  state = pp1.state;

  if (pp1.rejected) {
    return buildFailure(rawInput, steps, pp1.rejected);
  }

  if (pp1.goldShortCircuit) {
    return buildGoldResult(rawInput, steps, pp1.goldShortCircuit.cnt);
  }

  const bearTrapCheck = resolveBearTrapLandMineDisambiguation(state);
  state = bearTrapCheck.state;
  if (bearTrapCheck.step) steps.push(bearTrapCheck.step);

  if (!state.otyp && !state.terrainMatch) {
    const pp2 = readobjnamPostparse2(state, lookupRng);
    steps.push(...pp2.steps);
    state = pp2.state;
    if (pp2.rejected) {
      return buildFailure(rawInput, steps, pp2.rejected);
    }
  }

  if (!state.otyp && !state.terrainMatch) {
    const pp3 = readobjnamPostparse3(state, lookupRng);
    steps.push(...pp3.steps);
    state = pp3.state;
  }

  if (!state.otyp && !state.oclass && !state.terrainMatch) {
    const terrainCheck = resolveTerrainTrapWish(state);
    state = terrainCheck.state;
    if (terrainCheck.step) steps.push(terrainCheck.step);
  }

  if (state.terrainMatch) {
    return buildTerrainResult(rawInput, steps, state.terrainMatch);
  }

  // No type, no class, and leftover text that never matched anything --
  // mirrors readobjnam()'s final `if (!d.oclass) return NULL;`. The random
  // any-class fallback (objnam.c's `any:` label) only fires for a genuinely
  // empty string (nothing left after qualifiers were stripped); non-empty
  // unmatched text is a failed wish ("Nothing fitting that description
  // exists in the game."), not a consolation random item.
  if (!state.otyp && !state.oclass && state.input.trim().length > 0) {
    return buildFailure(rawInput, steps, 'Nothing fitting that description exists in the game.');
  }

  const construction = objectConstruction(state, lookupRng);
  steps.push(construction.step);
  state = construction.state;

  if (!state.otyp && !state.oclass) {
    return buildFailure(rawInput, steps, 'Nothing fitting that description exists in the game.');
  }

  const baseBuc: Buc = rollBaseBuc(lookupRng);
  const baseSpe = rollBaseEnchantment(state, lookupRng);

  const wizardFields = resolveMode(state, 'wizard', outcomeRngWizard, baseBuc, baseSpe, clampedLuck, currentRole);
  const normalFields = resolveMode(state, 'normal', outcomeRngNormal, baseBuc, baseSpe, clampedLuck, currentRole);

  // Mode substitution step (only interesting if it actually differs).
  if (wizardFields.otyp !== normalFields.otyp || wizardFields.rejectedNote || normalFields.rejectedNote) {
    steps.push(
      combinedStep(
        'mode-substitution',
        'construction',
        'Non-wizard item substitution',
        state.otyp ? (byOtyp(state.otyp)?.actualName ?? state.otyp) : String(state.oclass),
        normalFields.otyp ? (byOtyp(normalFields.otyp)?.actualName ?? normalFields.otyp) : 'denied',
        SOURCE_REFS.objectConstruction,
        'finalize',
        wizardFields.subNote ?? 'Granted as requested.',
        normalFields.subNote ?? normalFields.rejectedNote ?? 'Granted as requested.'
      )
    );
  }

  if (state.isArtifact) {
    steps.push(
      combinedStep(
        'artifact-denial',
        'artifact',
        'Artifact wish denial check',
        state.artifactName ?? '',
        state.artifactName ?? '',
        SOURCE_REFS.artifactDenial,
        'resolve-random',
        wizardFields.artifactNote ?? '',
        normalFields.artifactNote ?? '',
        undefined
      )
    );
  }

  steps.push(
    combinedStep(
      'quantity',
      'quantity',
      'Quantity resolution',
      String(state.cnt),
      String(normalFields.quan),
      SOURCE_REFS.quantity,
      'resolve-random',
      wizardFields.quantityNote,
      normalFields.quantityNote
    )
  );

  steps.push(
    combinedStep(
      'enchantment',
      'enchantment',
      'Enchantment resolution',
      `requested ${state.spesgn < 0 ? '-' : '+'}${state.spe}`,
      `+${normalFields.spe}`,
      SOURCE_REFS.enchantment,
      'resolve-random',
      wizardFields.enchantmentNote,
      normalFields.enchantmentNote
    )
  );

  if (wizardFields.typeSpecificNotes.length || normalFields.typeSpecificNotes.length) {
    steps.push(
      combinedStep(
        'type-specific',
        'typeSpecific',
        'Type-specific resolution',
        state.otyp ?? '',
        state.otyp ?? '',
        SOURCE_REFS.typeSpecificSpe,
        'resolve-random',
        wizardFields.typeSpecificNotes.join(' ') || 'n/a',
        normalFields.typeSpecificNotes.join(' ') || 'n/a'
      )
    );
  }

  steps.push(
    combinedStep(
      'buc',
      'buc',
      'Beatitude resolution',
      'requested beatitude',
      normalFields.buc,
      SOURCE_REFS.buc,
      'resolve-random',
      wizardFields.bucNote,
      normalFields.bucNote
    )
  );

  if (state.eroded || state.eroded2 || state.erodeproof) {
    steps.push(
      combinedStep(
        'erosion',
        'erosion',
        'Erosion resolution',
        'requested erosion/erodeproof',
        `eroded=${normalFields.eroded} eroded2=${normalFields.eroded2} erodeproof=${normalFields.erodeproof}`,
        SOURCE_REFS.erosion,
        'finalize',
        wizardFields.erosionNote,
        normalFields.erosionNote
      )
    );
  }

  const wizardObject = renderObject(wizardFields);
  const normalObject = renderObject(normalFields);

  return {
    input: rawInput,
    steps,
    wizardObject,
    normalObject,
    failed: false,
  };
}

interface ModeFields extends FinalFields {
  subNote: string | null;
  rejectedNote: string | null;
  artifactNote: string | null;
  quantityNote: string;
  enchantmentNote: string;
  bucNote: string;
  erosionNote: string;
  typeSpecificNotes: string[];
}

function resolveMode(
  state: ParseState,
  mode: 'wizard' | 'normal',
  rng: Rng,
  baseBuc: Buc,
  baseSpe: number,
  luck: number,
  currentRole: Role | null
): ModeFields {
  const sub = applyModeSubstitution(state, mode, rng);
  let workingState = { ...state, otyp: sub.otyp };
  let rejected: string | null = sub.rejected;

  let artifactNote: string | null = null;
  if (!rejected && state.isArtifact && state.artifactName) {
    const artifact = ARTIFACTS_BY_NAME.get(state.artifactName.toLowerCase());
    if (artifact) {
      const outcome = resolveArtifactWish(artifact, mode, rng, currentRole);
      artifactNote = outcome.note;
      if (!outcome.granted) {
        rejected = `For a moment, you feel the ${artifact.name} in your hands, but it disappears!`;
      }
    }
  }

  if (rejected) {
    return {
      otyp: null,
      quan: 0,
      spe: 0,
      buc: 'uncursed',
      eroded: 0,
      eroded2: 0,
      erodeproof: false,
      greased: false,
      poisoned: false,
      mntmp: null,
      mgend: null,
      halfeaten: false,
      rechrg: 0,
      isArtifact: false,
      artifactName: null,
      name: null,
      un: null,
      color: undefined,
      contents: null,
      rejected,
      subNote: sub.note,
      rejectedNote: rejected,
      artifactNote,
      quantityNote: 'n/a (wish denied)',
      enchantmentNote: 'n/a (wish denied)',
      bucNote: 'n/a (wish denied)',
      erosionNote: 'n/a (wish denied)',
      typeSpecificNotes: [],
    };
  }

  const quantityOutcome = resolveQuantity(workingState, mode, rng);
  const enchantmentOutcome = resolveEnchantment(workingState, mode, rng, baseSpe, luck);
  const typeSpecific = resolveTypeSpecific(workingState, mode, rng, enchantmentOutcome.spe);
  const bucOutcome = resolveBuc(workingState, mode, baseBuc, luck);
  const finalState = { ...workingState, otyp: typeSpecific.otyp };
  const erosionOutcome = resolveErosion(finalState, mode, luck);

  const def = typeSpecific.otyp ? byOtyp(typeSpecific.otyp) : undefined;

  // Is_box(obj.h:338): only CHEST/LARGE_BOX get lock state; trapped also
  // applies to TIN. Precedence mirrors the real if/else-if chain in
  // objnam.c (~5349-5361): locked wins over unlocked wins over broken, and
  // a broken box forces trapped off regardless of the "trapped" keyword.
  const isBox = typeSpecific.otyp === 'CHEST' || typeSpecific.otyp === 'LARGE_BOX';
  const isTin = typeSpecific.otyp === 'TIN';
  let locked: boolean | undefined;
  let broken: boolean | undefined;
  if (isBox) {
    if (workingState.locked) {
      locked = true;
      broken = false;
    } else if (workingState.unlocked) {
      locked = false;
      broken = false;
    } else if (workingState.broken) {
      locked = false;
      broken = true;
    }
  }
  let trapped: boolean | undefined;
  if (isBox || isTin) {
    if (workingState.trapped === 2) trapped = false;
    // "trapped" is only honored in wizard mode -- readobjnam() only ever
    // sets d->trapped=1 when `wizard` is true at parse time; in normal
    // play the keyword is consumed but has no effect.
    else if (workingState.trapped === 1 && mode === 'wizard') trapped = true;
  }
  if (broken) trapped = false;

  return {
    otyp: typeSpecific.otyp,
    quan: quantityOutcome.quan,
    spe: typeSpecific.spe,
    buc: bucOutcome.buc,
    eroded: erosionOutcome.eroded,
    eroded2: erosionOutcome.eroded2,
    erodeproof: erosionOutcome.erodeproof,
    greased: workingState.isgreased,
    poisoned: workingState.ispoisoned && !!def?.poisonable && (mode === 'wizard' || luck >= 0),
    mntmp: typeSpecific.mntmp,
    mgend: workingState.mgend,
    halfeaten: workingState.halfeaten,
    rechrg: workingState.rechrg,
    isArtifact: workingState.isArtifact,
    artifactName: workingState.artifactName,
    name: workingState.name,
    un: workingState.un,
    color: def?.color,
    contents: workingState.contents,
    rejected: null,
    locked,
    broken,
    trapped,
    subNote: sub.note,
    rejectedNote: null,
    artifactNote,
    quantityNote: quantityOutcome.note,
    enchantmentNote: enchantmentOutcome.note,
    bucNote: bucOutcome.note,
    erosionNote: erosionOutcome.note,
    typeSpecificNotes: typeSpecific.notes,
  };
}

function buildFailure(input: string, steps: ParseStep[], reason: string): WishResult {
  return {
    input,
    steps,
    wizardObject: { xname: reason, fields: [] },
    normalObject: { xname: reason, fields: [] },
    failed: true,
    failureReason: reason,
  };
}

function buildTerrainResult(
  input: string,
  steps: ParseStep[],
  terrainMatch: NonNullable<ParseState['terrainMatch']>
): WishResult {
  const kindLabel = terrainMatch.kind === 'trap' ? 'trap' : 'dungeon feature';
  return {
    input,
    steps,
    wizardObject: {
      xname: `Creates ${article(terrainMatch.name)} ${terrainMatch.name} on the floor here (a ${kindLabel}, not an inventory item).`,
      fields: [
        { label: 'Kind', value: kindLabel },
        { label: 'Feature', value: terrainMatch.name },
        { label: 'Note', value: terrainMatch.note },
      ],
    },
    normalObject: {
      xname: 'Nothing fitting that description exists.',
      fields: [{ label: 'Note', value: 'Terrain/trap wishes only exist in wizard mode.' }],
    },
    failed: false,
  };
}

function buildGoldResult(input: string, steps: ParseStep[], requestedCnt: number): WishResult {
  const wizardCnt = requestedCnt;
  const normalCnt = Math.min(requestedCnt, 5000);
  return {
    input,
    steps,
    wizardObject: { xname: `${wizardCnt} gold piece${wizardCnt === 1 ? '' : 's'}`, fields: [{ label: 'Quantity', value: String(wizardCnt) }] },
    normalObject: { xname: `${normalCnt} gold piece${normalCnt === 1 ? '' : 's'}`, fields: [{ label: 'Quantity', value: String(normalCnt) }] },
    failed: false,
  };
}
