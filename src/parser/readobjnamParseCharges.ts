import type { ParseState, ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';

const SPE_LIM = 99;

export function readobjnamParseCharges(state: ParseState): { state: ParseState; step: ParseStep | null } {
  const idx = state.input.lastIndexOf('(');
  if (idx === -1) return { state, step: null };

  const before = state.input;
  const head = state.input.slice(0, idx).trimEnd();
  const tail = state.input.slice(idx + 1);
  const closeIdx = tail.indexOf(')');
  if (closeIdx === -1) {
    // Malformed parens -- drop the trailing garbage.
    const newInput = head;
    return {
      state: { ...state, input: newInput },
      step: {
        id: 'charges:malformed',
        stage: 'charges',
        title: 'Trailing charges (malformed)',
        matched: true,
        inputBefore: before,
        inputAfter: newInput,
        stateDiff: {},
        sourceRef: SOURCE_REFS.parseCharges,
        category: 'lex',
        notes: ['Unclosed parenthesis -- trailing text dropped.'],
      },
    };
  }

  const inner = tail.slice(0, closeIdx);
  const after = tail.slice(closeIdx + 1);
  const newInput = (head + after).trim();

  if (/^lit$/i.test(inner.trim())) {
    return {
      state: { ...state, input: newInput, islit: true },
      step: {
        id: 'charges:lit',
        stage: 'charges',
        title: 'Trailing "(lit)"',
        matched: true,
        inputBefore: before,
        inputAfter: newInput,
        stateDiff: { islit: true },
        sourceRef: SOURCE_REFS.parseCharges,
        category: 'lex',
      },
    };
  }

  const rechargeMatch = /^(-?\d+):(-?\d+)$/.exec(inner.trim());
  if (rechargeMatch) {
    let rechrg = parseInt(rechargeMatch[1], 10);
    let spe = parseInt(rechargeMatch[2], 10);
    let spesgn: 1 | -1 = 1;
    if (spe < 0) {
      spesgn = -1;
      spe = Math.abs(spe);
    }
    spe = Math.min(spe, SPE_LIM);
    rechrg = Math.max(0, Math.min(rechrg, 7));
    return {
      state: { ...state, input: newInput, rechrg, spe, spesgn },
      step: {
        id: 'charges:recharge-charges',
        stage: 'charges',
        title: 'Trailing "(recharges:charges)"',
        matched: true,
        inputBefore: before,
        inputAfter: newInput,
        stateDiff: { rechrg, spe, spesgn },
        sourceRef: SOURCE_REFS.parseCharges,
        category: 'lex',
        notes: ['Wand-charge notation: "wand of X (7:3)" means 7 recharges applied, 3 charges left.'],
      },
    };
  }

  const chargeMatch = /^(-?\d+)$/.exec(inner.trim());
  if (chargeMatch) {
    let spe = parseInt(chargeMatch[1], 10);
    let spesgn: 1 | -1 = 1;
    if (spe < 0) {
      spesgn = -1;
      spe = Math.abs(spe);
      spe = Math.min(spe, SPE_LIM);
    } else {
      spe = Math.min(spe, SPE_LIM);
    }
    return {
      state: { ...state, input: newInput, spe, spesgn },
      step: {
        id: 'charges:n',
        stage: 'charges',
        title: 'Trailing "(N)" charges/enchantment',
        matched: true,
        inputBefore: before,
        inputAfter: newInput,
        stateDiff: { spe, spesgn },
        sourceRef: SOURCE_REFS.parseCharges,
        category: 'lex',
        notes: ['For wands/chargeable tools this is charges; for enchantable gear it is the same field as "+N".'],
      },
    };
  }

  return { state, step: null };
}
