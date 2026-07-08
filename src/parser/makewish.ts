import type { ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { mungspaces } from './utils';

export interface MakewishResult {
  cleaned: string;
  isNothing: boolean;
  steps: ParseStep[];
}

export function makewish(rawInput: string): MakewishResult {
  const cleaned = mungspaces(rawInput);
  const steps: ParseStep[] = [
    {
      id: 'makewish:mungspaces',
      stage: 'makewish',
      title: 'Collapse whitespace',
      matched: true,
      inputBefore: rawInput,
      inputAfter: cleaned,
      stateDiff: {},
      sourceRef: SOURCE_REFS.makewish,
      category: 'lex',
    },
  ];

  const isNothing = /^(nothing|nil|none)$/i.test(cleaned);
  if (isNothing) {
    steps.push({
      id: 'makewish:nothing',
      stage: 'makewish',
      title: 'Short-circuit: "nothing" / "nil" / "none"',
      matched: true,
      inputBefore: cleaned,
      inputAfter: cleaned,
      stateDiff: {},
      sourceRef: SOURCE_REFS.makewish,
      category: 'lex',
      notes: ['Preserves the wishless conduct -- no object is created.'],
    });
  }

  return { cleaned, isNothing, steps };
}
