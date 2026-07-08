import type { ParseState, ParseStep } from './types';
import { SOURCE_REFS } from './sourceRefs';
import { findFuzzy } from './objectLookup';
import { ARTIFACTS_BY_NAME } from '../data/artifacts';
import { fuzzyEquals } from './utils';
import type { Rng } from './rng';

export function readobjnamPostparse3(input: ParseState, rng: Rng): { state: ParseState; steps: ParseStep[] } {
  let s = { ...input };
  const steps: ParseStep[] = [];

  if (s.otyp) return { state: s, steps };

  const candidates = [s.actualn, s.dn, s.un, s.origInput].filter((x): x is string => !!x && x.trim().length > 0);

  for (const candidate of candidates) {
    const result = findFuzzy(candidate, s.oclass, rng);
    if (result) {
      s = { ...s, otyp: result.obj.otyp, oclass: result.obj.class };
      steps.push({
        id: 'postparse3:main-lookup',
        stage: 'postparse3',
        title: 'Fuzzy object-name lookup',
        matched: true,
        inputBefore: candidate,
        inputAfter: result.obj.actualName,
        stateDiff: { otyp: result.obj.otyp, oclass: result.obj.class },
        sourceRef: SOURCE_REFS.postparse3MainLookup,
        category: result.candidates.length > 1 ? 'resolve-random' : 'lookup',
        notes:
          result.candidates.length > 1
            ? [
                `Ambiguous: matched ${result.candidates.length} object types (${result.candidates.map((c) => c.actualName).join(', ')}).`,
                `Resolved to "${result.obj.actualName}" via a rarity-weighted random pick.`,
              ]
            : [`Matched "${candidate}" against "${result.obj.actualName}".`],
      });
      return { state: s, steps };
    }
  }

  // Armor retry: append " mail" if oclass is armor and no match found yet.
  if (s.oclass === 'armor' && !/\bmail\b/i.test(s.input)) {
    const retryText = `${s.input.trim()} mail`;
    const result = findFuzzy(retryText, s.oclass, rng);
    if (result) {
      s = { ...s, otyp: result.obj.otyp, oclass: result.obj.class, input: retryText };
      steps.push({
        id: 'postparse3:armor-mail-retry',
        stage: 'postparse3',
        title: 'Armor retry with "mail" appended',
        matched: true,
        inputBefore: s.input,
        inputAfter: result.obj.actualName,
        stateDiff: { otyp: result.obj.otyp },
        sourceRef: SOURCE_REFS.postparse3ArmorMailRetry,
        category: 'lookup',
        notes: [`"${input.input}" didn't match directly; "${retryText}" did.`],
      });
      return { state: s, steps };
    }
  }

  // Fruit / slime mold matching -- checked last, on the untouched original string.
  {
    const fruitText = s.fruitbuf.trim().toLowerCase();
    const stripped = fruitText.replace(/^(?:an?|the)\s+/, '').replace(/^(?:blessed|uncursed|cursed)\s+/, '');
    if (/^slime moulds?$/.test(stripped) || /^slime molds?$/.test(stripped)) {
      s = { ...s, otyp: 'SLIME_MOLD', oclass: 'food', ftype: 'slime mold' };
      steps.push({
        id: 'postparse3:fruit',
        stage: 'postparse3',
        title: 'Fruit / slime mold match',
        matched: true,
        inputBefore: s.fruitbuf,
        inputAfter: 'slime mold',
        stateDiff: { otyp: 'SLIME_MOLD', oclass: 'food' },
        sourceRef: SOURCE_REFS.postparse3Fruit,
        category: 'lookup',
        notes: ['Checked last so a real object name always wins. Custom bones-file fruit names are not modeled by this tool -- only the default "slime mold" is recognized.'],
      });
      return { state: s, steps };
    }
  }

  // Artifact fuzzy match.
  if (!s.oclass) {
    for (const candidate of candidates) {
      const key = Array.from(ARTIFACTS_BY_NAME.keys()).find((name) => fuzzyEquals(name, candidate));
      if (key) {
        const artifact = ARTIFACTS_BY_NAME.get(key)!;
        s = {
          ...s,
          otyp: artifact.baseOtyp,
          isArtifact: true,
          artifactName: artifact.name,
          name: artifact.name,
        };
        steps.push({
          id: 'postparse3:artifact',
          stage: 'postparse3',
          title: 'Artifact name match',
          matched: true,
          inputBefore: candidate,
          inputAfter: artifact.name,
          stateDiff: { otyp: artifact.baseOtyp, isArtifact: true, artifactName: artifact.name },
          sourceRef: SOURCE_REFS.postparse3Artifact,
          category: 'lookup',
          notes: [
            `Alignment: ${artifact.alignment}${artifact.isQuestArtifact ? ' (quest artifact)' : ''}.`,
          ],
        });
        return { state: s, steps };
      }
    }
  }

  return { state: s, steps };
}
